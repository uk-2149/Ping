import mongoose from "mongoose";

const channelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: {
    type: String,
    enum: ["TEXT", "VOICE", "VIDEO"],
    default: "TEXT",
  },
  serverId: { type: mongoose.Schema.Types.ObjectId, ref: "Server", required: true },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: "Channel" }, // subcategory
  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }],
  permissions: [{ type: mongoose.Schema.Types.ObjectId, ref: "ChannelPermission" }],
}, { timestamps: true });

export default mongoose.model("Channel", channelSchema);