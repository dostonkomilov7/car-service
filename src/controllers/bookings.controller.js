import pool from "../configs/db.config.js";
import { sendEmail } from "../helpers/mail.helper.js";

class BookingController {
    constructor() { }

    getAllBookings = async (req, res) => {
        try {
            const { rows: bookings } = await pool.query("SELECT * FROM bookings");
    
            res.render("admin/dashboard", { bookings: bookings[0] });
        } catch (error) {
            return res.redirect("/api/dashboard?error='ERROR'")
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
                console.log('Booking is not found');
                return res.redirect("/api/create?error='Booking is not found'");
            }
            
            if (Date.now() > Number(booking[0]?.otp_expire)) {
                console.log('OTP expired');
                return res.redirect("/api/create?error='OTP expired'");
            }
            
            if (Number(booking[0]?.otp) !== Number(otp)) {
                console.log('OTP invalid');
                return res.redirect("/api/create?error='OTP invalid'");
            }
    
            await pool.query("UPDATE bookings SET otp = null, otp_expire = null, status = 'confirmed' WHERE id = $1", [bookingId])
    
            res.redirect("/api/home?message='SUCCESSFULLY BOOKED'");
            
        } catch (error) {
            return res.redirect("/api/create?error='ERROR'")
        }
    };

    sendOTP = async (req, res) => {
        try {
            const { email, serviceName } = req.body;
            const {rows: service_id} = await pool.query(`SELECT * FROM services WHERE service_name ILIKE '%${serviceName}%'`);
    
            if (!service_id[0].id) {
                return res.redirect("/api/create?error='SERVICE IS NOT FOUND'")
            }
    
            const userId = req.cookies?.userId;
    
            const otp = Math.floor(100000 + Math.random() * 900000);
            const expires = Date.now() + 10 * 60 * 1000;
    
            const { rows: booking } = await pool.query(
                "INSERT INTO bookings(user_id, service_id, status, otp, otp_expire) VALUES ($1, $2, $3, $4, $5) RETURNING *",
                [userId, service_id[0].id, "pending", otp, expires],
            );
    
            sendEmail(email, "VERIFY OTP", `6-DIGIT CODE: ${otp}`)
    
            return res.redirect(`/api/otp?id=${booking[0].id}`);
            
        } catch (error) {
            return res.redirect("/api/create?error='ERROR'")
        }
    };

    updateBooking = async (req, res) => {
        try {
            const { id } = req.params;
            const { rows: booking } = await pool.query("SELECT * FROM bookings WHERE id = $1", [id]);
    
            if (!booking[0]) {
                console.log('Booking is not found');
                return res.redirect("/api/dashboard?error='Booking is not found'");
            }
    
            if (booking[0].status.toLowerCase() === "confirmed") {
                await pool.query("UPDATE bookings SET status = 'Done' WHERE id = $1 ", [id])
            }
    
            res.redirect("/api/dashboard?success='SERVICE IS SUCCESSFULLY COMPLETED'");
        } catch (error) {
            return res.redirect("/api/dashboard?error='ERROR'")
        }
            
    };
}

export default new BookingController();