// controllers/eventController.js - COMPLETELY FIXED
const Event = require('../models/Event');
const User = require('../models/user');

const createEvent = async (req, res) => {
    try {
        // console.log("📥 Received event data:", req.body);
        // console.log("👤 Request user object:", req.user); // This might be undefined

        // ✅ FIX: Don't rely on req.user, use the createdBy from request body
        const { createdBy, userEmail, userName, ...eventData } = req.body;

        // console.log("👤 User from client:", { createdBy, userEmail, userName });

        // Basic validation for required fields
        const requiredFields = ['title', 'description', 'eventType', 'date', 'time', 'duration', 'poster', 'hall', 'screen', 'location', 'capacity', 'price', 'availableSeats'];

        const missingFields = requiredFields.filter(field => !req.body[field]);
        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        // ✅ FIX: Prepare event data without relying on req.user
        const finalEventData = {
            title: req.body.title,
            description: req.body.description,
            eventType: req.body.eventType,
            date: new Date(req.body.date),
            time: req.body.time,
            duration: parseInt(req.body.duration),
            poster: req.body.poster,
            hall: req.body.hall,
            screen: req.body.screen,
            location: req.body.location,
            capacity: parseInt(req.body.capacity),
            price: parseFloat(req.body.price),
            availableSeats: parseInt(req.body.availableSeats),
            bookingOpen: req.body.bookingOpen !== undefined ? req.body.bookingOpen : true,
        };

        // ✅ FIX: Add createdBy only if it's provided and valid
        if (createdBy && createdBy !== 'undefined' && createdBy !== 'null') {
            // Verify the user exists in database
            try {
                const userExists = await user.findById(createdBy);
                if (userExists) {
                    finalEventData.createdBy = createdBy;
                    // console.log("✅ Using provided user ID:", createdBy);
                } else {
                    // console.log("⚠️ User not found in database, creating event without user");
                }
            } catch (userError) {
                // console.log("⚠️ Error verifying user, creating event without user:", userError.message);
            }
        } else {
            // console.log("⚠️ No valid user ID provided, creating event without user");
        }

        // Add optional fields
        if (req.body.guestNames && req.body.guestNames.length > 0) finalEventData.guestNames = req.body.guestNames;
        if (req.body.performers && req.body.performers.length > 0) finalEventData.performers = req.body.performers;
        if (req.body.hostedBy) finalEventData.hostedBy = req.body.hostedBy;
        if (req.body.tags && req.body.tags.length > 0) finalEventData.tags = req.body.tags;
        if (req.body.isFeatured !== undefined) finalEventData.isFeatured = req.body.isFeatured;

        // console.log("📤 Final event data for creation:", finalEventData);

        const event = new Event(finalEventData);
        const savedEvent = await event.save();

        // console.log("✅ Event created successfully with ID:", savedEvent._id);

        res.status(201).json({
            success: true,
            message: 'Event created successfully',
            data: savedEvent
        });

    } catch (error) {
        console.error("❌ Error creating event:", error);
        res.status(500).json({
            success: false,
            message: 'Error creating event: ' + error.message,
            error: error.message
        });
    }
};

// Other controller functions remain the same...
const getAllEvents = async (req, res) => {
    try {
        const events = await Event.find().sort({ createdAt: -1 });

        res.json({
            success: true,
            data: events
        });
    } catch (error) {
        console.error("❌ Error fetching events:", error);
        res.status(500).json({
            success: false,
            message: 'Error fetching events',
            error: error.message
        });
    }
};

const getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        res.json({
            success: true,
            data: event
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching event',
            error: error.message
        });
    }
};

const updateEvent = async (req, res) => {
    try {
        const event = await Event.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        res.json({
            success: true,
            message: 'Event updated successfully',
            data: event
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating event',
            error: error.message
        });
    }
};

const deleteEvent = async (req, res) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        res.json({
            success: true,
            message: 'Event deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting event',
            error: error.message
        });
    }
};

module.exports = {
    createEvent,
    getAllEvents,
    getEventById,
    updateEvent,
    deleteEvent
};