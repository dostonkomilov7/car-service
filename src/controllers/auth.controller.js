import pool from "../configs/db.config.js";
import jwtConfig from "../configs/jwt.config.js";
import { NotFoundException } from "../exceptions/not-found.exception.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { ConflictRequest } from "../exceptions/conflict-request.exception.js";
import { UAParser } from "ua-parser-js";

class AuthController {
    constructor() { }

    login = async (req, res) => {
        try {
            const { email, password } = req.body;

            const { rows: existingUser } = await pool.query(
                "SELECT * FROM users WHERE email = $1", [email]
            );

            if (!existingUser[0]) {
                return res.redirect("/api/login?error=Email is not found");
            }

            const isPassSame = await this.#_comparePassword(password, existingUser[0].password);

            if (!isPassSame) {
                return res.redirect("/api/login?error=Password is invalid");
            }

            const ua = new UAParser(req.headers["user-agent"]);
            const device = ua.getResult();

            await pool.query(
                "UPDATE users SET device_name = $1, device_type = $2",
                [device.device.model || device.device.vendor, device.device.type || "desktop"]
            );

            const accessToken = await this.#_generateAccessToken({ id: existingUser[0].id, role: existingUser[0].role, device: device.device.model });
            const refreshToken = await this.#_generateRefreshToken({ id: existingUser[0].id, role: existingUser[0].role, device: device.device.model });
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

            res.redirect("/api/home")

        } catch (error) {
            console.log(error)
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
                "INSERT INTO users(name, role, device_name, device_type, email, password) VALUES ($1, USER, $2, $3, $4, $5) RETURNING id",
                [name, device.device.model || device.device.vendor, device.device.type || "desktop", email, hashedPassword]
            );

            const accessToken = await this.#_generateAccessToken({ id: newUser[0].id, role: newUser[0].role, device: device.device.model });
            const refreshToken = await this.#_generateRefreshToken({ id: newUser[0].id, role: newUser[0].role, device: device.device.model });

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

            res.redirect("/api/home");

        } catch (error) {
            console.log(error)
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
            console.log(error)
        }

    };

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