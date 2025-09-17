import mongoose, { Document, Schema, Types } from "mongoose";

export interface IServerMessage extends Document {
  sender: Types.ObjectId; // user who sent
  channel: Types.ObjectId; // channel it belongs to
  server: Types.ObjectId; // server it belongs to
  content: string;
//   attachments?: string[]; // for images, files, etc.
  createdAt: Date;
  updatedAt: Date;
}

const serverMessageSchema = new Schema<IServerMessage>(
  {
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    channel: { type: Schema.Types.ObjectId, ref: "Channel", required: true },
    server: { type: Schema.Types.ObjectId, ref: "Server", required: true },
    content: { type: String, required: true },
    // attachments: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.model<IServerMessage>("ServerMessage", serverMessageSchema);
