import React, { useContext, useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { User as UserIcon, LogOut, ChevronDown, LayoutDashboard, Settings } from 'lucide-react';

const Navbar = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const popupRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (popupRef.current && !popupRef.current.contains(event.target)) {
                setIsPopupOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSignOutClick = () => {
        setIsPopupOpen(false);
        navigate('/signout');
    };

    return (
        <nav style={{
            position: 'sticky',
            top: 0,
            zIndex: 50,
            background: 'rgba(5, 10, 10, 0.8)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid var(--glass-border)',
            padding: '1rem 0'
        }}>
            <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Link to={user ? "/dashboard" : "/register"} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                        width: '32px',
                        height: '32px',
                        background: 'var(--primary)',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px',
                        fontWeight: 'bold',
                        color: 'white',
                        boxShadow: '0 4px 10px rgba(34, 197, 94, 0.3)'
                    }}>
                        M
                    </div>
                    <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
                        MoneyMap
                    </span>
                </Link>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    {!user ? (
                        <div className="pill-nav-container">
                            <Link
                                to="/register"
                                className={`pill-nav-item ${location.pathname === '/register' ? 'active' : 'inactive'}`}
                            >
                                Register
                            </Link>
                            <Link
                                to="/login"
                                className={`pill-nav-item ${location.pathname === '/login' ? 'active' : 'inactive'}`}
                            >
                                Login
                            </Link>
                        </div>
                    ) : (
                        <div style={{ position: 'relative' }} ref={popupRef}>
                            <button 
                                onClick={() => setIsPopupOpen(!isPopupOpen)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid var(--glass-border)',
                                    padding: '6px 12px 6px 6px',
                                    borderRadius: '50px',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'}
                                onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                            >
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    background: 'var(--primary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#050a0a'
                                }}>
                                    <UserIcon size={18} strokeWidth={2.5} />
                                </div>
                                <span style={{ color: '#ffffff', fontWeight: '600', fontSize: '0.875rem' }}>{user?.name || 'Account'}</span>
                                <ChevronDown size={16} color="rgba(255,255,255,0.4)" style={{ transform: isPopupOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} />
                            </button>

                            {isPopupOpen && (
                                <div className="glass-panel animate-fade-in" style={{
                                    position: 'absolute',
                                    top: 'calc(100% + 12px)',
                                    right: 0,
                                    width: '200px',
                                    padding: '8px',
                                    borderRadius: '16px',
                                    zIndex: 100,
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
                                }}>
                                    <Link to="/dashboard" onClick={() => setIsPopupOpen(false)} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '10px 12px',
                                        borderRadius: '10px',
                                        color: 'rgba(255,255,255,0.7)',
                                        textDecoration: 'none',
                                        fontSize: '0.875rem',
                                        fontWeight: '600',
                                        transition: 'all 0.2s'
                                    }} onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#ffffff'; }} onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}>
                                        <LayoutDashboard size={16} />
                                        Dashboard
                                    </Link>
                                    <Link to="/settings" onClick={() => setIsPopupOpen(false)} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '10px 12px',
                                        borderRadius: '10px',
                                        color: 'rgba(255,255,255,0.7)',
                                        textDecoration: 'none',
                                        fontSize: '0.875rem',
                                        fontWeight: '600',
                                        transition: 'all 0.2s'
                                    }} onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#ffffff'; }} onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}>
                                        <Settings size={16} />
                                        Settings
                                    </Link>
                                    <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '4px 8px' }}></div>
                                    <button onClick={handleSignOutClick} style={{
                                        width: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '10px 12px',
                                        borderRadius: '10px',
                                        color: '#ef4444',
                                        background: 'transparent',
                                        border: 'none',
                                        fontSize: '0.875rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                                        <LogOut size={16} />
                                        Sign Out
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

            </div>
        </nav>
    );
};

export default Navbar;

