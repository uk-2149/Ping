import { Request, Response } from "express";
import MessageModel from "../models/Message.model";
import User from "../models/User.model";

// Extend Express Request type to include 'user'
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        // add other properties if needed
      };
    }
  }
}

export const getChats = async (req: Request, res: Response): Promise<any> => {
  try {
    const currentUserid = req.user?.id; 
    const otherUserid = req.params.userid || req.query.userid || req.body.userid;
    
    // Pagination parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    if (!currentUserid || !otherUserid) {
      return res.status(400).json({ error: "Missing userid(s)" });
    }

    let otherUserObjid = otherUserid;
    if (otherUserid.length < 24) {
      const user = await User.findOne({ username: otherUserid });
      if (!user) return res.status(404).json({ error: "User not found" });
      otherUserObjid = user._id;
    }

    // Get total count for pagination info
    const totalMessages = await MessageModel.countDocuments({
      $or: [
        { from: currentUserid, to: otherUserObjid },
        { from: otherUserObjid, to: currentUserid },
      ],
    });

    // Find messages with pagination
    const messages = await MessageModel.find({
      $or: [
        { from: currentUserid, to: otherUserObjid },
        { from: otherUserObjid, to: currentUserid },
      ],
    })
    .sort({ timeStamp: -1 }) // Most recent first
    .skip(skip)
    .limit(limit)
    .sort({ timeStamp: 1 }); // Then reverse for chronological order

    return res.json({ 
      messages,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalMessages / limit),
        totalMessages,
        hasMore: skip + messages.length < totalMessages
      }
    });
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};