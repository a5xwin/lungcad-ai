import express from 'express';
import userAuth, { authorizeRoles } from '../middleware/userAuth.js';
import { getAllPatients, updatePatientDetails } from '../controllers/doctorController.js';

const router = express.Router();

// GET all patients (only for doctors)
// This will fetch only users (patients) with role "user"
router.get('/patients', userAuth, authorizeRoles('doctor'), getAllPatients);

// PATCH: Update patient details (only for doctors)
// Expects patient id in the URL, and updated fields in the body
router.patch('/patients/:id', userAuth, authorizeRoles('doctor'), updatePatientDetails);

export default router;
