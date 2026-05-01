import { config } from "dotenv";
import { BlackholedSignatureError, ExpiredSignatureError } from "signed";
import signature from "../configs/signed.config.js";
import { ConflictRequest } from "../exceptions/conflict-request.exception.js";

config();

const BASE_URL = process.env.BASE_URL;

export const VerifySignatureMiddleware = (req, res, next) => {
    try {
        const fullUrl = `${BASE_URL}${req.originalUrl}`
        signature.verify(fullUrl);

        next()
    } catch (error) {
        if(error instanceof BlackholedSignatureError){
            req.redirect("/?error=Signature is not valid");
        }
        
        if(error instanceof ExpiredSignatureError){
            req.redirect("/?error=Signature is expired");
        }

        next(error);
    }
}