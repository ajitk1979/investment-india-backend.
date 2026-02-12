import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config';
import { useAuth } from '../context/AuthContext';
import Header from './Header';
import { supabase } from '../supabaseClient';

const PaymentUI = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { investment } = location.state || {};

    const [loading, setLoading] = useState(false);
    const [receipt, setReceipt] = useState(null);
    const [utr, setUtr] = useState('');
    const [adminSettings, setAdminSettings] = useState({ upiId: 'loading...', qrCode: '' });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/api/admin/settings`);
                setAdminSettings(res.data);
            } catch (err) {
                console.error('Failed to load payment info', err);
            }
        };

        fetchSettings();

        // Real-time listener for admin settings
        const channel = supabase
            .channel('admin_settings_changes')
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'admin_settings'
            }, (payload) => {
                console.log('Admin settings updated:', payload);
                setAdminSettings({
                    upiId: payload.new.upi_id,
                    qrCode: payload.new.qr_code
                });
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const handleVerifyPayment = async () => {
        if (!receipt || !utr) {
            alert('Please enter UTR and upload a screenshot');
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('userId', user.mobile);
        formData.append('paymentMethod', 'UPI');
        formData.append('utrNumber', utr);
        formData.append('receipt', receipt);

        try {
            await axios.post(`${API_BASE_URL}/api/investment/payment`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert('Payment submitted for verification!');
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            alert('Failed to submit receipt');
        } finally {
            setLoading(false);
        }
    };

    if (!investment) return <div className="page-container fade-in"><div className="glass">Invalid Session</div></div>;

    return (
        <div className="page-container fade-in">
            <Header title="Secure Transfer" />
            <div className="glass" style={{ padding: '2rem 1.5rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                        Scan the official QR below to transfer <br />
                        <strong style={{ color: 'var(--text-primary)', fontSize: '1.2rem' }}>₹{investment.baseAmount}</strong>
                    </p>

                    <div style={{
                        background: 'white',
                        padding: '16px',
                        display: 'inline-block',
                        borderRadius: '24px',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                        marginBottom: '1.5rem'
                    }}>
                        {adminSettings.qrCode ? (
                            <img
                                src={adminSettings.qrCode}
                                alt="Payment QR"
                                style={{ width: '180px', height: '180px', display: 'block', borderRadius: '12px' }}
                            />
                        ) : (
                            <div style={{ width: '180px', height: '180px', border: '1px dashed #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontSize: '0.8rem' }}>
                                Generating QR...
                            </div>
                        )}
                    </div>

                    <div className="nav-card glass" style={{ padding: '12px', display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: 0 }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: '800' }}>ID: {adminSettings.upiId}</span>
                        <span style={{ fontSize: '0.7rem', opacity: 0.5, textTransform: 'uppercase' }}>Copy</span>
                    </div>
                </div>

                <div className="form-grid" style={{ gap: '20px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Transaction Reference (UTR)</label>
                        <input
                            type="text"
                            placeholder="12-digit reference number"
                            value={utr}
                            onChange={(e) => setUtr(e.target.value)}
                            style={{ textAlign: 'center', fontWeight: '700', letterSpacing: '0.1em' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Upload Screenshot</label>
                        <div style={{ position: 'relative', overflow: 'hidden' }}>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setReceipt(e.target.files[0])}
                                style={{
                                    opacity: 0,
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    cursor: 'pointer'
                                }}
                            />
                            <div className="secondary-btn" style={{ margin: 0, background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.1)' }}>
                                {receipt ? `📄 ${receipt.name.substring(0, 15)}...` : '📸 Select Receipt Image'}
                            </div>
                        </div>
                    </div>

                    <button
                        className="primary-btn"
                        onClick={handleVerifyPayment}
                        disabled={loading}
                        style={{ marginTop: '1rem' }}
                    >
                        {loading ? 'Processing Receipt...' : 'Verify and Submit'}
                    </button>
                </div>
            </div>

            <p style={{ textAlign: 'center', opacity: 0.4, fontSize: '0.7rem', marginTop: '2rem' }}>
                Verified transactions are usually reflected within 30 minutes.
            </p>
        </div>
    );
};

export default PaymentUI;
