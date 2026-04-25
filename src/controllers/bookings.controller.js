import pool from "../configs/db.config.js";
import { sendEmail } from "../helpers/mail.helper.js";

class BookingController {
    constructor() { }

    getAllBookings = async (req, res) => {
        const { rows: bookings } = await pool.query("SELECT * FROM bookings");

        res.render("admin/dashboard", { bookings: bookings[0] });
    };

    getProperBooking = async (req, res) => {
        const { rows: bookings } = await pool.query("SELECT * FROM bookings");

        res.render("admin/dashboard", { bookings: bookings[0] });
    };

    createBooking = async (req, res) => {
        const { bookingId, otp } = req.body;
        console.log(bookingId, "BIIIIIDDDDDD")
        
        if (!/^\d{6}$/.test(otp)) {
            return res.redirect(`/booking/create?error='Incorrect format'`);
        }
        
        const { rows: booking } = await pool.query("SELECT * FROM bookings WHERE id = $1", [bookingId]);
        console.log(booking[0]?.otp, "OTPPPPREAALLLL")

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
    };

    sendOTP = async (req, res) => {
        const { email, serviceName } = req.body;
        console.log(serviceName)
        const {rows: service_id} = await pool.query(`SELECT * FROM services WHERE service_name ILIKE '%${serviceName}%'`);

        if (!service_id[0]) {
            console.log("id yoq")
            return res.redirect("/api/create")
        }

        const userId = req.cookies?.userId;

        const otp = Math.floor(100000 + Math.random() * 900000);
        const expires = Date.now() + 10 * 60 * 1000;

        const { rows: booking } = await pool.query(
            "INSERT INTO bookings(user_id, service_id, status, otp, otp_expire) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [userId, service_id[0].id, "Pending", otp, expires],
        );

        sendEmail("dostonkomilov070@gmail.com", "VERIFY OTP", `6-DIGIT CODE: ${otp}`)

        return res.redirect(`/api/otp?id=${booking[0].id}`);
    };

    updateBooking = async (req, res) => {
        const { userId, serviceId, status } = req.body;

        if (status === "Confirmed") {
            await pool.query("UPDATE bookings SET status = 'Done' ")
        }

        res.redirect("/api/dashboard");
    };
}

export default new BookingController();