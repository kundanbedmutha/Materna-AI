import React, { useState, useEffect, useRef } from 'react';
import './HomePage.css';

const QUOTES = [
  { text: "There is no way to be a perfect mother, and a million ways to be a good one.", author: "Jill Churchill" },
  { text: "A mother's love for her child is like nothing else in the world.", author: "Agatha Christie" },
  { text: "You are already the most important person in your baby's world.", author: "Unknown" },
  { text: "Motherhood is the greatest thing and the hardest thing.", author: "Ricki Lake" },
  { text: "Growing a baby is the most creative thing I have ever done.", author: "Soleil Moon Frye" },
  { text: "A baby fills a place in your heart that you never knew was empty.", author: "Unknown" },
  { text: "The moment a child is born, the mother is also born.", author: "Osho" },
  { text: "Being pregnant means every day is another day closer to meeting the other love of your life.", author: "Unknown" },
];

const BOOKS = [
  { title: "What to Expect When You're Expecting", author: "Heidi Murkoff", emoji: "📖", tag: "Classic guide", color: "#E1F5EE", border: "#5DCAA5" },
  { title: "Expecting Better", author: "Emily Oster", emoji: "📊", tag: "Data-driven", color: "#FAEEDA", border: "#EF9F27" },
  { title: "The Mama Natural Week-by-Week Guide", author: "Genevieve Howland", emoji: "🌿", tag: "Natural birth", color: "#FAECE7", border: "#D85A30" },
  { title: "Ina May's Guide to Childbirth", author: "Ina May Gaskin", emoji: "🌸", tag: "Empowering", color: "#F2E8F0", border: "#C9706A" },
  { title: "Bringing Up Bébé", author: "Pamela Druckerman", emoji: "🥐", tag: "Parenting style", color: "#E6F1FB", border: "#378ADD" },
  { title: "Mayo Clinic Guide to a Healthy Pregnancy", author: "Mayo Clinic", emoji: "🏥", tag: "Medical reference", color: "#EAF3DE", border: "#639922" },
];

const FETAL_MILESTONES = [
  { week: 6,  emoji: '🫘', label: 'Sweet pea',  fact: 'Heartbeat detected!' },
  { week: 10, emoji: '🍓', label: 'Strawberry', fact: 'All organs forming.' },
  { week: 14, emoji: '🍋', label: 'Lemon',      fact: 'Can make expressions.' },
  { week: 18, emoji: '🥭', label: 'Mango',      fact: 'First kicks soon!' },
  { week: 22, emoji: '🌽', label: 'Corn',       fact: 'Hears your voice.' },
  { week: 26, emoji: '🥬', label: 'Lettuce',    fact: 'Eyes begin to open.' },
  { week: 30, emoji: '🥥', label: 'Coconut',    fact: 'Brain developing fast.' },
  { week: 34, emoji: '🍍', label: 'Pineapple',  fact: 'Nearly ready!' },
  { week: 38, emoji: '🍉', label: 'Watermelon', fact: 'Fully developed!' },
];

const FEATURES = [
  { icon: '🩺', title: 'Symptom Checker',    desc: 'AI-powered triage grounded in ACOG guidelines.',  page: 'symptoms' },
  { icon: '📅', title: 'Due Date Predictor', desc: 'Calculate EDD with full trimester timeline.',       page: 'duedate'  },
  { icon: '🥗', title: 'Food & Nutrition',   desc: 'Personalised meals for Veg, Vegan & Non-Veg.',     page: 'food'     },
  { icon: '👶', title: 'Kick Counter',       desc: 'Cardiff method fetal movement tracker with 7-day chart.', page: 'kicks' },
  { icon: '⏱', title: 'Contraction Timer',  desc: 'Time contractions with 5-1-1 rule alerts.',        page: 'contractions' },
  { icon: '📔', title: 'Mood Journal',       desc: 'Daily mood log + EPDS depression screening.',      page: 'mood'     },
];

