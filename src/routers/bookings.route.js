import { Router } from "express";
import bookingsController from "../controllers/bookings.controller.js";

const bookingRouter = Router();

bookingRouter
    .get("/bookings/all", bookingsController.getAllBookings) //ONLY FOR ADMINS
    .get("/bookings", bookingsController.getProperBooking)
    .post("/bookings", bookingsController.createBooking)
    .patch("/bookings/:id/status", bookingsController.updateBooking) //ONLY FOR ADMINS

export default bookingRouter;