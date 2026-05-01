import jwt from "jsonwebtoken";
import jwtConfig from "../configs/jwt.config.js";
import { BadRequestException } from "../exceptions/bad-request.exception.js";

export const Protected = (isProtected = true) => {
    return (req, res, next) => {
        if (!isProtected) return next()

        const token = req.cookies?.accessToken;
        if (!token) return res.redirect("/login");

        try {
            const payload = jwt.verify(token, jwtConfig.ACCESS_KEY);
            req.user = payload;
            next();
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                const refreshToken = req.cookies?.refreshToken;
                if (!refreshToken) return res.redirect("/login");

                try {
                    const payload = jwt.verify(refreshToken, jwtConfig.REFRESH_KEY);
                    const newAccessToken = jwt.sign(
                        { id: payload.id, role: payload.role },
                        jwtConfig.ACCESS_KEY,
                        { expiresIn: jwtConfig.ACCESS_EXPIRE_TIME }
                    );
                    res.cookie("accessToken", newAccessToken, {
                        httpOnly: true,
                        secure: false,
                        sameSite: "lax",
                        path: "/",
                        maxAge: 15 * 60 * 1000
                    });
                    req.user = payload;
                    return next();
                } catch {
                    return res.redirect("/login");
                }
            }

            if (error instanceof jwt.JsonWebTokenError) {
                return res.redirect("/login");
            }

            next(error);
        }
    }
}