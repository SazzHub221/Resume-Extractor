const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
require('dotenv').config();
const connectDB = require('./config/db');

const app = express();

app.use(cors({
  origin: [
    'https://resume-extractor-frontend.onrender.com',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'multipart/form-data']
}));

app.use(express.json());

// Add preflight handling
app.options('*', cors());

// Add this before configuring multer
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer with file filtering
const storage = multer.diskStorage({
  destination: uploadsDir,  // Use the constant instead of string
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.pdf');
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Cleanup old uploads periodically
const cleanupUploads = () => {
  const uploadsDir = path.join(__dirname, "uploads");
  fs.readdir(uploadsDir, (err, files) => {
    if (err) return console.error(err);
    
    files.forEach(file => {
      const filePath = path.join(uploadsDir, file);
      fs.stat(filePath, (err, stats) => {
        if (err) return console.error(err);
        
        // Delete files older than 1 hour
        if (Date.now() - stats.mtime.getTime() > 3600000) {
          fs.unlink(filePath, err => {
            if (err) console.error(err);
          });
        }
      });
    });
  });
};

setInterval(cleanupUploads, 3600000); // Run cleanup every hour

// Add a base path for all API routes
app.use('/api', express.Router());

// Update the upload route to include /api
app.post("/api/upload", upload.single("pdf"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ 
      error: "No PDF file uploaded",
      details: "Please ensure you're sending a PDF file with the field name 'pdf'"
    });
  }

  const pdfPath = req.file.path;
  console.log('Processing PDF:', pdfPath); // Add logging

  const pythonPath = "F:/Projects/pdf-extractor/backend/python/venv/Scripts/python.exe";
  const scriptPath = path.join(__dirname, "python", "extractor.py");

  const pythonProcess = spawn(pythonPath, [scriptPath, pdfPath]);

  let resultData = "";
  let errorData = "";

  pythonProcess.stdout.on("data", (data) => {
    resultData += data.toString();
  });

  pythonProcess.stderr.on("data", (data) => {
    errorData += data.toString();
    console.error(`Python error: ${data}`);
  });

  pythonProcess.on("close", (code) => {
    try {
      // Clean up the uploaded file
      fs.unlink(pdfPath, (err) => {
        if (err) console.error(`Error deleting file: ${err}`);
      });

      if (code !== 0) {
        return res.status(500).json({ 
          error: "Processing error", 
          details: errorData || resultData,
          code: code
        });
      }

      // Parse the JSON result
      const parsedData = JSON.parse(resultData);
      res.json(parsedData);
    } catch (error) {
      console.error("Error parsing Python output:", error);
      res.status(500).json({ 
        error: "Error processing result",
        details: error.message,
        pythonOutput: resultData,
        pythonError: errorData
      });
    }
  });
});

// Add a test route to verify API is working
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File size is too large. Max size is 5MB' });
    }
  }
  res.status(500).json({ error: err.message });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});

connectDB();