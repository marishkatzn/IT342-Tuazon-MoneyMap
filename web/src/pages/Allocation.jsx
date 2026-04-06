import React, { useState, useEffect, useContext } from 'react';
import Topbar from '../components/Topbar';
import { AuthContext } from '../context/AuthContext';

const Allocation = () => {
  const { user } = useContext(AuthContext);

  const [goals, setGoals] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draftAllocations, setDraftAllocations] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) {
        return;
      }

      setLoading(true);
      try {
        const gRes = await fetch(`http://localhost:8081/api/goals/${user.id}`);
        const iRes = await fetch(`http://localhost:8081/api/income/${user.id}`);
        if (gRes.ok && iRes.ok) {
          const gData = await gRes.json();
          const iData = await iRes.json();
          setGoals(gData);
          setIncomes(iData);

          const initialDrafts = {};
          gData.forEach(g => {
            initialDrafts[g.id] = g.allocationPercentage || 0;
          });
          setDraftAllocations(initialDrafts);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleSliderChange = (goalId, value) => {
    setDraftAllocations(prev => ({
      ...prev,
      [goalId]: parseInt(value)
    }));
  };

  const handleSaveAllocations = async () => {
    const payload = goals.map(g => ({
      ...g,
      allocationPercentage: draftAllocations[g.id]
    }));

    try {
      const res = await fetch(`http://localhost:8081/api/goals/${user.id}/allocations`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        alert("Allocations saved successfully!");
        setGoals(payload);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const pool = incomes.filter(i => i.status === 'Received').reduce((acc, curr) => acc + curr.amount, 0);
  const totalAllocatedPct = Object.values(draftAllocations).reduce((acc, curr) => acc + curr, 0);
  const allocatedAmount = (totalAllocatedPct / 100) * pool;
  const unallocatedAmount = pool - allocatedAmount;
  
  const colors = ['var(--g)', 'var(--blue)', 'var(--purple)', 'var(--amber)', 'var(--red)'];

  if (loading) return <div style={{padding:"20px"}}>Loading allocations...</div>;

  return (
    <>
      <Topbar
        title="Fund Allocation"
        subtitle="Distribute your savings income across goals"
        rightContent={<div className="tb-btn g" onClick={handleSaveAllocations}>Save Allocation</div>}
      />
      <div className="scroll">
        <div className="grid g12" style={{ marginBottom: '12px' }}>
          <div className="card c4 hl">
            <div className="clabel">Available Pool</div>
            <div className="sval" style={{ color: 'var(--g)' }}>${pool.toFixed(2)}</div>
            <div className="ssub">Received savings income</div>
          </div>
          <div className="card c4">
            <div className="clabel">Allocated</div>
            <div className="sval">${allocatedAmount.toFixed(2)}</div>
            <div style={{ marginTop: '5px' }}>
              <span className={`chip ${totalAllocatedPct === 100 ? 'up' : (totalAllocatedPct > 100 ? 'dn' : 'nu')}`}>{totalAllocatedPct}% distributed</span>
            </div>
          </div>
          <div className="card c4">
            <div className="clabel">Unallocated</div>
            <div className="sval" style={{ color: unallocatedAmount < 0 ? 'var(--red)' : 'var(--amber)' }}>${unallocatedAmount.toFixed(2)}</div>
            <div className="ssub">Remaining to assign</div>
          </div>
        </div>

        <div className="grid" style={{ gridTemplateColumns: '1fr 320px', gap: '12px' }}>
          <div className="card">
            <div className="ctitle">Allocation Settings</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {goals.map((goal, idx) => {
                const color = colors[idx % colors.length];
                const pct = draftAllocations[goal.id] || 0;
                const monthlyTrackAmount = (pct / 100) * pool;
                const progressPct = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount * 100) : 0;
                
                return (
                  <div key={goal.id} style={{ padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="gemo">{goal.icon}</div>
                        <div>
                          <div className="gname">{goal.name}</div>
                          <div className="grange">${goal.currentAmount.toFixed(0)} / ${goal.targetAmount.toFixed(0)} · {progressPct.toFixed(0)}%</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '11px', color: 'var(--g)' }}>${monthlyTrackAmount.toFixed(0)} / mo</span>
                        <input className="finput" value={pct} type="number" onChange={(e) => handleSliderChange(goal.id, e.target.value)} style={{ width: '60px', textAlign: 'center' }} />
                        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '11px', color: 'var(--muted)' }}>%</span>
                      </div>
                    </div>
                    <input type="range" min="0" max="100" value={pct} onChange={(e) => handleSliderChange(goal.id, e.target.value)} style={{ width: '100%', accentColor: color }} />
                  </div>
                );
              })}
              
              {goals.length === 0 && <div style={{color:"var(--muted)", fontSize:"12px"}}>No active goals. Go to the Goals section to create one.</div>}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="card">
              <div className="ctitle">Distribution Preview</div>
              {goals.map((goal, idx) => {
                const color = colors[idx % colors.length];
                const pct = draftAllocations[goal.id] || 0;
                return (
                  <div key={goal.id} className="alloc-row">
                    <div className="aico">{goal.icon}</div><div className="aname">{goal.name}</div>
                    <div className="atrack"><div className="afill" style={{ width: `${pct}%`, background: color }}></div></div>
                    <div className="apct">{pct}%</div>
                  </div>
                );
              })}
              {goals.length > 0 && <div className="div"></div>}
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '10px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--muted)' }}>Total allocated</span>
                <span style={{ color: totalAllocatedPct > 100 ? 'var(--red)' : 'var(--g)' }}>{totalAllocatedPct}% · ${allocatedAmount.toFixed(2)}</span>
              </div>
            </div>

            <button className="btn-pri" onClick={handleSaveAllocations}>Save Allocation →</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Allocation;
