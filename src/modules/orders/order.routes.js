import express from "express";
import { verifyToken } from "../../middleware/authMiddleware.js";
import protectRoute from "../../middleware/protectRoute.js";
import { ROLES } from "../../utils/roles.js";
import { cancelOrder, getAllOrders, getMyOrders, getOrderDetails, handleStripeWebhook, updateOrderStatus } from "./order.controller.js";

const router = express.Router();

router.post("/stripe-webhook", express.raw({ type: "application/json" }), handleStripeWebhook);

router.use(express.json());

router.get("/my-orders", verifyToken, protectRoute(ROLES.USER), getMyOrders);
router.get("/order-details/:id", verifyToken, getOrderDetails);
router.get("/get-allOrders", verifyToken, protectRoute(ROLES.ADMIN), getAllOrders)
router.patch("/update-order/:id", verifyToken, protectRoute(ROLES.ADMIN), updateOrderStatus)
router.delete("/cancel-order/:id", verifyToken, protectRoute(ROLES.USER), cancelOrder)

export default router;