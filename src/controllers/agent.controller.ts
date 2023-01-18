import Artisan from '../models/artisan.model'
import Agent from '../models/agent.model'
import Thrift from '../models/thrifts.model'
import Collection from '../models/collection.model'
import { SUCCESS_MSG, ERROR_MSG } from '../config/constants'
import { Response, Request, NextFunction } from 'express'
import { deCryptPassword, encryptPassword } from '../utilities/password.utilities'
import jwtToken from '../utilities/authorization.utilities'
import utility from '../utilities/general.utilities'



const loginAgent = async (req: Request, res: Response) => {
    try {
        const { assigned_id, password } = req.body
        if (assigned_id && password) {
            const agentId = assigned_id.toUpperCase()
            const response: any = await Agent.findOne({ assigned_id: agentId }).populate(['admin_id', 'collections'])
            if (response?.assigned_id === agentId) {
                const dehash = await deCryptPassword(password, response.password)
                if (dehash !== false) {
                    const token: any = await jwtToken.generateToken(response.assigned_id, response._id, response.user_type)
                    if (token !== false) {
                        SUCCESS_MSG.SUCCESS.data = response
                        SUCCESS_MSG.SUCCESS.token = token
                        SUCCESS_MSG.SUCCESS.message = 'Login successful'
                        res.json(SUCCESS_MSG.SUCCESS)
                    }
                    else {
                        res.json(ERROR_MSG.ERROR_OCCURED)
                    }
                }
                else {
                    res.json(ERROR_MSG.INVALID_LOGIN)
                }
            }
            else {
                ERROR_MSG.EMAIL_OR_PASSWORD.message = "Id or password doesn't match"
                res.json(ERROR_MSG.EMAIL_OR_PASSWORD)
            }
        }
        else {
            ERROR_MSG.INVALID_CREDENTIALS.message = 'Empty fields'
            res.json(ERROR_MSG.INVALID_CREDENTIALS)
        }
    } catch (error: any) {
        ERROR_MSG.ERROR_OCCURED.message = error.message
        res.json(ERROR_MSG.ERROR_OCCURED)
    }
}

const changedPassword = async (req: any, res: Response) => {
    try {
        const { id } = req.params
        const { password, newpassword } = req.body
        const agent: any = await Agent.findById({ _id: id })
        if (agent?._id === id) {
            const dehash = await deCryptPassword(password, agent.password)
            if (dehash !== false) {
                const hashed = await encryptPassword(newpassword)
                if (hashed) {
                    const response = await Agent.findByIdAndUpdate({ _id: id }, { password: hashed }, { new: true })
                    if (response) {
                        SUCCESS_MSG.SUCCESS.data = response
                        SUCCESS_MSG.SUCCESS.message = 'Password change successful'
                        res.json(SUCCESS_MSG.SUCCESS)
                    }
                    else {
                        res.json(ERROR_MSG.UNABLE_TO_PERFORM)
                    }
                }
            }
            else {
                res.json(ERROR_MSG.INVALID_LOGIN)
            }
        }
        else {
            ERROR_MSG.EMAIL_OR_PASSWORD.message = "Id or password doesn't match"
            res.json(ERROR_MSG.EMAIL_OR_PASSWORD)
        }
    } catch (error: any) {
        ERROR_MSG.ERROR.message = error.message
        res.status(500).json(ERROR_MSG.ERROR)
    }
}

const createArtisan = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { _id } = req.user
        const artisan: any = new Artisan(req.body)
        console.log('uploads', artisan.identification)
        artisan.agent_id = _id
        artisan.image = req.image
        artisan.identification = {
            type: req.body.identification,
            identifications: req.uploads
        }
        const response = await artisan.save()
        if (response) {
            req.artisan = response
            next()
        }
        else {
            res.status(200).json(ERROR_MSG.UNABLE_TO_PERFORM)
        }
    } catch (error: any) {
        ERROR_MSG.ERROR.message = error.message
        res.status(500).json(ERROR_MSG.ERROR)
    }
}

