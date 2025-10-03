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
    }
}, { timestamps: true });

module.exports = mongoose.model("Showtime", ShowtimeSchema);
