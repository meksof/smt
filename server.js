require('dotenv').config();
const express = require('express');
const { parseDate } = require('./utils');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
const port = process.env.PORT || 3000;

// MongoDB connection
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

let db;
let visitsCollection;
let eventsCollection;

async function connectDB() {
    try {
        await client.connect();
        db = client.db('metricsTracker');
        visitsCollection = db.collection('visits');
        eventsCollection = db.collection('events');
        console.log("Connected to MongoDB");

        // Create index on timestamp for better query performance
        await visitsCollection.createIndex({ timestamp: 1 });
        await eventsCollection.createIndex({ timestamp: 1 });
    } catch (err) {
        console.error("MongoDB connection error:", err);
        process.exit(1);
    }
}

connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// add a /dashboard route to serve public/index.html
app.use('/dashboard', express.static('public'));

// Track visit endpoint
app.post('/track', async (req, res) => {
    try {
        const { duration, referrer, utm_source } = req.body;
        const visit = {
            timestamp: new Date(), // Current date/time
            duration: duration || 0,
            referrer: referrer || '(direct)',
            utm_source: utm_source || null
        };

        const result = await visitsCollection.insertOne(visit);
        res.json({ id: result.insertedId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add this new endpoint after the /track endpoint
app.post('/event', async (req, res) => {
    try {
        const { type, value } = req.body;
        const event = {
            timestamp: new Date(),
            type: type || 'unknown',
            value: value || null
        };

        const result = await eventsCollection.insertOne(event);
        res.json({ id: result.insertedId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get metrics endpoint
app.get('/metrics', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const query = {};

        if (startDate || endDate) {
            query.timestamp = {};
            if (startDate) query.timestamp.$gte = parseDate(startDate);
            if (endDate) query.timestamp.$lte = parseDate(endDate, true);
        }

        const visits = await visitsCollection.find(query).toArray();
        res.json(visits);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Dashboard endpoints
app.get('/metrics/views', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const query = {};

        if (startDate || endDate) {
            query.timestamp = {};
            if (startDate) query.timestamp.$gte = parseDate(startDate);
            if (endDate) query.timestamp.$lte = parseDate(endDate, true);
        }

        const count = await visitsCollection.countDocuments(query);
        res.json({ count });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/metrics/sessions', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const matchStage = {};

        if (startDate || endDate) {
            matchStage.timestamp = {};
            if (startDate) matchStage.timestamp.$gte = parseDate(startDate);
            if (endDate) matchStage.timestamp.$lte = parseDate(endDate, true);
        }

        const pipeline = [];
        if (Object.keys(matchStage).length > 0) {
            pipeline.push({ $match: matchStage });
        }

        pipeline.push({
            $group: {
                _id: null,
                avgDuration: { $avg: "$duration" },
                totalSessions: { $sum: 1 }
            }
        });

        const result = await visitsCollection.aggregate(pipeline).toArray();
        const data = result[0] || { avgDuration: 0, totalSessions: 0 };

        res.json({
            avgDuration: Math.round(data.avgDuration) || 0,
            totalSessions: data.totalSessions
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/metrics/referrers', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const matchStage = {};

        if (startDate || endDate) {
            matchStage.timestamp = {};
            if (startDate) matchStage.timestamp.$gte = parseDate(startDate);
            if (endDate) matchStage.timestamp.$lte = parseDate(endDate, true);
        }

        const pipeline = [];
        if (Object.keys(matchStage).length > 0) {
            pipeline.push({ $match: matchStage });
        }

        pipeline.push(
            { $group: { _id: "$referrer", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        );

        const result = await visitsCollection.aggregate(pipeline).toArray();
        res.json(result.map(item => ({ referrer: item._id, count: item.count })));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/metrics/sources', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const matchStage = { utm_source: { $ne: null } };

        if (startDate || endDate) {
            matchStage.timestamp = {};
            if (startDate) matchStage.timestamp.$gte = parseDate(startDate);
            if (endDate) matchStage.timestamp.$lte = parseDate(endDate, true);
        }

        const pipeline = [
            { $match: matchStage },
            { $group: { _id: "$utm_source", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ];

        const result = await visitsCollection.aggregate(pipeline).toArray();
        res.json(result.map(item => ({ utm_source: item._id, count: item.count })));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add this new endpoint after the other metrics endpoints
app.get('/metrics/events', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const matchStage = {};

        if (startDate || endDate) {
            matchStage.timestamp = {};
            if (startDate) matchStage.timestamp.$gte = parseDate(startDate);
            if (endDate) matchStage.timestamp.$lte = parseDate(endDate, true);
        }

        const pipeline = [];
        if (Object.keys(matchStage).length > 0) {
            pipeline.push({ $match: matchStage });
        }

        pipeline.push(
            { $group: { 
                _id:  {
                    type: "$type",
                    value: "$value"
                },
                count: { $sum: 1 }
            }},
            { $project: {
                type: "$_id.type",
                value: "$_id.value",
                count: 1,
                _id: 0
            }}
        );

        const result = await eventsCollection.aggregate(pipeline).toArray();
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Close MongoDB connection on shutdown
process.on('SIGINT', async () => {
    await client.close();
    process.exit();
});

app.listen(port, () => {
    console.log(`Metrics tracker running on http://localhost:${port}`);
    console.log(`Dashboard available at http://localhost:${port}/dashboard`);
});