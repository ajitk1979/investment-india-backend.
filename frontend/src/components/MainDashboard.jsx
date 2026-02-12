// src/components/MainDashboard.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.jpg';
import Header from './Header';

const MainDashboard = () => {
    const { user, logout } = useAuth();

    const stats = [
        { label: 'Community', value: '12.5k+', icon: '👥', color: '#38bdf8' },
        { label: 'Volume', value: '₹45L+', icon: '📈', color: '#4ade80' },
        { label: 'Growth', value: '+2.4%', icon: '🚀', color: '#fbbf24' }
    ];

    return (
        <div className="page-container fade-in">
            <div className="glass" style={{ textAlign: 'center', padding: '2.5rem 1.5rem', marginBottom: '1.5rem' }}>
                <img src={logo} alt="Logo" style={{ width: '100px', borderRadius: '24px', marginBottom: '1rem', border: '1px solid rgba(255,255,255,0.1)' }} />
                <h1 className="title" style={{ fontSize: '1.8rem' }}>Welcome, {user?.name || 'Investor'}</h1>
                <p style={{ opacity: 0.8, fontSize: '1rem' }}>Manage your portfolio and track live community trends.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '1.5rem' }}>
                {stats.map((s, i) => (
                    <div key={i} className="glass" style={{ padding: '1rem 0.5rem', textAlign: 'center', marginBottom: 0 }}>
                        <div style={{ fontSize: '1.2rem', marginBottom: '5px' }}>{s.icon}</div>
                        <div style={{ fontWeight: '700', fontSize: '1rem', color: s.color }}>{s.value}</div>
                        <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', opacity: 0.6, letterSpacing: '0.05em' }}>{s.label}</div>
                    </div>
                ))}
            </div>

            <div className="form-grid">
                <Link to="/dashboard" style={{ textDecoration: 'none' }}>
                    <div className="glass nav-card" style={{ padding: '1.25rem', marginBottom: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div style={{ background: 'rgba(56, 189, 248, 0.1)', padding: '12px', borderRadius: '14px', fontSize: '1.5rem' }}>💰</div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>My Portfolio</h3>
                                <p style={{ margin: '2px 0 0', fontSize: '0.8rem' }}>View active investments & returns.</p>
                            </div>
                        </div>
                    </div>
                </Link>

                <Link to="/transactions" style={{ textDecoration: 'none' }}>
                    <div className="glass nav-card" style={{ padding: '1.25rem', marginBottom: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div style={{ background: 'rgba(74, 222, 128, 0.1)', padding: '12px', borderRadius: '14px', fontSize: '1.5rem' }}>⚡</div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Live Feed</h3>
                                <p style={{ margin: '2px 0 0', fontSize: '0.8rem' }}>Real-time transaction updates.</p>
                            </div>
                        </div>
                    </div>
                </Link>

                <button onClick={logout} className="secondary-btn" style={{ marginTop: '1rem' }}>
                    Logout Securely
                </button>
            </div>

            <p style={{ textAlign: 'center', opacity: 0.4, fontSize: '0.75rem', marginTop: '2rem' }}>
                Securely encrypted by Invest India Systems
            </p>
        </div>
    );
};

export default MainDashboard;
