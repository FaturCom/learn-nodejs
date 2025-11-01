import {MongoClient} from 'mongodb';

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

try{
    await client.connect();
    console.log('Connected to MongoDB');
    const database = client.db('testdb');
    const collection = database.collection('testcollection');

    const findUser = await collection.findOne({name:"Fina"});
    if(!findUser){
        await collection.insertOne({name:"Fina", age:30});
    }
    const userArr = await collection.find().toArray();
    console.log('All users:', userArr);
    collection.updateOne({name: "Fina"}, {$set: {name: "Aluca", age:50}});
    const updatedUserArr = await collection.find().toArray();
    console.log('Updated users:', updatedUserArr);
    await collection.deleteOne({name: "Aluca"});
    const finalUserArr = await collection.find().toArray();
    console.log('Final users:', finalUserArr);

}catch(e){
    console.error(e);
}finally{
    await client.close();
}

