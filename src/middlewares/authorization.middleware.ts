import Agent from '../models/agent.model'
import Admin from '../models/admin.model'
import SuperAdmin from '../models/superadmin.model'
import { ERROR_MSG } from '../config/constants'
import token from '../utilities/authorization.utilities'
import { Response, NextFunction } from 'express'


const verifyAgentToken = async (req: any, res: Response, next: NextFunction) => {
    try {
        if (!req.headers.authorization) {
            res.status(400).json(ERROR_MSG.ACCESS_DENIED)
        }
        else {
            const userToken: any = req.headers.authorization.split(' ')[1];
            // const userToken: any = req.headers.token;
            if (userToken) {
                const legit: any = await token.checkToken(userToken)
                if (legit.success === true) {
                    req.user = legit.user_token
                    const response = await Agent.findById({ _id: req.user._id })
                    if (response) {
                        next();
                    }
                    else {
                        ERROR_MSG.DATA_NOT_FOUND.message = 'Unauthorized Access'
                        res.status(200).json(ERROR_MSG.DATA_NOT_FOUND)
                    }
                }
                else {
                    res.status(401).json(ERROR_MSG.UNAUHTORIZED)
                }
            }
            else {
                res.status(401).json(ERROR_MSG.ACCESS_DENIED)
            }
        }
    }
    catch (error: any) {
        ERROR_MSG.ERROR_OCCURED.message = error.message
        res.status(500).json(ERROR_MSG.ERROR_OCCURED)
    }
}

const verifyAdminToken = async (req: any, res: Response, next: NextFunction) => {
    try {
        if (!req.headers.authorization) {
            res.json(ERROR_MSG.ACCESS_DENIED)
        }
        else {
            const userToken: any = req.headers.authorization.split(' ')[1];
            if (userToken) {
                const legit: any = await token.checkToken(userToken)
                if (legit.success === true) {
                    req.user = legit.user_token
                    const response = await Admin.findById({ _id: req.user._id })
                    if (response) {
                        next();
                    }
                    else {
                        res.json(ERROR_MSG.DATA_NOT_FOUND)
                    }
                }
                else {
                    res.json(ERROR_MSG.UNAUHTORIZED)
                }
            }
            else {
                res.status(401).json(ERROR_MSG.ACCESS_DENIED)
            }
        }
    }
    catch (error: any) {
        ERROR_MSG.ERROR_OCCURED.message = error.message
        res.status(500).json(ERROR_MSG.ERROR_OCCURED)
    }
}

const verifySuperAdminToken = async (req: any, res: Response, next: NextFunction) => {
    try {
        if (!req.headers.authorization) {
            res.status(400).json(ERROR_MSG.ACCESS_DENIED)
        }
        else {
            const userToken: any = req.headers.authorization.split(' ')[1];
            // const userToken: any = req.headers.token.split(' ')[1];
            if (userToken) {
                const legit: any = await token.checkToken(userToken)
                if (legit.success === true) {
                    req.user = legit.user_token
                    const response = await SuperAdmin.findById({ _id: req.user._id })
                    if (response) {
                        next();
                    }
                    else {
                        res.json(ERROR_MSG.DATA_NOT_FOUND)
                    }
                }
                else {
                    res.json(ERROR_MSG.UNAUHTORIZED)
                }
            }
            else {
                res.status(401).json(ERROR_MSG.ACCESS_DENIED)
            }
        }
    }
    catch (error: any) {
        ERROR_MSG.ERROR_OCCURED.message = error.message
        res.status(500).json(ERROR_MSG.ERROR_OCCURED)
    }
}

const verifyToken = async (req: any, res: Response, next: NextFunction) => {
    try {
        if (!req.headers.authorization) {
            res.status(400).json(ERROR_MSG.ACCESS_DENIED)
        }
        else {
            const userToken: any = req.headers.authorization.split(' ')[1];
            if (userToken) {
                const legit: any = await token.checkToken(userToken)
                if (legit.success === true) {
                    req.user = legit.user_token
                    const response = legit.user_token.userType === 'agent' ? await Agent.findById({ _id: req.user._id }) : await Admin.findById({ _id: req.user._id })
                    if (response) {
                        next();
                    }
                    else {
                        res.status(200).json(ERROR_MSG.UNAUHTORIZED)
                    }
                }
                else {
                    res.status(401).json(ERROR_MSG.UNAUHTORIZED)
                }
            }
            else {
                res.status(401).json(ERROR_MSG.ACCESS_DENIED)
            }
        }
    }
    catch (error: any) {
        ERROR_MSG.ERROR_OCCURED.message = error.message
        res.status(500).json(ERROR_MSG.ERROR_OCCURED)
    }
}

const verifyThirdPartyToken = async (req: any, res: Response, next: NextFunction) => {
    try {
        if (!req.headers.authorization) {
            res.status(400).json(ERROR_MSG.ACCESS_DENIED)
        }
        else {
            const userToken: any = req.headers.authorization.split(' ')[1];
            if (userToken) {
                const legit: any = await token.checkToken(userToken)
                if (legit.success === true) {
                    req.user = legit.user_token
                    next();
                }
                else {
                    res.status(401).json(ERROR_MSG.UNAUHTORIZED)
                }
            }
            else {
                res.status(401).json(ERROR_MSG.ACCESS_DENIED)
            }
        }
    }
    catch (error: any) {
        ERROR_MSG.ERROR_OCCURED.message = error.message
        res.status(500).json(ERROR_MSG.ERROR_OCCURED)
    }
}


export = {
    verifyToken,
    verifyAgentToken,
    verifyAdminToken,
    verifySuperAdminToken,
    verifyThirdPartyToken,
}