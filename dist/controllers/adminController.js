import User from '../models/User';
import Lead from '../models/Lead';
import Website from '../models/Website';
import Log from '../models/Log';
export const getAdminStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalLeads = await Lead.countDocuments();
        const totalWebsites = await Website.countDocuments();
        const recentLogs = await Log.find().sort({ createdAt: -1 }).limit(10);
        // Simple revenue calculation based on plans (mock logic)
        const users = await User.find();
        const estimatedRevenue = users.reduce((acc, user) => {
            if (user.plan === 'pro')
                return acc + 29;
            if (user.plan === 'enterprise')
                return acc + 99;
            return acc;
        }, 0);
        res.json({
            stats: {
                totalUsers,
                totalLeads,
                totalWebsites,
                estimatedRevenue
            },
            recentLogs
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const updateUserPlan = async (req, res) => {
    const { userId, plan } = req.body;
    try {
        const user = await User.findByIdAndUpdate(userId, { plan }, { new: true });
        if (!user)
            return res.status(404).json({ message: 'User not found' });
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
//# sourceMappingURL=adminController.js.map