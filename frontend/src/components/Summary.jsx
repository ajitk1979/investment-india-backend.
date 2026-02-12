// src/components/Summary.jsx
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from './Header';

const Summary = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const state = location.state || {};
    const mobile = state.mobile || user?.mobile || '';
    const { plan, investment } = state;

    const handleConfirm = () => {
        navigate('/payment', { state: { mobile, plan, investment } });
    };

    if (!plan || !investment) {
        return (
            <div className="page-container fade-in">
                <div className="glass" style={{ textAlign: 'center' }}>
                    <p className="error-msg">Missing configuration details.</p>
                    <button className="primary-btn" onClick={() => navigate('/plan')}>Select Plan</button>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container fade-in">
            <Header title="Final Review" />
            <div className="glass" style={{ padding: '2rem 1.5rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ background: 'rgba(56, 189, 248, 0.1)', display: 'inline-flex', padding: '15px', borderRadius: '50%', marginBottom: '1rem' }}>
                        <span style={{ fontSize: '2rem' }}>📋</span>
                    </div>
                    <h2 className="title" style={{ fontSize: '1.5rem' }}>Investment Summary</h2>
                </div>

                <div className="form-grid" style={{ gap: '15px' }}>
                    <div className="nav-card glass" style={{ padding: '15px', marginBottom: 0, border: 'none', background: 'rgba(255,255,255,0.02)' }}>
                        <div style={{ fontSize: '0.75rem', opacity: 0.5, textTransform: 'uppercase', marginBottom: '4px' }}>Selected Strategy</div>
                        <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>{plan.label}</div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div className="nav-card glass" style={{ padding: '15px', marginBottom: 0, border: 'none', background: 'rgba(255,255,255,0.02)' }}>
                            <div style={{ fontSize: '0.75rem', opacity: 0.5, textTransform: 'uppercase', marginBottom: '4px' }}>Principal</div>
                            <div style={{ fontWeight: '700', fontSize: '1.1rem', color: 'var(--accent-primary)' }}>₹{investment.baseAmount}</div>
                        </div>
                        <div className="nav-card glass" style={{ padding: '15px', marginBottom: 0, border: 'none', background: 'rgba(255,255,255,0.02)' }}>
                            <div style={{ fontSize: '0.75rem', opacity: 0.5, textTransform: 'uppercase', marginBottom: '4px' }}>Projected</div>
                            <div style={{ fontWeight: '700', fontSize: '1.1rem', color: 'var(--success)' }}>₹{investment.expectedReturn}</div>
                        </div>
                    </div>

                    <div className="nav-card glass" style={{ padding: '15px', marginBottom: 0, border: 'none', background: 'rgba(255,255,255,0.02)' }}>
                        <div style={{ fontSize: '0.75rem', opacity: 0.5, textTransform: 'uppercase', marginBottom: '4px' }}>Lock-in Period</div>
                        <div style={{ fontWeight: '700' }}>{plan.days} Operational Days</div>
                    </div>
                </div>

                <button className="primary-btn" onClick={handleConfirm} style={{ marginTop: '2rem' }}>
                    Confirm & Pay Securely
                </button>

                <p style={{ textAlign: 'center', fontSize: '0.7rem', opacity: 0.4, marginTop: '1.5rem' }}>
                    By clicking confirm, you agree to the community profit-sharing agreement.
                </p>
            </div>
        </div>
    );
};

export default Summary;
