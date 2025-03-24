import React, { useEffect, useState } from 'react';
import axios from 'axios';

const DoctorDashboard = () => {
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

  useEffect(() => {
    fetchPatients();
  }, []);

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
    <div style={{ padding: '20px' }}>
      <h2>Doctor Dashboard</h2>
      <div style={{ display: 'flex', gap: '30px' }}>
        {/* Patients List */}
        <div style={{ width: '300px' }}>
          <h3>Patients</h3>
          {patients.map((patient) => (
            <div
              key={patient._id}
              style={{ border: '1px solid #ccc', margin: '5px 0', padding: '10px', cursor: 'pointer' }}
              onClick={() => handleSelectPatient(patient)}
            >
              <p><strong>Name:</strong> {patient.name}</p>
              <p><strong>Email:</strong> {patient.email}</p>
            </div>
          ))}
        </div>

        {/* Selected Patient Details */}
        {selectedPatient && (
          <div style={{ flexGrow: 1 }}>
            <h3>Update Patient: {selectedPatient.name}</h3>
            <div>
              <label>Gender:</label>
              <input type="text" name="gender" value={formData.gender} onChange={handleChange} />
            </div>
            <div>
              <label>Age:</label>
              <input type="number" name="age" value={formData.age} onChange={handleChange} />
            </div>
            <div>
              <label>Date of Birth:</label>
              <input type="date" name="dob" value={formData.dob} onChange={handleChange} />
            </div>
            <div>
              <label>Sex:</label>
              <select name="sex" value={formData.sex} onChange={handleChange}>
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label>Blood Group:</label>
              <input type="text" name="bloodgrp" value={formData.bloodgrp} onChange={handleChange} />
            </div>
            <div>
              <label>Smoking Habits (years):</label>
              <input type="number" name="smokinghabbits" value={formData.smokinghabbits} onChange={handleChange} />
            </div>
            <div>
              <label>Doctor Name:</label>
              <input type="text" name="docName" value={formData.docName} onChange={handleChange} />
            </div>
            <div>
              <label>Last Visited (date):</label>
              <input type="date" name="lastVisited" value={formData.lastVisited} onChange={handleChange} />
            </div>
            <button onClick={handleUpdatePatient} style={{ marginTop: '10px' }}>Update Patient</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;
