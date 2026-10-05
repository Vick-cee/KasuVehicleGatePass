import express from 'express';
import { getAllUsers, getUserById, createUser, updateUserStatus } from '../controllers/userController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/', authenticateToken, authorizeRoles('ADMIN'), getAllUsers);
router.get('/:id', authenticateToken, authorizeRoles('ADMIN'), getUserById);
router.post('/', authenticateToken, authorizeRoles('ADMIN'), createUser);
router.put('/:id/status', authenticateToken, authorizeRoles('ADMIN'), updateUserStatus);

export default router;
