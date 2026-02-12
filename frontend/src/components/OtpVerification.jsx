import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import API_BASE_URL from '../config';

const OtpVerification = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { login } = useAuth();

    const mobile = location.state?.mobile || '';
    const exists = location.state?.exists || false;

    const [otp, setOtp] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            const response = await axios.post(`${API_BASE_URL}/api/auth/verify-otp`, {
                mobile,
                otp
            });

            if (response.data.error) throw new Error(response.data.error);

            if (response.data.hasMpin) {
                navigate('/home');
            } else {
                navigate('/mpin-setup', { state: { mobile } });
            }

        } catch (err) {
            console.error('OTP Error:', err);
            setError(err.response?.data?.error || err.message || 'Verification failed');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="page-container fade-in">
            <div className="glass" style={{ textAlign: 'center', padding: '2.5rem 1.5rem' }}>
                <div style={{ background: 'rgba(56, 189, 248, 0.1)', display: 'inline-flex', padding: '15px', borderRadius: '50%', marginBottom: '1.5rem' }}>
                    <span style={{ fontSize: '2rem' }}>🔒</span>
                </div>
                <h2 className="title" style={{ fontSize: '1.5rem' }}>Verify Mobile</h2>
                <p style={{ marginBottom: '2rem', fontSize: '0.9rem' }}>
                    A 6-digit code has been sent to <br />
                    <strong style={{ color: 'var(--accent-primary)' }}>{mobile}</strong>
                </p>

                {error && <div className="error-msg">{error}</div>}

                <form onSubmit={handleSubmit} className="form-grid">
                    <input
                        type="text"
                        name="otp"
                        placeholder="0 0 0 0 0 0"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        required
                        style={{ textAlign: 'center', letterSpacing: '0.5em', fontSize: '1.2rem', fontWeight: '800' }}
                        disabled={submitting}
                        autoFocus
                    />

                    <button type="submit" className="primary-btn" disabled={submitting}>
                        {submitting ? 'Verifying...' : 'Unlock Account'}
                    </button>

                    <button
                        type="button"
                        className="secondary-btn"
                        style={{ width: '100%', marginTop: '10px' }}
                        onClick={() => navigate('/')}
                        disabled={submitting}
                    >
                        Back to Start
                    </button>

                    <p style={{ fontSize: '0.8rem', opacity: 0.5, marginTop: '1.5rem' }}>
                        Didn't receive code? <span style={{ color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: '600' }}>Resend</span>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default OtpVerification;
