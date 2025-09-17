import { Request, Response } from "express";
import ServerModel from "../models/Server.model";
import { verifyJWT } from "../utils/jwt";

export const createServer = async (req: Request, res: Response) => {
    const { name, icon, description } = req.body;

    const token = req.cookies.token;
    const userid = verifyJWT(token, "access") as string;

    if(!name) {
        return res.status(400).json({ message: "Name is required" });
    }

    const server = await ServerModel.create({ 
        name,
        icon,
        description,
        ownerid: userid,
        channels: [],
        members: [],
        roles: []
     });
     await server.save();

    return res.status(200).json({ message: "Server created successfully", server });
}

export const getServers = async (req: Request, res: Response) => {
    const { id } = req.body;
    const servers = await ServerModel.findById(id);
    return res.status(200).json(servers);
}