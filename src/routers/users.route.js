import { Router } from "express";
import usersController from "../controllers/users.controller.js";

const userRouter = Router();

userRouter
    .get("/users", usersController.getAllUsers) //ONLY FOR ADMINS
    .put("/users/:id", usersController.updateUser)
    .delete("/users/:id", usersController.deleteUser) //ONLY FOR ADMINS

export default userRouter;