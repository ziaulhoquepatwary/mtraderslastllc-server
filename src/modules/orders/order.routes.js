import express from "express";
import { verifyToken } from "../../middleware/authMiddleware.js";
import protectRoute from "../../middleware/protectRoute.js";
import { ROLES } from "../../utils/roles.js";
import { cancelOrder, getAllOrders, getMyOrderDetails, getMyOrders, handleStripeWebhook, updateOrderStatus } from "./order.controller.js";

const router = express.Router();

router.post("/stripe-webhook", express.raw({ type: "application/json" }), handleStripeWebhook);

router.use(express.json());

router.get("/my-orders", verifyToken, protectRoute(ROLES.USER), getMyOrders);
router.get("/my-order-details/:id", verifyToken, protectRoute(ROLES.USER), getMyOrderDetails);
router.get("/get-allOrders", verifyToken, protectRoute(ROLES.ADMIN), getAllOrders)
router.patch("/update-order/:id", verifyToken, protectRoute(ROLES.ADMIN), updateOrderStatus)
router.delete("/cancel-order", verifyToken, protectRoute(ROLES.USER), cancelOrder)

export default router;