// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { userConnect } from "./src/config/user.js";
import { adminConnect } from "./src/config/admin.js";
import authRoutes from "./src/routes/authRoutes.js";
import cookieParser from "cookie-parser";

dotenv.config();

const PORT = process.env.PORT || 5000;
const app = express();
app.use(express.json());


app.use(cors({
  origin: ["https://thokmarket-20.netlify.app"],
  credentials: true,
}));



app.use(cookieParser());

console.log("DB connections imported");
app.use("/api", authRoutes);

// global error handler (simple)
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
