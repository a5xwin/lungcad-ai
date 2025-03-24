import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AppContent } from '../context/AppContext';

const UserDashboard = () => {
  const { backendUrl } = useContext(AppContent);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    fetchUserData();
  }, []);

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
      alert('Error fetching user data.');
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/user/download-pdf`, {
        withCredentials: true,
        responseType: 'blob'
      });
      const file = new Blob([response.data], { type: 'application/pdf' });
      const fileURL = URL.createObjectURL(file);
      window.open(fileURL);
    } catch (error) {
      console.error("Failed to download PDF:", error);
      alert('Failed to download PDF.');
    }
  };

  if (!userInfo) return <p>Loading user data...</p>;

  return (
    <div className="flex flex-col items-center justify-center p-6">
      <h2 className="text-3xl font-bold mb-4">Welcome, {userInfo.name}</h2>
      <p className="text-xl mb-6">
        Account Verified: {userInfo.isAccountVerified ? 'Yes' : 'No'}
      </p>
      <button 
        onClick={handleDownloadPDF}
        className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-lg"
      >
        Download PDF Summary
      </button>
    </div>
  );
};

export default UserDashboard;
