import mongoose, { Document, Schema, Types } from "mongoose";

export interface IServerMember {
  user: Types.ObjectId;
  roles: Types.ObjectId[];
  joinedAt: Date;
}

export interface IServer extends Document {
  name: string;
  description?: string;
  icon?: string;
  ownerid: Types.ObjectId;
  channels: Types.ObjectId[];
  members: IServerMember[];
  roles: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date; 
}

const serverMemberSchema = new Schema<IServerMember>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  roles: [{ type: Schema.Types.ObjectId, ref: "Role" }],
  joinedAt: { type: Date, default: Date.now },
});

const serverSchema = new Schema<IServer>(
  {
    name: { type: String, required: true },
    icon: { type: String },
    description: { type: String },
    ownerid: { type: Schema.Types.ObjectId, ref: "User", required: true },
    channels: [{ type: Schema.Types.ObjectId, ref: "Channel" }],
    members: [serverMemberSchema],
    roles: [{ type: Schema.Types.ObjectId, ref: "Role" }],
  },
  { timestamps: true }
);

export default mongoose.model<IServer>("Server", serverSchema);
