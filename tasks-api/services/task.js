import express from 'express'

export default function taskRoutes(db){
    const router = express.Router();
    const users = db.collection("users");
    const tasks = db.collection("tasks");
    
    router.get("/:name", async(req, res) => {
        const name = req.params.name
        const findUser = await users.findOne({name})
    
        if(!findUser)return res.status(404).json({error: "not found", message: "user not found"})
        
        const result = await tasks.find({userId: name}).toArray()
        res.json(result)
    })
    
    router.post("/", async(req, res) => {
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
    
    router.put("/:userId/:id", async(req, res) => {
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
    
    router.delete("/:userId/:id", async(req, res) => {
        const id = new Date(req.params.id)
        const userId = req.params.userId
        const findUser = await users.findOne({name: userId})
        const findTask =  await tasks.findOne({userId, id})
        
        if(!findUser) return res.status(404).json({error: "not found", message: "user not found"})
        if(!findTask) return res.status(404).json({error: "not found", message: "task not found"})
    
        await tasks.deleteOne({userId, id})
        res.json({message: "delete task successfully"})
    })

    return router
}