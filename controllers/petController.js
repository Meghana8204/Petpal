import Pet from "../models/petModel.js";
import Seller from "../models/sellerModel.js";
import { sendEmail } from "../utils/sendEmail.js";

// 🧑‍💼 Seller Adds Pet/Food/Toy
export const addPet = async (req, res) => {
  try {
    const { name, category, type, price, description } = req.body;


    // Multer uploads the file to Cloudinary and stores path
   const imageUrl = req.file?.path || req.file?.secure_url || null;


    const pet = await Pet.create({
      name,
      category,
      type,
      price,
      description,
      image: imageUrl,
      seller: req.user._id,
      status: "pending",
    });

    res.status(201).json({
      message: "Item added successfully! Waiting for admin approval.",
      pet,
    });
  } catch (error) {
    res.status(500).json({ message: "Error adding item", error: error.message });
  }
};

// 👩‍💻 Admin: Approve/Reject Item
export const reviewPet = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, reason } = req.body;

    const pet = await Pet.findById(id).populate("seller");
    if (!pet) return res.status(404).json({ message: "Item not found" });

    if (action === "approve") {
      pet.status = "approved";
      pet.rejectionReason = "";

      // ✅ Send approval email to seller
      const approveMessage = `
        <h2>Hi ${pet.seller.name},</h2>
        <p>Your item "<strong>${pet.name}</strong>" has been <strong>approved</strong> by PetPal Admin 🎉</p>
        <p>It is now live and visible to users on the PetPal platform.</p>
        <br>
        <p>🐾 Warm regards,<br>PetPal Admin Team</p>
      `;

      await sendEmail(
        pet.seller.email,
        "🎉 PetPal Item Approved!",
        approveMessage
      );

    } else if (action === "reject") {
      pet.status = "rejected";
      pet.rejectionReason = reason || "Not approved by admin";

      // ❌ Send rejection email
      const rejectMessage = `
        <h2>Hi ${pet.seller.name},</h2>
        <p>We're sorry! Your item "<strong>${pet.name}</strong>" has been <strong>rejected</strong> by the PetPal Admin.</p>
        <p><b>Reason:</b> ${pet.rejectionReason}</p>
        <p>Please review and resubmit your listing with improvements.</p>
        <br>
        <p>🐾 Regards,<br>PetPal Admin Team</p>
      `;

      await sendEmail(
        pet.seller.email,
        "❌ PetPal Item Rejection Notice",
        rejectMessage
      );
    } else {
      return res.status(400).json({ message: "Invalid action" });
    }

    await pet.save();
    res.json({ message: `Item ${action}d successfully`, pet });
  } catch (error) {
    console.error("❌ Error reviewing item:", error.message);
    res.status(500).json({ message: "Error reviewing item", error: error.message });
  }
};

// 👤 User: Get Approved Items
export const getApprovedPets = async (req, res) => {
  try {
    const pets = await Pet.find({ status: "approved" }).populate("seller", "name");
    res.json(pets);
  } catch (error) {
    res.status(500).json({ message: "Error fetching approved items", error: error.message });
  }
};

// 🧑‍💼 Seller: Get Their Own Items
// 🧑‍💼 Seller: Get All Uploaded Pets (with status)
export const getSellerPets = async (req, res) => {
  try {
    const pets = await Pet.find({ seller: req.user._id })
      .select("name category price status rejectionReason image createdAt")
      .sort({ createdAt: -1 });

    if (!pets.length) {
      return res.status(200).json({ message: "No pets uploaded yet.", pets: [] });
    }

    res.status(200).json({
      success: true,
      count: pets.length,
      pets,
    });
  } catch (error) {
    console.error("❌ Error fetching seller pets:", error.message);
    res.status(500).json({
      success: false,
      message: "Error fetching seller items",
      error: error.message,
    });
  }
};
