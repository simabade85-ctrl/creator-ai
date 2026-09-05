import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

app.post("/api/chat", async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({
                error: "Message is required"
            });
        }

        const response = await ai.models.generateContent({
            model: "gemini-3.6-flash",
            contents: message
        });

        const text = response.text;

        res.json({
            text: text
        });

    } catch (error) {
        console.error("Gemini Error:", error);

        res.status(500).json({
            error: error.message || "AI generation failed"
        });
    }
});

app.get("/", (req, res) => {
    res.send("Creator AI Backend is running 🚀");
});

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});