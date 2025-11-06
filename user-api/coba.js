import express from 'express'

const app = express();
const port = 3000

app.use(express.json())

app.use((req, res, next) => {
    console.log("this is first")
    next()
})

app.use((req, res, next) => {
    console.log("this is second")
    next()
})

app.get('/', (req, res) => {
    res.send("root endpoint")
    res.end()
})

app.use((req, res, next) => {
    console.log("this is third")
    next()
})

app.use('/user', (req, res, next) => {
    res.send("user middleware")
    console.log("user middleware")
})

app.get('/user', (req, res) => {
    res.send("user endpoint")
})

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)
})