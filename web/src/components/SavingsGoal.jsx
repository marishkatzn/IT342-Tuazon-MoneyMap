import React, { useState, useEffect } from 'react';
import Card from './Card';
import Button from './Button';
import Input from './Input';
import savingsGoalShape from '../assets/savings-goal-shape.svg';

const SavingsGoal = () => {
    const [goals, setGoals] = useState(() => {
        const savedGoals = localStorage.getItem('savingsGoals');
        if (savedGoals) return JSON.parse(savedGoals);
        const oldGoal = localStorage.getItem('savingsGoal');
        if (oldGoal) {
            const parsed = JSON.parse(oldGoal);
            localStorage.removeItem('savingsGoal');
            return [parsed];
        }
        return [];
    });

    const [activeIndex, setActiveIndex] = useState(0);
    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState({ name: '', target: '' });
    const [addAmount, setAddAmount] = useState('');

    useEffect(() => {
        localStorage.setItem('savingsGoals', JSON.stringify(goals));
    }, [goals]);

    useEffect(() => {
        if (activeIndex >= goals.length && goals.length > 0) {
            setActiveIndex(goals.length - 1);
        }
    }, [goals.length, activeIndex]);

    const activeGoal = goals[activeIndex];

    const handleCreateGoal = (e) => {
        e.preventDefault();
        if (!formData.name || !formData.target) return;
        const newGoal = {
            id: Date.now(),
            name: formData.name,
            target: parseFloat(formData.target),
            current: 0
        };
        setGoals([...goals, newGoal]);
        setActiveIndex(goals.length);
        setIsAdding(false);
        setFormData({ name: '', target: '' });
    };

    const handleDeleteGoal = () => {
        if (window.confirm('Are you sure you want to delete this goal?')) {
            const newGoals = goals.filter((_, i) => i !== activeIndex);
            setGoals(newGoals);
        }
    };

    const handleAddSavings = (e) => {
        e.preventDefault();
        const amount = parseFloat(addAmount);
        if (isNaN(amount) || amount <= 0) return;
        const updatedGoals = [...goals];
        const goal = { ...updatedGoals[activeIndex] };
        goal.current = Math.min(goal.current + amount, goal.target);
        updatedGoals[activeIndex] = goal;
        setGoals(updatedGoals);
        setAddAmount('');
    };

    const progress = activeGoal ? Math.min((activeGoal.current / activeGoal.target) * 100, 100) : 0;

    return (
        <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
                <Card className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', border: '1px solid var(--glass-border)', background: 'rgba(255, 255, 255, 0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: 'var(--text-main)', margin: 0 }}>
                            {isAdding ? 'Create New Goal' : (goals.length > 0 ? `Goal ${activeIndex + 1} of ${goals.length}` : 'Dream Goal Tracker')}
                        </h3>
                        {!isAdding && goals.length > 0 && (
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <Button variant="ghost" size="sm" disabled={activeIndex === 0} onClick={() => setActiveIndex(i => i - 1)}>←</Button>
                                <Button variant="ghost" size="sm" disabled={activeIndex === goals.length - 1} onClick={() => setActiveIndex(i => i + 1)}>→</Button>
                                <Button variant="secondary" size="sm" onClick={() => setIsAdding(true)}>+</Button>
                            </div>
                        )}
                    </div>

                    {isAdding || goals.length === 0 ? (
                        <form onSubmit={handleCreateGoal} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <Input label="Saving for?" placeholder="e.g. New Laptop" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                            <Input label="Target ($)" type="number" placeholder="5000" value={formData.target} onChange={(e) => setFormData({ ...formData, target: e.target.value })} required />
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                                <Button type="submit" style={{ flex: 1, justifyContent: 'center' }}>Start</Button>
                                {goals.length > 0 && <Button variant="ghost" onClick={() => setIsAdding(false)} style={{ flex: 1, justifyContent: 'center' }}>Cancel</Button>}
                            </div>
                        </form>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <h4 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '0.25rem', letterSpacing: '-0.5px' }}>{activeGoal.name}</h4>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                                    <span style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary)' }}>${activeGoal.current.toLocaleString()}</span>
                                    <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>of ${activeGoal.target.toLocaleString()}</span>
                                </div>
                            </div>
                            <form onSubmit={handleAddSavings} style={{ display: 'flex', gap: '0.75rem', width: '100%', maxWidth: '400px', marginBottom: '1rem' }}>
                                <div style={{ flex: 1 }}>
                                    <Input placeholder="Amount..." type="number" value={addAmount} onChange={(e) => setAddAmount(e.target.value)} style={{ marginBottom: 0 }} />
                                </div>
                                <Button type="submit" variant="primary" size="lg" style={{ borderRadius: '14px' }}>Add</Button>
                            </form>
                            <Button variant="ghost" onClick={handleDeleteGoal} style={{ alignSelf: 'flex-start', color: '#ef4444', padding: 0, fontSize: '0.875rem' }}>Delete goal</Button>
                        </div>
                    )}
                </Card>
            </div>

            <div style={{ flex: '0 0 320px', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                {activeGoal && (
                    <div style={{ position: 'relative', width: '100%', height: '320px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ position: 'absolute', width: '220px', height: '220px', borderRadius: '50%', background: 'var(--gradient-sunset)', filter: 'blur(60px)', opacity: 0.1, zIndex: -1 }} />
                        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                            <div
                                style={{
                                    position: 'absolute',
                                    inset: 0,
                                    WebkitMaskImage: `url(${savingsGoalShape})`,
                                    maskImage: `url(${savingsGoalShape})`,
                                    WebkitMaskRepeat: 'no-repeat',
                                    maskRepeat: 'no-repeat',
                                    WebkitMaskPosition: 'center',
                                    maskPosition: 'center',
                                    WebkitMaskSize: 'contain',
                                    maskSize: 'contain',
                                    background: 'rgba(255,255,255,0.03)',
                                }}
                            />
                            <div
                                style={{
                                    position: 'absolute',
                                    inset: 0,
                                    WebkitMaskImage: `url(${savingsGoalShape})`,
                                    maskImage: `url(${savingsGoalShape})`,
                                    WebkitMaskRepeat: 'no-repeat',
                                    maskRepeat: 'no-repeat',
                                    WebkitMaskPosition: 'center',
                                    maskPosition: 'center',
                                    WebkitMaskSize: 'contain',
                                    maskSize: 'contain',
                                    background: `linear-gradient(to top, #22c55e 0%, #10b981 ${progress}%, transparent ${progress}%, transparent 100%)`,
                                    filter: 'drop-shadow(0 20px 40px rgba(34, 197, 94, 0.2))'
                                }}
                            />
                        </div>
                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '3rem', fontWeight: '900', color: progress > 50 ? 'white' : 'var(--text-main)', textShadow: progress > 50 ? '0 4px 20px rgba(0,0,0,0.2)' : 'none' }}>{Math.round(progress)}%</div>
                        <div style={{ marginTop: '0.5rem', padding: '6px 16px', background: 'white', color: 'var(--primary)', borderRadius: '20px', fontWeight: '800', fontSize: '0.75rem', textTransform: 'uppercase' }}>Progress</div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SavingsGoal;
