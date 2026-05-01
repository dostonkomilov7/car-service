import pool from "../configs/db.config.js";
import { sendEmail } from "../helpers/mail.helper.js";

class BookingController {
    constructor() { }

    getAllBookings = async (req, res) => {
        try {
            const { rows: bookings } = await pool.query("SELECT * FROM bookings");
    
            res.render("admin/dashboard", { bookings: bookings[0] });
        } catch (error) {
            return res.redirect("/dashboard?error='ERROR'")
        }
    };

    createBooking = async (req, res) => {
        try {
            const { bookingId, otp } = req.body;
            
            if (!/^\d{6}$/.test(otp)) {
                return res.redirect(`/booking/create?error='Incorrect format'`);
            }
            
            const { rows: booking } = await pool.query("SELECT * FROM bookings WHERE id = $1", [bookingId]);
    
            if (!booking[0]) {
                return res.redirect("/create?error='Booking is not found'");
            }
            
            const { rows: email } = await pool.query("SELECT * FROM users WHERE id = $1", [booking[0]?.user_id]);
            
            if (Date.now() > Number(booking[0]?.otp_expire)) {
                await pool.query(`DELETE FROM bookings WHERE id = $1`, [bookingId]);
                return res.redirect("/create?error='OTP expired'");
            }
            
            if (Number(booking[0]?.otp) !== Number(otp)) {
                await pool.query(`DELETE FROM bookings WHERE id = $1`, [bookingId]);
                return res.redirect("/create?error='OTP invalid'");
            }
            // email[0]?.email
            await pool.query("UPDATE bookings SET otp = null, otp_expire = null WHERE id = $1", [bookingId])
            sendEmail("dostonkomilov070@gmail.com", "AUTO PRO", "HELLO, YOUR BOOKING IS PENDING ⏳. WE WILL RESPOND SOON");

            res.redirect("/?message='SUCCESSFULLY BOOKED'");
            
        } catch (error) {
            await pool.query(`DELETE FROM bookings WHERE id = $1`, [req.body.bookingId]);
            return res.redirect("/create?error='ERROR'")
        }
    };

    sendOTP = async (req, res) => {
        try {
            const { email, serviceName } = req.body;
            const {rows: service_id} = await pool.query(`SELECT * FROM services WHERE service_name ILIKE '%${serviceName}%'`);
    
            if (!service_id[0].id) {
                return res.redirect("/create?error='SERVICE IS NOT FOUND'")
            }
    
            const userId = req.cookies?.userId;
    
            const otp = Math.floor(100000 + Math.random() * 900000);
            const expires = Date.now() + 10 * 60 * 1000;
    
            const { rows: booking } = await pool.query(
                "INSERT INTO bookings(user_id, service_id, status, otp, otp_expire) VALUES ($1, $2, $3, $4, $5) RETURNING *",
                [userId, service_id[0].id, "pending", otp, expires],
            );
    
            sendEmail(email, "VERIFY OTP", `6-DIGIT CODE: ${otp}`)
    
            return res.redirect(`/otp?id=${booking[0].id}`);
            
        } catch (error) {
            return res.redirect("/create?error='ERROR'")
        }
    };

    updateBooking = async (req, res) => {
        try {
            const { id } = req.params;
            const { email } = req.query;
            const { rows: booking } = await pool.query("SELECT * FROM bookings WHERE id = $1", [id]);

            if (!booking[0]) {
                return res.redirect("/dashboard?error='Booking is not found'");
            }
    
            if (booking[0].status.toLowerCase() === "confirmed") {
                await pool.query("UPDATE bookings SET status = 'Done' WHERE id = $1 ", [id]);
                sendEmail(email, "AUTO PRO", "HELLO, YOUR BOOKING IS DONE ✅. YOU MAY CHECK OUR SERVICES AND TAKE A CAR");
                return res.redirect("/dashboard?success='SERVICE IS SUCCESSFULLY COMPLETED'");
            }
            
            if (booking[0].status.toLowerCase() === "pending") {
                await pool.query("UPDATE bookings SET status = 'confirmed' WHERE id = $1 ", [id])
                sendEmail(email, "AUTO PRO", "HELLO, YOUR BOOKING IS CONFIRMED ✅. SOON, WE WILL START WORK");
                return res.redirect("/dashboard?success='SERVICE IS SUCCESSFULLY CONFIRMED'");
            }
    
            res.redirect("/dashboard?error='ERROR'")
        } catch (error) {
            return res.redirect("/dashboard?error='ERROR'")
        }
            
    };
}

export default new BookingController();