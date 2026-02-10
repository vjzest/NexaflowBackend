import { Response, NextFunction } from 'express';
import Lead from '../models/Lead.js';
import User from '../models/User.js';

export const checkUsageLimit = async (req: any, res: Response, next: NextFunction) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Define limits
        const limits = {
            free: 100,
            pro: 10000,
            enterprise: 1000000
        };

        const currentMonthStart = new Date();
        currentMonthStart.setDate(1);
        currentMonthStart.setHours(0, 0, 0, 0);

        const currentLeadCount = await Lead.countDocuments({
            userId: user._id,
            createdAt: { $gte: currentMonthStart }
        });

        const userLimit = limits[user.plan as keyof typeof limits] || limits.free;

        if (currentLeadCount >= userLimit) {
            return res.status(403).json({
                message: `Usage limit exceeded for ${user.plan} plan. Please upgrade to continue capturing leads.`,
                limitReached: true
            });
        }

        next();
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
