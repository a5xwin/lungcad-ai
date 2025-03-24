import React, { useContext, useState } from 'react';
import { assets } from '../assets/assets';
import { useNavigate } from 'react-router-dom';
import { AppContent } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const Login = () => {
  const navigate = useNavigate();
  const { backendUrl, setIsLoggedin, getUserData } = useContext(AppContent);

  const [state, setState] = useState('Sign Up');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('User');

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      axios.defaults.withCredentials = true;
      let response;

      if (state === 'Sign Up') {
        response = await axios.post(`${backendUrl}/api/auth/register`, { name, email, password, role: role.toLowerCase() });
      } else {
        // Send role on login as well
        response = await axios.post(`${backendUrl}/api/auth/login`, { email, password, role: role.toLowerCase() });
      }

      const { data } = response;
      if (data.success) {
        setIsLoggedin(true);
        getUserData();
        toast.success(`${state} successful!`);
        navigate('/');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong!');
    }
  };

  return (
    <div className='flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-blue-200 to-purple-400'>
      <img onClick={() => navigate('/')} src={assets.logo} alt='' className='absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer' />
      <div className='bg-slate-900 p-10 rounded-lg shadow-lg w-full sm:w-96 text-indigo-300 text-sm'>
        <h2 className='text-3xl font-semibold text-white text-center mb-3'>{state === 'Sign Up' ? 'Create Account' : 'Login'}</h2>
        <p className='text-center text-sm mb-6'>{state === 'Sign Up' ? 'Create your account!' : 'Login to your account!'}</p>

        <form onSubmit={onSubmitHandler}>
          {state === 'Sign Up' && (
            <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
              <img src={assets.person_icon} alt='' />
              <input onChange={(e) => setName(e.target.value)} value={name} className='bg-transparent outline-none text-purple-300' type='text' placeholder='Full Name' required />
            </div>
          )}

          <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
            <img src={assets.mail_icon} alt='' />
            <input onChange={(e) => setEmail(e.target.value)} value={email} className='bg-transparent outline-none text-purple-300' type='email' placeholder='Valid Email id' required />
          </div>

          <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
            <img src={assets.lock_icon} alt='' />
            <input onChange={(e) => setPassword(e.target.value)} value={password} className='bg-transparent outline-none text-purple-300' type='password' placeholder='Password' required />
          </div>

          <div className='mb-4'>
            <select className='w-full px-5 py-2.5 rounded-full bg-[#333A5C] text-purple-300 outline-none' value={role} onChange={(e) => setRole(e.target.value)}>
              <option value='User'>User</option>
              <option value='Doctor'>Doctor</option>
              <option value='Admin'>Admin</option>
            </select>
          </div>

          <p onClick={() => navigate('/reset-password')} className='mb-4 cursor-pointer text-purple-120'>Forgot Password?</p>

          <button className='w-full py-2.5 rounded-full bg-gradient-to-r from-violet-500 to-violet-900 text-white font-medium'>{state}</button>

          {state === 'Sign Up' ? (
            <p className='text-gray-400 text-center text-xs mt-4'>
              Already have an account?{' '}
              <span onClick={() => setState('Login')} className='text-blue-400 cursor-pointer underline'>Login here</span>
            </p>
          ) : (
            <p className='text-gray-400 text-center text-xs mt-4'>
              Don't have an account?{' '}
              <span onClick={() => setState('Sign Up')} className='text-blue-400 cursor-pointer underline'>Sign up</span>
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default Login;
