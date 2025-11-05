import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  placeOrder,
  updateOrderStatus,
  getUserOrders,
  getSellerOrders,
} from "../controllers/orderController.js";

const router = express.Router();

/**
 * 👤 USER ROUTES
 */

// 🛍️ Place a new order (from cart)
router.post("/place", protect, placeOrder);

// 📦 View all my orders
router.get("/my-orders", protect, getUserOrders);


/**
 * 🧑‍💼 SELLER ROUTES
 */

// 🧾 View all orders that belong to this seller’s pets
router.get("/seller-orders", protect, getSellerOrders);

// 🔄 Update order status (Processing → Shipped → Delivered)
router.put("/update/:id", protect, updateOrderStatus);


export default router;
