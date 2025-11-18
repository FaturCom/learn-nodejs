let setId = ""
let editMode = false

// basic HTML escape to avoid inserting raw markup from note content/title
function escapeHtml(str){
        if(!str && str !== 0) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
}

async function checkAuth() {
    const accessToken = localStorage.getItem("accessToken");

    if (accessToken) {
        const ok = await loadNotes(accessToken);
        if (ok) return;

        const newToken = await tryRefresh();
        if (newToken) {
            localStorage.setItem("accessToken", newToken);
            await loadNotes(newToken);
            return;
        }
    }

    window.location.href = "login.html";
}

checkAuth();

async function tryRefresh() {
    try {
        const res = await fetch("http://localhost:3000/auth/refresh", {
            method: "GET",
            credentials: "include" 
        });

        if (!res.ok) return null;

        const data = await res.json();
        return data.accessToken;

    } catch (e) {
        console.log("Refresh error:", e);
        return null;
    }
}

async function loadNotes(token) {
    try {
        const res = await fetch("http://localhost:3000/notes", {
            headers: { "Authorization": "Bearer " + token }
        });

        if (res.status === 403 || res.status === 401) {
            return false;
        }

        const notes = await res.json();
        displayNotes(notes);
        return true;

    } catch (e) {
        console.log("Load notes error:", e);
        return false;
    }
}

function displayNotes(notes) {
    const list = document.getElementById("notesList");
    list.innerHTML = "";

    notes.forEach(note => {
        const div = document.createElement("div");
        div.classList.add("note-card");

        div.innerHTML = `
            <h3>${escapeHtml(note.title)}</h3>
            <p>${escapeHtml(note.content)}</p>
            <div class="note-actions">
              <button class="btn-sm btn-delete" onclick="deleteNote('${note._id}')">Delete</button>
              <button class="btn-sm btn-edit" onclick="startEdit('${note._id}', this)">Edit</button>
            </div>
        `;

        list.appendChild(div);
    });
}

document.getElementById("createNoteForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = document.getElementById("title").value;
    const content = document.getElementById("content").value;
    const token = localStorage.getItem("accessToken");

    // ==========================
    // EDIT MODE
    // ==========================
    if (editMode) {
        const res = await fetch(`http://localhost:3000/notes/${setId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify({ title, content })
        });

        if (!res.ok) {
            console.log("Failed to update note");
            return;
        }

        resetForm();
        loadNotes(token);
        return;
    }


    // ==========================
    // NORMAL ADD MODE
    // ==========================
    const res = await fetch("http://localhost:3000/notes", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        },
        body: JSON.stringify({ title, content })
    });

    resetForm();
    loadNotes(token);
});

document.getElementById("cancelBtn").addEventListener("click", resetForm);

function resetForm() {
    editMode = false;
    setId = ""
    document.getElementById("title").value = "";
    document.getElementById("content").value = "";
    document.getElementById("submitBtn").textContent = "Add Note";
    document.getElementById("cancelBtn").style.display = "none";
}


function startEdit(id, btn) {
    setId = id;
    editMode = true
    // Find the note card element (support new structure where buttons live inside .note-actions)
    const div = btn.closest('.note-card') || btn.closest("div");
    if(!div) return;

    const titleEl = div.querySelector("h3");
    const contentEl = div.querySelector("p");
    const title = titleEl ? titleEl.innerText : '';
    const content = contentEl ? contentEl.innerText : '';
    
    // Put note data into form
    document.getElementById("title").value = title;
    document.getElementById("content").value = content;

    // Change button text
    document.getElementById("submitBtn").textContent = "Edit Note";

    // Show cancel button
    document.getElementById("cancelBtn").style.display = "inline-block";
}


async function deleteNote(id) {
    const token = localStorage.getItem("accessToken");

    try {
        const res = await fetch(`http://localhost:3000/notes/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        if (res.status === 403 || res.status === 401) {
            const newToken = await tryRefresh();
            if (!newToken) return (window.location.href = "login.html");
            localStorage.setItem("accessToken", newToken);
            return;
        }

        loadNotes(token);

    } catch (e) {
        console.log("Delete error:", e);
    }
}

document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("accessToken");

    fetch("http://localhost:3000/auth/logout", {
        method: "POST",
        credentials: "include"
    });

    window.location.href = "login.html";
});