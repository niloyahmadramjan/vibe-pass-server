const Coupon = require("../models/Coupon");

// Create coupon
const createCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.create(req.body);
        res.status(201).json({ success: true, coupon });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Failed to create coupon" });
    }
};



const applyCoupon = async (req, res) => {
    const { code, totalAmount } = req.body;
    
    try {
        const coupon = await Coupon.findOne({ code, active: true });
        
        if (!coupon) {
            return res.status(404).json({ 
                success: false, 
                error: "Invalid coupon code" // ✅ Changed from 'message' to 'error'
            });
        }
        
        if (coupon.expiryDate < new Date()) {
            return res.status(400).json({ 
                success: false, 
                error: "Coupon has expired" 
            });
        }
        
        if (coupon.usedCount >= coupon.usageLimit) {
            return res.status(400).json({ 
                success: false, 
                error: "Coupon usage limit reached" 
            });
        }
        
        if (totalAmount < coupon.minAmount) {
            return res.status(400).json({ 
                success: false, 
                error: `Minimum amount ৳${coupon.minAmount} required` 
            });
        }

        let discount = 0;
        if (coupon.discountType === "percentage") {
            discount = (totalAmount * coupon.discountValue) / 100;
        } else {
            discount = coupon.discountValue;
        }

        const finalAmount = totalAmount - discount; // ✅ Calculate final amount

        res.status(200).json({ 
            success: true, 
            discount,
            finalAmount, // ✅ Added
            couponCode: coupon.code // ✅ Added
        });
    } catch (err) {
        console.error("Apply Coupon Error:", err);
        res.status(500).json({ 
            success: false, 
            error: "Failed to apply coupon" // ✅ Changed from 'message'
        });
    }
};

// get all Coupons
const getCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find();
        res.status(200).json(coupons);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch coupons" });
    }
};
// delete coupon
const deleteCoupon = async (req, res) => {
    try {
        await Coupon.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Coupon deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Failed to delete coupon" });
    }
};




//  Update Coupon
const updateCoupon = async (req, res) => {
    try {
        const { id } = req.params; // id come from coupon URl
        const updatedCoupon = await Coupon.findByIdAndUpdate(id, req.body, {
            new: true,          // updated document return 
            runValidators: true // start schema validation 
        });

        if (!updatedCoupon) {
            return res.status(404).json({ message: "Coupon not found" });
        }

        res.status(200).json({
            message: "Coupon updated successfully",
            coupon: updatedCoupon
        });
    } catch (error) {
        console.error("Update Coupon Error:", error);
        res.status(500).json({ message: "Failed to update coupon" });
    }
};


module.exports = { createCoupon, applyCoupon, getCoupons, deleteCoupon,updateCoupon}
