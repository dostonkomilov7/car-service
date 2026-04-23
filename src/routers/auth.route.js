import { Router } from "express";
import authController from "../controllers/auth.controller.js";

const authRouter = Router();

authRouter
    .post("/login", authController.login)
    .post("/register", authController.register)
    .post("/refresh", authController.refresh)

export default authRouter;