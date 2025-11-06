import express from 'express';
import { MongoClient } from 'mongodb';

const app = express();
const port = 3000;
app.use(express.json());
const mongoUrl = "mongodb://localhost:27017";
const client = new MongoClient(mongoUrl);
await client.connect();
const db = client.db("mydatabase");
const users = db.collection("users");

app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the User API'});
})

app.get('/users', async(req, res) => {
    const {age,role, ...rest} =req.query;

    if(Object.keys(rest).length > 0) return res.status(400).json({error: "bad request", message: "only 'age, role' query parameter is allowed"});

    if(age && role){
        const filteredUsers = await users.find({age: Number(age), role}).toArray();
        res.json(filteredUsers);
    }else if(age || role){
        const filter = age ? {age: Number(age)} : {role};
        const filteredUsers = await users.find(filter).toArray();
        res.json(filteredUsers);
    }else{
        const allUsers = await users.find().toArray();
        res.json(allUsers);
    }
})

app.get('/users/:name', async(req, res) => {
    const name = req.params.name;
    const findUser = await users.findOne({name});
    if(!findUser) return res.status(404).json({error: "not found", message: "user not found"});
    res.json(findUser);
})

app.post('/users', async(req, res) => {
    const newUser = req.body;
    const allowedFields = ['name', 'age', 'role'];
    const newUserFields = Object.keys(newUser);
    const invalidFields = newUserFields.filter(field => !allowedFields.includes(field));

    if(invalidFields.length > 0) return res.status(400).json({error: "bad request", message: `invalid fields: ${invalidFields.join(', ')}`});

    for(const field of allowedFields) if(!newUserFields.includes(field)) return res.status(400).json({error: "bad request", message: `missing field: ${field}`});

    if(typeof newUser.name !== "string" || typeof newUser.role !== "string" || typeof newUser.age !== "number" ) return res.status(400).json({error: "bad request", message: "Wrong data type for one or more fields"})    
        
    const findUser = await users.findOne({name: newUser.name});
    if(findUser) return res.status(409).json({error: "user exists", message: "a user with this name already exists"});
    await users.insertOne(newUser);
    const result = await users.findOne({name: newUser.name});
    res.status(201).json({message: "user created successfully", user: result});
})
    
app.put('/users/:name', async(req, res) => {
    const userName = req.params.name;
    const updateData = req.body;
    const allowedFields = ['name', 'age', 'role'];
    const updateFields = Object.keys(updateData);
    const invalidFields = updateFields.filter(field => !allowedFields.includes(field));
        
    if(invalidFields.length > 0) return res.status(400).json({error: "bad request", message: `invalid fields: ${invalidFields.join(', ')}`});
        
    for(const field of updateFields) if(!allowedFields.includes(field)) return res.status(400).json({error: "bad request", message: `missing field: ${field}`});
        
    if(typeof updateData.name !== "string" || typeof updateData.role !== "string" || typeof updateData.age !== "number" )res.status(400).json({error: "bad request", message: "Wrong data type for one or more fields"})
        
    const findUser = await users.findOne({name: userName})
    if(!findUser) return res.status(404).json({error: "not found", message: "user not found"});
    await users.updateOne({name: userName}, {$set: updateData});
    const result = await users.findOne({name: userName});
    res.json({message: "user updated successfully", user: result});
})

app.delete('/users/:name', async(req, res) => {
    const name = req.params.name
    const findUser = await users.findOne({name})
    if(!findUser) return res.status(404).json({error: "not found", message: "user not found"})
    await users.deleteOne({name})
    res.json({message: "delete user successfully"})
})

app.use((req, res) => res.status(404).json({ error: 'not found', message: 'endpoint not found' }));

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
})