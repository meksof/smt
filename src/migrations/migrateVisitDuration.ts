import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { VisitModel } from '../models/visit';

async function migrateDuration() {
    try {
        // Connect to MongoDB first
        const connectionString = process.env.MONGODB_URI || 'mongodb://localhost:27017/your-db-name';
        console.log('Trying to connect to DB <', connectionString, '>');
        await mongoose.connect(connectionString);
        
        console.log('Connected to MongoDB');
        console.log('Starting duration field migration...');
        
        const result = await VisitModel.updateMany(
            { duration: { $exists: true } },
            [
                // set durationInMilliSec to duration * 1000 if durationInMilliSec is null, otherwise keep it as is
                { $set: { durationInMilliSec: { $ifNull: ["$durationInMilliSec", { $multiply: ["$duration", 1000] }] } } },
                { $unset: "duration" }
            ]
        );
        
        console.log(`Migration complete: ${result.modifiedCount} documents updated`);
    } catch (err) {
        console.error('Migration failed:', err);
        throw err;
    } finally {
        await mongoose.disconnect();
    }
}

// Run if executed directly
if (require.main === module) {
    migrateDuration();
}