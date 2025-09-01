import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  username: string;
  password: string;
  name: string;
  email: string;
  avatar?: string;
  status: "ONLINE" | "OFFLINE" | "AWAY" | "DO_NOT_DISTURB";
  lastSeen: Date;
  servers: mongoose.Types.ObjectId[];   // refs to ServerMember
  messages: mongoose.Types.ObjectId[];  // refs to Message
  friends: mongoose.Types.ObjectId[];   // refs to other User
  dmFriends: mongoose.Types.ObjectId[];  // refs to User
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
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
    lastSeen: { type: Date, default: Date.now },
    servers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Server" }],
    messages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }],
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], 
    dmFriends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], 
    // dmChannels: [{ type: mongoose.Schema.Types.ObjectId, ref: "DirectMessage" }],
  },
  { timestamps: true }
);

const User = mongoose.model<IUser>("User", userSchema);
export default User;
