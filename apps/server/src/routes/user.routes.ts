import { Router } from "express";
import { DeleteFriendRequest, FriendReq, FriendReqAccept, getFriendRequests, getFriendsList, getReceivedRequests, getUser, setUsername } from "../controllers/user.controller";

const router = Router();

router.get("/getUser", getUser);
router.post("/setUsername", setUsername);
router.post("/friendrequest", FriendReq);
router.get("/getFriendRequests", getFriendRequests);
router.get("/getReceivedRequests", getReceivedRequests);
router.post("/acceptFriendRequest", FriendReqAccept);
router.post("/declineFriendRequest", DeleteFriendRequest);
router.get("/getFriends", getFriendsList);

export default router;