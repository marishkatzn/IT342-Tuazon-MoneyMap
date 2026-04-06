import React, { useState, useEffect, useContext } from 'react';
import Topbar from '../components/Topbar';
import { AuthContext } from '../context/AuthContext';

const Income = () => {
  const { user } = useContext(AuthContext);

  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [sourceName, setSourceName] = useState('');
  const [category, setCategory] = useState('Primary Job');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [status, setStatus] = useState('Received');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const fetchIncomes = async () => {
      if (!user?.id) {
        return;
      }

      try {
        const res = await fetch(`http://localhost:8081/api/income/${user.id}`);
        if (res.ok) {
          const data = await res.json();
          setIncomes(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchIncomes();
  }, [user]);

  const handleSave = async () => {
    if (!sourceName || !amount) return;

    try {
      const res = await fetch(`http://localhost:8081/api/income`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          sourceName,
          category,
          amount: parseFloat(amount),
          date: date || undefined,
          status,
          notes
        })
      });
      if (res.ok) {
        const newIncome = await res.json();
        setIncomes([...incomes, newIncome]);
        // Reset
        setSourceName('');
        setAmount('');
        setDate('');
        setNotes('');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const totalThisMonth = incomes.reduce((acc, curr) => acc + curr.amount, 0);
  const pending = incomes.filter(i => i.status === 'Pending').reduce((acc, curr) => acc + curr.amount, 0);
  const received = incomes.filter(i => i.status === 'Received').reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <>
      <Topbar
        title="Savings Income"
        subtitle="Record and manage your savings income"
        rightContent={<div className="tb-btn g" onClick={() => window.scrollTo(0, document.body.scrollHeight)}>+ Record Income</div>}
      />
      <div className="scroll">
        <div className="grid g12" style={{ marginBottom: '12px' }}>
          <div className="card c4 hl">
            <div className="sico">💵</div>
            <div className="clabel">Total Income</div>
            <div className="sval" style={{ color: 'var(--g)' }}>${totalThisMonth.toFixed(2)}</div>
            <div className="ssub">{incomes.length} income sources</div>
          </div>
          <div className="card c4">
            <div className="sico">🪙</div>
            <div className="clabel">Received</div>
            <div className="sval">${received.toFixed(2)}</div>
            <div className="ssub">Available for savings</div>
          </div>
          <div className="card c4">
            <div className="sico">⏳</div>
            <div className="clabel">Pending</div>
            <div className="sval" style={{ color: 'var(--amber)' }}>${pending.toFixed(2)}</div>
            <div className="ssub">{incomes.filter(i => i.status === 'Pending').length} sources pending</div>
          </div>
        </div>

        <div className="grid" style={{ gridTemplateColumns: '1fr 340px', gap: '12px' }}>
          {/* Income list */}
          <div className="card">
            <div className="ctitle">
              Income Records
            </div>
            <div className="tbl-head" style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 80px' }}>
              <span>Source</span><span>Category</span><span>Date</span><span>Amount</span><span>Status</span>
            </div>
            
            {loading ? <div style={{padding:"20px"}}>Loading...</div> : incomes.map(inc => (
              <div key={inc.id} className="tbl-row" style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 80px' }}>
                <div className="tbl-cell" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: inc.status === 'Received' ? 'var(--g)' : 'var(--amber)', boxShadow: inc.status === 'Received' ? '0 0 4px var(--g)' : 'none', flexShrink: 0, display: 'inline-block' }}></span> 
                  {inc.sourceName}
                </div>
                <div className="tbl-cell muted mono">{inc.category}</div>
                <div className="tbl-cell muted mono">{inc.date}</div>
                <div className="tbl-cell mono" style={{ color: inc.status === 'Received' ? 'var(--g)' : 'var(--amber)' }}>${inc.amount.toFixed(2)}</div>
                <div className="tbl-cell">
                  <span className={`sbadge ${inc.status === 'Received' ? 'g' : 'a'}`}>{inc.status}</span>
                </div>
              </div>
            ))}

            {incomes.length === 0 && !loading && (
              <div style={{padding:"20px", textAlign:"center", color:"var(--muted)", fontSize:"12px"}}>No income records found.</div>
            )}
          </div>

          {/* Add income form */}
          <div className="card">
            <div className="ctitle">Record Income</div>
            <div className="field">
              <div className="flabel">Source Name</div>
              <input className="finput" placeholder="e.g. Monthly Salary" type="text" value={sourceName} onChange={e => setSourceName(e.target.value)} />
            </div>
            <div className="field">
              <div className="flabel">Category</div>
              <select className="fselect" value={category} onChange={e => setCategory(e.target.value)}>
                <option>Primary Job</option>
                <option>Freelance</option>
                <option>Bonus</option>
                <option>Investment</option>
                <option>Other</option>
              </select>
            </div>
            <div className="frow two">
              <div className="field">
                <div className="flabel">Amount</div>
                <input className="finput" placeholder="$0.00" type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} />
              </div>
              <div className="field">
                <div className="flabel">Date</div>
                <input className="finput" type="date" value={date} onChange={e => setDate(e.target.value)} />
              </div>
            </div>
            <div className="field">
              <div className="flabel">Status</div>
              <select className="fselect" value={status} onChange={e => setStatus(e.target.value)}>
                <option>Received</option>
                <option>Pending</option>
              </select>
            </div>
            <div className="field">
              <div className="flabel">Notes (optional)</div>
              <input className="finput" placeholder="Any additional notes..." type="text" value={notes} onChange={e => setNotes(e.target.value)} />
            </div>
            <button className="btn-pri" onClick={handleSave}>Save Income Record</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Income;
