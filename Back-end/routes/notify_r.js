import express from 'express';
const router = express.Router();

import notifyCtrl from '../controllers/notify_c.js';
import { authenticateUser } from "../middleware/authentication.js";

router.route('/notify').post(authenticateUser, notifyCtrl.createNotify);
router.route('/notify/:id').delete(authenticateUser, notifyCtrl.removeNotify);
router.route('/notifies').get(authenticateUser, notifyCtrl.getNotifies);
router.route('/isReadNotify/:id').patch(authenticateUser, notifyCtrl.isReadNotify);
router.route('/deleteAllNotify').delete(authenticateUser, notifyCtrl.deleteAllNotifies);

export default router;