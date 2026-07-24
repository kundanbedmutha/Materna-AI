import React, { useState, useEffect, useRef } from 'react';
import './ContractionTimer.css';

const STORAGE_KEY = 'materna_contractions';

function loadToday() {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    const key = new Date().toISOString().split('T')[0];
    return all[key] || [];
  } catch { return []; }
}

function saveToday(list) {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    const key = new Date().toISOString().split('T')[0];
    all[key] = list;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {}
}

function fmtDur(ms) {
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m ${s % 60}s`;
}

function fmtTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function getUrgency(contractions) {
  if (contractions.length < 2) return null;
  const recent = contractions.slice(-6);
  const freqs = [];
  for (let i = 1; i < recent.length; i++) {
    freqs.push((recent[i].start - recent[i-1].start) / 60000);
  }
  const avgFreq = freqs.reduce((a,b) => a+b, 0) / freqs.length;
  const avgDur  = recent.reduce((a,b) => a + (b.duration || 0), 0) / recent.length / 1000;

  if (avgFreq <= 5 && avgDur >= 60)
    return { level: 'urgent', msg: 'Contractions ≤5 min apart and ≥60s long — go to hospital now.', color: 'var(--urgent)' };
  if (avgFreq <= 7)
    return { level: 'watch',  msg: 'Contractions every ~7 min — call your OB or midwife.', color: 'var(--watch)' };
  if (avgFreq <= 10)
    return { level: 'monitor', msg: 'Contractions every ~10 min — keep timing, may be early labour.', color: 'var(--amber)' };
  return { level: 'normal', msg: 'Contractions are irregular — likely Braxton Hicks. Keep monitoring.', color: 'var(--normal)' };
}

export default function ContractionTimer({ ctx }) {
  const [contractions, setContractions] = useState(loadToday);
  const [active, setActive]   = useState(false);
  const [startTs, setStartTs] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (active) {
      timerRef.current = setInterval(() => setElapsed(Math.round((Date.now() - startTs) / 1000)), 100);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [active, startTs]);

  const handlePress = () => {
    if (!active) {
      setActive(true);
      setStartTs(Date.now());
      setElapsed(0);
    } else {
      const duration = Date.now() - startTs;
      const newC = { start: startTs, end: Date.now(), duration };
      const updated = [...contractions, newC];
      setContractions(updated);
      saveToday(updated);
      setActive(false);
      setElapsed(0);
    }
  };

  const clearAll = () => {
    setContractions([]);
    saveToday([]);
    setActive(false);
  };

  const urgency = getUrgency(contractions);

  // Stats from last contractions
  const getStats = () => {
    if (contractions.length < 2) return null;
    const recent = contractions.slice(-6);
    const freqs = [];
    for (let i = 1; i < recent.length; i++) {
      freqs.push((recent[i].start - recent[i-1].start) / 60000);
    }
    const avgFreq = freqs.reduce((a,b)=>a+b,0) / freqs.length;
    const avgDur  = recent.reduce((a,b) => a + (b.duration||0), 0) / recent.length / 1000;
    const lastFreq = freqs[freqs.length-1];
    return { avgFreq: avgFreq.toFixed(1), lastFreq: lastFreq.toFixed(1), avgDur: avgDur.toFixed(0) };
  };

  const stats = getStats();
  const elapsedFmt = `${String(Math.floor(elapsed/60)).padStart(2,'0')}:${String(elapsed%60).padStart(2,'0')}`;

  return (
    <div className="ct-page">
      <div className="ct-header">
        <div className="ct-header-icon">⏱</div>
        <div>
          <h1 className="ct-title">Contraction Timer</h1>
          <p className="ct-sub">Press START when a contraction begins, STOP when it ends · Week {ctx.gestational_week || '—'}</p>
        </div>
      </div>

      {/* Urgency alert */}
      {urgency && (
        <div className="ct-alert" style={{ borderColor: urgency.color, background: urgency.color + '18' }}>
          <span className="ct-alert-icon">
            {urgency.level === 'urgent' ? '🔴' : urgency.level === 'watch' ? '🟡' : urgency.level === 'monitor' ? '🟠' : '🟢'}
          </span>
          <span style={{ color: urgency.color }}>{urgency.msg}</span>
        </div>
      )}

      {/* Main button */}
      <div className="ct-center-card">
        <button className={`ct-main-btn ${active ? 'active' : ''}`} onClick={handlePress}>
          <div className={`ct-pulse-ring ${active ? 'pulsing' : ''}`} />
          <div className="ct-btn-content">
            {active ? (
              <>
                <span className="ct-btn-timer">{elapsedFmt}</span>
                <span className="ct-btn-label">TAP TO STOP</span>
              </>
            ) : (
              <>
                <span className="ct-btn-start-text">TAP TO</span>
                <span className="ct-btn-start-text big">START</span>
              </>
            )}
          </div>
        </button>
        <p className="ct-instruction">
          {active ? 'Contraction in progress — tap when it ends' : 'Tap when the next contraction starts'}
        </p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="ct-stats-grid">
          {[
            { label: 'Avg frequency', value: `${stats.avgFreq} min`, sub: 'between contractions' },
            { label: 'Last interval',  value: `${stats.lastFreq} min`, sub: 'most recent gap' },
            { label: 'Avg duration',   value: `${stats.avgDur}s`, sub: 'per contraction' },
            { label: 'Counted',        value: contractions.length, sub: 'contractions total' },
          ].map((s, i) => (
            <div key={i} className="ct-stat-card">
              <div className="ct-stat-value">{s.value}</div>
              <div className="ct-stat-label">{s.label}</div>
              <div className="ct-stat-sub">{s.sub}</div>
            </div>
          ))}
        </div>
      )}

      {/* Log */}
      {contractions.length > 0 && (
        <div className="ct-section">
          <div className="ct-section-header">
            <h2 className="ct-section-title">Today's log</h2>
            <button className="ct-clear-btn" onClick={clearAll}>Clear all</button>
          </div>
          <div className="ct-log">
            {[...contractions].reverse().map((c, i) => {
              const idx = contractions.length - 1 - i;
              const prev = contractions[idx - 1];
              const freqMin = prev ? ((c.start - prev.start) / 60000).toFixed(1) : null;
              return (
                <div key={i} className="ct-log-row">
                  <div className="ct-log-num">#{contractions.length - i}</div>
                  <div className="ct-log-time">{fmtTime(c.start)}</div>
                  <div className="ct-log-dur">
                    <span className="ct-log-badge dur">{fmtDur(c.duration)}</span>
                  </div>
                  {freqMin && (
                    <div className="ct-log-freq">
                      <span className="ct-log-badge freq">every {freqMin}m</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pattern guidance */}
      <div className="ct-guide">
        <h3 className="ct-guide-title">When to go to hospital — 5-1-1 rule</h3>
        <div className="ct-511">
          {[
            { num: '5', label: 'minutes apart', desc: 'Between start of each contraction' },
            { num: '1', label: 'minute long', desc: 'Each contraction lasts ~60 seconds' },
            { num: '1', label: 'hour consistent', desc: 'This pattern for at least one hour' },
          ].map((r, i) => (
            <div key={i} className="ct-511-card">
              <div className="ct-511-num">{r.num}</div>
              <div className="ct-511-label">{r.label}</div>
              <div className="ct-511-desc">{r.desc}</div>
            </div>
          ))}
        </div>
        <p className="ct-guide-note">
          🏥 If you are less than 37 weeks and having regular contractions — go to hospital immediately regardless of the 5-1-1 rule.
        </p>
      </div>
    </div>
  );
}
