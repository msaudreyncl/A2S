import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const PORT = 3000;  // Changed from 3001 to match frontend's fetch URL (http://localhost:3000/api/generate)

// Middleware
app.use(cors());  // Allows requests from your frontend (e.g., if running on a different port)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure multer for file uploads (temporary storage in 'uploads/' folder)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const upload = multer({
  dest: path.join(__dirname, "uploads"),  // Store uploaded files temporarily here
  fileFilter: (req, file, cb) => {
    // Only allow audio files
    if (file.mimetype.startsWith("audio/")) {
      cb(null, true);
    } else {
      cb(new Error("Only audio files are allowed!"), false);
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 },  // 10MB limit (adjust as needed)
});

// Default Route
app.get("/", (req, res) => {
  res.send("Backend server is running...");
});

// Example API route (unchanged)
app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from backend!" });
});

// New API route for generating sheet music from audio
app.post("/api/generate", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No audio file uploaded." });
    }

    console.log(`Received audio file: ${req.file.originalname} (${req.file.size} bytes)`);

    // Simulate AI processing (e.g., transcription and analysis)
    // In a real app, integrate with an AI service here (e.g., send file to OpenAI or a music AI API)
    await new Promise(resolve => setTimeout(resolve, 2500));  // Mock delay (matches your frontend's 2.5s spinner)

    // Mock AI results (replace with real AI output later)
    const mockResults = {
      title: req.file.originalname.replace(/\.[^/.]+$/, ""),  // Use filename as title (remove extension)
      instrument: "Vocal/Melody + Piano Chord Progression",  // Mock instrument detection
      keyTempo: "D Major / 120 BPM",  // Mock key and tempo
      accuracy: "94%",  // Mock accuracy
    };

    console.log("AI processing complete. Returning results:", mockResults);
    res.json(mockResults);
  } catch (error) {
    console.error("Error processing audio:", error);
    res.status(500).json({ error: "Failed to process audio file. Please try again." });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
