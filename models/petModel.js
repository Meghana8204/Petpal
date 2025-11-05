import mongoose from "mongoose";

const petSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: {
      type: String,
      enum: ["pet", "food", "toy"],
      required: true,
    },
    type: {
      type: String,
      enum: ["dog", "cat", "bird", "fish", "rabbit", "none"],
      default: "none",
    },
    description: { type: String },
    price: { type: Number, required: true },
    image: { type: String },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "Seller" },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    rejectionReason: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Pet", petSchema);
