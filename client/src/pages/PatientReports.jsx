import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AppContent } from '../context/AppContext';
import Navbar from '../components/Navbar';

const PatientReports = () => {
  const { backendUrl } = useContext(AppContent);
  const location = useLocation();
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const patient = location.state?.patient;

  useEffect(() => {
    if (!patient) {
      navigate('/doctor-dashboard');
      return;
    }
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await axios.get(
        `${backendUrl}/api/doctor/patients/${patient._id}/reports`,
        { withCredentials: true }
      );
      if (response.data.success) {
        setReports(response.data.reports);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  const downloadReport = async (reportId) => {
    try {
      const response = await axios.get(
        `${backendUrl}/api/doctor/reports/${reportId}/download`,
        {
          withCredentials: true,
          responseType: 'blob'  // Important for receiving binary data
        }
      );

      // Create a blob URL and trigger download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'patient-report.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Failed to download report');
    }
  };
  return (
    <div className="flex flex-col min-h-screen">
    <Navbar />
    <div className="p-6 max-w-4xl mx-auto w-full">
    <h2 className="text-2xl font-bold mb-6">Medical Reports for {patient?.name}</h2>
    {reports.length > 0 ? (
      <div className="space-y-4">
      {reports.map((report) => (
        <div key={report._id} className="border rounded-lg p-4 hover:bg-gray-50">
        <div className="flex justify-between items-center">
        <div>
        <h3 className="font-medium">{report.filename}</h3>
        <p className="text-sm text-gray-500">
        {new Date(report.uploadedAt).toLocaleDateString()}
        </p>
        </div>
        <button 
        onClick={() => downloadReport(report._id)}
        className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
        Download Report
        </button>
        </div>
        </div>
      ))}
      </div>
    ) : (
      <p className="text-gray-500">No reports available for this patient.</p>
    )}
    </div>
    </div>
  );
};

export default PatientReports;
