import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const isRedisAvailable = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
let connection: IORedis | null = null;
let leadQueue: any = null;
let useMock = true; // Default to mock, only enable if connection works

// Quick check for Redis
const tester = new IORedis(isRedisAvailable, {
    maxRetriesPerRequest: 0,
    connectTimeout: 2000,
});

tester.on('error', () => { /* Silent */ });

tester.ping()
    .then(() => {
        console.log('✅ Redis connected. Automation active.');
        useMock = false;
        connection = new IORedis(isRedisAvailable, { maxRetriesPerRequest: null });
        leadQueue = new Queue('lead_processing', { connection });
    })
    .catch(() => {
        console.warn('⚠️  Redis not found. Running in MOCK mode (No real background processing).');
        useMock = true;
        leadQueue = {
            add: async (name: string, data: any) => {
                console.log(`[STUB] Job skipped: ${name} for ${data.name}`);
                return { id: 'stub-' + Date.now() };
            }
        };
    })
    .finally(() => {
        tester.disconnect();
    });

export { leadQueue };

export const addLeadJob = async (lead: any) => {
    if (!leadQueue) {
        // Fallback if accessed before detection
        console.log(`[STUB] Buffering job for ${lead.name}`);
        return;
    }
    return await leadQueue.add('process_lead', {
        leadId: lead._id,
        userId: lead.userId,
        name: lead.name,
        phone: lead.phone,
        email: lead.email,
        data: lead.data,
        source: lead.source
    }, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 }
    });
};

import { analyzeLead, suggestReply } from '../services/aiService';
import { sendSMS, sendWhatsApp } from '../services/twilioService';
import Lead from '../models/Lead';
import Log from '../models/Log';

// 2. Initialize Worker
export const startLeadWorker = () => {
    // Wait a bit for detection to finish
    setTimeout(() => {
        if (useMock || !connection) {
            console.warn('Lead Worker NOT started (Mock mode)');
            return;
        }

        const worker = new Worker('lead_processing', async (job: Job) => {
            const { leadId, userId, name, phone, source } = job.data;
            console.log(`Processing lead job: ${job.id} for Lead ID: ${leadId}`);

            try {
                // 1. AI Analysis
                const analysis = await analyzeLead(job.data);
                await Lead.findByIdAndUpdate(leadId, {
                    aiScore: analysis.score,
                    aiSummary: analysis.summary
                });

                // 2. Automated Reply via Twilio
                const message = await suggestReply(name, `Lead from ${source}`);

                // Send SMS
                await sendSMS(phone, message);

                await Log.create({
                    userId,
                    type: 'system_error',
                    status: 'success',
                    message: `AI analysis and Twilio auto-reply sent to ${name}`,
                    metadata: { leadId, analysis }
                });

                const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
                if (n8nWebhookUrl) {
                    await axios.post(n8nWebhookUrl, { ...job.data, analysis, autoReply: message });
                }

            } catch (err: any) {
                console.error('Lead processing failed:', err.message);
                await Log.create({
                    userId,
                    type: 'system_error',
                    status: 'failed',
                    message: `Automation failed for lead ${name}: ${err.message}`,
                    metadata: { leadId }
                });
                throw err;
            }

        }, { connection });

        worker.on('completed', (job) => {
            console.log(`Job ${job.id} completed!`);
        });

        worker.on('failed', (job, err) => {
            console.error(`Job ${job?.id} failed with error: ${err.message}`);
        });

        console.log('✅ Lead Worker started and listening for jobs...');
    }, 3000);
};

export default leadQueue;
