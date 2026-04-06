import React from 'react';

const Topbar = ({ title, subtitle, rightContent }) => {
  return (
    <div className="topbar" style={{ flexShrink: 0 }}>
      <div>
        <div className="tb-title">{title}</div>
        <div className="tb-sub">{subtitle}</div>
      </div>
      <div className="tb-right">
        {rightContent}
      </div>
    </div>
  );
};

export default Topbar;
