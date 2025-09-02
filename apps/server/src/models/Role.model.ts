import mongoose, { Document, Schema, Model } from "mongoose";

export interface IRole extends Document {
  name: string;
  permissions: Record<string, any>;
  serverid: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Define Role schema
const roleSchema = new Schema<IRole>(
  {
    name: { type: String, required: true },
    permissions: { type: Schema.Types.Mixed }, // can refine to enum/bitfield later
    serverid: { type: Schema.Types.ObjectId, ref: "Server", required: true },
    // members: [{ type: Schema.Types.Objectid, ref: "ServerMember" }],
  },
  { timestamps: true }
);

const Role: Model<IRole> = mongoose.model<IRole>("Role", roleSchema);

export default Role;
