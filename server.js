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
// Use Render's port if available, otherwise 3000
const PORT = process.env.PORT || 3000;

// 1. Ensure uploads directory exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(uploadDir));

// Configure Multer for Audio Uploads
const storage = multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// API Route for Generation
app.post("/api/generate", upload.single("audio"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No audio file uploaded." });
    }

    const filePath = path.join(__dirname, req.file.path);
    
    /**
     * CROSS-PLATFORM COMMAND:
     * On Windows: set PYTHONIOENCODING=utf-8 && python ...
     * On Linux (Render): export PYTHONIOENCODING=utf8 && python3 ...
     * We use a version that works on Render's Linux environment.
     */
    const command = `export PYTHONIOENCODING=utf8 && python3 transcribe.py "${filePath}"`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Exec error: ${error}`);
            console.error(`Stderr: ${stderr}`);
            return res.status(500).json({ error: "AI Transcription failed." });
        }

        // The Python script appends _basic_pitch.xml to the original filename
        const xmlFileName = path.basename(filePath) + "_basic_pitch.xml";
        
        // DYNAMIC URL: Works on both localhost and Render
        const protocol = req.protocol;
        const host = req.get('host');
        const musicXmlUrl = `${protocol}://${host}/uploads/${xmlFileName}`;

        res.json({
            musicXmlUrl: musicXmlUrl,
            title: "Generated Notation",
            instrument: "Detected via AI",
            accuracy: "High"
        });
    });
});

// Redirect root to home
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
    console.log(`🚀 Server running at port ${PORT}`);
});