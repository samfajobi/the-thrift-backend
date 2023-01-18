import { SUCCESS_MSG, ERROR_MSG } from '../config/constants'
import { Response, Request, NextFunction } from 'express'
import { deCryptPassword, encryptPassword } from '../utilities/password.utilities'
import Agent from '../models/agent.model'
import Admin from '../models/admin.model'
import SuperAdmin from '../models/superadmin.model'
import jwtToken from '../utilities/authorization.utilities'


const createSuperAdmin = async (req: any, res: Response, next: NextFunction) => {
    try {
        const superAdmin: any = new SuperAdmin(req.body)
        superAdmin.email = superAdmin.email.toLowerCase()
        const result = await SuperAdmin.findOne({ email: superAdmin.email })
        if (result?.email) {
            ERROR_MSG.DATA_EXIST.message = 'User with this account already exist'
            res.json(ERROR_MSG.DATA_EXIST)
        }
        else {
            const hashedPassword = await encryptPassword(superAdmin.password)
            if (hashedPassword) {
                superAdmin.password = hashedPassword
                superAdmin.image =  req.image
                const response = await superAdmin.save()
                if (response) {
                    SUCCESS_MSG.SUCCESS.data = response
                    SUCCESS_MSG.SUCCESS.message = 'Registeration successful'
                    res.json(SUCCESS_MSG.SUCCESS)
                }
                else {
                    res.json(ERROR_MSG.UNABLE_TO_PERFORM)
                }
            }
            else {
                res.json(ERROR_MSG.ERROR_OCCURED)
            }
        }
    } catch (error: any) {
        ERROR_MSG.ERROR.message = error.message
        res.status(500).json(ERROR_MSG.ERROR)
    }
}

const createAdmin = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { _id } = req.user;
        const admin: any = new Admin(req.body)
        admin.email = admin.email.toLowerCase()
        const result = await Admin.findOne({ email: admin.email })
        if (result?.email) {
            ERROR_MSG.DATA_EXIST.message = 'User with this account already exist'
            res.json(ERROR_MSG.DATA_EXIST)
        }
        else {
            const hashedPassword = await encryptPassword(admin.password)
            if (hashedPassword) {
                admin.password = hashedPassword
                admin.superAdmin = _id
                admin.image = req.image
                const response = await admin.save()
                if (response) {
                    req.admin = {
                        admin: response
                    }
                    next()
                }
                else {
                    res.json(ERROR_MSG.UNABLE_TO_PERFORM)
                }
            }
            else {
                res.json(ERROR_MSG.ERROR_OCCURED)
            }
        }
    } catch (error: any) {
        ERROR_MSG.ERROR.message = error.message
        res.status(500).json(ERROR_MSG.ERROR)
    }
}

const updateCreatedAdmin = async (req: any, res: Response) => {
    try {
        const { _id } = req.user
        const { admin } = req.admin
        if (_id) {
            const response: any = await SuperAdmin.findById({ _id: _id })
            if (response && response._id) {
                response.admins.push(admin._id)
                response.markModified('admins');
                const result = await response.save()
                if (result) {
                    SUCCESS_MSG.SUCCESS.data = admin
                    SUCCESS_MSG.SUCCESS.message = 'Admin created'
                    res.json(SUCCESS_MSG.SUCCESS)
                }
                else {
                    res.json(ERROR_MSG.UNABLE_TO_PERFORM)
                }
            }
            else {
                res.json(ERROR_MSG.DATA_NOT_FOUND)
            }
        }
        else {
            res.status(400).json(ERROR_MSG.ERROR)
        }
    } catch (error: any) {
        ERROR_MSG.ERROR.message = error.message
        res.status(500).json(ERROR_MSG.ERROR)
    }
}

const loginSuperAdmin = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const adminEmail: string = email.toLowerCase()
        const response: any = await SuperAdmin.findOne({ email: adminEmail })
        if (response && response.email) {
            const decrypt = await deCryptPassword(password, response.password)
            if (decrypt !== false) {
                const token: any = await jwtToken.generateToken(response.email, response._id, response.user_type)
                if (token !== false) {
                    SUCCESS_MSG.SUCCESS.data = response
                    SUCCESS_MSG.SUCCESS.token = token
                    SUCCESS_MSG.SUCCESS.message = 'Login successful'
                    res.json(SUCCESS_MSG.SUCCESS)
                }
                else {
                    res.status(500).json(ERROR_MSG.ERROR_OCCURED)
                }
            }
            else {
                res.json(ERROR_MSG.EMAIL_OR_PASSWORD)
            }
        }
        else {
            res.json(ERROR_MSG.INVALID_LOGIN)
        }

    } catch (error: any) {
        ERROR_MSG.ERROR.message = error.message
        res.status(500).json(ERROR_MSG.ERROR)
    }
}

