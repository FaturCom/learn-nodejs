import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";

import authRoutes from "./routes/auth.routes.js";
import notesRoutes from "./routes/note.routes.js";

dotenv.config()

const app = express()
const port = process.env.PORT

app.use(express.json())
app.use(cookieParser())

app.use(cors({
    origin: ["http://localhost:5500", "http://127.0.0.1:5500"],
    credentials: true
}))

const loginLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    message: "Too many login attempts",
    standardHeaders: true,
    legacyHeaders: false
})

app.use("/auth/login", loginLimiter);  
app.use("/auth", authRoutes);
app.use("/notes", notesRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);
  res.status(500).json({ error: err.message });
});

connectDB()
.then(() => {
    app.listen(port, () =>
      console.log(`🚀 Server running on http://localhost:${port}`)
    );
})
.catch((err) => {
    console.error("❌ Failed to start server:", err.message);
    process.exit(1);
})