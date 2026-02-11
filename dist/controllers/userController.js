import User from '../models/User';
export const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user)
            return res.status(404).json({ message: 'User not found' });
        if (req.body.name)
            user.name = req.body.name;
        if (req.body.email)
            user.email = req.body.email; // Caution: Email change needs verification usually
        await user.save();
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            apiKey: user.apiKey,
            plan: user.plan
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
//# sourceMappingURL=userController.js.map