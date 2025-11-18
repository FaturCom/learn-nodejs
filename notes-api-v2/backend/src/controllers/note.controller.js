import jwt from "jsonwebtoken";
import Note from "../models/note.model.js";

export async function createNote(req, res) {
    try {
        const userId = req.userId
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        const {title, content} = req.body;

        const note = await Note.create({
            userId,
            title,
            content
        });

        res.status(201).json({
            message: "Note created successfully",
            note
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function updateNote(req, res) {
    try {
        const userId = req.userId
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        const id = req.params.id;
        const {title, content} = req.body;

        const note = await Note.findOne({_id: id, userId})

        if(!note) return res.status(404).json({ message: "Note not found" });

        note.title = title
        note.content = content

        await note.save()

        res.json({ message: "Note updated successfully", note });
    } catch (error) {
        res.status(500).json({error: error.message})
    }
}

export async function getNotes(req, res) {
    try {
        const userId = req.userId
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        const notes = await Note.find({userId})

        res.json(notes)
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function deleteNote(req, res) {
    try {
        const userId = req.userId
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        const {id} = req.params;
        
        const note = await Note.findOneAndDelete({_id: id, userId})
        if (!note) return res.status(404).json({ message: "Note not found" });

        res.json({ message: "Note deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}