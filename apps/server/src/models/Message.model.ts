import mongoose, { Document, Schema, Types } from "mongoose";

export interface IMessage extends Document {
    content: string;
    from: Types.ObjectId;
    to: Types.ObjectId;
    timeStamp: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    content: { type: String, required: true },
    from: { type: Schema.Types.ObjectId, ref: "User", required: true },
    to: { type: Schema.Types.ObjectId, ref: "User", required: true },
    timeStamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model<IMessage>("Message", messageSchema);