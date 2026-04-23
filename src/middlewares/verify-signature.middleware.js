import { config } from "dotenv";
import { BlackholedSignatureError, ExpiredSignatureError } from "signed";
import signature from "../configs/signed.config.js";
import { ConflictRequest } from "../exceptions/conflict-request.exception.js";

config();

const BASE_URL = process.env.BASE_URL;

export const VerifySignatureMiddleware = (req, res, next) => {
    try {
        const fullUrl = `${BASE_URL}/auth${req.url}`

        signature.verify(fullUrl);

        next()
    } catch (error) {
        if(error instanceof BlackholedSignatureError){
            throw new ConflictRequest("Signature is not valid");
        }

        if(error instanceof ExpiredSignatureError){
            throw new ConflictRequest("Signature is expired");
        }

        next(error);
    }
}