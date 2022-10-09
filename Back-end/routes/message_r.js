import express from 'express'
const router = express.Router()

import messageCtrl from "../controllers/message_c.js"
import { authenticateUser } from "../middleware/authentication.js";

router.post('/message', authenticateUser, messageCtrl.createMessage)
router.get('/conversations', authenticateUser, messageCtrl.getConversartions)
router.get('/message/:id', authenticateUser, messageCtrl.getMessages)
router.delete('/message/:id', authenticateUser, messageCtrl.deleteMessages)
router.delete('/conversation/:id', authenticateUser, messageCtrl.deleteConversation)

export default router