import React, { useState, useEffect, useContext } from 'react';
import Topbar from '../components/Topbar';
import { AuthContext } from '../context/AuthContext';

const Contributions = () => {
  const { user } = useContext(AuthContext);

  const [contributions, setContributions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [goalId, setGoalId] = useState('');
  const [amount, setAmount] = useState('500.00');
  const [method, setMethod] = useState('Card');

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) {
        return;
      }

      try {
        const cRes = await fetch(`http://localhost:8081/api/contributions/${user.id}`);
        const gRes = await fetch(`http://localhost:8081/api/goals/${user.id}`);
        if (cRes.ok && gRes.ok) {
          const cData = await cRes.json();
          const gData = await gRes.json();
          setContributions(cData);
          setGoals(gData);
          if (gData.length > 0) {
            setGoalId(gData[0].id);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleContribute = async () => {
    if (!goalId || !amount) return;
    try {
      const res = await fetch(`http://localhost:8081/api/contributions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          goalId: parseInt(goalId),
          amount: parseFloat(amount),
          method
        })
      });
      if (res.ok) {
        const newC = await res.json();
        setContributions([...contributions, newC].sort((a,b) => new Date(b.date) - new Date(a.date))); // push and sort (desc)
        window.dispatchEvent(new Event('sidebar-refresh'));
        alert('Contribution successful!');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const totalContributed = contributions.reduce((acc, curr) => acc + curr.amount, 0);
  const sortedC = [...contributions].sort((a,b) => b.id - a.id);
  const lastC = sortedC.length > 0 ? sortedC[0] : null;

  return (
    <>
      <Topbar
        title="Contributions"
        subtitle="Record savings contributions via payment gateway"
        rightContent={<div className="supa">⚡ Payment Gateway · Active</div>}
      />
      <div className="scroll">
        <div className="grid" style={{ gridTemplateColumns: '1fr 340px', gap: '12px' }}>
          {/* History */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="grid g12">
              <div className="card c4 hl">
                <div className="clabel">Total Contributed</div>
                <div className="sval" style={{ color: 'var(--g)' }}>${totalContributed.toFixed(2)}</div>
                <div className="ssub">{contributions.length} transactions</div>
              </div>
              <div className="card c4">
                <div className="clabel">Last Contribution</div>
                <div className="sval" style={{ fontSize: '20px' }}>{lastC ? '$' + lastC.amount.toFixed(2) : '--'}</div>
                <div className="ssub">{lastC ? `${lastC.date} · ${lastC.goalName}` : 'No history yet'}</div>
              </div>
              <div className="card c4">
                <div className="clabel">Streak</div>
                <div className="sval">4 <span style={{ fontSize: '14px', color: 'var(--muted)' }}>weeks</span></div>
                <div style={{ marginTop: '4px' }}>
                  <span className="chip up">🔥 Keep it up!</span>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="ctitle">Contribution History</div>
              <div className="tbl-head" style={{ gridTemplateColumns: '2fr 1.5fr 1fr 1fr 80px' }}>
                <span>Goal</span><span>Method</span><span>Date</span><span>Amount</span><span>Status</span>
              </div>
              
              {loading ? <div style={{padding:"20px"}}>Loading history...</div> : sortedC.map(c => (
                <div key={c.id} className="tbl-row" style={{ gridTemplateColumns: '2fr 1.5fr 1fr 1fr 80px' }}>
                  <div className="tbl-cell" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>{c.goalIcon} {c.goalName}</div>
                  <div className="tbl-cell muted mono">{c.method}</div>
                  <div className="tbl-cell muted mono">{c.date}</div>
                  <div className="tbl-cell mono" style={{ color: 'var(--g)' }}>+${c.amount.toFixed(2)}</div>
                  <div className="tbl-cell"><span className="sbadge g">{c.status}</span></div>
                </div>
              ))}
              
              {contributions.length === 0 && !loading && <div style={{padding:"20px", color:"var(--muted)", textAlign:"center", fontSize:"12px"}}>No contributions found.</div>}
            </div>
          </div>

          {/* Payment form */}
          <div className="card">
            <div className="ctitle">New Contribution</div>
            <div className="pay-amount-display">
              <div className="pad-prefix">Contributing</div>
              <div className="pad-val">${parseFloat(amount || 0).toFixed(2)}</div>
            </div>
            
            <div className="field">
              <div className="flabel">Destination Goal</div>
              <select className="fselect" value={goalId} onChange={e => setGoalId(e.target.value)}>
                {goals.map(g => (
                  <option key={g.id} value={g.id}>{g.icon} {g.name}</option>
                ))}
              </select>
            </div>
            
            <div className="field">
              <div className="flabel">Amount</div>
              <input className="finput" placeholder="$0.00" type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} />
            </div>
            
            <div className="flabel" style={{ marginBottom: '6px' }}>Payment Method</div>
            <div className="pmethods">
              {['Card', 'Bank', 'GCash', 'PayPal'].map(m => (
                 <div key={m} className={`pmethod ${method === m ? 'sel' : ''}`} onClick={() => setMethod(m)}>
                   {m === 'Card' ? '💳' : (m === 'Bank' ? '🏦' : (m === 'GCash' ? '📱' : '🅿️'))} {m}
                 </div>
              ))}
            </div>
            
            {method === 'Card' && (
              <>
                <div className="frow two" style={{ marginBottom: '10px' }}>
                  <div className="field" style={{ margin: 0 }}>
                    <div className="flabel">Card Number</div>
                    <input className="finput" placeholder="•••• •••• •••• ••••" />
                  </div>
                  <div className="field" style={{ margin: 0 }}>
                    <div className="flabel">Expiry / CVV</div>
                    <input className="finput" placeholder="MM/YY · CVV" />
                  </div>
                </div>
                
                <div className="field">
                  <div className="flabel">Cardholder Name</div>
                  <input className="finput" placeholder={user?.name || "Cardholder Name"} />
                </div>
              </>
            )}
            
            <button className="btn-pri" onClick={handleContribute} disabled={goals.length === 0}>
              {goals.length === 0 ? "Create a goal first" : "Confirm Contribution →"}
            </button>
            <div style={{ textAlign: 'center', marginTop: '8px', fontFamily: "'DM Mono', monospace", fontSize: '9px', color: 'var(--dim)' }}>
              Secured by 256-bit SSL · Powered by Stripe
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Contributions;
