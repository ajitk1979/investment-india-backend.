// server/utils/otpService.js
const axios = require('axios');
const twilio = require('twilio');
require('dotenv').config();

class OTPService {
    constructor() {
        this.provider = process.env.OTP_PROVIDER || 'MOCK'; // MOCK, TWILIO, MSG91
    }

    async sendOTP(mobile, otp) {
        console.log(`[OTPService] Using provider: ${this.provider}`);

        switch (this.provider.toUpperCase()) {
            case 'TWILIO':
                return this.sendViaTwilio(mobile, otp);
            case 'MSG91':
                return this.sendViaMSG91(mobile, otp);
            case 'MOCK':
            default:
                console.log(`\n-----------------------------------`);
                console.log(`MOCK OTP SENT TO ${mobile}: ${otp}`);
                console.log(`-----------------------------------\n`);
                return { success: true, message: 'Mock OTP logged' };
        }
    }

    async sendViaTwilio(mobile, otp) {
        try {
            const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
            await client.messages.create({
                body: `Your verification code for Empower is: ${otp}`,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: mobile.startsWith('+') ? mobile : `+91${mobile}` // Defaulting to India if no prefix
            });
            return { success: true };
        } catch (error) {
            console.error('Twilio Error:', error);
            throw error; // Propagate the original error for better debugging
        }
    }

    async sendViaMSG91(mobile, otp) {
        try {
            // MSG91 API call (example)
            const response = await axios.get(`https://api.msg91.com/api/v5/otp`, {
                params: {
                    template_id: process.env.MSG91_TEMPLATE_ID,
                    mobile: mobile.replace('+', ''),
                    authkey: process.env.MSG91_AUTH_KEY,
                    otp: otp
                }
            });
            return { success: true, data: response.data };
        } catch (error) {
            console.error('MSG91 Error:', error.message);
            throw new Error('Failed to send SMS via MSG91');
        }
    }
}

module.exports = new OTPService();
