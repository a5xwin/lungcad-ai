import express from 'express';
import userAuth, { authorizeRoles } from '../middleware/userAuth.js';
import { getAllPatients, updatePatientDetails } from '../controllers/doctorController.js';

import Report from '../models/reportmodel.js';
import multer from 'multer';
const upload = multer();
const router = express.Router();

// GET all patients (only for doctors)
// This will fetch only users (patients) with role "user"
router.get('/patients', userAuth, authorizeRoles('doctor'), getAllPatients);

// PATCH: Update patient details (only for doctors)
// Expects patient id in the URL, and updated fields in the body
router.patch('/patients/:id', userAuth, authorizeRoles('doctor'), updatePatientDetails);

router.get('/patients/:id/reports', userAuth, authorizeRoles('doctor'), async (req, res) => {
  try {
    const reports = await Report.find({ patient: req.params.id })
                                .select('filename uploadedAt')
                                .sort('-uploadedAt');
    res.json({ success: true, reports });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/patients/:id/reports', 
  userAuth, 
  authorizeRoles('doctor'), 
  upload.single('pdf'), 
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No PDF file provided' });
      }

      const newReport = new Report({
        patient: req.params.id,
        pdf: {
          data: req.file.buffer,
          contentType: req.file.mimetype
        },
        filename: req.file.originalname
      });

      await newReport.save();
      res.json({ success: true, message: 'Report saved successfully' });
    } catch (error) {
      console.error('Error saving report:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
);
router.get('/reports/:id/download', userAuth, authorizeRoles('doctor'), async (req, res) => {
  try {
    const reportId = req.params.id;
    
    // Assuming you have a Report model
    const report = await Report.findById(reportId);
    
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    // Send the PDF file
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${report.filename}`);
    res.send(report.pdfData); // Assuming pdfData is stored in your database
    
  } catch (error) {
    console.error('Error downloading report:', error);
    res.status(500).json({ success: false, message: 'Failed to download report' });
  }
});

export default router;
