import bcrypt from "bcryptjs";
import Admin from "../models/adminModel.js";
import dotenv from "dotenv";
import connectDB from "../config/db.js";

dotenv.config();
connectDB();

export const seedAdmin = async () => {   // ✅ Exported correctly
  try {
    const adminEmail = process.env.ADMIN_EMAIL || "admin@petpal.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

    const existingAdmin = await Admin.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log("🟢 Admin already exists:", existingAdmin.email);
      return;
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const admin = await Admin.create({
      name: "Super Admin",
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
    });

    console.log("✅ Admin seeded successfully!");
    console.log("📧 Email:", admin.email);
    console.log("🔑 Password:", adminPassword);
  } catch (error) {
    console.error("❌ Error seeding admin:", error.message);
  }
};
