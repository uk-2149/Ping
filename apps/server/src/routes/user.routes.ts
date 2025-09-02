import { Router } from "express";
import { addDmFriend, DeleteFriendRequest, FriendReq, FriendReqAccept, getDmFriendsList, getFriendRequests, getFriendsList, getReceivedRequests, getUser, setUsername } from "../controllers/user.controller";
import { get } from "http";
import { getMessageSenders } from "../controllers/msg.controller";

const router = Router();

router.get("/getUser", getUser);
router.post("/setUsername", setUsername);
router.post("/friendrequest", FriendReq);
router.get("/getFriendRequests", getFriendRequests);
router.get("/getReceivedRequests", getReceivedRequests);
router.post("/acceptFriendRequest", FriendReqAccept);
router.post("/declineFriendRequest", DeleteFriendRequest);
router.get("/getFriends", getFriendsList);
router.post('/addDm', addDmFriend);
router.get('/getDm', getDmFriendsList);
router.get('/getMessageSenders/:userid', getMessageSenders);

export default router;