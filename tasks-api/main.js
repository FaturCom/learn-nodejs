import express from 'express';
import { MongoClient } from 'mongodb';
import userRoutes from './services/user.js'
import taskRoutes from './services/task.js'

const app = express();
const port = 3000;
app.use(express.json());

const mongoUrl = "mongodb://localhost:27017";
const client = new MongoClient(mongoUrl);
await client.connect();
const db = client.db("mydatabase");

app.get('/', (req, res) => {
    res.json({message: "welcome to task-user api"})
})
app.use('/user', userRoutes(db))
app.use('/task', taskRoutes(db))
app.use((req, res) => res.status(404).json({ error: 'not found', message: 'endpoint not found' }))

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
})