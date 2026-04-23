import { config } from "dotenv";
import nodemailer from "nodemailer";

config({quiet: true});

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL,
        pass: process.env.APP_PASS,
    }
});

export default transporter;