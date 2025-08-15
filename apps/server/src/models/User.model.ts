import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, default: "not set" },
  password: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  avatar: { type: String },
  status: {
    type: String,
    enum: ["ONLINE", "OFFLINE", "AWAY", "DO_NOT_DISTURB"],
    default: "OFFLINE",
  },
  isVerified: { type: Boolean, default: false },
  servers: [{ type: mongoose.Schema.Types.ObjectId, ref: "ServerMember" }],
  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }],
//   dmChannels: [{ type: mongoose.Schema.Types.ObjectId, ref: "DirectMessage" }],
}, { timestamps: true });

export default mongoose.model("User", userSchema);
