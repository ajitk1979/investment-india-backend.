import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import API_BASE_URL from '../config';
import Header from './Header';
import { supabase } from '../supabaseClient';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [investment, setInvestment] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchStatus = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/investment/status/${user.mobile}`);
            setInvestment(res.data.investment);
        } catch (err) {
            console.error('Failed to fetch status');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.mobile) {
            fetchStatus();

            // Realtime subscription for user-specific investment changes
            const subscription = supabase
                .channel(`user-investment-${user.mobile}`)
                .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: 'investments',
                    filter: `userId=eq.${user.mobile}`
                }, (payload) => {
                    console.log('User investment updated:', payload);
                    fetchStatus(); // Re-fetch to get latest state
                })
                .subscribe();

            return () => {
                supabase.removeChannel(subscription);
            };
        }
    }, [user]);

    if (loading) return <div className="page-container fade-in"><div className="glass">Loading Dashboard...</div></div>;

    return (
        <div className="page-container fade-in">
            <Header title="My Portfolio" />

            <div className="glass" style={{ textAlign: 'center', padding: '2rem 1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.05)', display: 'inline-flex', padding: '15px', borderRadius: '50%', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '2rem' }}>💰</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Current Balance Equivalent</p>
                <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: 'var(--accent-primary)' }}>
                    ₹{investment ? investment.baseAmount : '0'}
                </h2>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--success)' }}>+12.4% Est.</span>
                    <span style={{ opacity: 0.4 }}>•</span>
                    <span style={{ opacity: 0.6 }}>Locked for {investment?.days || 0} days</span>
                </div>
            </div>

            {investment ? (
                <div className="glass" style={{ padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', textAlign: 'left' }}>Active Strategy</h3>
                    <div className="form-grid" style={{ gap: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                            <span style={{ opacity: 0.7 }}>Expected Return</span>
                            <span style={{ fontWeight: '700', color: 'var(--success)' }}>₹{investment.expectedReturn}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                            <span style={{ opacity: 0.7 }}>Current Status</span>
                            <span style={{
                                fontWeight: '700',
                                color: investment.status === 'paid' ? 'var(--success)' :
                                    investment.status === 'verifying' ? 'var(--accent-primary)' : '#fbbf24'
                            }}>
                                {investment.status.toUpperCase()}
                            </span>
                        </div>

                        {investment.status === 'pending' && (
                            <button className="primary-btn" style={{ marginTop: '10px' }} onClick={() => navigate('/summary')}>
                                Complete Payment
                            </button>
                        )}

                        {investment.status === 'verifying' && (
                            <div style={{ background: 'rgba(56, 189, 248, 0.05)', padding: '12px', borderRadius: '12px', fontSize: '0.85rem', border: '1px solid rgba(56, 189, 248, 0.1)' }}>
                                🔔 Admin is verifying your proof of payment. Updates will appear here.
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="glass" style={{ textAlign: 'center', padding: '2.5rem 1.5rem' }}>
                    <p style={{ marginBottom: '1.5rem' }}>No active investments found in your portfolio.</p>
                    <button className="primary-btn" onClick={() => navigate('/bank')} style={{ width: '100%' }}>Start Your First Trade</button>
                </div>
            )}

            <button
                className="secondary-btn"
                onClick={() => navigate('/transactions')}
                style={{ marginTop: '1rem', width: '100%' }}
            >
                Transaction History
            </button>

            <p style={{ textAlign: 'center', opacity: 0.4, fontSize: '0.7rem', marginTop: '2rem' }}>
                All investments are subject to community guidelines.
            </p>
        </div>
    );
};

export default Dashboard;
