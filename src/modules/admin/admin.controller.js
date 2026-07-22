import mongoose from "mongoose";
import catchAsync from "../../utils/catchAsync.js";


export const getAllUser = catchAsync(async (req, res) => {
    const { search, role, page = 1, limit = 12 } = req.query;
    const db = mongoose.connection.collection("user");

    const query = {};

    if (search) {
        query.$or = [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } }
        ];
    }

    if (role) {
        query.role = role;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const parsedLimit = parseInt(limit);

    const [users, totalUsers] = await Promise.all([
        db.find(query).skip(skip).limit(parsedLimit).toArray(),
        db.countDocuments(query)
    ]);

    res.status(200).json({
        success: true,
        count: users.length,
        totalUsers,
        totalPages: Math.ceil(totalUsers / parsedLimit),
        currentPage: parseInt(page),
        data: users,
    });
});

export const updateUserRole = catchAsync(async (req, res) => {
    const { userId } = req.params;
    const { role } = req.body;

    const validRoles = ["user", "admin"];
    if (!validRoles.includes(role)) {
        return res.status(400).json({
            success: false,
            message: "Invalid role. Role must be user or admin"
        });
    }

    const db = mongoose.connection.collection("user");

    const result = await db.findOneAndUpdate(
        { _id: new mongoose.Types.ObjectId(userId) },
        { $set: { role: role } },
        { returnDocument: "after" }
    );

    if (!result) {
        return res.status(404).json({
            success: false,
            message: "User not found"
        });
    }

    res.status(200).json({
        success: true,
        message: `User role successfully updated to ${role}`,
        data: result
    });
});