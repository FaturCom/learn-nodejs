import http from 'http';
let user = [
    {name: "fathur", age: 18}
]

const server = http.createServer( async(req,res) => {
    if(req.url == '/'){
        res.write("hello dari node js")
        return res.end()
    }

    if(req.method === 'GET' && req.url === '/user'){
        res.write(JSON.stringify(user))
        return res.end()
    }

    if (req.method === "POST" && req.url === "/user") {
        let body = "";

        req.on("data", (chunk) => {
            body += chunk.toString();
        });

        req.on("end", () => {
            const newUser = JSON.parse(body);
            user.push(newUser);
            console.log(user);

            res.writeHead(201, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ message: "berhasil menambah user" }));
        });

        return;
    }

    if(req.method === "PUT" && req.url === "/user"){
        let body = "";

        req.on("data", chunk => {
            body += chunk.toString();
        })

        req.on("end", () => {
            const updateUser = JSON.parse(body)
            const findIndex = user.findIndex(data => data.name === updateUser.name)
            user[findIndex] = updateUser
            console.log(user)

            res.writeHead(201, {"Content-Type" : "application/json"});
            res.end(JSON.stringify({message : "berhasil mengupdate user"}))
        })

        return;
    }

    if(req.method === "DELETE" && req.url === "/user"){
        let body = ""

        req.on("data", chunk => {
            body += chunk.toString()
        })

        req.on("end", () => {
            const deleteUser = JSON.parse(body)
            user = user.filter(data => data.name != deleteUser.name)
            console.log(user)

            res.writeHead(201, {"Content-Type" : "application/json"});
            res.end(JSON.stringify({message : "berhasil menghapus data"}))
        })

        return;
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
})

server.listen(3000, () => {
  console.log('Server berjalan di http://localhost:3000/');
});