import mongoose, { Schema, Document } from 'mongoose';

export interface IWebsite extends Document {
    userId: mongoose.Types.ObjectId;
    name: string;
    url: string;
    apiKey: string;
    isActive: boolean;
}

const WebsiteSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    url: { type: String, required: true },
    apiKey: { type: String, unique: true },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

WebsiteSchema.pre<IWebsite>('save', async function () {
    if (!this.apiKey) {
        this.apiKey = 'ws_' + Math.random().toString(36).substring(2, 15);
    }
});

export default mongoose.model<IWebsite>('Website', WebsiteSchema);
