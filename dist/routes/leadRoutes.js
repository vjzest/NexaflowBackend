import express from 'express';
import { captureLead, getLeads, updateLead } from '../controllers/leadController.js';
import { protect } from '../middleware/authMiddleware.js';
const router = express.Router();
// Public route for lead capture (uses API Key validation inside controller)
router.post('/capture', captureLead);
// Protected routes for dashboard
router.get('/', protect, getLeads);
router.put('/:id', protect, updateLead); // Update status or metadata
export default router;
//# sourceMappingURL=leadRoutes.js.map