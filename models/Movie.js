const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    title: String,
    original_title: String,
    overview: String,
    poster_path: String,
    backdrop_path: String,
    release_date: String,
    vote_average: Number,
    vote_count: Number,
    popularity: Number,
    genre_ids: [Number],
    original_language: String,
    adult: Boolean,
    video: Boolean,
    category: String,
}, { timestamps: true });

module.exports = mongoose.model("Movie", movieSchema);


