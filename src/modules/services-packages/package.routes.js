import express from "express";
import { verifyToken } from "../../middleware/authMiddleware.js";
import { createPackage, deletePackage, getAllPackages, getPackageDetails, updatePackage, updatePackageStatus } from "./package.controller.js";
import protectRoute from "../../middleware/protectRoute.js";
import { ROLES } from "../../utils/roles.js";

const router = express.Router();

router.get("/", getAllPackages);
router.get("/:id", getPackageDetails);
router.post("/", verifyToken, protectRoute(ROLES.ADMIN), createPackage);
router.patch("/:id", verifyToken, protectRoute(ROLES.ADMIN), updatePackage);
router.patch("/status/:id", verifyToken, protectRoute(ROLES.ADMIN), updatePackageStatus);
router.delete("/:id", verifyToken, protectRoute(ROLES.ADMIN), deletePackage);


export default router;