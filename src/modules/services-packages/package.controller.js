import mongoose from "mongoose";
import AppError from "../../utils/AppError.js";
import catchAsync from "../../utils/catchAsync.js";
import { packageValidationSchema } from "./package.validation.js";
import Package from "./package.model.js";


export const createPackage = catchAsync(async (req, res) => {
    const body = req.body;

    const parsed = packageValidationSchema.safeParse(body);

    if (!parsed.success) {
        throw new AppError(404, `Validation failed ${parsed.error}`);
    };

    const newPackage = await Package.create({
        ...parsed.data,
        status: "active"   // ["active", "draft"]
    });

    return res.status(201).json({
        success: true,
        message: "New Package Create Successfully",
        data: newPackage,
    });
})