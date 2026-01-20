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

const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(uploadsDir));

const storage = multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

app.post("/api/generate", upload.single("audio"), (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No audio file provided." });

    const filePath = path.resolve(req.file.path);
    const pythonCmd = process.platform === "win32" ? "python" : "python3";

    const options = {
        maxBuffer: 1024 * 1024 * 10,
        env: { ...process.env, PYTHONIOENCODING: "utf-8" }
    };

    exec(`${pythonCmd} transcribe.py "${filePath}"`, options, (error, stdout, stderr) => {
        if (error && !stdout) {
            console.error("AI Error:", error);
            return res.status(500).json({ error: "Transcription engine failed." });
        }

        try {
            const lines = stdout.trim().split('\n');
            const lastLine = lines[lines.length - 1];
            const output = JSON.parse(lastLine);
            
            if (output.error) return res.status(500).json({ error: output.error });

            const xmlFileName = path.basename(output.xml_file);
            res.json({
                musicXmlUrl: `http://localhost:${PORT}/uploads/${xmlFileName}`,
                title: req.file.originalname,
                keyTempo: `${output.key} @ ${output.tempo}`
            });
        } catch (e) {
            console.error("Data Parse Error:", stdout);
            res.status(500).json({ error: "Failed to parse AI output." });
        }
    });
});

app.listen(PORT, () => console.log(`Server running: http://localhost:${PORT}`));