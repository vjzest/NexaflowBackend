import express from 'express';
import crypto from 'crypto';
import User from '../models/User';
const router = express.Router();
router.post('/', async (req, res) => {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'your_webhook_secret';
    const signature = req.headers['x-razorpay-signature'];
    const shasum = crypto.createHmac('sha256', secret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest('hex');
    if (signature === digest) {
        console.log('Razorpay Webhook Verified:', req.body.event);
        const { event, payload } = req.body;
        if (event === 'payment.captured' || event === 'order.paid') {
            const orderId = payload.payment ? payload.payment.entity.order_id : payload.order.entity.id;
            const email = payload.payment ? payload.payment.entity.email : payload.order.entity.notes.email;
            // Find user by email or some metadata attached during order creation
            const user = await User.findOne({ email });
            if (user) {
                user.plan = 'pro';
                user.subscriptionStatus = 'active';
                user.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
                await user.save();
                console.log(`Plan upgraded for user: ${email}`);
            }
        }
        res.status(200).json({ status: 'ok' });
    }
    else {
        console.warn('Razorpay Webhook Signature Mismatch');
        res.status(400).send('Invalid signature');
    }
});
export default router;
//# sourceMappingURL=webhookRoutes.js.map