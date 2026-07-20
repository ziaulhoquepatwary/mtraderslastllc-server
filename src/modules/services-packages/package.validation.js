import { z } from "zod";

export const packageValidationSchema = z.object({
    title: z
        .string({ error: "Title is required." })
        .trim()
        .min(3, "Title must be at least 3 characters long.")
        .max(100, "Title cannot exceed 100 characters."),
    serviceCategory: z.enum([
        "Web Development",
        "Search Engine Optimization",
        "Software Development",
        "Business Automation",
        "IT Infrastructure Development",
        "ERP Solution",
        "Mobile App Development",
        "E-commerce Solution",
        "Cloud Service"
    ], {
        error: "Service category is required."
    }),
    image: z
        .string({ error: "Image is required." })
        .trim()
        .min(1, "Image is required."),
    shortDescription: z
        .string({ error: "Short description is required." })
        .trim()
        .min(10, "Short description must be at least 10 characters.")
        .max(200, "Short description cannot exceed 200 characters."),
    description: z
        .string({ error: "Description is required." })
        .trim()
        .min(30, "Description must be at least 30 characters."),
    price: z.coerce
        .number({ error: "Price is required." })
        .min(0, "Price cannot be negative."),
    deliveryTime: z
        .string({ error: "Delivery time is required." })
        .trim()
        .min(1, "Delivery time is required."),
    technologies: z
        .array(z.string().trim().min(1, "Technology cannot be empty."))
        .default([]),
    features: z
        .array(z.string().trim().min(1, "Feature cannot be empty."))
        .default([]),
    whoIsThisFor: z
        .array(z.string().trim().min(1, "WhoIsThisFor item cannot be empty."))
        .default([]),
    addOns: z
        .array(z.string().trim().min(1, "Add-on cannot be empty."))
        .default([]),
    requirements: z
        .array(z.string().trim().min(1, "Requirement cannot be empty."))
        .default([]),
});