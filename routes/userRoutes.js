import express from "express";
import { registerUser, loginUser } from "../controllers/userController.js";

const router = express.Router();

// 📝 Register a new user (user/seller/admin)
router.post("/register", registerUser);

// 🔐 Login (returns JWT + role)
router.post("/login", loginUser);

// ✅ Test route
router.get("/", (req, res) => {
  res.json({ message: "User route working 🐶" });
});

export default router;
