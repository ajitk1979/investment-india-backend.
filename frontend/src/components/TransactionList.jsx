import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import API_BASE_URL from '../config';
import Header from './Header';
import { supabase } from '../supabaseClient';

const TransactionList = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchHistory = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/transaction/history/${user.mobile}`);
            setTransactions(res.data.history || []);
        } catch (err) {
            console.error('Failed to fetch transaction history');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.mobile) {
            fetchHistory();

            const subscription = supabase
                .channel('realtime:transactions')
                .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'transactions' }, (payload) => {
                    fetchHistory();
                })
                .subscribe();

            return () => {
                supabase.removeChannel(subscription);
            };
        }
    }, [user]);

    if (loading) return <div className="page-container fade-in"><div className="glass">Loading...</div></div>;

    return (
        <div className="page-container fade-in" style={{ maxWidth: '800px' }}>
            <Header title="Transaction Log" />

            <div className="glass" style={{ padding: '0.5rem' }}>
                <div style={{ padding: '1rem' }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: '1.5rem', opacity: 0.8 }}>Recent Activity</h3>

                    <div className="form-grid" style={{ gap: '10px' }}>
                        {transactions.map((t) => (
                            <div key={t.id} className="nav-card glass" style={{ padding: '1.25rem', marginBottom: 0, border: 'none', background: 'rgba(255,255,255,0.02)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '12px',
                                            background: t.type === 'deposit' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '1.2rem'
                                        }}>
                                            {t.type === 'deposit' ? '📥' : '📤'}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: '700', textTransform: 'capitalize', fontSize: '0.95rem' }}>{t.type}</div>
                                            <div style={{ fontSize: '0.75rem', opacity: 0.5 }}>{new Date(t.timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</div>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontWeight: '800', fontSize: '1rem', color: t.type === 'deposit' ? 'var(--success)' : 'var(--error)' }}>
                                            {t.type === 'deposit' ? '+' : '-'}₹{t.amount}
                                        </div>
                                        <div style={{
                                            fontSize: '0.65rem',
                                            background: 'rgba(255,255,255,0.05)',
                                            padding: '2px 6px',
                                            borderRadius: '6px',
                                            display: 'inline-block',
                                            marginTop: '4px',
                                            fontWeight: 'bold',
                                            letterSpacing: '0.05em'
                                        }}>
                                            {t.status ? t.status.toUpperCase() : 'COMPLETED'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {transactions.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '3rem 1rem', opacity: 0.4 }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📜</div>
                            <p>No transactions found in this account.</p>
                        </div>
                    )}
                </div>
            </div>

            <button
                className="secondary-btn"
                onClick={() => navigate('/home')}
                style={{ marginTop: '1.5rem', width: '100%' }}
            >
                Back to Dashboard
            </button>
        </div>
    );
};

export default TransactionList;
