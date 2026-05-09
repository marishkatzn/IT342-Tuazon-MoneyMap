import React, { useState, useEffect, useContext } from 'react';
import Topbar from '../../components/Topbar';
import { AuthContext } from '../../context/AuthContext';
import { apiFetch } from '../../lib/api';

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
        const res = await apiFetch(`/notifications/${user.id}`);
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

  const unreadNotifications = notifications.filter((notification) => !notification.read);
  const readNotifications = notifications.filter((notification) => notification.read);
  const milestoneNotifications = notifications.filter((notification) => notification.type === 'Milestone');
  const unreadCount = unreadNotifications.length;

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
            <div>
              <div className="sec-lbl" style={{ color: unreadCount > 0 ? 'var(--red)' : 'var(--muted)' }}>
                Unread · {unreadCount}
              </div>
              {loading && <div style={{ padding: '20px' }}>Loading...</div>}
              {unreadNotifications.map((notification) => (
                <div key={notification.id} className="card" style={{ borderColor: 'rgba(74,222,128,.2)' }}>
                  <div className="notif">
                    <div className={`norb ${notification.type === 'Milestone' ? 'g' : 'a'}`}>
                      {notification.icon || '!'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div className="ntitle">{notification.title}</div>
                        <span className="sbadge g" style={{ marginLeft: '8px', flexShrink: 0 }}>New</span>
                      </div>
                      <div className="nbody">{notification.body}</div>
                      <div className="ntime">{new Date(notification.createdAt).toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              ))}
              {unreadNotifications.length === 0 && !loading && (
                <div style={{ color: 'var(--muted)', fontSize: '12px' }}>No unread notifications.</div>
              )}
            </div>

            <div>
              <div className="sec-lbl">Earlier</div>
              <div className="card">
                {readNotifications.map((notification) => (
                  <div key={notification.id} className="notif">
                    <div className={`norb ${notification.type === 'Info' ? 'b' : (notification.type === 'Milestone' ? 'g' : 'a')}`}>
                      {notification.icon || '$'}
                    </div>
                    <div>
                      <div className="ntitle">{notification.title}</div>
                      <div className="nbody">{notification.body}</div>
                      <div className="ntime">{new Date(notification.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                ))}
                {readNotifications.length === 0 && !loading && (
                  <div style={{ color: 'var(--muted)', fontSize: '12px' }}>No older notifications.</div>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="card">
              <div className="ctitle" style={{ fontSize: '13px', marginBottom: '10px' }}>Milestones Earned</div>
              {milestoneNotifications.slice(0, 4).map((notification) => (
                <div key={notification.id} className="milestone">
                  <div className="ms-ico">{notification.icon || '*'}</div>
                  <div>
                    <div className="ms-name">{notification.title}</div>
                    <div className="ms-sub">{notification.body}</div>
                  </div>
                  <span className="sbadge g ms-chip">Earned</span>
                </div>
              ))}
              {milestoneNotifications.length === 0 && !loading && (
                <div style={{ color: 'var(--muted)', fontSize: '12px' }}>Complete a savings goal to earn your first milestone.</div>
              )}
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
