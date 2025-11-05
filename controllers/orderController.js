// controllers/orderController.js
import Order from "../models/orderModel.js";
import Cart from "../models/cartModel.js";
import Pet from "../models/petModel.js";
import User from "../models/userModel.js";
import Seller from "../models/sellerModel.js";
import { sendEmail } from "../utils/sendEmail.js";

/**
 * Place Order
 * - create order from cart
 * - clear cart
 * - send email to user (order placed)
 * - send email to seller (new order)
 */
export const placeOrder = async (req, res) => {
  try {
    const userId = req.user._id;

    const cart = await Cart.findOne({ user: userId }).populate("items.pet");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Your cart is empty" });
    }

    const totalAmount = cart.items.reduce(
      (sum, item) => sum + item.pet.price * item.quantity,
      0
    );

    // For now use first item's seller as seller owner (if multi-seller orders are supported later, change structure)
    const sellerId = cart.items[0].pet.seller;

    const order = await Order.create({
      user: userId,
      items: cart.items.map((i) => ({ pet: i.pet._id, quantity: i.quantity })),
      totalAmount,
      seller: sellerId,
      orderStatus: "Placed",
    });

    // Clear cart
    await Cart.findOneAndDelete({ user: userId });

    // Populate order for email content
    const populatedOrder = await Order.findById(order._id)
      .populate("items.pet", "name price image")
      .populate("user", "name email")
      .populate("seller", "name shopName email");

    // --- Send email to user (order confirmation) ---
    try {
      const user = populatedOrder.user;
      const userEmail = user.email;
      const userName = user.name || "PetPal User";

      const itemsHtml = populatedOrder.items
        .map(
          (it) =>
            `<li>${it.pet.name} — Qty: ${it.quantity} — ₹${it.pet.price}</li>`
        )
        .join("");

      const userHtml = `
        <h2>Hi ${userName},</h2>
        <p>Thank you — your order <strong>${populatedOrder._id}</strong> has been placed successfully!</p>
        <p><strong>Total:</strong> ₹${populatedOrder.totalAmount}</p>
        <p><strong>Items:</strong></p>
        <ul>${itemsHtml}</ul>
        <p>You can track your order in <strong>My Orders</strong> on PetPal.</p>
        <br>
        <p>🐾 Regards,<br>PetPal Team</p>
      `;

      await sendEmail(userEmail, "✅ Your PetPal Order is Placed!", userHtml);
      console.log(`📧 Order placed email sent to user: ${userEmail}`);
    } catch (err) {
      console.error("❌ Failed to send order email to user:", err.message);
    }

    // --- Send email to seller (new order notification) ---
    try {
      const seller = await Seller.findById(sellerId).select("name email shopName");
      if (seller && seller.email) {
        const sellerName = seller.name || seller.shopName || "Seller";

        const sellerItemsHtml = populatedOrder.items
          .map(
            (it) =>
              `<li>${it.pet.name} — Qty: ${it.quantity} — ₹${it.pet.price}</li>`
          )
          .join("");

        const sellerHtml = `
          <h2>Hi ${sellerName},</h2>
          <p>You have a <strong>new order</strong> on PetPal: <strong>${populatedOrder._id}</strong>.</p>
          <p><strong>Total:</strong> ₹${populatedOrder.totalAmount}</p>
          <p><strong>Items to fulfill:</strong></p>
          <ul>${sellerItemsHtml}</ul>
          <p>Please visit your Seller Dashboard to process this order.</p>
          <br>
          <p>🐾 Regards,<br>PetPal Admin Team</p>
        `;

        await sendEmail(seller.email, "🛒 New PetPal Order Received", sellerHtml);
        console.log(`📧 New order email sent to seller: ${seller.email}`);
      }
    } catch (err) {
      console.error("❌ Failed to send order email to seller:", err.message);
    }

    res.status(201).json({
      success: true,
      message: "Order placed successfully 🎉",
      order: populatedOrder,
    });
  } catch (error) {
    console.error("❌ placeOrder error:", error.message);
    res.status(500).json({ message: "Error placing order", error: error.message });
  }
};

/**
 * Seller: Get orders for their products
 */
export const getSellerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ seller: req.user._id })
      .populate("items.pet", "name price image")
      .populate("user", "name email");
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ message: "Error fetching seller orders", error: error.message });
  }
};

/**
 * User: Get my orders
 */
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("items.pet", "name price image")
      .populate("seller", "shopName");
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders", error: error.message });
  }
};

/**
 * Seller (or admin): Update order status
 * - on status change, send email to user notifying them
 */
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findById(id).populate("user", "name email");
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.orderStatus = status;
    await order.save();

    // Send email to user about status update (non-blocking)
    try {
      const user = order.user;
      const userEmail = user.email;
      const userName = user.name || "PetPal User";

      const statusHtml = `
        <h2>Hi ${userName},</h2>
        <p>Your order <strong>${order._id}</strong> status has been updated to:</p>
        <h3>${status}</h3>
        <p>You can track further updates in <strong>My Orders</strong>.</p>
        <br>
        <p>🐾 Regards,<br>PetPal Team</p>
      `;
      await sendEmail(userEmail, `📦 Your Order is now: ${status}`, statusHtml);
      console.log(`📧 Order status email sent to user: ${userEmail}`);
    } catch (err) {
      console.error("❌ Failed to send order status email to user:", err.message);
    }

    res.json({ success: true, message: "Order status updated", order });
  } catch (error) {
    res.status(500).json({ message: "Error updating order", error: error.message });
  }
};
