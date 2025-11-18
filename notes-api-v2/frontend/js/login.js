document.getElementById("login").addEventListener("submit", async(e) => {
    e.preventDefault()
    const email = document.getElementById("email").value
    const password = document.getElementById("password").value

    try {
        const res = await fetch("http://localhost:3000/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body:JSON.stringify({
                email,
                password
            })
        })

        if(!res.ok){
            const err = await res.json();
            console.log(err.message || "login failed")
            return
        }

        const data = await res.json()

        localStorage.setItem("accessToken", data.accessToken)

        window.location.href = "note.html";
    } catch (error) {
        console.error("Login error:", error);
        console.log("Something went wrong");
    }
})