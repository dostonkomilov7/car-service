import pool from "../configs/db.config.js";
import jwtConfig from "../configs/jwt.config.js";
import { NotFoundException } from "../exceptions/not-found.exception.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { ConflictRequest } from "../exceptions/conflict-request.exception.js";
import { UAParser } from "ua-parser-js";
import { config } from "dotenv";
import signature from "../configs/signed.config.js";
import { sendEmail } from "../helpers/mail.helper.js";

config({ quiet: true });

class AuthController {
    constructor() { }

    login = async (req, res) => {
        try {
            const { email, password } = req.body;

            const { rows: existingUser } = await pool.query(
                "SELECT * FROM users WHERE email = $1", [email]
            );

            if (!existingUser[0]) {
                return res.redirect("/login?error=Email is not found");
            }

            const isPassSame = await this.#_comparePassword(password, existingUser[0].password);

            if (!isPassSame) {
                return res.redirect("/login?error=Password is invalid");
            }

            const ua = new UAParser(req.headers["user-agent"]);
            const device = ua.getResult();

            await pool.query(
                "UPDATE users SET device_name = $1, device_type = $2",
                [device.device.model || device.device.vendor, device.device.type || "desktop"]
            );

            const accessToken = this.#_generateAccessToken({ id: existingUser[0].id, role: existingUser[0].role, device: device.device.model });
            const refreshToken = this.#_generateRefreshToken({ id: existingUser[0].id, role: existingUser[0].role, device: device.device.model });
            res.cookie("userId", existingUser[0].id, {
                httpOnly: false,
                secure: false,
                sameSite: "lax",
                path: "/",
                maxAge: 20 * 60 * 1000,

            });

            res.cookie("accessToken", accessToken, {
                httpOnly: false,
                secure: false,
                sameSite: "lax",
                path: "/",
                maxAge: 20 * 60 * 1000,

            });

            res.cookie("refreshToken", refreshToken, {
                httpOnly: false,
                secure: false,
                sameSite: "lax",
                path: "/",
                maxAge: 5 * 24 * 60 * 60 * 1000,
            });

            res.redirect("/")

        } catch (error) {
            return res.redirect("/login?error='ERROR'")
        }
    };

    register = async (req, res) => {
        try {
            const { name, email, password } = req.body;

            const { rows: existingUser } = await pool.query(
                "SELECT * FROM users WHERE email = $1", [email]
            );

            if (existingUser[0]?.id) {
                return res.redirect("/register")
            }

            const hashedPassword = await this.#_hashPassword(password);

            const ua = new UAParser(req.headers["user-agent"]);
            const device = ua.getResult();

            const { rows: newUser } = await pool.query(
                "INSERT INTO users(name, role, device_name, device_type, email, password) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
                [name, "USER", device.device.model || device.device.vendor, device.device.type || "desktop", email, hashedPassword]
            );

            const accessToken = this.#_generateAccessToken({ id: newUser[0].id, role: newUser[0].role, device: device.device.model });
            const refreshToken = this.#_generateRefreshToken({ id: newUser[0].id, role: newUser[0].role, device: device.device.model });

            res.cookie("userId", newUser[0].id, {
                httpOnly: false,
                secure: false,
                sameSite: "lax",
                path: "/",
                maxAge: 20 * 60 * 1000,

            });

            res.cookie("accessToken", accessToken, {
                httpOnly: false,
                secure: false,
                sameSite: "lax",
                accessToken,
                path: "/",
                maxAge: 20 * 60 * 1000,
            });

            res.cookie("refreshToken", refreshToken, {
                httpOnly: false,
                secure: false,
                sameSite: "lax",
                refreshToken,
                path: "/",
                maxAge: 20 * 60 * 1000,
            });

            res.redirect("/");

        } catch (error) {
            return res.redirect("/login?error='ERROR'")
        }
    };

    refresh = async (req, res) => {
        try {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                throw new BadRequestException("Token not given");
            }

            const payload = jwt.verify(
                refreshToken,
                jwtConfig.REFRESH_KEY
            );

            const accessToken = this.#_generateAccessToken({ id: payload.id });

            res.send({
                success: true,
                data: {
                    accessToken
                }
            });
        } catch (error) {
            return res.redirect("/?error='ERROR'")
        }

    };

    forgot = async (req, res) => {
        try {
            const BASE_URL = process.env.BASE_URL;
            const { email } = req.body;

            
            const { rows: foundedUser } = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
            const db = await pool.query("SELECT current_database()");

            if (!foundedUser[0]) {
                return res.redirect("/forgot-password?error=EMAIL IS NOT FOUND");
            }

            const signedUrl = signature.sign(
                `${BASE_URL}/reset-password?userId=${foundedUser[0].id}`,
                { ttl: 300 },
            );

            const form = `
                <p>Hello ${foundedUser[0].name},</p>
                <p>Click below to reset your password. Link expires in 30 minutes.</p>
                <a href="${signedUrl}" style="background:#f0a500;color:#0e0e0f;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;">
                    Reset Password
                </a>
                <p>If you didn't request this, ignore this email.</p>
            `

            sendEmail(email, "Signed URL", form);
            res.redirect(`/forgot-password?email=${email}`)
        } catch (error) {
            return res.redirect("/forgot-password?error=ERROR");
        }
    }

    reset = async (req, res) => {
        try {
            const { userId } = req.query;
            const { password } = req.body;

            const hashedPass = await this.#_hashPassword(password);

            await pool.query(
                "UPDATE users SET password = $1 WHERE id = $2",
                [hashedPass, userId]
            );

            res.redirect("/login?success=PASSWORD SUCCESSFULLY UPDATED");
        } catch (error) {
            return res.redirect("/reset-password?error=ERROR");
        }
    }

    seedAdmins = async () => {
        const admins = [
            {
                name: "admin",
                email: process.env.ADMIN_EMAIL,
                password: process.env.ADMIN_PASS,
            }
        ];

        for (let a of admins) {
            const { rows: existingUser } = await pool.query(
                "SELECT * FROM users WHERE email = $1", [a.email],
            );

            const ua = new UAParser("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.4 Safari/605.1.15");
            const device = ua.getResult();

            if (!existingUser[0]) {
                const hashedPass = await this.#_hashPassword(a.password)
                await pool.query(
                    "INSERT INTO users(name, email, password, role, device_name, device_type) VALUES ($1, $2, $3, $4, $5, $6)",
                    [a.name, a.email, hashedPass, "ADMIN", device.device.model || device.device.vendor, device.device.type || "desktop"],
                )
            }
        }

        console.log("ADMIN SEEDED ✅")
    }

    #_generateAccessToken = (payload) => {
        const token = jwt.sign(
            payload,
            jwtConfig.ACCESS_KEY,
            {
                algorithm: "HS256",
                expiresIn: jwtConfig.ACCESS_EXPIRE_TIME
            }
        )

        return token
    };

    #_generateRefreshToken = (payload) => {
        const token = jwt.sign(
            payload,
            jwtConfig.REFRESH_KEY,
            {
                algorithm: "HS256",
                expiresIn: jwtConfig.REFRESH_EXPIRE_TIME
            }
        )

        return token
    };

    #_hashPassword = async (pass) => {
        const hashedPass = await bcrypt.hash(pass, 10);

        return hashedPass
    };

    #_comparePassword = async (originalPass, hashedPass) => {
        const isSame = await bcrypt.compare(originalPass, hashedPass);

        return isSame
    };
}

export default new AuthController();