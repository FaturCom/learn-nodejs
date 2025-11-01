import http from 'http';
import { URL } from 'url';
import { MongoClient } from 'mongodb';

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

async function connectToDB(){
    await client.connect();
    const database = client.db('testdb');
    const collection = database.collection('testcollection');
    return collection;
}

const server = http.createServer( async(req, res) => {
    const reqUrl = new URL(req.url, `http://${req.headers.host}`);
    const userData = await connectToDB();
    
    if(reqUrl.pathname === '/'){
        const findAllUsers = await userData.find().toArray();
        console.log(findAllUsers)
        res.write('mini rest api part 2');
        res.end();
    }else if(reqUrl.pathname === '/user' && req.method === 'GET'){
        const name = reqUrl.searchParams.get('name');
        const allUsers = await userData.find().toArray();
        res.setHeader('Content-Type', 'application/json');
        if(name){
            const findUser = await userData.findOne({name})
            if(findUser){
                res.write(JSON.stringify(findUser));
            }else{
                res.writeHead(404);
                res.write('user not found');
            }
        }else{
            res.write(JSON.stringify(allUsers));
            console.log(allUsers);
        }
        
        res.end();
    }else if(reqUrl.pathname === '/user' && req.method === 'POST'){
        let body = '';
        req.on('data', data=> {
            body += data;
        })

        req.on('end', async() => {
            const data = JSON.parse(body);
            const findUser = await userData.findOne({name: data.name});
            if(findUser){
                res.writeHead(400);
                res.write('user already exists');
            }else{
                await userData.insertOne(data);
                res.setHeader('Content-Type', 'application/json');
                res.write(JSON.stringify({message: 'user added successfully'}));
            }

            res.end();
        })
    }else if(reqUrl.pathname === '/user' && req.method === 'PUT'){
        let body = '';
        req.on('data', data => {
            body += data;
        })

        req.on('end', async() => {
            const data = JSON.parse(body);
            const findUser = await userData.findOne({name: data.name});
            if(findUser){
                await userData.updateOne({name: data.name}, {$set: {name: data.newName, age: data.age}});
                res.setHeader('Content-Type', 'application/json');
                res.write(JSON.stringify({message: 'user updated successfully'}));
            }else{
                res.writeHead(404);
                res.write('user not found');
            }

            res.end();
        })
    }else if(reqUrl.pathname === '/user' && req.method === 'DELETE'){
        const name = reqUrl.searchParams.get('name');
        const findUser = await userData.findOne({name});
        if(findUser){
            await userData.deleteOne({name})
            res.setHeader('Content-Type', 'application/json');
            res.write(JSON.stringify({message:'user deleted successfully'}));
        }else{
            res.writeHead(404);
            res.write('user not found');
        }

        res.end();
    }else{
        res.writeHead(404);
        res.write('not found');
        res.end();
    }
})

server.listen(3000, () => {
  console.log('Server berjalan di http://localhost:3000/');
});