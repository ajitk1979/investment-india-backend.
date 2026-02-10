const otpService = require('./utils/otpService');
require('dotenv').config();

const mobile = process.argv[2];

if (!mobile) {
    console.error('Usage: node test_otp.js <mobile_number>');
    process.exit(1);
}

console.log(`Sending OTP to ${mobile}...`);

otpService.sendOTP(mobile, '123456')
    .then(result => {
        console.log('Result:', result);
    })
    .catch(err => {
        console.error('Error:', JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
    });
