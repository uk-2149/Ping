import { Request, Response } from "express";
import ServerModel from "../models/Server.model";
import User from "../models/User.model";
import { verifyJWT } from "../utils/jwt";
import Role from "../models/Role.model";
import ChannelModel from "../models/Channel.model";
import SubChannelModel from "../models/SubChannel.model";
import mongoose from "mongoose";
import redisClient from "../utils/redisClient";
import { sub } from "framer-motion/client";

// Create a new Server
export const createServer = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { name, icon, description } = req.body;

    const token = req.cookies.token;
    const userid = verifyJWT(token, "access") as string;

    if (!name) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Name is required" });
    }

    // Create base server
    const server = await ServerModel.create(
      [{
        name,
        icon,
        description,
        ownerid: userid,
        channels: [],
        members: [{ user: userid, roles: [], joinedAt: new Date() }],
        roles: [],
      }],
      { session }
    );

    const serverDoc = server[0]; // Because create() returns an array when session is passed

    // Create roles
    const [creatorRole, memberRole] = await Role.create(
      [
        {
          name: "Creator",
          permissions: { ADMIN: true },
          serverid: serverDoc._id,
          members: [userid],
        },
        {
          name: "Member",
          permissions: {
            ADMIN: false,
            MANAGE_CHANNELS: false,
            SEND_MESSAGES: true,
            CONNECT_VOICE: true,
            MANAGE_MEMBERS: false,
          },
          serverid: serverDoc._id,
          members: [],
        },
      ],
      { session, ordered: true }
    );

    serverDoc.roles.push(
      creatorRole._id as mongoose.Types.ObjectId,
      memberRole._id as mongoose.Types.ObjectId
    );

    // Assign creator role to user
    const memberIndex = serverDoc.members.findIndex(
      (m) => m.user.toString() === userid
    );
    if (memberIndex !== -1) {
      serverDoc.members[memberIndex].roles.push(
        creatorRole._id as mongoose.Types.ObjectId
      );
    }

    // Create channels and subchannels
    const channel = await ChannelModel.create(
      [
        {
          name: "General",
          description: "The main channel for the server",
          serverid: serverDoc._id,
          subChannels: [],
        },
      ],
      { session }
    );

    const channelDoc = channel[0];
    serverDoc.channels.push(channelDoc._id as mongoose.Types.ObjectId);

    const subchannel = await SubChannelModel.create(
      [
        {
          name: "General",
          type: "TEXT",
          serverid: serverDoc._id,
          parentid: channelDoc._id,
        },
      ],
      { session }
    );

    channelDoc.subChannels.push(subchannel[0]._id as mongoose.Types.ObjectId);

    await channelDoc.save({ session });
    await serverDoc.save({ session });

    // Add server reference to user
    await User.findByIdAndUpdate(
      userid,
      { $addToSet: { servers: serverDoc._id } },
      { session }
    );

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      message: "Server created successfully",
      server: serverDoc,
    });

  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    console.error("Transaction failed:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Get Server List associated with user
export const getServers = async (req: Request, res: Response) => {
    const token = req.cookies.token;
    const userid = verifyJWT(token, "access") as string;
    const user = await User.findById(userid)
    .populate("servers");

    const servers = user?.servers;

    return res.status(200).json(servers);
}

// Get all Roles with Members in the Server
export const getRoles = async (req: Request, res: Response) => {
  try {
    const { serverid } = req.params;

    // Get server with full member + user info
    const server = await ServerModel.findById(serverid)
      .populate("members.user", "name username avatar")
      .populate("roles");

    if (!server) {
      return res.status(404).json({ message: "Server not found" });
    }

    // For each role, find members that have that role assigned
    const rolesWithMembers = server.roles.map((role: any) => {
      const roleMembers = server.members
        .filter((m) =>
          m.roles.some((r) => r.toString() === role._id.toString())
        )
        .map((m) => m.user);

      return {
        _id: role._id,
        name: role.name,
        permissions: role.permissions,
        members: roleMembers,
      };
    });

    return res.status(200).json(rolesWithMembers);
  } catch (error) {
    console.error("Error getting roles:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Create new Channel
export const CreateChannel = async (req: Request, res: Response) => {
  try {
    const { serverid } = req.params;
    const { name, description } = req.body;

    const server = await ServerModel.findById(serverid);
    if (!server) {
      return res.status(404).json({ message: "Server not found" });
    }

    const channel = await ChannelModel.create({
      name,
      description,
      serverid,
      subChannels: [],
    });

    server.channels.push(channel._id as mongoose.Types.ObjectId);
    await server.save();

    return res.status(200).json({ message: "Channel created successfully", channel: { _id: channel._id, name: channel.name, subChannels: [], description: channel.description } });
  } catch (error) {
    console.error("Error creating channel:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// Create New SubChannel
export const CreateSubChannel = async (req: Request, res: Response ) => {
  try {
    const { serverid, channelid } = req.query;
    const { name, type, permissions } = req.body;

    const channel = await ChannelModel.findById(channelid);
    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    const subChannel = await SubChannelModel.create({
      name,
      type,
      serverid: serverid,
      parentid: channelid,
      permissions,
    });

    channel.subChannels.push(subChannel._id as mongoose.Types.ObjectId);
    await channel.save();

    return res.status(200).json({ message: "SubChannel created successfully" });
  } catch (error) {
    console.error("Error creating subchannel:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// Get all channels with subchannels in a server
export const getChannels = async (req: Request, res: Response) => {
  try {
    const { serverid } = req.params;

    const server = await ServerModel.findById(serverid)
      .populate({
        path: "channels",
        populate: {
          path: "subChannels",
          model: "SubChannel",
        },
      });


    if (!server) {
      return res.status(404).json({ message: "Server not found" });
    }

    const channels = server.channels.map((channel: any) => ({
      _id: channel._id,
      name: channel.name,
      description: channel.description,
      subChannels: channel.subChannels.map((subChannel: any) => ({
        _id: subChannel._id,
        name: subChannel.name,
        type: subChannel.type,
      })),
    }));

    return res.status(200).json(channels);
    
  } catch (error) {
    console.error("Error getting channels:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// User's roles in server
export const getUserPermissions = async (req: Request, res: Response) => {
  try {
    const { serverid, userid } = req.params;

    const server = await ServerModel.findById(serverid).populate("members").populate("roles");

    if (!server) {
      return res.status(404).json({ message: "Server not found"});
    }

    const user = server.members.find((member: any) => member.user.toString() === userid);

    if (!user) {
      return res.status(404).json({ message: "User not found in server" });
    }

    const userRole = server.roles.find((role: any) => role._id.toString() === user.roles[0].toString());

    return res.status(200).json(userRole);
  } catch (error) {
    console.error("Error getting user role:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// Server Invite
export const getServerInvite = async (req: Request, res: Response) => {
  try {
    const { serverid, inviteId } = req.params;

    redisClient.set(`serverInvite:${inviteId}`, serverid, { EX: 86400 }); // Set invite in Redis for 24 hrs

    return res.status(200).json({ message: "Invite set successfully" });
  } catch (error) {
    console.error("Error getting server invite:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// Search for server invite
export const searchServerInvite = async (req: Request, res: Response) => {
  try {
    const { inviteId } = req.params;

    const invite = await redisClient.get(`serverInvite:${inviteId}`);

    const server = await ServerModel.findById(invite);

    if (!invite) {
      return res.status(404).json({ message: "Invite not found" });
    }

    return res.status(200).json({ message: "Invite found successfully", server: server });
  } catch (error) {
    console.error("Error searching for invite:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export const acceptInvite = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { inviteId } = req.params;
    const token = req.cookies.token;
    const userid = verifyJWT(token, "access") as string;

    const invite = await redisClient.get(`serverInvite:${inviteId}`);
    if (!invite) {
      return res.status(404).json({ message: "Invite not found or expired" });
    }

    const server = await ServerModel.findById(invite).populate("roles").session(session);
    if (!server) {
      return res.status(404).json({ message: "Server not found" });
    }

    const user = await User.findById(userid).session(session);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.servers.includes(server._id as mongoose.Types.ObjectId)) {
      return res.status(400).json({ message: "User already in server" });
    }

    const memberRole = server.roles.find((role: any) => role.name === "Member");
    if (!memberRole) {
      return res.status(404).json({ message: "Member role not found" });
    }

    // Update role, server, and user atomically
    await Role.findByIdAndUpdate(
      memberRole._id,
      { $push: { members: user._id } },
      { session }
    );

    server.members.push({
      user: user._id as mongoose.Types.ObjectId,
      roles: [memberRole._id],
      joinedAt: new Date(),
    });
    await server.save({ session });

    user.servers.push(server._id as mongoose.Types.ObjectId);
    await user.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      message: "Invite accepted successfully",
      server,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error("Error accepting invite:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};