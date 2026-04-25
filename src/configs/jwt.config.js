import { config } from "dotenv";

config({quiet: true});

export default {
    ACCESS_KEY: process.env.SECRET_KEY,
    ACCESS_EXPIRE_TIME: Number(process.env.EXPIRE_TIME )|| 500,
    REFRESH_KEY: process.env.REFRESH_KEY,
    REFRESH_EXPIRE_TIME: process.env.REFRESH_EXPIRE_TIME || "3d",
};