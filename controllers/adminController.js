import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "../models/adminModel.js";
import Seller from "../models/sellerModel.js";
import User from "../models/userModel.js";
import Pet from "../models/petModel.js";

// ✅ Admin Login
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ message: "Admin not found" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    res.json({
      success: true,
      message: "Admin logged in successfully",
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      token: generateToken(admin._id),
    });
  } catch (error) {
    console.error("❌ Admin Login Error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 🧾 Admin Adds a New Seller
export const createSeller = async (req, res) => {
  try {
    const { name, email, password, shopName } = req.body;

    const existing = await Seller.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Seller already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const seller = await Seller.create({
      name,
      email,
      password: hashedPassword,
      shopName,
    });

    res.status(201).json({
      success: true,
      message: "Seller created successfully",
      seller,
    });
  } catch (error) {
    console.error("❌ Error creating seller:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 👩‍💻 Admin: Get All Pending Items (Waiting for Approval)
export const getPendingItems = async (req, res) => {
  try {
    const pendingPets = await Pet.find({ status: "pending" }).populate(
      "seller",
      "name email"
    );

    res.status(200).json({
      success: true,
      count: pendingPets.length,
      pendingPets,
    });
  } catch (error) {
    console.error("❌ Error fetching pending items:", error.message);
    res
      .status(500)
      .json({ message: "Error fetching pending items", error: error.message });
  }
};

// 👩‍💻 Admin: Get All Approved Items
export const getApprovedItems = async (req, res) => {
  try {
    const approvedPets = await Pet.find({ status: "approved" }).populate(
      "seller",
      "name email"
    );

    res.status(200).json({
      success: true,
      count: approvedPets.length,
      approvedPets,
    });
  } catch (error) {
    console.error("❌ Error fetching approved items:", error.message);
    res
      .status(500)
      .json({ message: "Error fetching approved items", error: error.message });
  }
};

// 👩‍💻 Admin: Get All Sellers
export const getAllSellers = async (req, res) => {
  try {
    const sellers = await Seller.find().select("-password");

    res.status(200).json({
      success: true,
      count: sellers.length,
      sellers,
    });
  } catch (error) {
    console.error("❌ Error fetching sellers:", error.message);
    res
      .status(500)
      .json({ message: "Error fetching sellers", error: error.message });
  }
};

// 👩‍💻 Admin: Get All Users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("❌ Error fetching users:", error.message);
    res
      .status(500)
      .json({ message: "Error fetching users", error: error.message });
  }
};

// 🔐 Token Generator
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// 🧩 Admin: Get Rejected Items
export const getRejectedItems = async (req, res) => {
  try {
    const rejectedPets = await Pet.find({ status: "rejected" }).populate("seller", "name email");
    res.status(200).json({
      success: true,
      count: rejectedPets.length,
      rejectedPets,
    });
  } catch (error) {
    console.error("❌ Error fetching rejected items:", error.message);
    res.status(500).json({ message: "Error fetching rejected items", error: error.message });
  }
};
