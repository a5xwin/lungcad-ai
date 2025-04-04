import React, { useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { AppContent } from '../context/AppContext';
import axios from 'axios';

const AllMedicalReports = () => {
 const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const location = useLocation();
  const patient = location.state?.selectedPatient;
  const { backendUrl, userData } = useContext(AppContent);
  useEffect(() => {
    // Add user fetching logic
    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          `${backendUrl}/api/users`, // Verify this endpoint exists in your backend
          { withCredentials: true }
        );
        setUsers(response.data.data);
      } catch (error) {
        console.error('User fetch error:', error.response?.data || error.message);
      }
    };

    // Add conditional fetching based on role
    if (userData?.role === 'admin') {
      fetchUsers();
    }
  }, [backendUrl, userData?.role]);
  

  const downloadReport = async (report) => {
    try {
      // Convert base64 to Blob
      const byteArrays = new Uint8Array(report.pdfFile);
      const blob = new Blob([byteArrays.buffer], { 
        type: report.contentType || 'application/pdf' 
      });

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report_${report.patientData.name}_${report._id}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Failed to download report');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        {patient ? `Reports for ${patient.patientData?.name}` : 'My Medical Reports'}
    </h1>

    <div className="space-y-4">
    {reports.map((report, index) => (
      <div 
      key={index}
      className="border rounded-lg p-4 bg-white shadow-sm"
      >
      <h3 className="font-medium text-gray-800">
      Patient: {report.patientData?.name || 'Unknown'}
      </h3>
      <p className="text-sm text-gray-500 mt-1">
      Created: {new Date(report.createdAt).toLocaleDateString()}
      </p>
      <button 
      onClick={() => downloadReport(report)}
      className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
      >
      Download Report
      </button>
      </div>
    ))}
    </div>
    </div>
  );
};

export default AllMedicalReports;

