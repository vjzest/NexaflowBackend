import mongoose, { Schema, Document } from 'mongoose';

export interface ILog extends Document {
    userId: mongoose.Types.ObjectId;
    type: 'lead_capture' | 'email_sent' | 'call_triggered' | 'system_error' | 'payment';
    status: 'success' | 'failed' | 'pending';
    message: string;
    metadata: any;
}

const LogSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
        type: String,
        enum: ['lead_capture', 'email_sent', 'call_triggered', 'system_error', 'payment'],
        required: true
    },
    status: { type: String, enum: ['success', 'failed', 'pending'], default: 'success' },
    message: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed },
}, { timestamps: true });

export default mongoose.model<ILog>('Log', LogSchema);
