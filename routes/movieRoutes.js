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
} = require("../controllers/movieController");

const verifyToken = require("../middlewares/verifyToken");
const adminOnly = require("../middlewares/adminOnly");

// 🟩 Public Routes
router.get("/", getAllMovies);
router.get("/:id", getMovieById);
router.get("/category/:category", getMoviesByCategory);
router.get("/:id/videos", getMovieVideos);

// 🟥 Admin Routes
router.post("/", verifyToken, adminOnly, addMovie);
router.put("/:id", verifyToken, adminOnly, updateMovie);
router.delete("/:id", verifyToken, adminOnly, deleteMovie);
router.post("/import/:category", importMovies);

module.exports = router;
