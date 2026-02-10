// server/routes/auth.js
const express = require('express');
const router = express.Router();
const supabase = require('../utils/supabase');
const axios = require('axios');

// Register endpoint
router.post('/register', async (req, res) => {
    const { name, email, mobile } = req.body;
    if (!name || !email || !mobile) {
        return res.status(400).json({ error: 'Name, email, and mobile are required' });
    }

    try {
        // Check if user exists
        let { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('mobile', mobile)
            .maybeSingle();

        if (error) throw error;

        const exists = !!user && user.verified;

        if (!user) {
            const { data: newUser, error: createError } = await supabase
                .from('users')
                .insert([{ name, email, mobile, verified: false }])
                .select()
                .single();

            if (createError) throw createError;
            user = newUser;
        }

        // Generate mock OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        console.log(`[DEBUG] Generated OTP for ${mobile}: ${otp}`);

        // Store OTP in Supabase
        const { error: otpError } = await supabase
            .from('otps')
            .upsert({ mobile, code: otp }, { onConflict: 'mobile' });

        if (otpError) throw otpError;

        const otpService = require('../utils/otpService');
        try {
            await otpService.sendOTP(mobile, otp);
        } catch (otpErr) {
            console.error("OTP Delivery Failed:", otpErr);
            return res.status(500).json({ error: 'Failed to send OTP. Please try again later.' });
        }

        res.json({ message: 'OTP sent successfully', mobile, exists });
    } catch (err) {
        console.error('Register Error:', err.message);
        res.status(500).json({ error: 'Database error During Registration' });
    }
});

// Verify OTP endpoint
router.post('/verify-otp', async (req, res) => {
    const { mobile, otp } = req.body;
    console.log(`[Verify OTP] Received: mobile=${mobile}, otp=${otp}`);

    if (!mobile || !otp) {
        return res.status(400).json({ error: 'Mobile number and OTP are required' });
    }

    try {
        // Fetch OTP
        const { data: storedOtp, error } = await supabase
            .from('otps')
            .select('*')
            .eq('mobile', mobile)
            .maybeSingle();

        console.log(`[Verify OTP] DB Fetch:`, storedOtp, error);

        if (error || !storedOtp) {
            return res.status(401).json({ error: 'Invalid or expired OTP' });
        }

        if (storedOtp.code === otp) {
            console.log(`[Verify OTP] Success match`);
            // Delete used OTP
            await supabase.from('otps').delete().eq('mobile', mobile);

            // Mark user as verified
            await supabase
                .from('users')
                .update({ verified: true })
                .eq('mobile', mobile);

            return res.json({ message: 'Verification successful' });
        }

        console.log(`[Verify OTP] Mismatch: Sent=${otp}, Stored=${storedOtp.code}`);
        res.status(401).json({ error: 'Invalid OTP' });
    } catch (err) {
        console.error('Verify OTP Error:', err.message);
        res.status(500).json({ error: 'Verification failed' });
    }
});

// phone.email verify endpoint
router.post('/phone-email-verify', async (req, res) => {
    const { user_json_url } = req.body;
    if (!user_json_url) {
        return res.status(400).json({ error: 'user_json_url is required' });
    }

    try {
        const response = await axios.get(user_json_url);
        const jsonData = response.data;
        const mobile = jsonData.user_phone_number;
        const name = `${jsonData.user_first_name || ''} ${jsonData.user_last_name || ''}`.trim();

        if (!mobile) {
            return res.status(400).json({ error: 'Could not retrieve phone number' });
        }

        // Check/Create User
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('mobile', mobile)
            .maybeSingle();

        let exists = !!user && user.verified;

        if (!user) {
            await supabase.from('users').insert([{
                name: name || 'Phone Email User',
                email: `${mobile}@phone.email`,
                mobile,
                verified: true
            }]);
        } else {
            await supabase.from('users').update({ verified: true }).eq('mobile', mobile);
        }

        res.json({ message: 'Verification successful', mobile, exists });
    } catch (error) {
        console.error('Verification Error:', error.message);
        res.status(500).json({ error: 'Failed to fetch verification data' });
    }
});

module.exports = router;
