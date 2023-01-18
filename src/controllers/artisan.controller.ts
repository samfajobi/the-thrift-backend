import Artisan from '../models/artisan.model'
import { SUCCESS_MSG, ERROR_MSG } from '../config/constants'
import { Response, Request } from 'express'
import { encryptPassword } from '../utilities/password.utilities'

const createArtisan = async (req: Request, res: Response) => {
    try {
        const artisan: any = new Artisan(req.body)
        const hashedPassword = await encryptPassword(artisan.password)
        artisan.password = hashedPassword
        const response = await artisan.save()
        if (response) {
            SUCCESS_MSG.SUCCESS.data = response
            SUCCESS_MSG.SUCCESS.message = 'Artisan Created'
            res.status(200).json(SUCCESS_MSG.SUCCESS)
        }
        else {
            res.status(200).json(ERROR_MSG.UNABLE_TO_PERFORM)
        }
    } catch (error: any) {
        ERROR_MSG.ERROR.message = error.message
        res.status(500).json(ERROR_MSG.ERROR)
    }
}

const getArtisan = async (req: Request, res: Response) => {
    try {
        const agents = await Artisan.find()
        if (agents) {
            SUCCESS_MSG.SUCCESS.data = agents
            res.status(200).json(SUCCESS_MSG.SUCCESS)
        }
        else {
            res.status(200).json(ERROR_MSG.UNABLE_TO_PERFORM)
        }
    } catch (error: any) {
        ERROR_MSG.ERROR.message = error.message
        res.status(500).json(ERROR_MSG.ERROR)
    }
}

export {
    createArtisan,
    getArtisan
}