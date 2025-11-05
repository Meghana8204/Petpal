import express from "express";
import {
  loginAdmin,
  createSeller,
  getPendingItems,
  getApprovedItems,
  getAllSellers,
  getAllUsers,
  getRejectedItems
} from "../controllers/adminController.js";
import { reviewPet } from "../controllers/petController.js"; // ✅ import review function
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// 🧑‍💻 Admin Login
router.post("/login", loginAdmin);

// 🧾 Admin Adds a New Seller
router.post("/create-seller", protect, adminOnly, createSeller);

// 📦 Admin Dashboard APIs
router.get("/pending", protect, adminOnly, getPendingItems);
router.get("/approved", protect, adminOnly, getApprovedItems);
router.get("/sellers", protect, adminOnly, getAllSellers);
router.get("/users", protect, adminOnly, getAllUsers);
router.get("/rejected", protect, adminOnly, getRejectedItems);


// ✅ Admin Approves or Rejects Pets
router.put("/review/:id", protect, adminOnly, reviewPet);

export default router;
