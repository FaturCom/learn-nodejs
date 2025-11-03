import express from 'express'

export default function userRoutes(db){
    const router = express.Router();
    const users = db.collection("users")
    const tasks = db.collection("tasks")

    router.get('/', async(req, res) => {
        const {name, ...rest} = req.query

        if(Object.keys(rest).length > 0) return res.status(400).json({error: "bad request", message : "invalid keys"})
        
        if(name){
            const findUser = await users.findOne({name})
            if(!findUser) return res.status(404).json({error: "not found", message: "user not found"})
            res.json(findUser)
        }else{
            const allUser = await users.find({}).toArray();
            res.json(allUser)
        }
    })

    router.post('/', async(req, res) => {
        const newUser = req.body
        const allowedFields = ["name", "age", "role"]
        const newUserFields = Object.keys(newUser)
        const invalidFields = newUserFields.filter(field => !allowedFields.includes(field))

        if(invalidFields.length > 0) return res.status(400).json({error: "bad request", message: `invalid fields: ${invalidFields.join(', ')}`})
        for(const field of allowedFields) if(!newUserFields.includes(field)) return res.status(400).json({error: "bad request", message: `missing field: ${field}`})
        
        const findUser = await users.findOne({name: newUser.name})
        if(findUser) return res.status(400).json({error: "bad request", message: "user already exist"})
        await users.insertOne(newUser)
        res.status(201).json({message: "user created successfully"})
    })

    router.put('/:name', async(req, res) => {
        const updateUser = req.body
        const name = req.params.name
        const allowedFields = ["name", "age", "role"]
        const updateUserFields = Object.keys(updateUser)
        const invalidFields = updateUserFields.filter(field => !allowedFields.includes(field))

        if(invalidFields.length > 0) return res.status(400).json({error: "bad request", message: `invalid fields: ${invalidFields.join(', ')}`})
        for(const field of allowedFields) if(!updateUserFields.includes(field)) return res.status(400).json({error: "bad request", message: `missing field: ${field}`})
        
        const findUser = await users.findOne({name})
        if(!findUser) return res.status(404).json({error: "not found", message: "user not found"})
        await users.updateOne({name}, {$set: updateUser})
        await tasks.updateMany({userId: name}, {$set: {userId: updateUser.name}})
        res.json({message: "user update successfully"})
    })

    router.delete('/:name', async(req, res) => {
        const name = req.params.name
        const findUser = await users.findOne({name})

        if(!findUser) return res.status(404).json({error: "not found", message: "user not found"})
        await users.deleteOne({name})
        await tasks.deleteMany({userId: name})
        res.json({message: "user delete successfully"})
    })

    return router
}