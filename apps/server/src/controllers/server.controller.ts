import { Request, Response } from "express";
import ServerModel from "../models/Server.model";
import User from "../models/User.model";
import { verifyJWT } from "../utils/jwt";
import Role from "../models/Role.model";
import ChannelModel from "../models/Channel.model";
import mongoose from "mongoose";

// Create New Server
export const createServer = async (req: Request, res: Response) => {
  try {
    const { name, icon, description } = req.body;

    const token = req.cookies.token;
    const userid = verifyJWT(token, "access") as string;

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    // Step 1: Create the base server
    const server = await ServerModel.create({
      name,
      icon,
      description,
      ownerid: userid,
      channels: [],
      members: [{ user: userid, roles: [], joinedAt: new Date() }],
      roles: [],
    });

    // Step 2: Create the roles
    const creatorRole = await Role.create({
      name: "Creator",
      permissions: { ADMIN: true },
      serverid: server._id,
      members: [userid],
    });

    const memberRole = await Role.create({
      name: "Member",
      permissions: {
        ADMIN: false,
        MANAGE_CHANNELS: false,
        SEND_MESSAGES: true,
        CONNECT_VOICE: true,
      },
      serverid: server._id,
      members: [],
    });

    // Step 3: Add roles to server
    server.roles.push(creatorRole._id as mongoose.Types.ObjectId, memberRole._id as mongoose.Types.ObjectId);

    // Step 4: Assign the creator role to the user
    const memberIndex = server.members.findIndex(
      (m) => m.user.toString() === userid
    );
    if (memberIndex !== -1) {
      server.members[memberIndex].roles.push(creatorRole._id as mongoose.Types.ObjectId);
    }

    // Step 5: Save the updated server
    await server.save();

    // Step 6: Add server reference to user
    await User.findByIdAndUpdate(userid, {
      $addToSet: { servers: server._id },
    });

    return res.status(200).json({
      message: "Server created successfully",
      server,
    });
  } catch (error: any) {
    console.error(error);
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
        .map((m) => m.user); // Already populated (has name, username, avatar)

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

    return res.status(200).json({ message: "Channel created successfully" });
  } catch (error) {
    console.error("Error creating channel:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}