import Razorpay from 'razorpay';
import dotenv from 'dotenv';
dotenv.config();
export const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || '',
    key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});
export const createOrder = async (amount, currency = 'INR') => {
    return await razorpay.orders.create({
        amount: amount * 100, // amount in the smallest currency unit
        currency,
        receipt: `receipt_${Date.now()}`,
    });
};
//# sourceMappingURL=razorpay.js.map