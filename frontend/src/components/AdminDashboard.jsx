import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config';
import { supabase } from '../supabaseClient';

const AdminDashboard = () => {
    const [settings, setSettings] = useState({ upiId: '', qrCode: '' });
    const [qrFile, setQrFile] = useState(null);
    const [investments, setInvestments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();

        // Realtime subscription for investments
        const subscription = supabase
            .channel('admin-investments')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'investments' }, (payload) => {
                console.log('Realtime update received:', payload);
                fetchData();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, []);

    const fetchData = async () => {
        try {
            const [sets, invs] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/admin/settings`),
                axios.get(`${API_BASE_URL}/api/admin/investments`)
            ]);
            setSettings(sets.data);
            setInvestments(invs.data.investments || []);
        } catch (err) {
            console.error('Failed to fetch admin data');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateSettings = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('upiId', settings.upiId);
        if (qrFile) formData.append('qrCode', qrFile);

        try {
            console.log('Updating settings with:', settings.upiId);
            const res = await axios.post(`${API_BASE_URL}/api/admin/settings`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            console.log('Update success:', res.data);
            alert('Settings updated successfully');
            setQrFile(null);
            fetchData();
        } catch (err) {
            console.error('Update failed:', err);
            const msg = err.response?.data?.error || err.message || 'Unknown Error';
            alert(`Failed to update settings: ${msg}`);
        }
    };

    const handleVerify = async (investmentId, status) => {
        if (!window.confirm(`Are you sure you want to ${status} this investment?`)) return;

        try {
            await axios.post(`${API_BASE_URL}/api/admin/verify`, { investmentId, status });
            fetchData();
        } catch (err) {
            alert('Verification failed');
        }
    };

    if (loading) return <div className="page-container fade-in"><div className="glass">Loading Admin...</div></div>;

    return (
        <div className="page-container fade-in" style={{ maxWidth: '900px' }}>
            <div className="glass" style={{ marginBottom: '30px' }}>
                <h2 className="title" style={{ textAlign: 'left', fontSize: '1.5rem' }}>Admin Control Panel</h2>
                <p style={{ marginBottom: '2rem' }}>Configure global settings and verify member transactions.</p>

                <form onSubmit={handleUpdateSettings} className="form-grid">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
                        <div>
                            <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Active UPI ID</label>
                            <input
                                type="text"
                                value={settings.upiId}
                                onChange={(e) => setSettings({ ...settings, upiId: e.target.value })}
                                placeholder="e.g. name@bank"
                                style={{ width: '100%' }}
                            />
                        </div>

                        <div>
                            <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Payment QR Code</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '16px' }}>
                                {settings.qrCode && (
                                    <img src={settings.qrCode} alt="QR" style={{ width: '80px', height: '80px', borderRadius: '12px', objectFit: 'cover' }} />
                                )}
                                <input
                                    type="file"
                                    onChange={(e) => setQrFile(e.target.files[0])}
                                    accept="image/*"
                                    style={{ border: 'none', background: 'transparent', padding: 0, fontSize: '0.8rem' }}
                                />
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="primary-btn" style={{ marginTop: '10px' }}>Save Admin Configuration</button>
                </form>
            </div>

            <div className="glass" style={{ padding: '1.5rem' }}>
                <h3 style={{ textAlign: 'left', marginBottom: '1.5rem', fontSize: '1.25rem' }}>Management & Verification</h3>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                        <thead>
                            <tr style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                <th style={{ padding: '12px', textAlign: 'left' }}>User Details</th>
                                <th style={{ padding: '12px', textAlign: 'left' }}>Investment</th>
                                <th style={{ padding: '12px', textAlign: 'left' }}>Proof / Management</th>
                                <th style={{ padding: '12px', textAlign: 'left' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {investments.map((inv) => (
                                <tr key={inv.id} className="nav-card" style={{ cursor: 'default' }}>
                                    <td style={{ padding: '15px', borderTopLeftRadius: '16px', borderBottomLeftRadius: '16px' }}>
                                        <div style={{ fontWeight: '600' }}>{inv.userName}</div>
                                        <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>{inv.userId}</div>
                                    </td>
                                    <td style={{ padding: '15px' }}>
                                        <div style={{ fontWeight: '700', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            ₹{inv.baseAmount}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', opacity: 0.8 }}>{inv.status}</div>
                                    </td>
                                    <td style={{ padding: '15px' }}>
                                        {inv.utrNumber && <div style={{ fontSize: '0.8rem', marginBottom: '4px' }}>UTR: <span style={{ opacity: 0.7 }}>{inv.utrNumber}</span></div>}
                                        {inv.receiptUrl ? (
                                            <a href={inv.receiptUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-primary)', fontSize: '0.85rem', fontWeight: '600' }}>View Receipt</a>
                                        ) : <span style={{ opacity: 0.4 }}>No Proof</span>}
                                    </td>
                                    <td style={{ padding: '15px', borderTopRightRadius: '16px', borderBottomRightRadius: '16px' }}>
                                        {inv.status === 'verifying' || inv.status === 'pending' ? (
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button onClick={() => handleVerify(inv.id, 'paid')} className="primary-btn" style={{ padding: '8px 12px', fontSize: '0.75rem', background: 'var(--success)' }}>Approve</button>
                                                <button onClick={() => handleVerify(inv.id, 'rejected')} className="secondary-btn" style={{ padding: '8px 12px', fontSize: '0.75rem', color: 'var(--error)', borderColor: 'rgba(239, 68, 68, 0.3)' }}>Reject</button>
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <span style={{ fontSize: '0.8rem', opacity: 0.6, fontWeight: 'bold' }}>VERIFIED</span>
                                                <button onClick={() => handleVerify(inv.id, 'pending')} style={{ background: 'transparent', border: 'none', color: 'var(--accent-primary)', fontSize: '0.65rem', cursor: 'pointer', textDecoration: 'underline' }}>Reset</button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {investments.length === 0 && <p style={{ textAlign: 'center', marginTop: '20px', opacity: 0.5 }}>No pending investments.</p>}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
