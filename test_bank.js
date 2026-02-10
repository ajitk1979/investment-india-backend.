// test_bank.js
const axios = require('axios');
(async () => {
    try {
        const res = await axios.post('http://localhost:5000/api/bank/details', {
            userId: '123',
            accountNumber: '111222333',
            ifsc: 'ABCD0123456',
            amount: 10000
        });
        console.log('Bank response:', res.data);
    } catch (err) {
        console.error('Error:', err.response ? err.response.data : err.message);
    }
})();
