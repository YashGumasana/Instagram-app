import jwt from 'jsonwebtoken';

const createJWT = (payload) => {
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_LIFETIME,
    });
    return token;
};

const isTokenValid = (token) => jwt.verify(token, process.env.JWT_SECRET);

const attachCookiesToResponse = ({ res, user, refreshToken }) => {
    const accessTokenJWT = createJWT(user);
    // console.log(accessTokenJWT + '+++');
    const refreshTokenJWT = createJWT({ user, refreshToken });

    const oneDay = 1000 * 60 * 60 * 24;
    const longerExp = 1000 * 60 * 60 * 24 * 30;

    res.cookie('accessToken', accessTokenJWT, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        signed: true,
        expires: new Date(Date.now() + oneDay),
    });

    // console.log(res.cookies());
    // console.log('accessToken');
    // console.log(res.cookie);
    // console.log(res.cookie());

    res.cookie('refreshToken', refreshTokenJWT, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        signed: true,
        expires: new Date(Date.now() + longerExp),
    });
};


export { createJWT, isTokenValid, attachCookiesToResponse };