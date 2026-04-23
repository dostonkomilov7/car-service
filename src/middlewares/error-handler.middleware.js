import logger from "../helpers/logger.helper.js";

export const ErrorHandlerMiddleware = (err, req, res, next) => {
    logger.error(JSON.stringify(err));

    if(err.isException){
        return res.status(err.status).json({
            success: false,
            message: err.message
        });
    }

    console.log(err)
    res.status(500).send({
        success: false,
        message: "Internal Server Error"
    })
}