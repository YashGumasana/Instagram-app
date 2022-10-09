import express from 'express';
const router = express.Router();

import commentCtrl from '../controllers/comment_c.js';

import { authenticateUser } from '../middleware/authentication.js';

router.route('/comment').post(authenticateUser, commentCtrl.createComment);
router.route('/comment/:id').patch(authenticateUser, commentCtrl.updateComment);
router.route('/comment/:id/like').patch(authenticateUser, commentCtrl.likeComment);
router.route('/comment/:id/unlike').patch(authenticateUser, commentCtrl.unlikeComment);
router.route('/comment/:id').delete(authenticateUser, commentCtrl.deleteComment);

export default router;