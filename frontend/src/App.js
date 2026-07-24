import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import Login, { SESSION_KEY } from './components/Login';
import HomePage from './components/HomePage';
import ChatPanel from './components/ChatPanel';
import DueDatePage from './components/DueDatePage';
import FoodPage from './components/FoodPage';
import KickCounter from './components/KickCounter';
import ContractionTimer from './components/ContractionTimer';
import MoodJournal from './components/MoodJournal';
import Sidebar from './components/Sidebar';
import './App.css';

const DEFAULT_CONTEXT = {
  gestational_week: null, trimester: null, age: 28,
  bmi_prepregnancy: 23.5,
  risk_hypertension: 0, risk_depression_hx: 0,
  risk_prev_preterm: 0, risk_gestational_diabetes: 0, risk_smoking: 0,
  sdoh_low_income: 0, sdoh_unmarried: 0, sdoh_low_education: 0,
  symptom_swelling: 0, symptom_headache: 0, symptom_blurry_vision: 0,
  symptom_back_pain: 0, symptom_nausea: 0, symptom_reduced_fetal_movement: 0,
  systolic_bp: 115, diastolic_bp: 75, weight_gain_lb: 18,
};

export default function App() {
  const [user, setUser]         = useState(null);
  const [page, setPage]         = useState('home');
  const [ctx, setCtx]           = useState(DEFAULT_CONTEXT);
  const [lastResult, setLastResult] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(SESSION_KEY);
      if (saved) {
        const u = JSON.parse(saved);
        setUser(u);
        setCtx(prev => ({
          ...prev,
          gestational_week: u.week || null,
          trimester: u.week ? (u.week <= 12 ? 1 : u.week <= 26 ? 2 : 3) : null,
          age: u.age || 28,
        }));
      }
    } catch (_) {}
  }, []);

  const handleLogin = (u) => {
    setUser(u);
    setCtx(prev => ({
      ...prev,
      gestational_week: u.week || null,
      trimester: u.week ? (u.week <= 12 ? 1 : u.week <= 26 ? 2 : 3) : null,
      age: u.age || 28,
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null); setCtx(DEFAULT_CONTEXT);
    setLastResult(null); setPage('home');
  };

  const updateCtx = useCallback((key, val) => {
    setCtx(prev => {
      const next = { ...prev, [key]: val };
      if (key === 'gestational_week') next.trimester = val <= 12 ? 1 : val <= 26 ? 2 : 3;
      return next;
    });
  }, []);

  if (!user) return <Login onLogin={handleLogin} />;

  const showSidebar = page === 'symptoms';

  return (
    <div className="app-shell">
      <Header
        week={ctx.gestational_week} trimester={ctx.trimester}
        user={user} onLogout={handleLogout}
        activePage={page} onNavigate={setPage}
        sidebarOpen={sidebarOpen} onToggle={() => setSidebarOpen(o => !o)}
        showSidebarToggle={showSidebar}
      />
      <div className="app-body">
        {showSidebar && (
          <Sidebar open={sidebarOpen} ctx={ctx} onUpdate={updateCtx} lastResult={lastResult} />
        )}
        <div className="page-content">
          {page === 'home'         && <HomePage user={user} ctx={ctx} onNavigate={setPage} />}
          {page === 'symptoms'     && <ChatPanel ctx={ctx} onResult={setLastResult} />}
          {page === 'duedate'      && <DueDatePage ctx={ctx} onUpdateCtx={updateCtx} />}
          {page === 'food'         && <FoodPage ctx={ctx} />}
          {page === 'kicks'        && <KickCounter ctx={ctx} />}
          {page === 'contractions' && <ContractionTimer ctx={ctx} />}
          {page === 'mood'         && <MoodJournal ctx={ctx} />}
        </div>
      </div>
    </div>
  );
}