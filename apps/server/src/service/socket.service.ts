import { Server as SocketIOServer } from "socket.io";
import { Server as httpServer } from "http";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import * as cookie from "cookie";
import MessageModel from "../models/Message.model";
import User from "../models/User.model";
import { pub, sub } from "../utils/redisClient";
import { socketKey } from "../lib/ext";

dotenv.config();

export class SocketServer {
    private _io: SocketIOServer;

    constructor(server: httpServer) {
        this._io = new SocketIOServer(server, {
            cors: {
                origin: "http://localhost:5173",
                credentials: true,
                // methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
                // allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
            },
            transports: ["websocket", "polling"],
        });

    // JWT authentication middleware
    this._io.use((socket, next) => {
        const cookies = socket.handshake.headers.cookie;
        if(!cookies) return next(new Error("No cookie found"));

        const parsedCookie = cookie.parse(cookies);
        const token = parsedCookie.token;

        if(!token) return next(new Error("Authentication token required"));

        try {
            const payload = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
            socket.data.userId = payload.userId;
            return next();
        } catch (error) {
            return next(new Error("Invalid or Expired token"));
        }
    });
    sub.subscribe("Ping", (message: string, channel: string) => {
        console.log(`Received message on ${channel}: ${message}`);
    });
    }
    
    private async findUserByEmail(email: string) {
        try {
            const user = await User.findOne({ email: email });
            if(!user) {
                throw new Error("User not found");
            }
            return user;
        } catch(error) {
            console.error("Error finding user", error);
            throw error;
        }
    }
    
    public initListeners(): void {
        const io = this._io;

        io.on("connection", async (socket) => {
            const userId = socket.data.userId;

            if(!userId) {
                console.error("User ID not found");
                return;
            }

            console.log(`New connection: ${userId} with socket ID: ${socket.id}`);

            try {
                await User.findOneAndUpdate(userId, {
                    lastSeen: new Date(),
                    status: "ONLINE",
                });

                await this.broadcastUserStatusChange(userId.toString(), true);
            } catch(error) {
                console.error("Error updating user status", error);
                return;
            }

            // redis map upload userId -> socketId
            await pub.set(socketKey(userId), socket.id, { EX: 60*10 });
            socket.emit("connected", { socketId: socket.id });

            console.log(`User ${userId} connected with socket ID: ${socket.id}`);

            socket.on("one_to_one_message", async(data) => {
                const {to, message} = data;

                if(!to || !message) {
                    console.error("Invalid data received");
                    return;
                }

                console.log("data:", data);

            })
            }
        );
    }


}