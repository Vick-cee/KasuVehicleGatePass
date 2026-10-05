import express from 'express';
import { getDashboardStats, getAnalyticsBreakdown, exportReportsCSV } from '../controllers/reportController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/stats', authenticateToken, authorizeRoles('ADMIN'), getDashboardStats);
router.get('/analytics', authenticateToken, authorizeRoles('ADMIN'), getAnalyticsBreakdown);
router.get('/export-csv', authenticateToken, authorizeRoles('ADMIN'), exportReportsCSV);

export default router;
