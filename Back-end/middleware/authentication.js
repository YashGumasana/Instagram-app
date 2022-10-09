// import { UnauthenticatedError, UnauthorizedError } from "../errors/index.js";
// import { isTokenValid } from "../utils/index.js";
// import User from "../models/user_m.js";


// const authenticateUser = async (req, res, next) => {
//     // console.log(req);
//     const { refreshToken, accessToken } = req.signedCookies;

//     try {
//         // console.log('*-*-*');
//         if (accessToken) {
//             // console.log(accessToken);
//             const payload = isTokenValid(accessToken);
//             // console.log(payload);
//             const user = await User.findOne({ _id: payload.userId })
//             req.user = user;
//             console.log(';');
//             // console.log(req.user);
//             return next();
//         }
//         // console.log('*/*-');
//         const payload = isTokenValid(refreshToken);
//         // console.log(payload.user);
//         const existingToken = await Token.findOne({
//             user: payload.user.userId,
//             refreshToken: payload.refreshToken,
//         });

//         // console.log(existingToken);
//         // console.log('+++');
//         if (!existingToken || !existingToken?.isValid) {
//             throw new UnauthenticatedError('Authentication Invalid');
//         }

//         attachCookiesToResponse({
//             res,
//             user: payload.user,
//             refreshToken: existingToken.refreshToken,
//         });
//         // console.log('---');

//         req.user = payload.user;
//         next();
//     } catch (error) {
//         throw new UnauthenticatedError('Authentication Invalid');
//     }
// };


// const authorizePermissions = (...roles) => {

//     return (req, res, next) => {
//         console.log('***');
//         console.log(req.user.role);
//         console.log('--');
//         if (!roles.includes(req.user.role)) {
//             throw new UnauthorizedError('Unauthorized to access this route');
//         }
//         next();
//     };
// };

// export { authenticateUser, authorizePermissions };

import Users from "../models/user_m.js";
import jwt from 'jsonwebtoken'

// const Users = require("../models/userModel")
// const jwt = require('jsonwebtoken')

const authenticateUser = async (req, res, next) => {
    try {
        // console.log('authentication');
        const token = req.header("Authorization");
        // console.log(token);

        if (!token) return res.status(400).json({ msg: "Invalid Authentication." })

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        if (!decoded) return res.status(400).json({ msg: "Invalid Authentication." })

        // console.log(decoded);
        const user = await Users.findOne({ _id: decoded.id })

        // console.log(user);
        req.user = user
        // console.log(req.user);
        next()
    } catch (err) {
        return res.status(500).json({ msg: err.message })
    }
}



export { authenticateUser };