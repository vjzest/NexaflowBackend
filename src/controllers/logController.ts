import { Response } from 'express';
import Log from '../models/Log.js';

export const getLogs = async (req: any, res: Response) => {
    try {
        const logs = await Log.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(50);
        res.json(logs);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
