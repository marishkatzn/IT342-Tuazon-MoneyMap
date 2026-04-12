import React, { useContext, useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Sidebar = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [goalCount, setGoalCount] = useState(0);
  const [savingsRate, setSavingsRate] = useState(0);
  const [savedThisMonth, setSavedThisMonth] = useState(0);
  const [momChange, setMomChange] = useState(0);

  useEffect(() => {
    const fetchSidebarData = async () => {
      if (!user?.id) {
        setGoalCount(0);
        setSavingsRate(0);
        setSavedThisMonth(0);
        setMomChange(0);
        return;
      }

      try {
        const [goalsResponse, incomesResponse, contributionsResponse] = await Promise.all([
          fetch(`http://localhost:8081/api/goals/${user.id}`),
          fetch(`http://localhost:8081/api/income/${user.id}`),
          fetch(`http://localhost:8081/api/contributions/${user.id}`)
        ]);

        if (goalsResponse.ok) {
          const goals = await goalsResponse.json();
          setGoalCount(goals.length);
        }

        const incomes = incomesResponse.ok ? await incomesResponse.json() : [];
        const contributions = contributionsResponse.ok ? await contributionsResponse.json() : [];

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const previousMonthDate = new Date(currentYear, currentMonth - 1, 1);
        const previousMonth = previousMonthDate.getMonth();
        const previousYear = previousMonthDate.getFullYear();

        const isSameMonth = (value, month, year) => {
          const date = new Date(value);
          return !Number.isNaN(date.getTime()) && date.getMonth() === month && date.getFullYear() === year;
        };

        const monthlyIncome = incomes
          .filter((income) => income.status === 'Received' && isSameMonth(income.date, currentMonth, currentYear))
          .reduce((sum, income) => sum + income.amount, 0);

        const currentMonthSaved = contributions
          .filter((contribution) => isSameMonth(contribution.date, currentMonth, currentYear))
          .reduce((sum, contribution) => sum + contribution.amount, 0);

        const previousMonthSaved = contributions
          .filter((contribution) => isSameMonth(contribution.date, previousMonth, previousYear))
          .reduce((sum, contribution) => sum + contribution.amount, 0);

        const currentRate = monthlyIncome > 0
          ? Math.min(Math.round((currentMonthSaved / monthlyIncome) * 100), 100)
          : 0;

        const change = previousMonthSaved > 0
          ? Math.round(((currentMonthSaved - previousMonthSaved) / previousMonthSaved) * 100)
          : (currentMonthSaved > 0 ? 100 : 0);

        setSavingsRate(currentRate);
        setSavedThisMonth(currentMonthSaved);
        setMomChange(change);
      } catch (error) {
        console.error('Failed to load sidebar data:', error);
      }
    };

    fetchSidebarData();

    const handleSidebarRefresh = () => {
      fetchSidebarData();
    };

    window.addEventListener('sidebar-refresh', handleSidebarRefresh);

    return () => {
      window.removeEventListener('sidebar-refresh', handleSidebarRefresh);
    };
  }, [user]);

  const userName = user?.name || 'User';
  const userInitial = userName.charAt(0).toUpperCase();
  const currentMonthLabel = new Date().toLocaleString('en-US', { month: 'long' });
  const trendLabel = momChange >= 0 ? `Up ${momChange}% MoM` : `Down ${Math.abs(momChange)}% MoM`;

  return (
    <aside className="sidebar">
      <div className="sb-logo">
        <div className="sb-logo-icon">MM</div>
        <div>
          <div className="sb-logo-text">MoneyMap</div>
          <div className="sb-logo-sub">savings tracker</div>
        </div>
      </div>

      <button
        type="button"
        className="sb-user"
        onClick={() => navigate('/profile')}
        style={{ cursor: 'pointer', textAlign: 'left', background: 'transparent', border: '1px solid var(--border)' }}
      >
        {user?.pictureUrl ? (
          <img
            src={user.pictureUrl}
            alt={`${userName} avatar`}
            className="sb-avatar"
            style={{ objectFit: 'cover', padding: 0, overflow: 'hidden' }}
          />
        ) : (
          <div className="sb-avatar">{userInitial}</div>
        )}
        <div>
          <div className="sb-uname">{userName}</div>
          <div className="sb-urole">Personal</div>
        </div>
      </button>

      <div className="sb-nav">
        <div className="sb-sec">Main</div>

        <NavLink to="/dashboard" className={({ isActive }) => `ni ${isActive ? 'active' : ''}`}>
          <span className="ni-label">Dashboard</span>
        </NavLink>

        <NavLink to="/income" className={({ isActive }) => `ni ${isActive ? 'active' : ''}`}>
          <span className="ni-label">Income</span>
        </NavLink>

        <NavLink to="/goals" className={({ isActive }) => `ni ${isActive ? 'active' : ''}`}>
          <span className="ni-label">Goals</span>
          {goalCount > 0 && <span className="ni-badge">{goalCount}</span>}
        </NavLink>

        <div className="sb-sec">Savings</div>

        <NavLink to="/allocation" className={({ isActive }) => `ni ${isActive ? 'active' : ''}`}>
          <span className="ni-label">Allocate Funds</span>
        </NavLink>

        <NavLink to="/contributions" className={({ isActive }) => `ni ${isActive ? 'active' : ''}`}>
          <span className="ni-label">Add Contribution</span>
        </NavLink>

      </div>

      <div className="sb-rate">
        <div className="sb-rate-lbl">Savings Rate · {currentMonthLabel}</div>
        <div className="sb-rate-val">{savingsRate}%</div>
        <div className="sb-rate-bar">
          <div className="sb-rate-fill" style={{ width: `${savingsRate}%` }}></div>
        </div>
        <div className="sb-rate-foot">
          <span>{trendLabel}</span>
          <span>${savedThisMonth.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} saved</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
