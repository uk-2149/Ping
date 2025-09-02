import { Request, Response } from "express";
import MessageModel from "../models/Message.model";
import User from "../models/User.model";

export async function getMessageSenders(req: Request, res: Response): Promise<any> {
    try {
        const { userid } = req.params;
        
        // Get unique sender ids who have sent messages to this user
        const senderids = await MessageModel.distinct('from', { to: userid });
        
        // Get user details for these senders
        const senders = await User.find({ 
            _id: { $in: senderids } 
        }).select('_id username avatar email'); // Select the fields you need
        
        console.log(`Found ${senders.length} message senders for user ${userid}`);
        
        res.json(senders);
    } catch (error) {
        console.error('Error fetching message senders:', error);
        res.status(500).json({ error: 'Failed to fetch message senders' });
    }
}