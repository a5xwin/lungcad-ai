import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";

export const AppContent = createContext();

export const AppContextProvider = (props) => {
  axios.defaults.withCredentials = true; // ensures reload doesn't affect logged in profile

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [isLoggedin, setIsLoggedin] = useState(false);
  const [userData, setUserData] = useState(null); // changed from false to null

  const getAuthState = async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/auth/is-auth');
      if (data.success) {
        setIsLoggedin(true);
        getUserData();
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getUserData = async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/user/data');
      console.log("API Response:", data); // Debugging line
      if (data.success) {
        setUserData(data.userData);
        console.log("User Data Set:", data.userData); // Debugging line
      } else {
        toast.error("Failed to fetch user data");
      }
    } catch (error) {
      console.error("API Error:", error);
      toast.error(error.response?.data?.message || "Failed to fetch user data");
    }
  };

  useEffect(() => {
    getAuthState();
  }, []);

  const value = {
    backendUrl,
    isLoggedin,
    setIsLoggedin,
    userData,
    setUserData,
    getUserData
  };

  return (
    <AppContent.Provider value={value}>
      {props.children}
    </AppContent.Provider>
  );
};
