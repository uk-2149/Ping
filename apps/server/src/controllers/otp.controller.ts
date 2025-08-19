import redisClient from "../utils/redisClient";
import { Request, Response } from "express";
import { sendEmail } from "../service/email-otp";
import User from "../models/User.model";

export const sendOtp = async (req: Request, res: Response): Promise<any> => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }
    try {
        const otp = Math.floor(Math.random() * 1000000).toString();
        await redisClient.set(`otp:${email}`, otp, { EX: 300 }); // Set OTP in Redis for 5 minutes
        await sendEmail(email, otp);
        return res.status(200).json({ message: "OTP sent successfully" });
    } catch (error) {
        console.error("Error sending OTP:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const verifyOtp = async(req: Request, res: Response): Promise<any> => {
    const { email, otp } = req.body;
    const storedOtp = await redisClient.get(`otp:${email}`);
    if (storedOtp === otp) {
        const user = await User.findOne({ email });
        if(!user) {
            return res.status(400).json({ message: "User not found error" });
        }
        await user.save();
        await redisClient.del(`otp:${email}`);
        return res.status(200).json({ message: "OTP verified successfully" });
    } else {
        return res.status(400).json({ message: "Invalid OTP" });
    }
}