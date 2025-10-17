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
router.get("/", verifyToken, adminOnly, getCoupons);
// delete Coupon
router.delete("/:id", verifyToken, deleteCoupon);
router.put("/:id", verifyToken,updateCoupon)

module.exports = router;



// const express = require("express");
// const router = express.Router();
// const {
//   createCoupon,
//   applyCoupon,
//   getCoupons,
//   deleteCoupon,
//   updateCoupon
// } = require("../controllers/couponController");

// // const adminOnly = require('../middlewares/adminOnly');
// // const verifyToken = require("../middlewares/verifyToken");

// // 👉 Make all coupon routes public for now

// // Create Coupon (POST)
// router.post("/add", createCoupon);

// // Apply Coupon (POST)
// router.post("/apply", applyCoupon);

// // Get All Coupons (GET)
// router.get("/", getCoupons);

// // Delete Coupon (DELETE)
// router.delete("/:id", deleteCoupon);

// // Update Coupon (PUT)
// router.put("/:id", updateCoupon);

// module.exports = router;
