import mongoose, { Schema } from "mongoose";

const orderSchema = new Schema(
    {
        packageId: {
            type: Schema.Types.ObjectId,
            ref: "Package",
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        image: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        deliveryTime: {
            type: String,
            required: true,
        },
        deliveryDate: {
            type: Date,
            default: null,
        },
        userId: {
            type: String,
            required: true,
            index: true,
        },
        userName: {
            type: String,
            required: true,
        },
        userEmail: {
            type: String,
            required: true,
        },
        userPhone: {
            type: String,
            required: true,
        },
        resourceLink: {
            type: String,
            required: true,
            trim: true,
        },
        status: {
            type: String,
            enum: [
                "pending",
                "contacted",
                "confirmed",
                "in_progress",
                "completed",
                "cancelled",
            ],
            default: "pending",
        },
        paymentStatus: {
            type: String,
            enum: ["pending", "paid", "failed", "refunded"],
            default: "pending",
        },
        stripeSessionId: {
            type: String,
            default: null,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

orderSchema.index({ status: 1, paymentStatus: 1 });

const Order = mongoose.model("Order", orderSchema);
export default Order;