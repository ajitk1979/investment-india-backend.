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

        const hasMpin = !!user && !!user.mpin;
        res.json({ message: 'OTP sent successfully', mobile, exists, hasMpin });
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

        if (error || !storedOtp) {
            console.warn(`[Verify OTP] OTP not found or error for ${mobile}:`, error);
            return res.status(401).json({ error: 'Invalid or expired OTP' });
        }

        if (storedOtp.code === otp) {
            console.log(`[Verify OTP] Success match for ${mobile}`);

            // Delete used OTP
            await supabase.from('otps').delete().eq('mobile', mobile);

            // Mark user as verified
            const { error: updateError } = await supabase
                .from('users')
                .update({ verified: true })
                .eq('mobile', mobile);

            if (updateError) {
                console.error(`[Verify OTP] Failed to update user verification status:`, updateError);
                // Proceed anyway? Or fail? Better to fail or retry, but let's log and proceed if possible, 
                // but returning 500 is safer to ensure data consistency.
                throw updateError;
            }

            // Fetch user to check MPIN status
            const { data: user, error: userError } = await supabase
                .from('users')
                .select('mpin, verified')
                .eq('mobile', mobile)
                .single();

            if (userError) {
                console.error(`[Verify OTP] Failed to fetch user details after verification:`, userError);
                throw userError;
            }

            const hasMpin = !!user && !!user.mpin;
            console.log(`[Verify OTP] Complete. hasMpin=${hasMpin}`);

            return res.json({ message: 'Verification successful', hasMpin });
        }

        console.log(`[Verify OTP] Mismatch: Sent=${otp}, Stored=${storedOtp.code}`);
        res.status(401).json({ error: 'Invalid OTP' });
    } catch (err) {
        console.error('Verify OTP Error:', err.message);
        res.status(500).json({ error: 'Verification failed due to server error' });
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

        const hasMpin = !!user && !!user.mpin;
        res.json({ message: 'Verification successful', mobile, exists, hasMpin });
    } catch (error) {
        console.error('Verification Error:', error.message);
        res.status(500).json({ error: 'Failed to fetch verification data' });
    }
});

// Check User Status (MPIN vs OTP)
router.post('/check-status', async (req, res) => {
    const { mobile } = req.body;
    if (!mobile) return res.status(400).json({ error: 'Mobile number required' });

    try {
        const { data: user, error } = await supabase
            .from('users')
            .select('verified, mpin')
            .eq('mobile', mobile)
            .maybeSingle();

        if (error) throw error;

        if (!user) {
            return res.json({ exists: false, verified: false, hasMpin: false });
        }

        res.json({
            exists: true,
            verified: user.verified,
            hasMpin: !!user.mpin
        });
    } catch (err) {
        res.status(500).json({ error: 'Server error check' });
    }
});

// Setup MPIN
router.post('/setup-mpin', async (req, res) => {
    const { mobile, mpin } = req.body;
    if (!mobile || !mpin) return res.status(400).json({ error: 'Mobile and MPIN required' });

    try {
        const { error } = await supabase
            .from('users')
            .update({ mpin })
            .eq('mobile', mobile);

        if (error) throw error;
        res.json({ success: true, message: 'MPIN secured' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to set MPIN' });
    }
});

// Login via MPIN
router.post('/login-mpin', async (req, res) => {
    const { mobile, mpin } = req.body;
    if (!mobile || !mpin) return res.status(400).json({ error: 'Mobile and MPIN required' });

    try {
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('mobile', mobile)
            .maybeSingle();

        if (error || !user) return res.status(401).json({ error: 'User not found' });

        if (user.mpin === mpin) {
            res.json({ message: 'Login successful', mobile, user });
        } else {
            res.status(401).json({ error: 'Invalid PIN' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Authentication error' });
    }
});

module.exports = router;
