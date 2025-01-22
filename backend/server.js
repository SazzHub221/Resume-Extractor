const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
require('dotenv').config();
const connectDB = require('./config/db');

const app = express();

// CORS Configuration
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://resume-extractor-frontend.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// Multer Configuration
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

// Cleanup Function
const cleanupUploads = () => {
  const uploadsDir = path.join(__dirname, "uploads");
  fs.readdir(uploadsDir, (err, files) => {
    if (err) return console.error(err);
    
    files.forEach(file => {
      const filePath = path.join(uploadsDir, file);
      fs.stat(filePath, (err, stats) => {
        if (err) return console.error(err);
        if (Date.now() - stats.mtime.getTime() > 3600000) {
          fs.unlink(filePath, err => {
            if (err) console.error(err);
          });
        }
      });
    });
  });
};

setInterval(cleanupUploads, 3600000);

// Upload Endpoint
app.post("/api/upload", upload.single("pdf"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No PDF file uploaded" });
  }

  const pdfPath = req.file.path;
  const pythonScript = path.join(__dirname, "python", "extractor.py");
  
  const pythonProcess = spawn("python", [pythonScript, pdfPath]);
  let resultData = "";

  pythonProcess.stdout.on("data", (data) => {
    resultData += data.toString();
  });

  pythonProcess.stderr.on("data", (data) => {
    console.error(`Python error: ${data}`);
  });

  pythonProcess.on("close", (code) => {
    try {
      fs.unlink(pdfPath, (err) => {
        if (err) console.error(`Error deleting file: ${err}`);
      });

      if (code !== 0) {
        return res.status(500).json({ 
          error: "Processing error", 
          details: resultData 
        });
      }

      const parsedData = JSON.parse(resultData.replace(/'/g, '"'));
      res.json(parsedData);
    } catch (error) {
      console.error("Error processing result:", error);
      res.status(500).json({ 
        error: "Failed to process PDF",
        details: error.message 
      });
    }
  });

  pythonProcess.on("error", (err) => {
    console.error("Python process error:", err);
    res.status(500).json({ 
      error: "Failed to start processing",
      details: err.message 
    });
  });
});

// Error Handlers
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        error: 'File size is too large. Max size is 5MB' 
      });
    }
  }
  next(err);
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: err.message 
  });
});

// Server Startup
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Database Connection
connectDB();