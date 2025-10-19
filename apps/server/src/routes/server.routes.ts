import { Router } from "express";
import { createServer, getRoles, getServers } from "../controllers/server.controller";

const router = Router();

router.post('/createServer', createServer);
router.get('/getServers', getServers);
router.get('/roles/:serverid', getRoles);

export default router;