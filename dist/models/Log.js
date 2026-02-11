import mongoose, { Schema } from 'mongoose';
const LogSchema = new Schema({
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
export default mongoose.model('Log', LogSchema);
//# sourceMappingURL=Log.js.map