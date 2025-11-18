import express from "express"
import { createNote, updateNote, getNotes, deleteNote } from "../controllers/note.controller.js"
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get('/', authMiddleware, getNotes)
router.post('/', authMiddleware, createNote)
router.put('/:id', authMiddleware, updateNote)
router.delete('/:id', authMiddleware, deleteNote)

export default router;