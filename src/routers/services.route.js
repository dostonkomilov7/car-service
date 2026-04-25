import { Router } from "express";
import servicesController from "../controllers/services.controller.js";
import { Protected } from "../middlewares/protected.middleware.js";
import { Role } from "../middlewares/roles.middleware.js";

const serviceRouter = Router();

serviceRouter
    .post("/", servicesController.createService) //ONLY FOR ADMINS
    .delete("/delete", servicesController.deleteService) //ONLY FOR ADMINS

export default serviceRouter;