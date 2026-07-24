import React from 'react';
import './Sidebar.css';

// Fetal size comparisons by week
const FETAL_SIZE = {
  8:  { label: 'Raspberry',   emoji: '🫐', size: '1.6 cm' },
  12: { label: 'Lime',        emoji: '🍋', size: '5.4 cm' },
  16: { label: 'Avocado',     emoji: '🥑', size: '11.6 cm' },
  20: { label: 'Banana',      emoji: '🍌', size: '25.6 cm' },
  24: { label: 'Corn',        emoji: '🌽', size: '30 cm' },
  28: { label: 'Eggplant',    emoji: '🍆', size: '37.6 cm' },
  32: { label: 'Squash',      emoji: '🎃', size: '42.4 cm' },
  36: { label: 'Honeydew',    emoji: '🍈', size: '47.4 cm' },
  40: { label: 'Watermelon',  emoji: '🍉', size: '51.2 cm' },
};

function getFetalSize(week) {
  const keys = Object.keys(FETAL_SIZE).map(Number).sort((a, b) => a - b);
  let best = keys[0];
  for (const k of keys) { if (week >= k) best = k; }
  return FETAL_SIZE[best];
}

function Toggle({ checked, onChange }) {
  return (
    <label className="toggle">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
      <span className="toggle-track"><span className="toggle-thumb" /></span>
    </label>
  );
}

function SliderRow({ label, value, min, max, step = 1, unit = '', onChange }) {
  return (
    <div className="slider-row">
      <div className="slider-top">
        <span className="slider-label">{label}</span>
        <span className="slider-val">{value}{unit}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="range-input"
      />
    </div>
  );
}

function RiskBar({ label, value, color }) {
  if (value === null || value === undefined) return null;
  const level = value < 20 ? 'Low' : value < 50 ? 'Moderate' : 'High';
  const levelColor = value < 20 ? 'var(--normal)' : value < 50 ? 'var(--watch)' : 'var(--urgent)';
  return (
    <div className="risk-bar-row">
      <div className="risk-bar-top">
        <span className="risk-bar-label">{label}</span>
        <span className="risk-bar-level" style={{ color: levelColor }}>{level} · {value.toFixed(1)}%</span>
      </div>
      <div className="risk-track">
        <div className="risk-fill" style={{ width: `${value}%`, background: levelColor }} />
      </div>
    </div>
  );
}

export default function Sidebar({ open, ctx, onUpdate, lastResult }) {
  const fetal = getFetalSize(ctx.gestational_week);
  const scores = lastResult?.risk_scores || {};

  return (
    <aside className={`sidebar ${open ? 'open' : 'closed'}`}>
      <div className="sidebar-scroll">

        {/* Fetal size card */}
        <div className="fetal-card">
          <div className="fetal-emoji" style={{ animation: 'float 3s ease-in-out infinite' }}>
            {fetal.emoji}
          </div>
          <div className="fetal-info">
            <span className="fetal-week">Week {ctx.gestational_week}</span>
            <span className="fetal-name">Size of a {fetal.label}</span>
            <span className="fetal-size">{fetal.size} crown-rump</span>
          </div>
        </div>

        {/* Gestational week */}
        <div className="section-block">
          <h3 className="section-title">Pregnancy Progress</h3>
          <SliderRow label="Gestational week" value={ctx.gestational_week} min={4} max={42}
            onChange={v => onUpdate('gestational_week', v)} />
          <div className="progress-track-wrap">
            <div className="progress-track">
              {[1,2,3].map(t => (
                <div key={t} className={`progress-segment ${ctx.trimester >= t ? 'active' : ''}`}
                  style={{ background: ctx.trimester >= t
                    ? t === 1 ? 'var(--sage)' : t === 2 ? 'var(--amber)' : 'var(--rose)'
                    : 'var(--warm)' }} />
              ))}
            </div>
            <div className="progress-labels">
              <span>T1</span><span>T2</span><span>T3</span>
            </div>
          </div>
        </div>

        {/* Personal details */}
        <div className="section-block">
          <h3 className="section-title">Your Profile</h3>
          <SliderRow label="Age" value={ctx.age} min={16} max={50} onChange={v => onUpdate('age', v)} unit=" yrs" />
          <SliderRow label="Pre-pregnancy BMI" value={ctx.bmi_prepregnancy} min={15} max={45} step={0.5}
            onChange={v => onUpdate('bmi_prepregnancy', v)} />
          <SliderRow label="Weight gain" value={Math.round(ctx.weight_gain_lb * 0.453592 * 10) / 10} min={0} max={36} step={0.5}
            onChange={v => onUpdate('weight_gain_lb', Math.round(v / 0.453592 * 10) / 10)} unit=" kg" />
        </div>

        {/* Vitals */}
        <div className="section-block">
          <h3 className="section-title">Current Vitals</h3>
          <SliderRow label="Systolic BP" value={ctx.systolic_bp} min={70} max={200}
            onChange={v => onUpdate('systolic_bp', v)} unit=" mmHg" />
          <SliderRow label="Diastolic BP" value={ctx.diastolic_bp} min={40} max={130}
            onChange={v => onUpdate('diastolic_bp', v)} unit=" mmHg" />
          {ctx.systolic_bp >= 140 || ctx.diastolic_bp >= 90 ? (
            <div className="vitals-alert">⚠ BP ≥140/90 — possible hypertension. Consult your provider.</div>
          ) : null}
        </div>

        {/* Medical history */}
        <div className="section-block">
          <h3 className="section-title">Medical History</h3>
          {[
            ['risk_hypertension',       'Hypertension'],
            ['risk_depression_hx',      'Depression history'],
            ['risk_prev_preterm',       'Previous preterm birth'],
            ['risk_gestational_diabetes','Gestational diabetes'],
            ['risk_smoking',            'Smoking'],
          ].map(([key, label]) => (
            <div key={key} className="toggle-row">
              <span className="toggle-label">{label}</span>
              <Toggle checked={!!ctx[key]} onChange={v => onUpdate(key, v ? 1 : 0)} />
            </div>
          ))}
        </div>

        {/* Social factors */}
        <div className="section-block">
          <h3 className="section-title">Social Factors (SDOH)</h3>
          {[
            ['sdoh_low_income',    'Low-income household'],
            ['sdoh_unmarried',     'Single / unmarried'],
            ['sdoh_low_education', 'Education below secondary'],
          ].map(([key, label]) => (
            <div key={key} className="toggle-row">
              <span className="toggle-label">{label}</span>
              <Toggle checked={!!ctx[key]} onChange={v => onUpdate(key, v ? 1 : 0)} />
            </div>
          ))}
        </div>

        {/* ML Risk scores */}
        {Object.keys(scores).length > 0 && (
          <div className="section-block risk-section">
            <h3 className="section-title">ML Risk Assessment</h3>
            <p className="risk-note">Based on your profile — not a diagnosis</p>
            <RiskBar label="Postpartum depression" value={scores.ppd} />
            <RiskBar label="Preterm birth" value={scores.preterm} />
            <RiskBar label="Preeclampsia" value={scores.preeclampsia} />
            {lastResult?.rag_sources?.length > 0 && (
              <div className="sources-row">
                <span className="sources-label">Clinical sources:</span>
                {lastResult.rag_sources.map((s, i) => (
                  <span key={i} className="source-chip">{s}</span>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="sidebar-footer">
          <p>MaternaAI uses Gemini 3.1 Pro + RAG over ACOG clinical guidelines. Always verify with your healthcare provider.</p>
        </div>
      </div>
    </aside>
  );
}