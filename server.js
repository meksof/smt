require('dotenv').config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');

const metricsRoutes = require('./routes/metrics');
const trackRoutes = require('./routes/track');
const eventRoutes = require('./routes/event');

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


async function connectDB() {
    try {
        await client.connect();
        const db = client.db('metricsTracker');
        // Initialize models with db connection
        require('./models/visitModel').init(db);
        require('./models/eventModel').init(db);
        console.log("Connected to MongoDB");

        return client;
    } catch (err) {
        console.error("MongoDB connection error:", err);
        process.exit(1);
    }
}

connectDB();

// Middleware
app.use(cors());
app.use(bodyParser.json()); // for application/json
app.use(bodyParser.urlencoded({ extended: true })); // for application/x-www-form-urlencoded

// Serve dashboard
app.use('/dashboard', express.static(path.join(__dirname, 'public')));
app.get('/dashboard/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Routes
app.use('/metrics', metricsRoutes);
app.use('/track', trackRoutes);
app.use('/event', eventRoutes)


// Start server
let server;
connectDB().then(client => {
    server = app.listen(port, () => {
        console.log(`Metrics tracker running on http://localhost:${port}`);
        console.log(`dashboard running on http://localhost:${port}/dashboard`);
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