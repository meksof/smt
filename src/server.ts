import dotenv from 'dotenv';
dotenv.config();
import os from 'os';
import express, { Application, Request, Response } from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import cors from 'cors';
import mongoose from 'mongoose';
import requestIp from 'request-ip';

import metricsRoutes from './routes/metricsRoutes';
import trackRoutes from './routes/trackRoutes';
import eventRoutes from './routes/eventRoutes';
import sessionRoutes from './routes/sessionRoutes';
import visitRoutes from './routes/visitRoutes';
import { VisitModel } from './models/visit';
import { EventModel } from './models/event';
import { SessionModel } from './models/session';
const app: Application = express();
const port: number = parseInt(process.env.PORT || '3000', 10);

// MongoDB connection
const uri: string = process.env.MONGODB_URI || 'mongodb://localhost:27017/metrics-tracker';
console.log("MongoDB URI:", uri); // Log the MongoDB URI for debugging
if (!uri) {
    console.error("MongoDB URI is not defined in .env file");
    process.exit(1);
}

async function connectDB(): Promise<void> {
    try {
        // Configure mongoose
        mongoose.set('strictQuery', true);
        
        // Connect to MongoDB
        await mongoose.connect(uri, {
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

// Middleware
app.use(cors());

app.use(requestIp.mw());
app.use(bodyParser.json()); // for application/json
app.use(bodyParser.urlencoded({ extended: true })); // for application/x-www-form-urlencoded

// Serve dashboard
app.use('/dashboard', express.static(path.join(__dirname, '../public')));
app.get('/dashboard/*', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// Routes
app.use('/metrics', metricsRoutes);
app.use('/track', trackRoutes);
app.use('/visit', visitRoutes);
app.use('/event', eventRoutes);
app.use('/session', sessionRoutes);

// Start server
let server: ReturnType<Application['listen']>;
connectDB().then(() => {
    server = app.listen(port, () => {
        const hostname: string = os.hostname(); // Get the machine's hostname
        const serverUrl: string = `http://${hostname}:${port}`;
        console.log(`Metrics tracker running on ${serverUrl}`);
        console.log(`Dashboard running on ${serverUrl}/dashboard`);
    });
});

// Graceful shutdown
process.on('SIGINT', async () => {
    await mongoose.connection.close();
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});