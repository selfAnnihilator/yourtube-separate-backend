import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import userroutes from "./routes/auth.js";
import videoroutes from "./routes/video.js";
import likeroutes from "./routes/like.js";
import dislikeroutes from "./routes/dislike.js";
import watchlaterroutes from "./routes/watchlater.js";
import historyrroutes from "./routes/history.js";
import commentroutes from "./routes/comment.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const DB_URL =
  process.env.DB_URL ||
  process.env.MONGO_URI ||
  "mongodb://127.0.0.1:27017/yourtube";
const FRONTEND_URL = process.env.FRONTEND_URL || "";

app.use(
  cors({
    origin: FRONTEND_URL
      ? [FRONTEND_URL, "http://localhost:3000"]
      : true,
  })
);
app.use(express.json({ limit: "30mb", extended: true }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));
app.get("/", (req, res) => {
  res.json({
    message: "Backend is running",
    database:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});
app.get("/health", (req, res) => {
  const isConnected = mongoose.connection.readyState === 1;

  res.status(isConnected ? 200 : 503).json({
    ok: isConnected,
    database: isConnected ? "connected" : "disconnected",
  });
});
app.use(bodyParser.json());
app.use("/user", userroutes);
app.use("/video", videoroutes);
app.use("/like", likeroutes);
app.use("/dislike", dislikeroutes);
app.use("/watch", watchlaterroutes);
app.use("/history", historyrroutes);
app.use("/comment", commentroutes);

async function connectDatabase() {
  try {
    await mongoose.connect(DB_URL, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("Mongodb connected");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    console.error(
      "Set DB_URL or MONGO_URI in server/.env. Local fallback is mongodb://127.0.0.1:27017/yourtube."
    );
  }
}

app.listen(PORT, async () => {
  console.log(`server running on port ${PORT}`);
  await connectDatabase();
});
