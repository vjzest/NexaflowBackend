import Website from '../models/Website.js';
export const createWebsite = async (req, res) => {
    const { name, url } = req.body;
    try {
        const website = await Website.create({
            userId: req.user._id,
            name,
            url
        });
        res.status(201).json(website);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const getWebsites = async (req, res) => {
    try {
        const websites = await Website.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.json(websites);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const deleteWebsite = async (req, res) => {
    try {
        const website = await Website.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        if (!website)
            return res.status(404).json({ message: 'Website not found' });
        res.json({ message: 'Website deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
//# sourceMappingURL=websiteController.js.map