import pool from "../configs/db.config.js";

class ServiceController {
    constructor() {}

    createService = async (req, res) => {
        const { serviceName, description, price } = req.body;

        await pool.query(
            "INSERT INTO services(service_name, description, service_price) VALUES ($1, $2, $3)",
            [serviceName, description, price],
        );

        res.redirect("/api/dashboard?success='SERVICE IS SUCCESSFULLY CREATED'");
    };

    deleteService = async (req, res) => {
        const {serviceName} = req.body;

        const service_id = await pool.query("SELECT id FROM services WHERE service_name = $1", [serviceName]);

        if(!service_id){
            res.redirect("/api/home")
        }

        await pool.query("DELETE FROM services WHERE id = $1", [servie_id]);

        res.redirect("/api/dashboard")
    };
}

export default new ServiceController();