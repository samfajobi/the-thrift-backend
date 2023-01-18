import authentication from '../utilities/authentication.utilities'
import { ERROR_MSG, SUCCESS_MSG } from '../config/constants'
import { Response, Request, NextFunction } from 'express'

const basicAuth = async (req: Request, res: Response, next: NextFunction) => {
    if (req.path === '/api/user/authenticated') {
        return next();
    }

    if (!req.headers.authorization || req.headers.authorization.indexOf('Basic ') === -1) {
        return res.status(400).json(ERROR_MSG.UNAUHTORIZED)
    }
    const base64Credentials = req.headers.authorization.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [email, password] = credentials.split(':');

    const user = await authentication.authenticate({ email, password })
    if (user.success == true) {
        next();
        return base64Credentials;
    } else {
        return res.status(401).json(ERROR_MSG.INVALID_CREDENTIALS)
    }

};

export = basicAuth;