import pool from "../configs/db.config.js";

class ServiceController {
    constructor() {}

    // getAllServices = async (req, res) => {
    //     const {rows: services} = await pool.query("SELECT * FROM services");

    //     res.render("home");
    // };

    createService = async (req, res) => {
        const { name, price } = req.body;

        await pool.query(
            "INSERT INTO services(service_name, service_price) VALUES ($1, $2)",
            `
            INSERT INTO services(service_name, service_price, description) VALUES
            ('Oil Change', 500_000, 'Full synthetic or conventional oil swap with filter replacement and 21-point inspection.'),
            ('Tyre Service', 400_000, 'Rotation, balancing, alignment checks, and new tyre fitting for all vehicle types.'),
            ('Brake Repair', 1_500_000, 'Pad and rotor replacement, brake fluid flush, caliper service, and full safety check.'),
            ('Engine Diagnostics', 1_000_000, 'OBD-II scan, fault code reading, and full report with recommended repairs.'),
            ('Battery & Electrical', 900_000, 'Battery testing, replacement, alternator and starter checks, and wiring diagnostics.'),
            ('Full Service', 2_000_000, 'Comprehensive 60-point inspection covering engine, brakes, fluids, tyres, lights, and more.');
            `,
            [name, price],
        );

        res.redirect("/api/dashboard");
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