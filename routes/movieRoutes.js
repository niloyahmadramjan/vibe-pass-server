const express = require("express");
const { addMovie, getMovies } = require("../controllers/movieController");
const router = express.Router();


// Add a new movie
router.post("/add", addMovie);

// Get all movies
router.get("/", getMovies);

module.exports = router;