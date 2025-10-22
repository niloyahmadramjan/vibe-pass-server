// movieScheduler.js
const cron = require("node-cron");
const Movie = require("../models/Movie");


// everyday 12 am its running  (Bangladesh time 0 0 * * *)
cron.schedule("0 0 * * *", async () => {
    try {
        const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

        // upcoming যাদের release_date exfired
        const expiredMovies = await Movie.find({
            category: "upcoming",
            release_date: { $lt: today }
        });

        if (expiredMovies.length > 0) {
            const ids = expiredMovies.map(m => m._id);
            await Movie.updateMany(
                { _id: { $in: ids } },
                { $set: { category: "popular" } }
            );
            console.log(` ${expiredMovies.length} upcoming movies moved to popular.`);
        } else {
            console.log(" No expired upcoming movies found.");
        }
    } catch (err) {
        console.error(" Error updating upcoming movies:", err.message);
    }
});
