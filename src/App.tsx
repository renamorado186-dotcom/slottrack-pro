import { useState } from 'react';
import { StoreProvider, useStore } from './store';
import { AuthScreen } from './components/AuthScreen';
import { Dashboard } from './components/Dashboard';
import { NewRecord } from './components/NewRecord';
import { History } from './components/History';
import { Locations } from './components/Locations';
import { SettingsView } from './components/Settings';
import { LayoutDashboard, PlusCircle, History as HistoryIcon, MapPin, Settings as SettingsIcon } from 'lucide-react';

function AppContent() {
  const { data } = useStore();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  const needsAuth = !!data.settings.masterPassword && !isAuthenticated;

  if (needsAuth) {
    return <AuthScreen onAuth={() => setIsAuthenticated(true)} />;
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'new', label: 'Nuevo Conteo', icon: <PlusCircle size={20} /> },
    { id: 'history', label: 'Historial', icon: <HistoryIcon size={20} /> },
    { id: 'locations', label: 'Puestos', icon: <MapPin size={20} /> },
    { id: 'settings', label: 'Ajustes', icon: <SettingsIcon size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col md:flex-row font-sans print:bg-white text-slate-50">
      
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900/95 border-r border-white/10 h-screen sticky top-0 print:hidden">
        <div className="p-6">
          <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white mb-2 shadow-sm shadow-blue-500/20">
            <span className="font-bold text-xl tracking-tighter">ST</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">SlotTrack Pro</h1>
          <p className="text-xs text-slate-400 font-medium tracking-wide">CONTROL DE INGRESOS</p>
        </div>
        <nav className="flex-1 px-4 space-y-1 mt-4">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 transition-all font-medium text-sm ${
                activeTab === t.id 
                  ? 'bg-blue-500/10 text-white border-r-4 border-blue-500' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white rounded-xl'
              }`}
            >
              <span className={activeTab === t.id ? 'text-blue-500' : 'text-slate-500'}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 pb-24 md:pb-8">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'new' && <NewRecord />}
        {activeTab === 'history' && <History />}
        {activeTab === 'locations' && <Locations />}
        {activeTab === 'settings' && <SettingsView />}
      </main>

      {/* Bottom Nav Mobile */}
      <nav className="md:hidden fixed bottom-0 w-full bg-slate-900/90 backdrop-blur-md border-t border-white/10 flex justify-around p-2 pb-safe z-40 print:hidden safe-area-bottom">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex flex-col items-center p-2 rounded-xl min-w-[64px] transition-colors ${
              activeTab === t.id ? 'text-blue-400 bg-blue-500/10' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="mb-1">{t.icon}</span>
            <span className="text-[10px] font-medium">{t.label}</span>
          </button>
        ))}
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

