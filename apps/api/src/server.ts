import "./config/env.js";

import app from "./app.js";
import authRoutes from "./routes/auth.routes.js";
app.use("/api/auth", authRoutes);
const PORT = Number(process.env.PORT) || 5000;

app.listen(PORT, () => {
  console.log(`🚀 API running on http://localhost:${PORT}`);
});