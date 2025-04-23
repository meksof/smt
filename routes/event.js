const express = require('express');
const router = express.Router();

const eventController = require('../controllers/eventController');

router.post('/', eventController.createEvent); // Create a new event

module.exports = router;