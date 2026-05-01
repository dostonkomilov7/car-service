import pool from "../configs/db.config.js";

class ServiceController {
    constructor() {}

    createService = async (req, res) => {
        try {
            const { serviceName, description, price } = req.body;
    
            await pool.query(
                "INSERT INTO services(service_name, description, service_price) VALUES ($1, $2, $3)",
                [serviceName, description, price],
            );
    
            res.redirect("/dashboard?success='SERVICE IS SUCCESSFULLY CREATED'");
        } catch (error) {
            return res.redirect("/dashboard?error='ERROR'")
        }
    };

    deleteService = async (req, res) => {
        try {
            const {serviceName} = req.body;
            const {rows: service_id} = await pool.query("SELECT id FROM services WHERE service_name = $1", [serviceName]);
            if(!service_id[0].id){
                res.redirect("/dashboard?error=SERVICE IS NOT FOUND")
            }
    
            await pool.query("DELETE FROM services WHERE id = $1", [service_id[0].id]);
    
            res.redirect("/dashboard?success=SERVICE HAS BEEN SUCCESSFULLY DELETED")
        } catch (error) {
            return res.redirect("/dashboard?error='ERROR'")
        }
    };
}

export default new ServiceController();