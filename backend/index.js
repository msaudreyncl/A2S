import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import PDFDocument from "pdfkit";  // NEW: For PDF generation
import MidiWriter from "midi-writer-js";  // NEW: For MIDI generation

dotenv.config();

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure multer (unchanged)
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
  limits: { fileSize: 10 * 1024 * 1024 },
});

// Default Route (unchanged)
app.get("/", (req, res) => {
  res.send("Backend server is running...");
});

// Example API route (unchanged)
app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from backend!" });
});

// /api/generate route (unchanged, but referenced for context)
app.post("/api/generate", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No audio file uploaded." });
    }

    console.log(`Received audio file: ${req.file.originalname} (${req.file.size} bytes)`);

    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2500));

    // Mock AI results
    const mockResults = {
      title: req.file.originalname.replace(/\.[^/.]+$/, ""),
      instrument: "Vocal/Melody + Piano Chord Progression",
      keyTempo: "D Major / 120 BPM",
      accuracy: "94%",
    };

    console.log("AI processing complete. Returning results:", mockResults);
    res.json(mockResults);
  } catch (error) {
    console.error("Error processing audio:", error);
    res.status(500).json({ error: "Failed to process audio file. Please try again." });
  }
});

// NEW: Route to download PDF
app.get("/api/download/pdf", (req, res) => {
  try {
    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="sheet-music.pdf"`);

    // Generate mock PDF content (simple text-based sheet music)
    doc.fontSize(20).text("A2S Generated Sheet Music", { align: "center" });
    doc.moveDown();
    doc.fontSize(14).text("Title: Mock Piece");
    doc.text("Instrument: Piano");
    doc.text("Key/Tempo: C Major / 120 BPM");
    doc.text("Accuracy: 95%");
    doc.moveDown();
    doc.text("Mock Notes: C D E F G A B C (Treble Clef)");
    doc.text("(In a real app, this would be actual notation rendered from AI data.)");

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
    // Generate a simple MIDI file with a few notes
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

// NEW: Route to download editor data (JSON export as placeholder for web editor)
app.get("/api/download/editor", (req, res) => {
  try {
    // Mock editor data (JSON with results; in real app, this could be MusicXML or editor-compatible format)
    const editorData = {
      title: "Mock Piece",
      instrument: "Piano",
      keyTempo: "C Major / 120 BPM",
      accuracy: "95%",
      notes: ["C4", "D4", "E4", "F4", "G4"],  // Simple note array
      message: "This is mock data for the web editor. In a real app, integrate with a tool like MuseScore or export as MusicXML."
    };

    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", `attachment; filename="editor-data.json"`);
    res.json(editorData);
  } catch (error) {
    console.error("Error generating editor data:", error);
    res.status(500).send("Failed to generate editor data.");
  }
});

// Start server (unchanged)
app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});