import { config } from "dotenv";
import { Pool } from "pg";

config({ quiet: true });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
});

export default pool;