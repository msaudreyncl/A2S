import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Default Route
app.get("/", (req, res) => {
  res.send("Backend server is running...");
});

// Example API route (you can add more)
app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from backend!" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
