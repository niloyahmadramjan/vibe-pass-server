// const mongoose = require("mongoose");

// const MovieSchema = new mongoose.Schema({
//     adult: { type: Boolean, default: false },
//     backdrop_path: { type: String },
//     genre_ids: { type: [Number], default: [] },
//     original_language: { type: String, required: true },
//     original_title: { type: String },
//     overview: { type: String },
//     popularity: { type: Number, default: 0 },
//     poster_path: { type: String, required: true },
//     release_date: { type: String, required: true },
//     title: { type: String, required: true },
//     video: { type: Boolean, default: false },
//     vote_average: { type: Number, default: 0 },
//     vote_count: { type: Number, default: 0 }
// }, { timestamps: true });

// module.exports = mongoose.model("Movie", MovieSchema);








const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema({
    tmdb_id: { type: Number, required: true, unique: true }, // from TMDB id
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
    category: String, // e.g. "nowPlaying", "popular", etc.
}, { timestamps: true });

module.exports = mongoose.model("Movie", movieSchema);



