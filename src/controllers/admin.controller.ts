import { SUCCESS_MSG, ERROR_MSG } from '../config/constants'
import { Response, Request, NextFunction } from 'express'
import { deCryptPassword, encryptPassword } from '../utilities/password.utilities'
import Agent from '../models/agent.model'
import Admin from '../models/admin.model'
import jwtToken from '../utilities/authorization.utilities'
import generator from 'generate-password'


const loginAdmin = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const adminEmail: string = email.toLowerCase()
        const response: any = await Admin.findOne({ email: adminEmail })
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

const getAdmin = async (req: any, res: Response) => {
    try {
        const { _id } = req.user;
        const response: any = await Admin.findById({ _id }).populate(['agents'])
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

const getAdminAgents = async (req: any, res: Response) => {
    try {
        const { _id } = req.user;
        const { skip, limit } = req.query
        const response: any = await Agent.find({ admin_id: _id }).sort({ createdAt: -1 }).skip(skip || 0).limit(limit || 10).populate(['collections'])
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

const createAgent = async (req: any, res: Response, next: NextFunction) => {
    try {
        const admin = req.user
        const agent: any = new Agent(req.body)
        // agent.email = agent.email.toLowerCase()
        const password = generator.generate({
            length: 10,
            numbers: true,
            strict: true,
            symbols: true,
        });
        agent.password = req.body?.password || agent.password
        const hashedPassword = await encryptPassword(agent.password)
        // const result = await Agent.findOne({ email: agent.email })
        const last = await Agent.find({}).sort({ _id: -1 }).limit(1);
        let randomId: number = 1
        if (last && last.length > 0) {
            const id: any = last[0]?.assigned_id
            randomId = parseInt(id.charAt(parseInt(id.length) - 1)) + 1
        }
        agent.assigned_id = `TR-AG00${randomId}`;
        agent.admin_id = admin._id;
        agent.image =  req.image;
        if (hashedPassword) {
            agent.password = hashedPassword
            const response = await agent.save()
            if (response) {
                req.agent = {
                    agent: response
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
    } catch (error: any) {
        ERROR_MSG.ERROR.message = error.message
        res.status(500).json(ERROR_MSG.ERROR)
    }
}

const addMyAgent = async (req: any, res: Response) => {
    try {
        const { _id } = req.user
        const { agent } = req.agent
        if (_id) {
            const response: any = await Admin.findById({ _id: _id })
            if (response && response._id) {
                response.agents.push(agent._id)
                response.markModified('agents');
                const admin = await response.save()
                if (admin) {
                    SUCCESS_MSG.SUCCESS.data = agent
                    SUCCESS_MSG.SUCCESS.message = 'Agent created'
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

export {
    createAgent,
    loginAdmin,
    addMyAgent,
    getAdmin,
    getAdminAgents
}