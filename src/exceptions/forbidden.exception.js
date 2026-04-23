import { BaseException } from "./base.exception.js";

export class ForbiddenRequestException extends BaseException {
    constructor(message) {
        super(message);
        this.status = 403;
        this.name = "Forbidden Request Exception";
    }
}