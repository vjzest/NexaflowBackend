import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
export const analyzeLead = async (leadData) => {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        const prompt = `Analyze this lead and give a score from 1-10 and a brief summary.
        Name: ${leadData.name}, Email: ${leadData.email}, Source: ${leadData.source}.
        Return ONLY a JSON object: { "score": number, "summary": "string" }`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return JSON.parse(response.text());
    }
    catch (error) {
        console.error('Gemini AI Error:', error.message);
        return { score: 0, summary: 'AI Analysis failed' };
    }
};
export const suggestReply = async (leadName, context) => {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        const prompt = `Generate a friendly WhatsApp greeting for a new lead named ${leadName}. 
        Context: ${context}. Keep it under 160 characters.`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    }
    catch (error) {
        return `Hi ${leadName}, thank you for reaching out! We will get back to you soon.`;
    }
};
//# sourceMappingURL=aiService.js.map