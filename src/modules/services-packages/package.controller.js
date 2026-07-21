import mongoose from "mongoose";
import AppError from "../../utils/AppError.js";
import catchAsync from "../../utils/catchAsync.js";
import { packageValidationSchema } from "./package.validation.js";
import Package from "./package.model.js";


export const createPackage = catchAsync(async (req, res) => {
    const body = req.body;

    const parsed = packageValidationSchema.safeParse(body);

    if (!parsed.success) {
        throw new AppError(400, `Validation failed: ${parsed.error.message}`);
    }

    const newPackage = await Package.create({
        ...parsed.data,
        status: "active"   // ["active", "draft"]
    });

    return res.status(201).json({
        success: true,
        message: "New Package Create Successfully",
        data: newPackage,
    });
});

export const getAllPackages = catchAsync(async (req, res) => {
    const { search, category, sortByPrice, page = 1, limit = 12 } = req.query;

    const pageNumber = Math.max(1, parseInt(page));
    const limitNumber = Math.max(1, parseInt(limit));
    const skip = (pageNumber - 1) * limitNumber;

    const queryConditions = { status: "active" };

    if (search) {
        queryConditions.$or = [
            { title: { $regex: search, $options: "i" } },
            { shortDescription: { $regex: search, $options: "i" } }
        ];
    }

    if (category) {
        queryConditions.serviceCategory = category;
    }

    let sortOptions = { createdAt: -1 };

    if (sortByPrice === "low-to-high") {
        sortOptions = { price: 1 };
    } else if (sortByPrice === "high-to-low") {
        sortOptions = { price: -1 };
    }

    // Essential fields for card view
    const fieldsToSelect = "title serviceCategory image shortDescription price deliveryTime status technologies createdAt";

    const [packages, totalPackages] = await Promise.all([
        Package.find(queryConditions)
            .select(fieldsToSelect)
            .sort(sortOptions)
            .skip(skip)
            .limit(limitNumber)
            .lean(),
        Package.countDocuments(queryConditions)
    ]);

    return res.status(200).json({
        success: true,
        message: "Packages fetched successfully",
        meta: {
            totalPackages,
            totalPages: Math.ceil(totalPackages / limitNumber),
            currentPage: pageNumber,
            limit: limitNumber,
        },
        data: packages,
    });
});

export const getPackageDetails = catchAsync(async (req, res) => {
    const { id } = req.params;

    const singlePackage = await Package.findById(id).lean();

    if (!singlePackage) {
        throw new AppError(404, "Package not found");
    }

    return res.status(200).json({
        success: true,
        message: "Package details fetched successfully",
        data: singlePackage,
    });
});

export const updatePackage = catchAsync(async (req, res) => {
    const { id } = req.params;
    const body = req.body;

    const parsed = packageValidationSchema.partial().safeParse(body);

    if (!parsed.success) {
        throw new AppError(400, `Validation failed ${parsed.error}`);
    }

    const updatedPackage = await Package.findByIdAndUpdate(
        id,
        { $set: parsed.data },
        { new: true, runValidators: true }
    );

    if (!updatedPackage) {
        throw new AppError(404, "Package not found");
    }

    return res.status(200).json({
        success: true,
        message: "Package updated successfully",
        data: updatedPackage,
    });
});

export const updatePackageStatus = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!["active", "draft"].includes(status)) {
        throw new AppError(400, "Invalid status value. Must be 'active' or 'draft'");
    }

    const updatedPackage = await Package.findByIdAndUpdate(
        id,
        { $set: { status } },
        { new: true, runValidators: true }
    );

    if (!updatedPackage) {
        throw new AppError(404, "Package not found");
    }

    return res.status(200).json({
        success: true,
        message: `Package status updated to ${status} successfully`,
        data: updatedPackage,
    });
});

export const deletePackage = catchAsync(async (req, res) => {
    const { id } = req.params;

    const deletedPackage = await Package.findByIdAndDelete(id);

    if (!deletedPackage) {
        throw new AppError(404, "Package not found");
    }

    return res.status(200).json({
        success: true,
        message: "Package deleted successfully",
        data: null,
    });
});