import express from "express";
import multer from "multer";
import userAuth, { authorizeRoles } from "../middleware/userAuth.js";
import { spawn } from "child_process";
import path from "path"; // ✅ Import path module
import { fileURLToPath } from "url"; // ✅ Needed for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer storage
const storage = multer.memoryStorage(); // Stores file in memory as a buffer
const upload = multer({ storage: storage });

function runInference(fileBuffer) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, "MODELINFERENCE.py"); // ✅ Use absolute path

    const pythonProcess = spawn("python", [scriptPath]);

    let result = "";
    let error = "";

    pythonProcess.stdin.write(fileBuffer);
    pythonProcess.stdin.end();
    pythonProcess.stdout.on("data", (data) => {
      result += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      error += data.toString();
    });

    pythonProcess.on("close", (code) => {
      if (code === 0) {
        resolve(result.trim());
      } else {
        reject(`Python script exited with code ${code}: ${error}`);
      }
    });

    pythonProcess.on("error", (err) => {
      reject(`Failed to start Python process: ${err.message}`);
    });
  });
}



// ✅ Only authenticated users can upload
router.post("/upload", userAuth, authorizeRoles('doctor'), upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    console.log("Received file:", req.file.originalname);
    // console.log("File buffer:", req.file.buffer); // File data in memory

    const output = await runInference(req.file.buffer);
    console.log(output);
    const poutput= await output.json();
    return res.json(poutput);

    res.json({ message: "File uploaded successfully", filename: req.file.originalname });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "File upload failed" });
  }
});

export default router;