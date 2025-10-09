

// ✅ Import movies by category (automatically fetch and save)
const axios = require("axios");
const Movie = require("../models/Movie");
require("dotenv").config();

const BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
// ✅ TMDB Category URLs

const categoryUrls = {
    nowPlaying: `${BASE_URL}/movie/now_playing`,
    trending: `${BASE_URL}/trending/movie/week`,
    popular: `${BASE_URL}/movie/popular`,
    topRated: `${BASE_URL}/movie/top_rated`,
    upcoming: `${BASE_URL}/movie/upcoming`,
    genreAction: `${BASE_URL}/discover/movie?with_genres=28&with_original_language=en&sort_by=popularity.desc`,
    genreIndia: `${BASE_URL}/discover/movie?with_genres=28&with_origin_country=IN&sort_by=popularity.desc`,
    genreAnimation: `${BASE_URL}/discover/movie?language=en-US&sort_by=popularity.desc&with_genres=16,10751`,
    banglaFilm: `${BASE_URL}/discover/movie?with_original_language=bn&sort_by=popularity.desc`
};











// ✅ Admin: Add a new movie manually
const addMovie = async (req, res) => {
    try {
        const movieData = req.body;

        if (!movieData.tmdb_id) {
            return res.status(400).json({ message: "tmdb_id is required" });
        }

        const existing = await Movie.findOne({ tmdb_id: movieData.tmdb_id });
        if (existing) {
            return res.status(400).json({ message: "Movie already exists" });
        }

        const newMovie = new Movie(movieData);
        await newMovie.save();

        res.status(201).json({ success: true, movie: newMovie });
    } catch (error) {
        console.error("Error adding movie:", error);
        res.status(500).json({ message: "Failed to add movie" });
    }
};



// ✅ Admin: Update existing movie
const updateMovie = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await Movie.findOneAndUpdate({ tmdb_id: id }, req.body, { new: true });

        if (!updated) {
            return res.status(404).json({ message: "Movie not found" });
        }

        res.status(200).json({ success: true, movie: updated });
    } catch (error) {
        console.error("Error updating movie:", error);
        res.status(500).json({ message: "Failed to update movie" });
    }
};



// ✅ Admin: Delete movie
const deleteMovie = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Movie.findOneAndDelete({ tmdb_id: id });

        if (!deleted) {
            return res.status(404).json({ message: "Movie not found" });
        }

        res.status(200).json({ success: true, message: "Movie deleted successfully" });
    } catch (error) {
        console.error("Error deleting movie:", error);
        res.status(500).json({ message: "Failed to delete movie" });
    }
};






// ✅ Admin: Import movies from TMDB by category
const importMovies = async (req, res) => {
    try {
        const { category } = req.params;
        const url = categoryUrls[category];
        if (!url) return res.status(400).json({ message: "Invalid category" });

        const { data } = await axios.get(url, {
            params: { api_key: API_KEY, language: "en-US", page: 1 }
        });

        const movies = data.results;

        const bulk = movies.map(m => ({
            updateOne: {
                filter: { tmdb_id: m.id },
                update: {
                    $set: {
                        tmdb_id: m.id,
                        title: m.title,
                        original_title: m.original_title,
                        overview: m.overview,
                        poster_path: m.poster_path,
                        backdrop_path: m.backdrop_path,
                        release_date: m.release_date,
                        vote_average: m.vote_average,
                        vote_count: m.vote_count,
                        popularity: m.popularity,
                        genre_ids: m.genre_ids,
                        original_language: m.original_language,
                        adult: m.adult,
                        video: m.video,
                        category
                    }
                },
                upsert: true
            }
        }));

        await Movie.bulkWrite(bulk);

        res.json({ success: true, count: movies.length });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to import movies", error: error.message });
    }
};










// / ✅ Get all movies
const getAllMovies = async (req, res) => {
    try {
        const movies = await Movie.find().sort({ createdAt: -1 });
        res.status(200).json(movies);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch movies", error: error.message });
    }
};

// ✅ Get movies by category
const getMoviesByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const movies = await Movie.find({ category }).sort({ popularity: -1 });
        res.status(200).json(movies);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch movies", error: error.message });
    }
};

// ✅ Get single movie by TMDB ID
const getMovieById = async (req, res) => {
    try {
        const { id } = req.params;
        const movie = await Movie.findOne({ tmdb_id: id });
        if (!movie) return res.status(404).json({ message: "Movie not found" });
        res.status(200).json(movie);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch movie", error: error.message });
    }
};




// 🎬 Fetch TMDB Videos..............................
 const getMovieVideos = async (req, res) => {
    try {
        const { tmdbId } = req.params;

        const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;

        // 🔹 Fetch from TMDB videos endpoint
        const response = await axios.get(
            `https://api.themoviedb.org/3/movie/${tmdbId}/videos?api_key=${TMDB_API_KEY}&language=en-US`
        );

        res.json(response.data); // return results array
    } catch (error) {
        console.error("Error fetching movie videos:", error.message);
        res.status(500).json({ message: "Failed to fetch videos" });
    }
};

module.exports = { getAllMovies, getMoviesByCategory, getMovieById, importMovies, importMovies, getMovieVideos, addMovie, updateMovie,deleteMovie };

