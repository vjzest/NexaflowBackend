import { initiateCall } from './twilioService';

/**
 * Triggers an automated AI call using Twilio.
 * @param agentPhone Optional agent phone for recording/forwarding (not used in direct AI call)
 * @param leadPhone The phone number of the lead
 * @param message The message to be spoken by the AI
 */
export const triggerAutoCall = async (agentPhone: string, leadPhone: string, message?: string) => {
    console.log(`[CallingService] Triggering AI call to: ${leadPhone}`);

    const textToSay = message || "Hello, this is an automated call from HousePlanFiles. Thank you for your interest. Our representative will contact you shortly.";

    // Generate TwiML directly
    const twiml = `
        <Response>
            <Say voice="Polly.Matthew" language="en-IN">${textToSay}</Say>
            <Pause length="1"/>
            <Say voice="Polly.Matthew" language="en-IN">Goodbye.</Say>
        </Response>
    `;

    try {
        const result = await initiateCall(leadPhone, twiml.trim());
        return { success: true, callId: result.sid };
    } catch (error: any) {
        console.error('Auto-call failed:', error.message);
        return { success: false, error: error.message };
    }
};
