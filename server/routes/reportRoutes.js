import express from 'express';
import multer from 'multer';
import Report from '../models/reportmodel.js';
import  userAuth,{ authorizeRoles } from '../middleware/userAuth.js';

const router = express.Router();
const upload = multer();
// Add to existing reportRoutes.js
// Add this route to your reportRoutes.js file
router.get('/:id/download', userAuth, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }
    
    // Set appropriate headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${report.filename}`);
    
    // Send the PDF data
    res.send(report.pdfFile.data);
    
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({
      success: false,
      message: 'Error downloading report'
    });
  }
});

router.get('/:id/reports',
    userAuth,
    authorizeRoles('doctor','user'),
    async (req, res) => {
        try {
            const reports = await Report.find({ patientId: req.params.id })
             
            res.status(200).json({
                success: true,
                reports
            });
            
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching reports: ' + error.message
            });
        }
    }
);
router.post('/:id/reports',
  userAuth,
  authorizeRoles('doctor'),
  upload.single('pdf'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ 
          success: false, 
          message: 'No PDF file provided' 
        });
      }
      const newReport = new Report({
        patientId: req.params.id,
        pdfFile: {
          data: req.file.buffer,
          contentType: req.file.mimetype
        },
        filename: req.file.originalname || `report_${Date.now()}.pdf`
      });
      const savedReport = await newReport.save();
      res.status(201).json({
        success: true,
        message: 'Report stored successfully',
        reportId: savedReport._id
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error saving report: ' + error.message
      });
    }
  }
);

export default router;
