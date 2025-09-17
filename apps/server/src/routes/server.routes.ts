import { Router } from "express";
import { createServer, getServers } from "../controllers/server.controller";

const router = Router();

router.post('/createServer', createServer);
router.get('/getServer', getServers);

export default router;