import React, { useContext, useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { apiFetch } from '../lib/api';
import logoImage from '../assets/m-logo.png';

const Sidebar = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [goalCount, setGoalCount] = useState(0);
  const [savingsRate, setSavingsRate] = useState(0);
  const [savedThisMonth, setSavedThisMonth] = useState(0);
  const [momChange, setMomChange] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    const fetchSidebarData = async () => {
      if (!user?.id) {
        setGoalCount(0);
        setSavingsRate(0);
        setSavedThisMonth(0);
        setMomChange(0);
        setUnreadNotifications(0);
        return;
      }

      try {
        const [goalsResponse, incomesResponse, contributionsResponse, notificationsResponse] = await Promise.all([
          apiFetch(`/goals/${user.id}`),
          apiFetch(`/income/${user.id}`),
          apiFetch(`/contributions/${user.id}`),
          apiFetch(`/notifications/${user.id}`)
        ]);

        const goals = goalsResponse.ok ? await goalsResponse.json() : [];
        const incomes = incomesResponse.ok ? await incomesResponse.json() : [];
        const contributions = contributionsResponse.ok ? await contributionsResponse.json() : [];
        const notifications = notificationsResponse.ok ? await notificationsResponse.json() : [];

        setGoalCount(goals.length);
        setUnreadNotifications(notifications.filter((notification) => !notification.read).length);

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
  const compactSavedThisMonth = savedThisMonth.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  return (
    <aside className="sidebar">
      <NavLink to="/dashboard" className="sb-logo" aria-label="Go to dashboard">
        <div className="sb-logo-icon">
          <img src={logoImage} alt="MoneyMap logo" className="sb-logo-img" />
        </div>
        <div>
          <div className="sb-logo-text">MoneyMap</div>
          <div className="sb-logo-sub">savings tracker</div>
        </div>
      </NavLink>

      <div className="sb-nav">
        <button
          type="button"
          className="sb-user"
          onClick={() => navigate('/profile')}
          style={{ cursor: 'pointer', textAlign: 'left', background: 'transparent' }}
        >
          <div className="sb-avatar">{userInitial}</div>
          <div className="sb-user-meta">
            <div className="sb-uname">{userName}</div>
            <div className="sb-urole">Personal workspace</div>
          </div>
          <div className="sb-user-arrow">{'>'}</div>
        </button>

        <div className="sb-sec">Main</div>

        <NavLink to="/dashboard" className={({ isActive }) => `ni ${isActive ? 'active' : ''}`}>
          <span className="ni-ico">D</span>
          <span className="ni-label">Dashboard</span>
        </NavLink>

        <NavLink to="/income" className={({ isActive }) => `ni ${isActive ? 'active' : ''}`}>
          <span className="ni-ico">$</span>
          <span className="ni-label">Income</span>
        </NavLink>

        <NavLink to="/goals" className={({ isActive }) => `ni ${isActive ? 'active' : ''}`}>
          <span className="ni-ico">G</span>
          <span className="ni-label">Goals</span>
          {goalCount > 0 && <span className="ni-badge">{goalCount}</span>}
        </NavLink>

        <div className="sb-sec">Actions</div>

        <NavLink to="/contributions" className={({ isActive }) => `ni ${isActive ? 'active' : ''}`}>
          <span className="ni-ico">+</span>
          <span className="ni-label">Add Contribution</span>
        </NavLink>

        <div className="sb-sec">Account</div>

        <NavLink to="/notifications" className={({ isActive }) => `ni ${isActive ? 'active' : ''}`}>
          <span className="ni-ico">N</span>
          <span className="ni-label">Notifications</span>
          {unreadNotifications > 0 && <span className="ni-badge r">{unreadNotifications}</span>}
        </NavLink>

        <NavLink to="/profile" className={({ isActive }) => `ni ${isActive ? 'active' : ''}`}>
          <span className="ni-ico">P</span>
          <span className="ni-label">Profile</span>
        </NavLink>

        <NavLink to="/signout" className={({ isActive }) => `ni ${isActive ? 'active' : ''}`}>
          <span className="ni-ico">O</span>
          <span className="ni-label">Sign Out</span>
        </NavLink>

        <div className="sb-spacer"></div>

        <div className="sb-insight">
          <div className="sb-insight-head">
            <div>
              <div className="sb-insight-kicker">This Month</div>
              <div className="sb-insight-title">Savings Pulse</div>
            </div>
            <div className="sb-insight-chip">{savingsRate}%</div>
          </div>
          <div className="sb-rate-bar">
            <div className="sb-rate-fill" style={{ width: `${savingsRate}%` }}></div>
          </div>
          <div className="sb-insight-grid">
            <div className="sb-mini">
              <div className="sb-mini-label">Saved</div>
              <div className="sb-mini-value">${compactSavedThisMonth}</div>
            </div>
            <div className="sb-mini">
              <div className="sb-mini-label">Goals</div>
              <div className="sb-mini-value">{goalCount}</div>
            </div>
          </div>
          <div className="sb-rate-foot">
            <span>{currentMonthLabel}</span>
            <span>{trendLabel}</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
