import express from "express";
import { getSellerPets } from "../controllers/petController.js";
import { protect } from "../middleware/authMiddleware.js";
import { loginSeller } from "../controllers/sellerController.js";

const router = express.Router();

// 🔐 Seller Login
router.post("/login", loginSeller);
router.get("/my-pets", protect, getSellerPets);

// ✅ Test route
router.get("/", (req, res) => {
  res.json({ message: "Seller route working 🧑‍💼" });
});

export default router;
