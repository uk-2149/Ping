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

export class SocketService {
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

            socket.on("dm_message", async(data) => {
                const {to, message} = data;

                if(!to || !message) {
                    console.error("Invalid data received");
                    return;
                }

                console.log("data:", data);

                try {
                    await User.findByIdAndUpdate(userId, {
                        lastSeen: Date.now(),
                    });
                } catch(error) {
                    console.error("Error updating user status", error);
                    return;
                }

                const enrichData: {
                    content: string;
                    from: string;
                    to: string;
                    timeStamp: Date;
                } = {
                    content: message,
                    from: userId,
                    to,
                    timeStamp: new Date(),
                };

                console.log("Enriched data:", enrichData);

                await pub.publish("Ping", JSON.stringify(enrichData));
            });

            socket.on("heartbeat", async() => {
                try {
                    await User.findByIdAndUpdate(userId, {
                        lastSeen: new Date(),
                    });
                } catch(error) {
                    console.error("Error updating user status", error);
                    return;
                }
            });

            socket.on("disconnect", async() => {
                console.log(`User ${userId} disconnected with socket ID: ${socket.id}`);
                
                try {
                    await User.findByIdAndUpdate(userId, {
                        lastSeen: new Date(),
                        status: "OFFLINE",
                    });
                    await this.broadcastUserStatusChange(userId.toString(), false);
                } catch(error) {
                    console.error("Error updating user status", error);
                    return;
                }

                pub.del(socketKey(userId));
            });
        });

        sub.on("message", async(channel, message) => {
            if(channel=="Ping"){
                const data = JSON.parse(message);

                const { from, to, content, timeStamp } = data;

                console.log(data);

                if(!to || !from || !content) {
                    console.error("Invalid data received");
                    return;
                }

                const receiver = await User.findOne({ email: to });

                if(!receiver) {
                    console.error("Receiver not found");
                    return;
                }

                const rID = receiver._id?.toString();

                if(!rID) {
                    console.error("Receiver ID not found");
                    return;
                }

                const messageData: {
                    content: string;
                    from: string;
                    to: string;
                    timeStamp: Date;
                } = {
                    content,
                    from,
                    to,
                    timeStamp,
                };

                const newMsg = await MessageModel.create(messageData);

                console.log(`New message created: ${newMsg} from ${from} to ${to}`);

                const toSocketId = await pub.get(socketKey(rID));

                const sender = await User.findById({ from });

                if(!sender) {
                    console.error("Sender not found");
                    return;
                }

                const obj_data = {
                    fromId: from,
                    senderMail: sender.email,
                    senderName: sender.name,
                    toId: rID,
                    receiverName: receiver.name,
                    message: newMsg,
                };

                if(toSocketId) {
                    this._io.to(toSocketId).emit("dm_message", obj_data);
                    await newMsg.save();

                    console.log(`Message sent from ${from} to ${to} with socket ID: ${toSocketId}`);
                } else {
                    console.warn(`User ${to} not connected`);
                }

                pub.on("error", (err) => {
                    console.error("[Redis pub] Error:", err);
                });

                sub.on("error", (err) => {
                    console.error("[Redis sub] Error:", err);
                });
            }
        });
    }

    public get io(): SocketIOServer {
        return this._io;
    }

    private async broadcastUserStatusChange(userId: string, status: boolean): Promise<void> {
        try {
            const user = await User.findById(userId).populate(
                "friends",
                "username avatar"
            )
            if(!user) return;

            const allUserstoNotify = [
                ...user.friends.map((friend) => friend._id.toString()),
            ];

            const uniqueUserstoNotify = [...new Set(allUserstoNotify)];

            console.log(`📡 Broadcasting status change for user ${userId}, status ${status} to user frineds: ${uniqueUserstoNotify}`);

            for(const frinedId of uniqueUserstoNotify) {
                const friendSocketId = await pub.get(socketKey(frinedId));
                if(friendSocketId) {
                    this._io.to(friendSocketId).emit("user_status_change", {
                        userId,
                        status,
                        lastSeen: new Date(),
                    });

                    console.log(`Sent status update to friend ${frinedId} with socket ID: ${friendSocketId}`);
                } else {
                    console.log(`User ${frinedId} not online`);
                }
            }
        } catch(error) {
            console.error("Error broadcasting user status change", error);
        }   
    }   
}