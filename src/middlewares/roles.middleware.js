import { ForbiddenRequestException } from "../exceptions/forbidden.exception.js";

export const Role = (...roles) => {
    return (req, res, next) => {
        if(!roles.includes(req.user?.role)){
            res.redirect("/?error='ONLY ADMINS ARE ACCEPTED'")
        }

        next();
    }
}