const addMyArtisan = async (req: any, res: Response) => {
    try {
        const { _id } = req.user
        const artisan = req.artisan
        if (_id) {
            const response: any = await Agent.findById({ _id: _id })
            if (response && response._id) {
                response.artisans.push(artisan._id)
                response.markModified('artisans');
                const agent = await response.save()
                if (agent) {
                    SUCCESS_MSG.SUCCESS.data = artisan
                    SUCCESS_MSG.SUCCESS.message = 'Artisan Created'
                    res.status(200).json(SUCCESS_MSG.SUCCESS)
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

const getArtisans = async (req: any, res: Response) => {
    try {
        const { _id } = req.user
        const { skip, limit } = req.query
        const artisans = await Artisan.find({ agent_id: _id }).populate(['thrifts']).sort({ createdAt: -1 }).skip(skip || 0).limit(limit || 10)
        if (artisans) {
            SUCCESS_MSG.SUCCESS.data = artisans
            res.status(200).json(SUCCESS_MSG.SUCCESS)
        }
        else {
            res.status(200).json(ERROR_MSG.DATA_NOT_FOUND)
        }
    } catch (error: any) {
        ERROR_MSG.ERROR.message = error.message
        res.status(500).json(ERROR_MSG.ERROR)
    }
}

const getArtisan = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        if (id) {
            const agent = await Artisan.findById({ _id: id }).populate(['thrifts'])
            if (agent) {
                SUCCESS_MSG.SUCCESS.data = agent
                res.status(200).json(SUCCESS_MSG.SUCCESS)
            }
            else {
                res.status(200).json(ERROR_MSG.DATA_NOT_FOUND)
            }
        }
        else {
            res.status(200).json(ERROR_MSG.UNABLE_TO_PERFORM)
        }
    } catch (error: any) {
        ERROR_MSG.ERROR.message = error.message
        res.status(500).json(ERROR_MSG.ERROR)
    }
}

const collectThrift = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { _id } = req.user
        const { artisan_id, amount, date_paid } = req.body
        if (artisan_id && (amount !== '' || amount !== 0) && date_paid !== '') {
            const thrift = new Thrift({ artisan_id, amount, date_paid: new Date(date_paid) })
            const artisan = await Artisan.findById({ _id: artisan_id })
            const agent: any = await Agent.findById({ _id: _id })
            const response = await thrift.save()
            let total = 0;
            if (artisan && response) {
                artisan.thrifts.push(response._id)
                artisan.markModified('thrifts');
                const artisanUpdate = await artisan.save()
                const updatedArtisan: any = await Artisan.findById({ _id: artisan_id }).populate(['thrifts'])
                if (artisanUpdate) {
                    total = await utility.calculateTotal(updatedArtisan.thrifts)
                    const smsData = {
                        artisan_name: artisanUpdate.full_name,
                        agent_name: `${agent.first_name} ${agent.last_name}`
                    }
                    req.thrift = {
                        full_name: updatedArtisan.full_name,
                        amount,
                        date_paid,
                        artisan_id,
                        smsData: smsData,
                        thriftId: thrift._id,
                        total: total,
                        mobile: updatedArtisan.mobile
                    }
                    next()
                }
                else {
                    res.json(ERROR_MSG.UNABLE_TO_PERFORM)
                }
            }
            else {
                res.json(ERROR_MSG.UNABLE_TO_PERFORM)
            }
        }
        else {
            ERROR_MSG.ERROR.message = 'Some fields are empty'
            res.json(ERROR_MSG.ERROR)
        }

    } catch (error: any) {
        console.log(' collectThrift error', error)
        ERROR_MSG.ERROR.message = error.message
        res.status(500).json(ERROR_MSG.ERROR)
    }
}

const updateAgentCollection = async (req: any, res: Response) => {
    try {
        const { _id } = req.user
        const { amount, date_paid, artisan_id, thriftId, total, smsData, mobile } = req.thrift
        if (amount && date_paid && artisan_id) {
            const data: any = await Collection.findOne({ datePaid: new Date(date_paid).getTime(), agent_id: _id, status: 0 })
            if (!data) {
                const collection = new Collection({
                    agent_id: _id,
                    total: amount,
                    datePaid: new Date(date_paid).getTime()
                })
                collection.artisans.push(artisan_id)
                collection.thrifts.push(thriftId)
                collection.markModified('artisans');
                collection.markModified('thrifts');
                const response = await collection.save()
                if (response) {
                    SUCCESS_MSG.SUCCESS.data = response
                    SUCCESS_MSG.SUCCESS.message = `Payment made`
                    const result = await utility.sendSMS(mobile, amount, total, smsData, date_paid)
                    const { success, message } = result
                    if (success === true) {
                        res.json(SUCCESS_MSG.SUCCESS)
                    }
                    else {
                        ERROR_MSG.UNABLE_TO_PERFORM.message = message
                        res.json(ERROR_MSG.UNABLE_TO_PERFORM)
                    }
                    // res.json(SUCCESS_MSG.SUCCESS)
                }
                else {
                    res.json(ERROR_MSG.UNABLE_TO_PERFORM)
                }
            }
            else {
                if (data.status === 1) {
                    const collection = new Collection({
                        agent_id: _id,
                        total: amount,
                        datePaid: new Date(date_paid).getTime()
                    })
                    collection.artisans.push(artisan_id)
                    collection.thrifts.push(thriftId)
                    collection.markModified('artisans');
                    collection.markModified('thrifts');
                    const response = await collection.save()
                    if (response) {
                        // SUCCESS_MSG.SUCCESS.data = response
                        SUCCESS_MSG.SUCCESS.message = `Payment made`
                        const result = await utility.sendSMS(mobile, amount, total, smsData, date_paid)
                        const { success, message } = result
                        if (success === true) {
                            res.json(SUCCESS_MSG.SUCCESS)
                        }
                        else {
                            ERROR_MSG.UNABLE_TO_PERFORM.message = message
                            res.json(ERROR_MSG.UNABLE_TO_PERFORM)
                        }
                        // res.json(SUCCESS_MSG.SUCCESS)
                    }
                    else {
                        res.json(ERROR_MSG.UNABLE_TO_PERFORM)
                    }
                }
                else {
                    data.total += parseInt(amount)
                    data.artisans.push(artisan_id)
                    data.markModified('artisans');
                    data.thrifts.push(thriftId)
                    data.markModified('thrifts');
                    const updateCollection = await data.save()
                    if (updateCollection) {
                        SUCCESS_MSG.SUCCESS.data = updateCollection
                        SUCCESS_MSG.SUCCESS.message = `Payment made`
                        const result = await utility.sendSMS(mobile, amount, total, smsData, date_paid)
                        const { success, message } = result
                        if (success === true) {
                            res.json(SUCCESS_MSG.SUCCESS)
                        }
                        else {
                            ERROR_MSG.UNABLE_TO_PERFORM.message = message
                            res.json(ERROR_MSG.UNABLE_TO_PERFORM)
                        }
                        // res.json(SUCCESS_MSG.SUCCESS)
                    }
                    else {
                        res.json(ERROR_MSG.UNABLE_TO_PERFORM)
                    }
                }
            }
        }
        else {
            ERROR_MSG.ERROR.message = 'Some fields are empty'
            res.json(ERROR_MSG.ERROR)
        }
    } catch (error: any) {
        console.log(' updateAgentCollection error', error)
        ERROR_MSG.ERROR.message = error.message
        res.status(500).json(ERROR_MSG.ERROR)
    }
}

const sendMessageToArtisan = async (req: any, res: Response) => {
    try {
        const { amount, date_paid, artisan_id, mobile, total, full_name } = req.thrift
        if (artisan_id && full_name) {
            const artisan = {
                agent: 'Agent Name',
                name: full_name,
                total: total,
                amount: amount,
            }
            const response = await utility.sendSMS(mobile, '', '', artisan, date_paid)
            const { success, message } = response
            if (success === true) {
                return ''
            }
            else {
                return ''
            }
        }
        else {
            ERROR_MSG.ERROR.message = 'Some fields are empty'
            res.json(ERROR_MSG.ERROR)
        }
    } catch (error: any) {
        ERROR_MSG.ERROR.message = error.message
        res.status(500).json(ERROR_MSG.ERROR)
    }
}

const payThriftCollected = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { _id } = req.user
        const { collection_id, payment_reference,location } = req.query
        if (collection_id && payment_reference) {
            const collection = await Collection.findById({ _id: collection_id })
            if (collection?.status === 1) {
                ERROR_MSG.ERROR.message = 'Payment has been made'
                res.json(ERROR_MSG.ERROR)
            }
            else {
                const response: any = await Collection.findByIdAndUpdate({ _id: collection_id, agent_id: _id }, { status: 1, payment_reference, location,updatedAt: new Date() }, { new: true }).populate(['artisans'])
                if (response) {
                    req.collection = {
                        amount: response.total,
                        payment_reference: response.payment_reference,
                        collection_id: response._id,
                        artisans: response.artisans
                    }
                    next()
                }
                else {
                    ERROR_MSG.UNABLE_TO_PERFORM.message = 'Unable to register payment'
                    res.json(ERROR_MSG.UNABLE_TO_PERFORM)
                }
            }
        }
        else {
            ERROR_MSG.ERROR.message = 'Some fields are empty'
            res.json(ERROR_MSG.ERROR)
        }
    } catch (error: any) {
        ERROR_MSG.ERROR.message = error.message
        res.status(500).json(ERROR_MSG.ERROR)
    }
}

