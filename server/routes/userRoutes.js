import { Router } from "express";
import { setUserData } from "../controllers/userController.js";
import { requireAuth } from "../middlewares/auth.js";
import { getAllUsers } from "../controllers/userController.js";
const router = Router();


router.post("/profile", requireAuth, setUserData);
router.get('/allUsers/:docId', requireAuth, getAllUsers);


export default router;
