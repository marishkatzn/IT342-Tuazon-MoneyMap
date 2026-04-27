import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { apiFetch } from '../lib/api';

const Success = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('Confirming your payment...');

  useEffect(() => {
    const flow = searchParams.get('flow') || 'contribution';
    const paymentId = searchParams.get('paymentId');
    const incomeId = searchParams.get('incomeId');

    const config = flow === 'income'
      ? {
          id: incomeId,
          endpoint: '/income/success',
          body: { incomeId: Number(incomeId) }
        }
      : {
          id: paymentId,
          endpoint: '/payments/success',
          body: { paymentId: Number(paymentId) }
        };

    if (!config.id) {
      setStatus('error');
      setMessage('Missing payment reference.');
      return;
    }

    const confirmPayment = async () => {
      try {
        const response = await apiFetch(config.endpoint, {
          method: 'POST',
          body: config.body
        });

        const raw = await response.text();
        let payload = {};
        try {
          payload = raw ? JSON.parse(raw) : {};
        } catch {
          payload = { message: raw };
        }

        if (!response.ok) {
          throw new Error(payload.message || 'Payment confirmation failed.');
        }

        if (payload.status === 'SUCCESS' || payload.status === 'Received') {
          window.dispatchEvent(new Event('sidebar-refresh'));
          setStatus('success');
          setMessage(payload.message || 'Payment confirmed successfully.');
          return;
        }

        setStatus('pending');
        setMessage(payload.message || 'Payment is still pending.');
      } catch (error) {
        setStatus('error');
        setMessage(error.message || 'Unable to confirm payment.');
      }
    };

    confirmPayment();
  }, [searchParams]);

  const flow = searchParams.get('flow') || 'contribution';
  const title = status === 'success'
    ? flow === 'income' ? 'Income Successful' : 'Payment Successful'
    : status === 'pending'
      ? 'Payment Pending'
      : status === 'error'
        ? 'Payment Error'
        : 'Checking Payment';

  const backRoute = flow === 'income' ? '/income' : '/contributions';
  const backLabel = flow === 'income' ? 'Back to Income' : 'Back to Contributions';

  const accent = status === 'success'
    ? 'linear-gradient(135deg, #4ade80, #22c55e)'
    : status === 'pending'
      ? 'linear-gradient(135deg, #fbbf24, #f59e0b)'
      : status === 'error'
        ? 'linear-gradient(135deg, #f87171, #ef4444)'
        : 'linear-gradient(135deg, #60a5fa, #22c55e)';

  const badgeLabel = status === 'success'
    ? 'Confirmed'
    : status === 'pending'
      ? 'Awaiting Finalization'
      : status === 'error'
        ? 'Needs Attention'
        : 'Verifying';

  const icon = status === 'success'
    ? 'OK'
    : status === 'pending'
      ? '...'
      : status === 'error'
        ? '!'
        : '?';

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: '24px',
        background: `
          radial-gradient(circle at 20% 80%, rgba(34,197,94,.14), transparent 30%),
          radial-gradient(circle at 80% 18%, rgba(74,222,128,.12), transparent 28%),
          linear-gradient(180deg, #07110c 0%, #040a08 100%)
        `
      }}
    >
      <div
        style={{
          width: 'min(620px, 94vw)',
          borderRadius: '28px',
          overflow: 'hidden',
          border: '1px solid rgba(74,222,128,.12)',
          background: 'linear-gradient(180deg, rgba(12,30,20,.96) 0%, rgba(7,17,12,.98) 100%)',
          boxShadow: '0 30px 90px rgba(0,0,0,.45)'
        }}
      >
        <div
          style={{
            padding: '28px 30px 22px',
            borderBottom: '1px solid rgba(255,255,255,.05)',
            background: 'radial-gradient(circle at top left, rgba(74,222,128,.18), transparent 45%)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '22px',
                display: 'grid',
                placeItems: 'center',
                background: accent,
                color: '#04120a',
                fontSize: '24px',
                fontWeight: 800,
                boxShadow: '0 18px 40px rgba(0,0,0,.28)'
              }}
            >
              {icon}
            </div>

            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '5px 10px',
                  borderRadius: '999px',
                  background: 'rgba(255,255,255,.05)',
                  border: '1px solid rgba(255,255,255,.07)',
                  fontFamily: "'DM Mono', monospace",
                  fontSize: '10px',
                  color: '#9fd9b6',
                  marginBottom: '12px'
                }}
              >
                {badgeLabel}
              </div>
              <div style={{ fontSize: '34px', fontWeight: 800, letterSpacing: '-.04em', lineHeight: 1.05, marginBottom: '8px', color: '#f2fff6' }}>
                {title}
              </div>
              <p style={{ color: '#9bb8aa', fontSize: '15px', lineHeight: 1.7, maxWidth: '420px' }}>
                {message}
              </p>
            </div>
          </div>
        </div>

        <div style={{ padding: '24px 30px 30px' }}>
          <div style={{ marginBottom: '22px' }}>
            <div style={{ border: '1px solid rgba(255,255,255,.06)', borderRadius: '18px', padding: '14px 16px', background: 'rgba(14,34,23,.72)' }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '10px', color: '#6f8f7d', marginBottom: '6px' }}>Status</div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: status === 'error' ? '#fca5a5' : status === 'pending' ? '#fde68a' : '#86efac' }}>
                {badgeLabel}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link
              to={backRoute}
              style={{
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '190px',
                padding: '13px 18px',
                borderRadius: '14px',
                background: accent,
                color: '#04120a',
                fontWeight: 800,
                boxShadow: '0 16px 32px rgba(0,0,0,.22)'
              }}
            >
              {backLabel}
            </Link>
            <Link
              to="/dashboard"
              style={{
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '170px',
                padding: '13px 18px',
                borderRadius: '14px',
                border: '1px solid rgba(255,255,255,.08)',
                background: 'rgba(255,255,255,.03)',
                color: '#d8f6e2',
                fontWeight: 700
              }}
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Success;
