/**
 * Normalizes phone number to E.164 format.
 * Defaulting to Indian (+91) if 10 digits provided without code.
 */
export declare const normalizePhone: (phone: string) => string;
export declare const sendSMS: (to: string, message: string) => Promise<import("twilio/lib/rest/api/v2010/account/message").MessageInstance>;
export declare const sendWhatsApp: (to: string, message: string) => Promise<import("twilio/lib/rest/api/v2010/account/message").MessageInstance>;
export declare const initiateCall: (to: string, twimlOrUrl: string) => Promise<import("twilio/lib/rest/api/v2010/account/call").CallInstance>;
//# sourceMappingURL=twilioService.d.ts.map