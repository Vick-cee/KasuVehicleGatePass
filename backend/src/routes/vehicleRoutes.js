import express from 'express';
import {
  registerVehicle,
  getMyVehicles,
  getVehicleById,
  getAllVehicles,
  getPendingApprovals,
  approveVehicle,
  rejectVehicle,
  suspendPass,
  reactivatePass,
} from '../controllers/vehicleController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

// User routes
router.post('/register', authenticateToken, registerVehicle);
router.get('/my-vehicles', authenticateToken, getMyVehicles);
router.get('/details/:id', authenticateToken, getVehicleById);

// Admin routes
router.get('/all', authenticateToken, authorizeRoles('ADMIN'), getAllVehicles);
router.get('/pending', authenticateToken, authorizeRoles('ADMIN'), getPendingApprovals);
router.post('/:id/approve', authenticateToken, authorizeRoles('ADMIN'), approveVehicle);
router.post('/:id/reject', authenticateToken, authorizeRoles('ADMIN'), rejectVehicle);
router.post('/:id/suspend', authenticateToken, authorizeRoles('ADMIN'), suspendPass);
router.post('/:id/reactivate', authenticateToken, authorizeRoles('ADMIN'), reactivatePass);

export default router;
