import { BadRequestException } from "../exceptions/bad-request.exception.js";

export const validationMiddleware = (schema, target = "body") => {
    const ALLOWED_TARGETS = ["body", "query", "params"];

    if(!ALLOWED_TARGETS.includes(target)){
        throw new Error("Validation target must be one of: body, query, params");
    }

    return (req, res, next) => {
        const {error, value} = schema.validate(req[target]);

        try {
            if(error){
                let errorMessage = ""
                errorMessage = error.details?.map((err) => err.message).join("| ");
                throw new BadRequestException(errorMessage)
            }

            req[target] = value;
            next();

        } catch (error) {
            next(error)
        }
    }
}