// server/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const serverless = require('serverless-http');
const path = require('path');

const app = express();
const router = express.Router();

app.use(cors({
  origin: '*',
  allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
app.use(bodyParser.json());

// Import routes
const authRouter = require('./routes/auth');
const bankRouter = require('./routes/bank');
const investmentRouter = require('./routes/investment');
const adminRouter = require('./routes/admin');
const transactionRouter = require('./routes/transaction');

// Use a router prefix for Netlify Functions if needed (/.netlify/functions/api)
// But for standalone deployment, we can keep /api
// Let's use standard middleware
app.use('/api/auth', authRouter);
app.use('/api/bank', bankRouter);
app.use('/api/investment', investmentRouter);
app.use('/api/admin', adminRouter);
app.use('/api/transaction', transactionRouter);

// Serve static assets only in development or if needed
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// app.use(express.static(path.join(__dirname, 'public')));

// Export for Serverless
module.exports = app;
module.exports.handler = serverless(app);

// Local Development Support
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}
