import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContent } from '../context/AppContext';
import { toast } from 'react-toastify';

const GetStarted = () => {
  const navigate = useNavigate();
  const { isLoggedin, userData } = useContext(AppContent);

  // Debug log to check authentication state and user data
  console.log("GetStarted: isLoggedin:", isLoggedin, "userData:", userData);

  // Only render if user is logged in and userData exists
  if (!isLoggedin || !userData) {
    return null;
  }

  // Function to check email verification status
  const requireVerification = () => {
    console.log("Checking email verification, isAccountVerified:", userData.isAccountVerified);
    if (!userData.isAccountVerified) {
      toast.error("Please verify your email first");
      return true;
    }
    return false;
  };

  // Navigation handlers that check verification before navigating
  const handleUserDashboard = () => {
    if (requireVerification()) return;
    navigate('/user-dashboard');
  };

  const handleUpload = () => {
    if (requireVerification()) return;
    navigate('/new'); // DICOM file upload page
  };

  const handleDoctorDashboard = () => {
    if (requireVerification()) return;
    navigate('/doctor-dashboard');
  };

  // Render different options based on user role
  if (userData.role === 'doctor') {
    return (
      <div className="text-center my-5">
        <h2 className="text-2xl font-bold mb-3">Get Started</h2>
        <p className="mb-4">Please choose an option:</p>
        <button 
          onClick={handleUpload} 
          className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg m-2"
        >
          Upload DICOM File
        </button>
        <button 
          onClick={handleDoctorDashboard} 
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg m-2"
        >
          View Patient Table
        </button>
      </div>
    );
  } else if (userData.role === 'user') {
    return (
      <div className="text-center my-5">
        <h2 className="text-2xl font-bold mb-3">Get Started</h2>
        <button 
          onClick={handleUserDashboard} 
          className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2 rounded-lg m-2"
        >
          Go to Dashboard
        </button>
      </div>
    );
  } else {
    return null;
  }
};

export default GetStarted;
