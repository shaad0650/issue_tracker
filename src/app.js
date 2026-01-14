import express from "express";
import cors from "cors";
import healthRoutes from "./routes/health.routes.js"
import authRoutes from "./routes/auth.routes.js"
import issueRoutes from "./routes/issue.routes.js"

const app=express();

app.use(cors());
app.use(express.json());

app.use("/api", healthRoutes);
app.use("/api/auth",authRoutes)
app.use("/api/issues",issueRoutes)

export default app;