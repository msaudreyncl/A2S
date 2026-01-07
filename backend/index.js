import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import PDFDocument from "pdfkit";
import { spawn } from "child_process";
import fs from "fs";

dotenv.config();
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

// Multer config
const upload = multer({
  dest: uploadsDir,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("audio/")) cb(null, true);
    else cb(new Error("Only audio files allowed!"), false);
  },
  limits: { fileSize: 10 * 1024 * 1024 },
});

// Test route
app.get("/", (req, res) => res.send("Backend server running"));

// API: Generate MusicXML & MIDI
app.post("/api/generate", upload.single("audio"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded." });

  const inputPath = req.file.path;
  const fileBaseName = path.parse(req.file.originalname).name;

  const pythonProcess = spawn("python", ["transcribe.py", inputPath]);

  pythonProcess.on("close", (code) => {
    if (code === 0) {
      const midiFileName = `${fileBaseName}_basic_pitch.mid`;
      const xmlFileName = `${fileBaseName}_basic_pitch.xml`;

      res.json({
        title: fileBaseName,
        instrument: "Detected Piano/Melodic",
        keyTempo: "Detected automatically",
        accuracy: "85-95%",
        midiUrl: `/uploads/${midiFileName}`,
        musicXmlUrl: `/uploads/${xmlFileName}`,
      });
    } else {
      res.status(500).json({ error: "AI Processing failed." });
    }
  });
});

// Serve uploads
app.use("/uploads", express.static(uploadsDir));

// PDF Download (dynamic)
app.get("/api/download/pdf", (req, res) => {
  try {
    const { title = "Untitled", instrument = "-", keyTempo = "-", accuracy = "-" } = req.query;
    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${title}.pdf"`);

    doc.fontSize(20).text("A2S Generated Sheet Music", { align: "center" });
    doc.moveDown();
    doc.fontSize(14).text(`Title: ${title}`);
    doc.text(`Instrument: ${instrument}`);
    doc.text(`Key/Tempo: ${keyTempo}`);
    doc.text(`Accuracy: ${accuracy}`);
    doc.moveDown();
    doc.text("This PDF corresponds to your uploaded audio file.");
    doc.pipe(res);
    doc.end();
  } catch (error) {
    console.error("PDF Error:", error);
    res.status(500).send("Failed to generate PDF.");
  }
});

// MIDI Download
app.get("/api/download/midi", (req, res) => {
  const { file } = req.query;
  const midiPath = path.join(uploadsDir, file);
  if (fs.existsSync(midiPath)) {
    res.download(midiPath);
  } else {
    res.status(404).send("MIDI file not found");
  }
});

// Start server
app.listen(PORT, () => console.log(`Backend running at http://localhost:${PORT}`));
