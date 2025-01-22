const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
require('dotenv').config();

const app = express();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)){
    fs.mkdirSync(uploadsDir);
}

// Updated CORS
app.use(cors({
  origin: ['https://resume-extractor-frontend.vercel.app', 'http://localhost:3000'],
  methods: ['POST', 'GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: false
}));

app.use(express.json());

// Updated Multer config
const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

// Updated upload endpoint
app.post("/api/upload", upload.single("pdf"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No PDF file uploaded" });
    }

    const pdfPath = req.file.path;
    const pythonScript = path.join(__dirname, "python", "extractor.py");
    
    console.log('PDF Path:', pdfPath);
    console.log('Python Script Path:', pythonScript);

    if (!fs.existsSync(pythonScript)) {
      throw new Error(`Python script not found at: ${pythonScript}`);
    }

    const pythonProcess = spawn("python", [pythonScript, pdfPath]);
    let resultData = "";
    let errorData = "";

    pythonProcess.stdout.on("data", (data) => {
      resultData += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      errorData += data.toString();
      console.error('Python Error:', data.toString());
    });

    // Capture process launch errors (e.g., Python not found)
    pythonProcess.on("error", (err) => {
      console.error('Failed to start Python process:', err);
    });

    pythonProcess.on("close", (code) => {
      // Clean up file
      fs.unlink(pdfPath, (err) => {
        if (err) console.error('Cleanup error:', err);
      });

      if (code !== 0) {
        console.error('Process exited with code:', code);
        console.error('Error output:', errorData);
        return res.status(500).json({
          error: "PDF processing failed",
          details: errorData || `Python process exited with code ${code}`
        });
      }

      try {
        const parsedData = JSON.parse(resultData.replace(/'/g, '"'));
        return res.json(parsedData);
      } catch (error) {
        console.error('Parse error:', error);
        return res.status(500).json({
          error: "Failed to parse results",
          details: error.message
        });
      }
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({
      error: "Server error",
      details: error.message
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});