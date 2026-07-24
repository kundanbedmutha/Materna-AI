import React, { useState } from 'react';
import './DueDatePage.css';

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function fmt(date) {
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

function weeksFromNow(edd) {
  const now = new Date();
  const diff = edd - now;
  return Math.max(0, Math.round(diff / (7 * 24 * 3600 * 1000)));
}

function daysFromNow(edd) {
  const now = new Date();
  return Math.max(0, Math.round((edd - now) / (24 * 3600 * 1000)));
}

const TRIMESTER_EVENTS = [
  { label: 'First trimester ends', offset: 84,  color: '#7A9E87' },
  { label: 'Anatomy scan (typically)', offset: 140, color: '#D4924A' },
  { label: 'Second trimester ends', offset: 182, color: '#D4924A' },
  { label: 'Viability milestone', offset: 168, color: '#C9706A' },
  { label: 'Third trimester begins', offset: 183, color: '#C9706A' },
  { label: 'Full term begins', offset: 259, color: '#8B3E3A' },
  { label: 'Due date 🎉', offset: 280, color: '#C9706A' },
];

const STAR_SIGNS = [
  { sign: 'Aries',       emoji: '♈', start: [3,21], end: [4,19] },
  { sign: 'Taurus',      emoji: '♉', start: [4,20], end: [5,20] },
  { sign: 'Gemini',      emoji: '♊', start: [5,21], end: [6,20] },
  { sign: 'Cancer',      emoji: '♋', start: [6,21], end: [7,22] },
  { sign: 'Leo',         emoji: '♌', start: [7,23], end: [8,22] },
  { sign: 'Virgo',       emoji: '♍', start: [8,23], end: [9,22] },
  { sign: 'Libra',       emoji: '♎', start: [9,23], end: [10,22] },
  { sign: 'Scorpio',     emoji: '♏', start: [10,23], end: [11,21] },
  { sign: 'Sagittarius', emoji: '♐', start: [11,22], end: [12,21] },
  { sign: 'Capricorn',   emoji: '♑', start: [12,22], end: [1,19] },
  { sign: 'Aquarius',    emoji: '♒', start: [1,20],  end: [2,18] },
  { sign: 'Pisces',      emoji: '♓', start: [2,19],  end: [3,20] },
];

function getStarSign(date) {
  const m = date.getMonth() + 1, d = date.getDate();
  for (const s of STAR_SIGNS) {
    const [sm, sd] = s.start, [em, ed] = s.end;
    if (sm <= em) { if ((m === sm && d >= sd) || (m === em && d <= ed) || (m > sm && m < em)) return s; }
    else { if ((m === sm && d >= sd) || (m === em && d <= ed) || m > sm || m < em) return s; }
  }
  return STAR_SIGNS[0];
}

export default function DueDatePage({ ctx, onUpdateCtx }) {
  const [method, setMethod] = useState('lmp');
  const [lmp, setLmp]       = useState('');
  const [conception, setConception] = useState('');
  const [edd, setEdd]       = useState(null);
  const [lmpDate, setLmpDate] = useState(null);

  const calculate = () => {
    if (method === 'lmp' && lmp) {
      const base = new Date(lmp);
      const result = addDays(base, 280);
      setEdd(result); setLmpDate(base);
      const currentWeek = Math.floor((new Date() - base) / (7 * 24 * 3600 * 1000));
      if (currentWeek > 0 && currentWeek <= 42 && onUpdateCtx) {
        onUpdateCtx('gestational_week', currentWeek);
      }
    } else if (method === 'conception' && conception) {
      const base = new Date(conception);
      const lmpEst = addDays(base, -14);
      const result = addDays(base, 266);
      setEdd(result); setLmpDate(lmpEst);
      const currentWeek = Math.floor((new Date() - lmpEst) / (7 * 24 * 3600 * 1000));
      if (currentWeek > 0 && currentWeek <= 42 && onUpdateCtx) {
        onUpdateCtx('gestational_week', currentWeek);
      }
    }
  };

  const currentWeekCalc = lmpDate
    ? Math.min(42, Math.max(0, Math.floor((new Date() - lmpDate) / (7 * 24 * 3600 * 1000))))
    : null;

  const progressPct = currentWeekCalc ? Math.min(100, (currentWeekCalc / 40) * 100) : 0;
  const starSign = edd ? getStarSign(edd) : null;

  return (
    <div className="due-page">
      <div className="due-header">
        <div className="due-header-icon">📅</div>
        <div>
          <h1 className="due-title">Due Date Calculator</h1>
          <p className="due-sub">Calculate your estimated due date (EDD) using Naegele's Rule</p>
        </div>
      </div>

      {/* Method selector */}
      <div className="due-card">
        <div className="method-tabs">
          <button className={`method-tab ${method === 'lmp' ? 'active' : ''}`} onClick={() => setMethod('lmp')}>
            From last period (LMP)
          </button>
          <button className={`method-tab ${method === 'conception' ? 'active' : ''}`} onClick={() => setMethod('conception')}>
            From conception date
          </button>
        </div>

        {method === 'lmp' && (
          <div className="due-field">
            <label>First day of your last menstrual period</label>
            <input type="date" value={lmp} onChange={e => setLmp(e.target.value)}
              max={new Date().toISOString().split('T')[0]} />
          </div>
        )}
        {method === 'conception' && (
          <div className="due-field">
            <label>Estimated conception date</label>
            <input type="date" value={conception} onChange={e => setConception(e.target.value)}
              max={new Date().toISOString().split('T')[0]} />
          </div>
        )}

        <button className="due-calc-btn" onClick={calculate}
          disabled={method === 'lmp' ? !lmp : !conception}>
          Calculate my due date
        </button>
      </div>

      {/* Results */}
      {edd && (
        <>
          <div className="due-results">
            <div className="edd-hero">
              <div className="edd-label">Your estimated due date</div>
              <div className="edd-date">{fmt(edd)}</div>
              <div className="edd-countdown">
                {daysFromNow(edd) > 0
                  ? <><span className="edd-days">{daysFromNow(edd)}</span> days to go ({weeksFromNow(edd)} weeks)</>
                  : <span style={{ color: 'var(--rose)' }}>Your due date has passed — congratulations! 🎉</span>
                }
              </div>
              {starSign && (
                <div className="edd-starsign">
                  Your baby will be a <strong>{starSign.sign}</strong> {starSign.emoji}
                </div>
              )}
            </div>

            {/* Progress bar */}
            {currentWeekCalc !== null && (
              <div className="progress-section">
                <div className="progress-row">
                  <span>Week {currentWeekCalc}</span>
                  <span>{Math.round(progressPct)}% complete</span>
                </div>
                <div className="progress-outer">
                  <div className="progress-inner" style={{ width: `${progressPct}%` }}>
                    <div className="progress-baby">👶</div>
                  </div>
                </div>
                <div className="progress-labels-row">
                  <span>Week 0</span><span>T1</span><span>T2</span><span>T3</span><span>Week 40</span>
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="timeline-section">
              <h3 className="timeline-title">Key milestones</h3>
              <div className="timeline">
                {TRIMESTER_EVENTS.map((ev, i) => {
                  const evDate = addDays(lmpDate, ev.offset);
                  const isPast = evDate < new Date();
                  return (
                    <div key={i} className={`timeline-item ${isPast ? 'past' : ''}`}>
                      <div className="timeline-dot" style={{ background: isPast ? '#ccc' : ev.color }} />
                      <div className="timeline-content">
                        <div className="timeline-event-label">{ev.label}</div>
                        <div className="timeline-event-date">{fmt(evDate)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Stat cards */}
            <div className="stat-grid">
              {[
                { label: 'Weeks pregnant', value: currentWeekCalc ?? '—' },
                { label: 'Trimester', value: currentWeekCalc <= 12 ? '1st' : currentWeekCalc <= 26 ? '2nd' : '3rd' },
                { label: 'Days remaining', value: daysFromNow(edd) },
                { label: 'Weeks remaining', value: weeksFromNow(edd) },
              ].map((s, i) => (
                <div key={i} className="stat-card">
                  <div className="stat-value">{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="due-disclaimer">
        📋 This calculator uses Naegele's Rule (LMP + 280 days) — the standard obstetric method. Your OB/midwife will confirm your EDD with an early ultrasound, which is more accurate.
      </div>
    </div>
  );
}
