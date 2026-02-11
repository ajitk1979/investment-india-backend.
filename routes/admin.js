// server/routes/admin.js
const express = require('express');
const router = express.Router();
const supabase = require('../utils/supabase');
const multer = require('multer');
const path = require('path');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });
const { uploadReceipt } = require('../utils/storage');

// Get admin settings
router.get('/settings', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('admin_settings')
            .select('*')
            .single();

        if (error) throw error;

        // Map snake_case to camelCase
        res.json({
            upiId: data.upi_id,
            qrCode: data.qr_code_url
        });
    } catch (err) {
        // If empty, return default
        res.json({ upiId: 'invest@personal', qrCode: '' });
    }
});

// Update settings
router.post('/settings', upload.single('qrCode'), async (req, res) => {
    const { upiId } = req.body;
    let qrCodeUrl = null;
    if (req.file) {
        try {
            qrCodeUrl = await uploadReceipt(req.file);
        } catch (uploadError) {
            console.error('QR Upload Error:', uploadError);
            return res.status(500).json({ error: 'Failed to upload QR code' });
        }
    }

    try {
        console.log('Attempting to update settings. UPI:', upiId, 'QR:', qrCodeUrl ? 'Yes' : 'No');
        const updateData = { upi_id: upiId, updated_at: new Date().toISOString() };
        if (qrCodeUrl) updateData.qr_code_url = qrCodeUrl;

        const { data: existing, error: fetchError } = await supabase.from('admin_settings').select('id').limit(1).maybeSingle();

        if (fetchError) {
            console.error('Fetch existing settings error:', fetchError);
            return res.status(500).json({ error: `Database fetch error: ${fetchError.message}` });
        }

        let result;
        if (existing) {
            result = await supabase.from('admin_settings').update(updateData).eq('id', existing.id);
        } else {
            result = await supabase.from('admin_settings').insert([updateData]);
        }

        if (result.error) {
            console.error('Upsert settings error:', result.error);
            return res.status(500).json({ error: `Database update error: ${result.error.message}` });
        }

        res.json({ success: true });
    } catch (err) {
        console.error('Admin Settings Route Error:', err);
        res.status(500).json({ error: err.message || 'Failed to update settings' });
    }
});

// Get all investments (for verification)
router.get('/investments', async (req, res) => {
    try {
        // Join with users
        const { data: investments, error } = await supabase
            .from('investments')
            .select(`
                *,
                users (
                    name,
                    mobile
                )
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Map to frontend format
        const formatted = investments.map(inv => ({
            userId: inv.users ? inv.users.mobile : 'Unknown', // Keep legacy userId as mobile for display? Or use UUID? 
            // AdminDashboard expects userId to be displayed.
            // And also used for key. 
            // NOTE: We should send the *Investment ID* for the verify action.
            id: inv.id,
            userName: inv.users ? inv.users.name : 'Unknown',
            baseAmount: inv.base_amount,
            receiptUrl: inv.receipt_url,
            status: inv.status,
            utrNumber: inv.utr_number,
            paymentMethod: inv.payment_method
        }));

        res.json({ investments: formatted });
    } catch (err) {
        console.error('Admin Investments Error:', err.message);
        res.status(500).json({ error: 'Failed to fetch investments' });
    }
});

// Verify investment
router.post('/verify', async (req, res) => {
    const { investmentId, status } = req.body;
    // status: 'paid' or 'rejected'

    if (!investmentId || !status) {
        return res.status(400).json({ error: 'Investment ID and status required' });
    }

    try {
        const { error } = await supabase
            .from('investments')
            .update({ status: status })
            .eq('id', investmentId);

        if (error) throw error;

        res.json({ success: true });
    } catch (err) {
        console.error('Verify Error:', err.message);
        res.status(500).json({ error: 'Verification failed' });
    }
});

module.exports = router;
