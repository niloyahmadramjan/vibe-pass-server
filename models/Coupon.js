// models/Coupon.js
const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
    },
    discountType: {
        type: String,
        enum: ["percentage", "fixed"], // % discount or fixed amount
        default: "fixed",
    },
    discountValue: {
        type: Number,
        required: true,
    },
    minAmount: {
        type: Number,
        default: 0, // minimum booking amount to apply coupon
    },
    expiryDate: {
        type: Date,
        required: true,
    },
    usageLimit: {
        type: Number,
        default: 1, // number of times coupon can be used
    },
    usedCount: {
        type: Number,
        default: 0,
    },
    active: { type: Boolean, default: true },
    active: {
        type: Boolean,
        default: true,
    },
    description:{
        type:String,
        default:true
    }
    
}, { timestamps: true });

module.exports = mongoose.model("Coupon", couponSchema);
