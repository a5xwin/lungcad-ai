import React, { useContext, useEffect } from 'react';
import { AppContent } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const { userData, isLoggedin, getUserData } = useContext(AppContent);

  // Optionally refresh user data when component mounts
  useEffect(() => {
    if (isLoggedin && !userData) {
      getUserData();
    }
  }, [isLoggedin, userData, getUserData]);

  // If not logged in, redirect to login page
  if (!isLoggedin) {
    navigate('/login');
    return null;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Dashboard</h2>
      {userData ? (
        <div>
          <p><strong>Name:</strong> {userData.name}</p>
          <p><strong>Account Verified:</strong> {userData.isAccountVerified ? 'Yes' : 'No'}</p>
          {/* You can add more user data fields here as needed */}
        </div>
      ) : (
        <p>Loading user data...</p>
      )}
    </div>
  );
};

export default Dashboard;
