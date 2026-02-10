import { Request, Response } from 'express';
import { razorpay } from '../config/razorpay.js';
import crypto from 'crypto';
import User from '../models/User.js';

export const createRazorpayOrder = async (req: any, res: Response) => {
    const { planId, amount } = req.body;

    try {
        const order = await razorpay.orders.create({
            amount: amount * 100,
            currency: 'INR',
            receipt: `plan_${planId}_${req.user._id}`,
        });

        res.json(order);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const verifyPayment = async (req: Request, res: Response) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount, planName } = req.body;

    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
        .update(sign.toString())
        .digest('hex');

    if (razorpay_signature === expectedSign) {
        // Payment verified
        // TODO: Update User plan in DB

        // Return success with redirect URL
        const successUrl = `/payment/success?orderId=${razorpay_order_id}&amount=${amount}&plan=${encodeURIComponent(planName || 'Premium Plan')}&method=Razorpay`;

        res.json({
            success: true,
            message: 'Payment verified successfully',
            redirectUrl: successUrl,
            orderId: razorpay_order_id,
            paymentId: razorpay_payment_id
        });
    } else {
        res.status(400).json({ success: false, message: 'Invalid signature' });
    }
};
