import express, { Router } from 'express'
import { getArtisan, createArtisan, getArtisans, changedPassword, loginAgent, collectThrift, updateAgentCollection, addMyArtisan, payThriftCollected, getCollection,updateAgentCollectionRecord,getAgentCollection,getAgentCollectionByDateForPayment } from '../controllers/agent.controller'
import authorization from '../middlewares/authorization.middleware'
import basicAuth from '../middlewares/authentication.middleware'
import Upload from '../middlewares/media.middleware';
import Media from '../middlewares/multer.middleware';

const router: Router = express.Router()


router.post('/create-artisan', authorization.verifyAgentToken,Media.uploadWitManyFields, Upload.uploadImageToAWS,Upload.uplaodAwsMultiplePng, createArtisan, addMyArtisan)

router.post('/login-agent', loginAgent)

router.put('/update/agent/password/:id', authorization.verifyToken, changedPassword)

router.get('/get-artisans', authorization.verifyToken, getArtisans)

router.get('/get-artisan/:id', authorization.verifyToken, getArtisan)

router.post('/collect-thrift', authorization.verifyAgentToken, collectThrift, updateAgentCollection)

router.get('/collection', authorization.verifyAgentToken, getCollection)

router.post('/deposit-funds', authorization.verifyAgentToken, payThriftCollected,updateAgentCollectionRecord)

router.get('/thrifts/:agent_id', authorization.verifyAgentToken, getAgentCollection)

router.get('/today-thrift', authorization.verifyAgentToken, getAgentCollectionByDateForPayment)

export = router;