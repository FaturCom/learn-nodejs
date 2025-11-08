import express from 'express'
import {MongoClient} from 'mongodb'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const app = express();
const port = 3000;
app.use(express.json());

const url = "mongodb://localhost:27017";
const client = new MongoClient(url)
await client.connect()
const db = client.db('authdb')
const users = db.collection('users')

const SALT_ROUNDS = 10
const SECRET_KEY = "MY_SECRET_123"

app.get('/', (req, res) => {
    res.send("welcome to auth api and JWT")
})

app.get('/users', async(req, res, next) => {
    try {
        const allUser = await users.find({}).toArray()
        res.json(allUser)
    } catch (err) {
        next(err)
    }
})

app.get('/profile', async(req, res, next) => {
    const authHeader = req.headers.authorization
    if(!authHeader) return res.status(401).json({error: "missing token"})
    
    const token = authHeader.split(" ")[1]

    try {
        const user = jwt.verify(token, SECRET_KEY)
        return res.json({message: "this is your profile", user})
    } catch (err) {
        return res.status(401).json({error: "invalid token"})
    }
})

app.post('/login', async(req, res, next) => {
    try {
        const userLogin = req.body
        const allowedFields = ["username", "password"]
        const userLoginFields = Object.keys(userLogin)
        const invalidFields = userLoginFields.filter(f => !allowedFields.includes(f))
        const user = await users.findOne({username: userLogin.username})

        if(invalidFields.length > 0) return res.status(400).json({error: "bad request", message: `invalid field: ${invalidFields.join(', ')}`})
        for(const f of allowedFields) if(!userLoginFields.includes(f)) return res.status(400).json({error: "bad request", message: `missing field: ${f}`})
        if(userLogin.username === "" || userLogin.password === "") return res.status(400).json({error: "bad request", message: "username or password cannot be empty"})
        if(!user) return res.status(404).json({error: "not found", message: "user not found"})
        
        const valid = await bcrypt.compare(userLogin.password, user.password)
        if(!valid) return res.status(401).json({error: "unauthorized", message: "wrong password"})
        const token = jwt.sign(
            {username: user.username},
            SECRET_KEY,
            {expiresIn: "1h"}
        )
        res.json({message: "login success", token})

    } catch (err) {
        next(err)
    }
})

app.post('/register', async(req, res, next) => {
    try {
        const userRegist = req.body
        const allowedFields = ["username", "password", "confirmPassword"]
        const userLoginFields = Object.keys(userRegist)
        const invalidFields = userLoginFields.filter(f => !allowedFields.includes(f))
        const exiting = await users.findOne({username: userRegist.username})

        if(invalidFields.length > 0) return res.status(400).json({error: "bad request", message: `invalid field: ${invalidFields.join(', ')}`})
        for(const f of allowedFields) if(!userLoginFields.includes(f)) return res.status(400).json({error: "bad request", message: `missing field: ${f}`})
        if(userRegist.username === "" || userRegist.password === "" || userRegist.confirmPassword === "") return res.status(400).json({error: "bad request", message: "fields cannot be empty"})
        if(exiting) return res.status(409).json({error: "conflict", message: "username already registered"})
        if(userRegist.password !== userRegist.confirmPassword) return res.status(400).json({error: "bad request", message: "password and confirm password do not match"})
        
        const passwordHash = await bcrypt.hash(userRegist.password, SALT_ROUNDS)
        await users.insertOne({username: userRegist.username, password: passwordHash})
        res.status(201).json({message: "user created successfully"})
        
    } catch (err) {
        next(err)
    }
})

app.delete('/user/:username', async(req, res, next) => {
    try {
        const username = req.params.username
        const findUser = await users.findOne({username})

        if(!findUser) return res.status(404).json({error: "not found", message: "user not found"})
        await users.deleteOne({username})
        res.status(204).send()
    } catch (err) {
        next(err)
    }
})

app.use((req, res) => {
    res.status(404).send("endpoint not found")
})

app.use((err, req, res, next) => {
    console.log(err)
    res.status(500).send("internal server error")
})

app.listen(port, () => {
    console.log("server running...")
})