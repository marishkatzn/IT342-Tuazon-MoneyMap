import React, { useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Layout from '../components/Layout';
import { LogOut, ArrowLeft } from 'lucide-react';

const SignOut = () => {
    const { logout, user } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleConfirmSignOut = () => {
        logout();
        navigate('/login');
    };

    return (
        <Layout noPadding noFooter>
            <div style={{
                height: 'calc(100vh - 73px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--bg-dark)',
                overflow: 'hidden'
            }} className="grid-bg">

                <div style={{
                    width: '100%',
                    maxWidth: '480px',
                    padding: '2.5rem',
                    borderRadius: '32px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    textAlign: 'center',
                    boxShadow: '0 40px 100px rgba(0,0,0,0.5)'
                }} className="animate-fade-in">

                    {/* Emoji Icon */}
                    <div style={{
                        width: '64px',
                        height: '64px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '32px',
                        margin: '0 auto 1.5rem',
                        border: '1px solid rgba(255, 255, 255, 0.08)'
                    }}>
                        👋
                    </div>

                    <h1 style={{
                        fontSize: '2.5rem',
                        fontWeight: '900',
                        color: '#ffffff',
                        marginBottom: '1rem',
                        letterSpacing: '-0.02em'
                    }}>
                        Sign out?
                    </h1>

                    <p style={{
                        color: 'rgba(255, 255, 255, 0.4)',
                        fontSize: '1rem',
                        lineHeight: '1.6',
                        marginBottom: '2rem',
                        maxWidth: '340px',
                        margin: '0 auto 2.5rem'
                    }}>
                        You're about to sign out of your MoneyMap account. Your data is saved and will be ready when you return.
                    </p>

                    {/* Info Card */}
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.02)',
                        borderRadius: '20px',
                        padding: '1.25rem',
                        marginBottom: '2.5rem',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        textAlign: 'left'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.875rem', fontWeight: '500' }}>Signed in as</span>
                            <span style={{ color: '#ffffff', fontSize: '0.875rem', fontWeight: '600' }}>{user?.email || 'alex@email.com'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.875rem', fontWeight: '500' }}>Session started</span>
                            <span style={{ color: '#ffffff', fontSize: '0.875rem', fontWeight: '600' }}>Today, 8:02 AM</span>
                        </div>

                    </div>

                    <button
                        onClick={handleConfirmSignOut}
                        style={{
                            width: '100%',
                            padding: '1.125rem',
                            borderRadius: '16px',
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            color: '#ef4444',
                            fontSize: '1rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            marginBottom: '1.25rem'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                    >
                        Yes, sign me out
                    </button>

                    <Link
                        to="/dashboard"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            color: 'rgba(255, 255, 255, 0.3)',
                            textDecoration: 'none',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.color = '#ffffff'}
                        onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.3)'}
                    >
                        <ArrowLeft size={14} />
                        Back to dashboard
                    </Link>

                </div>

            </div>
        </Layout>
    );
};

export default SignOut;
