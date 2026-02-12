import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config';
import { useAuth } from '../context/AuthContext';
import Header from './Header';

const plans = [
    { days: 10, multiplier: 1.1, label: 'Standard Growth', icon: '🌱' },
    { days: 20, multiplier: 1.3, label: 'Accelerated', icon: '⚡' },
    { days: 30, multiplier: 1.5, label: 'Maximum Alpha', icon: '💎' },
];

const PlanSelection = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const mobile = location.state?.mobile || user?.mobile || '';
    const [selected, setSelected] = useState(null);
    const [error, setError] = useState('');

    const handleSelect = (plan) => {
        setSelected(plan);
    };

    const handleContinue = async () => {
        if (!selected) {
            setError('Please select a strategic plan');
            return;
        }
        try {
            const payload = {
                userId: mobile,
                baseAmount: 10000,
                days: selected.days,
            };
            const res = await axios.post(`${API_BASE_URL}/api/investment/plan`, payload);
            navigate('/summary', { state: { mobile, plan: selected, investment: res.data.investment } });
        } catch (err) {
            console.error('Plan Error:', err);
            const msg = err.response?.data?.error || err.message || 'Failed to create plan';
            setError(msg);
        }
    };

    return (
        <div className="page-container fade-in">
            <Header title="Strategic Selection" />
            <div className="glass" style={{ padding: '2rem 1.5rem' }}>
                <h2 className="title" style={{ fontSize: '1.4rem', textAlign: 'left', marginBottom: '1.5rem' }}>Choose Your Path</h2>

                {error && <div className="error-msg">{error}</div>}

                <div className="form-grid" style={{ gap: '12px' }}>
                    {plans.map((p) => (
                        <div
                            key={p.days}
                            className={`nav-card glass ${selected?.days === p.days ? 'active-plan' : ''}`}
                            style={{
                                padding: '1.5rem',
                                marginBottom: 0,
                                cursor: 'pointer',
                                border: selected?.days === p.days ? '2px solid var(--accent-primary)' : '1px solid rgba(255,255,255,0.05)',
                                background: selected?.days === p.days ? 'rgba(56, 189, 248, 0.05)' : 'rgba(255,255,255,0.02)'
                            }}
                            onClick={() => handleSelect(p)}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', opacity: 0.6, letterSpacing: '0.1em', marginBottom: '4px' }}>
                                        {p.days} Day Commitment
                                    </div>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{p.label}</h3>
                                    <p style={{ margin: '8px 0 0', color: 'var(--success)', fontWeight: '700' }}>
                                        Target: ₹{Math.round(10000 * p.multiplier)}
                                    </p>
                                </div>
                                <div style={{ fontSize: '1.5rem' }}>{p.icon}</div>
                            </div>
                        </div>
                    ))}
                </div>

                <button className="primary-btn" onClick={handleContinue} style={{ marginTop: '2rem' }}>
                    Confirm Strategic Choice
                </button>
            </div>

            <p style={{ textAlign: 'center', opacity: 0.4, fontSize: '0.75rem', marginTop: '2rem' }}>
                Returns are calculated based on community algorithms.
            </p>
        </div>
    );
};

export default PlanSelection;
