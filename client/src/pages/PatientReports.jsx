import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AppContent } from '../context/AppContext';

const PatientReports = () => {
  const { backendUrl } = useContext(AppContent);
  const location = useLocation();
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
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
        `${backendUrl}/api/patients/${patient._id}/reports`,
        { withCredentials: true }
      );
      console.log(response);
      if (response.data.success) {
        console.log('Reports fetched:', response.data.reports);
        setReports(response.data.reports);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  const handleDownload = async (reportId) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${backendUrl}/api/patients/${reportId}/download`,
        {
          responseType: 'blob',
          withCredentials: true
        }
      );
      
      // Create a blob URL and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report_${reportId}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      setLoading(false);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download report');
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{patient?.name}'s Medical Reports</h2>
        <button 
          onClick={() => navigate('/doctor-dashboard')}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Back to Dashboard
        </button>
      </div>
      
      {reports.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <p>No reports found for this patient.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map(report => (
            <div key={report._id} className="border rounded-lg p-4 hover:bg-gray-50">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">{report.filename}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(report.uploadedAt || report.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => handleDownload(report._id)}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
                >
                  {loading ? 'Downloading...' : 'Download PDF'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientReports;
