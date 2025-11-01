import { Router } from "express";
import { acceptInvite, CreateChannel, createServer, CreateSubChannel, getChannels, getRoles, getServerInvite, getServers, getUserPermissions, searchServerInvite } from "../controllers/server.controller";
import { get } from "mongoose";

const router = Router();

router.post('/createServer', createServer);
router.post('/:serverid/createChannel', CreateChannel);
router.post('/createSubChannel', CreateSubChannel);

router.get('/getServers', getServers);
router.get('/roles/:serverid', getRoles);
router.get('/getChannels/:serverid', getChannels);
router.get('/getUserPermissions/:serverid/:userid', getUserPermissions);

// invites
router.post("/:serverid/invite/:inviteId", getServerInvite);
router.get("/invite/:inviteId", searchServerInvite);
router.post("/invite/accept/:inviteId", acceptInvite);

export default router;