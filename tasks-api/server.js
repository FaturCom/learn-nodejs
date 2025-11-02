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
const tasks = db.collection("tasks");

app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the tasks API'});
})

app.get("/tasks/:name", async(req, res) => {
    const name = req.params.name
    const findUser = await users.findOne({name})

    if(!findUser)return res.status(404).json({error: "not found", message: "user not found"})
    
    const result = await tasks.find({userId: name}).toArray()
    res.json(result)
})

app.post("/tasks", async(req, res) => {
    const newTask = req.body
    const allowedFields = ["userId", "task"]
    const newTaskFields = Object.keys(newTask)
    const invalidFields = newTaskFields.filter(f => !allowedFields.includes(f))
    const findUser = await users.findOne({name: newTask.userId})

    if(!findUser) return res.status(404).json({error: "not found", message: "user not found"})

    if(invalidFields.length > 0) return res.status(400).json({error: "bad request", message: `invalid fields: ${invalidFields.join(', ')}`});

    for(const f of allowedFields) if(!newTaskFields.includes(f)) return res.status(400).json({error: "bad request", message: `missing field: ${f}`});

    const idTasks = new Date()
    newTask.id = idTasks
    await tasks.insertOne(newTask)
    res.status(201).json({message: "task created successfully"})

})

app.put("/tasks/:userId/:id", async(req, res) => {
    const newData = req.body
    const id = new Date(req.params.id)
    const userId = req.params.userId
    const allowedFields = ["task"]
    const newDataFields = Object.keys(newData)
    const invalidFields = newDataFields.filter(f => !allowedFields.includes(f))
    const findUser = await users.findOne({name: userId})
    const findTask =  await tasks.findOne({userId, id})
    
    if(!findUser) return res.status(404).json({error: "not found", message: "user not found"})

    if(!findTask) return res.status(404).json({error: "not found", message: "task not found"})

    if(invalidFields.length > 0) return res.status(400).json({error: "bad request", message: `invalid fields: ${invalidFields.join(', ')}`});

    for(const f of allowedFields) if(!newDataFields.includes(f)) return res.status(400).json({error: "bad request", message: `missing field: ${f}`});

    await tasks.updateOne({userId, id}, {$set: {task: newData.task}})
    res.json({message: "update task successfully"})
})

app.delete("/tasks/:userId/:id", async(req, res) => {
    const id = new Date(req.params.id)
    const userId = req.params.userId
    const findUser = await users.findOne({name: userId})
    const findTask =  await tasks.findOne({userId, id})
    
    if(!findUser) return res.status(404).json({error: "not found", message: "user not found"})

    if(!findTask) return res.status(404).json({error: "not found", message: "task not found"})

    await tasks.deleteOne({userId, id})
    res.json({message: "delete task successfully"})
})

app.use((req, res) => res.status(404).json({ error: 'not found', message: 'endpoint not found' }))

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
})