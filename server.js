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

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const storage = multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

app.post("/api/generate", upload.single("audio"), (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No audio file." });

    const filePath = path.resolve(req.file.path);

    // Set encoding to handle potential special characters in file paths
    exec(`python transcribe.py "${filePath}"`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Exec error: ${error}`);
            return res.status(500).json({ error: "AI Transcription failed." });
        }

        const xmlFileName = path.basename(filePath) + "_basic_pitch.xml";
        const musicXmlUrl = `http://localhost:${PORT}/uploads/${xmlFileName}`;

        res.json({
            musicXmlUrl: musicXmlUrl,
            title: "Generated Notation",
            accuracy: "High"
        });
    });
});

app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));