const express = require('express');
const router = express.Router();
const trackController = require('../controllers/trackController');

// Create new visit
router.post('/', trackController.createVisit);

// Update visit duration
router.post('/:id', trackController.updateVisit);
router.patch('/:id', trackController.updateVisit);

module.exports = router;

