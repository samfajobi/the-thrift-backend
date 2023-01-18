import multer from 'multer'
import { Request, Response, NextFunction } from 'express'
// AWS
const storage = multer()

const uploadProfile = multer().single("image");
const uploadWitManyFields = multer().fields([{ name: 'image', maxCount: 1 }, { name: 'identification', maxCount: 2 }])
const uploadMultiple = multer().array("identification",3);

export = {  
    uploadProfile,
    // uploadIdentification,
    uploadWitManyFields,
    uploadMultiple
}

// uploadSingle
