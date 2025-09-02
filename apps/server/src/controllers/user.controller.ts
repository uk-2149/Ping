import { Request, Response } from "express";
import User from "../models/User.model";
import FriendRequest from "../models/FriendRequest.model";
import mongoose from "mongoose";
import { verifyJWT } from "../utils/jwt";

export const getUser = async(req: Request, res: Response): Promise<any> => {

    try {
        const token = req.cookies.token;
        const userid = verifyJWT(token, "access") as string;
        const user = await User.findById(userid);
        if(!user) {
            return res.status(400).json({ message: "User not found" });
        }
        return res.status(200).json(user);
    } catch (error) {
        console.error("Error getting user:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const setUsername = async(req: Request, res: Response): Promise<any> => {
    const { username } = req.body;
    try {
        const token = req.cookies.token;
        const userid = verifyJWT(token, "access") as string;
        const user = await User.findById(userid);
        if(!user) {
            return res.status(400).json({ message: "User not found" });
        }
        if(user.username === username) {
            return res.status(400).json({ message: "Username already exists" });
        }
        const existingUser = await User.findOne({ username });
        if(existingUser) {
            return res.status(400).json({ message: "Username already exists" });
        }
        user.username = username;
        await user.save();
        return res.status(200).json({ message: "Username updated successfully" });
    } catch (error) {
        console.error("Error updating username:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const FriendReq = async(req: Request, res: Response): Promise<any> => {
    const { username } = req.body;

    try {

        const token = req.cookies.token;
        const userid = verifyJWT(token, "access") as string;
        const user = await User.findById(userid);

        if(!user) {
            return res.status(400).json({ message: "User not found" });
        }

        if (user.username === username) {
            return res.status(400).json({ message: "You cannot send a friend request to yourself" });
        }

        const receiver = await User.findOne({ username });
        if (!receiver) {
            return res.status(400).json({ message: "User not found" });
        }

        const senderid = user._id as string;
        const receiverid = receiver._id as string;

        // Ensure receiverid is an Objectid
        const receiverObjectid = new mongoose.Types.ObjectId(receiverid);

        // Check if they are already friends
        const sender = await User.findById(receiverObjectid);
        if (sender?.friends.includes(receiverObjectid)) {
            return res.status(400).json({ message: "User is already your friend" });
        }

        // Check if request already exists
        const existingRequest = await FriendRequest.findOne({
            sender: senderid,
            receiver: receiverid
        });

        if (existingRequest) {
            return res.status(400).json({ message: "Friend request already sent" });
        }

        const friendRequest = await FriendRequest.create({
            sender: senderid,
            receiver: receiverid
        })

        friendRequest.save();

        return res.status(201).json({ message: "Friend request sent successfully" });
    } catch(err:any) {
        console.log(err);
        return res.status(500).json({ message: "Internal server error" });
    }   
} 

export const FriendReqAccept = async (req: Request, res: Response): Promise<any> => {
  const { requestid } = req.body;
  const request = await FriendRequest.findById(requestid);
  if (!request) {
    return res.status(404).json({ message: "Friend request not found" });
  }
  const senderid = request.sender;
  const receiverid = request.receiver;
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // Add each other as friends (without duplicates)
    await User.findByIdAndUpdate(
      senderid,
      { $addToSet: { friends: receiverid } },
      { session }
    );
    await User.findByIdAndUpdate(
      receiverid,
      { $addToSet: { friends: senderid } },
      { session }
    );

    // Delete the friend request
    await FriendRequest.findOneAndDelete(
      { sender: senderid, receiver: receiverid },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({ message: "Friend request accepted successfully" });
  } catch (err: any) {
    await session.abortTransaction();
    session.endSession();
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const DeleteFriendRequest = async (req: Request, res: Response): Promise<any> => {
    const { requestid } = req.body;
    const request = await FriendRequest.findById(requestid);
    if (!request) {
        return res.status(404).json({ message: "Friend request not found" });
    }
    const senderid = request.sender;
    const receiverid = request.receiver;
    try {
        await FriendRequest.findOneAndDelete({ sender: senderid, receiver: receiverid });
        return res.status(200).json({ message: "Friend request deleted successfully" });
    } catch (err: any) {
        console.error(err);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const DeleteFriend = async (req: Request, res: Response): Promise<any> => {
    const { userid, friendid } = req.body;
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        await User.findByIdAndUpdate(
            userid, 
            { $pull: { friends: friendid } }
        );

        await User.findByIdAndUpdate(
            friendid, 
            { $pull: { friends: userid } }
        );

        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({ message: "Friend deleted successfully" });
    } catch (err: any) {
        console.error(err);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const getFriendRequests = async(req: Request, res: Response): Promise<any> => {
    try {
        const token = req.cookies.token;
        const userid = verifyJWT(token, "access") as string;
        const user = await User.findById(userid);
        if(!user) {
            return res.status(400).json({ message: "User not found" });
        }
        const friendRequests = await FriendRequest.find({ sender: userid })
            .populate("sender", "username avatar") // only bring username
            .populate("receiver", "username avatar"); 
        return res.status(200).json(friendRequests);
    } catch (error) {
        console.error("Error getting friend requests:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const getReceivedRequests = async(req: Request, res: Response): Promise<any> => {
    try {
        const token = req.cookies.token;
        const userid = verifyJWT(token, "access") as string;
        const user = await User.findById(userid);
        if(!user) {
            return res.status(400).json({ message: "User not found" });
        }
        const friendRequests = await FriendRequest.find({ receiver: userid })
            .populate("sender", "username avatar") // only bring username
            .populate("receiver", "username avatar"); 
        return res.status(200).json(friendRequests);
    } catch (error) {
        console.error("Error getting friend requests:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const getFriendsList = async(req: Request, res: Response): Promise<any> => {
    try {
        const token = req.cookies.token;
        const userid = verifyJWT(token, "access") as string;
        const user = await User.findById(userid);
        if(!user) {
            return res.status(400).json({ message: "User not found" });
        }
        const friends = await User.find({ _id: { $in: user.friends } }).select("_id username status avatar lastSeen");
        return res.status(200).json(friends);
    } catch (error) {
        console.error("Error getting friends list:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const addDmFriend = async(req: Request, res: Response): Promise<any> => {
    const { friendid } = req.body;
    try {
        const token = req.cookies.token;
        const userid = verifyJWT(token, "access") as string;
        const user = await User.findById(userid);
        if(!user) {
            return res.status(400).json({ message: "User not found" });
        }
        if(user.dmFriends.includes(friendid)) {
            return res.status(400).json({ message: "User is already on your DM List" });
        }
        user.dmFriends.push(friendid);
        await user.save();
        return res.status(200).json({ message: "DM added successfully" });
    } catch (error) {
        console.error("Error creating DM:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const getDmFriendsList = async(req: Request, res: Response): Promise<any> => {
    try {
        const token = req.cookies.token;
        const userid = verifyJWT(token, "access") as string;
        const user = await User.findById(userid);
        if(!user) {
            return res.status(400).json({ message: "User not found" });
        }
        const dmfriends = await User.find({ _id: { $in: user.dmFriends } }).select("_id username status avatar lastSeen");
        return res.status(200).json(dmfriends);
    } catch (error) {
        console.error("Error getting DM friends list:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}