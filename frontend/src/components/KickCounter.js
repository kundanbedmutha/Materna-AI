import React, { useState, useEffect, useCallback } from 'react';
import './KickCounter.css';

const STORAGE_KEY = 'materna_kicks';
const GOAL = 10;

function todayKey() {
  return new Date().toISOString().split('T')[0];
}

function loadData() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { return {}; }
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function fmt(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function fmtDate(key) {
  return new Date(key).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
}

export default function KickCounter({ ctx }) {
  const [data, setData]     = useState(loadData);
  const [session, setSession] = useState(null); // { start, kicks: [] }
  const [flash, setFlash]   = useState(false);

  const today = todayKey();
  const todayKicks = data[today]?.kicks || [];
  const sessions   = data[today]?.sessions || [];
  const week       = ctx.gestational_week;

  const startSession = () => {
    setSession({ start: Date.now(), kicks: [] });
  };

  const recordKick = useCallback(() => {
    if (!session) return;
    setFlash(true);
    setTimeout(() => setFlash(false), 300);
    setSession(prev => ({ ...prev, kicks: [...prev.kicks, Date.now()] }));
  }, [session]);

  const endSession = useCallback(() => {
    if (!session) return;
    const dur = Math.round((Date.now() - session.start) / 60000);
    const count = session.kicks.length;
    const newSession = {
      start: session.start,
      end: Date.now(),
      count,
      duration: dur,
      goalMet: count >= GOAL,
    };
    setData(prev => {
      const updated = {
        ...prev,
        [today]: {
          kicks: [...(prev[today]?.kicks || []), ...session.kicks],
          sessions: [...(prev[today]?.sessions || []), newSession],
        }
      };
      saveData(updated);
      return updated;
    });
    setSession(null);
  }, [session, today]);

  // Keyboard shortcut
  useEffect(() => {
    const handler = (e) => { if (e.code === 'Space' && session) { e.preventDefault(); recordKick(); } };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [session, recordKick]);

  const currentCount = session ? session.kicks.length : 0;
  const elapsed = session ? Math.round((Date.now() - session.start) / 1000) : 0;
  const totalToday = todayKicks.length;
  const goalMet = totalToday >= GOAL;

  // Past 7 days
  const past7 = [...Array(7)].map((_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().split('T')[0];
    return { key, label: d.toLocaleDateString('en-IN', { weekday: 'short' }), count: (data[key]?.kicks || []).length };
  });
  const maxCount = Math.max(...past7.map(d => d.count), GOAL, 1);

  return (
    <div className="kick-page">
      <div className="kick-header">
        <div className="kick-header-icon">👶</div>
        <div>
          <h1 className="kick-title">Kick Counter</h1>
          <p className="kick-sub">Cardiff method · Goal: {GOAL} kicks per session · Week {week || '—'}</p>
        </div>
      </div>

      {week && week < 28 && (
        <div className="kick-info-banner">
          Kick counting is most meaningful from week 28. You're at week {week} — you may start feeling movement soon!
        </div>
      )}

      {/* Main counter */}
      <div className="kick-counter-card">
        {!session ? (
          <div className="kick-idle">
            <div className="kick-today-count">
              <span className="kick-big-num">{totalToday}</span>
              <span className="kick-big-label">kicks today</span>
            </div>
            {goalMet && (
              <div className="kick-goal-badge">🎉 Daily goal reached!</div>
            )}
            <button className="kick-start-btn" onClick={startSession}>
              Start counting session
            </button>
            <p className="kick-hint">Press the button or tap Space bar to record each kick</p>
          </div>
        ) : (
          <div className="kick-active">
            <div className="kick-session-header">
              <span className="kick-session-label">Session in progress</span>
              <ElapsedTimer start={session.start} />
            </div>

            <button
              className={`kick-btn ${flash ? 'flash' : ''} ${currentCount >= GOAL ? 'goal-met' : ''}`}
              onClick={recordKick}
            >
              <div className="kick-btn-inner">
                <span className="kick-btn-num">{currentCount}</span>
                <span className="kick-btn-label">{currentCount === 1 ? 'kick' : 'kicks'}</span>
              </div>
              <div className="kick-ripple" />
            </button>

            {currentCount >= GOAL && (
              <div className="kick-goal-met-msg">
                🎉 Goal reached in {Math.round((Date.now() - session.start) / 60000)} minutes!
              </div>
            )}

            <div className="kick-dots">
              {[...Array(GOAL)].map((_, i) => (
                <div key={i} className={`kick-dot ${i < currentCount ? 'filled' : ''}`} />
              ))}
            </div>

            <button className="kick-end-btn" onClick={endSession}>
              End session
            </button>
          </div>
        )}
      </div>

      {/* 7-day chart */}
      <div className="kick-section">
        <h2 className="kick-section-title">Last 7 days</h2>
        <div className="kick-chart">
          {past7.map((d, i) => {
            const pct = (d.count / maxCount) * 100;
            const goalLine = (GOAL / maxCount) * 100;
            const isToday = d.key === today;
            return (
              <div key={i} className="kick-bar-col">
                <div className="kick-bar-wrap">
                  <div className="kick-goal-line" style={{ bottom: `${goalLine}%` }} />
                  <div className={`kick-bar ${isToday ? 'today' : ''} ${d.count >= GOAL ? 'goal' : ''}`}
                    style={{ height: `${Math.max(pct, 3)}%` }} />
                </div>
                <div className="kick-bar-count">{d.count}</div>
                <div className={`kick-bar-label ${isToday ? 'today' : ''}`}>{d.label}</div>
              </div>
            );
          })}
        </div>
        <div className="kick-chart-legend">
          <span className="legend-dot goal" />
          <span>Goal ({GOAL})</span>
        </div>
      </div>

      {/* Today's sessions */}
      {sessions.length > 0 && (
        <div className="kick-section">
          <h2 className="kick-section-title">Today's sessions</h2>
          <div className="kick-sessions-list">
            {sessions.map((s, i) => (
              <div key={i} className={`kick-session-row ${s.goalMet ? 'met' : 'notmet'}`}>
                <div className="ks-left">
                  <span className="ks-icon">{s.goalMet ? '✅' : '⏳'}</span>
                  <div>
                    <div className="ks-time">{fmt(s.start)} – {fmt(s.end)}</div>
                    <div className="ks-dur">{s.duration} min session</div>
                  </div>
                </div>
                <div className="ks-count">
                  <span className="ks-num">{s.count}</span>
                  <span className="ks-unit">kicks</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Clinical guidance */}
      <div className="kick-guidance">
        <h3 className="kick-guidance-title">Cardiff Method — What to know</h3>
        <div className="kick-guidance-grid">
          {[
            { icon: '📍', text: 'Count from week 28 onwards, once or twice daily' },
            { icon: '⏱', text: 'If you don\'t feel 10 kicks in 2 hours — call your OB' },
            { icon: '🛋', text: 'Lie on your left side in a quiet room for best results' },
            { icon: '📉', text: 'A sudden decrease in usual movement needs same-day review' },
            { icon: '🍬', text: 'Have a cold drink or snack — may stimulate baby movement' },
            { icon: '📋', text: 'Bring this log to every antenatal appointment' },
          ].map((g, i) => (
            <div key={i} className="kick-guidance-item">
              <span className="kick-guidance-icon">{g.icon}</span>
              <span>{g.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ElapsedTimer({ start }) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setElapsed(Math.round((Date.now() - start) / 1000)), 1000);
    return () => clearInterval(t);
  }, [start]);
  const m = Math.floor(elapsed / 60).toString().padStart(2, '0');
  const s = (elapsed % 60).toString().padStart(2, '0');
  return <span className="kick-timer">{m}:{s}</span>;
}
