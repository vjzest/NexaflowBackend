import express from 'express';
import { getAdminStats, getAllUsers, updateUserPlan } from '../controllers/adminController';
import { protect, adminOnly } from '../middleware/authMiddleware';
const router = express.Router();
// All routes here are protected and restricted to admins
router.use(protect);
router.use(adminOnly);
router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.put('/users/plan', updateUserPlan);
export default router;
//# sourceMappingURL=adminRoutes.js.map