import React, { useState, useEffect, useContext } from 'react';
import Topbar from '../../components/Topbar';
import { AuthContext } from '../../context/AuthContext';
import { apiFetch } from '../../lib/api';

const Contributions = () => {
  const { user } = useContext(AuthContext);

  const [contributions, setContributions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [goalId, setGoalId] = useState('');
  const [amount, setAmount] = useState('500.00');
  const [contributionSaving, setContributionSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) {
        return;
      }

      try {
        const [cRes, gRes, iRes] = await Promise.all([
          apiFetch(`/contributions/${user.id}`),
          apiFetch(`/goals/${user.id}`),
          apiFetch(`/income/${user.id}`)
        ]);

        const cData = cRes.ok ? await cRes.json() : [];
        const gData = gRes.ok ? await gRes.json() : [];
        const iData = iRes.ok ? await iRes.json() : [];

        setContributions(cData);
        setGoals(gData);
        setIncomes(iData);

        if (gData.length > 0) {
          setGoalId((currentGoalId) => currentGoalId || String(gData[0].id));
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const totalContributed = contributions.reduce((sum, contribution) => sum + Number(contribution.amount), 0);
  const allocationPool = incomes
    .filter((income) => income.status === 'Received')
    .reduce((sum, income) => sum + Number(income.amount || 0), 0);
  const remainingPool = allocationPool - totalContributed;

  const handleContribute = async () => {
    if (!user?.id) {
      alert('Please log in again.');
      return;
    }

    if (!goalId || !amount) {
      return;
    }

    const selectedGoal = goals.find((goal) => String(goal.id) === String(goalId));
    if (!selectedGoal) {
      alert('Please select a valid goal.');
      return;
    }

    const contributionAmount = Number(amount);
    const remainingGoalAmount = Math.max(Number(selectedGoal.targetAmount) - Number(selectedGoal.currentAmount), 0);

    if (!Number.isFinite(contributionAmount) || contributionAmount <= 0) {
      alert('Enter a valid amount greater than zero.');
      return;
    }

    if (remainingGoalAmount <= 0) {
      alert('This goal is already complete.');
      return;
    }

    if (contributionAmount > remainingGoalAmount) {
      alert(`Only $${remainingGoalAmount.toFixed(2)} remaining for this goal.`);
      return;
    }

    try {
      setContributionSaving(true);
      const res = await apiFetch('/contributions', {
        method: 'POST',
        body: {
          userId: user.id,
          goalId: Number(goalId),
          amount: contributionAmount,
          method: 'Savings Pool'
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
        throw new Error(payload.message || 'Unable to save contribution.');
      }

      setContributions((currentContributions) => [payload, ...currentContributions]);
      setGoals((currentGoals) => currentGoals.map((goal) => (
        goal.id === payload.goalId
          ? { ...goal, currentAmount: Number(goal.currentAmount) + Number(payload.amount) }
          : goal
      )));
      setAmount('500.00');
      window.dispatchEvent(new Event('sidebar-refresh'));
      alert('Contribution added successfully!');
    } catch (error) {
      console.error(error);
      alert(error.message || 'Unable to save contribution.');
    } finally {
      setContributionSaving(false);
    }
  };

  const sortedContributions = [...contributions].sort((a, b) => b.id - a.id);
  const lastContribution = sortedContributions.length > 0 ? sortedContributions[0] : null;
  const selectedGoal = goals.find((goal) => String(goal.id) === String(goalId));
  const remainingAmount = selectedGoal
    ? Math.max(Number(selectedGoal.targetAmount) - Number(selectedGoal.currentAmount), 0)
    : 0;
  const parsedAmount = Number(amount);
  const isAmountInvalid = !Number.isFinite(parsedAmount) || parsedAmount <= 0;
  const exceedsRemaining = selectedGoal && parsedAmount > remainingAmount;
  const isGoalComplete = selectedGoal && remainingAmount <= 0;
  const isContributionDisabled = goals.length === 0 || contributionSaving || !selectedGoal || isAmountInvalid || isGoalComplete || exceedsRemaining;

  return (
    <>
      <Topbar
        title="Contributions"
        subtitle="Add contributions and keep track of your savings progress"
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
                <div className="clabel">Available Pool</div>
                <div className="sval" style={{ color: 'var(--blue)' }}>${allocationPool.toFixed(2)}</div>
                <div className="ssub">Received savings income</div>
              </div>
              <div className="card c4">
                <div className="clabel">Remaining Pool</div>
                <div className="sval" style={{ color: remainingPool < 0 ? 'var(--red)' : 'var(--amber)' }}>
                  ${remainingPool.toFixed(2)}
                </div>
                <div className="ssub">Available after contributions</div>
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="card">
              <div className="ctitle">Add Contribution</div>
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

              <button className="btn-pri" onClick={handleContribute} disabled={isContributionDisabled}>
                {goals.length === 0
                  ? 'Create a goal first'
                  : contributionSaving
                    ? 'Saving contribution...'
                    : isGoalComplete
                      ? 'Goal already complete'
                      : exceedsRemaining
                        ? 'Amount exceeds remaining goal'
                        : 'Add Contribution'}
              </button>
              <div style={{ marginTop: '12px', padding: '12px', border: '1px solid var(--border)', borderRadius: '14px', background: 'rgba(255,255,255,0.02)' }}>
                <div className="clabel">Last Contribution</div>
                <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-main)', marginTop: '4px' }}>
                  {lastContribution ? `$${Number(lastContribution.amount).toFixed(2)}` : '--'}
                </div>
                <div className="ssub" style={{ marginTop: '4px' }}>
                  {lastContribution ? `${lastContribution.date} · ${lastContribution.goalName}` : 'No history yet'}
                </div>
              </div>
              <div style={{ textAlign: 'center', marginTop: '8px', fontFamily: "'DM Mono', monospace", fontSize: '9px', color: 'var(--dim)' }}>
                Contributions here are recorded directly from your savings pool.
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default Contributions;
