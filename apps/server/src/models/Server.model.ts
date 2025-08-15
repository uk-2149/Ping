import mongoose from "mongoose";

const serverSchema = new mongoose.Schema({
  name: { type: String, required: true },
  icon: { type: String },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  channels: [{ type: mongoose.Schema.Types.ObjectId, ref: "Channel" }],
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "ServerMember" }],
  roles: [{ type: mongoose.Schema.Types.ObjectId, ref: "Role" }],
}, { timestamps: true });

export default mongoose.model("Server", serverSchema);
