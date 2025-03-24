import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { assets } from '../assets/assets';
import { AppContent } from '../context/AppContext';

const Header = () => {
  const { userData, isLoggedin } = useContext(AppContent);
  const navigate = useNavigate();

  const handleGetStarted = () => {
    // Navigate to the get-started page which will handle role-based navigation
    navigate('/get-started');
  };

  return (
    <div className='flex flex-col items-center mt-20 px-4 text-center text-gray-800'>
      <img src={assets.header_img} alt="" className='w-36 h-36 rounded-full mb-6' />
      <h1 className='flex items-center gap-2 text-xl sm:text-3xl font-medium mb-2'>
        Hey {userData ? userData.name : 'User'}! 
        <img className='w-8 aspect-square' src={assets.hand_wave} alt="" />
      </h1>
      <h2 className='text-3xl sm:text-5xl font-semibold mb-4'>Welcome to LungCAD</h2>
      <p className='mb-8 max-w-md'>
        Scan lungs faster than your WiFi loads memes. Early detection, no cap. Stay ahead, and stay healthy fr!
      </p>
      {isLoggedin && userData ? (
        <button 
          className='border border-gray-500 rounded-full px-8 py-2.5 hover:bg-gray-100 transition-all'
          onClick={handleGetStarted}
        >
          Get Started
        </button>
      ) : null}
    </div>
  );
};

export default Header;
