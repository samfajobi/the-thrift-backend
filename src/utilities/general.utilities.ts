// require('dotenv').config()
import axios from 'axios'
const TERMII_API_KEY: any = process.env.TERMII_API_KEY
const SENDER_ID: any = process.env.SENDER_ID
const TESTING_SMS: any = process.env.TESTING_SMS
const TERMII_SMS_URL: any = process.env.TERMII_SMS_URL

const getRandomNumber = async (min: number, max: number) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
}

const calculateTotal = async (thrifts: any) => {
    let total = 0
    thrifts.map((item: any) => total += parseInt(item.amount || 0))
    return total;
}

const returnDateMonthYear = async (date: string) => {
    const year = new Date(date).getFullYear();
    let month: any = new Date(date).getMonth() + 1;
    let day: any = new Date(date).getDate();
    day = day < 10 ? `0${day}` : day
    month = month < 10 ? `0${month}` : month
    return {
        year,
        month,
        day
    }
}

const timeFunction = async () => {
    const date = new Date();
    let hours: any = date.getHours();
    let minutes: any = date.getMinutes();
    let seconds: any = date.getSeconds();

    const timeOfDay = hours > 11 ? 'PM' : 'AM'
    if (hours > 12) hours = hours % 12
    if (hours === 0) hours = 12
    hours = hours < 10 ? `0${hours}` : hours
    minutes = minutes < 10 ? `0${minutes}` : minutes
    seconds = seconds < 10 ? `0${seconds}` : seconds
    return `${hours}:${minutes} ${timeOfDay}`
}

const checkIfDateIsMatch = async (newDate: string, oldate: string) => {
    const firstDate = await returnDateMonthYear(newDate)
    const secondDate = await returnDateMonthYear(oldate)
    if (firstDate.year === secondDate.year && firstDate.month === secondDate.month && firstDate.day === secondDate.day) {
        return true;
    }
    else {
        return false;
    }
}

const sendSMS = async (to: string, amount: string, total: string, artisan: any, date_paid: string) => {
    try {
        console.log('artisan', to)
        to = to.toString()
        to = to.substring(1)
        const date: any = new Date(date_paid);
        const { year, month, day } = await returnDateMonthYear(date)
        const time = await timeFunction()
        const data = JSON.stringify({
            "to": `234${to}`,
            "from": SENDER_ID,
            "sms": `Txn: Credit,\r\nAcc: ${artisan.artisan_name},\r\nAmt:NGN${amount.toLocaleString()},\r\nDes: Ajo Deposit by ${artisan.agent_name},\r\nDate: ${day}-${month}-${year}/${time},\r\nBal:NGN${total.toLocaleString()},\r\nNB: always get alert after payment`,
            "api_key": TERMII_API_KEY,
            "type": "plain",
            "channel": "generic"
        });
        const config = {
            method: 'post',
            url: `${TERMII_SMS_URL}`,
            headers: {
                'Content-Type': 'application/json',
                'Cookie': 'termii-sms=g4tiKKoLzHRHVvNxCSLLYdYgiZSy0YusF2ka7K0I'
            },
            data: data
        };

        const result = await axios(config)
        const response = await result.data
        console.log('sendSMS Response', response)
        const { message_id, code, message } = response
        if (message === 'Successfully Sent' && code === 'ok') {
            return {
                success: true,
                message: message
            }
        }
        else {
            return {
                success: false,
                message: message || 'Unable to send message'
            }
        }
    } catch (error: any) {
        return {
            success: false,
            message: error.message
        }
    }
}


export = {
    getRandomNumber,
    calculateTotal,
    checkIfDateIsMatch,
    sendSMS
}