import express, { Router } from "express";
import { verifyToken } from "../../middleware/authMiddleware.js";
import protectRoute from "../../middleware/protectRoute.js";
import { ROLES } from "../../utils/roles.js";
import { getAdminDashboardStats, getAdminMonthlyRevenue, getUserMonthlyExpense, getUserOrderStats } from "./dashboard.controller.js";

const router = express.Router();

router.get("/user/dashboard-stats", verifyToken, protectRoute(ROLES.USER), getUserOrderStats);
router.get("/orders/monthly-expense", verifyToken, protectRoute(ROLES.USER), getUserMonthlyExpense);
router.get("/admin/dashboard-stats", verifyToken, protectRoute(ROLES.ADMIN), getAdminDashboardStats);
router.get("/monthly-revenue", verifyToken, protectRoute(ROLES.ADMIN), getAdminMonthlyRevenue);

export default router;