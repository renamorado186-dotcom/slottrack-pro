import { useState } from 'react';
import { StoreProvider, useStore } from './store';
import { AuthScreen } from './components/AuthScreen';
import { Dashboard } from './components/Dashboard';
import { NewRecord } from './components/NewRecord';
import { History } from './components/History';
import { Locations } from './components/Locations';
import { SettingsView } from './components/Settings';
import { LayoutDashboard, PlusCircle, History as HistoryIcon, MapPin, Settings as SettingsIcon, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

function AppContent() {
  const { data } = useStore();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  const needsAuth = !!data.settings.masterPassword && !isAuthenticated;

  if (needsAuth) {
    return <AuthScreen onAuth={() => setIsAuthenticated(true)} />;
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'new', label: 'Nuevo Conteo', icon: <PlusCircle size={18} /> },
    { id: 'history', label: 'Historial', icon: <HistoryIcon size={18} /> },
    { id: 'locations', label: 'Puestos', icon: <MapPin size={18} /> },
    { id: 'settings', label: 'Ajustes', icon: <SettingsIcon size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row font-sans print:bg-white text-slate-100">
      
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900/40 backdrop-blur-xl border-r border-white/5 h-screen sticky top-0 print:hidden z-10">
        <div className="p-6 border-b border-white/5 bg-slate-900/10 mb-2">
          <div className="flex items-center gap-3">
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 8 }}
              className="w-11 h-11 bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white shadow-[0_4px_15px_rgba(59,130,246,0.4)] border-t border-white/20 relative cursor-pointer"
            >
              {/* Internal shiny reflection overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/10 rounded-xl" />
              <div className="absolute -inset-[1px] bg-gradient-to-tr from-indigo-500 to-purple-400 rounded-xl blur-sm opacity-30 -z-10" />
              <Sparkles size={18} className="text-amber-200" />
            </motion.div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-1.5 leading-none">
                SlotTrack Pro
              </h1>
              <p className="text-[10px] text-teal-400 font-extrabold tracking-widest uppercase mt-0.5">AUDITORÍA SLOTS</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1 mt-4 relative">
          {tabs.map(t => {
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-medium text-sm relative group cursor-pointer ${
                  isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeMenu"
                    className="absolute inset-0 bg-gradient-to-r from-blue-600/15 to-indigo-500/5 border border-blue-500/30 rounded-xl shadow-[0_4px_15px_-3px_rgba(59,130,246,0.15)]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className={`transition-colors duration-200 z-10 ${isActive ? 'text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.4)]' : 'text-slate-500 group-hover:text-slate-300'}`}>
                  {t.icon}
                </span>
                <span className="z-10 tracking-wide font-medium">{t.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Pro version footer indicator */}
        <div className="p-4 m-3 bg-gradient-to-br from-indigo-950/40 to-slate-900/80 border border-indigo-500/10 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 rounded-full blur-xl"></div>
          <p className="text-xs font-bold text-indigo-400 mb-1 flex items-center gap-1">⚡ Modo Operador</p>
          <p className="text-[10px] text-slate-400 font-light leading-normal">Supervisión en tiempo real con diagnóstico IA activo.</p>
        </div>
      </aside>

      {/* Main Content with dynamic animation */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 pb-32 md:pb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
          >
            {activeTab === 'dashboard' && <Dashboard />}
            {activeTab === 'new' && <NewRecord />}
            {activeTab === 'history' && <History />}
            {activeTab === 'locations' && <Locations />}
            {activeTab === 'settings' && <SettingsView />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Nav Mobile */}
      <nav className="md:hidden fixed bottom-0 w-full bg-slate-950/80 backdrop-blur-xl border-t border-white/5 flex justify-around p-2 pb-safe z-40 print:hidden safe-area-bottom shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        {tabs.map(t => {
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex flex-col items-center p-2 rounded-xl min-w-[64px] transition-all relative cursor-pointer ${
                isActive ? 'text-blue-400' : 'text-slate-400'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeMenuMobile"
                  className="absolute inset-0 bg-blue-500/10 rounded-xl"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <span className={`mb-1 z-10 transition-transform ${isActive ? 'scale-110 text-blue-400' : ''}`}>{t.icon}</span>
              <span className="text-[10px] font-semibold z-10 tracking-tight">{t.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}

