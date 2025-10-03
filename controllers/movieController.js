const Movie = require("../models/Movie");

// Add new movie
const addMovie = async (req, res) => {
    try {
        const newMovie = new Movie(req.body);
        const savedMovie = await newMovie.save();

        return res.status(201).json(savedMovie);
    } catch (error) {
        console.error("❌ Error adding movie:", error);
        return res.status(500).json({ error: "Failed to add movie" });
    }
};

// Get all movies
const getMovies = async (req, res) => {
    try {
        const movies = await Movie.find();
        return res.status(200).json(movies);
    } catch (error) {
        console.error("❌ Error fetching movies:", error);
        return res.status(500).json({ error: "Failed to fetch movies" });
    }
};


module.exports = {addMovie, getMovies };