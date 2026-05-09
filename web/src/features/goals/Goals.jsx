import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Topbar from '../../components/Topbar';
import { AuthContext } from '../../context/AuthContext';
import { apiFetch } from '../../lib/api';

const DEFAULT_GOAL_ICON = '\uD83C\uDFAF';
const GOAL_ICON_OPTIONS = ['🎯', '💰', '🏠', '🚗', '✈️', '💻', '📚', '🎓', '🛍️', '❤️', '🎉', '📱'];
const GOAL_ICON_LABELS = {
  '🎯': 'Target',
  '💰': 'Money',
  '🏠': 'Home',
  '🚗': 'Car',
  '✈️': 'Travel',
  '💻': 'Laptop',
  '📚': 'Books',
  '🎓': 'Education',
  '🛍️': 'Shopping',
  '❤️': 'Health',
  '🎉': 'Celebration',
  '📱': 'Phone'
};

const Goals = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState(null);
  const [icon, setIcon] = useState(DEFAULT_GOAL_ICON);
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');

  useEffect(() => {
    const fetchGoals = async () => {
      if (!user?.id) {
        return;
      }

      try {
        const res = await apiFetch(`/goals/${user.id}`);
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

  const resetForm = () => {
    setIsGoalModalOpen(false);
    setEditingGoalId(null);
    setIcon(DEFAULT_GOAL_ICON);
    setName('');
    setTargetAmount('');
    setTargetDate('');
  };

  const handleOpenCreateGoal = () => {
    resetForm();
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  const handleSaveGoal = async () => {
    if (!name || !targetAmount) return;

    try {
      const existingGoal = goals.find((goal) => goal.id === editingGoalId);
      const res = await apiFetch(`/goals${editingGoalId ? `/${editingGoalId}` : ''}`, {
        method: editingGoalId ? 'PUT' : 'POST',
        body: {
          id: editingGoalId,
          userId: user.id,
          name,
          icon,
          targetAmount: parseFloat(targetAmount),
          targetDate: targetDate || undefined,
          currentAmount: existingGoal?.currentAmount ?? 0,
          allocationPercentage: existingGoal?.allocationPercentage ?? 0
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
        throw new Error(payload.message || 'Unable to save goal.');
      }

      setGoals((currentGoals) => (
        editingGoalId
          ? currentGoals.map((goal) => (goal.id === editingGoalId ? payload : goal))
          : [...currentGoals, payload]
      ));
      window.dispatchEvent(new Event('sidebar-refresh'));
      resetForm();
    } catch (e) {
      console.error(e);
      alert(e.message || 'Unable to save goal.');
    }
  };

  const handleEditGoal = (goal) => {
    setEditingGoalId(goal.id);
    setIcon(goal.icon || DEFAULT_GOAL_ICON);
    setName(goal.name);
    setTargetAmount(goal.targetAmount);
    setTargetDate(goal.targetDate || '');
    setIsGoalModalOpen(true);
  };

  const handleDeleteGoal = async (goalId) => {
    if (!window.confirm('Delete this goal? Related contributions will also be removed.')) {
      return;
    }

    try {
      const res = await apiFetch(`/goals/${goalId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setGoals((currentGoals) => currentGoals.filter((goal) => goal.id !== goalId));
        window.dispatchEvent(new Event('sidebar-refresh'));
        if (editingGoalId === goalId) {
          resetForm();
        }
        return;
      }

      const raw = await res.text();
      let payload = {};
      try {
        payload = raw ? JSON.parse(raw) : {};
      } catch {
        payload = { message: raw };
      }

      alert(payload.message || 'Unable to delete goal.');
    } catch (e) {
      console.error(e);
      alert(e.message || 'Unable to delete goal.');
    }
  };

  const totalTarget = goals.reduce((acc, curr) => acc + Number(curr.targetAmount), 0);
  const totalSaved = goals.reduce((acc, curr) => acc + Number(curr.currentAmount), 0);
  const overallPercentage = totalTarget > 0 ? ((totalSaved / totalTarget) * 100).toFixed(0) : 0;
  const activeCount = goals.length;
  const nearCompletion = goals.filter((goal) => (goal.currentAmount / goal.targetAmount) > 0.8 && goal.currentAmount < goal.targetAmount).length;

  return (
    <>
      <Topbar
        title="Savings Goals"
        subtitle="Create and track your financial targets"
        rightContent={<div className="tb-btn g" onClick={handleOpenCreateGoal}>+ New Goal</div>}
      />
      <div className="scroll">
        <div className="grid g12" style={{ marginBottom: '12px' }}>
          <div className="card c4 hl">
            <div className="clabel">Active Goals</div>
            <div className="sval">{activeCount}</div>
            <div className="ssub">{nearCompletion} near completion</div>
          </div>
          <div className="card c4">
            <div className="clabel">Total Target</div>
            <div className="sval">${totalTarget.toLocaleString()}</div>
            <div className="ssub">Across all goals</div>
          </div>
          <div className="card c4">
            <div className="clabel">Total Saved</div>
            <div className="sval" style={{ color: 'var(--g)' }}>${totalSaved.toLocaleString()}</div>
            <div className="ssub" style={{ display: 'flex', gap: '5px' }}>
              <span className="chip up">{overallPercentage}% overall</span>
            </div>
          </div>
        </div>

        <div className="grid" style={{ gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '12px' }}>
          {loading ? <div style={{ gridColumn: 'span 3', padding: '20px' }}>Loading goals...</div> : goals.map((goal) => {
            const pct = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount * 100) : 0;
            const isComplete = pct >= 100;
            const isBehind = false;
            const remainingAmount = Math.max(Number(goal.targetAmount) - Number(goal.currentAmount), 0);

            return (
              <div key={goal.id} className="card" style={{ borderColor: isComplete ? 'rgba(74,222,128,.25)' : 'var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ fontSize: '28px' }} title={GOAL_ICON_LABELS[goal.icon] || 'Goal icon'}>
                    {goal.icon}
                  </div>
                  <span className={`sbadge ${isComplete ? 'g' : (isBehind ? 'a' : 'b')}`}>
                    {isComplete ? 'Complete' : 'In Progress'}
                  </span>
                </div>
                <div style={{ fontSize: '15px', fontWeight: '700', marginBottom: '3px' }}>{goal.name}</div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '9px', color: 'var(--muted)', marginBottom: '12px' }}>
                  Target: ${Number(goal.targetAmount).toLocaleString()} - {goal.targetDate ? `Due ${goal.targetDate}` : 'No Due Date'}
                </div>
                <div style={{ fontSize: '22px', fontWeight: '800', letterSpacing: '-1px', marginBottom: '4px' }}>${Number(goal.currentAmount).toLocaleString()}</div>
                <div className="gpbar" style={{ marginBottom: '5px' }}>
                  <div className="gpfill" style={{ width: `${Math.min(pct, 100)}%`, background: isComplete ? 'var(--g)' : 'var(--blue)', boxShadow: isComplete ? '0 0 5px var(--gglow)' : 'none' }}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'DM Mono', monospace", fontSize: '9px', color: 'var(--muted)' }}>
                  <span style={{ color: isComplete ? 'var(--g)' : 'var(--blue)' }}>{pct.toFixed(0)}% complete</span>
                  <span>${remainingAmount.toLocaleString()} remaining</span>
                </div>
                <div className="div"></div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    className="btn-pri"
                    style={{ flex: 1, padding: '7px', fontSize: '11px', opacity: isComplete ? 0.5 : 1 }}
                    onClick={() => navigate('/contributions')}
                    disabled={isComplete}
                    title={isComplete ? 'This goal is already complete.' : `You can still add $${remainingAmount.toLocaleString()}`}
                  >
                    {isComplete ? 'Goal Complete' : 'Contribute'}
                  </button>
                  <button className="btn-ghost" style={{ flex: 1, padding: '7px', fontSize: '10px' }} onClick={() => handleEditGoal(goal)}>
                    Edit
                  </button>
                </div>
              </div>
            );
          })}

          {goals.length === 0 && !loading && (
            <div style={{ gridColumn: 'span 3', padding: '20px', color: 'var(--muted)', textAlign: 'center', fontSize: '12px' }}>No active goals found. Start by creating one below.</div>
          )}
        </div>

        <div className="card">
          <div className="ctitle">Create New Goal</div>
          <div className="frow" style={{ gridTemplateColumns: '80px 1fr 1fr 1fr 1fr', gap: '10px', alignItems: 'end' }}>
            <div className="field" style={{ margin: 0 }}>
              <div className="flabel">Icon</div>
              <select className="fselect" value={icon} onChange={(e) => setIcon(e.target.value)} style={{ textAlign: 'center', fontSize: '18px', padding: '10px 8px' }} title={GOAL_ICON_LABELS[icon] || 'Goal icon'}>
                {GOAL_ICON_OPTIONS.map((iconOption) => (
                  <option key={iconOption} value={iconOption}>{iconOption}</option>
                ))}
              </select>
            </div>
            <div className="field" style={{ margin: 0 }}>
              <div className="flabel">Goal Name</div>
              <input className="finput" placeholder="e.g. Emergency Fund" type="text" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="field" style={{ margin: 0 }}>
              <div className="flabel">Target Amount</div>
              <input className="finput" placeholder="$0.00" type="number" step="0.01" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} />
            </div>
            <div className="field" style={{ margin: 0 }}>
              <div className="flabel">Target Date</div>
              <input className="finput" type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
            </div>
            <button className="btn-pri" style={{ margin: 0, padding: '8px' }} onClick={handleSaveGoal}>
              Add Goal
            </button>
          </div>
        </div>
      </div>

      {isGoalModalOpen && editingGoalId && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            background: 'rgba(3, 10, 10, 0.72)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)'
          }}
          onClick={resetForm}
        >
          <div
            className="card"
            style={{
              width: 'min(760px, 100%)',
              margin: 0,
              padding: '18px',
              borderColor: editingGoalId ? 'rgba(34,197,94,.32)' : 'var(--border)',
              boxShadow: '0 24px 60px rgba(0,0,0,.45)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '14px' }}>
              <div>
                <div className="ctitle" style={{ marginBottom: '4px' }}>{editingGoalId ? 'Edit Goal' : 'Create New Goal'}</div>
                <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                  {editingGoalId ? 'Update the goal details or remove it here.' : 'Set up a new savings target.'}
                </div>
              </div>
              <button className="btn-ghost" style={{ padding: '8px 12px' }} onClick={resetForm}>Close</button>
            </div>

            <div className="frow" style={{ gridTemplateColumns: '80px 1fr 1fr', gap: '10px' }}>
              <div className="field" style={{ margin: 0 }}>
                <div className="flabel">Icon</div>
                <select className="fselect" value={icon} onChange={(e) => setIcon(e.target.value)} style={{ textAlign: 'center', fontSize: '18px', padding: '10px 8px' }} title={GOAL_ICON_LABELS[icon] || 'Goal icon'}>
                  {GOAL_ICON_OPTIONS.map((iconOption) => (
                    <option key={iconOption} value={iconOption}>{iconOption}</option>
                  ))}
                </select>
              </div>
              <div className="field" style={{ margin: 0 }}>
                <div className="flabel">Goal Name</div>
                <input className="finput" placeholder="e.g. Emergency Fund" type="text" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="field" style={{ margin: 0 }}>
                <div className="flabel">Target Amount</div>
                <input className="finput" placeholder="$0.00" type="number" step="0.01" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} />
              </div>
              <div className="field" style={{ margin: 0, gridColumn: 'span 3' }}>
                <div className="flabel">Target Date</div>
                <input className="finput" type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
              </div>
            </div>

            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              {editingGoalId ? (
                <button
                  className="btn-ghost"
                  style={{ padding: '8px 12px', color: 'var(--red)' }}
                  onClick={() => handleDeleteGoal(editingGoalId)}
                >
                  Delete Goal
                </button>
              ) : (
                <div />
              )}
              <div style={{ display: 'flex', gap: '10px', marginLeft: 'auto' }}>
                <button className="btn-ghost" style={{ padding: '8px 12px' }} onClick={resetForm}>
                  Cancel
                </button>
                <button className="btn-pri" style={{ margin: 0, padding: '8px 14px' }} onClick={handleSaveGoal}>
                  {editingGoalId ? 'Update Goal' : 'Add Goal'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Goals;
