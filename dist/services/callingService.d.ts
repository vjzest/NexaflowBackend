export declare const triggerAutoCall: (agentPhone: string, leadPhone: string) => Promise<{
    success: boolean;
    message: string;
    callId?: never;
    error?: never;
} | {
    success: boolean;
    callId: string;
    message?: never;
    error?: never;
} | {
    success: boolean;
    error: any;
    message?: never;
    callId?: never;
}>;
//# sourceMappingURL=callingService.d.ts.map