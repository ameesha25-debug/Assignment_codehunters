import express from "express";
import cors from "cors";
import { ENV } from "./env";

const app = express();
app.use(cors());
app.use(express.json());



app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.listen(ENV.PORT, () => {
  console.log(`API running at ${ENV.BASE_URL}`);
});
