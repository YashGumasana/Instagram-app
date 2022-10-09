import { StatusCodes } from "http-status-codes";
import CustomAPIError from "./custom-api.js";

class UnauthorizedError extends CustomAPIError {
    constructor(message) {
        super(message);
        this.statusCode = StatusCodes.FORBIDDEN; //403
    }
}

export default UnauthorizedError;