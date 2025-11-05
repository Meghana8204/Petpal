import jwt from "jsonwebtoken";
import Admin from "../models/adminModel.js";
import Seller from "../models/sellerModel.js";
import User from "../models/userModel.js";

export const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Not authorized, no token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user =
      (await Admin.findById(decoded.id).select("-password")) ||
      (await Seller.findById(decoded.id).select("-password")) ||
      (await User.findById(decoded.id).select("-password"));

    if (!req.user) return res.status(401).json({ message: "User not found" });
    next();
  } catch (error) {
    res.status(401).json({ message: "Token failed or expired" });
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") next();
  else res.status(403).json({ message: "Access denied. Admins only." });
};
