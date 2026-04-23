import { config } from "dotenv";

config({quiet: true});

export default {
    ACCESS_KEY: process.env.SECRET_KEY,
    ACCESS_EXPIRE_TIME: process.env.EXPIRE_TIME || "1d",
    REFRESH_KEY: process.env.REFRESH_KEY,
    REFRESH_EXPIRE_TIME: process.env.REFRESH_EXPIRE_TIME || "3d",
};