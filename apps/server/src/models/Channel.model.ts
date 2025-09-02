import mongoose, { Document, Schema } from "mongoose";

export interface IChannel extends Document {
  name: string;
  type: "TEXT" | "VOICE" | "VidEO";
  serverid: mongoose.Types.ObjectId;
  parentid?: mongoose.Types.ObjectId;
  messages: mongoose.Types.ObjectId[];
  permissions: mongoose.Types.ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
}

const channelSchema = new Schema<IChannel>(
  {
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ["TEXT", "VOICE", "VidEO"],
      default: "TEXT",
    },
    serverid: { type: Schema.Types.ObjectId, ref: "Server", required: true },
    parentid: { type: Schema.Types.ObjectId, ref: "Channel" },
    messages: [{ type: Schema.Types.ObjectId, ref: "Message" }],
    permissions: [{ type: Schema.Types.ObjectId, ref: "ChannelPermission" }],
  },
  { timestamps: true }
);

export default mongoose.model<IChannel>("Channel", channelSchema);
