import express from 'express';
const router = express.Router();

import { searchUser, getUser, updateUser, suggestionUser, follow, unfollow } from '../controllers/user_c.js';
import { authenticateUser } from '../middleware/authentication.js'

router.route('/search').get(authenticateUser, searchUser);
router.route('/user/:id').get(authenticateUser, getUser);
router.route('/user').patch(authenticateUser, updateUser);
router.route('/suggestionsUser').get(authenticateUser, suggestionUser);
router.route('/user/:id/follow').patch(authenticateUser, follow);
router.route('/user/:id/unfollow').patch(authenticateUser, unfollow);


export default router;