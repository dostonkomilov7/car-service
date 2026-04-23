import { Router } from "express";
import authRouter from "./auth.route.js";
import userRouter from "./users.route.js";
import serviceRouter from "./services.route.js";
import bookingRouter from "./bookings.route.js";

const apiRouter = Router();

apiRouter
    .use("/auth", authRouter)
    .use("/users", userRouter)
    .use("/services", serviceRouter)
    .use("/bookings", bookingRouter)

export default apiRouter;