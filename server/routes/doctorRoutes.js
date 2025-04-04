import express from 'express';
import userAuth, { authorizeRoles } from '../middleware/userAuth.js';
import { getAllPatients, updatePatientDetails } from '../controllers/doctorController.js';

import Report from '../models/reportmodel.js';
import multer from 'multer';
const upload = multer();
const router = express.Router();

router.get('/patients', userAuth, authorizeRoles('doctor'), getAllPatients);

router.patch('/patients/:id', userAuth, authorizeRoles('doctor'), updatePatientDetails);

router.get('/patients/:id/reports', userAuth, authorizeRoles('doctor'), async (req, res) => {
  try {
    const reports = await Report.find({ patientId: req.params.id })
                                .select('filename uploadedAt')
                                .sort('-uploadedAt');
    res.json({ success: true, data: reports });
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
        patientId: req.params.id,
        pdfFile: {
          data: req.file.buffer,
          contentType: req.file.mimetype
        },
        filename: req.file.originalname || `report_${Date.now()}.pdf`,
        uploadedAt: new Date() 
      });
      console.log(newReport);
      //await newReport.save();
      res.json({ success: true, message: 'Report saved successfully' });
    } catch (error) {
      console.error('Error saving report:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

export default router;

