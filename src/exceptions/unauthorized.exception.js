import { BaseException } from "./base.exception";

export class UnauthorizedException extends BaseException {
    constructor (message) {
        super(message);
        this.status = 401;
        this.name = "Unauthorized Exception";
    }
}