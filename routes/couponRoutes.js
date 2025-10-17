// routes/coupon.js
const express = require("express");
const router = express.Router();
const { createCoupon, applyCoupon, getCoupons, deleteCoupon, updateCoupon } = require("../controllers/couponController");
const adminOnly = require('../middlewares/adminOnly');
const verifyToken =require("../middlewares/verifyToken")
// Admin creates a coupon
router.post("/add", verifyToken, adminOnly, createCoupon);

// User applies a coupon..........................................................
router.post("/apply",verifyToken, applyCoupon);
// get coupons
router.get("/", getCoupons);
// delete Coupon
router.delete("/:id", verifyToken, deleteCoupon);
router.put("/:id", verifyToken,updateCoupon)

module.exports = router;
