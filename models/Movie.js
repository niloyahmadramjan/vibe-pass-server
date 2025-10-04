const mongoose = require("mongoose");

const MovieSchema = new mongoose.Schema({
    adult: { type: Boolean, default: false },
    backdrop_path: { type: String },
    genre_ids: { type: [Number], default: [] },
    original_language: { type: String, required: true },
    original_title: { type: String },
    overview: { type: String },
    popularity: { type: Number, default: 0 },
    poster_path: { type: String, required: true },
    release_date: { type: String, required: true },
    title: { type: String, required: true },
    video: { type: Boolean, default: false },
    vote_average: { type: Number, default: 0 },
    vote_count: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model("Movie", MovieSchema);


