/**
 * Triggers an automated AI call using Twilio.
 * @param agentPhone Optional agent phone for recording/forwarding (not used in direct AI call)
 * @param leadPhone The phone number of the lead
 * @param message The message to be spoken by the AI
 */
export declare const triggerAutoCall: (agentPhone: string, leadPhone: string, message?: string) => Promise<{
    success: boolean;
    callId: string;
    error?: never;
} | {
    success: boolean;
    error: any;
    callId?: never;
}>;
//# sourceMappingURL=callingService.d.ts.map