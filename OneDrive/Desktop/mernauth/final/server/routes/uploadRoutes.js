import express from "express";
import multer from "multer";
import userAuth, { authorizeRoles } from "../middleware/userAuth.js";

const router = express.Router();

// Configure multer storage
const storage = multer.memoryStorage(); // Stores file in memory as a buffer
const upload = multer({ storage: storage });

// ✅ Only authenticated users can upload
router.post("/upload", userAuth, authorizeRoles('doctor'), upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    console.log("Received file:", req.file.originalname);
    console.log("File buffer:", req.file.buffer); // File data in memory

    res.json({ message: "File uploaded successfully", filename: req.file.originalname });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "File upload failed" });
  }
});

export default router;
