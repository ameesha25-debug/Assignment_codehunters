import { Router } from "express";
import { requireUser } from "../middleware/requireUser";
import { updateMe } from "../controllers/usersController";

const router = Router();
router.patch("/me", requireUser, updateMe);
export default router;
