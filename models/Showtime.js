const mongoose = require("mongoose");

const ShowtimeSchema = new mongoose.Schema({
    movieId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Movie",
        required: true
    },
    date: {
        type: String,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    hall: {
        type: String,
        required: true
    },
    language: {
        type: String,
        default: "English"
    },
    format: {
        type: String,
        default: "2D"
    },
    totalSeats: {
        type: Number,
        default: 100
    },
    availableSeats: {
        type: Number,
        default: 100
    },
    status: {
        type: String,
        enum: ["Active", "Cancelled", "Completed"],
        default: "Active"
    }
}, { timestamps: true });

module.exports = mongoose.model("Showtime", ShowtimeSchema);
