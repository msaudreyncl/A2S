import express from "express";
import path from "path";
import multer from "multer";
import cors from "cors";
import { fileURLToPath } from "url";
import { exec } from "child_process";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Configure Multer for Audio Uploads
const storage = multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// THE MISSING ROUTE: /api/generate
app.post("/api/generate", upload.single("audio"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No audio file uploaded." });
    }

    const filePath = path.join(__dirname, req.file.path);

    // Call your Python script
    // We use "python" or "python3" depending on your OS
    exec(`set PYTHONIOENCODING=utf-8 && python transcribe.py "${filePath}"`, (error, stdout, stderr) => {        if (error) {
            console.error(`Exec error: ${error}`);
            return res.status(500).json({ error: "AI Transcription failed." });
        }

        // The Python script prints "Success: [path_to_xml]"
        // We need to return the URL so OSMD can load it
        const xmlFileName = path.basename(filePath) + "_basic_pitch.xml";
        const musicXmlUrl = `http://localhost:${PORT}/uploads/${xmlFileName}`;

        res.json({
            musicXmlUrl: musicXmlUrl,
            title: "Generated Notation",
            instrument: "Piano (Detected)",
            accuracy: "High"
        });
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});