// import { StatusCodes } from "http-status-codes";
// import crypto from 'crypto';

// import User from "../models/user_m.js";
// import Token from "../models/token_m.js";
// import { BadRequestError, UnauthenticatedError } from "../errors/index.js";
// import { createTokenUser, attachCookiesToResponse, } from "../utils/index.js";

// const register = async (req, res) => {
//     const user = await User.create(req.body);
//     let refreshToken = crypto.randomBytes(40).toString('hex');
//     const tokenUser = createTokenUser(user);
//     attachCookiesToResponse({ res, user: tokenUser, refreshToken });

//     // console.log('++');
//     // console.log(req.signedCookies);

//     // console.log(req);
//     const { accessToken } = req.signedCookies;
//     res.status(StatusCodes.CREATED).json({ msg: 'Succeess!', accessToken, user });
// }

// const login = async (req, res) => {
//     const { email, password } = req.body;

//     if (!email || !password) {
//         throw new BadRequestError('please provide email and password');
//     }

//     const user = await User.findOne({ email });
//     // console.log(user);
//     if (!user) {
//         throw new UnauthenticatedError('Invalid Credentials user not found');
//     }
//     // console.log(password);
//     const isCorrectPassword = await user.comparePassword(password);

//     if (!isCorrectPassword) {
//         throw new UnauthenticatedError('Invalid Credentials password is not correct');
//     }

//     let refreshToken = crypto.randomBytes(40).toString('hex');

//     const userAgent = req.headers['user-agent'];
//     const ip = req.ip;
//     const userToken = { refreshToken, ip, userAgent, user: user._id };

//     await Token.create(userToken);


//     const tokenUser = createTokenUser(user);
//     attachCookiesToResponse({ res, user: tokenUser, refreshToken });
//     // console.log('--');
//     // console.log(req.signedCookies.accessToken);
//     // const { accessToken } = req.signedCookies.accessToken
//     // console.log(accessToken);
//     // console.log('++');
//     res.status(StatusCodes.OK).json({ msg: 'Succeess!', accessToken: req.signedCookies.accessToken, user });

// }


// const logout = async (req, res) => {

//     // console.log({ cookie: req.signedCookies } + "1");
//     // console.log(req.user._id);
//     await Token.findByIdAndDelete({ _id: req.user._id });
//     // console.log({ cookie: req.signedCookies } + '2');

//     // res.cookie('accessToken', 'logout', {
//     //     httpOnly: true,
//     //     expires: new Date(Date.now()),
//     // });
//     res.cookie('refreshToken', 'logout', {
//         httpOnly: true,
//         expires: new Date(Date.now()),
//     });
//     // console.log({ cookie: req.signedCookies } + '3');
//     res.status(StatusCodes.OK).json({ msg: 'user logged out!' });
// }


// export { register, login, logout };

import Users from "../models/user_m.js";
import bcrypt from 'bcryptjs'

// const Users = require('../models/userModel')
// const bcrypt = require('bcrypt')
import jwt from 'jsonwebtoken';

const authCtrl = {
    register: async (req, res) => {
        try {
            const { fullname, username, email, password, gender } = req.body
            let newUserName = username.toLowerCase().replace(/ /g, '')

            const user_name = await Users.findOne({ username: newUserName })
            if (user_name) return res.status(400).json({ msg: "This user name already exists." })

            const user_email = await Users.findOne({ email })
            if (user_email) return res.status(400).json({ msg: "This email already exists." })

            if (password.length < 6)
                return res.status(400).json({ msg: "Password must be at least 6 characters." })

            const passwordHash = await bcrypt.hash(password, 12)

            const newUser = new Users({
                fullname, username: newUserName, email, password: passwordHash, gender
            })


            const access_token = createAccessToken({ id: newUser._id })
            const refresh_token = createRefreshToken({ id: newUser._id })

            res.cookie('refreshtoken', refresh_token, {
                httpOnly: true,
                path: '/api/v1/auth/refresh_token',
                maxAge: 30 * 24 * 60 * 60 * 1000 // 30days
            })
            console.log(req.cookies);
            console.log(access_token, '++');
            await newUser.save()
            res.json({
                msg: 'Register Success!',
                access_token,
                user: {
                    ...newUser._doc,
                    password: ''
                }
            })
        } catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    },
    login: async (req, res) => {
        try {
            const { email, password } = req.body

            const user = await Users.findOne({ email })
                .populate("followers following", "avatar username fullname followers following")

            if (!user) return res.status(400).json({ msg: "This email does not exist." })


            const isMatch = await bcrypt.compare(password, user.password)


            if (isMatch == false) return res.status(400).json({ msg: "Password is incorrect." })

            const access_token = createAccessToken({ id: user._id })
            const refresh_token = createRefreshToken({ id: user._id })

            console.log(refresh_token);

            res.cookie('refreshtoken', refresh_token, {
                httpOnly: true,
                path: '/api/v1/auth/refresh_token',
                maxAge: 30 * 24 * 60 * 60 * 1000 // 30days
            })
            // console.log(req.cookies);
            res.json({
                msg: 'Login Success!',
                access_token,
                user: {
                    ...user._doc,
                    password: ''
                }
            })
        } catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    },
    logout: async (req, res) => {
        try {
            res.clearCookie('refreshtoken', { path: '/api/refresh_token' })
            return res.json({ msg: "Logged out!" })
        } catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    },
    generateAccessToken: async (req, res) => {
        try {
            // console.log(req.cookies);
            const rf_token = req.cookies.refreshtoken
            // console.log(req.cookies.refreshtoken);
            if (!rf_token) return res.status(400).json({ msg: "Please login now." })

            jwt.verify(rf_token, process.env.REFRESH_TOKEN_SECRET, async (err, result) => {
                if (err) return res.status(400).json({ msg: "Please login now." })

                const user = await Users.findById(result.id).select("-password")
                    .populate('followers following', 'avatar username fullname followers following')

                if (!user) return res.status(400).json({ msg: "This does not exist." })

                const access_token = createAccessToken({ id: result.id })

                res.json({
                    access_token,
                    user
                })
            })

        } catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    }
}


const createAccessToken = (payload) => {
    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' })
}

const createRefreshToken = (payload) => {
    return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '30d' })
}

export default authCtrl;