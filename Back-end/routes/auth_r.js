import express from 'express';
const router = express.Router();

import authCtrl from '../controllers/auth_c.js';
import { authenticateUser } from '../middleware/authentication.js'

router.route('/register').post(authCtrl.register);
router.route('/login').post(authCtrl.login);
router.route('/logout').post(authCtrl.logout);
router.route('/refresh_token').post(authCtrl.generateAccessToken)


export default router;