import express from "express";
import { verifyToken } from "../../middleware/authMiddleware.js";
import protectRoute from "../../middleware/protectRoute.js";
import { ROLES } from "../../utils/roles.js";
import { contactEmail } from "./email.controller.js";

const router = express.Router();

router.post('/', verifyToken, contactEmail)

export default router;