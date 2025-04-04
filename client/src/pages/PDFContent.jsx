import React ,{useContext}from 'react';
import html2pdf from 'html2pdf.js';
import { useLocation } from 'react-router-dom';
import { AppContent } from '../context/AppContext'
import axios from 'axios';

const PDFDocument = () => {
  const {state} = useLocation();
  const {patientData,diagnosisResult, scanImage} = state || {};
  const {backendUrl}= useContext(AppContent);

  const handleDownload = async () => {
    try {
      const element = document.querySelector("#pdf-report");
      const pdf = html2pdf().from(element);
      const pdfBlob = await pdf.output('blob');

      // Create FormData for the PDF
      const formData = new FormData();
      const pdfFile = new File([pdfBlob], `report_${patientData?.name}_${Date.now()}.pdf`, {
        type: 'application/pdf'
      });

      formData.append('pdf', pdfFile);

      // Send to backend
      const response = await axios.post(
        `${backendUrl}/api/patients/${patientData?._id}/reports`,
        formData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        console.log(response);
        pdf.save(); // Trigger download after successful save
      }

    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to save report: ' + error.message);
    }
  };
  return (
    <div style={{ padding: '1rem' }}>
    <div id="pdf-report" style={{ 
      background: '#fff',
        padding: '2rem',
        maxWidth: '56rem',
        margin: '0 auto',
        boxShadow: '0 1px 3px rgba(0,0,0,0.12)'
    }}>
    {/* Header Section */}
    <header style={{ 
      textAlign: 'center', 
        marginBottom: '2rem',
        paddingBottom: '1rem',
        borderBottom: '2px solid #2563eb'
    }}>
    <h1 style={{ 
      fontSize: '1.875rem',
        fontWeight: '700',
        color: '#1f2937',
        margin: '0 0 0.5rem 0'
    }}>
    Medical Diagnosis Report
    </h1>
    <div style={{ color: '#6b7280' }}>
    <h2 style={{ fontSize: '1.25rem', margin: '0.25rem 0' }}>LungCAD AI Diagnostics</h2>
    <p style={{ fontSize: '0.875rem' }}>Advanced Pulmonary Imaging Analysis</p>
    </div>
    </header>

    {/* ... rest of the component ... */}
    {/* Patient Information Section */}
    <section style={{ marginBottom: '2rem' }}>
    <h2 style={{ 
      fontSize: '1.25rem',
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: '1rem'
    }}>
    Patient Details
    </h2>
    <div style={{ 
      display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '1rem'
    }}>
    <div style={{ 
      backgroundColor: '#f8fafc',
        padding: '1rem',
        borderRadius: '0.5rem'
    }}>
    <p><span style={{ fontWeight: '500' }}>Name:</span> {patientData?.name || 'N/A'}</p>
    <p><span style={{ fontWeight: '500' }}>Age:</span> {patientData?.age || 'N/A'}</p>
    </div>
    <div style={{ 
      backgroundColor: '#f8fafc',
        padding: '1rem',
        borderRadius: '0.5rem'
    }}>
    <p><span style={{ fontWeight: '500' }}>Gender:</span> {patientData?.gender || 'N/A'}</p>
    <p><span style={{ fontWeight: '500' }}>Date:</span> {new Date().toLocaleDateString()}</p>
    </div>
    </div>
    </section>
    <section style={{ marginBottom: '2rem' }}>
    <h2 style={{ 
      fontSize: '1.25rem',
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: '1rem'
    }}>
    Imaging Analysis
    </h2>

    {scanImage && (
      <div style={{ 
        backgroundColor: '#f8fafc',
          padding: '1rem',
          borderRadius: '0.5rem',
          textAlign: 'center'
      }}>
      <img 
      src={scanImage} 
      alt="Medical Scan" 
      style={{ 
        maxWidth: '100%',
          height: '256px',
          objectFit: 'contain',
          margin: '0 auto'
      }}
      />
      </div>
    )}

    <div style={{ 
      marginTop: '1rem',
        backgroundColor: '#eff6ff',
        padding: '1rem',
        borderRadius: '0.5rem'
    }}>
    <p style={{ 
      fontSize: '1.125rem',
        fontWeight: '500',
        margin: 0
    }}>
    AI Diagnosis Confidence: {diagnosisResult || '0'}%
    </p>
    </div>
    </section>
    <footer style={{ 
      textAlign: 'center',
        color: '#4b5563',
        fontSize: '0.875rem',
        marginTop: '2rem',
        paddingTop: '1rem',
        borderTop: '1px solid #e5e7eb'
    }}>
    <p style={{ margin: '0.25rem 0' }}>
    This report was generated automatically by LungCAD AI systems.
    </p>
    <p style={{ margin: '0.25rem 0' }}>
    Consult a qualified healthcare professional for interpretation.
    </p>
    </footer>
    </div>

    <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
    <button 
    onClick={handleDownload}
    style={{
      backgroundColor: '#2563eb',
        color: 'white',
        padding: '0.5rem 1.5rem',
        borderRadius: '0.375rem',
        border: 'none',
        cursor: 'pointer',
        fontWeight: '500'
    }}
    >
    Download Full Report
    </button>
    </div>
    </div>
  );
};

export default PDFDocument;

