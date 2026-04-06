import React, { useState, useEffect, useContext } from 'react';
import Topbar from '../components/Topbar';
import { AuthContext } from '../context/AuthContext';

const Notifications = () => {
  const { user } = useContext(AuthContext);

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) {
        return;
      }

      try {
        const res = await fetch(`http://localhost:8081/api/notifications/${user.id}`);
        if (res.ok) {
          setNotifications(await res.json());
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      <Topbar
        title="Notifications"
        subtitle="Milestones, alerts and savings updates"
        rightContent={<div className="tb-btn">Mark all read</div>}
      />
      <div className="scroll">
        <div className="grid" style={{ gridTemplateColumns: '1fr 300px', gap: '12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Unread */}
            <div>
              <div className="sec-lbl" style={{color: unreadCount > 0 ? "var(--red)" : "var(--muted)"}}>🔴 Unread · {unreadCount}</div>
              {loading && <div style={{padding:"20px"}}>Loading...</div>}
              {notifications.filter(n => !n.read).map(n => (
                 <div key={n.id} className="card" style={{ borderColor: 'rgba(74,222,128,.2)' }}>
                   <div className="notif">
                     <div className={`norb ${n.type === 'Milestone' ? 'g' : 'a'}`}>{n.icon || '🔔'}</div>
                     <div style={{ flex: 1 }}>
                       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                         <div className="ntitle">{n.title}</div>
                         <span className="sbadge g" style={{ marginLeft: '8px', flexShrink: 0 }}>New</span>
                       </div>
                       <div className="nbody">{n.body}</div>
                       <div className="ntime">{new Date(n.createdAt).toLocaleString()}</div>
                     </div>
                   </div>
                 </div>
              ))}
              {notifications.filter(n => !n.read).length === 0 && !loading && (
                <div style={{color:"var(--muted)", fontSize:"12px"}}>No unread notifications.</div>
              )}
            </div>

            {/* Read */}
            <div>
              <div className="sec-lbl">Earlier</div>
              <div className="card">
                {notifications.filter(n => n.read).map(n => (
                   <div key={n.id} className="notif">
                     <div className={`norb ${n.type === 'Info' ? 'b' : (n.type === 'Milestone' ? 'g' : 'a')}`}>{n.icon || '💸'}</div>
                     <div>
                       <div className="ntitle">{n.title}</div>
                       <div className="nbody">{n.body}</div>
                       <div className="ntime">{new Date(n.createdAt).toLocaleDateString()}</div>
                     </div>
                   </div>
                ))}
                {notifications.filter(n => n.read).length === 0 && !loading && (
                  <div style={{color:"var(--muted)", fontSize:"12px"}}>No older notifications.</div>
                )}
              </div>
            </div>
          </div>

          {/* Milestones sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="card">
              <div className="ctitle" style={{ fontSize: '13px', marginBottom: '10px' }}>🏆 Milestones</div>
              <div className="milestone">
                <div className="ms-ico">🥇</div>
                <div>
                  <div className="ms-name">First Goal Created</div>
                  <div className="ms-sub">Started your journey</div>
                </div>
                <span className="sbadge g ms-chip">Earned</span>
              </div>
              <div className="milestone" style={{ opacity: '.4' }}>
                <div className="ms-ico">💯</div>
                <div>
                  <div className="ms-name">$10,000 Saved</div>
                  <div className="ms-sub">Total savings milestone</div>
                </div>
                <span className="sbadge a ms-chip">Locked</span>
              </div>
              <div className="milestone" style={{ opacity: '.4' }}>
                <div className="ms-ico">🔥</div>
                <div>
                  <div className="ms-name">4-Week Streak</div>
                  <div className="ms-sub">Consistent contributions</div>
                </div>
                <span className="sbadge a ms-chip">Locked</span>
              </div>
              <div className="milestone" style={{ opacity: '.4' }}>
                <div className="ms-ico">🚀</div>
                <div>
                  <div className="ms-name">Goal Completed</div>
                  <div className="ms-sub">Finish any savings goal</div>
                </div>
                <span className="sbadge a ms-chip">Locked</span>
              </div>
            </div>

            <div className="card">
              <div className="ctitle" style={{ fontSize: '12px', marginBottom: '10px' }}>Notification Preferences</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: "'DM Mono', monospace", fontSize: '10px' }}>
                  <span>Goal milestones</span><input type="checkbox" defaultChecked style={{ accentColor: 'var(--g)' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: "'DM Mono', monospace", fontSize: '10px' }}>
                  <span>Contribution confirmations</span><input type="checkbox" defaultChecked style={{ accentColor: 'var(--g)' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: "'DM Mono', monospace", fontSize: '10px' }}>
                  <span>Allocation reminders</span><input type="checkbox" defaultChecked style={{ accentColor: 'var(--g)' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Notifications;
