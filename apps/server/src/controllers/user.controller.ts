import { Request, Response } from "express";
import User from "../models/User.model";
import FriendRequest from "../models/FriendRequest.model";
import mongoose from "mongoose";
import { verifyJWT } from "../utils/jwt";

export const getUser = async(req: Request, res: Response): Promise<any> => {

    try {
        const token = req.cookies.token;
        const userId = verifyJWT(token, "access") as string;
        const user = await User.findById(userId);
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
        const userId = verifyJWT(token, "access") as string;
        const user = await User.findById(userId);
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
        const userId = verifyJWT(token, "access") as string;
        const user = await User.findById(userId);

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

        const senderId = user._id as string;
        const receiverId = receiver._id as string;

        // Ensure receiverId is an ObjectId
        const receiverObjectId = new mongoose.Types.ObjectId(receiverId);

        // Check if they are already friends
        const sender = await User.findById(receiverObjectId);
        if (sender?.friends.includes(receiverObjectId)) {
            return res.status(400).json({ message: "User is already your friend" });
        }

        // Check if request already exists
        const existingRequest = await FriendRequest.findOne({
            sender: senderId,
            receiver: receiverId
        });

        if (existingRequest) {
            return res.status(400).json({ message: "Friend request already sent" });
        }

        const friendRequest = await FriendRequest.create({
            sender: senderId,
            receiver: receiverId
        })

        friendRequest.save();

        return res.status(201).json({ message: "Friend request sent successfully" });
    } catch(err:any) {
        console.log(err);
        return res.status(500).json({ message: "Internal server error" });
    }   
} 

export const FriendReqAccept = async (req: Request, res: Response): Promise<any> => {
  const { requestId } = req.body;
  const request = await FriendRequest.findById(requestId);
  if (!request) {
    return res.status(404).json({ message: "Friend request not found" });
  }
  const senderId = request.sender;
  const receiverId = request.receiver;
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // Add each other as friends (without duplicates)
    await User.findByIdAndUpdate(
      senderId,
      { $addToSet: { friends: receiverId } },
      { session }
    );
    await User.findByIdAndUpdate(
      receiverId,
      { $addToSet: { friends: senderId } },
      { session }
    );

    // Delete the friend request
    await FriendRequest.findOneAndDelete(
      { sender: senderId, receiver: receiverId },
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
    const { requestId } = req.body;
    const request = await FriendRequest.findById(requestId);
    if (!request) {
        return res.status(404).json({ message: "Friend request not found" });
    }
    const senderId = request.sender;
    const receiverId = request.receiver;
    try {
        await FriendRequest.findOneAndDelete({ sender: senderId, receiver: receiverId });
        return res.status(200).json({ message: "Friend request deleted successfully" });
    } catch (err: any) {
        console.error(err);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const DeleteFriend = async (req: Request, res: Response): Promise<any> => {
    const { userId, friendId } = req.body;
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        await User.findByIdAndUpdate(
            userId, 
            { $pull: { friends: friendId } 
        });

        await User.findByIdAndUpdate(
            friendId, 
            { $pull: { friends: userId } 
        });

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
        const userId = verifyJWT(token, "access") as string;
        const user = await User.findById(userId);
        if(!user) {
            return res.status(400).json({ message: "User not found" });
        }
        const friendRequests = await FriendRequest.find({ sender: userId })
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
        const userId = verifyJWT(token, "access") as string;
        const user = await User.findById(userId);
        if(!user) {
            return res.status(400).json({ message: "User not found" });
        }
        const friendRequests = await FriendRequest.find({ receiver: userId })
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
        const userId = verifyJWT(token, "access") as string;
        const user = await User.findById(userId);
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