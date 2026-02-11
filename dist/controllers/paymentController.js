import { razorpay } from '../config/razorpay.js';
import crypto from 'crypto';
import User from '../models/User.js';
export const createRazorpayOrder = async (req, res) => {
    const { planId, amount } = req.body;
    try {
        const order = await razorpay.orders.create({
            amount: amount * 100,
            currency: 'INR',
            receipt: `plan_${planId}_${req.user._id}`,
        });
        res.json(order);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const verifyPayment = async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(sign.toString())
        .digest('hex');
    if (razorpay_signature === expectedSign) {
        // Payment verified
        const { planId } = req.body;
        if (planId) {
            await User.findByIdAndUpdate(req.user._id, {
                plan: planId,
                subscriptionStatus: 'active'
            });
        }
        res.json({ success: true, message: 'Payment verified successfully and plan updated' });
    }
    else {
        res.status(400).json({ success: false, message: 'Invalid signature' });
    }
};
//# sourceMappingURL=paymentController.js.map