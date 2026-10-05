import express from 'express';
import { getPassByToken, getPassById } from '../controllers/passController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/token/:token', getPassByToken); // Public/Scanner endpoint to fetch pass metadata
router.get('/:id', authenticateToken, getPassById);

export default router;
