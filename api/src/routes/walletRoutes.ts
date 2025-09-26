import { Router } from "express";
import { requireUser } from "../middleware/requireUser";
import { getCredit } from "../controllers/walletController";

const router = Router();
router.get("/credit", requireUser, getCredit);
export default router;
