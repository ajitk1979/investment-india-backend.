import React from 'react';
import { useNavigate } from 'react-router-dom';

const Header = ({ title, showBack = true }) => {
    const navigate = useNavigate();

    return (
        <div className="glass fade-in" style={{
            display: 'flex',
            alignItems: 'center',
            padding: '1rem 1.5rem',
            marginBottom: '1.5rem',
            borderRadius: '20px',
            width: '100%'
        }}>
            {showBack && (
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: 'white',
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '15px'
                    }}
                >
                    <span style={{ transform: 'translateX(-1px)', fontSize: '1.2rem' }}>‹</span>
                </button>
            )}
            <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-primary)' }}>
                {title}
            </h2>
        </div>
    );
};

export default Header;
