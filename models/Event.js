// models/Event.js
const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    // Basic Info (Required)
    title: {
        type: String,
        required: [true, 'Event title is required'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Event description is required'],
        maxlength: [1000, 'Description cannot be more than 1000 characters']
    },
    eventType: {
        type: String,
        required: [true, 'Event type is required'],
        enum: {
            values: ['Movie Premiere', 'Fan Meetup', 'Concert', 'Special Screening', 'Film Festival', 'Award Show', 'Charity Event'],
            message: 'Please select a valid event type'
        }
    },
    date: {
        type: Date,
        required: [true, 'Event date is required']
    },
    time: {
        type: String,
        required: [true, 'Event time is required']
    },
    duration: {
        type: Number,
        required: [true, 'Event duration is required'],
        min: [30, 'Duration must be at least 30 minutes'],
        max: [480, 'Duration cannot exceed 8 hours']
    },
    poster: {
        type: String,
        required: [true, 'Event poster is required'],
        validate: {
            validator: function (v) {
                // Basic URL validation or allow any string for now
                return v.length > 0;
            },
            message: 'Poster URL is required'
        }
    },

    // Venue Info (Required)
    hall: {
        type: String,
        required: [true, 'Hall name is required'],
        trim: true
    },
    screen: {
        type: String,
        required: [true, 'Screen number is required'],
        trim: true
    },
    location: {
        type: String,
        required: [true, 'Event location is required'],
        trim: true
    },
    capacity: {
        type: Number,
        required: [true, 'Event capacity is required'],
        min: [1, 'Capacity must be at least 1']
    },

    // Ticket Info (Required)
    price: {
        type: Number,
        required: [true, 'Ticket price is required'],
        min: [0, 'Price cannot be negative']
    },
    availableSeats: {
        type: Number,
        required: [true, 'Available seats count is required'],
        min: [0, 'Available seats cannot be negative']
    },
    bookingOpen: {
        type: Boolean,
        default: true
    },

    // Optional fields
    guestNames: [{
        type: String,
        trim: true
    }],
    performers: [{
        type: String,
        trim: true
    }],
    hostedBy: {
        type: String,
        trim: true
    },
    tags: [{
        type: String,
        trim: true
    }],
    isFeatured: {
        type: Boolean,
        default: false
    },

    // Optional createdBy
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Add index for better performance
eventSchema.index({ date: 1 });
eventSchema.index({ isFeatured: 1 });
eventSchema.index({ eventType: 1 });

module.exports = mongoose.model('Event', eventSchema);