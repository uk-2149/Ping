import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieparser from "cookie-parser";
import authRouter from "./routes/auth.routes";
import otpRouter from "./routes/otp.routes";
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

app.use("/api/auth", authRouter);
app.use("/api/otp", otpRouter);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
connectMongo();