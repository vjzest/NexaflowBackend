import { Request, Response } from 'express';
import Lead from '../models/Lead';
import User from '../models/User';
import Website from '../models/Website';
import Log from '../models/Log';
import { addLeadJob } from '../config/queue';

export const captureLead = async (req: Request, res: Response) => {
    const { apiKey, name, email, phone, source, data } = req.body;

    try {
        // 1. Identify User or Website
        let user = await User.findOne({ apiKey });
        let website = null;

        if (!user) {
            website = await Website.findOne({ apiKey, isActive: true });
            if (!website) {
                return res.status(401).json({ message: 'Invalid API Key' });
            }
            user = await User.findById(website.userId);
        }

        if (!user) return res.status(404).json({ message: 'Owner not found' });

        // 2. Check Usage Limits (Static check for now)
        const limits = { free: 100, pro: 10000, enterprise: 1000000 };
        const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
        const count = await Lead.countDocuments({ userId: user._id, createdAt: { $gte: monthStart } });

        if (count >= (limits[user.plan as keyof typeof limits] || limits.free)) {
            await Log.create({
                userId: user._id,
                type: 'lead_capture',
                status: 'failed',
                message: 'Usage limit exceeded',
                metadata: { apiKey }
            });
            return res.status(403).json({ message: 'Usage limit exceeded for your plan.' });
        }

        // 3. Create Lead
        const lead = await Lead.create({
            userId: user._id,
            name,
            email,
            phone,
            source: source || (website ? `site_${website.name}` : 'api'),
            data: data || {},
        });

        // 4. Push to BullMQ & Log success
        await addLeadJob(lead);

        await Log.create({
            userId: user._id,
            type: 'lead_capture',
            status: 'success',
            message: `Lead captured for ${lead.name}`,
            metadata: { leadId: lead._id, websiteId: website?._id }
        });

        res.status(201).json({
            success: true,
            message: 'Lead captured successfully',
            leadId: lead._id,
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getLeads = async (req: any, res: Response) => {
    try {
        const leads = await Lead.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.json(leads);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
