import express from 'express';
import { registerUser, loginUser, logoutUser, getMe } from '../controllers/authController';
import { updateProfile } from '../controllers/userController';
import { protect } from '../middleware/authMiddleware';
const router = express.Router();
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
export default router;
//# sourceMappingURL=authRoutes.js.map