const updateAgentCollectionRecord = async (req: any, res: Response) => {
    try {
        const { _id } = req.user
        const { collection_id, payment_reference } = req.query
        if (collection_id) {
            // const response: any = await Agent.findById({ _id: _id }).populate(['artisans'])
            const response: any = await Agent.findById({ _id: _id })
            if (response) {
                response.collections.push(req.collection.collection_id)
                response.markModified('collections');
                const agent = await response.save()
                if (agent) {
                    SUCCESS_MSG.SUCCESS.data = {
                        amount: req.collection.amount,
                        payment_reference: req.collection.payment_reference,
                        artisans: req.collection.artisans
                    }
                    SUCCESS_MSG.SUCCESS.message = 'Thrift paid'
                    res.json(SUCCESS_MSG.SUCCESS)
                }
                else {
                    ERROR_MSG.UNABLE_TO_PERFORM.message = 'Unable to register payment'
                    res.json(ERROR_MSG.UNABLE_TO_PERFORM)
                }
            }
            else {
                ERROR_MSG.UNABLE_TO_PERFORM.message = 'Unable to register payment'
                res.json(ERROR_MSG.UNABLE_TO_PERFORM)
            }
        }
        else {
            ERROR_MSG.ERROR.message = 'Some fields are empty'
            res.json(ERROR_MSG.ERROR)
        }
    } catch (error: any) {
        ERROR_MSG.ERROR.message = error.message
        res.status(500).json(ERROR_MSG.ERROR)
    }
}

