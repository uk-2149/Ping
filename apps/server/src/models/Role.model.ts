import mongoose from "mongoose";

const roleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  permissions: { type: mongoose.Schema.Types.Mixed }, // JSON / Bitfield
  serverId: { type: mongoose.Schema.Types.ObjectId, ref: "Server", required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "ServerMember" }],
}, { timestamps: true });

export default mongoose.model("Role", roleSchema);