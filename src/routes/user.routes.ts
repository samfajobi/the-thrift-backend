import express, { Router } from 'express'
import { getArtisan, createArtisan, getArtisans } from '../controllers/user.controller'
import authorization from '../middlewares/authorization.middleware'
import basicAuth from '../middlewares/authentication.middleware'
import Upload from '../middlewares/media.middleware';
import Media from '../middlewares/multer.middleware';

const router: Router = express.Router()


router.post('/create-artisan', authorization.verifyThirdPartyToken, Media.uploadWitManyFields, Upload.uploadImageToAWS, Upload.uplaodAwsMultiplePng, createArtisan)

router.get('/get-users', authorization.verifyThirdPartyToken, getArtisans)

router.get('/get-user/:id', authorization.verifyThirdPartyToken, getArtisan)


export = router;