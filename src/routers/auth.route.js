import { Router } from "express";
import authController from "../controllers/auth.controller.js";
import { validationMiddleware } from "../middlewares/validation.middleware.js";
import { LoginSchema } from "../schemas/auth/login.schema.js";
import { RegisterSchema } from "../schemas/auth/register.schema.js";

const authRouter = Router();

authRouter
    .post("/login", validationMiddleware(LoginSchema), authController.login)
    .post("/register", validationMiddleware(RegisterSchema), authController.register)
    .post("/refresh", authController.refresh)

export default authRouter;