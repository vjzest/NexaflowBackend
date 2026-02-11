import mongoose, { Schema } from 'mongoose';
const WebsiteSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    url: { type: String, required: true },
    apiKey: { type: String, unique: true },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });
WebsiteSchema.pre('save', async function () {
    if (!this.apiKey) {
        this.apiKey = 'ws_' + Math.random().toString(36).substring(2, 15);
    }
});
export default mongoose.model('Website', WebsiteSchema);
//# sourceMappingURL=Website.js.map