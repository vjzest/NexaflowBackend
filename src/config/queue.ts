import { Queue, Worker, Job } from 'bullmq';
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
let connection: IORedis | null = null;
let leadQueue: any = null;
let useMock = false;

// In-memory queue fallback
const inMemoryQueue: any[] = [];

// Quick check for Redis
const tester = new IORedis(isRedisAvailable, {
    maxRetriesPerRequest: 0,
    connectTimeout: 2000,
});

tester.on('error', () => { /* Silent */ });

tester.ping()
    .then(() => {
        console.log('✅ Redis connected. Automation active.');
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

export const addLeadJob = async (lead: any) => {
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
        processInMemoryJob(jobData);
        return;
    }

    if (!leadQueue) return;

    return await leadQueue.add('process_lead', jobData, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 }
    });
};

// Processor Logic
const processJobLogic = async (data: any) => {
    const { leadId, userId, name, phone, source } = data;
    console.log(`⚡ Processing Automation for: ${name}`);

    let analysis = { score: 5, summary: 'AI service unavailable' };
    let autoReplyMessage = "Hi! Thank you for reaching out. We will contact you soon.";
    let twilioStatus = 'pending';
    let callingStatus = 'pending';

    try {
        // 1. AI Analysis
        try {
            analysis = await analyzeLead(data);
            await Lead.findByIdAndUpdate(leadId, {
                aiScore: analysis.score,
                aiSummary: analysis.summary
            });
        } catch (e: any) {
            console.warn('AI Analysis failed:', e.message);
        }

        // 2. Automated Reply
        try {
            autoReplyMessage = await suggestReply(name, `Lead from ${source}`);
            if (phone && phone.length > 8) {
                await sendSMS(phone, autoReplyMessage);
                twilioStatus = 'success';
            } else {
                twilioStatus = 'simulated';
            }
        } catch (e: any) {
            console.error(`SMS failed: ${e.message}`);
            twilioStatus = 'failed';
        }

        // 3. AI Automated Call
        try {
            if (phone && phone.length > 8) {
                const callResult = await triggerAutoCall("+1234567890", phone, autoReplyMessage);
                callingStatus = callResult.success ? 'success' : 'failed';
            } else {
                callingStatus = 'simulated';
            }
        } catch (e: any) {
            console.error('AI Call failed:', e.message);
            callingStatus = 'failed';
        }

        const finalStatus = (twilioStatus === 'failed' || callingStatus === 'failed') ? 'failed' : 'success';

        await Log.create({
            userId,
            type: 'lead_capture',
            status: finalStatus,
            message: finalStatus === 'success'
                ? `🤖 Automation Executed: AI Analysis + Auto-Reply + AI Call sent to ${name}`
                : `⚠️ Automation Partial Failure for ${name}`,
            metadata: { leadId, analysis, twilioStatus, callingStatus }
        });

        await Lead.findByIdAndUpdate(leadId, { status: 'contacted' });

        const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
        if (n8nWebhookUrl) {
            await axios.post(n8nWebhookUrl, { ...data, analysis, autoReply: autoReplyMessage, twilioStatus, callingStatus });
        }

    } catch (err: any) {
        console.error('Lead processing crashed:', err.message);
    }
};

const processInMemoryJob = async (data: any) => {
    setTimeout(async () => {
        await processJobLogic(data);
    }, 2000);
};

// 2. Initialize Worker
export const startLeadWorker = () => {
    setTimeout(() => {
        if (useMock) {
            console.log('✅ In-Memory Worker Active.');
            return;
        }

        if (!connection) return;

        const worker = new Worker('lead_processing', async (job: Job) => {
            await processJobLogic(job.data);
        }, { connection });

        console.log('✅ Lead Worker started.');
    }, 3000);
};

export default leadQueue;
