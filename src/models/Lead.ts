import mongoose, { Schema, Document } from 'mongoose';

export interface ILead extends Document {
    userId: mongoose.Types.ObjectId;
    name: string;
    email?: string;
    phone: string;
    source: string; // e.g., 'website', 'whatsapp', 'facebook'
    data: Record<string, any>; // Flexible data capture
    status: 'new' | 'contacted' | 'converted' | 'lost';
    aiScore?: number;
    aiSummary?: string;
}

const LeadSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String, required: true },
    source: { type: String, default: 'website' },
    data: { type: Map, of: Schema.Types.Mixed },
    status: { type: String, enum: ['new', 'contacted', 'converted', 'lost'], default: 'new' },
    aiScore: { type: Number, default: 0 },
    aiSummary: { type: String },
}, { timestamps: true });

export default mongoose.model<ILead>('Lead', LeadSchema);
