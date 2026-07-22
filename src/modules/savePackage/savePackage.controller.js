import mongoose from "mongoose";
import AppError from "../../utils/AppError.js";
import catchAsync from "../../utils/catchAsync.js";
import Savedpackage from "./savePackage.model.js";

export const toggleSavePackage = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const { packageId } = req.params;

    if (!packageId) {
        throw new AppError(400, "Package ID is required");
    }

    if (!mongoose.Types.ObjectId.isValid(packageId)) {
        throw new AppError(400, "Invalid Package ID format");
    }

    const existingSave = await Savedpackage.findOneAndDelete({ userId, packageId });

    if (existingSave) {
        return res.status(200).json({
            success: true,
            isSaved: false,
            message: "Package removed from saved list",
        });
    }

    await Savedpackage.create({ userId, packageId });

    return res.status(201).json({
        success: true,
        isSaved: true,
        message: "Package saved successfully",
    });
});

export const checkSavedPackage = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const { packageId } = req.params;

    if (!packageId || !mongoose.Types.ObjectId.isValid(packageId)) {
        throw new AppError(400, "Invalid or missing Package ID");
    }

    const existingSave = await Savedpackage.findOne({ userId, packageId });

    return res.status(200).json({
        success: true,
        isSaved: !!existingSave,
    });
});

export const getSavedPackages = catchAsync(async (req, res) => {
    const userId = req.user.id;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const savedPackages = await Savedpackage.find({ userId })
        .populate("packageId")
        .sort({ createdAt: -1 })
        .lean();

    const validPackages = savedPackages
        .filter((item) => item.packageId && typeof item.packageId === "object")
        .map((item) => item.packageId);

    const total = validPackages.length;
    const paginatedPackages = validPackages.slice(skip, skip + limit);

    return res.status(200).json({
        success: true,
        message: "Saved packages fetched successfully",
        meta: {
            page,
            limit,
            total,
            totalPage: Math.ceil(total / limit) || 1,
        },
        data: paginatedPackages,
    });
});