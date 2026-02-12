import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.jpg';

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="page-container fade-in">
            <div className="glass" style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
                <div style={{ position: 'relative', display: 'inline-block' }}>
                    <img
                        src={logo}
                        alt="Investment India"
                        style={{
                            width: '140px',
                            borderRadius: '24px',
                            marginBottom: '20px',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}
                    />
                    <div className="pulse-dot" style={{ position: 'absolute', top: '10px', right: '10px' }}></div>
                </div>

                <h1 className="title">Investment India</h1>

                <p style={{ marginBottom: '2.5rem', fontSize: '1.1rem' }}>
                    Your gateway to secure and profitable community investments.
                </p>

                <div className="form-grid">
                    <button
                        onClick={() => navigate('/login')}
                        className="primary-btn"
                    >
                        Sign In
                    </button>

                    <button
                        onClick={() => navigate('/register')}
                        className="secondary-btn"
                    >
                        Create Account
                    </button>
                </div>

                <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'center', gap: '20px', opacity: 0.6, fontSize: '0.85rem' }}>
                    <span>🛡️ Secure</span>
                    <span>⚡ Fast</span>
                    <span>🤝 Trusted</span>
                </div>
            </div>

            <p style={{ textAlign: 'center', marginTop: '10px', opacity: 0.4, fontSize: '0.8rem' }}>
                © 2026 Investment India • All rights reserved
            </p>
        </div>
    );
};

export default LandingPage;
