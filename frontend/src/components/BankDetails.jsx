import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config';
import { useAuth } from '../context/AuthContext';
import Header from './Header';

const BankDetails = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const mobile = location.state?.mobile || user?.mobile || '';

    const [form, setForm] = useState({
        userId: '',
        accountNumber: '',
        ifsc: '',
        amount: 10000,
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!mobile) {
            setError("User identification missing. Please login again.");
            return;
        }

        const fetchDetails = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`${API_BASE_URL}/api/bank/details/${mobile}`);
                if (res.data) {
                    setForm(prev => ({
                        ...prev,
                        accountNumber: res.data.accountNumber,
                        ifsc: res.data.ifsc,
                        amount: res.data.amount || 10000
                    }));
                }
            } catch (err) {
                if (err.response?.status !== 404) {
                    console.error('Fetch Details Error:', err);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [mobile]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!mobile) {
            setError("User identification missing. Please login again.");
            return;
        }

        try {
            const payload = { ...form, userId: mobile };
            await axios.post(`${API_BASE_URL}/api/bank/details`, payload);
            navigate('/plan', { state: { mobile } });
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || 'Failed to save bank details');
        }
    };

    return (
        <div className="page-container fade-in">
            <Header title="Identity & Settlement" />
            <div className="glass" style={{ padding: '2rem 1.5rem' }}>
                <p style={{ marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    Provide your settlement details to receive returns directly to your bank account.
                </p>

                {error && <div className="error-msg">{error}</div>}

                <form onSubmit={handleSubmit} className="form-grid">
                    <div>
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Account Number</label>
                        <input
                            type="text"
                            name="accountNumber"
                            placeholder="XXXXXXXXXXXXXXXX"
                            value={form.accountNumber}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div>
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>IFSC Code</label>
                        <input
                            type="text"
                            name="ifsc"
                            placeholder="BANK0001234"
                            value={form.ifsc}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div>
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Initial Deposit Amount (₹)</label>
                        <input
                            type="number"
                            name="amount"
                            placeholder="Min. ₹10,000"
                            value={form.amount}
                            onChange={handleChange}
                            min={10000}
                            required
                        />
                    </div>

                    <button type="submit" className="primary-btn" disabled={loading} style={{ marginTop: '1rem' }}>
                        {loading ? 'Processing...' : 'Confirm and Continue'}
                    </button>

                    <p style={{ fontSize: '0.75rem', opacity: 0.5, textAlign: 'center', marginTop: '10px' }}>
                        🔒 All financial data is encrypted and handled securely.
                    </p>
                </form>
            </div>
        </div>
    );
};

export default BankDetails;
