const Subscriber = require("../models/Subscriber");
const checkEmail = require("../utils/checkEmail");
const axios = require("axios");

// POST /api/subscribe - Create new subscription
// ✅ POST /api/subscribe - Create new subscription
const subscribe = async (req, res) => {
  try {
    const { email } = req.body;

    // 1️⃣ Check if email exists
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // 2️⃣ Validate email (RapidAPI + fallback)
    const isValid = await checkEmail(email);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid or unreachable email address",
      });
    }

    // 3️⃣ Prevent duplicates
    const existing = await Subscriber.findOne({ email });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Email already subscribed",
      });
    }

    // 4️⃣ Get IP
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.socket.remoteAddress ||
      "";

    // 5️⃣ Get IP info
    let ipInfo = {};
    try {
      const { data } = await axios.get("https://ipapi.co/json/");
      ipInfo = data;
    } catch (err) {
      console.warn("IP API fetch failed:", err.message);
    }

    // 6️⃣ Save new subscriber
    const newSubscriber = new Subscriber({
      email,
      ip: ipInfo.ip || ip,
      city: ipInfo.city,
      region: ipInfo.region,
      country: ipInfo.country_name,
      postal: ipInfo.postal,
      latitude: ipInfo.latitude,
      longitude: ipInfo.longitude,
      timezone: ipInfo.timezone,
      org: ipInfo.org,
      subscribedAt: new Date(),
    });

    await newSubscriber.save();

    return res.status(200).json({
      success: true,
      message: "🎉 Subscribed successfully!",
      data: newSubscriber,
    });
  } catch (error) {
    console.error("Subscription error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error, try again later",
    });
  }
};

// GET /api/subscribe - Get all subscribers

const getAllSubscribers = async (req, res) => {
  try {
    const subscribers = await Subscriber.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: subscribers.length,
      data: subscribers,
    });
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscribers',
    });
  }
};

module.exports = { getAllSubscribers };


// PUT /api/subscribe/:id - Update subscriber email
const updateSubscriber = async (req, res) => {
    try {
        const { id } = req.params;
        const { email } = req.body;

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email address"
            });
        }

        // Check if email already exists (excluding current subscriber)
        const existingEmail = await subscriber.findOne({
            email,
            _id: { $ne: id }
        });

        if (existingEmail) {
            return res.status(400).json({
                success: false,
                message: "Email already subscribed"
            });
        }

        const updatedSubscriber = await subscriber.findByIdAndUpdate(
            id,
            {
                email,
                updatedAt: new Date()
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedSubscriber) {
            return res.status(404).json({
                success: false,
                message: "Subscription not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Subscription updated successfully",
            data: updatedSubscriber
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Failed to update subscription"
        });
    }
}

// DELETE /api/subscribe/:id - Delete subscriber
const deleteSubscriber = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedSubscriber = await Subscriber.findByIdAndDelete(id);

        if (!deletedSubscriber) {
            return res.status(404).json({
                success: false,
                message: "Subscription not found"
            });
        }

        return res.status(200).json({
            success: true, 
            message: "Subscription deleted successfully"
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Failed to delete subscription"
        });
    }
}

// GET /api/subscribe/stats - Get subscription statistics
const getSubscriptionStats = async (req, res) => {
    try {
        const totalSubscribers = await subscriber.countDocuments();

        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

        const newThisMonth = await subscriber.countDocuments({
            createdAt: { $gte: oneMonthAgo }
        });

        return res.status(200).json({
            success: true,
            data: {
                totalSubscribers,
                newThisMonth
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch subscription statistics"
        });
    }
}

module.exports = {
    subscribe,
    getAllSubscribers,
    updateSubscriber,
    deleteSubscriber,
    getSubscriptionStats
};