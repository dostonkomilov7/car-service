import { pool } from "../configs/db.config";

const TABLE_SCHEMAS = `
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(128) NOT NULL,
        role VARCHAR(128) NOT NULL,
        device_name VARCHAR(128) NOT NULL,
        device_type VARCHAR(128) NOT NULL,
        email VARCHAR(128) UNIQUE NOT NULL,
        password VARCHAR(128) UNIQUE NOT NULL
    );

    CREATE TABLE IF NOT EXISTS services (
        id SERIAL PRIMARY KEY,
        service_name VARCHAR(128) NOT NULL,
        image VARCHAR(128)
    );

    CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id)
        ON DELETE SET NULL
        ON UPDATE NO ACTION,
        service_id INT REFERENCES services(id)
        ON DELETE SET NULL
        ON UPDATE NO ACTION,
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(128) NOT NULL
    );
`

const migrate = async () => {
    try {
        await pool.query(TABLE_SCHEMAS);
        return "ALL TABLES MIGRATED ✅"
    } catch (error) {
        console.log(error);
        return "ERROR IN TABLE MIGRATION ❌"
    }
}

migrate()
    .then((res) => res)
    .catch((err) => console.log(err))