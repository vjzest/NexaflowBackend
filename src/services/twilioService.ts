import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

const client = twilio(
    process.env.TWILIO_ACCOUNT_SID || '',
    process.env.TWILIO_AUTH_TOKEN || ''
);

export const sendSMS = async (to: string, message: string) => {
    try {
        const result = await client.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER as string,
            to: to
        });
        return result;
    } catch (error: any) {
        console.error('Twilio SMS Error:', error.message);
        throw error;
    }
};

export const sendWhatsApp = async (to: string, message: string) => {
    try {
        const result = await client.messages.create({
            body: message,
            from: `whatsapp:${process.env.TWILIO_PHONE_NUMBER as string}`,
            to: `whatsapp:${to}`
        });
        return result;
    } catch (error: any) {
        console.error('Twilio WhatsApp Error:', error.message);
        throw error;
    }
};

export const initiateCall = async (to: string, twimlUrl: string) => {
    try {
        const result = await client.calls.create({
            url: twimlUrl,
            to: to,
            from: process.env.TWILIO_PHONE_NUMBER as string
        });
        return result;
    } catch (error: any) {
        console.error('Twilio Voice Error:', error.message);
        throw error;
    }
};
