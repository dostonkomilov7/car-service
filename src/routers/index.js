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
  const {error, message} = req.query;
  const {rows: services} = await pool.query("SELECT * FROM services");

  res.render("home", { title: "Home", services, error, message });
});

apiRouter.get("/login", (req, res) => {
  const {error, message} = req.query;

  res.render("auth/login", { title: "Login", error, message });
});

apiRouter.get("/register", (req, res) => {
  const {error, message} = req.query;

  res.render("auth/register", { title: "Register", error, message });
});

apiRouter.get("/create", Protected(true), (req, res) => {
  const {error, message} = req.query;

  res.render("booking/create", { title: "Booking", error, message });
});

apiRouter.get("/my-bookings", Protected(true), async (req, res) => {
  const userId = req.cookies.userId;
  const {error, message} = req.query;

  const { rows: bookings } = await pool.query(`
    SELECT s.service_name, b.date, b.status, u.device_name
    FROM bookings AS b
    JOIN services AS s ON b.service_id = s.id
    JOIN users AS u ON b.user_id = u.id
    WHERE u.id = ${userId}`,
  );

  if(!bookings[0]){
    return res.render("booking/my-bookings", {error, message: "Bookings not found"});
  }

  const confirmedDate = bookings[0].date.toString().split("T").at(0)
  res.render("booking/my-bookings", {bookings: bookings, date: confirmedDate, error, message});
});

apiRouter.get("/otp", Protected(true), (req, res) => {
  const { id } = req.query;
  const {error, message} = req.query;

  res.render("booking/otp", { id, error, message });
});

apiRouter.get("/dashboard", Protected(true), Role("ADMIN"), (req, res) => {
  res.render("admin/dashboard");
});

apiRouter.get("/logout", (req, res) => {
  res.redirect("/api/login");
});

// const tempBookings = [];
// const bookings = [];


// // Booking form
// apiRouter.get("/create", isAuth, (req, res) => {
//   res.render("booking/create");
// });

// // Send OTP
// apiRouter.post("/send-otp", isAuth, (req, res) => {
//   const { name, email, date } = req.body;

//   if (!name || !email || !date) {
//     return res.render("booking/create", { error: "Invalid data" });
//   }

//   const otp = Math.floor(100000 + Math.random() * 900000);
//   const id = uuid();

//   const device = req.headers["user-agent"];

//   tempBookings.push({ id, name, email, date, otp, device });

//   console.log("OTP:", otp); // simulate email

//   res.render("booking/otp", { bookingId: id });
// });

// // Confirm OTP
// apiRouter.post("/confirm", isAuth, (req, res) => {
//   const { bookingId, otp } = req.body;

//   const booking = tempBookings.find(b => b.id === bookingId);

//   if (!booking || booking.otp != otp) {
//     return res.render("booking/otp", {
//       bookingId,
//       error: "Invalid OTP"
//     });
//   }

//   bookings.push(booking);

//   res.redirect("/booking/my-bookings");
// });

// // My bookings
// apiRouter.get("/my-bookings", isAuth, (req, res) => {
//   res.render("booking/my-bookings", { bookings });
// });


// // Fake shared bookings (should be DB in real app)

// Middlewares
// function isAuth(req, res, next) {
//   if (!req.session.user) return res.redirect("/login");
//   next();
// }

// function isAdmin(req, res, next) {
//   if (req.session.user.role !== "ADMIN") {
//     return res.send("Access denied");
//   }
//   next();
// }

// Dashboard

export default apiRouter;