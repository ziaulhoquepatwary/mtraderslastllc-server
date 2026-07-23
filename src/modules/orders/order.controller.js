import Stripe from "stripe";
import mongoose from "mongoose";
import catchAsync from "../../utils/catchAsync.js";
import Order from "./order.model.js";
import Package from "../services-packages/package.model.js";
import AppError from "../../utils/AppError.js";
import { sendOrderConfirmationEmail } from "./sendOrderEmail.js";


export const handleStripeWebhook = catchAsync(async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body, // Unparsed raw buffer
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        throw new AppError(400, `Webhook Signature Verification Failed: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
        const session = event.data.object;

        console.log("Stripe Session Received:", session.id);

        const { userId, packageId, userPhone, resourceLink } = session.metadata || {};
        const stripeSessionId = session.id;

        if (!userId || !packageId) {
            throw new AppError(400, "Missing required metadata (userId or packageId)");
        }

        const currentUser = await mongoose.connection.collection("user").findOne({
            _id: new mongoose.Types.ObjectId(userId)
        });

        if (!currentUser) {
            throw new AppError(404, `User not found in database with ID: ${userId}`);
        }

        const targetPackage = await Package.findById(packageId).lean();
        if (!targetPackage) {
            throw new AppError(404, `Package not found with ID: ${packageId}`);
        }

        const daysMatch = targetPackage.deliveryTime?.match(/\d+/);
        const deliveryDays = daysMatch ? parseInt(daysMatch[0]) : 7;

        const calculatedDeliveryDate = new Date();
        calculatedDeliveryDate.setDate(calculatedDeliveryDate.getDate() + deliveryDays);

        const newOrder = await Order.create({
            packageId: targetPackage._id,
            title: targetPackage.title,
            image: targetPackage.image[0],
            category: targetPackage.serviceCategory || "General",
            price: targetPackage.price,
            deliveryTime: targetPackage.deliveryTime,
            deliveryDate: calculatedDeliveryDate,
            userId: new mongoose.Types.ObjectId(userId),
            userName: currentUser.name || "Customer",
            userEmail: currentUser.email || "",
            userPhone: userPhone || "",
            resourceLink: resourceLink || "",
            status: "pending",
            paymentStatus: "paid",
            stripeSessionId: stripeSessionId
        });

        console.log("Order created in DB successfully! Order ID:", newOrder._id);


        // Send Email using Helper Function
        if (currentUser.email) {
            try {
                await sendOrderConfirmationEmail({
                    toEmail: currentUser.email,
                    userName: currentUser.name || "Customer",
                    orderId: newOrder._id,
                    packageTitle: targetPackage.title,
                    price: targetPackage.price,
                    deliveryTime: targetPackage.deliveryTime,
                    deliveryDate: calculatedDeliveryDate,
                    resourceLink: resourceLink || ""
                });
                console.log("Confirmation email sent successfully!");
            } catch (emailErr) {
                console.error("Failed to send order email:", emailErr);
            }
        }
    }

    res.status(200).json({
        success: true,
        message: "Webhook event processed and order created successfully",
    });
});

export const getMyOrders = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const pageNumber = Math.max(1, parseInt(page));
    const limitNumber = Math.max(1, parseInt(limit));
    const skip = (pageNumber - 1) * limitNumber;

    const [orders, totalOrders] = await Promise.all([
        Order.find({ userId })
            .select("_id title price status deliveryDate createdAt category image packageId")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNumber)
            .lean(),
        Order.countDocuments({ userId }),
    ]);

    return res.status(200).json({
        success: true,
        message: "Your orders fetched successfully",
        meta: {
            totalOrders,
            totalPages: Math.ceil(totalOrders / limitNumber),
            currentPage: pageNumber,
            limit: limitNumber,
        },
        data: orders,
    });
});

export const getOrderDetails = catchAsync(async (req, res) => {
    const { id } = req.params;
    const order = await Order.findById(id).lean();

    if (!order) {
        throw new AppError(404, "Order not found");
    }

    return res.status(200).json({
        success: true,
        message: "Order details fetched successfully",
        data: order,
    });
});

export const getAllOrders = catchAsync(async (req, res) => {
    const { status, page = 1, limit = 10 } = req.query;

    const queryConditions = {};
    if (status) {
        queryConditions.status = status;
    }

    const pageNumber = Math.max(1, parseInt(page));
    const limitNumber = Math.max(1, parseInt(limit));
    const skip = (pageNumber - 1) * limitNumber;

    const [orders, totalOrders] = await Promise.all([
        Order.find(queryConditions)
            .select("_id title price userName userEmail status deliveryDate createdAt category packageId")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNumber)
            .lean(),
        Order.countDocuments(queryConditions),
    ]);

    const totalPages = Math.ceil(totalOrders / limitNumber);

    return res.status(200).json({
        success: true,
        message: "All orders fetched successfully",
        meta: {
            totalOrders,
            totalPages,
            currentPage: pageNumber,
            limit: limitNumber,
        },
        data: orders,
    });
});

export const updateOrderStatus = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { status, deliveryDate } = req.body;

    const order = await Order.findById(id);
    if (!order) {
        throw new AppError(404, "Order not found");
    }

    if (status) {
        order.status = status;
    }

    if (deliveryDate) {
        order.deliveryDate = new Date(deliveryDate);
    }

    await order.save();

    return res.status(200).json({
        success: true,
        message: "Order progress updated successfully",
        data: order,
    });
});

export const cancelOrder = catchAsync(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    // ১. ডাটাবেজ থেকে অর্ডার খোঁজা
    const order = await Order.findOne({ _id: id, userId });
    if (!order) {
        throw new AppError(404, "Order not found");
    }

    // ২. আগের ক্যানসেল করা অর্ডার আবার ক্যানসেল রোধ করা
    if (order.status === 'cancelled') {
        throw new AppError(400, "This order has already been cancelled");
    }

    // ৩. ডেলভারি ডেট পার হয়েছে কিনা চেক
    const currentDate = new Date();
    const deliveryDate = new Date(order.deliveryDate);

    if (currentDate <= deliveryDate) {
        throw new AppError(
            400,
            "You cannot cancel the order before the delivery date has passed"
        );
    }

    // ৪. Stripe SDK ইনস্ট্যান্ট তৈরি (Webhook এর মতো সরাসরি `process.env.STRIPE_SECRET_KEY` দিয়ে)
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    // ৫. ডাটাবেজে থাকা stripeSessionId থেকে Checkout Session অবজেক্ট রিট্রিভ করা
    const session = await stripe.checkout.sessions.retrieve(order.stripeSessionId);

    if (!session || !session.payment_intent) {
        throw new AppError(400, "No valid payment intent found for this order to issue a refund");
    }

    // ৬. Stripe-এ Payment Intent ID ব্যবহার করে রিফান্ড প্রসেস করা
    await stripe.refunds.create({
        payment_intent: session.payment_intent,
        reason: 'requested_by_customer'
    });

    // ৭. স্কিমা পরিবর্তন না করে অর্ডারের বিদ্যমান ফিল্ড আপডেট করা
    order.status = 'cancelled';
    order.paymentStatus = 'refunded';

    await order.save();

    res.status(200).json({
        success: true,
        message: "Order cancelled and refunded successfully",
        data: order
    });
});