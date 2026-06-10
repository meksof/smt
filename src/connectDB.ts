import mongoose from 'mongoose';
import { EventModel } from './models/event';
import { SessionModel } from './models/session';
import { VisitModel } from './models/visit';


// MongoDB connection
export const connectionString: string = process.env.MONGODB_URI || 'mongodb://localhost:27017/metrics-tracker';
console.log("Trying to connect to DB <", connectionString, '>');
if (!connectionString) {
    console.error("MongoDB URI is not defined in .env file");
    process.exit(1);
}

export async function connectDB(): Promise<void> {
    try {
        // Configure mongoose
        mongoose.set('strictQuery', true);

        // Connect to MongoDB
        await mongoose.connect(connectionString, {
            autoCreate: true, // Create collections automatically
            autoIndex: true, // Create indexes automatically
            dbName: process.env.MONGODB_DB_NAME, // Specify the database name
        });

        // Initialize models and create indexes
        await Promise.all([
            VisitModel.createIndexes(),
            EventModel.createIndexes(),
            SessionModel.createIndexes()
        ]);

        // Log successful connection and initialized collections
        const collections = await mongoose.connection.db?.collections();
        console.log('Connected to MongoDB');
        console.log('Collections initialized:', collections?.map(c => c.collectionName));

        // Handle connection errors
        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
        });

    } catch (err) {
        console.error("MongoDB connection error:", err);
        process.exit(1);
    }
}
