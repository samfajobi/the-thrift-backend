export const SUCCESS_MSG = {
    SUCCESS: {
        message: 'Successful',
        data: {},
        token: '',
        success: true
    }
}
export const ERROR_MSG = {
    ERROR: {
        message: 'Error Occured',
        success: false,
         type: "ERROR"
    },
    EMAIL: {
        message: 'Please provide a valid email',
        success: false,
         type: "EMAIL"
    },
    UNABLE_TO_PERFORM: {
        message: 'Unable to perform action',
        success: false,
         type: "UNABLE_TO_PERFORM"
    },
    DATA_EXIST: {
        message: 'Email already available',
        success: false,
         type: "DATA_EXIST"
    },
    UNAUHTORIZED: {
        message: 'Unauthorized Access',
        success: false,
         type: "UNAUHTORIZED"
    },
    ACCESS_DENIED: {
        message: 'Access Denied',
        success: false,
         type: "ACCESS_DENIED"
    },
    DATA_NOT_FOUND: {
        message: 'Data not found',
        success: false,
         type: "DATA_NOT_FOUND"
    },
    ERROR_OCCURED: {
        message: 'Error Occured',
        success: false,
        type: "ERROR_OCCURED"
    },
    INVALID_LOGIN: {
        status: 400,
        success: false,
        message: "Invalid login credentials",
        type: "INVALID_LOGIN"
    },
    INVALID_CREDENTIALS: {
        status: 400,
        success: false,
        message: "Invalid credentials provided",
        type: "INVALID_CREDENTIALS"
    },
    EMAIL_OR_PASSWORD: {
        status: 400,
        success: false,
        message: "Email Or Password Don't Match",
        type: "EMAIL_OR_PASSWORD"
    },
    TOO_MANY: {
        status: 400,
        success: false,
        message: "You have tried to log in too many times try again after 10 minutes",
        type: "TOO_MANY"
    },
}