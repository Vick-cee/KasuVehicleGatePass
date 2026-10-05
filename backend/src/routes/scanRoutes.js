import express from 'express';
import {
  verifyAndRecordScan,
  getOfficerShiftLogs,
  getAllScanLogs,
  getUserGateActivity,
} from '../controllers/scanController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Gate Officer scan verification & transaction logging
router.post('/verify', authenticateToken, authorizeRoles('GATE_OFFICER', 'ADMIN'), verifyAndRecordScan);
router.get('/shift-logs', authenticateToken, authorizeRoles('GATE_OFFICER'), getOfficerShiftLogs);

// User gate movement history
router.get('/user-activity', authenticateToken, getUserGateActivity);

// Admin all scan logs & search
router.get('/all', authenticateToken, authorizeRoles('ADMIN'), getAllScanLogs);

export default router;
