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

export const getSavedPackages = catchAsync(async (req, res) => {
    const userId = req.user.id;

    const savedPackages = await Savedpackage.find({ userId })
        .populate("packageId")
        .sort({ createdAt: -1 })
        .lean();

    const packages = savedPackages
        .filter((item) => item.packageId !== null)
        .map((item) => item.packageId);

    return res.status(200).json({
        success: true,
        count: packages.length,
        data: packages,
    });
});