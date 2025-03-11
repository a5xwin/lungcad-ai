import express from "express";
import cors from "cors";
import 'dotenv/config';
import cookieParser from "cookie-parser";
import connectDB from "./config/mongodb.js";
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";

const app = express();
const port = process.env.PORT || 4000;
connectDB();

const allowedOrigins = ["http://localhost:5173"];

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: allowedOrigins, credentials: true }));

app.get("/", (req, res) => res.send("API Working!"));
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api", uploadRoutes);
app.use("/api/doctor", doctorRoutes);

app.listen(port, () => console.log(`Server started on PORT:${port}`));
