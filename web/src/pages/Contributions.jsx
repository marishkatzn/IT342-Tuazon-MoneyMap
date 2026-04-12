import React, { useState, useEffect, useContext } from 'react';
import Topbar from '../components/Topbar';
import { AuthContext } from '../context/AuthContext';

const Contributions = () => {
  const { user } = useContext(AuthContext);

  const [contributions, setContributions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [goalId, setGoalId] = useState('');
  const [amount, setAmount] = useState('500.00');
  const [paymentLoading, setPaymentLoading] = useState(false);

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

  const handlePayment = async (paymentAmount, selectedGoalId) => {
    if (!user?.id) {
      alert('Please log in again.');
      return;
    }

    try {
      setPaymentLoading(true);
      const res = await fetch('http://localhost:8081/api/payments/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user.id,
          goalId: Number(selectedGoalId),
          amount: Number(paymentAmount)
        })
      });

      const raw = await res.text();
      let payload = {};
      try {
        payload = raw ? JSON.parse(raw) : {};
      } catch {
        payload = { message: raw };
      }

      if (!res.ok) {
        throw new Error(payload.message || 'Unable to create checkout session.');
      }

      window.location.href = payload.checkoutUrl;
    } catch (error) {
      alert(error.message || 'Payment initialization failed.');
      setPaymentLoading(false);
    }
  };

  const handleContribute = async () => {
    if (!goalId || !amount) {
      return;
    }

    const selectedGoal = goals.find((goal) => String(goal.id) === String(goalId));
    if (!selectedGoal) {
      alert('Please select a valid goal.');
      return;
    }

    const paymentAmount = Number(amount);
    const remainingAmount = Math.max(Number(selectedGoal.targetAmount) - Number(selectedGoal.currentAmount), 0);

    if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) {
      alert('Enter a valid amount greater than zero.');
      return;
    }

    if (remainingAmount <= 0) {
      alert('This goal is already complete.');
      return;
    }

    if (paymentAmount > remainingAmount) {
      alert(`Only $${remainingAmount.toFixed(2)} remaining for this goal.`);
      return;
    }

    await handlePayment(amount, goalId);
  };

  const totalContributed = contributions.reduce((acc, curr) => acc + Number(curr.amount), 0);
  const sortedContributions = [...contributions].sort((a, b) => b.id - a.id);
  const lastContribution = sortedContributions.length > 0 ? sortedContributions[0] : null;
  const contributionWeeks = [...new Set(
    contributions
      .map((contribution) => {
        const date = new Date(contribution.date);
        if (Number.isNaN(date.getTime())) {
          return null;
        }

        const normalizedDate = new Date(date);
        normalizedDate.setHours(0, 0, 0, 0);
        normalizedDate.setDate(normalizedDate.getDate() - normalizedDate.getDay());
        return normalizedDate.toISOString().slice(0, 10);
      })
      .filter(Boolean)
  )].sort((a, b) => new Date(b) - new Date(a));

  let streakWeeks = 0;
  if (contributionWeeks.length > 0) {
    streakWeeks = 1;
    for (let index = 1; index < contributionWeeks.length; index += 1) {
      const previousWeek = new Date(contributionWeeks[index - 1]);
      const currentWeek = new Date(contributionWeeks[index]);
      const diffDays = Math.round((previousWeek - currentWeek) / (1000 * 60 * 60 * 24));

      if (diffDays === 7) {
        streakWeeks += 1;
      } else {
        break;
      }
    }
  }

  const streakChipLabel = streakWeeks > 0 ? 'Active streak' : 'Start contributing';
  const streakSummary = streakWeeks === 1 ? 'week' : 'weeks';
  const selectedGoal = goals.find((goal) => String(goal.id) === String(goalId));
  const remainingAmount = selectedGoal
    ? Math.max(Number(selectedGoal.targetAmount) - Number(selectedGoal.currentAmount), 0)
    : 0;
  const parsedAmount = Number(amount);
  const isAmountInvalid = !Number.isFinite(parsedAmount) || parsedAmount <= 0;
  const exceedsRemaining = selectedGoal && parsedAmount > remainingAmount;
  const isGoalComplete = selectedGoal && remainingAmount <= 0;
  const isCheckoutDisabled = goals.length === 0 || paymentLoading || !selectedGoal || isAmountInvalid || isGoalComplete || exceedsRemaining;

  return (
    <>
      <Topbar
        title="Contributions"
        subtitle="Record savings contributions via PayMongo Checkout"
        rightContent={<div className="supa">PayMongo Checkout · Live</div>}
      />
      <div className="scroll">
        <div className="grid" style={{ gridTemplateColumns: '1fr 340px', gap: '12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="grid g12">
              <div className="card c4 hl">
                <div className="clabel">Total Contributed</div>
                <div className="sval" style={{ color: 'var(--g)' }}>${totalContributed.toFixed(2)}</div>
                <div className="ssub">{contributions.length} transactions</div>
              </div>
              <div className="card c4">
                <div className="clabel">Last Contribution</div>
                <div className="sval" style={{ fontSize: '20px' }}>{lastContribution ? '$' + Number(lastContribution.amount).toFixed(2) : '--'}</div>
                <div className="ssub">{lastContribution ? `${lastContribution.date} · ${lastContribution.goalName}` : 'No history yet'}</div>
              </div>
              <div className="card c4">
                <div className="clabel">Streak</div>
                <div className="sval">{streakWeeks} <span style={{ fontSize: '14px', color: 'var(--muted)' }}>{streakSummary}</span></div>
                <div style={{ marginTop: '4px' }}>
                  <span className={`chip ${streakWeeks > 0 ? 'up' : 'nu'}`}>{streakChipLabel}</span>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="ctitle">Contribution History</div>
              <div className="tbl-head" style={{ gridTemplateColumns: '2fr 1.5fr 1fr 1fr 100px' }}>
                <span>Goal</span><span>Method</span><span>Date</span><span>Amount</span><span>Status</span>
              </div>

              {loading ? <div style={{ padding: '20px' }}>Loading history...</div> : sortedContributions.map((contribution) => (
                <div key={contribution.id} className="tbl-row" style={{ gridTemplateColumns: '2fr 1.5fr 1fr 1fr 100px' }}>
                  <div className="tbl-cell" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>{contribution.goalIcon} {contribution.goalName}</div>
                  <div className="tbl-cell muted mono">{contribution.method}</div>
                  <div className="tbl-cell muted mono">{contribution.date}</div>
                  <div className="tbl-cell mono" style={{ color: 'var(--g)' }}>+${Number(contribution.amount).toFixed(2)}</div>
                  <div className="tbl-cell"><span className="sbadge g">{contribution.status}</span></div>
                </div>
              ))}

              {contributions.length === 0 && !loading && <div style={{ padding: '20px', color: 'var(--muted)', textAlign: 'center', fontSize: '12px' }}>No contributions found.</div>}
            </div>
          </div>

          <div className="card">
            <div className="ctitle">Checkout Contribution</div>
            <div className="pay-amount-display">
              <div className="pad-prefix">Contributing</div>
              <div className="pad-val">${Number.isFinite(parsedAmount) ? parsedAmount.toFixed(2) : '0.00'}</div>
            </div>

            <div className="field">
              <div className="flabel">Destination Goal</div>
              <select className="fselect" value={goalId} onChange={(e) => setGoalId(e.target.value)}>
                {goals.map((goal) => (
                  <option key={goal.id} value={goal.id}>{goal.icon} {goal.name}</option>
                ))}
              </select>
            </div>

            <div className="field">
              <div className="flabel">Amount</div>
              <input className="finput" placeholder="$0.00" type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>

            {selectedGoal && (
              <div style={{ marginTop: '-4px', marginBottom: '12px', fontFamily: "'DM Mono', monospace", fontSize: '9px', color: exceedsRemaining || isGoalComplete ? 'var(--red)' : 'var(--muted)' }}>
                {isGoalComplete
                  ? 'This goal is already complete.'
                  : `Remaining for ${selectedGoal.name}: $${remainingAmount.toFixed(2)}`}
              </div>
            )}

            <div className="field">
              <div className="flabel">Available payment methods</div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span className="chip up">GCash</span>
                <span className="chip up">Card</span>
              </div>
            </div>

            <button className="btn-pri" onClick={handleContribute} disabled={isCheckoutDisabled}>
              {goals.length === 0
                ? 'Create a goal first'
                : paymentLoading
                  ? 'Redirecting to checkout...'
                  : isGoalComplete
                    ? 'Goal already complete'
                    : exceedsRemaining
                      ? 'Amount exceeds remaining goal'
                      : 'Proceed to PayMongo Checkout'}
            </button>
            <div style={{ textAlign: 'center', marginTop: '8px', fontFamily: "'DM Mono', monospace", fontSize: '9px', color: 'var(--dim)' }}>
              Secure redirect checkout powered by PayMongo
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Contributions;
