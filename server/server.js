import express from "express";
import cors from "cors";
import 'dotenv/config';
import cookieParser from "cookie-parser";
import connectDB from "./config/mongodb.js";
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";

const app = express();

app.use(express.json({ limit: "50mb" })); // ⬆ Increase JSON size
app.use(express.urlencoded({ limit: "50mb", extended: true })); // ⬆ Increase URL-encoded size

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
app.use("/api/patients",reportRoutes);

app.listen(port, () => console.log(`Server started on PORT:${port}`));
