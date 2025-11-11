import express from 'express'
import {MongoClient} from 'mongodb'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import util from 'util'
import dotenv from 'dotenv'

dotenv.config()

const app = express();
const port = process.env.PORT;
app.use(express.json());

const url = process.env.MONGO_URL;
const client = new MongoClient(url)
await client.connect()
const db = client.db('authdb')
const users = db.collection('users')

const SALT_ROUNDS = 10
const SECRET_KEY = process.env.JWT_SECRET

async function verifyToken(req, res, next){
    try{
        const token = req.headers.authorization?.split(" ")[1]

        if(!token) return res.status(401).json({ message: "Missing token" })
        
        const verfyAsync = util.promisify(jwt.verify)
        const decode = await verfyAsync(token, SECRET_KEY)

        req.user = decode
        next()
    }catch(err){
        return res.status(403).json({ message: "Invalid token" })
    }
}

function isAdmin(req, res, next){
    if(req.user.role !== "admin"){
        return res.status(403).json({ message: "Forbidden. Admin only." });
    }

    next();
}

app.get('/', (req, res) => {
    res.send("welcome to auth api and JWT")
})

app.get('/users', async(req, res, next) => {
    try {
        const allUser = await users.find({role: "user"}).toArray()
        res.json(allUser)
    } catch (err) {
        next(err)
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
            {username: user.username, role: user.role},
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
        await users.insertOne({username: userRegist.username, password: passwordHash, role: "user"})
        res.status(201).json({message: "user created successfully"})
        
    } catch (err) {
        next(err)
    }
})

app.delete('/user/:username',verifyToken, isAdmin, async(req, res, next) => {
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