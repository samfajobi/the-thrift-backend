import jwt from 'jsonwebtoken'
require('dotenv').config()
const JWT_SECRET_KEY: any = process.env.JWT_SECRET_KEY
const jwtAlgorithm: any = "HS256";
const jwtExpiresIn: any = process.env.JWT_EXPIRES_IN;

export = {
    async checkToken(token: string) {
        try {
            if (token === '' || token === undefined || token === null) {
                return {
                    success: false
                }
            } else {
                return {
                    user_token: jwt.verify(token, JWT_SECRET_KEY),
                    success: true
                };
            }
        } catch (err) {
            return false;
        }
    },
    async generateToken(email: string, _id: string, user_type: string) {
        try {
            const token = jwt.sign({ email: email, userType: user_type, _id: _id }, JWT_SECRET_KEY, { algorithm: jwtAlgorithm, expiresIn: jwtExpiresIn, subject: _id.toString() })
            if (token) {
                return token
            } else {
                return false
            }
        } catch (err) {
            return false;
        }
    },
}

