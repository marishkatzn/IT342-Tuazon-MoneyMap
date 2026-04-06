import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import '../dashboard.css';

const DashboardLayout = () => {
  return (
    <div className="dashboard-theme">
      <div className="shell">
        <Sidebar />
        <div className="main-area">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
