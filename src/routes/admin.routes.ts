import express, { Router } from 'express'
import { createAgent, loginAdmin, getAdmin, addMyAgent, getAdminAgents } from '../controllers/admin.controller'
import authorization from '../middlewares/authorization.middleware'
import verifyEmail from '../middlewares/email.middleware'
import basicAuth from '../middlewares/authentication.middleware'
import { getAgentCollection } from '../controllers/agent.controller'
import Upload from '../middlewares/media.middleware';
import Media from '../middlewares/multer.middleware';

const router: Router = express.Router()


router.post('/login-admin', loginAdmin)

router.get('/get-admin', authorization.verifyAdminToken, getAdmin)

router.get('/get-admin-agents', authorization.verifyAdminToken, getAdminAgents)

// router.post('/create-agent', authorization.verifyAdminToken, verifyEmail, createAgent, addMyAgent)
router.post('/create-agent', authorization.verifyAdminToken, Media.uploadWitManyFields, Upload.uploadImageToAWS, createAgent, addMyAgent)

router.get('/thrifts/:agent_id', authorization.verifyAdminToken, getAgentCollection)


export = router;