// routes/events.js - Remove auth temporarily
const express = require('express');
const router = express.Router();
const {
    createEvent,
    getAllEvents,
    getEventById,
    updateEvent,
    deleteEvent
} = require('../controllers/eventController');

// const auth = require('../middleware/auth'); // ✅ Comment out for now

// Public routes
router.get('/', getAllEvents);
router.get('/:id', getEventById);


router.post('/', createEvent);
router.put('/:id', updateEvent); 
router.delete('/:id', deleteEvent); 

module.exports = router;
 