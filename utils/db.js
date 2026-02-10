// server/utils/db.js
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../db.json');

// Initialize DB if it doesn't exist
const initDB = () => {
    if (!fs.existsSync(DB_PATH)) {
        const initialData = {
            users: [],
            otps: {},
            bankDetails: {},
            investments: {},
            transactions: [],
            adminSettings: {
                upiId: 'invest@personal',
                qrCode: '' // Will store base64 or path
            }
        };
        fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2));
    }
};

const readData = () => {
    initDB();
    try {
        const data = fs.readFileSync(DB_PATH, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error("Error reading DB:", err);
        return { users: [], otps: {}, bankDetails: {}, investments: {}, transactions: [] };
    }
};

const writeData = (data) => {
    try {
        fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
    } catch (err) {
        console.error("Error writing DB:", err);
    }
};

module.exports = { readData, writeData, addTransaction };

// Helper to add a transaction record
function addTransaction(userId, type, amount) {
    const data = readData();
    if (!data.transactions) data.transactions = [];
    const transaction = {
        id: Date.now(),
        userId,
        type,
        amount,
        timestamp: new Date().toISOString()
    };
    data.transactions.push(transaction);
    writeData(data);
    return transaction;
}
