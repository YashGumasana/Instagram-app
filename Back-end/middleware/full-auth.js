import { UnauthenticatedError, UnauthorizedError } from "../errors/index.js";
import { isTokenValid } from "../utils/index.js";

const authenticateUser = async (req, res, next) => {
    let token;

    const authHeader = req.headers.authorization;

    console.log(authHeader);
    if (authHeader && authHeader.startsWith('Bearer')) {
        token = authHeader.split(' ')[1];
    }

    else if (req.cookies.token) {
        token = req.cookies.token;
    }

    if (!token) {
        throw new UnauthenticatedError('Authentication invalid');
    }

    try {
        console.log('***');
        console.log(token);
        console.log(isTokenValid(token));
        const payload = isTokenValid(token);
        console.log('--');
        console.log(payload.userID);
        // console.log(payload.user.userID);

        console.log('+++');
        console.log(payload.role);
        req.user = {
            userId: payload.userID,
            role: payload.role,
        };

        next();
    } catch (error) {
        throw new UnauthenticatedError('Authentication invalid');
    }
};

const authorizePermissions = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            throw new UnauthorizedError('Unauthorized to access this route');
        }
        next();
    };
};

export { authenticateUser, authorizePermissions };