import validator from "email-validator";
import { ERROR_MSG } from '../config/constants'
import { Response, NextFunction } from 'express'

const verifyEmail = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { email } = req.body
        if (!email) {
            res.json(ERROR_MSG.EMAIL)
        }
        else {
            const valid = validator.validate(email);
            if (valid === false) {
                res.json(ERROR_MSG.EMAIL)
            }
            else {
                next()
            }
        }
    }
    catch (error: any) {
        ERROR_MSG.ERROR_OCCURED.message = error.message
        res.status(500).json(ERROR_MSG.ERROR_OCCURED)
    }
}

export = verifyEmail