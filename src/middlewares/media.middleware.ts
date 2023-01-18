import AWS from 'aws-sdk';
import sharp from 'sharp';
import { Response, NextFunction } from 'express'
import { v4 as uuidv4 } from 'uuid';
import { SUCCESS_MSG, ERROR_MSG } from '../config/constants'
import { Collection, Collections } from '../interfaces/images.interface';



const credentials: any = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_S3_REGION_NAME,
}
const s3 = new AWS.S3({
    credentials: credentials,
});


const uploadImageToAWS = async (req: any, res: Response, next: NextFunction) => {
    try {
        const files = req.files.image ? req.files.image : [];
        // console.log('resizedFile', req.files.image[0], 'dsd', req.file)
        if (files.length <= 0) {
            return res.json({ message: 'Please upload a file', success: false, status: 200 });
        }
        const folder = req.body.folder
        // const file = await sharp(req.file.buffer).rotate().resize(500, 500, { fit: "fill" }).png().toBuffer();
        const params: any = {
            Bucket: process.env.AWS_STORAGE_BUCKET_NAME,
            Key: `${folder}/${uuidv4()}.png`,
            // Body: file,
            Body: req.files.image[0].buffer,
        };
        s3.upload(params, (error: any, data: any) => {
            if (error) {
                // console.log('error Errr', error)
                return res.json({ message: error, success: false, files: req.file });
            }
            else {
                req.image = data.Location;
                next();
            }
        });
    } catch (error: any) {
        return res.json({ message: error.message, success: false, status: 200 });
    }
}

const uploadIdToAWS = async (req: any, res: Response, next: NextFunction) => {
    try {
        if (!req.files) {
            return res.json({ message: 'Please upload a file', success: false, status: 200 });
        }
        const { folder, full_name } = req.body
        const params: any = {
            Bucket: process.env.AWS_STORAGE_BUCKET_NAME,
            Key: `identification/${full_name}_${uuidv4()}.png`,
            Body: req.files[0],
        };
        s3.upload(params, (error: any, data: any) => {
            if (error) {
                return res.json({ message: error, success: false, files: req.files });
            }
            else {
                req.identification = data.Location;
                next();
            }
        });
    } catch (error: any) {
        return res.json({ message: error.message, success: false, status: 200 });
    }
}

const uplaodAwsMultiplePng = async (req: any, res: Response, next: NextFunction) => {
    const files = req.files.identification ? req.files.identification : [];
    let collection: Collections[] = []
    if (files.length === 0) {
        return res.json({ message: 'Please upload a identification files', success: false, status: 200 });
    }
    else {
        files.map(async (file: any) => {
            const { full_name, identification } = req.body
            const fileName = full_name.replace(/\s/g, '')
            const params: any = {
                Bucket: process.env.AWS_STORAGE_BUCKET_NAME,
                Key: `identifications/${full_name.replace(/\s/g, '')}_${uuidv4()}.png`,
                Body: file.buffer,
            };
            s3.upload(params, (error: any, data: any) => {
                if (error) {
                    console.log(error, 'upload')
                    res.json({ message: error, success: false, status: 200 });
                }
                else {
                    const imageFile: Collection = {
                        uri: data.Location,
                        type: identification
                    }
                    collection.push(imageFile)
                    if (collection.length === files.length) {
                        req.uploads = collection;
                        next();
                    }
                }
            });
        });
    }
}

export = {
    uploadImageToAWS,
    uploadIdToAWS,
    uplaodAwsMultiplePng
}