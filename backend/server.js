const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
require('dotenv').config();
const connectDB = require('./config/db');

const app = express();

const allowedOrigins = [
  'http://localhost:3000',
  'https://resume-extractor-frontend.vercel.app',
  'https://resume-extractor-backend.onrender.com'
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
})); 
app.use(express.json());

// Configure multer with file filtering
const storage = multer.diskStorage({
  destination: "uploads/",
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

app.post("/api/upload", upload.single("pdf"), (req, res) => {

  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Headers', 'Content-Type');

  if (!req.file) {
    return res.status(400).json({ error: "No PDF file uploaded" });
  }

  const pdfPath = req.file.path;
  const pythonProcess = spawn("python", [
    path.join(__dirname, "python", "extractor.py"),
    pdfPath
  ]);

  let resultData = "";

  pythonProcess.stdout.on("data", (data) => {
    resultData += data.toString();
  });

  pythonProcess.stderr.on("data", (data) => {
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
          details: resultData 
        });
      }

      // Parse the JSON result
      const parsedData = JSON.parse(resultData);
      res.json(parsedData);
    } catch (error) {
      console.error("Error parsing Python output:", error);
      res.status(500).json({ 
        error: "Error processing result",
        details: error.message 
      });
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: err.message 
  });
});

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