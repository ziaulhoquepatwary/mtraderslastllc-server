import { z } from "zod";

export const orderValidationSchema = z.object({
    packageId: z.string({
        required_error: "Package ID is required",
    }).regex(/^[0-9a-fA-F]{24}$/, "Invalid Package ID format"),

    userPhone: z.string({
        required_error: "Phone number is required",
    }).min(1, "Phone number cannot be empty"),

    resourceLink: z.string({
        required_error: "Resource drive link is required",
    }).url("Invalid URL format for resource link"),
});