import { Router } from "express";
import bookingsController from "../controllers/bookings.controller.js";
import { Protected } from "../middlewares/protected.middleware.js";
import { Role } from "../middlewares/roles.middleware.js";

const bookingRouter = Router();

bookingRouter
    .post("/confirm-otp", Protected(true), bookingsController.createBooking)
    .post("/send-otp", Protected(true), bookingsController.sendOTP)
    .patch("/status/:id", Protected(true), bookingsController.updateBooking) //ONLY FOR ADMINS

export default bookingRouter;