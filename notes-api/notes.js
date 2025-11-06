import express from 'express'
import { MongoClient } from 'mongodb'

const app = express()
const port = 3000
app.use(express.json())

const mongoUrl = "mongodb://localhost:27017";
const client = new MongoClient(mongoUrl)
await client.connect()
const db = client.db("mydatabase");
const notes = db.collection("notes");

await client.close()

app.get('/', (req, res) => {
    res.send("welcome to notes api")
})

app.get('/notes', async(req, res, next) => {
    try {
        const allNotes = await notes.find({}).toArray();
        res.json(allNotes)
    } catch (err) {
        next(err)
    }
})

app.post('/notes', async(req, res, next) => {
    try {
        const newNotes = req.body
        const allowedFields = ['title', 'content'];
        const newNotesFields = Object.keys(newNotes)
        const invalidFields = newNotesFields.filter(f => !allowedFields.includes(f))

        if(invalidFields.length > 0) return res.status(400).json({error: 'bad request', message: `invalid field: ${invalidFields.join(', ')}`})
        for(const f of allowedFields) if(!newNotesFields.includes(f)) return res.status(400).json({error: 'bad request', message: `missing field: ${f}`})
        
        newNotes.id = new Date().getTime()
        console.log(newNotes)
        await notes.insertOne(newNotes)
        res.status(201).json({message: "notes created successfully"})

    } catch (err) {
        next(err)
    }
})

app.put('/notes/:id', async(req, res, next) => {
    try {
        const id = Number(req.params.id)
        const updateNotes = req.body
        const allowedFields = ['title', 'content'];
        const updateNotesFields = Object.keys(updateNotes)
        const invalidFields = updateNotesFields.filter(f => !allowedFields.includes(f))
        const findNote = await notes.findOne({id})
        
        if(!findNote) return res.status(404).json({error: 'not found', message: 'notes not found'})
        if(invalidFields.length > 0) return res.status(400).json({error: 'bad request', message: `invalid field: ${invalidFields.join(', ')}`})
        for(const f of allowedFields) if(!updateNotesFields.includes(f)) return res.status(400).json({error: 'bad request', message: `missing field: ${f}`})
            
        await notes.updateOne({id}, {$set: updateNotes})
        res.json({message: "notes update successfully"})

    } catch (err) {
        next(err)
    }
})

app.delete('/notes/:id', async(req, res, next) => {
    try {
        const id = Number(req.params.id)
        const findNote = await notes.findOne({id})
        
        if(!findNote) return res.status(404).json({error: 'not found', message: 'notes not found'})

        await notes.deleteOne({id})
        res.status(204).send()
        
    } catch (err) {
        next(err)
    }
})

app.use((req, res) => {
    res.status(404).json({error: 'not found', message: 'endpoint not found'})
})

app.use((err, req, res, next) => {
    console.log(err)
    res.status(500).json({message: 'internal server error'})
})

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)
})