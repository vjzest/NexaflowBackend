import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI as string;
        if (!uri) throw new Error('MONGODB_URI is not defined in .env');

        // Masking password for safety but showing the host/db
        const maskedUri = uri.replace(/:([^@]+)@/, ':****@');
        console.log(`Attempting to connect to: ${maskedUri}`);

        const conn = await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000, // Fail fast for diagnostics
        });
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error: any) {
        console.error(`❌ MONGODB ERROR: ${error.message}`);
        if (error.message.includes('bad auth')) {
            console.error('TIP: Your Atlas credentials (username/password) are incorrect. Please re-check .env');
        } else if (error.message.includes('ENOTFOUND') || error.message.includes('timeout')) {
            console.error('TIP: Network issue or Atlas IP Whitelist blockage detected.');
        }
        throw error;
    }
};

export default connectDB;
