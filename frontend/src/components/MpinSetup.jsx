import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config';
import Header from './Header';

const MpinSetup = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { mobile } = location.state || {};

    const [mpin, setMpin] = useState('');
    const [confirmMpin, setConfirmMpin] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (mpin.length < 4) {
            setError('PIN must be at least 4 digits');
            return;
        }

        if (mpin !== confirmMpin) {
            setError('PINs do not match');
            return;
        }

        setLoading(true);
        try {
            await axios.post(`${API_BASE_URL}/api/auth/setup-mpin`, { mobile, mpin });
            alert('Security PIN established successfully!');
            navigate('/login'); // Redirect to login or home
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to set PIN');
        } finally {
            setLoading(false);
        }
    };

    if (!mobile) return <div className="page-container glass">Invalid Session</div>;

    return (
        <div className="page-container fade-in">
            <Header title="Secure Your Account" />
            <div className="glass" style={{ padding: '2.5rem 1.5rem', textAlign: 'center' }}>
                <div style={{ background: 'rgba(56, 189, 248, 0.1)', display: 'inline-flex', padding: '15px', borderRadius: '50%', marginBottom: '1.5rem' }}>
                    <span style={{ fontSize: '2rem' }}>🛡️</span>
                </div>
                <h2 className="title" style={{ fontSize: '1.5rem' }}>Set Security PIN</h2>
                <p style={{ marginBottom: '2rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    Create a 4-6 digit PIN to access your account <br /> quickly without OTP.
                </p>

                {error && <div className="error-msg">{error}</div>}

                <form onSubmit={handleSubmit} className="form-grid">
                    <div>
                        <input
                            type="password"
                            placeholder="Create PIN"
                            value={mpin}
                            onChange={(e) => setMpin(e.target.value)}
                            maxLength={6}
                            style={{ textAlign: 'center', letterSpacing: '0.5em', fontSize: '1.2rem', fontWeight: '800' }}
                            required
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            placeholder="Confirm PIN"
                            value={confirmMpin}
                            onChange={(e) => setConfirmMpin(e.target.value)}
                            maxLength={6}
                            style={{ textAlign: 'center', letterSpacing: '0.5em', fontSize: '1.2rem', fontWeight: '800' }}
                            required
                        />
                    </div>

                    <button type="submit" className="primary-btn" disabled={loading}>
                        {loading ? 'Securing...' : 'Set Security PIN'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default MpinSetup;