const getCollection = async (req: any, res: Response) => {
    try {
        const { _id } = req.user
        const { collection_id } = req.query
        if (collection_id) {
            const response: any = await Collection.findById({ _id: collection_id, agent_id: _id }).populate(['artisans', 'thrifts'])
            if (response) {
                SUCCESS_MSG.SUCCESS.data = response
                res.json(SUCCESS_MSG.SUCCESS)
            }
            else {
                res.json(ERROR_MSG.DATA_NOT_FOUND)
            }
        }
        else {
            ERROR_MSG.ERROR.message = 'Some fields are empty'
            res.json(ERROR_MSG.ERROR)
        }
    } catch (error: any) {
        ERROR_MSG.ERROR.message = error.message
        res.status(500).json(ERROR_MSG.ERROR)
    }
}


const getAgentCollection = async (req: any, res: Response) => {
    try {
        const { _id, userType } = req.user
        const { agent_id } = req.params
        console.log('agent_id', agent_id)
        if (_id) {
            const response: any = await Collection.find({ agent_id: userType === 'admin' ? agent_id : _id }).populate(['thrifts', 'artisans'])
            if (response) {
                SUCCESS_MSG.SUCCESS.data = response
                res.json(SUCCESS_MSG.SUCCESS)
            }
            else {
                res.json(ERROR_MSG.DATA_NOT_FOUND)
            }
        }
        else {
            ERROR_MSG.ERROR.message = 'Some fields are empty'
            res.json(ERROR_MSG.ERROR)
        }
    } catch (error: any) {
        ERROR_MSG.ERROR.message = error.message
        res.status(500).json(ERROR_MSG.ERROR)
    }
}

const getAgentCollectionByDateForPayment = async (req: any, res: Response) => {
    try {
        const { _id } = req.user
        const { date_paid } = req.query
        if (_id) {
            const response: any = await Collection.findOne({ agent_id: _id, datePaid: new Date(date_paid).getTime(), status: 0})
            if (response) {
                SUCCESS_MSG.SUCCESS.data = response
                res.json(SUCCESS_MSG.SUCCESS)
            }
            else {
                res.json(ERROR_MSG.DATA_NOT_FOUND)
            }
        }
        else {
            ERROR_MSG.ERROR.message = 'Some fields are empty'
            res.json(ERROR_MSG.ERROR)
        }
    } catch (error: any) {
        ERROR_MSG.ERROR.message = error.message
        res.status(500).json(ERROR_MSG.ERROR)
    }
}

const getCollectionHistory = async (req: any, res: Response) => {
    try {
        const { collection_id } = req.params
        if (collection_id) {
            const response: any = await Collection.findById({ _id: collection_id }).populate(['artisans', 'thrifts'])
            if (response) {
                SUCCESS_MSG.SUCCESS.data = response
                res.json(SUCCESS_MSG.SUCCESS)
            }
            else {
                res.json(ERROR_MSG.DATA_NOT_FOUND)
            }
        }
        else {
            ERROR_MSG.ERROR.message = 'Some fields are empty'
            res.json(ERROR_MSG.ERROR)
        }
    } catch (error: any) {
        ERROR_MSG.ERROR.message = error.message
        res.status(500).json(ERROR_MSG.ERROR)
    }
}

export {
    loginAgent,
    changedPassword,
    createArtisan,
    addMyArtisan,
    getArtisans,
    getArtisan,
    collectThrift,
    updateAgentCollection,
    payThriftCollected,
    updateAgentCollectionRecord,
    getCollection,
    getAgentCollection,
    getAgentCollectionByDateForPayment,
    getCollectionHistory
}