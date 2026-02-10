const express = require('express');
const router = express.Router();
const supabase = require('../utils/supabase');

// Save bank details endpoint
router.post('/details', async (req, res) => {
    const { userId, accountNumber, ifsc, amount } = req.body;
    // userId here is likely mobile number provided by frontend.

    if (!userId || !accountNumber || !ifsc || !amount) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    if (amount < 10000) {
        return res.status(400).json({ error: 'Minimum deposit amount is ₹10,000' });
    }

    try {
        // 1. Resolve Mobile -> User UUID
        const { data: user } = await supabase.from('users').select('id').eq('mobile', userId).maybeSingle();

        if (!user) {
            return res.status(404).json({ error: 'User not found. Please register/login.' });
        }

        // 2. Upsert Bank Details
        const { data, error } = await supabase
            .from('bank_details')
            .upsert({
                user_id: user.id,
                account_number: accountNumber,
                ifsc: ifsc,
                amount: amount,
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' })
            .select()
            .single();

        if (error) throw error;

        res.json({ message: 'Bank details saved successfully', details: data });

    } catch (err) {
        console.error('Bank Details Save Error:', err.message);
        res.status(500).json({ error: 'Failed to save bank details' });
    }
});

// Get bank details endpoint
router.get('/details/:userId', async (req, res) => {
    const { userId } = req.params;
    // userId is mobile

    try {
        // 1. Resolve Mobile -> User UUID
        const { data: user } = await supabase.from('users').select('id').eq('mobile', userId).maybeSingle();

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // 2. Fetch Details
        const { data: details, error } = await supabase
            .from('bank_details')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();

        if (error) throw error;

        if (!details) {
            return res.status(404).json({ error: 'No details found' });
        }

        res.json({
            accountNumber: details.account_number,
            ifsc: details.ifsc,
            amount: details.amount
        });

    } catch (err) {
        console.error('Bank Details Fetch Error:', err.message);
        res.status(500).json({ error: 'Failed to fetch details' });
    }
});

module.exports = router;
