import { ERROR_MSG, SUCCESS_MSG } from '../config/constants'
const password: any = process.env.password
const email: any = process.env.email
const userid: any = process.env.userid

const users = [{ userid: userid, email: email, password: password }];

export = {
    async authenticate(data: any) {
        const user = users.find(u => u.email === data.email && u.password === data.password);
        if (user) {
            const { password, ...userWithoutPassword } = user;
            SUCCESS_MSG.SUCCESS.data = userWithoutPassword
            return SUCCESS_MSG.SUCCESS;
        } else {
            return ERROR_MSG.DATA_NOT_FOUND
        }
    }
}

