require('dotenv').config();
const os = require('os');
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
console.log("MongoDB URI:", uri); // Log the MongoDB URI for debugging
if (!uri) {
    console.error("MongoDB URI is not defined in .env file");
    process.exit(1);
}

const client = new MongoClient(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 30000,
    retryWrites: true
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
        const hostname = os.hostname(); // Get the machine's hostname
        const serverUrl = `http://${hostname}:${port}`;
        console.log(`Metrics tracker running on ${serverUrl}`);
        console.log(`Dashboard running on ${serverUrl}/dashboard`);;
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