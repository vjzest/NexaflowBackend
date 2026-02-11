import Log from '../models/Log.js';
export const getLogs = async (req, res) => {
    try {
        const logs = await Log.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(50);
        res.json(logs);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
//# sourceMappingURL=logController.js.map