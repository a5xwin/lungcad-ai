import React, { useContext, useRef, useState } from 'react';
import axios from 'axios';
import { AppContent } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

const NewPage = () => {
  const navigate = useNavigate();
  const { userData } = useContext(AppContent);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  // Show a loading message while userData is being fetched
  if (!userData) {
    return <div>Loading user data...</div>;
  }

  // Only allow doctors to upload files
  if (userData.role !== 'doctor') {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Access Denied</h2>
        <p>Only doctors can upload DICOM files.</p>
      </div>
    );
  }

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.name.endsWith('.dcm')) {
        setSelectedFile(file);
      } else {
        alert('Only .dcm files are allowed!');
        event.target.value = '';
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file first!');
      return;
    }
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post('http://localhost:4000/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log('Upload successful:', response.data);
      alert('File uploaded successfully!');
    } catch (error) {
      console.error('File upload error:', error);
      alert('File upload failed!');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-2xl font-semibold mb-4">Upload a DICOM File</h1>
      
      {/* Hidden file input */}
      <input
        type="file"
        accept=".dcm"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      <button
        onClick={handleUploadClick}
        className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
      >
        Select File
      </button>

      {selectedFile && (
        <>
          <p className="mt-2 text-sm text-gray-600">Selected File: {selectedFile.name}</p>
          <button
            onClick={handleUpload}
            className="mt-4 bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
          >
            Upload File
          </button>
        </>
      )}
    </div>
  );
};

export default NewPage;
