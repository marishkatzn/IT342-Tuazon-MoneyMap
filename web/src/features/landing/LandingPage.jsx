import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import Button from '../../components/Button';
import logoImage from '../../assets/m-logo.png';

const LandingPage = () => {
    return (
        <Layout>
            <div className="container" style={{ padding: '4rem 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4rem' }}>
                    {/* Left Content */}
                    <div style={{ flex: '1 1 500px', maxWidth: '600px' }}>
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '12px',
                            marginBottom: '1.25rem',
                            padding: '10px 14px',
                            borderRadius: '18px',
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.08)'
                        }}>
                            <img src={logoImage} alt="MoneyMap logo" style={{ width: '44px', height: '44px', objectFit: 'contain', display: 'block' }} />
                            <div>
                                <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.03em' }}>MoneyMap</div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>Savings Tracker</div>
                            </div>
                        </div>

                        <div style={{
                            display: 'inline-block',
                            padding: '8px 20px',
                            background: 'rgba(34, 197, 94, 0.1)',
                            color: 'var(--primary)',
                            borderRadius: '50px',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            marginBottom: '1.5rem',
                            border: '1px solid rgba(34, 197, 94, 0.2)'
                        }}>
                            New: Budget Planning 🚀
                        </div>
                        <h1 style={{
                            fontSize: '4.5rem',
                            fontWeight: '800',
                            lineHeight: '1.1',
                            marginBottom: '1.5rem',
                            color: 'var(--text-main)',
                            letterSpacing: '-2px'
                        }}>
                            Reach your financial targets
                        </h1>
                        <p style={{
                            fontSize: '1.25rem',
                            color: 'var(--text-muted)',
                            marginBottom: '2.5rem',
                            lineHeight: '1.7',
                            maxWidth: '90%'
                        }}>
                            A savings goal tracking system that helps users set financial targets and monitor contributions toward achieving them.
                        </p>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <Link to="/register">
                                <Button variant="primary" size="lg">
                                    Get started
                                </Button>
                            </Link>
                        </div>

                        <div style={{ marginTop: '3rem', display: 'flex', gap: '2rem' }}>
                            <div>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-main)' }}>75K+</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Active Users</p>
                            </div>
                            <div style={{ width: '1px', background: 'rgba(0,0,0,0.1)' }}></div>
                            <div>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-main)' }}>98%</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Satisfaction</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Visual - 3D Finance Capsule Representation */}
                    <div style={{ flex: '1 1 400px', position: 'relative', height: '500px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>

                        {/* 1. Main Background Glow */}
                        <div style={{
                            position: 'absolute',
                            width: '120%',
                            height: '120%',
                            top: '-10%',
                            left: '-10%',
                            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.3) 0%, rgba(5, 150, 105, 0.1) 50%, transparent 80%)',
                            filter: 'blur(60px)',
                            zIndex: 0
                        }}></div>

                        {/* 2. The "Capsule" (Card) */}
                        <div style={{
                            position: 'relative',
                            width: '320px',
                            height: '420px',
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                            backdropFilter: 'blur(20px)',
                            borderRadius: '40px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            boxShadow: '0 25px 50px -12px rgba(34, 197, 94, 0.2), inset 0 0 0 1px rgba(255,255,255,0.05)',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            padding: '2rem',
                            transform: 'rotate(-5deg)',
                            zIndex: 1
                        }}>
                            {/* Inner Content of Capsule */}
                            <div>
                                <div style={{
                                    width: '60px',
                                    height: '60px',
                                    background: 'var(--primary)',
                                    borderRadius: '50%',
                                    marginBottom: '1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 10px 20px rgba(34, 197, 94, 0.4)'
                                }}>
                                    <span style={{ fontSize: '1.5rem', color: 'white' }}>💰</span>
                                </div>
                                <h3 style={{ fontSize: '2rem', fontWeight: '800', fontFamily: 'Outfit', color: '#ffffff', lineHeight: '1.1' }}>
                                    Smart<br />Savings
                                </h3>
                            </div>

                            {/* Chart Illustration */}
                            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '100px' }}>
                                <div style={{ flex: 1, background: '#dcfce7', borderRadius: '4px', height: '40%' }}></div>
                                <div style={{ flex: 1, background: '#86efac', borderRadius: '4px', height: '60%' }}></div>
                                <div style={{ flex: 1, background: '#4ade80', borderRadius: '4px', height: '30%' }}></div>
                                <div style={{ flex: 1, background: '#22c55e', borderRadius: '4px', height: '80%' }}></div>
                                <div style={{ flex: 1, background: '#16a34a', borderRadius: '4px', height: '100%' }}></div>
                            </div>

                            {/* Floating Badge */}
                            <div style={{
                                position: 'absolute',
                                top: '20px',
                                right: '-30px',
                                background: 'white',
                                padding: '10px 20px',
                                borderRadius: '20px',
                                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                                fontWeight: '700',
                                color: '#10b981',
                                transform: 'rotate(5deg)'
                            }}>
                                +24% YoY
                            </div>
                        </div>

                        {/* 3. Decorative Elements */}
                        <div style={{
                            position: 'absolute',
                            bottom: '50px',
                            left: '-40px',
                            width: '100px',
                            height: '100px',
                            background: 'linear-gradient(135deg, #10b981 0%, #22c55e 100%)',
                            borderRadius: '30px',
                            zIndex: 2,
                            boxShadow: '0 20px 30px rgba(34, 197, 94, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transform: 'rotate(10deg)'
                        }}>
                            <span style={{ fontSize: '3rem', color: 'white' }}>🚀</span>
                        </div>

                    </div>
                </div>

                {/* Features Section */}
                <div style={{ marginTop: '8rem', textAlign: 'center' }}>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '1rem' }}>Our awesome features</h2>
                    <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto 4rem', lineHeight: '1.6' }}>
                        Connect your accounts and let us handle the heavy lifting. We categorize your spending so you always know where your money goes.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                        <FeatureCard
                            title="Automated Tracking"
                            description="Transactions are automatically categorized so you can see your spending habits at a glance."
                            icon="📊"
                        />
                        <FeatureCard
                            title="Smart Budgets"
                            description="Set budgets for specific categories and get notified when you're close to your limits."
                            icon="🎯"
                        />
                        <FeatureCard
                            title="Savings Goals"
                            description="Create savings goals for vacations, new gadgets, or emergency funds and track progress."
                            icon="💰"
                        />
                    </div>
                </div>
            </div>
        </Layout>
    );
};

const FeatureCard = ({ title, description, icon }) => (
    <div className="glass-panel" style={{
        padding: '2.5rem',
        borderRadius: '32px',
        textAlign: 'left',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        cursor: 'default',
        // background: 'var(--bg-card)', // Handled by glass-panel
        border: '1px solid var(--glass-border)'
    }}
        onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 20px 40px rgba(34, 197, 94, 0.1)';
            e.currentTarget.style.borderColor = 'var(--primary)';
        }}
        onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.05)';
            e.currentTarget.style.borderColor = 'var(--glass-border)';
        }}
    >
        <div style={{
            width: '60px',
            height: '60px',
            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.75rem',
            marginBottom: '1.5rem',
            color: 'var(--primary)',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)'
        }}>{icon}</div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '1rem' }}>{title}</h3>
        <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>{description}</p>
    </div>
);

export default LandingPage;
