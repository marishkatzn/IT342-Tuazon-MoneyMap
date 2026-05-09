import React, { useState, useEffect, useContext, useCallback } from 'react';
import Topbar from '../../components/Topbar';
import { AuthContext } from '../../context/AuthContext';
import { apiFetch } from '../../lib/api';

const getTodayDate = () => new Date().toISOString().split('T')[0];

const Income = () => {
  const { user } = useContext(AuthContext);

  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sourceName, setSourceName] = useState('PayMongo');
  const [category, setCategory] = useState('Savings Deposit');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(getTodayDate());
  const [notes, setNotes] = useState('');
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const fetchIncomes = useCallback(async () => {
    if (!user?.id) {
      setIncomes([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await apiFetch(`/income/${user.id}?t=${Date.now()}`, {
        cache: 'no-store'
      });
      if (res.ok) {
        const data = await res.json();
        setIncomes(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchIncomes();

    const handleRefresh = () => {
      fetchIncomes();
    };

    window.addEventListener('sidebar-refresh', handleRefresh);
    window.addEventListener('focus', handleRefresh);

    return () => {
      window.removeEventListener('sidebar-refresh', handleRefresh);
      window.removeEventListener('focus', handleRefresh);
    };
  }, [fetchIncomes]);

  const resetForm = () => {
    setSourceName('PayMongo');
    setCategory('Savings Deposit');
    setAmount('');
    setDate(getTodayDate());
    setNotes('');
    setCheckoutLoading(false);
  };

  const handleCreateIncomeCheckout = async () => {
    if (!user?.id) {
      alert('Please log in again.');
      return;
    }

    try {
      setCheckoutLoading(true);
      const res = await apiFetch('/income/create-checkout', {
        method: 'POST',
        body: {
          userId: user.id,
          sourceName,
          category,
          amount: parseFloat(amount),
          date: date || undefined,
          notes
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
        throw new Error(payload.message || 'Unable to create income checkout session.');
      }

      window.location.href = payload.checkoutUrl;
      resetForm();
    } catch (e) {
      alert(e.message || 'Unable to create income checkout session.');
      setCheckoutLoading(false);
    }
  };

  const handleSave = async () => {
    if (!amount) {
      return;
    }

    await handleCreateIncomeCheckout();
  };

  const handleIncomeRowClick = (income) => {
    if (income.status !== 'Pending' || !income.checkoutUrl) {
      return;
    }

    window.location.href = income.checkoutUrl;
  };

  const totalThisMonth = incomes.reduce((acc, curr) => acc + Number(curr.amount), 0);
  const pending = incomes.filter((income) => income.status === 'Pending').reduce((acc, curr) => acc + Number(curr.amount), 0);
  const received = incomes.filter((income) => income.status === 'Received').reduce((acc, curr) => acc + Number(curr.amount), 0);

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
            <div className="sico">$</div>
            <div className="clabel">Total Income</div>
            <div className="sval" style={{ color: 'var(--g)' }}>${totalThisMonth.toFixed(2)}</div>
            <div className="ssub">{incomes.length} PayMongo records</div>
          </div>
          <div className="card c4">
            <div className="sico">+</div>
            <div className="clabel">Received</div>
            <div className="sval">${received.toFixed(2)}</div>
            <div className="ssub">Available for savings</div>
          </div>
          <div className="card c4">
            <div className="sico">...</div>
            <div className="clabel">Pending</div>
            <div className="sval" style={{ color: 'var(--amber)' }}>${pending.toFixed(2)}</div>
            <div className="ssub">{incomes.filter((income) => income.status === 'Pending').length} sources pending</div>
          </div>
        </div>

        <div className="grid" style={{ gridTemplateColumns: '1fr 340px', gap: '12px' }}>
          <div className="card">
            <div className="ctitle">
              Income Records
            </div>
            <div className="tbl-head" style={{ gridTemplateColumns: '1fr 2fr 1fr 1fr 120px' }}>
              <span>Income Type</span><span>Provider</span><span>Date</span><span>Amount</span><span>Status</span>
            </div>

            {loading ? <div style={{ padding: '20px' }}>Loading...</div> : incomes.map((income) => (
              <div
                key={income.id}
                className="tbl-row"
                style={{
                  gridTemplateColumns: '1fr 2fr 1fr 1fr 120px',
                  cursor: income.status === 'Pending' && income.checkoutUrl ? 'pointer' : 'default'
                }}
                onClick={() => handleIncomeRowClick(income)}
                title={income.status === 'Pending' && income.checkoutUrl ? 'Click to retry this transaction' : undefined}
              >
                <div className="tbl-cell" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: income.status === 'Received' ? 'var(--g)' : 'var(--amber)', boxShadow: income.status === 'Received' ? '0 0 4px var(--g)' : 'none', flexShrink: 0, display: 'inline-block' }}></span>
                  {income.category}
                </div>
                <div className="tbl-cell muted mono">
                  {income.sourceName || 'PayMongo'}
                </div>
                <div className="tbl-cell muted mono">{income.date}</div>
                <div className="tbl-cell mono" style={{ color: income.status === 'Received' ? 'var(--g)' : 'var(--amber)' }}>${Number(income.amount).toFixed(2)}</div>
                <div className="tbl-cell">
                  <span className={`sbadge ${income.status === 'Received' ? 'g' : 'a'}`}>{income.status}</span>
                </div>
              </div>
            ))}

            {incomes.length === 0 && !loading && (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--muted)', fontSize: '12px' }}>No income records found.</div>
            )}
          </div>

          <div className="card">
            <div className="ctitle">Record Income</div>
            <div className="field">
              <div className="flabel">Category</div>
              <select className="fselect" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option>Allowance</option>
                <option>Salary</option>
                <option>Extra Money</option>
              </select>
            </div>
            <div className="field">
              <div className="flabel">Provider</div>
              <input className="finput" type="text" value={sourceName} readOnly />
            </div>
            <div className="frow two">
              <div className="field">
                <div className="flabel">Amount</div>
                <input className="finput" placeholder="$0.00" type="number" step="1" min="1" value={amount} onChange={(e) => setAmount(e.target.value)} />
              </div>
              <div className="field">
                <div className="flabel">Date</div>
                <input className="finput" type="date" value={date} readOnly disabled />
              </div>
            </div>
            <div style={{ marginTop: '-2px', marginBottom: '12px', fontFamily: "'DM Mono', monospace", fontSize: '9px', color: 'var(--muted)' }}>
              New income records are saved automatically after PayMongo verification.
            </div>
            <div className="field" style={{ marginBottom: '16px' }}>
              <div className="flabel">Notes (optional)</div>
              <input className="finput" placeholder="Any additional notes..." type="text" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
            <button className="btn-pri" onClick={handleSave} disabled={checkoutLoading}>
              {checkoutLoading ? 'Redirecting to checkout...' : 'Record Income with PayMongo'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Income;
