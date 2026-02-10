import { Request, Response } from 'express';
import Website from '../models/Website.js';

export const createWebsite = async (req: any, res: Response) => {
    const { name, url } = req.body;
    try {
        const website = await Website.create({
            userId: req.user._id,
            name,
            url
        });
        res.status(201).json(website);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getWebsites = async (req: any, res: Response) => {
    try {
        const websites = await Website.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.json(websites);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteWebsite = async (req: any, res: Response) => {
    try {
        const website = await Website.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        if (!website) return res.status(404).json({ message: 'Website not found' });
        res.json({ message: 'Website deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