function QuoteTicker() {
  const trackRef = useRef(null);
  const doubled = [...QUOTES, ...QUOTES];

  return (
    <div className="ticker-wrap">
      <div className="ticker-track" ref={trackRef}>
        {doubled.map((q, i) => (
          <div key={i} className="ticker-card">
            <div className="ticker-quote-mark">"</div>
            <p className="ticker-text">{q.text}</p>
            <p className="ticker-author">— {q.author}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function FetalJourney({ week }) {
  const current = FETAL_MILESTONES.reduce((best, m) => week >= m.week ? m : best, FETAL_MILESTONES[0]);
  return (
    <div className="milestone-scroll">
      {FETAL_MILESTONES.map((m, i) => {
        const passed   = week >= m.week;
        const isCurrent = m.week === current.week;
        return (
          <div key={i} className={`milestone-card ${passed ? 'passed' : ''} ${isCurrent ? 'current' : ''}`}>
            <div className="milestone-emoji">{m.emoji}</div>
            <div className="milestone-week">Wk {m.week}</div>
            <div className="milestone-label">{m.label}</div>
            {isCurrent && <div className="milestone-fact">{m.fact}</div>}
          </div>
        );
      })}
    </div>
  );
}

export default function HomePage({ user, ctx, onNavigate }) {
  const week = ctx.gestational_week;
  const firstName = user?.name?.split(' ')[0] || 'Mama';

  return (
    <div className="home-page">

      {/* Hero */}
      <div className="hero">
        <div className="hero-petals">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="hero-petal" style={{
              left: `${8 + i * 20}%`, top: `${15 + (i % 3) * 22}%`,
              animationDelay: `${i * 0.7}s`, animationDuration: `${3.5 + i * 0.3}s`
            }} />
          ))}
        </div>
        <div className="hero-content">
          <p className="hero-greeting">Good day, {firstName} 🌸</p>
          <h1 className="hero-title">
            You are doing<br />
            <em className="hero-accent">something amazing.</em>
          </h1>
          {week
            ? <p className="hero-sub">Week {week} — every day brings you closer to meeting your little one.</p>
            : <p className="hero-sub">Set your gestational week in the sidebar to personalise your journey.</p>
          }
        </div>
      </div>

      {/* Auto-scrolling quotes */}
      <div className="home-section">
        <h2 className="section-heading">Words of warmth</h2>
        <QuoteTicker />
      </div>

      {/* Feature cards */}
      <div className="home-section">
        <h2 className="section-heading">What would you like to do today?</h2>
        <div className="feature-grid">
          {FEATURES.map((f, i) => (
            <button key={i} className="feature-card" onClick={() => onNavigate(f.page)}>
              <div className="feature-icon">{f.icon}</div>
              <div className="feature-title">{f.title}</div>
              <div className="feature-desc">{f.desc}</div>
              <div className="feature-cta">Open →</div>
            </button>
          ))}
        </div>
      </div>

      {/* Fetal journey */}
      {week && (
        <div className="home-section">
          <h2 className="section-heading">Your baby's journey</h2>
          <FetalJourney week={week} />
        </div>
      )}

      {/* Books */}
      <div className="home-section">
        <h2 className="section-heading">Books every mama should read 📚</h2>
        <div className="books-grid">
          {BOOKS.map((b, i) => (
            <div key={i} className="book-card" style={{ background: b.color, borderColor: b.border }}>
              <div className="book-emoji">{b.emoji}</div>
              <div className="book-tag" style={{ color: b.border }}>{b.tag}</div>
              <div className="book-title">{b.title}</div>
              <div className="book-author">{b.author}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Daily wellness */}
      <div className="home-section">
        <h2 className="section-heading">Daily wellness reminders</h2>
        <div className="tips-grid">
          {[
            { icon: '💧', tip: 'Drink 8–10 glasses of water today' },
            { icon: '🚶', tip: '20-minute gentle walk if you feel up to it' },
            { icon: '🧘', tip: 'Try 5 minutes of deep breathing' },
            { icon: '🥗', tip: 'Include folate-rich greens in your meals' },
            { icon: '😴', tip: 'Rest on your left side for better circulation' },
            { icon: '💊', tip: 'Take your prenatal vitamins with food' },
          ].map((t, i) => (
            <div key={i} className="tip-pill">
              <span className="tip-icon">{t.icon}</span>
              <span className="tip-text">{t.tip}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}