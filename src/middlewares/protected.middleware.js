import jwt from "jsonwebtoken";
import jwtConfig from "../configs/jwt.config.js";
import { BadRequestException } from "../exceptions/bad-request.exception.js";
import { UnauthorizedException } from "../exceptions/unauthorized.exception.js";

export const Protected = (isProtected = true) => {
    return (req, res, next) => {
        if(!isProtected) return next()

        const {authorization} = req.headers;

        if(!authorization){
            throw new BadRequestException("Token is not given")
        }

        const token = authorization.split(" ")[1];

        try {
            const payload = jwt.verify(token, jwtConfig.ACCESS_KEY);

            req.user = payload;

            next();
        } catch (error) {
            if(error instanceof jwt.JsonWebTokenError){
                throw new BadRequestException("JWT is invalid")
            }

            if(error instanceof jwt.TokenExpiredError){
                throw new UnauthorizedException("Token have already expired")
            }

            res.status(500).send({
                success: false,
                message: "Internal server error"
            });
        }
    }
}