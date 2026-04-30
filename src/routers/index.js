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
  try {
    const { error, message, success } = req.query;
    const { rows: services } = await pool.query("SELECT * FROM services");
  
    res.render("home", { title: "Home", services, error, message, success });
  } catch (error) {
    res.render("home", { error: "ERROR" });
  }
});

apiRouter.get("/login", async(req, res) => {
  try {
    const { error, message, success } = req.query;
    // const userId = req.cookies.userId;

    // const { rows: admin } = await pool.query("SELECT * FROM users WHERE id = $1", [userId]);

    // if(admin[0].role === "ADMIN"){
    //   window.history.replaceState({}, '', 'api/dashboard');
    //   return res.render("admin/dashboard", { title: "Dashboard", error, message, success });
    // }
  
    res.render("auth/login", { title: "Login", error, message, success });
    
  } catch (error) {
    res.render("auth/login", { error: ERROR });
  }
});

apiRouter.get("/register", (req, res) => {
  try {
    const { error, message, success } = req.query;
  
    res.render("auth/register", { title: "Register", error, message, success });
    
  } catch (error) {
    res.render("auth/register", { error: "ERROR" });
  }
});

apiRouter.get("/create", Protected(true), (req, res) => {
  try {
    const { error, message, success } = req.query;
  
    res.render("booking/create", { title: "Booking", error, message, success });
  } catch (error) {
    res.render("booking/create", { error: "ERROR" });
  }
});

apiRouter.get("/my-bookings", Protected(true), async (req, res) => {
  try {
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
    
  } catch (error) {
    res.render("booking/my-bookings", { error: "ERROR" });
  }
});

apiRouter.get("/otp", Protected(true), (req, res) => {
  try {
    const { id } = req.query;
    const { error, message, success } = req.query;
  
    res.render("booking/otp", { id, error, message, success });
    
  } catch (error) {
    res.render("booking-otp", { error: "ERROR" });
  }
});

apiRouter.get("/dashboard", Protected(true), Role("ADMIN"), async(req, res) => {
  try {
    const { error, message, success } = req.query;
  
    const { rows: bookings } = await pool.query(`
      SELECT b.id, s.service_name, b.date, b.status, u.device_name, u.name, email
      FROM bookings AS b
      JOIN services AS s ON b.service_id = s.id
      JOIN users AS u ON b.user_id = u.id
      WHERE status != 'Done'`,
    );
  
    const { rows: totalBookings } = await pool.query("SELECT COUNT(id) FROM bookings")
    const { rows: countPending } = await pool.query("SELECT COUNT(id) FROM bookings WHERE status = 'pending'")
    const { rows: countConfirmed } = await pool.query("SELECT COUNT(id) FROM bookings WHERE status = 'confirmed'")
    const { rows: countDone } = await pool.query("SELECT COUNT(id) FROM bookings WHERE status = 'Done'")
    const stats = {
      total: totalBookings[0].count,
      pending: countPending[0].count,
      confirmed: countConfirmed[0].count,
      done: countDone[0].count
    }
  
    if (!bookings[0]) {
      return res.render("admin/dashboard", { stats, error, message: "Bookings not found" });
    }
    
    const confirmedDate = bookings[0].date.toString();
  
    res.render("admin/dashboard", { bookings: bookings, date: confirmedDate, stats, error, message, success });
    
  } catch (error) {
    res.render("admin/dashboard", { error: "ERROR" });
  }
});

apiRouter.get("/create-service", Protected(true), Role("ADMIN"), (req, res) => {
  try {
    const { error, message, success } = req.query;
  
    res.render("admin/create-service", { title: "Create Service", error, message, success });
  } catch (error) {
    res.render("admin/create-service", { error: "ERROR" });
  }
});

apiRouter.get("/delete-service", Protected(true), Role("ADMIN"), (req, res) => {
  try {
    const { error, message, success } = req.query;
  
    res.render("admin/delete-service", { title: "DELETE Service", error, message, success });
  } catch (error) {
    res.render("admin/delete-service", { error: "ERROR" });
  }
});

apiRouter.get("/logout", (req, res) => {
  res.redirect("/api/login");
});

export default apiRouter;