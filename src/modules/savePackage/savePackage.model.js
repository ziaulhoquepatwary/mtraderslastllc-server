import mongoose, { model, Schema } from "mongoose";

const savePackageSchema = new Schema(
    {
        userId: { type: String, required: [true, "User ID is required"] },
        packageId: {
            type: Schema.Types.ObjectId,
            ref: "Package",
            required: [true, "Package ID is required"],
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

savePackageSchema.index({ userId: 1, packageId: 1 }, { unique: true });

const Savedpackage = mongoose.model("Savedpackage", savePackageSchema);
export default Savedpackage;