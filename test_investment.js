// test_investment.js
const axios = require('axios');
(async () => {
    try {
        const res = await axios.post('http://localhost:5000/api/investment/plan', {
            userId: '123',
            baseAmount: 10000,
            days: 20
        });
        console.log('Investment response:', res.data);
    } catch (err) {
        console.error('Error:', err.response ? err.response.data : err.message);
    }
})();
