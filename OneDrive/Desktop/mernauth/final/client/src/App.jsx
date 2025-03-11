import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import UserDashboard from './pages/UserDashboard';
import GetStarted from './pages/GetStarted'; // Import the GetStarted component
import Home from './pages/Home';
import Login from './pages/Login';
import EmailVerify from './pages/EmailVerify';
import ResetPassword from './pages/ResetPassword';
import NewPage from './pages/NewPage';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
  return (
    <div>
      <ToastContainer />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/doctor-dashboard' element={<DoctorDashboard />} />
        <Route path='/user-dashboard' element={<UserDashboard />} />
        <Route path='/get-started' element={<GetStarted />} /> {/* New GetStarted Route */}
        <Route path='/email-verify' element={<EmailVerify />} />
        <Route path='/reset-password' element={<ResetPassword />} />
        <Route path='/new' element={<NewPage />} />
      </Routes>
    </div>
  );
};

export default App;
