import express from "express";
import { verifyToken } from "../../middleware/authMiddleware.js";
import { createPackage } from "./package.controller.js";
import protectRoute from "../../middleware/protectRoute.js";
import { ROLES } from "../../utils/roles.js";

const router = express.Router();

router.post("/", verifyToken, protectRoute(ROLES.ADMIN), createPackage);


export default router;