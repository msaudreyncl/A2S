import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import PDFDocument from "pdfkit";  // For PDF generation
import MidiWriter from "midi-writer-js";  // For MIDI generation
import { spawn } from "child_process";

dotenv.config();

const app = express();
const PORT = 3000;  // Ensure this matches your frontend fetch URLs

// Middleware
app.use(cors());  // Allows requests from your frontend
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure multer for file uploads
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const upload = multer({
  dest: path.join(__dirname, "uploads"),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("audio/")) {
      cb(null, true);
    } else {
      cb(new Error("Only audio files are allowed!"), false);
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 },  // 10MB limit
});

// Default Route
app.get("/", (req, res) => {
  res.send("Backend server is running...");
});

// Example API route
app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from backend!" });
});

// /api/generate route for uploading and processing audio
app.post("/api/generate", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded." });

    const inputPath = req.file.path;
    const outputDir = path.join(__dirname, "uploads");
    
    // 1. Call Python Script
    const pythonProcess = spawn('python', ['transcribe.py', inputPath, outputDir]);

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        // 2. The model creates a file named: [filename]_basic_pitch.mid
        const midiFileName = `${req.file.filename}_basic_pitch.mid`;
        
        res.json({
          title: req.file.originalname.replace(/\.[^/.]+$/, ""),
          instrument: "Detected Piano/Melodic",
          keyTempo: "Detected automatically",
          midiUrl: `/uploads/${midiFileName}`,
          accuracy: "85-95%"
        });
      } else {
        res.status(500).json({ error: "AI Processing failed." });
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
});

// NEW: Route to download PDF
app.get("/api/download/pdf", (req, res) => {
  try {
    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="sheet-music.pdf"`);

    // Generate mock PDF content
    doc.fontSize(20).text("A2S Generated Sheet Music", { align: "center" });
    doc.moveDown();
    doc.fontSize(14).text("Title: Mock Piece");
    doc.text("Instrument: Piano");
    doc.text("Key/Tempo: C Major / 120 BPM");
    doc.text("Accuracy: 95%");
    doc.moveDown();
    doc.text("Mock Notes: C D E F G A B C (Treble Clef)");
    doc.text("(In a real app, this would be actual notation.)");

    doc.pipe(res);
    doc.end();
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).send("Failed to generate PDF.");
  }
});

// NEW: Route to download MIDI
app.get("/api/download/midi", (req, res) => {
  try {
    const track = new MidiWriter.Track();
    track.addEvent(new MidiWriter.NoteEvent({ pitch: ['C4', 'E4', 'G4'], duration: '4' }));  // C major chord
    track.addEvent(new MidiWriter.NoteEvent({ pitch: ['D4', 'F#4', 'A4'], duration: '4' }));  // D major chord
    track.addEvent(new MidiWriter.NoteEvent({ pitch: ['E4', 'G#4', 'B4'], duration: '4' }));  // E major chord

    const writer = new MidiWriter.Writer(track);
    const midiBuffer = Buffer.from(writer.buildFile(), 'binary');

    res.setHeader("Content-Type", "audio/midi");
    res.setHeader("Content-Disposition", `attachment; filename="sheet-music.mid"`);
    res.send(midiBuffer);
  } catch (error) {
    console.error("Error generating MIDI:", error);
    res.status(500).send("Failed to generate MIDI.");
  }
});

// NEW: Route to download editor data (JSON)
app.get("/api/download/editor", (req, res) => {
  try {
    const editorData = {
      title: "Mock Piece",
      instrument: "Piano",
      keyTempo: "C Major / 120 BPM",
      accuracy: "95%",
      notes: ["C4", "D4", "E4", "F4", "G4"],
      message: "This is mock data for the web editor. In a real app, integrate with a tool like MuseScore."
    };

    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", `attachment; filename="editor-data.json"`);
    res.json(editorData);
  } catch (error) {
    console.error("Error generating editor data:", error);
    res.status(500).send("Failed to generate editor data.");
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});