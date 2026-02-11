import twilio from 'twilio';
import dotenv from 'dotenv';
dotenv.config();
const client = twilio(process.env.TWILIO_ACCOUNT_SID || '', process.env.TWILIO_AUTH_TOKEN || '');
export const sendSMS = async (to, message) => {
    try {
        const result = await client.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: to
        });
        return result;
    }
    catch (error) {
        console.error('Twilio SMS Error:', error.message);
        throw error;
    }
};
export const sendWhatsApp = async (to, message) => {
    try {
        const result = await client.messages.create({
            body: message,
            from: `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`,
            to: `whatsapp:${to}`
        });
        return result;
    }
    catch (error) {
        console.error('Twilio WhatsApp Error:', error.message);
        throw error;
    }
};
export const initiateCall = async (to, twimlUrl) => {
    try {
        const result = await client.calls.create({
            url: twimlUrl,
            to: to,
            from: process.env.TWILIO_PHONE_NUMBER
        });
        return result;
    }
    catch (error) {
        console.error('Twilio Voice Error:', error.message);
        throw error;
    }
};
//# sourceMappingURL=twilioService.js.map