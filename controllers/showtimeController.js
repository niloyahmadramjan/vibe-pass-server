const Showtime = require("../models/Showtime");

// Add new showtime
const addShowtime = async (req, res) => {
    try {
        const { movieId, date, time, price, hall } = req.body;

        const newShowtime = new Showtime({
            movieId,
            date,
            time,
            price,
            hall
        });

        await newShowtime.save();
        res.status(201).json(newShowtime);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to add showtime" });
    }
};

// Get all showtimes
const getShowtimes = async (req, res) => {
    try {
        const showtimes = await Showtime.find().populate("movieId");
        res.status(200).json(showtimes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch showtimes" });
    }
};



// ✅ Update showtime
const updateShowtime = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await Showtime.findByIdAndUpdate(id, req.body, { new: true });
        if (!updated) return res.status(404).json({ message: "Showtime not found" });
        res.status(200).json(updated);
    } catch (error) {
        res.status(500).json({ message: "Failed to update showtime" });
    }
};

// ✅ Delete showtime
const deleteShowtime = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Showtime.findByIdAndDelete(id);
        if (!deleted) return res.status(404).json({ message: "Showtime not found" });
        res.status(200).json({ message: "Showtime deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete showtime" });
    }
};


module.exports={addShowtime,getShowtimes,updateShowtime,deleteShowtime}
