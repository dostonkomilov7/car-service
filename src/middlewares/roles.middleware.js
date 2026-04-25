import { ForbiddenRequestException } from "../exceptions/forbidden.exception.js";

export const Role = (...roles) => {
    return (req, res, next) => {
        if(!roles.includes(req.user?.role)){
            // throw new ForbiddenRequestException("You don't have access");
            res.redirect("/api/home?error='ONLY ADMINS ARE ACCEPTED'")
        }

        next();
    }
}