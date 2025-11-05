import mongoose from "mongoose";

const sellerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    shopName: { type: String },
    role: { type: String, default: "seller" },
  },
  { timestamps: true }
);

export default mongoose.model("Seller", sellerSchema);
