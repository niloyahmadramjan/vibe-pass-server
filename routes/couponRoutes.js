// routes/coupon.js
const express = require("express");
const router = express.Router();
const { createCoupon, applyCoupon, getCoupons, deleteCoupon, updateCoupon } = require("../controllers/couponController");

// Admin creates a coupon
router.post("/add", createCoupon);

// User applies a coupon
router.post("/apply", applyCoupon);
// get coupons
router.get("/", getCoupons);
// delete Coupon
router.delete("/:id", deleteCoupon);
router.put("/:id",updateCoupon)

module.exports = router;
