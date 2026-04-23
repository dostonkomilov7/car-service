import { Router } from "express";
import servicesController from "../controllers/services.controller.js";

const serviceRouter = Router();

serviceRouter
    .get("/services", servicesController.getAllServices)
    .post("/services", servicesController.createService) //ONLY FOR ADMINS
    .delete("/services/:id", servicesController.deleteService) //ONLY FOR ADMINS

export default serviceRouter;