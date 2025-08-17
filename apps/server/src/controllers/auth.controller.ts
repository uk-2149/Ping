import { Request, Response } from "express";
import User from "../models/User.model";
import { generateToken, verifyJWT } from "../utils/jwt";
import bcrypt from "bcrypt";

interface RequestWithUser extends Request {
    user?: any;
}

export const SignUp = async(req: Request, res: Response): Promise<any> => {
    const { name, email, password } = req.body;

    if(!name || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    try {
        const userExists = await User.findOne({ email });
        if(userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        const user = await User.create({ name, email, password: passwordHash });
        await user.save();

        return res.status(201).json({ message: "User created successfully" });
    } catch (error) {
        console.error("Error creating user:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const SignIn = async(req: Request, res: Response): Promise<any> => {
    const { email, password } = req.body;

    if(!email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const user = await User.findOne({ email });
        if(!user) {
            return res.status(400).json({ message: "User not found" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if(!isPasswordValid) {
            return res.status(400).json({ message: "Invalid password" });
        }

        const userId = user._id as string;

        const token = generateToken(userId, "access");
        const ref_token = generateToken(userId, "refresh");

        // refresh token
        res.cookie("ref_token", ref_token, {
        httpOnly: true,
        secure: true,
        sameSite: "none", // Prevent CSRF attacks
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        // access token
        res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none", // Prevent CSRF attacks
        maxAge: 15 * 60 * 1000, // 15 minutes
        });

        return res.status(200).json({
        message: "Login successful...",
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const onGetUser = async (req: RequestWithUser, res: Response): Promise<any> => {
  if (!req.user) {
    return res.status(401).json({ error: "User not authenticated." });
  }
  return res.status(200).json({
    user: req.user,
  });
};

export const onRefreshToken = async (
  req: Request,
  res: Response
): Promise<any> => {
  const ref_token = req.cookies?.ref_token;
  if (!ref_token) {
    return res.status(401).json({ error: "Refresh token is required." });
  }
  try {
    const userId = verifyJWT(ref_token, "refresh") as string;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Generate new access token
    const newAccessToken = generateToken(userId, "access");

    res.cookie("token", newAccessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none", // Prevent CSRF attacks
      maxAge: 15 * 60 * 1000, // 15 minutes
    });
    return res.status(200).json({
      message: "Token refreshed successfully.",
    });
  } catch (error) {
    console.error("Error during token refresh:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
};