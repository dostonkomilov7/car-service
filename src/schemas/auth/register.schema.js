import Joi from "joi";

export const RegisterSchema = Joi.object({
    name: Joi.string().min(3).required(),
    email: Joi.string().min(15).required(),
    password: Joi.string().alphanum().min(8).required()
}).required();