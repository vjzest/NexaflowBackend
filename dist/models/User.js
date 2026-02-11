import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt';
const UserSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    apiKey: { type: String, unique: true },
    plan: { type: String, enum: ['free', 'pro', 'enterprise'], default: 'free' },
    subscriptionStatus: { type: String, enum: ['active', 'inactive', 'past_due', 'canceled'], default: 'inactive' },
    expiresAt: { type: Date },
}, { timestamps: true });
UserSchema.pre('save', async function () {
    if (!this.isModified('password'))
        return;
    this.password = await bcrypt.hash(this.password, 10);
    if (!this.apiKey) {
        this.apiKey = 'ak_' + Math.random().toString(36).substring(2, 15);
    }
});
UserSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};
export default mongoose.model('User', UserSchema);
//# sourceMappingURL=User.js.map