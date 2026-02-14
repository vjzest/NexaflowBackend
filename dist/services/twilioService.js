import twilio from 'twilio';
import dotenv from 'dotenv';
dotenv.config();
const client = twilio(process.env.TWILIO_ACCOUNT_SID || '', process.env.TWILIO_AUTH_TOKEN || '');
/**
 * Normalizes phone number to E.164 format.
 * Defaulting to Indian (+91) if 10 digits provided without code.
 */
export const normalizePhone = (phone) => {
    let clean = phone.replace(/\D/g, '');
    if (clean.length === 10)
        return `+91${clean}`;
    if (clean.length > 10 && !phone.startsWith('+'))
        return `+${clean}`;
    return phone.startsWith('+') ? phone : `+${clean}`;
};
export const sendSMS = async (to, message) => {
    try {
        const normalizedTo = normalizePhone(to);
        const result = await client.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: normalizedTo
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
        const normalizedTo = normalizePhone(to);
        const result = await client.messages.create({
            body: message,
            from: `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`,
            to: `whatsapp:${normalizedTo}`
        });
        return result;
    }
    catch (error) {
        console.error('Twilio WhatsApp Error:', error.message);
        throw error;
    }
};
export const initiateCall = async (to, twimlOrUrl) => {
    try {
        const normalizedTo = normalizePhone(to);
        const options = {
            to: normalizedTo,
            from: process.env.TWILIO_PHONE_NUMBER
        };
        if (twimlOrUrl.trim().startsWith('<')) {
            options.twiml = twimlOrUrl;
        }
        else {
            options.url = twimlOrUrl;
        }
        const result = await client.calls.create(options);
        return result;
    }
    catch (error) {
        console.error('Twilio Voice Error:', error.message);
        throw error;
    }
};
//# sourceMappingURL=twilioService.js.map