import { Request, Response } from "express";
import ServerModel from "../models/Server.model";
import User from "../models/User.model";
import { verifyJWT } from "../utils/jwt";
import Role from "../models/Role.model";
import mongoose from "mongoose";

export const createServer = async (req: Request, res: Response) => {
    try {
    const { name, icon, description } = req.body;

    const token = req.cookies.token;
    const userid = verifyJWT(token, "access") as string;

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    const server = await ServerModel.create({
      name,
      icon,
      description,
      ownerid: userid,
      channels: [],
      members: [{ user: userid, roles: [], joinedAt: new Date() }],
      roles: [],
    });

    const creatorRole = await Role.create({
      name: "Creator",
      permissions: { ADMIN: true },
      serverid: server._id,
    });

    const memberIndex = server.members.findIndex(
      (m) => m.user.toString() === userid
    );
    if (memberIndex !== -1) {
      server.members[memberIndex].roles.push(creatorRole._id as mongoose.Types.ObjectId);
    }

    await User.findByIdAndUpdate(userid, {
      $addToSet: { servers: server._id },
    });

    return res.status(200).json({
      message: "Server created successfully",
      server,
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
}

export const getServers = async (req: Request, res: Response) => {
    const token = req.cookies.token;
    const userid = verifyJWT(token, "access") as string;
    const user = await User.findById(userid)
    .populate({
        path: "servers",
        select: "name icon description",
    });

    const servers = user?.servers;

    return res.status(200).json(servers);
}