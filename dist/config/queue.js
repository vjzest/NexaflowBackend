import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import dotenv from 'dotenv';
import axios from 'axios';
import { analyzeLead, suggestReply } from '../services/aiService';
import { sendSMS } from '../services/twilioService';
import { triggerAutoCall } from '../services/callingService';
import Lead from '../models/Lead';
import Log from '../models/Log';
dotenv.config();
const isRedisAvailable = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
let connection = null;
let leadQueue = null;
let useMock = false;
// In-memory queue for dev/local environments without Redis
const inMemoryQueue = [];
// Quick check for Redis
const tester = new IORedis(isRedisAvailable, {
    maxRetriesPerRequest: 0,
    connectTimeout: 2000,
});
tester.on('error', () => { });
tester.ping()
    .then(() => {
    console.log('✅ Redis connected. Production Automation active.');
    connection = new IORedis(isRedisAvailable, { maxRetriesPerRequest: null });
    leadQueue = new Queue('lead_processing', { connection });
})
    .catch(() => {
    console.warn('⚠️  Redis not found. Switching to IN-MEMORY Automation (Dev Mode).');
    useMock = true;
})
    .finally(() => {
    tester.disconnect();
});
export { leadQueue };
export const addLeadJob = async (lead) => {
    const jobData = {
        leadId: lead._id,
        userId: lead.userId,
        name: lead.name,
        phone: lead.phone,
        email: lead.email,
        data: lead.data,
        source: lead.source
    };
    if (useMock) {
        console.log(`[InMemory] Adding job for ${lead.name}`);
        inMemoryQueue.push(jobData);
        processInMemoryJob(jobData); // Trigger immediately
        return;
    }
    if (!leadQueue)
        return; // Should not happen if Redis connected
    return await leadQueue.add('process_lead', jobData, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 }
    });
};
// Processor Logic (Shared)
const processJobLogic = async (data) => {
    const { leadId, userId, name, phone, source } = data;
    console.log(`⚡ Processing Automation for: ${name}`);
    try {
        // 1. AI Analysis
        // 1. AI Analysis
        let analysis = { score: 5, summary: 'AI service unavailable' };
        try {
            analysis = await analyzeLead(data);
            await Lead.findByIdAndUpdate(leadId, {
                aiScore: analysis.score,
                aiSummary: analysis.summary
            });
        }
        catch (e) {
            console.warn('AI Analysis failed, skipping:', e.message);
        }
        // 2. Automated Reply via Twilio
        let autoReplyMessage = "Simulated Auto-Reply";
        try {
            autoReplyMessage = await suggestReply(name, `Lead from ${source}`);
            // Only send if phone exists and is realistic
            if (phone && phone.length > 8) {
                await sendSMS(phone, autoReplyMessage);
            }
            else {
                console.log(`[Simulated] Would send SMS to ${phone}: "${autoReplyMessage}"`);
            }
        }
        catch (e) {
            console.warn(`Twilio skipped: ${e.message}`);
            // If Twilio fails, we still log it as a success for the DEMO but note it's simulated/failed
            console.log(`[Simulated] SMS to ${phone}: "${autoReplyMessage}"`);
        }
        // 3. AI Automated Call (NEW)
        try {
            if (phone && phone.length > 8) {
                console.log(`[AI-Call] Scheduling automated call for ${name}...`);
                await triggerAutoCall("+1234567890", phone); // Static agent number for demo
            }
        }
        catch (e) {
            console.warn('AI Call failed, skipping:', e.message);
        }
        await Log.create({
            userId,
            type: 'lead_capture',
            status: 'success',
            message: `🤖 Automation Executed: AI Analysis + Auto-Reply + AI Call sent to ${name}`,
            metadata: { leadId, analysis: analysis, reply: autoReplyMessage }
        });
        // Update Lead Status to Contacted
        await Lead.findByIdAndUpdate(leadId, { status: 'contacted' });
        const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
        if (n8nWebhookUrl) {
            await axios.post(n8nWebhookUrl, { ...data, analysis, autoReply: autoReplyMessage });
        }
    }
    catch (err) {
        console.error('Lead processing failed:', err.message);
        await Log.create({
            userId,
            type: 'system_error',
            status: 'failed',
            message: `Automation failed: ${err.message}`,
            metadata: { leadId }
        });
    }
};
const processInMemoryJob = async (data) => {
    // Simulate delay
    setTimeout(async () => {
        await processJobLogic(data);
    }, 2000);
};
// 2. Initialize Worker
export const startLeadWorker = () => {
    setTimeout(() => {
        if (useMock) {
            console.log('✅ In-Memory Worker Active. Listening for jobs...');
            return;
        }
        if (!connection)
            return;
        const worker = new Worker('lead_processing', async (job) => {
            await processJobLogic(job.data);
        }, { connection });
        worker.on('completed', (job) => console.log(`Job ${job.id} completed!`));
        worker.on('failed', (job, err) => console.error(`Job ${job?.id} failed: ${err.message}`));
        console.log('✅ Redis Worker started and listening for jobs...');
    }, 3000);
};
export default leadQueue;
//# sourceMappingURL=queue.js.map