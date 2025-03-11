import PDFDocument from 'pdfkit';
import userModel from '../models/usermodel.js';

export const downloadPdf = async (req, res) => {
  try {
    // For this example, we assume that the authentication middleware puts the userId in req.body.
    // Alternatively, if your auth middleware sets req.user, you could use that.
    const { userId } = req.body;
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found!' });
    }

    // Create a new PDF document
    const doc = new PDFDocument({ size: 'A4' });
    
    // Set response headers for PDF file download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=patient_summary.pdf');

    // Add content to the PDF
    doc.fontSize(18).text('Patient Summary', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Name: ${user.name}`);
    doc.text(`Email: ${user.email}`);
    doc.text(`Age: ${user.age}`);
    doc.text(`Gender: ${user.gender}`);
    doc.text(`Date of Birth: ${user.dob ? user.dob.toDateString() : 'N/A'}`);
    doc.text(`Sex: ${user.sex}`);
    doc.text(`Blood Group: ${user.bloodgrp}`);
    doc.text(`Smoking Habits (years): ${user.smokinghabbits}`);
    doc.text(`Doctor Name: ${user.docName}`);
    doc.text(`Last Visited: ${user.lastVisited ? user.lastVisited.toDateString() : 'N/A'}`);

    // End the PDF document and pipe to the response
    doc.end();
    doc.pipe(res);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
