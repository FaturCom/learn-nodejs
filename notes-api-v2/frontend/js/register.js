document.getElementById("register").addEventListener("submit", async(e) => {
    e.preventDefault()
    
    const username = document.getElementById("username").value
    const email = document.getElementById("email").value
    const password = document.getElementById("password").value
    const confirmPassword = document.getElementById("confirmPassword").value

    try {
        const res = await fetch("http://localhost:3000/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
                username,
                email,
                password,
                confirmPassword
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