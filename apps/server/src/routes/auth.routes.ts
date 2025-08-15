import { Router } from "express";
import { onGetUser, onRefreshToken, SignIn, SignUp } from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.post("/signup", SignUp);
router.post("/signin", SignIn);
router.get("/check_auth", authenticate, onGetUser);
router.post("/refresh_my_token", onRefreshToken);

export default router;