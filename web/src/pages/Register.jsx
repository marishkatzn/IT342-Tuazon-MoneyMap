import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import Layout from '../components/Layout';
import { User, Mail, Lock } from "lucide-react";

const Register = () => {

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        const success = await register(name, email, password);

        if (success) {
            navigate('/login');
        } else {
            alert('Registration failed');
        }
    };

    return (
        <Layout noPadding noFooter>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: '1.2fr auto 1fr',
                    height: 'calc(100vh - 73px)',
                    background: 'transparent',
                    overflow: 'hidden'
                }}
                className="grid-bg"
            >

                {/* LEFT SIDE */}

                <div
                    style={{
                        padding: '1.5rem 7rem',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        position: 'relative'
                    }}
                >

                    <div style={{ maxWidth: '540px' }} className="animate-fade-in">

                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            marginBottom: '1.25rem'
                        }}>
                            <div style={{ width: '32px', height: '1.5px', background: 'var(--primary)' }}></div>

                            <span
                                style={{
                                    fontSize: '0.75rem',
                                    fontWeight: '800',
                                    color: 'var(--primary)',
                                    letterSpacing: '0.2em',
                                    textTransform: 'uppercase'
                                }}
                            >
                                Get Started
                            </span>
                        </div>

                        <h1
                            style={{
                                fontSize: '4.5rem',
                                fontWeight: '900',
                                lineHeight: '1',
                                color: '#ffffff',
                                marginBottom: '1.25rem',
                                letterSpacing: '-0.04em'
                            }}
                        >
                            Build your <br />
                            <span className="text-gradient-emerald">savings</span> <br />
                            habit today.
                        </h1>

                        <p
                            style={{
                                fontSize: '1.125rem',
                                color: 'rgba(255,255,255,0.5)',
                                lineHeight: '1.6',
                                marginBottom: '2.5rem',
                                maxWidth: '430px'
                            }}
                        >
                            MoneyMap helps you set goals, track income, and grow your savings with zero friction.
                            Join us today.
                        </p>

                        {/* MINI SAVINGS CARD */}

                        <div
                            className="glass-panel"
                            style={{
                                padding: '1.25rem 1.5rem',
                                borderRadius: '24px',
                                maxWidth: '300px'
                            }}
                        >

                            <div
                                style={{
                                    fontSize: '0.75rem',
                                    fontWeight: '700',
                                    color: 'rgba(255,255,255,0.4)',
                                    textTransform: 'uppercase',
                                    marginBottom: '0.75rem'
                                }}
                            >
                                Vacation Fund
                            </div>

                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'baseline',
                                    gap: '8px',
                                    marginBottom: '1rem'
                                }}
                            >
                                <span
                                    style={{
                                        fontSize: '1.75rem',
                                        fontWeight: '900',
                                        color: '#ffffff'
                                    }}
                                >
                                    $4,200
                                </span>

                                <span
                                    style={{
                                        fontSize: '1rem',
                                        fontWeight: '700',
                                        color: 'rgba(255,255,255,0.3)'
                                    }}
                                >
                                    / $6,000
                                </span>
                            </div>

                            <div
                                style={{
                                    height: '6px',
                                    background: 'rgba(255,255,255,0.1)',
                                    borderRadius: '10px',
                                    overflow: 'hidden',
                                    marginBottom: '0.75rem'
                                }}
                            >
                                <div
                                    style={{
                                        width: '70%',
                                        height: '100%',
                                        background: 'var(--primary)',
                                        borderRadius: '10px'
                                    }}
                                ></div>
                            </div>

                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    fontSize: '0.75rem',
                                    fontWeight: '600'
                                }}
                            >
                                <span style={{ color: 'rgba(255,255,255,0.4)' }}>
                                    62% saved
                                </span>

                                <span style={{ color: 'rgba(255,255,255,0.3)' }}>
                                    Dec 2025
                                </span>
                            </div>

                        </div>

                    </div>

                </div>

                {/* CENTER DIVIDER */}

                <div className="vertical-divider"></div>

                {/* RIGHT SIDE */}

                <div
                    style={{
                        padding: '1.5rem 7rem',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        position: 'relative'
                    }}
                >

                    {/* POP GLOW */}

                    <div
                        className="glow-float"
                        style={{
                            position: 'absolute',
                            top: '120px',
                            right: '40px',
                            width: '220px',
                            height: '220px',
                            background: 'radial-gradient(circle, rgba(16,185,129,0.25), transparent)',
                            filter: 'blur(60px)',
                            zIndex: 0
                        }}
                    ></div>

                    {/* REGISTER CARD */}

                    <div
                        style={{
                            position: 'relative',
                            maxWidth: '440px',
                            padding: '2.5rem',
                            borderRadius: '24px',
                            background: 'rgba(255,255,255,0.03)',
                            backdropFilter: 'blur(14px)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
                            zIndex: 1
                        }}
                    >

                        <h2
                            style={{
                                fontSize: '2.5rem',
                                fontWeight: '900',
                                color: '#ffffff',
                                marginBottom: '0.25rem',
                                letterSpacing: '-0.02em'
                            }}
                        >
                            Create account
                        </h2>

                        <p
                            style={{
                                marginBottom: '2rem',
                                color: 'rgba(255,255,255,0.4)',
                                fontWeight: '500'
                            }}
                        >
                            Already have an account?{' '}
                            <Link
                                to="/login"
                                style={{
                                    color: 'var(--primary)',
                                    textDecoration: 'none',
                                    fontWeight: '700'
                                }}
                            >
                                Sign in →
                            </Link>
                        </p>

                        <form onSubmit={handleSubmit}>

                            <Input
                                placeholder="Full Name"

                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                icon={<User size={20} />}
                                required
                            />

                            <Input
                                placeholder="Email Address"
                                type="email"

                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                icon={<Mail size={20} />}
                                required
                            />

                            <Input
                                placeholder="Password(min of 8 characters)"
                                type="password"

                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                icon={<Lock size={20} />}
                                required
                            />

                            {/* PASSWORD STRENGTH */}

                            <div
                                style={{
                                    display: 'flex',
                                    gap: '4px',
                                    marginBottom: '1.25rem',
                                    marginTop: '-0.25rem'
                                }}
                            >
                                <div style={{ flex: 1, height: '4px', borderRadius: '10px', background: 'var(--primary)' }}></div>
                                <div style={{ flex: 1, height: '4px', borderRadius: '10px', background: 'var(--primary)' }}></div>
                                <div style={{ flex: 1, height: '4px', borderRadius: '10px', background: 'var(--primary)' }}></div>
                                <div style={{ flex: 1, height: '4px', borderRadius: '10px', background: 'var(--primary)', opacity: 0.3 }}></div>
                                <div style={{ flex: 1, height: '4px', borderRadius: '10px', background: 'rgba(255,255,255,0.1)' }}></div>
                            </div>

                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    marginBottom: '2rem'
                                }}
                            >
                                <input
                                    type="checkbox"
                                    id="terms"
                                    style={{
                                        width: '18px',
                                        height: '18px',
                                        accentColor: 'var(--primary)'
                                    }}
                                    required
                                />

                                <label
                                    htmlFor="terms"
                                    style={{
                                        color: 'rgba(255,255,255,0.5)',
                                        fontSize: '0.875rem'
                                    }}
                                >
                                    I agree to the{' '}
                                    <Link to="#" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>
                                        Terms
                                    </Link>{' '}
                                    and{' '}
                                    <Link to="#" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>
                                        Privacy
                                    </Link>
                                </label>
                            </div>

                            <Button
                                type="submit"
                                size="lg"
                                style={{
                                    width: '100%',
                                    borderRadius: '12px',
                                    padding: '1.125rem'
                                }}
                            >
                                Create My Account
                            </Button>

                        </form>

                    </div>

                </div>

            </div>

        </Layout>
    );
};

export default Register;