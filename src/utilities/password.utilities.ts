import bcrypt from 'bcrypt'
const saltRounds = 15;

const encryptPassword = async (data: string) => {
    try {
        const hash = await bcrypt.hash(data, saltRounds);
        if (hash) {
            return hash
        }
        else {
            return false
        }
    } catch (error: any) {
        return error.message
    }
}

const deCryptPassword = async (password: string, hash: string) => {
    try {
        const match = await bcrypt.compare(password, hash)
        if (match) {
            return match
        }
        else {
            return false
        }
    } catch (error: any) {
        return error.message
    }
}

export {
    encryptPassword,
    deCryptPassword
}

// Promise.all([encryptPassword, deCryptPassword])
