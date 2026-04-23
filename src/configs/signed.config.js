import { config } from "dotenv";
import signed from "signed";

config({quiet: true});

const signature = signed.default({
    secret: process.env.SIGN_URL_SECRET
});

export default signature;