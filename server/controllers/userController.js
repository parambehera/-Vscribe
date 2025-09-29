import asyncHandler from "../middlewares/asyncHandler.js";
import User from "../models/user.model.js";
import DocumentModel from "../models/Document.model.js";

// Set or create user data
export const setUserData = asyncHandler(async (req, res) => {
  const { email, firstName, lastName, userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "Missing userId in request body" });
  }

  // Check if user already exists
  let user = await User.findOne({ userId });

  if (!user) {
    user = new User({
      userId, // matches schema
      username: firstName + " " + lastName,
      email,
    });
    await user.save();
  }

  console.log("Profile route accessed:", userId);
  res.json({ message: "Profile route is working", user });
});

// Get all users + document owner
export const getAllUsers = asyncHandler(async (req, res) => {
  try {
    const { docId } = req.params;
    const document = await DocumentModel.findById(docId);

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    const users = await User.find({}, "username email userId"); // include userId
    res.json({ users, ownerId: document.owner });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error" });
  }
});
