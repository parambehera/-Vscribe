import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    title: { type: String, default: "Untitled" },
    content: { type: String, default: "" },
    owner: { type: String, ref: "User", required: true }, // matches User._id (string)
    collaborators: [
      {
        userId: { type: String, ref: "User", required: true },
        username: { type: String, required: true },
      }
    ],
    version: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Document", documentSchema);
