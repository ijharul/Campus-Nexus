import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import seedSuperAdmin from "./config/seedSuperAdmin.js";
import { errorHandler, notFound } from "./middlewares/errorHandler.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import mentorshipRoutes from "./routes/mentorshipRoutes.js";
import referralRoutes from "./routes/referralRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import collegeRoutes from "./routes/collegeRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import collegeAdminRoutes from "./routes/collegeAdminRoutes.js";
import alumniRoutes from "./routes/alumniRoutes.js";
import donationRoutes from "./routes/donationRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import superAdminRoutes from "./routes/superAdminRoutes.js";
import noticeRoutes from "./routes/noticeRoutes.js";
import goalRoutes from "./routes/goalRoutes.js";
import gamificationRoutes from "./routes/gamificationRoutes.js";
import http from "http";
import { initSocket } from "./services/socketService.js";

dotenv.config({ override: true });
console.log("Loaded MONGO_URI:", process.env.MONGO_URI);

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

connectDB().then(() => {
  seedSuperAdmin();
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) =>
  res.json({ message: "Campus Nexus API", version: "2.0" }),
);

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/colleges", collegeRoutes);
app.use("/api/mentorship", mentorshipRoutes);
app.use("/api/referrals", referralRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/college-admin", collegeAdminRoutes);
app.use("/api/alumni", alumniRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/super", superAdminRoutes);
app.use("/api/notices", noticeRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/gamification", gamificationRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(
    `🚀 Campus Nexus server on port ${PORT} [${process.env.NODE_ENV || "development"}]`,
  );
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(
      `\n❌ Port ${PORT} is already in use. Stop the other process first.\n`,
    );
    process.exit(1);
  } else {
    throw err;
  }
});
