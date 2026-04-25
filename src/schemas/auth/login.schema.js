import Joi from "joi";

export const LoginSchema = Joi.object({
    email: Joi.string().min(15).required(),
    password: Joi.string().alphanum().min(8).required(),
}).required();