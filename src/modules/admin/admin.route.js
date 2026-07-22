import express from "express";
import { verifyToken } from "../../middleware/authMiddleware.js";
import protectRoute from "../../middleware/protectRoute.js";
import { ROLES } from "../../utils/roles.js";
import { getAllUser, updateUserRole } from "./admin.controller.js";

const router = express.Router();

router.get("/user", verifyToken, protectRoute(ROLES.ADMIN), getAllUser);
router.patch("/user/:userId/role", verifyToken, protectRoute(ROLES.ADMIN), updateUserRole);

export default router;