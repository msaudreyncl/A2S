import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { spawn } from "child_process";
import fs from "fs";

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

app.use(cors());
app.use("/uploads", express.static(uploadsDir));

const upload = multer({ dest: "uploads/" });

app.post("/api/generate", upload.single("audio"), (req, res) => {
    if (!req.file) return res.status(400).send("No file.");

    const inputPath = req.file.path; // The actual file on disk
    // Pass the absolute path to Python
    const pythonProcess = spawn("python", ["transcribe.py", path.resolve(inputPath)]);

    pythonProcess.on("close", (code) => {
        if (code === 0) {
            // Basic Pitch appends '_basic_pitch' to the filename
            const base = path.basename(inputPath);
            res.json({
                title: req.file.originalname,
                midiUrl: `http://localhost:3000/uploads/${base}_basic_pitch.mid`,
                musicXmlUrl: `http://localhost:3000/uploads/${base}_basic_pitch.xml`
            });
        } else {
            res.status(500).json({ error: "Python script failed" });
        }
    });
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));