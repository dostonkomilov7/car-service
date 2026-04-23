import { config } from "dotenv";
import { Pool } from "pg";

config({quiet: true});

export const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
});