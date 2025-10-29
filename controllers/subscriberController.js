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

    // 4️⃣ Get User's Real IP (Fixed)
    const getClientIP = (req) => {
      const headers = [
        'x-client-ip',           // Custom header
        'x-forwarded-for',       // Load balancers, proxies
        'cf-connecting-ip',      // Cloudflare
        'fastly-client-ip',      // Fastly
        'x-real-ip',            // Nginx
        'x-cluster-client-ip',  // Rackspace LB, Riverbed Stingray
        'x-forwarded',          // Squid
        'forwarded-for',        // Standard header
        'forwarded'             // Standard header
      ];

      // Check headers in order
      for (const header of headers) {
        const value = req.headers[header];
        if (value) {
          if (header === 'x-forwarded-for' || header === 'forwarded-for') {
            return value.split(',')[0].trim();
          }
          return value;
        }
      }

      // Fallback to connection info
      return (
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket?.remoteAddress ||
        'Unknown'
      ).replace('::ffff:', '');
    };

    const ip = getClientIP(req);
    console.log('🔍 Detected User IP:', ip);

    // 5️⃣ Get IP info for USER'S IP (Fixed)
    let ipInfo = {};
    try {
      const token = process.env.IPINFOTOKEN;
      
      if (ip && ip !== 'Unknown' && ip !== '127.0.0.1' && !ip.startsWith('::')) {
        // Get location for user's actual IP
        const { data } = await axios.get(`https://ipinfo.io/${ip}?token=${token}`);
        ipInfo = data;
        console.log('📍 User Location from IP:', {
          ip: data.ip,
          city: data.city,
          region: data.region,
          country: data.country,
          org: data.org
        });
      } else {
        // Fallback: Get location from request origin
        const { data } = await axios.get(`https://ipinfo.io/json?token=${token}`);
        ipInfo = data;
        console.log('📍 Fallback Location (Request Origin):', {
          ip: data.ip,
          city: data.city,
          region: data.region,
          country: data.country
        });
      }
    } catch (err) {
      console.warn("IPInfo API fetch failed:", err.message);
      ipInfo = { ip: ip };
    }

    // Split latitude & longitude from loc field ("lat,lon")
    let latitude = null;
    let longitude = null;
    if (ipInfo.loc) {
      const [lat, lon] = ipInfo.loc.split(",");
      latitude = parseFloat(lat);
      longitude = parseFloat(lon);
    }

    // Save subscriber data
    const newSubscriber = new Subscriber({
      email,
      ip: ipInfo.ip || ip,
      city: ipInfo.city || 'Unknown',
      region: ipInfo.region || 'Unknown',
      country: ipInfo.country || 'Unknown',       
      postal: ipInfo.postal || '',
      latitude,
      longitude,
      timezone: ipInfo.timezone || 'Unknown',
      org: ipInfo.org || 'Unknown ISP',
      subscribedAt: new Date(),
    });

    await newSubscriber.save();

    console.log('✅ Subscriber saved with location:', {
      email: email,
      ip: ipInfo.ip || ip,
      location: `${ipInfo.city || 'Unknown'}, ${ipInfo.region || 'Unknown'}, ${ipInfo.country || 'Unknown'}`
    });

    return res.status(200).json({
      success: true,
      message: "🎉 Subscribed successfully!",
      data: {
        email: newSubscriber.email,
        location: {
          city: newSubscriber.city,
          region: newSubscriber.region,
          country: newSubscriber.country
        },
        subscribedAt: newSubscriber.subscribedAt
      },
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
    console.error("Error fetching subscribers:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch subscribers",
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
        message: "Invalid email address",
      });
    }

    // Check if email already exists (excluding current subscriber)
    const existingEmail = await subscriber.findOne({
      email,
      _id: { $ne: id },
    });

    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: "Email already subscribed",
      });
    }

    const updatedSubscriber = await subscriber.findByIdAndUpdate(
      id,
      {
        email,
        updatedAt: new Date(),
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedSubscriber) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Subscription updated successfully",
      data: updatedSubscriber,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to update subscription",
    });
  }
};

// ✅ DELETE /api/subscribe/:id - Delete subscriber
const deleteSubscriber = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedSubscriber = await Subscriber.findByIdAndDelete(id);

    if (!deletedSubscriber) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Subscription deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete subscription",
    });
  }
};

// ✅ GET /api/subscribe/stats - Get subscription statistics
const getSubscriptionStats = async (req, res) => {
  try {
    const totalSubscribers = await subscriber.countDocuments();

    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const newThisMonth = await subscriber.countDocuments({
      createdAt: { $gte: oneMonthAgo },
    });

    return res.status(200).json({
      success: true,
      data: {
        totalSubscribers,
        newThisMonth,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch subscription statistics",
    });
  }
};

module.exports = {
  subscribe,
  getAllSubscribers,
  updateSubscriber,
  deleteSubscriber,
  getSubscriptionStats,
};
