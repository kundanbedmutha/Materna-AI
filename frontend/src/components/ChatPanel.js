import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import './ChatPanel.css';

const QUICK_SYMPTOMS = [
  { label: 'Swollen feet & ankles', query: 'I have swollen feet and ankles since yesterday' },
  { label: 'Headache + blurry vision', query: 'I have a severe headache and blurry vision' },
  { label: 'Lower back pain', query: 'I have lower back pain that started this morning' },
  { label: 'Baby not moving much', query: 'My baby has not been moving much today' },
  { label: 'Nausea & dizziness', query: 'I feel very nauseous and dizzy' },
  { label: 'Vaginal spotting', query: 'I noticed some vaginal spotting or light bleeding' },
  { label: 'Feeling low / anxious', query: 'I have been feeling very anxious and low in mood' },
  { label: 'Contractions at 34 wks', query: 'I think I am having contractions at 34 weeks' },
];

const URGENCY_CONFIG = {
  urgent: { label: 'Seek care now',   color: 'var(--urgent)',    bg: 'var(--urgent-lt)',  icon: '🔴' },
  watch:  { label: 'Monitor closely', color: 'var(--watch)',     bg: 'var(--watch-lt)',   icon: '🟡' },
  normal: { label: 'Common in pregnancy', color: 'var(--normal)', bg: 'var(--normal-lt)', icon: '🟢' },
};

function TypingDots() {
  return (
    <div className="typing-dots">
      {[0,1,2].map(i => <span key={i} style={{ animationDelay: `${i * 0.2}s` }} />)}
    </div>
  );
}

function UrgencyBadge({ urgency }) {
  const cfg = URGENCY_CONFIG[urgency] || URGENCY_CONFIG.normal;
  return (
    <div className="urgency-badge" style={{ background: cfg.bg, borderColor: cfg.color + '44' }}>
      <span>{cfg.icon}</span>
      <span style={{ color: cfg.color, fontWeight: 500 }}>{cfg.label}</span>
    </div>
  );
}

function Message({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`msg-row ${isUser ? 'user' : 'agent'}`} style={{ animation: 'fadeUp 0.3s ease' }}>
      {!isUser && (
        <div className="agent-avatar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--rose)" strokeWidth="2" strokeLinecap="round">
            <path d="M12 2a4 4 0 0 1 4 4c0 1.5-.8 2.8-2 3.5V12a2 2 0 0 1-4 0V9.5C8.8 8.8 8 7.5 8 6a4 4 0 0 1 4-4z"/>
            <path d="M8 14c-3 1-5 3.5-5 6h18c0-2.5-2-5-5-6"/>
          </svg>
        </div>
      )}
      <div className="msg-content">
        {msg.urgency && <UrgencyBadge urgency={msg.urgency} />}
        <div className={`bubble ${isUser ? 'bubble-user' : 'bubble-agent'}`}>
          {isUser
            ? <p>{msg.text}</p>
            : <ReactMarkdown>{msg.text}</ReactMarkdown>
          }
        </div>
        {msg.week && !isUser && (
          <span className="msg-meta">Week {msg.week} · {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        )}
      </div>
    </div>
  );
}

function WelcomeScreen({ onChip }) {
  return (
    <div className="welcome">
      <div className="welcome-blossom">
        {[0,60,120,180,240,300].map((deg, i) => (
          <div key={i} className="petal" style={{
            transform: `rotate(${deg}deg) translateY(-22px)`,
            animationDelay: `${i * 0.15}s`
          }} />
        ))}
        <div className="petal-center" />
      </div>
      <h1 className="welcome-title">How are you feeling today?</h1>
      <p className="welcome-sub">
        Tell me about your symptoms and I'll give you clinically-grounded guidance — powered by Gemini 3.1 Pro and ACOG clinical guidelines.
      </p>
      <div className="chip-grid">
        {QUICK_SYMPTOMS.map((s, i) => (
          <button key={i} className="chip-btn" onClick={() => onChip(s.query)}
            style={{ animationDelay: `${0.05 * i}s` }}>
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ChatPanel({ ctx, onResult, sidebarOpen }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = useCallback(async (text) => {
    const txt = text || input.trim();
    if (!txt || loading) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: txt }]);
    setLoading(true);

    try {
      const res = await fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: txt, patient_context: ctx })
      });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      onResult(data);
      setMessages(prev => [...prev, {
        role: 'agent',
        text: data.response,
        urgency: data.urgency,
        week: data.week,
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'agent',
        text: `**Connection error:** Could not reach the MaternaAI backend.\n\nMake sure the API is running:\n\`\`\`\nuvicorn app.api:app --reload --port 8000\n\`\`\``,
        urgency: 'normal',
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }, [input, loading, ctx, onResult]);

  const handleKey = e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } };

  const clearChat = async () => {
    setMessages([]);
    onResult(null);
    try { await fetch('/reset', { method: 'POST' }); } catch (_) {}
  };

  return (
    <main className="chat-panel">
      <div className="chat-messages">
        {messages.length === 0
          ? <WelcomeScreen onChip={send} />
          : messages.map((m, i) => <Message key={i} msg={m} />)
        }
        {loading && (
          <div className="msg-row agent" style={{ animation: 'fadeUp 0.2s ease' }}>
            <div className="agent-avatar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--rose)" strokeWidth="2" strokeLinecap="round">
                <path d="M12 2a4 4 0 0 1 4 4c0 1.5-.8 2.8-2 3.5V12a2 2 0 0 1-4 0V9.5C8.8 8.8 8 7.5 8 6a4 4 0 0 1 4-4z"/>
                <path d="M8 14c-3 1-5 3.5-5 6h18c0-2.5-2-5-5-6"/>
              </svg>
            </div>
            <div className="bubble bubble-agent"><TypingDots /></div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick chips (persistent after conversation starts) */}
      {messages.length > 0 && (
        <div className="quick-chips">
          {QUICK_SYMPTOMS.slice(0, 4).map((s, i) => (
            <button key={i} className="chip-btn chip-sm" onClick={() => send(s.query)}>{s.label}</button>
          ))}
        </div>
      )}

      <div className="input-bar">
        <textarea
          ref={inputRef}
          className="chat-input"
          placeholder="Describe your symptom or ask a question…"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          rows={1}
        />
        <div className="input-actions">
          {messages.length > 0 && (
            <button className="clear-btn" onClick={clearChat} title="Clear conversation">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.75"/>
              </svg>
            </button>
          )}
          <button
            className={`send-btn ${loading || !input.trim() ? 'disabled' : ''}`}
            onClick={() => send()}
            disabled={loading || !input.trim()}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
      </div>
    </main>
  );
}
