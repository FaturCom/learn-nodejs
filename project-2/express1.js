import express from "express";
import {MongoClient} from "mongodb";

const app = express();
const port = 3000;

app.use(express.json())
const mongoUrl = "mongodb://localhost:27017";
const client = new MongoClient(mongoUrl);
await client.connect();
const db = client.db("mydatabase");
const users = db.collection("users");

app.get('/', (req, res) => {
    res.json({message: "hello from express js"})
})

app.get('/users', async(req, res) => {
    const {name, ...rest} = req.query;

    if(Object.keys(rest).length > 0){
        console.log(rest)
        return res.status(400).json({error: "bad request", message: "only 'user' query parameter is allowed"})
    }

    if(name){
        const findUser = await users.findOne({name})
        if(findUser) res.json(findUser)
        else res.status(404).json({error: "not found", message: "user not found"})
    }else{
        const allUsers = await users.find().toArray();
        res.json(allUsers)
    }
})

app.post('/users', async(req, res) => {
    const newUser = req.body;
    const findUser = await users.findOne({name: newUser.name})
    if(findUser) res.status(400).json({error: "user exists", message: "a user with this name already exists"})
    else{
        await users.insertOne(newUser);
        const result = await users.findOne({name: newUser.name})
        res.status(201).json(result);
    }
})

app.put('/users/:name', async(req, res) => {
    const userName = req.params.name;
    const updateData = req.body;
    const findUser = await users.findOne({name: userName})
    if(!findUser) res.status(404).json({error: "not found", message: "user not found"})
        else{
    await users.updateOne({name: userName}, {$set: updateData});
    const updatedUser = await users.findOne({name: updateData.name})
    res.json({message:"user update succesfully" , result: updatedUser});
}
})

app.delete('/users/:name', async(req, res) => {
    const userName = req.params.name;
    const findUser = await users.findOne({name: userName})
    if(!findUser) res.status(404).json({error: "not found", message: "user not found"})
    else{
        await users.deleteOne({name: userName});
        res.json({message: "user deleted successfully"});
    }
})

app.use((req, res) => {
    res.status(404).json({error: "not found", message: "the requested resource was not found"})
})

app.listen(port, () => {
    console.log(`Express app listening on http://localhost:${port}`);
})