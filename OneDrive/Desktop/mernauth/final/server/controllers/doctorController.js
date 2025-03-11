import userModel from '../models/usermodel.js';

// Fetch all patients (users with role "user")
export const getAllPatients = async (req, res) => {
  try {
    // Fetch only users with role "user"
    const patients = await userModel.find({ role: 'user' }, 'name email gender age dob sex bloodgrp smokinghabbits docName lastVisited');
    res.json({ success: true, patients });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Update a patient's medical details
export const updatePatientDetails = async (req, res) => {
  try {
    const { id } = req.params;  // Patient's ID
    const { gender, age, dob, sex, bloodgrp, smokinghabbits, docName, lastVisited } = req.body;

    // Find the patient by id
    const patient = await userModel.findById(id);
    if (!patient) {
      return res.json({ success: false, message: "Patient not found!" });
    }

    // Update fields if provided
    if (gender) patient.gender = gender;
    if (age !== undefined) patient.age = age;
    if (dob) patient.dob = dob;
    if (sex) patient.sex = sex;
    if (bloodgrp) patient.bloodgrp = bloodgrp;
    if (smokinghabbits !== undefined) patient.smokinghabbits = smokinghabbits;
    if (docName) patient.docName = docName;
    if (lastVisited) patient.lastVisited = lastVisited;

    await patient.save();
    res.json({ success: true, message: "Patient details updated successfully!" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
