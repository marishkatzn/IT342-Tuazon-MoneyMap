import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Topbar from '../../components/Topbar';
import { AuthContext } from '../../context/AuthContext';
import { apiFetch } from '../../lib/api';

const Profile = () => {
  const { user, updateUser } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) {
        return;
      }

      try {
        const res = await apiFetch(`/user/${user.id}`);
        if (!res.ok) {
          throw new Error('Unable to load profile.');
        }

        const profile = await res.json();
        setName(profile.name || '');
        setEmail(profile.email || '');
      } catch (error) {
        console.error(error);
        setName(user.name || '');
        setEmail(user.email || '');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);


  const handleSave = async () => {
    if (!user?.id) {
      return;
    }

    try {
      setSaving(true);
      const res = await apiFetch(`/user/${user.id}`, {
        method: 'PUT',
        body: {
          name,
          email
        }
      });

      const raw = await res.text();
      let payload = {};
      try {
        payload = raw ? JSON.parse(raw) : {};
      } catch {
        payload = { message: raw };
      }

      if (!res.ok) {
        throw new Error(payload.message || 'Unable to save profile.');
      }

      const updatedUser = {
        ...user,
        name: payload.name,
        email: payload.email,
        authProvider: payload.authProvider
      };

      updateUser(updatedUser);
      window.dispatchEvent(new Event('sidebar-refresh'));
      alert('Profile updated successfully.');
    } catch (error) {
      alert(error.message || 'Unable to save profile.');
    } finally {
      setSaving(false);
    }
  };

  const displayInitial = (name || user?.name || 'U').charAt(0).toUpperCase();
  const isGoogleUser = user?.authProvider === 'GOOGLE';

  return (
    <>
      <Topbar
        title="Profile"
        subtitle="Manage your display name and email"
      />
      <div className="scroll">
        <div className="grid" style={{ gridTemplateColumns: '360px 1fr', gap: '12px' }}>
          <div
            className="card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              padding: '0',
              overflow: 'hidden',
              background: 'linear-gradient(180deg, rgba(24,72,42,.58) 0%, rgba(8,20,14,.96) 38%, rgba(8,20,14,1) 100%)'
            }}
          >
            <div
              style={{
                padding: '22px 20px 18px',
                borderBottom: '1px solid rgba(74,222,128,.12)',
                background: 'radial-gradient(circle at top left, rgba(74,222,128,.22), transparent 58%)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                <div
                  style={{
                    width: '88px',
                    height: '88px',
                    borderRadius: '24px',
                    display: 'grid',
                    placeItems: 'center',
                    background: 'linear-gradient(135deg, var(--g), #8bffb6)',
                    color: '#04120a',
                    fontSize: '34px',
                    fontWeight: 800,
                    boxShadow: '0 16px 34px rgba(0,0,0,.28)'
                  }}
                >
                  {displayInitial}
                </div>

                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '-.03em', marginBottom: '4px' }}>
                    {name || user?.name || 'Your Profile'}
                  </div>
                  <div style={{ color: 'var(--muted)', fontSize: '12px', lineHeight: 1.5, wordBreak: 'break-word' }}>
                    {email || user?.email || 'No email added yet'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span className="chip up">{isGoogleUser ? 'Google Account' : 'Local Account'}</span>
                <span className="chip nu">Profile Center</span>
              </div>
            </div>

            <div style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{ padding: '12px', border: '1px solid var(--border)', borderRadius: '14px', background: 'rgba(20,50,30,.22)' }}>
                  <div className="flabel">Account Type</div>
                  <div style={{ fontSize: '14px', fontWeight: '700' }}>{isGoogleUser ? 'Google' : 'Local'}</div>
                </div>
                <div style={{ padding: '12px', border: '1px solid var(--border)', borderRadius: '14px', background: 'rgba(20,50,30,.22)' }}>
                  <div className="flabel">Status</div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--g)' }}>Active</div>
                </div>
              </div>

              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '4px' }}>
                <Link to="/notifications" className="btn-ghost" style={{ textDecoration: 'none', textAlign: 'center' }}>
                  Bell Notifications
                </Link>
                <Link to="/signout" className="btn-ghost" style={{ textDecoration: 'none', textAlign: 'center', color: 'var(--red)' }}>
                  Sign out
                </Link>
              </div>
            </div>
          </div>

          <div className="card">
            {loading ? (
              <div style={{ padding: '20px' }}>Loading profile...</div>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                  <div className="ctitle" style={{ marginBottom: 0 }}>Personal Details</div>
                  {isGoogleUser && (
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '6px 10px',
                        borderRadius: '999px',
                        border: '1px solid var(--border)',
                        background: 'rgba(20,50,30,.22)',
                        fontFamily: "'DM Mono', monospace",
                        fontSize: '10px',
                        color: 'var(--muted)'
                      }}
                    >
                      <span
                        style={{
                          width: '16px',
                          height: '16px',
                          borderRadius: '50%',
                          display: 'grid',
                          placeItems: 'center',
                          background: 'conic-gradient(#4285F4 0 25%, #EA4335 25% 50%, #FBBC05 50% 75%, #34A853 75% 100%)',
                          color: '#fff',
                          fontSize: '10px',
                          fontWeight: 700
                        }}
                      >
                        G
                      </span>
                      Google
                    </div>
                  )}
                </div>
                <div className="field">
                  <div className="flabel">Display Name</div>
                  <input className="finput" type="text" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="field">
                  <div className="flabel">Email</div>
                  <input className="finput" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <button className="btn-pri" onClick={handleSave} disabled={saving} style={{ marginTop: '14px' }}>
                  {saving ? 'Saving...' : 'Save Profile'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
