import { Server as SocketIOServer } from "socket.io";
import { Server as httpServer } from "http";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import * as cookie from "cookie";
import MessageModel, { IMessage } from "../models/Message.model";
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
                const payload = jwt.verify(token, process.env.JWT_SECRET!) as { userid: string };
                socket.data.userid = payload.userid;
                return next();
            } catch (error) {
                return next(new Error("Invalid or Expired token"));
            }
        });

        sub.subscribe("Ping", (message: string, channel: string) => {
            console.log(`Received message on ${channel}: ${message}`);
        });
    }
    
    public initListeners(): void {
        const io = this._io;

        io.on("connection", async (socket) => {
            const userid = socket.data.userid;

            if(!userid) {
                console.error("User id not found");
                return;
            }

            console.log(`New connection: ${userid} with socket id: ${socket.id}`);

            try {
                await User.findByIdAndUpdate(userid, {
                    lastSeen: new Date(),
                    status: "ONLINE",
                });

                await this.broadcastUserStatusChange(userid.toString(), "ONLINE");
            } catch(error) {
                console.error("Error updating user status", error);
                return;
            }

            // Redis map: userid -> socketid
            await pub.set(socketKey(userid), socket.id, { EX: 60*10 });
            socket.emit("connected", { socketid: socket.id });

            console.log(`User ${userid} connected with socket id: ${socket.id}`);

            socket.on("dm_message", async(data) => {
                console.log("📨 Received dm_message event:", data);

                const { to, content, timeStamp } = data;

                if(!to || !content) {
                    console.error("❌ Invalid data received - missing to or content");
                    return;
                }

                try {
                    // Update sender's last seen
                    await User.findByIdAndUpdate(userid, {
                        lastSeen: new Date(),
                    });

                    // Find receiver by username
                    const receiver = await User.findOne({ username: to });
                    if(!receiver) {
                        console.error("❌ Receiver not found:", to);
                        return;
                    }

                    const receiverid = receiver.id.toString();

                    // Create message data for database
                    const messageData = {
                        content: content,
                        from: userid,
                        to: receiverid,
                        timeStamp: timeStamp ? new Date(timeStamp) : new Date(),
                    };

                    console.log("💾 Creating message in database:", messageData);

                    // Save message to database
                    const newMessage = await MessageModel.create(messageData);
                    console.log("✅ Message saved to database:", newMessage._id);

                    // Get receiver's socket id
                    const receiverSocketid = await pub.get(socketKey(receiverid));
                    
                    // Get sender info for the recipient
                    const sender = await User.findById(userid);
                    if(!sender) {
                        console.error("❌ Sender not found");
                        return;
                    }

                    // Prepare data to send to receiver
                    const socketData = {
                        from: userid,
                        to: receiverid,
                        senderName: sender.username,
                        senderAvatar: sender.avatar,
                        message: {
                            id: newMessage.id.toString(),
                            content: newMessage.content,
                            from: newMessage.from,
                            to: newMessage.to,
                            timeStamp: newMessage.timeStamp,
                        }
                    };

                    console.log("📤 Prepared socket data:", socketData);

                    // Send to receiver if online
                    if(receiverSocketid) {
                        this._io.to(receiverSocketid).emit("dm_message", socketData);
                        console.log(`✅ Message sent to receiver ${to} with socket id: ${receiverSocketid}`);
                    } else {
                        console.log(`⚠️ User ${to} not online - message stored for later`);
                    }

                } catch(error) {
                    console.error("❌ Error processing dm_message:", error);
                }
            });

            socket.on("heartbeat", async() => {
                try {
                    await User.findByIdAndUpdate(userid, {
                        lastSeen: new Date(),
                    });
                } catch(error) {
                    console.error("Error updating user status during heartbeat", error);
                }
            });

            socket.on("disconnect", async() => {
                console.log(`User ${userid} disconnected with socket id: ${socket.id}`);
                
                try {
                    await User.findByIdAndUpdate(userid, {
                        lastSeen: new Date(),
                        status: "OFFLINE",
                    });
                    await this.broadcastUserStatusChange(userid.toString(), "OFFLINE");
                } catch(error) {
                    console.error("Error updating user status on disconnect", error);
                }

                await pub.del(socketKey(userid));
            });
        });
    }

    public get io(): SocketIOServer {
        return this._io;
    }

    private async broadcastUserStatusChange(userid: string, status: string): Promise<void> {
        try {
            const user = await User.findById(userid).populate("friends", "username avatar");
            if(!user) return;

            const friendids = user.friends.map((friend) => friend._id.toString());
            const uniqueFriendids = [...new Set(friendids)];

            console.log(`📡 Broadcasting status change for user ${userid}, status ${status} to friends: ${uniqueFriendids}`);

            for(const friendid of uniqueFriendids) {
                const friendSocketid = await pub.get(socketKey(friendid));
                if(friendSocketid) {
                    this._io.to(friendSocketid).emit("user_status_change", {
                        userid,
                        status: status,
                        lastSeen: new Date(),
                    });

                    console.log(`✅ Sent status update to friend ${friendid} with socket id: ${friendSocketid}`);
                } else {
                    console.log(`⚠️ Friend ${friendid} not online`);
                }
            }
        } catch(error) {
            console.error("❌ Error broadcasting user status change", error);
        }   
    }   
}