import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Topbar from '../components/Topbar';
import { AuthContext } from '../context/AuthContext';

const Goals = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  // New goal form states
  const [icon, setIcon] = useState('🎯');
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');

  useEffect(() => {
    const fetchGoals = async () => {
      if (!user?.id) {
        return;
      }

      try {
        const res = await fetch(`http://localhost:8081/api/goals/${user.id}`);
        if (res.ok) {
          const data = await res.json();
          setGoals(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchGoals();
  }, [user]);

  const handleAddGoal = async () => {
    if (!name || !targetAmount) return;
    try {
      const res = await fetch(`http://localhost:8081/api/goals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          name,
          icon,
          targetAmount: parseFloat(targetAmount),
          targetDate: targetDate || undefined,
          currentAmount: 0,
          allocationPercentage: 0
        })
      });
      if (res.ok) {
        const newGoal = await res.json();
        setGoals([...goals, newGoal]);
        window.dispatchEvent(new Event('sidebar-refresh'));
        setName('');
        setTargetAmount('');
        setTargetDate('');
        setIcon('🎯');
      }
    } catch(e) {
      console.error(e);
    }
  };

  const totalTarget = goals.reduce((acc, curr) => acc + curr.targetAmount, 0);
  const totalSaved = goals.reduce((acc, curr) => acc + curr.currentAmount, 0);
  const overallPercentage = totalTarget > 0 ? ((totalSaved / totalTarget) * 100).toFixed(0) : 0;
  const activeCount = goals.length;
  const nearCompletion = goals.filter(g => (g.currentAmount / g.targetAmount) > 0.8 && g.currentAmount < g.targetAmount).length;

  return (
    <>
      <Topbar
        title="Savings Goals"
        subtitle="Create and track your financial targets"
        rightContent={<div className="tb-btn g" onClick={() => window.scrollTo(0, document.body.scrollHeight)}>+ New Goal</div>}
      />
      <div className="scroll">
        <div className="grid g12" style={{ marginBottom: '12px' }}>
          <div className="card c4 hl">
            <div className="sico">🎯</div>
            <div className="clabel">Active Goals</div>
            <div className="sval">{activeCount}</div>
            <div className="ssub">{nearCompletion} near completion</div>
          </div>
          <div className="card c4">
            <div className="sico">💰</div>
            <div className="clabel">Total Target</div>
            <div className="sval">${totalTarget.toLocaleString()}</div>
            <div className="ssub">Across all goals</div>
          </div>
          <div className="card c4">
            <div className="sico">📈</div>
            <div className="clabel">Total Saved</div>
            <div className="sval" style={{ color: 'var(--g)' }}>${totalSaved.toLocaleString()}</div>
            <div className="ssub" style={{ display: 'flex', gap: '5px' }}>
              <span className="chip up">{overallPercentage}% overall</span>
            </div>
          </div>
        </div>

        <div className="grid" style={{ gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '12px' }}>
          {loading ? <div style={{gridColumn:"span 3", padding:"20px"}}>Loading goals...</div> : goals.map(goal => {
            const pct = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount * 100) : 0;
            const isComplete = pct >= 100;
            const isBehind = false; // Could add logic later
            return (
              <div key={goal.id} className="card" style={{ borderColor: isComplete ? 'rgba(74,222,128,.25)' : 'var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ fontSize: '28px' }}>{goal.icon}</div>
                  <span className={`sbadge ${isComplete ? 'g' : (isBehind ? 'a' : 'b')}`}>
                    {isComplete ? 'Complete' : 'In Progress'}
                  </span>
                </div>
                <div style={{ fontSize: '15px', fontWeight: '700', marginBottom: '3px' }}>{goal.name}</div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '9px', color: 'var(--muted)', marginBottom: '12px' }}>
                  Target: ${goal.targetAmount.toLocaleString()} · {goal.targetDate ? `Due ${goal.targetDate}` : 'No Due Date'}
                </div>
                <div style={{ fontSize: '22px', fontWeight: '800', letterSpacing: '-1px', marginBottom: '4px' }}>${goal.currentAmount.toLocaleString()}</div>
                <div className="gpbar" style={{ marginBottom: '5px' }}>
                  <div className="gpfill" style={{ width: `${Math.min(pct, 100)}%`, background: isComplete ? 'var(--g)' : 'var(--blue)', boxShadow: isComplete ? '0 0 5px var(--gglow)' : 'none' }}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'DM Mono', monospace", fontSize: '9px', color: 'var(--muted)' }}>
                  <span style={{ color: isComplete ? 'var(--g)' : 'var(--blue)' }}>{pct.toFixed(0)}% complete</span>
                  <span>${Math.max(goal.targetAmount - goal.currentAmount, 0).toLocaleString()} remaining</span>
                </div>
                <div className="div"></div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button className="btn-pri" style={{ flex: 1, padding: '7px', fontSize: '11px', opacity: isComplete ? 0.5 : 1 }} onClick={() => navigate('/contributions')}>
                    Contribute
                  </button>
                  <button className="btn-ghost" style={{ flex: 1, padding: '7px', fontSize: '10px' }}>
                    Edit
                  </button>
                </div>
              </div>
            );
          })}
          
          {goals.length === 0 && !loading && (
             <div style={{gridColumn:"span 3", padding:"20px", color:"var(--muted)", textAlign:"center", fontSize:"12px"}}>No active goals found. Start by creating one below.</div>
          )}
        </div>

        {/* New goal form */}
        <div className="card">
          <div className="ctitle">Create New Goal</div>
          <div className="frow" style={{ gridTemplateColumns: '80px 1fr 1fr 1fr 1fr', gap: '10px', alignItems: 'end' }}>
            <div className="field" style={{ margin: 0 }}>
              <div className="flabel">Icon</div>
              <input className="finput" type="text" value={icon} onChange={e => setIcon(e.target.value)} style={{ textAlign: 'center', fontSize: '18px' }} />
            </div>
            <div className="field" style={{ margin: 0 }}>
              <div className="flabel">Goal Name</div>
              <input className="finput" placeholder="e.g. Emergency Fund" type="text" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="field" style={{ margin: 0 }}>
              <div className="flabel">Target Amount</div>
              <input className="finput" placeholder="$0.00" type="number" step="0.01" value={targetAmount} onChange={e => setTargetAmount(e.target.value)} />
            </div>
            <div className="field" style={{ margin: 0 }}>
              <div className="flabel">Target Date</div>
              <input className="finput" type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} />
            </div>
            <button className="btn-pri" style={{ margin: 0, padding: '8px' }} onClick={handleAddGoal}>Add Goal →</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Goals;
