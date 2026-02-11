import mongoose, { Schema } from 'mongoose';
const LeadSchema = new Schema({
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
export default mongoose.model('Lead', LeadSchema);
//# sourceMappingURL=Lead.js.map