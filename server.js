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

// Use environment variable for PORT (required for cloud platforms)
const PORT = process.env.PORT || 3000;

// Determine the frontend URL based on environment
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

// CORS Configuration - Allow frontend domain
app.use(cors({
    origin: [
        FRONTEND_URL,
        "https://a2s.vercel.app",
        "http://localhost:5173",
        "http://localhost:3000"
    ],
    credentials: true
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(uploadsDir));

const storage = multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ 
    storage,
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// Health check endpoint (useful for monitoring)
app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "A2S Backend is running" });
});

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
            
            // Use environment variable for backend URL
            const BACKEND_URL = process.env.BACKEND_URL || `http://localhost:${PORT}`;
            
            res.json({
                musicXmlUrl: `${BACKEND_URL}/uploads/${xmlFileName}`,
                title: req.file.originalname,
                instrument: output.instrument,
                keyTempo: `${output.key} @ ${output.tempo}`
            });
        } catch (e) {
            console.error("Data Parse Error:", stdout);
            res.status(500).json({ error: "Failed to parse AI output." });
        }
    });
});

app.listen(PORT, () => {
    console.log(`✅ A2S Backend running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Allowing requests from: ${FRONTEND_URL}`);
});