const getRegisteredAdmin = async (req: any, res: Response) => {
    try {
        const { email, _id } = req.user;
        const response: any = await SuperAdmin.findById({ _id }).populate({ path: 'admins' })
        if (response) {
            SUCCESS_MSG.SUCCESS.data = response
            SUCCESS_MSG.SUCCESS.message = 'Successful'
            res.json(SUCCESS_MSG.SUCCESS)
        }
        else {
            res.json(ERROR_MSG.ERROR_OCCURED)
        }
    } catch (error: any) {
        ERROR_MSG.ERROR.message = error.message
        res.status(500).json(ERROR_MSG.ERROR)
    }
}

const createAgent = async (req: any, res: Response, next: NextFunction) => {
    try {
        const agent: any = new Agent(req.body)
        agent.email = agent.email.toLowerCase()
        agent.password = req.body?.password || agent.password
        const hashedPassword = await encryptPassword(agent.password)
        const result = await Agent.findOne({ email: agent.email })
        const last = await Agent.find({}).sort({ _id: -1 }).limit(1);
        let randomId: number = 1
        if (last && last.length > 0) {
            const id: any = last[0]?.assigned_id
            randomId = parseInt(id.charAt(parseInt(id.length) - 1)) + 1
        }
        if (result?.email) {
            res.json(ERROR_MSG.DATA_EXIST)
        }
        else {
            agent.assigned_id = `TRV-000${randomId}`;
            if (hashedPassword) {
                agent.password = hashedPassword
                const response = await agent.save()
                if (response) {
                    req.agent = {
                        agent: response
                    }
                    // SUCCESS_MSG.SUCCESS.data = response
                    // SUCCESS_MSG.SUCCESS.message = 'Agent created'
                    // res.json(SUCCESS_MSG.SUCCESS)
                    next()
                }
                else {
                    res.json(ERROR_MSG.UNABLE_TO_PERFORM)
                }
            }
            else {
                res.json(ERROR_MSG.ERROR_OCCURED)
            }
        }
    } catch (error: any) {
        ERROR_MSG.ERROR.message = error.message
        res.status(500).json(ERROR_MSG.ERROR)
    }
}

const getAllAdmins = async (req: any, res: Response) => {
    try {
        const { limit, skip } = req.query
        const { email, _id } = req.user;
        // const response: any = await Admin.find({ superAdmin: _id }).sort({ createdAt: -1 }).skip(skip || 0).limit(limit || 10)
        const response: any = await Admin.find({ superAdmin: _id }).sort({ createdAt: -1 })
        if (response) {
            SUCCESS_MSG.SUCCESS.data = response
            SUCCESS_MSG.SUCCESS.message = 'Successful'
            res.json(SUCCESS_MSG.SUCCESS)
        }
        else {
            res.status(500).json(ERROR_MSG.ERROR_OCCURED)
        }
    } catch (error: any) {
        ERROR_MSG.ERROR.message = error.message
        res.status(500).json(ERROR_MSG.ERROR)
    }
}

const getAdminCreatedAgents = async (req: any, res: Response) => {
    try {
        const { _id } = req.user;
        const { skip, limit } = req.query
        // const response: any = await Admin.findOne({ superAdmin: _id }).sort({ createdAt: -1 }).skip(skip || 0).limit(limit || 10).populate(['agents'])
        const response: any = await Admin.find({ superAdmin: _id }).sort({ createdAt: -1 }).populate(['agents'])
        if (response) {
            SUCCESS_MSG.SUCCESS.data = response
            SUCCESS_MSG.SUCCESS.message = 'Successful'
            res.json(SUCCESS_MSG.SUCCESS)
        }
        else {
            res.status(500).json(ERROR_MSG.ERROR_OCCURED)
        }
    } catch (error: any) {
        console.log('error', error)
        ERROR_MSG.ERROR.message = error.message
        res.status(500).json(ERROR_MSG.ERROR)
    }
}

const getAdminCreatedAgentCollection = async (req: any, res: Response) => {
    try {
        const { agent_id } = req.params
        const response: any = await Agent.findById({ _id: agent_id }).sort({ createdAt: -1 }).populate(['collections'])
        if (response) {
            SUCCESS_MSG.SUCCESS.data = response
            SUCCESS_MSG.SUCCESS.message = 'Successful'
            res.json(SUCCESS_MSG.SUCCESS)
        }
        else {
            res.status(500).json(ERROR_MSG.ERROR_OCCURED)
        }
    } catch (error: any) {
        console.log('error', error)
        ERROR_MSG.ERROR.message = error.message
        res.status(500).json(ERROR_MSG.ERROR)
    }
}
export {
    createSuperAdmin,
    createAdmin,
    createAgent,
    loginSuperAdmin,
    updateCreatedAdmin,
    getRegisteredAdmin,
    getAllAdmins,
    getAdminCreatedAgents,
    getAdminCreatedAgentCollection
}