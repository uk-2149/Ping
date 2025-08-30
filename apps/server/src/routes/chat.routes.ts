import express from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { getChats } from "../controllers/chat.controller";
const chatRouter = express.Router();

chatRouter.get("/:userId/messages", authenticate, getChats);

export default chatRouter;