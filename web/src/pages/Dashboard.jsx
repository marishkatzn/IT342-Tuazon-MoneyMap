import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Topbar from '../components/Topbar';
import { AuthContext } from '../context/AuthContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [goals, setGoals] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [contributions, setContributions] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.id) {
        return;
      }

      try {
        const [gRes, iRes, cRes, nRes] = await Promise.all([
          fetch(`http://localhost:8081/api/goals/${user.id}`),
          fetch(`http://localhost:8081/api/income/${user.id}`),
          fetch(`http://localhost:8081/api/contributions/${user.id}`),
          fetch(`http://localhost:8081/api/notifications/${user.id}`)
        ]);

        if (gRes.ok) setGoals(await gRes.json());
        if (iRes.ok) setIncomes(await iRes.json());
        if (cRes.ok) setContributions(await cRes.json());
        if (nRes.ok) setNotifications(await nRes.json());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const totalSaved = goals.reduce((acc, curr) => acc + curr.currentAmount, 0);
  const monthlySavingsIncome = incomes.filter(i => i.status === 'Received').reduce((acc, curr) => acc + curr.amount, 0);
  const totalTarget = goals.reduce((acc, curr) => acc + curr.targetAmount, 0);
  const savingsRate = totalTarget > 0 ? ((totalSaved / totalTarget) * 100).toFixed(0) : 0;
  
  const colors = ['var(--g)', 'var(--blue)', 'var(--purple)', 'var(--amber)', 'var(--red)'];
  const sortedContributions = [...contributions].sort((a,b) => b.id - a.id).slice(0, 3);
  const latestNotifs = [...notifications].sort((a,b) => b.id - a.id).slice(0, 3);

  const formatCurrency = (val) => val.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

  return (
    <>
      <Topbar
        title="Dashboard"
        subtitle={`Welcome back, ${user?.name || 'User'}`}
        rightContent={
          <>
            <div className="supa">⚡ Supabase · Live</div>
            <div className="notif-btn" onClick={() => navigate('/notifications')}>
              🔔{notifications.some(n => !n.read) && <div className="ndot"></div>}
            </div>
            <div className="tb-btn g" onClick={() => navigate('/goals')}>+ Add Goal</div>
          </>
        }
      />
      <div className="scroll">
        <div className="grid g12" style={{ marginBottom: '12px' }}>
          {/* Balance */}
          <div className="card hl c4">
            <div className="sico">💰</div>
            <div className="clabel">Total Savings Balance</div>
            <div className="sval lg">{formatCurrency(totalSaved)}</div>
            <div style={{ marginTop: '8px' }}>
              <span className="chip up">All-time</span>
            </div>
          </div>
          {/* Monthly Savings Income */}
          <div className="card c4">
            <div className="sico">🪙</div>
            <div className="clabel">Monthly Savings Income</div>
            <div className="sval" style={{ color: 'var(--g)' }}>{formatCurrency(monthlySavingsIncome)}</div>
            <div className="ssub">Available for goals</div>
          </div>
          {/* Savings Rate (overall goal progress) */}
          <div className="card c4">
            <div className="clabel">Overall Goal Progress</div>
            <div className="ring-row" style={{ marginTop: '4px' }}>
              <svg className="ring-svg" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="24" fill="none" stroke="var(--dim)" strokeWidth="7" />
                <circle cx="32" cy="32" r="24" fill="none" stroke="var(--g)" strokeWidth="7" strokeDasharray="150.8" strokeDashoffset={150.8 - (150.8 * savingsRate / 100)} strokeLinecap="round" transform="rotate(-90 32 32)" style={{ filter: 'drop-shadow(0 0 4px rgba(74,222,128,.5))' }} />
              </svg>
              <div>
                <div className="ri-lbl">TARGET FILLED</div>
                <div className="ri-big">{savingsRate}%</div>
                <div className="ri-sub">{formatCurrency(totalTarget)} target</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid g12" style={{ marginBottom: '12px' }}>
          <div className="card c8">
            <div className="ctitle">
              Recent Contributions Trend
            </div>
            {/* Simple static chart since we don't have enough data points, just mock an aesthetic SVG */}
            <svg className="chart-svg" viewBox="0 0 560 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4ade80" stopOpacity=".2" />
                  <stop offset="100%" stopColor="#4ade80" stopOpacity="0" />
                </linearGradient>
              </defs>
              <line x1="0" y1="25" x2="560" y2="25" stroke="rgba(255,255,255,.03)" strokeWidth="1" />
              <line x1="0" y1="50" x2="560" y2="50" stroke="rgba(255,255,255,.03)" strokeWidth="1" />
              <line x1="0" y1="75" x2="560" y2="75" stroke="rgba(255,255,255,.03)" strokeWidth="1" />
              <path d="M0,78 C70,68 120,50 180,55 C240,60 300,35 360,26 C420,17 480,10 560,4 L560,100 L0,100Z" fill="url(#cg)" />
              <path d="M0,78 C70,68 120,50 180,55 C240,60 300,35 360,26 C420,17 480,10 560,4" fill="none" stroke="#4ade80" strokeWidth="2" style={{ filter: 'drop-shadow(0 0 4px rgba(74,222,128,.4))' }} />
              <circle cx="400" cy="14" r="4" fill="#4ade80" style={{ filter: 'drop-shadow(0 0 6px rgba(74,222,128,.8))' }} />
              <circle cx="400" cy="14" r="9" fill="rgba(74,222,128,.1)" />
            </svg>
          </div>

          <div className="card c4">
            <div className="ctitle">
              Goals Overview <span className="lnk" onClick={() => navigate('/goals')}>Manage →</span>
            </div>
            {goals.slice(0, 3).map((g, idx) => {
               const pct = g.targetAmount > 0 ? (g.currentAmount / g.targetAmount * 100) : 0;
               return (
                  <div key={g.id} className="goal-item">
                    <div className="gemo">{g.icon}</div>
                    <div className="gmeta">
                      <div className="gname">{g.name}</div>
                      <div className="grange">{formatCurrency(g.currentAmount)} / {formatCurrency(g.targetAmount)}</div>
                      <div className="gpbar"><div className="gpfill" style={{ width: `${Math.min(pct, 100)}%` }}></div></div>
                    </div>
                    <div className="gpct">{pct.toFixed(0)}%</div>
                  </div>
               );
            })}
            {loading && <div>Loading...</div>}
            {goals.length === 0 && !loading && <div style={{color:"var(--muted)", fontSize:"12px"}}>No goals yet.</div>}
          </div>
        </div>

        <div className="grid g12">
          <div className="card c4">
            <div className="ctitle">
              Fund Allocation <span className="lnk" onClick={() => navigate('/allocation')}>Edit →</span>
            </div>
            {goals.slice(0, 4).map((g, idx) => {
               const color = colors[idx % colors.length];
               return (
                  <div key={g.id} className="alloc-row">
                    <div className="aico">{g.icon}</div><div className="aname">{g.name}</div>
                    <div className="atrack"><div className="afill" style={{ width: `${g.allocationPercentage}%`, background: color }}></div></div>
                    <div className="apct">{g.allocationPercentage}%</div>
                  </div>
               );
            })}
            {goals.length === 0 && !loading && <div style={{color:"var(--muted)", fontSize:"12px"}}>No goals to allocate.</div>}
          </div>

          <div className="card c4">
            <div className="ctitle">
              Recent Contributions <span className="lnk" onClick={() => navigate('/contributions')}>All →</span>
            </div>
            {sortedContributions.map((c, idx) => {
               const color = colors[idx % colors.length];
               return (
                  <div key={c.id} className="txn">
                    <div className="torb" style={{ background: color, display:"flex", alignItems:"center", justifyContent:"center", color:"var(--bg)", border:`1px solid ${color}`}}>{c.goalIcon}</div>
                    <div style={{ flex: 1 }}>
                      <div className="tname">{c.goalName}</div>
                      <div className="tcat">{c.method} · Contribution</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="tamt pos">{formatCurrency(c.amount)}</div>
                      <div className="ttime">{c.date}</div>
                    </div>
                  </div>
               );
            })}
            {sortedContributions.length === 0 && !loading && <div style={{color:"var(--muted)", fontSize:"12px"}}>No contributions yet.</div>}
          </div>

          <div className="card c4">
            <div className="ctitle">
              Alerts <span className="lnk" onClick={() => navigate('/notifications')}>View all →</span>
            </div>
            {latestNotifs.map((n, idx) => (
               <div key={n.id} className="notif">
                 <div className={`norb ${n.type === 'Milestone' ? 'g' : 'a'}`}>{n.icon || '🔔'}</div>
                 <div>
                   <div className="ntitle">{n.title}</div>
                   <div className="nbody">{n.body}</div>
                   {/* Convert datetime to something readable roughly */}
                   <div className="ntime">{new Date(n.createdAt).toLocaleDateString()}</div>
                 </div>
               </div>
            ))}
            {latestNotifs.length === 0 && !loading && <div style={{color:"var(--muted)", fontSize:"12px"}}>No alerts available.</div>}
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
