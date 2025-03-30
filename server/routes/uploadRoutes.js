import express from "express";
import multer from "multer";
import userAuth, { authorizeRoles } from "../middleware/userAuth.js";
import { downloadPdf } from '../controllers/pdfController.js';
import { spawn } from "child_process";
import path from "path"; // ✅ Import path module
import { fileURLToPath } from "url"; // ✅ Needed for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // ✅ 50MB Limit
});

function runInference(fileBuffer) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, "test.py");
    const pythonProcess = spawn("python3", [scriptPath]);
    
    let resultBuffer = Buffer.from([]); // To collect PNG binary data
    let metadata = '';
    pythonProcess.stdin.on('error', (err) => {
      if (err.code === 'EPIPE') {
        console.warn('Python process closed stdin');
      } else {
        reject(err);
      }
    });

    if (pythonProcess.stdin.writable) {
      pythonProcess.stdin.write(fileBuffer);
      pythonProcess.stdin.end();
    }

    pythonProcess.stdout.on("data", (data) => {
      resultBuffer = Buffer.concat([resultBuffer, data]);
    });

    pythonProcess.stderr.on('data', (data) => {
      metadata += data.toString();
      console.log(metadata);
    });

    pythonProcess.on("close", (code) => {
      if (code === 0) {
        resolve({pngBuffer: resultBuffer,metadata}); // Return the PNG buffer
      } else {
        reject(new Error(`Python process exited with code ${code}`));
      }
    });

    pythonProcess.on("error", (err) => {
      reject(err);
    });
  });
}


router.post("/upload", userAuth, authorizeRoles('doctor'), upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    console.log("Received file:", req.file.originalname);

    const {pngBuffer,metadata} = await runInference(req.file.buffer);
    res.json({ 
      message: "File uploaded successfully", 
      filename: req.file.originalname,
      imageData: pngBuffer.toString('base64'), // Convert buffer to base64 for JSON
      metadata: JSON.parse(metadata)
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "File upload failed" });
  }
});

export default router;
