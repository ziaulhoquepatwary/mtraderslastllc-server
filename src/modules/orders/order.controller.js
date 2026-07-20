import catchAsync from "../../utils/catchAsync.js";
import Order from "./order.model.js";


export const getMyOrders = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const pageNumber = Math.max(1, parseInt(page));
    const limitNumber = Math.max(1, parseInt(limit));
    const skip = (pageNumber - 1) * limitNumber;

    const [orders, totalOrders] = await Promise.all([
        Order.find({ userId })
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

export const getMyOrderDetails = catchAsync(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    const order = await Order.findOne({ _id: id, userId }).lean();
    if (!order) {
        throw new AppError(404, "Order not found");
    }

    return res.status(200).json({
        success: true,
        message: "Order details fetched successfully",
        data: order,
    });
});

export const cancelOrder = catchAsync(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    const order = await Order.findOne({ _id: id, userId });
    if (!order) {
        throw new AppError(404, "Order not found");
    }

    if (order.status !== "pending" && order.status !== "contacted") {
        throw new AppError(400, "Order cannot be cancelled at this stage");
    }

    const orderPlacementTime = new Date(order.createdAt).getTime();
    const currentTime = new Date().getTime();
    const oneDayInMilliseconds = 24 * 60 * 60 * 1000;

    if (currentTime - orderPlacementTime > oneDayInMilliseconds) {
        throw new AppError(400, "Cancellation period has expired (Max 24 hours)");
    }

    order.status = "cancelled";
    order.paymentStatus = "refunded";
    await order.save();

    return res.status(200).json({
        success: true,
        message: "Order cancelled successfully, refund initiated",
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