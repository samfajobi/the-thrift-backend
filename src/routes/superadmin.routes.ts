import express, { Router } from 'express'
import { createAdmin, updateCreatedAdmin, loginSuperAdmin, getAllAdmins, createSuperAdmin, getAdminCreatedAgents, getAdminCreatedAgentCollection } from '../controllers/superadmin.controller'
import authorization from '../middlewares/authorization.middleware'
import verifyEmail from '../middlewares/email.middleware'
import basicAuth from '../middlewares/authentication.middleware'
import { getCollectionHistory } from '../controllers/agent.controller'
import Upload from '../middlewares/media.middleware';
import Media from '../middlewares/multer.middleware';

const router: Router = express.Router()


router.post('/create-super-admin', Media.uploadWitManyFields, Upload.uploadImageToAWS,verifyEmail, createSuperAdmin)

router.post('/create-admin', authorization.verifySuperAdminToken, Media.uploadWitManyFields, Upload.uploadImageToAWS, verifyEmail,createAdmin, updateCreatedAdmin)

router.post('/login-super-admin', loginSuperAdmin)

router.get('/get/registered/admin', authorization.verifySuperAdminToken, getAllAdmins)

router.get('/get-created-agents', authorization.verifySuperAdminToken, getAdminCreatedAgents)

router.get('/get-created-agents-collection/:agent_id', authorization.verifySuperAdminToken, getAdminCreatedAgentCollection)

router.get('/collection-history/:collection_id', authorization.verifySuperAdminToken, getCollectionHistory)

// router.post('/create-agent', authorization.verifyAdminToken, verifyEmail, createAgent, addMyAgent)




export = router;