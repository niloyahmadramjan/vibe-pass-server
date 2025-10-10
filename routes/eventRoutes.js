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

const adminOnly = require('../middlewares/adminOnly');
const verifyToken =require("../middlewares/verifyToken")
// user routes................................................

router.get('/', getAllEvents);
router.get('/:id', getEventById);
// Admin routers......................................................................

router.post('/',verifyToken,adminOnly, createEvent);
router.put('/:id',verifyToken,adminOnly, updateEvent); 
router.delete('/:id',verifyToken,adminOnly, deleteEvent); 

module.exports = router;
 