import Lead from '../models/Lead';
import User from '../models/User';
import Website from '../models/Website';
import Log from '../models/Log';
import { addLeadJob } from '../config/queue';
// Helper to simulate AI analysis
const calculateAIScore = (lead) => {
    let score = 0;
    // 1. Source Weight
    if (lead.source.includes('site'))
        score += 3;
    if (lead.source === 'referral')
        score += 4;
    // 2. Data Completeness
    if (lead.email)
        score += 2;
    if (lead.phone && lead.phone.length > 10)
        score += 2;
    if (lead.name.split(' ').length > 1)
        score += 1;
    // 3. Email Quality
    if (lead.email) {
        const domain = lead.email.split('@')[1];
        if (domain && !['gmail.com', 'yahoo.com', 'hotmail.com'].includes(domain)) {
            score += 3; // Corporate email bonus
        }
    }
    return Math.min(Math.max(score, 1), 10); // Cap between 1 and 10
};
const generateAISummary = (score, lead) => {
    if (score >= 8)
        return "High Intent: Corporate domain detected, complete profile.";
    if (score >= 5)
        return "Medium Intent: Valid contact details, standard engagement.";
    return "Low Intent: Missing critical data points or free email provider.";
};
export const captureLead = async (req, res) => {
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
        if (!user)
            return res.status(404).json({ message: 'Owner not found' });
        // 2. Check Usage Limits (Static check for now)
        const limits = { free: 100, pro: 10000, enterprise: 1000000 };
        const monthStart = new Date();
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);
        const count = await Lead.countDocuments({ userId: user._id, createdAt: { $gte: monthStart } });
        if (count >= (limits[user.plan] || limits.free)) {
            await Log.create({
                userId: user._id,
                type: 'lead_capture',
                status: 'failed',
                message: 'Usage limit exceeded',
                metadata: { apiKey }
            });
            return res.status(403).json({ message: 'Usage limit exceeded for your plan.' });
        }
        // 3. Calculate AI Score
        const tempLead = { name, email, phone, source: source || (website ? `site_${website.name}` : 'api') };
        const aiScore = calculateAIScore(tempLead);
        const aiSummary = generateAISummary(aiScore, tempLead);
        // 4. Create Lead
        const lead = await Lead.create({
            userId: user._id,
            name,
            email,
            phone,
            source: tempLead.source,
            data: data || {},
            aiScore,
            aiSummary
        });
        // 5. Push to BullMQ & Log success
        await addLeadJob(lead);
        await Log.create({
            userId: user._id,
            type: 'lead_capture',
            status: 'success',
            message: `Lead captured for ${lead.name} (Score: ${aiScore}/10)`,
            metadata: { leadId: lead._id, websiteId: website?._id }
        });
        res.status(201).json({
            success: true,
            message: 'Lead captured successfully',
            leadId: lead._id,
            aiScore
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const getLeads = async (req, res) => {
    try {
        const leads = await Lead.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.json(leads);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const updateLead = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const lead = await Lead.findOne({ _id: id, userId: req.user._id });
        if (!lead)
            return res.status(404).json({ message: 'Lead not found' });
        Object.assign(lead, updates);
        await lead.save();
        res.json(lead);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
//# sourceMappingURL=leadController.js.map