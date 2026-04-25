import { Router } from "express";
import authRouter from "./auth.route.js";
import serviceRouter from "./services.route.js";
import bookingRouter from "./bookings.route.js";
import { Protected } from "../middlewares/protected.middleware.js";
import pool from "../configs/db.config.js";
import { Role } from "../middlewares/roles.middleware.js";

const apiRouter = Router();

apiRouter
  .use("/auth", authRouter)
  .use("/services", serviceRouter)
  .use("/bookings", bookingRouter)

apiRouter.get("/home", Protected(true), async (req, res) => {
  const { error, message, success } = req.query;
  const { rows: services } = await pool.query("SELECT * FROM services");

  res.render("home", { title: "Home", services, error, message, success });
});

apiRouter.get("/login", (req, res) => {
  const { error, message, success } = req.query;

  res.render("auth/login", { title: "Login", error, message, success });
});

apiRouter.get("/register", (req, res) => {
  const { error, message, success } = req.query;

  res.render("auth/register", { title: "Register", error, message, success });
});

apiRouter.get("/create", Protected(true), (req, res) => {
  const { error, message, success } = req.query;

  res.render("booking/create", { title: "Booking", error, message, success });
});

apiRouter.get("/my-bookings", Protected(true), async (req, res) => {
  const userId = req.cookies.userId;
  const { error, message, success } = req.query;

  const { rows: bookings } = await pool.query(`
    SELECT s.service_name, b.date, b.status, u.device_name
    FROM bookings AS b
    JOIN services AS s ON b.service_id = s.id
    JOIN users AS u ON b.user_id = u.id
    WHERE u.id = ${userId}`,
  );

  if (!bookings[0]) {
    return res.render("booking/my-bookings", { error, message: "Bookings not found" });
  }

  const confirmedDate = bookings[0].date.toString()
  res.render("booking/my-bookings", { bookings: bookings, date: confirmedDate, error, message, success });
});

apiRouter.get("/otp", Protected(true), (req, res) => {
  const { id } = req.query;
  const { error, message, success } = req.query;

  res.render("booking/otp", { id, error, message, success });
});

apiRouter.get("/dashboard", Protected(true), Role("ADMIN"), async(req, res) => {
  const { error, message, success } = req.query;

  const { rows: bookings } = await pool.query(`
    SELECT b.id, s.service_name, b.date, b.status, u.device_name, u.name, email
    FROM bookings AS b
    JOIN services AS s ON b.service_id = s.id
    JOIN users AS u ON b.user_id = u.id
    WHERE status != 'Done'`,
  );


  if (!bookings[0]) {
    return res.render("admin/dashboard", { error, message: "Bookings not found" });
  }
  console.log(bookings[0].id);
  const confirmedDate = bookings[0].date.toString();

  res.render("admin/dashboard", { bookings: bookings, date: confirmedDate, error, message, success });
});

apiRouter.get("/create-service", Protected(true), Role("ADMIN"), (req, res) => {
  const { error, message, success } = req.query;

  res.render("admin/create-service", { title: "Create Service", error, message, success });
});

apiRouter.get("/logout", (req, res) => {
  res.redirect("/api/login");
});

export default apiRouter;