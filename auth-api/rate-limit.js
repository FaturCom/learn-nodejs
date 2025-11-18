import express from 'express'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import cors from 'cors'

dotenv.config()

const app = express()
const port = process.env.PORT

const limiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 5,
    message: "Too many requests, please try again later",
    standardHeaders: true,
    legacyHeaders: false
})

const whitelist = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://myfrontend.com",
  "http://localhost:5500"
];

app.use(cors({
    origin: function(origin, callback){
        if(!origin) return callback(null, true);
        if (whitelist.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"), false);
        }
    }
}))

app.get('/', limiter, (req, res, next) => {
    try {
        res.send("Hello! You are under rate limit protection 🚀")
    } catch (error) {
        next(error)
    }
})

app.get('/hello', (req, res) => {
    res.json({ message: "Hello from backend!" });
})

app.use((req, res, next) => {
    res.status(404).send("endpoint not found")
})

app.use((err, req, res, next) => {
    console.log(err)
    res.status(500).send("internal server error")
})

app.listen(port, () => {
    console.log("rate limit server running...")
})