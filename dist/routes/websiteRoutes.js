import express from 'express';
import { createWebsite, getWebsites, deleteWebsite } from '../controllers/websiteController.js';
import { protect } from '../middleware/authMiddleware.js';
const router = express.Router();
router.use(protect);
router.post('/', createWebsite);
router.get('/', getWebsites);
router.delete('/:id', deleteWebsite);
export default router;
//# sourceMappingURL=websiteRoutes.js.map