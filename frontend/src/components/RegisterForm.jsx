import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import API_BASE_URL from '../config';
import logo from '../assets/logo.jpg';

const RegisterForm = ({ initialMode = 'register' }) => {
    const [form, setForm] = useState({ name: '', email: '', mobile: '' });
    const [isLogin, setIsLogin] = useState(initialMode === 'login');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { isAuthenticated, loading: authLoading, login } = useAuth();

    // Optimize the Phone.Email listener
    const handlePhoneEmail = useCallback(async (res) => {
        const user_json_url = res.user_json_url;
        setSubmitting(true);
        try {
            const response = await axios.post(`${API_BASE_URL}/api/auth/phone-email-verify`, { user_json_url });
            login({ mobile: response.data.mobile, verified: true });
            if (response.data.hasMpin) {
                navigate('/mpin-login', { state: { mobile: response.data.mobile } });
            } else if (response.data.exists) {
                navigate('/home');
            } else {
                navigate('/mpin-setup', { state: { mobile: response.data.mobile } });
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Verification failed');
        } finally {
            setSubmitting(false);
        }
    }, [login, navigate]);

    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            navigate('/home');
        }
    }, [isAuthenticated, authLoading, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        // Batch updates or handle efficiently
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        const cleanMobile = form.mobile.replace(/\D/g, '');
        if (cleanMobile.length < 10) {
            setError('Please enter a valid mobile number');
            setSubmitting(false);
            return;
        }

        try {
            const mobileWithCode = cleanMobile.startsWith('+') ? cleanMobile : `+91${cleanMobile}`;

            const response = await axios.post(`${API_BASE_URL}/api/auth/register`, {
                name: form.name || 'User',
                email: form.email || `${mobileWithCode}@example.com`,
                mobile: mobileWithCode
            });

            if (response.data.error) throw new Error(response.data.error);

            if (response.data.hasMpin) {
                navigate('/mpin-login', { state: { mobile: mobileWithCode } });
            } else {
                navigate('/otp', { state: { mobile: mobileWithCode, exists: response.data.exists } });
            }

        } catch (err) {
            console.error('Registration Error:', err);
            const msg = err.response?.data?.error || err.message || 'Action failed';
            setError(msg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="page-container fade-in">
            <div className="glass" style={{ textAlign: 'center', position: 'relative' }}>
                <button
                    onClick={() => navigate('/')}
                    style={{ position: 'absolute', top: '20px', left: '20px', background: 'transparent', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer', opacity: 0.7 }}
                >
                    ‹
                </button>
                <img src={logo} alt="Logo" style={{ width: '100px', borderRadius: '20px', marginBottom: '1.5rem', border: '1px solid rgba(255,255,255,0.1)' }} />
                <h2 className="title">{isLogin ? 'Welcome Back' : 'Join the Community'}</h2>

                {error && <div className="error-msg">{error}</div>}

                <form onSubmit={handleSubmit} className="form-grid">
                    {!isLogin && (
                        <>
                            <input
                                type="text"
                                name="name"
                                placeholder="Full Name"
                                value={form.name}
                                onChange={handleChange}
                                required
                                disabled={submitting}
                            />
                            <input
                                type="email"
                                name="email"
                                placeholder="Email Address"
                                value={form.email}
                                onChange={handleChange}
                                required
                                disabled={submitting}
                            />
                        </>
                    )}
                    <input
                        type="tel"
                        name="mobile"
                        placeholder="Mobile Number"
                        value={form.mobile}
                        onChange={handleChange}
                        required
                        disabled={submitting}
                    />

                    <button type="submit" className="primary-btn" disabled={submitting}>
                        {submitting ? 'Processing...' : (isLogin ? 'Login with OTP' : 'Create Account')}
                    </button>

                    <div style={{ marginTop: '1rem' }}>
                        <p style={{ fontSize: '0.9rem' }}>
                            {isLogin ? "New here?" : "Already have an account?"}
                            <span
                                onClick={() => { setIsLogin(!isLogin); setError(''); }}
                                style={{ color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 'bold', marginLeft: '5px' }}
                            >
                                {isLogin ? 'Sign Up' : 'Sign In'}
                            </span>
                        </p>
                    </div>
                </form>


            </div>

            <p style={{ textAlign: 'center', opacity: 0.5, fontSize: '0.8rem', marginTop: '1rem' }}>
                By continuing, you agree to our Terms and Conditions.
            </p>
        </div>
    );
};

export default RegisterForm;
