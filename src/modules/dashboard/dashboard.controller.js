import mongoose from "mongoose";
import catchAsync from "../../utils/catchAsync.js";
import Order from "../orders/order.model.js";

export const getUserOrderStats = catchAsync(async (req, res) => {
    const userId = req.user?.id;

    const stats = await Order.aggregate([
        {
            $match: {
                userId: userId,
            },
        },
        {
            $group: {
                _id: null,
                totalOrders: { $sum: 1 },
                totalSpent: {
                    $sum: {
                        $cond: [{ $eq: ["$paymentStatus", "paid"] }, "$price", 0],
                    },
                },
                completedOrders: {
                    $sum: {
                        $cond: [{ $eq: ["$status", "completed"] }, 1, 0],
                    },
                },
                pendingOrders: {
                    $sum: {
                        $cond: [
                            {
                                $in: [
                                    "$status",
                                    ["pending", "contacted", "confirmed", "in_progress"],
                                ],
                            },
                            1,
                            0,
                        ],
                    },
                },
                cancelledOrders: {
                    $sum: {
                        $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0],
                    },
                },
            },
        },
        {
            $project: {
                _id: 0,
                totalOrders: 1,
                totalSpent: 1,
                completedOrders: 1,
                pendingOrders: 1,
                cancelledOrders: 1,
            },
        },
    ]);

    const result = stats[0] || {
        totalOrders: 0,
        totalSpent: 0,
        completedOrders: 0,
        pendingOrders: 0,
        cancelledOrders: 0,
    };

    res.status(200).json({
        success: true,
        data: result,
    });
});

export const getAdminDashboardStats = catchAsync(async (req, res) => {
    const totalUsersPromise = mongoose.connection
        .collection("user")
        .countDocuments({ role: "user" });

    const orderStatsPromise = Order.aggregate([
        {
            $group: {
                _id: null,
                totalOrders: { $sum: 1 },
                totalRevenue: {
                    $sum: {
                        $cond: [{ $eq: ["$paymentStatus", "paid"] }, "$price", 0],
                    },
                },
                activeProjects: {
                    $sum: {
                        $cond: [
                            {
                                $in: [
                                    "$status",
                                    ["pending", "contacted", "confirmed", "in_progress"],
                                ],
                            },
                            1,
                            0,
                        ],
                    },
                },
            },
        },
        {
            $project: {
                _id: 0,
                totalOrders: 1,
                totalRevenue: 1,
                activeProjects: 1,
            },
        },
    ]);

    const [totalUsers, orderStatsResult] = await Promise.all([
        totalUsersPromise,
        orderStatsPromise,
    ]);

    const orderStats = orderStatsResult[0] || {
        totalOrders: 0,
        totalRevenue: 0,
        activeProjects: 0,
    };

    res.status(200).json({
        success: true,
        data: {
            totalUsers,
            totalOrders: orderStats.totalOrders,
            activeProjects: orderStats.activeProjects,
            totalRevenue: orderStats.totalRevenue,
        },
    });
});

export const getUserMonthlyExpense = catchAsync(async (req, res) => {
    const userId = req.user?.id;
    const currentYear = new Date().getFullYear();

    const stats = await Order.aggregate([
        {
            $match: {
                userId: String(userId),
                paymentStatus: "paid",
                createdAt: {
                    $gte: new Date(Date.UTC(currentYear, 0, 1, 0, 0, 0, 0)),
                    $lte: new Date(Date.UTC(currentYear, 11, 31, 23, 59, 59, 999)),
                },
            },
        },
        {
            $group: {
                _id: { $month: { date: "$createdAt", timezone: "Asia/Dhaka" } },
                totalSpent: { $sum: "$price" },
            },
        },
        {
            $sort: { "_id": 1 },
        },
    ]);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const formattedData = monthNames.map((month, index) => {
        const found = stats.find((item) => item._id === index + 1);
        return {
            month,
            amount: found ? found.totalSpent : 0,
        };
    });

    res.status(200).json({
        success: true,
        data: formattedData,
    });
});

export const getAdminMonthlyRevenue = catchAsync(async (req, res) => {
    const currentYear = new Date().getFullYear();

    const stats = await Order.aggregate([
        {
            $match: {
                paymentStatus: "paid",
                createdAt: {
                    $gte: new Date(Date.UTC(currentYear, 0, 1, 0, 0, 0, 0)),
                    $lte: new Date(Date.UTC(currentYear, 11, 31, 23, 59, 59, 999)),
                },
            },
        },
        {
            $group: {
                _id: { $month: { date: "$createdAt", timezone: "Asia/Dhaka" } },
                totalRevenue: { $sum: "$price" },
            },
        },
        {
            $sort: { "_id": 1 },
        },
    ]);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const formattedData = monthNames.map((month, index) => {
        const found = stats.find((item) => item._id === index + 1);
        return {
            month,
            amount: found ? found.totalRevenue : 0,
        };
    });

    res.status(200).json({
        success: true,
        data: formattedData,
    });
});