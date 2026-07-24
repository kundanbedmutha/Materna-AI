import React, { useState, useEffect } from 'react';
import './MoodJournal.css';

const STORAGE_KEY = 'materna_mood';

const MOODS = [
  { key: 'great',   emoji: '😊', label: 'Great',     score: 5 },
  { key: 'good',    emoji: '🙂', label: 'Good',      score: 4 },
  { key: 'okay',    emoji: '😐', label: 'Okay',      score: 3 },
  { key: 'low',     emoji: '😔', label: 'Low',       score: 2 },
  { key: 'anxious', emoji: '😰', label: 'Anxious',   score: 2 },
  { key: 'sad',     emoji: '😢', label: 'Sad',       score: 1 },
  { key: 'angry',   emoji: '😤', label: 'Irritable', score: 2 },
  { key: 'tired',   emoji: '😴', label: 'Exhausted', score: 2 },
];

const EPDS_QUESTIONS = [
  { q: 'I have been able to laugh and see the funny side of things', options: ['As much as I always could', 'Not quite so much now', 'Definitely not so much now', 'Not at all'], scores: [0,1,2,3] },
  { q: 'I have looked forward with enjoyment to things', options: ['As much as I ever did', 'Rather less than I used to', 'Definitely less than I used to', 'Hardly at all'], scores: [0,1,2,3] },
  { q: 'I have blamed myself unnecessarily when things went wrong', options: ['No, never', 'Not very often', 'Yes, some of the time', 'Yes, most of the time'], scores: [0,1,2,3] },
  { q: 'I have been anxious or worried for no good reason', options: ['No, not at all', 'Hardly ever', 'Yes, sometimes', 'Yes, very often'], scores: [0,1,2,3] },
  { q: 'I have felt scared or panicky for no very good reason', options: ['No, not at all', 'No, not much', 'Yes, sometimes', 'Yes, quite a lot'], scores: [0,1,2,3] },
  { q: 'Things have been getting on top of me', options: ['No, I have been coping as well as ever', 'No, most of the time I have coped quite well', 'Yes, sometimes I have not been coping as well as usual', 'Yes, most of the time I have not been able to cope at all'], scores: [0,1,2,3] },
  { q: 'I have been so unhappy that I have had difficulty sleeping', options: ['No, not at all', 'Not very often', 'Yes, sometimes', 'Yes, most of the time'], scores: [0,1,2,3] },
  { q: 'I have felt sad or miserable', options: ['No, not at all', 'Not very often', 'Yes, quite often', 'Yes, most of the time'], scores: [0,1,2,3] },
  { q: 'I have been so unhappy that I have been crying', options: ['No, never', 'Only occasionally', 'Yes, quite often', 'Yes, most of the time'], scores: [0,1,2,3] },
  { q: 'The thought of harming myself has occurred to me', options: ['Never', 'Hardly ever', 'Sometimes', 'Yes, quite often'], scores: [0,1,2,3] },
];

function todayKey() { return new Date().toISOString().split('T')[0]; }
function loadData() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { return {}; } }
function saveData(d) { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); }

function fmtDate(key) {
  return new Date(key).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
}

