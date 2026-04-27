import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Topbar from '../components/Topbar';
import { AuthContext } from '../context/AuthContext';
import { apiFetch } from '../lib/api';

const CHART_WIDTH = 560;
const CHART_HEIGHT = 100;
const CHART_PADDING_X = 12;
const CHART_TOP = 12;
const CHART_BOTTOM = 84;

const parseLocalDate = (value) => {
  if (!value) {
    return null;
  }

  const [year, month, day] = String(value).split('-').map(Number);
  if (!year || !month || !day) {
    return null;
  }

  return new Date(year, month - 1, day);
};

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
          apiFetch(`/goals/${user.id}`),
          apiFetch(`/income/${user.id}`),
          apiFetch(`/contributions/${user.id}`),
          apiFetch(`/notifications/${user.id}`)
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
  const monthlySavingsIncome = incomes.filter((income) => income.status === 'Received').reduce((acc, curr) => acc + curr.amount, 0);
  const totalTarget = goals.reduce((acc, curr) => acc + curr.targetAmount, 0);
  const savingsRate = totalTarget > 0 ? ((totalSaved / totalTarget) * 100).toFixed(0) : 0;

  const colors = ['var(--g)', 'var(--blue)', 'var(--purple)', 'var(--amber)', 'var(--red)'];
  const sortedContributions = [...contributions].sort((a, b) => b.id - a.id).slice(0, 3);
  const latestNotifs = [...notifications].sort((a, b) => b.id - a.id).slice(0, 3);

  const formatCurrency = (val) => val.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  const contributionTrend = Object.values(contributions.reduce((acc, contribution) => {
    const dateKey = contribution.date;
    if (!dateKey) {
      return acc;
    }

    if (!acc[dateKey]) {
      acc[dateKey] = {
        dateKey,
        amount: 0
      };
    }

    acc[dateKey].amount += Number(contribution.amount || 0);
    return acc;
  }, {}))
    .sort((a, b) => parseLocalDate(a.dateKey) - parseLocalDate(b.dateKey))
    .slice(-7);

  const trendMax = contributionTrend.length > 0
    ? Math.max(...contributionTrend.map((point) => point.amount), 1)
    : 1;
  const chartUsableWidth = CHART_WIDTH - (CHART_PADDING_X * 2);
  const chartStep = contributionTrend.length > 1 ? chartUsableWidth / (contributionTrend.length - 1) : 0;
  const trendPoints = contributionTrend.map((point, index) => {
    const x = contributionTrend.length === 1 ? CHART_WIDTH / 2 : CHART_PADDING_X + (chartStep * index);
    const yRatio = point.amount / trendMax;
    const y = CHART_BOTTOM - ((CHART_BOTTOM - CHART_TOP) * yRatio);

    return {
      ...point,
      x,
      y
    };
  });
  const trendLinePath = trendPoints.map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x},${point.y}`).join(' ');
  const trendAreaPath = trendPoints.length > 0
    ? `${trendLinePath} L${trendPoints[trendPoints.length - 1].x},${CHART_HEIGHT} L${trendPoints[0].x},${CHART_HEIGHT} Z`
    : '';
  const latestTrendPoint = trendPoints[trendPoints.length - 1] || null;

  return (
    <>
      <Topbar
        title="Dashboard"
        subtitle={`Welcome back, ${user?.name || 'User'}`}
        rightContent={
          <>
            <div className="supa">Supabase · Live</div>
            <div className="notif-btn" onClick={() => navigate('/notifications')}>
              🔔{notifications.some((n) => !n.read) && <div className="ndot"></div>}
            </div>
            <div className="tb-btn g" onClick={() => navigate('/goals')}>+ Add Goal</div>
          </>
        }
      />
      <div className="scroll">
        <div className="grid g12" style={{ marginBottom: '12px' }}>
          <div className="card hl c4">
            <div className="sico">💰</div>
            <div className="clabel">Total Savings Balance</div>
            <div className="sval lg">{formatCurrency(totalSaved)}</div>
            <div style={{ marginTop: '8px' }}>
              <span className="chip up">All-time</span>
            </div>
          </div>
          <div className="card c4">
            <div className="sico">🪙</div>
            <div className="clabel">Monthly Savings Income</div>
            <div className="sval" style={{ color: 'var(--g)' }}>{formatCurrency(monthlySavingsIncome)}</div>
            <div className="ssub">Available for goals</div>
          </div>
          <div className="card c4">
            <div className="clabel">Overall Goal Progress</div>
            <div className="ring-row" style={{ marginTop: '4px' }}>
              <svg className="ring-svg" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="24" fill="none" stroke="var(--dim)" strokeWidth="7" />
                <circle
                  cx="32"
                  cy="32"
                  r="24"
                  fill="none"
                  stroke="var(--g)"
                  strokeWidth="7"
                  strokeDasharray="150.8"
                  strokeDashoffset={150.8 - ((150.8 * savingsRate) / 100)}
                  strokeLinecap="round"
                  transform="rotate(-90 32 32)"
                  style={{ filter: 'drop-shadow(0 0 4px rgba(74,222,128,.5))' }}
                />
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
            {trendPoints.length > 0 ? (
              <>
                <svg className="chart-svg" viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4ade80" stopOpacity=".2" />
                      <stop offset="100%" stopColor="#4ade80" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <line x1="0" y1="25" x2={CHART_WIDTH} y2="25" stroke="rgba(255,255,255,.03)" strokeWidth="1" />
                  <line x1="0" y1="50" x2={CHART_WIDTH} y2="50" stroke="rgba(255,255,255,.03)" strokeWidth="1" />
                  <line x1="0" y1="75" x2={CHART_WIDTH} y2="75" stroke="rgba(255,255,255,.03)" strokeWidth="1" />
                  <path d={trendAreaPath} fill="url(#cg)" />
                  <path d={trendLinePath} fill="none" stroke="#4ade80" strokeWidth="2" style={{ filter: 'drop-shadow(0 0 4px rgba(74,222,128,.4))' }} />
                  {trendPoints.map((point) => (
                    <circle key={point.dateKey} cx={point.x} cy={point.y} r="2.5" fill="#4ade80" />
                  ))}
                  {latestTrendPoint && (
                    <>
                      <circle cx={latestTrendPoint.x} cy={latestTrendPoint.y} r="4" fill="#4ade80" style={{ filter: 'drop-shadow(0 0 6px rgba(74,222,128,.8))' }} />
                      <circle cx={latestTrendPoint.x} cy={latestTrendPoint.y} r="9" fill="rgba(74,222,128,.1)" />
                    </>
                  )}
                </svg>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', marginTop: '8px', fontFamily: "'DM Mono', monospace", fontSize: '9px', color: 'var(--muted)' }}>
                  {trendPoints.map((point) => (
                    <span key={point.dateKey}>
                      {parseLocalDate(point.dateKey)?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) || point.dateKey}
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ height: '132px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: '12px' }}>
                No contribution trend yet.
              </div>
            )}
          </div>

          <div className="card c4">
            <div className="ctitle">
              Goals Overview <span className="lnk" onClick={() => navigate('/goals')}>Manage →</span>
            </div>
            {goals.slice(0, 3).map((g) => {
              const pct = g.targetAmount > 0 ? (g.currentAmount / g.targetAmount) * 100 : 0;
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
            {goals.length === 0 && !loading && <div style={{ color: 'var(--muted)', fontSize: '12px' }}>No goals yet.</div>}
          </div>
        </div>

        <div className="grid g12">
          <div className="card c8">
            <div className="ctitle">
              Recent Contributions <span className="lnk" onClick={() => navigate('/contributions')}>All →</span>
            </div>
            {sortedContributions.map((c, idx) => {
              const color = colors[idx % colors.length];
              return (
                <div key={c.id} className="txn">
                  <div className="torb" style={{ background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bg)', border: `1px solid ${color}` }}>{c.goalIcon}</div>
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
            {sortedContributions.length === 0 && !loading && <div style={{ color: 'var(--muted)', fontSize: '12px' }}>No contributions yet.</div>}
          </div>

          <div className="card c4">
            <div className="ctitle">
              Alerts <span className="lnk" onClick={() => navigate('/notifications')}>View all →</span>
            </div>
            {latestNotifs.map((n) => (
              <div key={n.id} className="notif">
                <div className={`norb ${n.type === 'Milestone' ? 'g' : 'a'}`}>{n.icon || '🔔'}</div>
                <div>
                  <div className="ntitle">{n.title}</div>
                  <div className="nbody">{n.body}</div>
                  <div className="ntime">{new Date(n.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
            {latestNotifs.length === 0 && !loading && <div style={{ color: 'var(--muted)', fontSize: '12px' }}>No alerts available.</div>}
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
