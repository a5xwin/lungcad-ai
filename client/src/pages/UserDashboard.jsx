import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppContent } from '../context/AppContext';
import Navbar from '../components/Navbar';

const UserDashboard = () => {
  const { backendUrl, userData } = useContext(AppContent);
  const [userInfo, setUserInfo] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
   
  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (userInfo && userInfo.id) {
      fetchUserReports(userInfo.id);
    }
  }, [userInfo]);

  const fetchUserData = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/data`, { withCredentials: true });
      if (data.success) {
        setUserInfo(data.userData);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const fetchUserReports = async (userId) => {
    try {
      setLoading(true);
      console.log(userId);
      const response = await axios.get(
        `${backendUrl}/api/patients/${userId}/reports`,
        { withCredentials: true }
      );
      
      if (response.data.success) {
        setReports(response.data.reports);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setLoading(false);
    }
  };

  const handleDownloadReport = async (reportId) => {
    try {
      const response = await axios.get(
        `${backendUrl}/api/patients/${reportId}/download`,
        {
          responseType: 'blob',
          withCredentials: true
        }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `medical_report.pdf`);
      document.body.appendChild(link);
      link.click();
      
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download report');
    }
  };

  if (!userInfo) return <p>Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-3xl font-bold mb-4">Welcome, {userInfo.name}</h2>
        </div>

        {/* Medical Reports Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Your Medical Reports</h2>
          
          {reports.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p>No medical reports available yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
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
                      onClick={() => handleDownloadReport(report._id)}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                    >
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
