import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieparser from "cookie-parser";
import authRouter from "./routes/auth.routes";
import otpRouter from "./routes/otp.routes";
import userRouter from "./routes/user.routes";
import { connectMongo } from "./utils/mongodb";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
}));
app.use(express.json());
app.use(cookieparser());

console.log(process.env.EMAIL, process.env.OTP_PASS?.trim());

app.use("/api/auth", authRouter);
app.use("/api/otp", otpRouter);
app.use("/api/users", userRouter)

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
connectMongo();