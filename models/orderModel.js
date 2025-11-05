import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        pet: { type: mongoose.Schema.Types.ObjectId, ref: "Pet", required: true },
        quantity: { type: Number, default: 1 },
      },
    ],
    totalAmount: { type: Number, required: true },  // ✅ renamed from amount → totalAmount
    paymentStatus: { type: String, default: "pending" },
    orderStatus: {
      type: String,
      enum: ["Placed", "Processing", "Shipped", "Delivered"],
      default: "Placed",
    },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "Seller" },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
