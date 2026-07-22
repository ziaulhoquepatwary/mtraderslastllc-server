import express from "express";
import { verifyToken } from "../../middleware/authMiddleware.js";
import protectRoute from "../../middleware/protectRoute.js";
import { ROLES } from "../../utils/roles.js";
import { checkSavedPackage, getSavedPackages, toggleSavePackage } from "./savePackage.controller.js";

const router = express.Router();

router.get("/saved", verifyToken, protectRoute(ROLES.USER), getSavedPackages);
router.get("/check/:id", verifyToken, checkSavedPackage);
router.post("/save/:packageId", verifyToken, protectRoute(ROLES.ADMIN, ROLES.USER), toggleSavePackage);


export default router;