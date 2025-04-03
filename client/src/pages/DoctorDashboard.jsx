import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { assets } from '../assets/assets';
import Navbar from '../components/Navbar.jsx'
import { useNavigate } from 'react-router-dom';
import { AppContent  } from '../context/AppContext';
import html2pdf from 'html2pdf.js/dist/html2pdf.bundle.min';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const {userData,backendUrl,setUserData,setIsLoggedin} = useContext(AppContent);

  const [patients, setPatients] = useState([]);

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [formData, setFormData] = useState({
    gender: '',
    age: '',
    dob: '',
    sex: '',
    bloodgrp: '',
    smokinghabbits: '',
    docName: '',
    lastVisited: ''
  });
  const [scanImage, setScanImage] = useState(null);
  const [diagnosis, setDiagnosis] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [confidence, setConfidence] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, []);
  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedPatient) return;

    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('patientId', selectedPatient._id);

    try {
      const response = await axios.post(`${backendUrl}/api/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      });

      console.log('Upload response:', response.data);

      // The response contains imageData (base64) instead of imageUrl
      if (response.data && response.data.imageData) {
        // Create a data URL from the base64 image data
        const imageUrl = `data:image/png;base64,${response.data.imageData}`;
        setUploadedImage(imageUrl);

        // Get confidence from metadata
        const confidence = response.data.metadata?.confidence 
          ? (parseFloat(response.data.metadata.confidence) * 100).toFixed(2)
          : '0';
        setConfidence(confidence);

        // Generate PDF with the image URL and confidence
        generatePDF(imageUrl, confidence);
      } else {
        console.error('Invalid response format:', response.data);
        generatePDF(null, '0');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      generatePDF(null, '0');
    } finally {
      setIsLoading(false);
    }
  }; 
  const generatePDF = (imageUrl, diagnosisResult) => {
    // Check if imageUrl is defined
    const imageSection = imageUrl 
      ? `<div style="margin: 20px 0;">
        <h2 style="color: #34495e;">Scan Results</h2>
        <img src="${imageUrl}" style="max-width: 100%; margin: 10px 0;" />
        <p><strong>AI Diagnosis Confidence:</strong> ${diagnosisResult || 'N/A'}%</p>
      </div>`
      : `<div style="margin: 20px 0;">
        <h2 style="color: #34495e;">Scan Results</h2>
        <p>No scan image available</p>
      </div>`;

    const content = document.createElement('div');
    content.innerHTML = `
    <div style="padding: 20px; font-family: Arial, sans-serif;">
      <h1 style="color: #2c3e50; text-align: center;">Patient Medical Report</h1>

      <div style="margin: 20px 0;">
        <h2 style="color: #34495e;">Patient Information</h2>
        <p><strong>Name:</strong> ${selectedPatient.name}</p>
        <p><strong>Age:</strong> ${formData.age}</p>
        <p><strong>Gender:</strong> ${formData.gender}</p>
        <p><strong>Blood Group:</strong> ${formData.bloodgrp}</p>
        <p><strong>Doctor:</strong> ${formData.docName}</p>
        <p><strong>Last Visited:</strong> ${formData.lastVisited}</p>
      </div>

      ${imageSection}
    </div>
  `;

    const opt = {
      margin: 1,
      filename: `${selectedPatient.name}_medical_report.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(content).save();
  };
  const fetchPatients = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/doctor/patients', { withCredentials: true });
      if (response.data.success) {
        setPatients(response.data.patients);
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
      alert('Error fetching patients');
    }
  };

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    setFormData({
      gender: patient.gender || '',
      age: patient.age || '',
      dob: patient.dob ? patient.dob.substring(0, 10) : '',  // Format date as YYYY-MM-DD
      sex: patient.sex || '',
      bloodgrp: patient.bloodgrp || '',
      smokinghabbits: patient.smokinghabbits || '',
      docName: patient.docName || '',
      lastVisited: patient.lastVisited ? patient.lastVisited.substring(0, 10) : ''
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const handleButton = ()=>{
    if (selectedPatient) {
      navigate('/new', { 
        state: { 
          patientId: selectedPatient._id,
          patientName: selectedPatient.name
        }
      });
    }
  }

  const handleUpdatePatient = async () => {
    if (!selectedPatient) return;
    try {
      const response = await axios.patch(
        `http://localhost:4000/api/doctor/patients/${selectedPatient._id}`,
        formData,
        { withCredentials: true }
      );
      if (response.data.success) {
        alert(response.data.message);
        fetchPatients();  // Refresh patient list
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error('Error updating patient:', error);
      alert('Error updating patient');
    }
  };

  return (
    <div className="flex flex-col">
    <Navbar/>
    <div className="flex gap-[30px] p-6">
    {/* Patients List */}
    <div className="w-[300px] border-r border-gray-200 min-h-screen">
    {patients.map((patient) => (
      <div
      className="p-4 cursor-pointer hover:bg-gray-50 border-b border-gray-100"
      key={patient._id}
      onClick={() => handleSelectPatient(patient)}
      >
      <p className="font-medium text-gray-800">{patient.name}</p>
      </div>
    ))}
    </div>

    {/* Selected Patient Details and Form */}
    {selectedPatient && (
      <div className="flex-1 max-w-2xl">
      <h3 className="text-2xl font-bold mb-6">{selectedPatient.name}</h3>

      <div className="grid grid-cols-2 gap-6">
      <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Gender</label>
      <input 
      type="text" 
      name="gender" 
      value={formData.gender} 
      onChange={handleChange}
      className="w-full p-2 border border-gray-300 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition-all"
      />
      </div>

      <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Age</label>
      <input 
      type="number" 
      name="age" 
      value={formData.age} 
      onChange={handleChange}
      className="w-full p-2 border border-gray-300 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition-all"
      />
      </div>

      <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
      <input 
      type="date" 
      name="dob" 
      value={formData.dob} 
      onChange={handleChange}
      className="w-full p-2 border border-gray-300 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition-all"
      />
      </div>

      <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Sex</label>
      <select 
      name="sex" 
      value={formData.sex} 
      onChange={handleChange}
      className="w-full p-2 border border-gray-300 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition-all"
      >
      <option value="">Select</option>
      <option value="Male">Male</option>
      <option value="Female">Female</option>
      <option value="Other">Other</option>
      </select>
      </div>

      <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Blood Group</label>
      <input 
      type="text" 
      name="bloodgrp" 
      value={formData.bloodgrp} 
      onChange={handleChange}
      className="w-full p-2 border border-gray-300 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition-all"
      />
      </div>

      <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Smoking Habits (years)</label>
      <input 
      type="number" 
      name="smokinghabbits" 
      value={formData.smokinghabbits} 
      onChange={handleChange}
      className="w-full p-2 border border-gray-300 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition-all"
      />
      </div>

      <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Doctor Name</label>
      <input 
      type="text" 
      name="docName" 
      value={formData.docName} 
      onChange={handleChange}
      className="w-full p-2 border border-gray-300 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition-all"
      />
      </div>

      <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Last Visited</label>
      <input 
      type="date" 
      name="lastVisited" 
      value={formData.lastVisited} 
      onChange={handleChange}
      className="w-full p-2 border border-gray-300 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition-all"
      />
      </div>
      </div>

      <div className="mt-8 space-x-4">
      <button 
      className="border-2 border-gray-500 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-600 transition-colors"
      onClick={handleButton}
      >
      Upload DICOM
      </button>

      <button 
      onClick={handleUpdatePatient}
      className="bg-indigo-600 text-white px-4 py-2 font-medium hover:bg-indigo-700 transition-colors"
      >
      Update Patient
      </button>
      <div className="mt-8 space-x-4">
      {/* ... existing Upload DICOM and Update Patient buttons ... */}

      <div className="mt-8 space-x-4">
      <input
      type="file"
      accept=".dcm"
      onChange={handleFileChange}
      className="hidden"
      id="dicom-upload"
      />
      <label 
      htmlFor="dicom-upload" 
      className="border-2 border-gray-500 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-600 transition-colors cursor-pointer"
      >
      Select DICOM
      </label>

      {selectedFile && (
        <button 
        onClick={handleUpload}
        className="bg-indigo-600 text-white px-4 py-2 font-medium hover:bg-indigo-700 transition-colors"
        disabled={isLoading}
        >
        {isLoading ? 'Processing...' : 'Process & Generate Report'}
        </button>
      )}

      <button 
      onClick={handleUpdatePatient}
      className="bg-indigo-600 text-white px-4 py-2 font-medium hover:bg-indigo-700 transition-colors"
      >
      Update Patient
      </button>
      </div>

      {isLoading && (
        <div className="mt-4 text-gray-600">
        Processing DICOM file... Please wait.
        </div>
      )}

      {uploadedImage && (
        <div className="mt-6">
        <h3 className="text-lg font-medium mb-2">Scan Result</h3>
        <img src={uploadedImage} alt="Processed scan" className="max-w-md border border-gray-200" />
        <p className="mt-2"><strong>AI Diagnosis Confidence:</strong> {confidence}%</p>
        </div>
      )}
      </div>
      </div>
      </div>
    )}
    </div>
    </div>
  );
};

export default DoctorDashboard;
