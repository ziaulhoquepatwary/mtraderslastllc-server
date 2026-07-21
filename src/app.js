import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { toNodeHandler } from "better-auth/node";
import packageRoute from "./modules/services-packages/package.routes.js";
import savePackageRouter from "./modules/savePackage/savePackage.routes.js";
import orderRouter from "./modules/orders/order.routes.js";
import ReviewRoutes from "./modules/reviews/review.route.js";

const createApp = (auth) => {
    const app = express();

    app.use(cors({
        origin: [
            process.env.FRONTEND_URL,
            "http://localhost:3000",
        ].filter(Boolean),
        credentials: true
    }));

    app.use(cookieParser());
    app.use(express.json());

    app.all("/api/auth/*splat", toNodeHandler(auth));
    app.use("/api/package", packageRoute);
    app.use("/api/savePackage", savePackageRouter);
    app.use("/api/order", orderRouter);
    app.use("/api/reviews", ReviewRoutes);

    app.get("/", (req, res) => {
        res.send("M traders server is running successfully");
    });

    return app;
}

export default createApp;