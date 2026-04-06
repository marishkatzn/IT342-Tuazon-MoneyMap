import React, { useContext, useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Sidebar = () => {
  const { user } = useContext(AuthContext);
  const [goalCount, setGoalCount] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    const fetchSidebarData = async () => {
      if (!user?.id) {
        setGoalCount(0);
        setUnreadNotifications(0);
        return;
      }

      try {
        const [goalsResponse, notificationsResponse] = await Promise.all([
          fetch(`http://localhost:8081/api/goals/${user.id}`),
          fetch(`http://localhost:8081/api/notifications/${user.id}`)
        ]);

        if (goalsResponse.ok) {
          const goals = await goalsResponse.json();
          setGoalCount(goals.length);
        }

        if (notificationsResponse.ok) {
          const notifications = await notificationsResponse.json();
          setUnreadNotifications(
            notifications.filter((notification) => !notification.read).length
          );
        }
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

  return (
    <aside className="sidebar">
      <div className="sb-logo">
        <div className="sb-logo-icon">MM</div>
        <div>
          <div className="sb-logo-text">MoneyMap</div>
          <div className="sb-logo-sub">savings tracker</div>
        </div>
      </div>

      <div className="sb-user">
        <div className="sb-avatar">{userInitial}</div>
        <div>
          <div className="sb-uname">{userName}</div>
          <div className="sb-urole">Personal</div>
        </div>
      </div>

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

        <div className="sb-sec">Account</div>

        <NavLink to="/notifications" className={({ isActive }) => `ni ${isActive ? 'active' : ''}`}>
          <span className="ni-label">Bell Notifications</span>
          {unreadNotifications > 0 && <span className="ni-badge r">{unreadNotifications}</span>}
        </NavLink>

        <NavLink to="/signout" className={({ isActive }) => `ni ${isActive ? 'active' : ''}`} style={{ color: 'var(--red)' }}>
          <span className="ni-label">Sign out</span>
        </NavLink>
      </div>

      <div className="sb-rate">
        <div className="sb-rate-lbl">Savings Rate · March</div>
        <div className="sb-rate-val">65%</div>
        <div className="sb-rate-bar">
          <div className="sb-rate-fill" style={{ width: '65%' }}></div>
        </div>
        <div className="sb-rate-foot">
          <span>Up 8% MoM</span>
          <span>$2,240 saved</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
