// server/routes/investment.js
const express = require('express');
const router = express.Router();
const supabase = require('../utils/supabase');
const multer = require('multer');
const path = require('path');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });
const { uploadReceipt } = require('../utils/storage');

// Create investment plan endpoint
router.post('/plan', async (req, res) => {
    const { userId, baseAmount, days } = req.body;
    // Note: userId coming from frontend might be mobile number or ID. 
    // We need to resolve it to UUID from users table if it's mobile.
    // For now assuming frontend passes mobile as userId (legacy).
    // Let's find the user first.

    if (!userId || !baseAmount || !days) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // Resolve User ID (UUID) from mobile
        const { data: user } = await supabase.from('users').select('id').eq('mobile', userId).maybeSingle();
        if (!user) return res.status(404).json({ error: 'User not found' });

        const uuid = user.id;

        // Calculate return
        const multiplier = days === 10 ? 1.1 : days === 20 ? 1.3 : days === 30 ? 1.5 : 1;
        const expectedReturn = Math.round(baseAmount * multiplier);

        // Delete any existing pending plans for this user to keep it simple? Or allow multiple?
        // Let's allow multiple but frontend only shows one usually. 
        // For migration parity, let's insert new.

        const { data: investment, error } = await supabase
            .from('investments')
            .insert([{
                user_id: uuid,
                base_amount: baseAmount,
                days: days,
                expected_return: expectedReturn,
                status: 'pending'
            }])
            .select()
            .single();

        if (error) throw error;

        res.json({ message: 'Plan created successfully', investment });
    } catch (err) {
        console.error('Plan Creation Error:', err.message);
        console.error('Stack:', err.stack);
        res.status(500).json({ error: `Failed to create plan: ${err.message}` });
    }
});

// Payment endpoint (P2P: UTR + Receipt)
router.post('/payment', upload.single('receipt'), async (req, res) => {
    const { userId, paymentMethod, utrNumber } = req.body;

    // Legacy: userId is mobile.
    if (!userId) return res.status(400).json({ error: 'User ID is required' });

    try {
        const { data: user } = await supabase.from('users').select('id').eq('mobile', userId).maybeSingle();
        if (!user) return res.status(404).json({ error: 'User not found' });
        const uuid = user.id;

        // Find pending investment
        const { data: inv } = await supabase
            .from('investments')
            .select('id')
            .eq('user_id', uuid)
            .eq('status', 'pending')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (!inv) return res.status(404).json({ error: 'No pending investment plan found' });

        let receiptUrl = null;
        if (req.file) {
            try {
                receiptUrl = await uploadReceipt(req.file);
            } catch (uploadError) {
                console.error('Upload Error:', uploadError);
                return res.status(500).json({ error: 'Failed to upload receipt' });
            }
        }

        const { data: updatedInv, error } = await supabase
            .from('investments')
            .update({
                status: 'verifying',
                payment_method: paymentMethod || 'UPI',
                receipt_url: receiptUrl,
                utr_number: utrNumber,
                submitted_at: new Date().toISOString()
            })
            .eq('id', inv.id)
            .select()
            .single();

        if (error) throw error;

        res.json({ message: 'Receipt submitted for verification', investment: updatedInv });
    } catch (err) {
        console.error('Payment Error:', err.message);
        res.status(500).json({ error: 'Payment submission failed' });
    }
});

// Get investment status
router.get('/status/:userId', async (req, res) => {
    const { userId } = req.params;
    // userId is mobile

    try {
        const { data: user } = await supabase.from('users').select('id').eq('mobile', userId).maybeSingle();
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Get latest investment
        const { data: inv, error } = await supabase
            .from('investments')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (!inv) return res.status(404).json({ error: 'No investment found' });

        // Map snake_case to camelCase for frontend compatibility
        const formattedInv = {
            ...inv,
            baseAmount: inv.base_amount,
            expectedReturn: inv.expected_return,
            createdAt: inv.created_at,
            receiptUrl: inv.receipt_url
        };

        res.json({ investment: formattedInv });
    } catch (err) {
        console.error('Status Fetch Error:', err.message);
        res.status(500).json({ error: 'Failed to fetch status' });
    }
});

module.exports = router;
