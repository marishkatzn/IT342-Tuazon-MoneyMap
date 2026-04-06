import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const SignOut = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const handleSignOut = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="logout-wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%', position: 'relative' }}>
      <div className="logout-card">
        <div className="lout-ico">👋</div>
        <div className="lout-title">Sign out?</div>
        <div className="lout-sub">
          Your data is safely stored in Supabase and will be ready when you return. Your goals and progress are never lost.
        </div>
        
        <div className="sess-info">
          <div className="sess-row">
            <div className="sess-k">Signed in as</div>
            <div className="sess-v">{user?.email || 'Current user'}</div>
          </div>
          <div className="sess-row">
            <div className="sess-k">Session started</div>
            <div className="sess-v">Today, 8:02 AM</div>
          </div>
          <div className="sess-row">
            <div className="sess-k">Active goals</div>
            <div className="sess-v" style={{ color: 'var(--g)' }}>3 goals</div>
          </div>
          <div className="sess-row">
            <div className="sess-k">Saved this month</div>
            <div className="sess-v" style={{ color: 'var(--g)' }}>$2,240</div>
          </div>
        </div>
        
        <button className="btn-danger" onClick={handleSignOut}>Yes, sign me out</button>
        <button className="btn-cancel" onClick={() => navigate('/dashboard')}>← Back to dashboard</button>
      </div>
    </div>
  );
};

export default SignOut;
