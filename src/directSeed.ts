import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI;

if (!MONGO_URI) {
    console.error('ERROR: MONGODB_URI not found in .env');
    process.exit(1);
}

const UserSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'user' },
    apiKey: String,
    plan: String,
    subscriptionStatus: { type: String, default: 'active' },
    expiresAt: Date
}, { timestamps: true });

UserSchema.pre('save', async function (next: any) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    if (!this.apiKey) {
        this.apiKey = 'ak_' + Math.random().toString(36).substring(2, 15);
    }
    next();
});

const User = mongoose.model('User', UserSchema);

async function run() {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(MONGO_URI as string);
        console.log('Connected successfully!');

        const adminEmail = 'admin@autosaas.com';
        const existing = await User.findOne({ email: adminEmail });

        if (existing) {
            existing.role = 'admin';
            existing.password = 'AdminPassword123!';
            existing.plan = 'enterprise';
            await existing.save();
            console.log('Admin user updated.');
        } else {
            await User.create({
                name: 'System Admin',
                email: adminEmail,
                password: 'AdminPassword123!',
                role: 'admin',
                plan: 'enterprise',
                subscriptionStatus: 'active',
                expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
            });
            console.log('Admin user created.');
        }

        console.log('DONE! Login with:');
        console.log('Email: admin@autosaas.com');
        console.log('Password: AdminPassword123!');

        process.exit(0);
    } catch (error) {
        console.error('CRITICAL ERROR:', error);
        process.exit(1);
    }
}

run();
