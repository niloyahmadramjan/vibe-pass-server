// controllers/subscriptionController.js
const subscriber = require("../models/Subscriber");

// POST /api/subscribe - Create new subscription
const subscribe = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email address"
            });
        }

        // Check if already subscribed
        const existing = await subscriber.findOne({ email });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: "Email already subscribed"
            });
        }

        const subscriber = new subscribeubscriber({ email });
        await subscriber.save();

        return res.status(200).json({
            success: true,
            message: "Subscribed successfully",
            data: subscriber
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Server error, try again later"
        });
    }
}

// GET /api/subscribe - Get all subscribers
const getAllSubscribers = async (req, res) => {
    try {
        const subscribers = await subscriber.find()
            .sort({ createdAt: -1 })
            .select('email createdAt updatedAt');

        return res.status(200).json({
            success: true,
            data: subscribers
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch subscribers"
        });
    }
}

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