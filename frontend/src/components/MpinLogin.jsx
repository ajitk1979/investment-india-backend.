import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config';
import { useAuth } from '../context/AuthContext';
import Header from './Header';

const MpinLogin = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { login } = useAuth();
    const { mobile } = location.state || {};

    const [mpin, setMpin] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await axios.post(`${API_BASE_URL}/api/auth/login-mpin`, { mobile, mpin });
            login(res.data.user);
            navigate('/home');
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid PIN');
        } finally {
            setLoading(false);
        }
    };

    if (!mobile) return <div className="page-container glass">Invalid Session</div>;

    return (
        <div className="page-container fade-in">
            <Header title="Quick Access" />
            <div className="glass" style={{ padding: '2.5rem 1.5rem', textAlign: 'center' }}>
                <div style={{ background: 'rgba(56, 189, 248, 0.1)', display: 'inline-flex', padding: '15px', borderRadius: '50%', marginBottom: '1.5rem' }}>
                    <span style={{ fontSize: '2rem' }}>🔑</span>
                </div>
                <h2 className="title" style={{ fontSize: '1.5rem' }}>Enter Security PIN</h2>
                <p style={{ marginBottom: '2rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    Returning user detected for <br />
                    <strong style={{ color: 'var(--accent-primary)' }}>{mobile}</strong>
                </p>

                {error && <div className="error-msg">{error}</div>}

                <form onSubmit={handleSubmit} className="form-grid">
                    <input
                        type="password"
                        placeholder="• • • •"
                        value={mpin}
                        onChange={(e) => setMpin(e.target.value)}
                        maxLength={6}
                        style={{ textAlign: 'center', letterSpacing: '0.8em', fontSize: '1.5rem', fontWeight: '900' }}
                        autoFocus
                        required
                    />

                    <button type="submit" className="primary-btn" disabled={loading}>
                        {loading ? 'Unlocking...' : 'Unlock Account'}
                    </button>

                    <button
                        type="button"
                        className="secondary-btn"
                        style={{ width: '100%', marginTop: '10px' }}
                        onClick={() => navigate('/')}
                    >
                        Use Different Account
                    </button>

                    <p style={{ fontSize: '0.8rem', opacity: 0.5, marginTop: '1.5rem' }}>
                        Forgot PIN? <span style={{ color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: '600' }} onClick={() => navigate('/register', { state: { mobile } })}>Use OTP</span>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default MpinLogin;
