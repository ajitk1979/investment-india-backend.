// server/routes/transaction.js
const express = require('express');
const router = express.Router();
const supabase = require('../utils/supabase');

// Helper to get balance (Sum of deposits - Sum of withdrawals)
// Note: This needs to aggregate all transactions.
async function getUserBalance(uuid) {
    const { data: transactions, error } = await supabase
        .from('transactions')
        .select('type, amount')
        .eq('user_id', uuid);

    if (error) return 0;

    let balance = 0;
    transactions.forEach(t => {
        if (t.type === 'deposit') balance += Number(t.amount);
        else if (t.type === 'withdraw') balance -= Number(t.amount);
    });
    return balance;
}

// Deposit endpoint
router.post('/deposit', async (req, res) => {
    const { userId, amount } = req.body;
    // userId is mobile
    if (!userId || !amount) return res.status(400).json({ error: 'userId and amount required' });

    try {
        const { data: user } = await supabase.from('users').select('id').eq('mobile', userId).maybeSingle();
        if (!user) return res.status(404).json({ error: 'User not found' });
        const uuid = user.id;

        const { data: transaction, error } = await supabase
            .from('transactions')
            .insert([{
                user_id: uuid,
                type: 'deposit',
                amount: amount,
                status: 'success' // Assume success for demo, typically pending till paid
            }])
            .select()
            .single();

        if (error) throw error;

        const balance = await getUserBalance(uuid);

        const balance = await getUserBalance(uuid);

        // Realtime emit removed (Using Supabase Realtime in Frontend)

        res.json({ success: true, transaction, balance });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Withdraw endpoint
router.post('/withdraw', async (req, res) => {
    const { userId, amount } = req.body;
    if (!userId || !amount) return res.status(400).json({ error: 'userId and amount required' });

    try {
        const { data: user } = await supabase.from('users').select('id').eq('mobile', userId).maybeSingle();
        if (!user) return res.status(404).json({ error: 'User not found' });
        const uuid = user.id;

        const currentBalance = await getUserBalance(uuid);
        if (Number(amount) > currentBalance) return res.status(400).json({ error: 'Insufficient balance' });

        const { data: transaction, error } = await supabase
            .from('transactions')
            .insert([{
                user_id: uuid,
                type: 'withdraw',
                amount: amount,
                status: 'success'
            }])
            .select()
            .single();

        if (error) throw error;

        const balance = await getUserBalance(uuid);

        const balance = await getUserBalance(uuid);

        // Realtime emit removed

        res.json({ success: true, transaction, balance });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// History endpoint
router.get('/history/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const { data: user } = await supabase.from('users').select('id').eq('mobile', userId).maybeSingle();
        if (!user) return res.json({ success: true, history: [] }); // Empty if user not found (e.g. not registered yet but dashboard loaded)

        const { data: history, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', user.id)
            .order('timestamp', { ascending: false });

        if (error) throw error;

        res.json({ success: true, history });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
