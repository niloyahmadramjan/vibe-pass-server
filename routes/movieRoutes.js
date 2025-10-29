const express = require("express");
const router = express.Router();
const {
    getAllMovies,
    getMoviesByCategory,
    getMovieById,
    importMovies,
    getMovieVideos,
    addMovie,
    updateMovie,
    deleteMovie,
    getAllMoviesWithPagination,
} = require("../controllers/movieController");

const verifyToken = require("../middlewares/verifyToken");
const adminOnly = require("../middlewares/adminOnly");

// 🟩 Public Routes - SPECIFIC ROUTES FIRST
router.get("/", getAllMovies);
router.get("/category/:category", getMoviesByCategory);
router.get("/:id/videos", getMovieVideos);
router.get('/allMovieSeeAdmin', getAllMoviesWithPagination); // ✅ Specific route প্রথমে

// 🟩 Dynamic Routes - AFTER specific routes
router.get("/:id", getMovieById); // ✅ Dynamic route পরে

// 🟥 Admin Routes
router.post("/", verifyToken, adminOnly, addMovie);
router.post("/import/:category", importMovies);
router.put('/:id', updateMovie);
router.delete('/:id', deleteMovie);

module.exports = router;