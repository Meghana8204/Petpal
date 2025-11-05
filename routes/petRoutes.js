import express from "express";
import {
  addPet,
  reviewPet,
  getApprovedPets,
  getSellerPets,
} from "../controllers/petController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import { upload } from "../config/cloudinary.js";

const router = express.Router();

// 🧑‍💼 Seller Adds Pet/Food/Toy (with image upload)
router.post("/add", protect, upload.single("image"), addPet);

// 👩‍💻 Admin Reviews (Approve/Reject)
router.put("/review/:id", protect, adminOnly, reviewPet);

// 👤 User Fetches Approved Items
router.get("/approved", getApprovedPets);

// 🧑‍💼 Seller Fetches Their Own Items
router.get("/my-items", protect, getSellerPets);

export default router;
