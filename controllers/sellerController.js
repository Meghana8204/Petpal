import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Seller from "../models/sellerModel.js";

// ✅ Seller Login
export const loginSeller = async (req, res) => {
  try {
    const { email, password } = req.body;

    // check if seller exists
    const seller = await Seller.findOne({ email });
    if (!seller) {
      return res.status(400).json({ message: "Seller not found" });
    }

    // verify password
    const isMatch = await bcrypt.compare(password, seller.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // generate JWT token
    const token = jwt.sign({ id: seller._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    // send response
    res.json({
      _id: seller._id,
      name: seller.name,
      email: seller.email,
      role: seller.role,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
