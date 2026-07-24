import React from 'react';
import './Header.css';

const TRIMESTER_COLORS = { 1: '#7A9E87', 2: '#D4924A', 3: '#C9706A' };
const TRIMESTER_LABELS = { 1: 'First Trimester', 2: 'Second Trimester', 3: 'Third Trimester' };

const NAV_ITEMS = [
  { key: 'home',         icon: '🏠', label: 'Home'         },
  { key: 'symptoms',     icon: '🩺', label: 'Symptoms'     },
  { key: 'duedate',      icon: '📅', label: 'Due Date'     },
  { key: 'food',         icon: '🥗', label: 'Nutrition'    },
  { key: 'kicks',        icon: '👶', label: 'Kick Counter' },
  { key: 'contractions', icon: '⏱', label: 'Contractions' },
  { key: 'mood',         icon: '📔', label: 'Mood Journal' },
];

function Blossom({ size = 22, color = '#C9706A', style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      {[0,60,120,180,240,300].map((deg, i) => (
        <ellipse key={i} cx="12" cy="7" rx="2.8" ry="5"
          fill={color} opacity={0.7 + (i % 3) * 0.1}
          transform={`rotate(${deg} 12 12)`} />
      ))}
      <circle cx="12" cy="12" r="3" fill="#FAF7F2" />
      <circle cx="12" cy="12" r="1.8" fill={color} opacity="0.9" />
    </svg>
  );
}

export default function Header({ week, trimester, user, onLogout, activePage, onNavigate, sidebarOpen, onToggle, showSidebarToggle }) {
  const color = TRIMESTER_COLORS[trimester] || '#C9706A';
  const initials = user?.name ? user.name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase() : '?';

  return (
    <header className="header">
      <div className="header-top">
        <div className="header-left">
          {showSidebarToggle && (
            <button className="sidebar-toggle" onClick={onToggle} title="Toggle sidebar">
              <span /><span /><span />
            </button>
          )}
          <div className="brand">
            <Blossom size={26} color={color} style={{ animation: 'blossom 4s ease-in-out infinite' }} />
            <div className="brand-text">
              <span className="brand-name">MaternaAI</span>
              <span className="brand-sub">Pregnancy Companion</span>
            </div>
          </div>
        </div>

        <div className="header-center">
          {week && trimester ? (
            <div className="week-display" style={{ borderColor: color + '55' }}>
              <span className="week-num" style={{ color }}>Week {week}</span>
              <span className="week-label" style={{ color: color + 'bb' }}>{TRIMESTER_LABELS[trimester]}</span>
            </div>
          ) : (
            <div className="week-display week-unset">
              <span className="week-num-placeholder">Set week in Symptom sidebar →</span>
            </div>
          )}
        </div>

        <div className="header-right">
          <div className="disclaimer-pill">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            Not medical advice
          </div>
          <div className="user-menu">
            <div className="user-avatar" title={user?.name}>{initials}</div>
            <div className="user-info">
              <span className="user-name">{user?.name || user?.email}</span>
              <button className="logout-btn" onClick={onLogout}>Sign out</button>
            </div>
          </div>
        </div>
      </div>

      <nav className="nav-bar">
        {NAV_ITEMS.map(item => (
          <button key={item.key}
            className={`nav-item ${activePage === item.key ? 'active' : ''}`}
            onClick={() => onNavigate(item.key)}
            style={activePage === item.key ? { color, borderBottomColor: color } : {}}>
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>
    </header>
  );
}