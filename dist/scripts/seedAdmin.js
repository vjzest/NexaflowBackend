import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Load env from root
dotenv.config({ path: path.join(__dirname, '../../../.env') });
const seedAdmin = async () => {
    try {
        console.log('Targeting DB:', process.env.MONGO_URL || process.env.MONGO_URI);
        await mongoose.connect((process.env.MONGO_URL || process.env.MONGO_URI));
        console.log('Connected to MongoDB');
        const adminEmail = 'admin@autosaas.com';
        const adminExists = await User.findOne({ email: adminEmail });
        if (adminExists) {
            adminExists.role = 'admin';
            adminExists.password = 'AdminPassword123!'; // Reset it for the user
            await adminExists.save();
            console.log('Admin user updated successfully');
        }
        else {
            await User.create({
                name: 'System Admin',
                email: adminEmail,
                password: 'AdminPassword123!',
                role: 'admin',
                plan: 'enterprise'
            });
            console.log('Admin user created successfully');
        }
        console.log('CREDENTIALS:');
        console.log('Email:', adminEmail);
        console.log('Password: AdminPassword123!');
        process.exit();
    }
    catch (error) {
        console.error('CRITICAL SEED ERROR:', error);
        process.exit(1);
    }
};
seedAdmin();
//# sourceMappingURL=seedAdmin.js.map