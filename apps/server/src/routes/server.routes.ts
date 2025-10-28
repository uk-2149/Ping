import { Router } from "express";
import { acceptInvite, createServer, getChannels, getRoles, getServerInvite, getServers, getUserPermissions, searchServerInvite } from "../controllers/server.controller";
import { get } from "mongoose";

const router = Router();

router.post('/createServer', createServer);
router.get('/getServers', getServers);
router.get('/roles/:serverid', getRoles);
router.get('/getChannels/:serverid', getChannels);
router.get('/getUserPermissions/:serverid/:userid', getUserPermissions);

// invites
router.post("/:serverid/invite/:inviteId", getServerInvite);
router.get("/invite/:inviteId", searchServerInvite);
router.post("/invite/accept/:inviteId", acceptInvite);

export default router;