import { Router } from "express";
import { FriendReq, getFriendRequests, getUser, setUsername } from "../controllers/user.controller";

const router = Router();

router.get("/getUser", getUser);
router.post("/setUsername", setUsername);
router.post("/friendrequest", FriendReq);
router.get("/getFriendRequests", getFriendRequests);

export default router;