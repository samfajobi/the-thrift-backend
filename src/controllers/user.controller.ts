import Artisan from '../models/artisan.model'
import { SUCCESS_MSG, ERROR_MSG } from '../config/constants'
import { Response, Request } from 'express'


const createArtisan = async (req: any, res: Response) => {
    try {
        const { _id } = req.user
        const artisan: any = new Artisan(req.body)
        artisan.agent_id = _id
        artisan.image = req.image
        artisan.identification = {
            type: req.body.identification,
            identifications: req.uploads
        }
        const response = await artisan.save()
        if (response) {
            SUCCESS_MSG.SUCCESS.data = response
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
        const agents = await Artisan.find().populate(['thrifts', 'payment'])
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

const getArtisans = async (req: Request, res: Response) => {
    try {
        const agents = await Artisan.find().populate(['thrifts', 'payment'])
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
    getArtisan,
    getArtisans
}