import express from 'express';
import { captureLead, getLeads } from '../controllers/leadController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route for lead capture (uses API Key validation inside controller)
router.post('/capture', captureLead);

// Protected routes for dashboard
router.get('/', protect, getLeads);

export default router;
