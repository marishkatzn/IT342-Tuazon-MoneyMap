import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { apiFetch } from '../../lib/api';

const AUTH_STORAGE_KEY = 'moneymap_auth';

const SignOut = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [activeGoals, setActiveGoals] = useState(0);
  const [savedThisMonth, setSavedThisMonth] = useState(0);

  useEffect(() => {
    const fetchSessionSummary = async () => {
      if (!user?.id) {
        setActiveGoals(0);
        setSavedThisMonth(0);
        return;
      }

      try {
        const [goalsResponse, contributionsResponse] = await Promise.all([
          apiFetch(`/goals/${user.id}`),
          apiFetch(`/contributions/${user.id}`)
        ]);

        const goals = goalsResponse.ok ? await goalsResponse.json() : [];
        const contributions = contributionsResponse.ok ? await contributionsResponse.json() : [];

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const monthlySaved = contributions
          .filter((contribution) => {
            const contributionDate = new Date(contribution.date);
            return !Number.isNaN(contributionDate.getTime())
              && contributionDate.getMonth() === currentMonth
              && contributionDate.getFullYear() === currentYear;
          })
          .reduce((sum, contribution) => sum + Number(contribution.amount || 0), 0);

        setActiveGoals(goals.length);
        setSavedThisMonth(monthlySaved);
      } catch (error) {
        console.error('Failed to load sign-out summary:', error);
      }
    };

    fetchSessionSummary();
  }, [user]);

  const handleSignOut = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const sessionStartedLabel = useMemo(() => {
    try {
      const storedSession = sessionStorage.getItem(AUTH_STORAGE_KEY);
      if (!storedSession) {
        return 'Current session';
      }

      const parsedSession = JSON.parse(storedSession);
      const loginAt = parsedSession?.loginAt;
      if (!loginAt) {
        return 'Current session';
      }

      const loginDate = new Date(loginAt);
      if (Number.isNaN(loginDate.getTime())) {
        return 'Current session';
      }

      return loginDate.toLocaleString();
    } catch (error) {
      return 'Current session';
    }
  }, []);

  return (
    <div className="logout-wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%', position: 'relative' }}>
      <div className="logout-card">
        <div className="lout-ico">Bye</div>
        <div className="lout-title">Sign out?</div>
        <div className="lout-sub">
          Your MoneyMap account data stays safely saved, and your progress will be here when you sign back in.
        </div>

        <div className="sess-info">
          <div className="sess-row">
            <div className="sess-k">Signed in as</div>
            <div className="sess-v">{user?.email || 'Current user'}</div>
          </div>
          <div className="sess-row">
            <div className="sess-k">Display name</div>
            <div className="sess-v">{user?.name || 'MoneyMap User'}</div>
          </div>
          <div className="sess-row">
            <div className="sess-k">Session started</div>
            <div className="sess-v">{sessionStartedLabel}</div>
          </div>
          <div className="sess-row">
            <div className="sess-k">Active goals</div>
            <div className="sess-v" style={{ color: 'var(--g)' }}>
              {activeGoals} {activeGoals === 1 ? 'goal' : 'goals'}
            </div>
          </div>
          <div className="sess-row">
            <div className="sess-k">Saved this month</div>
            <div className="sess-v" style={{ color: 'var(--g)' }}>
              ${savedThisMonth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        <button className="btn-danger" onClick={handleSignOut}>Yes, sign me out</button>
        <button className="btn-cancel" onClick={() => navigate('/dashboard')}>Back to dashboard</button>
      </div>
    </div>
  );
};

export default SignOut;
