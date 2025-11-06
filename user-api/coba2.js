import express from 'express'

const app = express()
const port = 3000

app.get('/:name', (req, res) => {
    res.send(`hello ${req.params.name}`)
})

app.get('/admin/dashboard', (req, res) => {
    res.send('admin page, only admin to accsess')
})

app.use((req, res) => res.status(404).send("endpoint not found"))

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)
})