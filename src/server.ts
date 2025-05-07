import dotenv from 'dotenv';
dotenv.config();
import os from 'os';
import express, { Application, Request, Response } from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import cors from 'cors';
import { MongoClient } from 'mongodb';

import metricsRoutes from './routes/metricsRoutes';
import trackRoutes from './routes/trackRoutes';
import eventRoutes from './routes/eventRoutes';

const app: Application = express();
const port: number = parseInt(process.env.PORT || '3000', 10);

// MongoDB connection
const uri: string | undefined = process.env.MONGODB_URI;
console.log("MongoDB URI:", uri); // Log the MongoDB URI for debugging
if (!uri) {
    console.error("MongoDB URI is not defined in .env file");
    process.exit(1);
}

const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 30000,
    retryWrites: true
});

async function connectDB(): Promise<MongoClient> {
    try {
        await client.connect();
        const db = client.db('metricsTracker');
        // Initialize models with db connection
        (await import('./repositories/visitRepository')).init(db);
        (await import('./repositories/eventRepository')).init(db);
        console.log("Connected to MongoDB");

        return client;
    } catch (err) {
        console.error("MongoDB connection error:", err);
        process.exit(1);
    }
}

// Middleware
app.use(cors());
app.use(bodyParser.json()); // for application/json
app.use(bodyParser.urlencoded({ extended: true })); // for application/x-www-form-urlencoded

// Serve dashboard
app.use('/dashboard', express.static(path.join(__dirname, 'public')));
app.get('/dashboard/*', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Routes
app.use('/metrics', metricsRoutes);
app.use('/track', trackRoutes);
app.use('/event', eventRoutes);

// Start server
let server: ReturnType<Application['listen']>;
connectDB().then(client => {
    server = app.listen(port, () => {
        const hostname: string = os.hostname(); // Get the machine's hostname
        const serverUrl: string = `http://${hostname}:${port}`;
        console.log(`Metrics tracker running on ${serverUrl}`);
        console.log(`Dashboard running on ${serverUrl}/dashboard`);
    });
});

// Graceful shutdown
process.on('SIGINT', async () => {
    await client.close();
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});