export default function MoodJournal({ ctx }) {
  const [data, setData]       = useState(loadData);
  const [tab, setTab]         = useState('log');    // 'log' | 'epds' | 'trends'
  const [mood, setMood]       = useState(null);
  const [note, setNote]       = useState('');
  const [symptoms, setSymp]   = useState([]);
  const [saved, setSaved]     = useState(false);
  const [epdsAnswers, setEpds]= useState(Array(10).fill(null));
  const [epdsResult, setEpdsResult] = useState(null);

  const today = todayKey();
  const todayEntry = data[today];

  const SYMP_OPTS = ['Headache','Fatigue','Nausea','Back pain','Insomnia','Appetite loss','Anxiety','Mood swings','Crying spells','Loneliness'];

  const toggleSymp = (s) => setSymp(prev => prev.includes(s) ? prev.filter(x=>x!==s) : [...prev, s]);

  const saveEntry = () => {
    if (!mood) return;
    const moodObj = MOODS.find(m => m.key === mood);
    const entry = { mood, score: moodObj.score, note, symptoms, ts: Date.now() };
    const updated = { ...data, [today]: entry };
    setData(updated); saveData(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const submitEpds = () => {
    if (epdsAnswers.includes(null)) return;
    const total = epdsAnswers.reduce((sum, val) => sum + val, 0);
    let level, msg, color;
    if (total <= 8)       { level='Low risk';      color='var(--normal)'; msg='Your score suggests low risk of perinatal depression. Continue daily mood tracking.'; }
    else if (total <= 12) { level='Moderate risk'; color='var(--watch)';  msg='Your score suggests some symptoms of depression. Consider talking to your OB or midwife about how you\'re feeling.'; }
    else                  { level='High risk';     color='var(--urgent)'; msg='Your score suggests significant depressive symptoms. Please speak to your healthcare provider as soon as possible — effective help is available.'; }
    setEpdsResult({ total, level, msg, color });

    const updated = { ...data, [`epds_${today}`]: { total, level, ts: Date.now(), answers: epdsAnswers } };
    setData(updated); saveData(updated);
  };

  // Build 14-day trend
  const trend = [...Array(14)].map((_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (13 - i));
    const key = d.toISOString().split('T')[0];
    const entry = data[key];
    return { key, label: d.getDate(), entry };
  });

  const moodColors = { great:'#639922', good:'#7A9E87', okay:'#D4924A', low:'#C9706A', anxious:'#D85A30', sad:'#993C1D', angry:'#BA7517', tired:'#888780' };

  // Recent EPDS scores
  const epdsHistory = Object.entries(data)
    .filter(([k]) => k.startsWith('epds_'))
    .sort(([a],[b]) => b.localeCompare(a))
    .slice(0, 5);

  return (
    <div className="mj-page">
      <div className="mj-header">
        <div className="mj-header-icon">📔</div>
        <div>
          <h1 className="mj-title">Mood Journal</h1>
          <p className="mj-sub">Daily emotional wellness tracker · EPDS perinatal depression screening</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mj-tabs">
        {[
          { key: 'log',    label: '📝 Daily log' },
          { key: 'epds',   label: '🧠 EPDS screening' },
          { key: 'trends', label: '📈 Trends' },
        ].map(t => (
          <button key={t.key} className={`mj-tab ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── DAILY LOG ── */}
      {tab === 'log' && (
        <div className="mj-content">
          {todayEntry ? (
            <div className="mj-already-logged">
              <div className="mj-logged-top">
                <span className="mj-logged-emoji">{MOODS.find(m=>m.key===todayEntry.mood)?.emoji}</span>
                <div>
                  <div className="mj-logged-mood">{MOODS.find(m=>m.key===todayEntry.mood)?.label}</div>
                  <div className="mj-logged-date">Logged today · {fmtDate(today)}</div>
                </div>
              </div>
              {todayEntry.note && <p className="mj-logged-note">"{todayEntry.note}"</p>}
              {todayEntry.symptoms?.length > 0 && (
                <div className="mj-logged-symps">
                  {todayEntry.symptoms.map(s => <span key={s} className="mj-symp-chip">{s}</span>)}
                </div>
              )}
              <button className="mj-relog-btn" onClick={() => { setData(d => { const n={...d}; delete n[today]; saveData(n); return n; }); }}>
                Update today's entry
              </button>
            </div>
          ) : (
            <>
              <div className="mj-section">
                <h2 className="mj-section-title">How are you feeling today?</h2>
                <div className="mj-mood-grid">
                  {MOODS.map(m => (
                    <button key={m.key} className={`mj-mood-btn ${mood === m.key ? 'active' : ''}`}
                      onClick={() => setMood(m.key)}>
                      <span className="mj-mood-emoji">{m.emoji}</span>
                      <span className="mj-mood-label">{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mj-section">
                <h2 className="mj-section-title">Any symptoms today?</h2>
                <div className="mj-symp-grid">
                  {SYMP_OPTS.map(s => (
                    <button key={s} className={`mj-symp-btn ${symptoms.includes(s) ? 'active' : ''}`}
                      onClick={() => toggleSymp(s)}>{s}</button>
                  ))}
                </div>
              </div>

              <div className="mj-section">
                <h2 className="mj-section-title">Journal note <span className="mj-optional">(optional)</span></h2>
                <textarea
                  className="mj-textarea"
                  placeholder="How was your day? What's on your mind? How is baby?"
                  value={note} onChange={e => setNote(e.target.value)}
                  rows={4}
                />
              </div>

              <button className={`mj-save-btn ${!mood ? 'disabled' : ''} ${saved ? 'saved' : ''}`}
                onClick={saveEntry} disabled={!mood}>
                {saved ? '✓ Saved!' : 'Save today\'s entry'}
              </button>
            </>
          )}
        </div>
      )}

      {/* ── EPDS ── */}
      {tab === 'epds' && (
        <div className="mj-content">
          <div className="mj-epds-intro">
            <strong>Edinburgh Postnatal Depression Scale (EPDS)</strong> — a validated 10-question screening tool used worldwide by OBs and midwives. Takes 3 minutes. Score ≥13 indicates likely depression.
          </div>

          {epdsResult ? (
            <div className="mj-epds-result" style={{ borderColor: epdsResult.color }}>
              <div className="mj-result-score" style={{ color: epdsResult.color }}>{epdsResult.total}/30</div>
              <div className="mj-result-level" style={{ color: epdsResult.color }}>{epdsResult.level}</div>
              <p className="mj-result-msg">{epdsResult.msg}</p>
              {epdsResult.total >= 13 && (
                <div className="mj-result-action">
                  📞 Please share this result with your healthcare provider at your next appointment or call today.
                </div>
              )}
              <button className="mj-retake-btn" onClick={() => { setEpds(Array(10).fill(null)); setEpdsResult(null); }}>
                Retake screening
              </button>
            </div>
          ) : (
            <div className="mj-epds-form">
              {EPDS_QUESTIONS.map((q, qi) => (
                <div key={qi} className="mj-epds-q">
                  <div className="mj-q-num">Q{qi+1}</div>
                  <div className="mj-q-text">{q.q}</div>
                  <div className="mj-q-options">
                    {q.options.map((opt, oi) => (
                      <button key={oi}
                        className={`mj-q-opt ${epdsAnswers[qi] === q.scores[oi] ? 'selected' : ''}`}
                        onClick={() => {
                          const updated = [...epdsAnswers];
                          updated[qi] = q.scores[oi];
                          setEpds(updated);
                        }}>
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <div className="mj-epds-footer">
                <div className="mj-epds-progress">
                  {epdsAnswers.filter(a=>a!==null).length} / 10 answered
                </div>
                <button
                  className={`mj-submit-btn ${epdsAnswers.includes(null) ? 'disabled' : ''}`}
                  onClick={submitEpds}
                  disabled={epdsAnswers.includes(null)}>
                  Submit screening
                </button>
              </div>
            </div>
          )}

          {epdsHistory.length > 0 && (
            <div className="mj-epds-history">
              <h3 className="mj-section-title">Past screenings</h3>
              {epdsHistory.map(([key, val]) => (
                <div key={key} className="mj-epds-hist-row">
                  <span className="mj-epds-hist-date">{fmtDate(key.replace('epds_', ''))}</span>
                  <span className="mj-epds-hist-score">{val.total}/30</span>
                  <span className="mj-epds-hist-level">{val.level}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TRENDS ── */}
      {tab === 'trends' && (
        <div className="mj-content">
          <div className="mj-section">
            <h2 className="mj-section-title">14-day mood timeline</h2>
            <div className="mj-timeline">
              {trend.map((d, i) => {
                const m = d.entry ? MOODS.find(mo => mo.key === d.entry.mood) : null;
                const isToday = d.key === today;
                return (
                  <div key={i} className={`mj-tl-col ${isToday ? 'today' : ''}`}>
                    <div className="mj-tl-emoji" title={m?.label || 'No entry'}>
                      {m ? m.emoji : '·'}
                    </div>
                    <div className="mj-tl-bar-wrap">
                      <div className="mj-tl-bar"
                        style={{ height: m ? `${(m.score/5)*100}%` : '0%',
                          background: m ? moodColors[m.key] : 'transparent' }} />
                    </div>
                    <div className="mj-tl-day">{d.label}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Past entries */}
          <div className="mj-section">
            <h2 className="mj-section-title">Recent journal entries</h2>
            <div className="mj-entries-list">
              {Object.entries(data)
                .filter(([k,v]) => !k.startsWith('epds_') && v.mood)
                .sort(([a],[b]) => b.localeCompare(a))
                .slice(0, 10)
                .map(([key, entry]) => {
                  const m = MOODS.find(mo => mo.key === entry.mood);
                  return (
                    <div key={key} className="mj-entry-row">
                      <span className="mj-entry-emoji">{m?.emoji}</span>
                      <div className="mj-entry-body">
                        <div className="mj-entry-top">
                          <span className="mj-entry-mood">{m?.label}</span>
                          <span className="mj-entry-date">{fmtDate(key)}</span>
                        </div>
                        {entry.symptoms?.length > 0 && (
                          <div className="mj-entry-symps">
                            {entry.symptoms.map(s=><span key={s} className="mj-symp-chip">{s}</span>)}
                          </div>
                        )}
                        {entry.note && <p className="mj-entry-note">"{entry.note}"</p>}
                      </div>
                    </div>
                  );
                })}
              {Object.keys(data).filter(k=>!k.startsWith('epds_')).length === 0 && (
                <p className="mj-empty">No entries yet. Start logging daily to see your trends.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
