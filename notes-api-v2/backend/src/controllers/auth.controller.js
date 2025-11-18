import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export async function registerUser(req, res){
    try {
        const {username, email, password, confirmPassword} = req.body;

        const existingUser = await User.findOne({email});
        if(existingUser) return res.status(400).json({ message: "Email already registered" })
        if(password !== confirmPassword) return res.status(400).json({message: "Password & confirm password must be the same"})
        
        const hashedPassword = await bcrypt.hash(password, 10)
        const user = await User.create({
            username,
            email,
            password: hashedPassword
        })

        const accessToken = jwt.sign(
            {id: user._id},
            process.env.ACCESS_KEY,
            { expiresIn: "1h" }
        )

        const refreshToken = jwt.sign(
            {id: user._id},
            process.env.REFRESH_KEY,
            { expiresIn: "7d" }
        )

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        res.status(201).json({
            message: "User registered successfully",
            accessToken
        })
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function loginUser(req, res) {
    try {
        const {email, password} = req.body

        const user = await User.findOne({email})
        if(!user) return res.status(404).json({ message: "User not found" });

        const match = await bcrypt.compare(password, user.password)
        if(!match) return res.status(400).json({ message: "Wrong password" });

        const accessToken = jwt.sign(
            {id: user._id},
            process.env.ACCESS_KEY,
            { expiresIn: "1h" }
        )

        const refreshToken = jwt.sign(
            {id: user._id},
            process.env.REFRESH_KEY,
            { expiresIn: "7d" }
        )

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        res.json({
            message: "Login successful",
            accessToken
        })

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function logoutUser(req, res) {
    try {
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: false,
            sameSite: "strict"
        })

        return res.json({ message: "Logged out successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function refreshAccessToken(req, res) {
    try {
        const token = req.cookies.refreshToken;
        if(!token) return res.status(401).json({ message: "Refresh token missing" });

        jwt.verify(token, process.env.REFRESH_KEY, (err, decode) => {
            if (err) return res.status(403).json({ message: "Invalid refresh token" });

            const newAccessToken = jwt.sign(
                {id: decode.id},
                process.env.ACCESS_KEY,
                { expiresIn: "1h" }
            );

            res.json({message: "New access token created", accessToken: newAccessToken})
        })
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}