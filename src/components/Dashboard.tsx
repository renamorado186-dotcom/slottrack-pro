import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from 'recharts';
import { Coins, CircleDollarSign, TrendingUp, Users, ArrowUpRight, ArrowDownRight, Minus, Sparkles, AlertTriangle, Lightbulb, RefreshCw, Layers, CalendarDays } from 'lucide-react';
import { motion } from 'motion/react';

interface AiInsightData {
  forecastScore: number;
  summary: string;
  alerts: string[];
  recommendations: string[];
  forecastNextMonth: string;
}

export function Dashboard() {
  const { data } = useStore();

  const [aiData, setAiData] = useState<AiInsightData | null>(() => {
    const saved = localStorage.getItem('slot_track_ai_forecast');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const fetchAiAnalysis = async () => {
    setIsLoadingAi(true);
    setAiError(null);
    try {
      const response = await fetch('/api/ai/forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          records: data.records.slice(0, 15), // Send last 15 records for token sanity
          locations: data.locations,
          machines: data.machines,
        }),
      });
      if (!response.ok) {
        throw new Error('No se pudo establecer conexión con el motor de IA.');
      }
      const resData = await response.json();
      if (resData.error) {
        throw new Error(resData.error);
      }
      setAiData(resData);
      localStorage.setItem('slot_track_ai_forecast', JSON.stringify(resData));
    } catch (err: any) {
      setAiError(err.message || 'Error al conectar con el servidor.');
    } finally {
      setIsLoadingAi(false);
    }
  };

  const totalCollected = data.records.reduce((acc, r) => acc + r.total, 0);
  const totalCoins = data.records.reduce((acc, r) => acc + r.coinCount, 0);
  const totalOwner = data.records.reduce((acc, r) => acc + r.ownerShare, 0);
  const totalManager = data.records.reduce((acc, r) => acc + r.managerShare, 0);
  const totalRecords = data.records.length;

  // Daily Revenue Evolution Data
  const dailyRevenueData = React.useMemo(() => {
    const dailyMap: { [date: string]: number } = {};
    
    data.records.forEach(r => {
      const dateKey = r.dateStr || new Date(r.timestamp).toISOString().split('T')[0];
      dailyMap[dateKey] = (dailyMap[dateKey] || 0) + r.total;
    });

    return Object.entries(dailyMap)
      .map(([date, total]) => {
        let formattedDate = date;
        try {
          const parts = date.split('-');
          if (parts.length === 3) {
            formattedDate = `${parts[2]}/${parts[1]}`; // DD/MM format
          }
        } catch (e) {}
        return { 
          rawDate: date, 
          formattedDate, 
          total 
        };
      })
      .sort((a, b) => a.rawDate.localeCompare(b.rawDate));
  }, [data.records]);

  const highestActivityDay = React.useMemo(() => {
    if (dailyRevenueData.length === 0) return null;
    return [...dailyRevenueData].sort((a, b) => b.total - a.total)[0];
  }, [dailyRevenueData]);

  // Revenue by Location Data
  const locationTrends = data.locations.map(loc => {
    const locRecords = data.records.filter(r => r.locationId === loc.id).sort((a, b) => b.timestamp - a.timestamp);
    const total = locRecords.reduce((acc, r) => acc + r.total, 0);
    
    let trend = 0;
    if (locRecords.length >= 2) {
      trend = locRecords[0].total - locRecords[1].total;
    } else if (locRecords.length === 1) {
      trend = locRecords[0].total; // 100% increase if it's the first record
    }

    return { name: loc.name, total, trend };
  }).filter(l => l.total > 0).sort((a,b) => b.total - a.total);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Panel Inicial</h1>
          <p className="text-slate-400 text-xs">Resumen general de ingresos y análisis predictivo de slots</p>
        </div>
        <button
          onClick={fetchAiAnalysis}
          disabled={isLoadingAi || data.records.length === 0}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 active:scale-[0.98] text-white text-sm font-semibold rounded-xl shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all cursor-pointer"
        >
          {isLoadingAi ? (
            <RefreshCw size={16} className="animate-spin" />
          ) : (
            <Sparkles size={16} className="text-amber-300 animate-pulse" />
          )}
          {isLoadingAi ? 'Consultando IA...' : 'Análisis Estratégico IA'}
        </button>
      </div>

      {/* Hero Welcome Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative rounded-3xl overflow-hidden min-h-[185px] md:min-h-[220px] flex items-center border border-white/5 shadow-2xl group"
      >
        {/* Background Image with a subtle zoom effects */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img 
            src="/src/assets/images/slots_hero_1780857874331.png" 
            alt="SlotTrack Professional Terminal"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center scale-105 group-hover:scale-100 transition-transform duration-1000 ease-out brightness-[0.4]"
          />
          {/* Radial and linear color overlays to merge perfectly into dark slate theme */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/75 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
        </div>

        {/* Content on top */}
        <div className="relative z-10 p-6 md:p-8 max-w-2xl flex flex-col justify-center h-full">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-[10px] font-black uppercase tracking-widest mb-3 w-fit"
          >
            <Sparkles size={11} className="text-amber-300 animate-spin" />
            <span>Sistema Computarizado Activo</span>
          </motion.div>
          
          <h2 className="text-xl md:text-2xl font-black text-white tracking-tight leading-snug">
            Centro de Auditoría & Recaudación Slots
          </h2>
          <p className="text-xs text-slate-300 mt-2 leading-relaxed max-w-lg font-light">
            Supervise el rendimiento neto por puesto en tiempo real, realice arqueos inteligentes con la calculadora integrada y optimice la rentabilidad de las máquinas con el motor de diagnóstico Gemini AI.
          </p>
        </div>

        {/* Live Active Signal */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-slate-950/50 p-2 px-3 rounded-xl border border-white/5 backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] font-bold text-slate-300 tracking-wider">LIVE DATA</span>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Recaudado" value={`L ${totalCollected.toLocaleString()}`} icon={<CircleDollarSign size={24} />} bg="bg-blue-500/10 border border-blue-500/20" color="text-blue-400" glowClass="shadow-blue-500/15" />
        <StatCard title="Total Monedas" value={totalCoins.toLocaleString()} icon={<Coins size={24} />} bg="bg-indigo-500/10 border border-indigo-500/20" color="text-indigo-400" glowClass="shadow-indigo-500/15" />
        <StatCard title="Mi Ganancia (65%)" value={`L ${totalOwner.toLocaleString()}`} icon={<TrendingUp size={24} />} bg="bg-emerald-500/10 border border-emerald-500/20" color="text-emerald-400" glowClass="shadow-emerald-500/15" />
        <StatCard title="Encargados (35%)" value={`L ${totalManager.toLocaleString()}`} icon={<Users size={24} />} bg="bg-amber-500/10 border border-amber-500/20" color="text-amber-400" glowClass="shadow-amber-500/15" />
      </div>

      {/* AI Consulting Section */}
      {(isLoadingAi || aiData || aiError) && (
        <div className="bg-gradient-to-br from-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-3xl p-6 shadow-xl relative overflow-hidden backdrop-blur-md">
          {/* Subtle sparkles backgrounds */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl"></div>

          <div className="flex items-center justify-between border-b border-indigo-500/10 pb-4 mb-5">
            <div className="flex items-center gap-2">
              <div className="p-1 px-2 text-[10px] uppercase font-bold tracking-widest text-indigo-300 border border-indigo-400/30 bg-indigo-500/10 rounded-md">PRO</div>
              <h2 className="text-md font-bold text-white flex items-center gap-2">
                <Sparkles size={18} className="text-amber-400 animate-pulse" />
                Asesor de Operaciones Gemini AI
              </h2>
            </div>
            {aiData && (
              <button 
                onClick={fetchAiAnalysis} 
                disabled={isLoadingAi}
                className="text-slate-400 hover:text-white transition-colors p-1"
                title="Actualizar análisis de negocios"
              >
                <RefreshCw size={14} className={isLoadingAi ? 'animate-spin' : ''} />
              </button>
            )}
          </div>

          {isLoadingAi ? (
            <div className="py-6 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-12 h-12 rounded-full border-t-2 border-indigo-400 border-r-2 border-transparent animate-spin"></div>
              <div>
                <p className="text-sm font-semibold text-indigo-200">Ejecutando algoritmos predictivos...</p>
                <p className="text-xs text-slate-400 mt-1">Analizando flujos de efectivo, correlación de puestos y alertas preventivas de slots</p>
              </div>
            </div>
          ) : aiError ? (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start gap-3">
              <AlertTriangle className="text-rose-400 shrink-0 mt-0.5" size={18} />
              <div>
                <p className="text-sm font-bold text-rose-300">Hubo un error con el Asesor de IA</p>
                <p className="text-xs text-rose-400/80 mt-1">{aiError}</p>
                <button 
                  onClick={fetchAiAnalysis} 
                  className="mt-3 text-xs text-white font-medium bg-rose-500/20 hover:bg-rose-500/30 px-3 py-1.5 rounded-lg border border-rose-500/40 transition-colors"
                >
                  Intentar de nuevo
                </button>
              </div>
            </div>
          ) : aiData ? (
            <div className="space-y-6">
              {/* Score and summary section */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                <div className="md:col-span-1 flex flex-col items-center justify-center bg-white/5 border border-white/5 rounded-2xl p-5 text-center shadow-inner relative">
                  <span className="text-[10px] text-indigo-300 uppercase font-black tracking-wider">Salud del Negocio</span>
                  <div className="text-4xl font-extrabold text-indigo-400 mt-2 mb-1">{aiData.forecastScore}/100</div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-2">
                    <div 
                      className={`h-full rounded-full ${aiData.forecastScore >= 80 ? 'bg-emerald-400' : aiData.forecastScore >= 60 ? 'bg-amber-400' : 'bg-rose-400'}`} 
                      style={{ width: `${aiData.forecastScore}%` }}
                    ></div>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-2 font-medium">Basado en flujos de caja</span>
                </div>
                
                <div className="md:col-span-3 space-y-2">
                  <h3 className="text-sm font-semibold text-slate-300">Resumen y Diagnóstico</h3>
                  <p className="text-sm text-slate-200 leading-relaxed font-light">{aiData.summary}</p>
                  <div className="bg-indigo-950/30 border border-indigo-500/10 p-3 rounded-xl mt-3 flex items-center justify-between text-xs text-slate-300">
                    <span className="font-semibold text-indigo-200">Proyección para próximas semanas:</span>
                    <span className="text-white italic">{aiData.forecastNextMonth}</span>
                  </div>
                </div>
              </div>

              {/* Alerts and Recommendations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2 border-t border-indigo-500/10">
                {/* Alerts */}
                <div className="bg-white/5 border border-white/5 p-4 rounded-2xl space-y-3">
                  <h4 className="text-xs font-bold text-rose-300 flex items-center gap-1.5 uppercase tracking-wider">
                    <AlertTriangle size={14} /> Alertas u Observaciones
                  </h4>
                  {aiData.alerts.length > 0 ? (
                    <ul className="space-y-2">
                      {aiData.alerts.map((alert, i) => (
                        <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0"></span>
                          <span className="font-light">{alert}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No se detectaron caídas de rentabilidad ni alarmas de operación.</p>
                  )}
                </div>

                {/* Recommendations */}
                <div className="bg-white/5 border border-white/5 p-4 rounded-2xl space-y-3">
                  <h4 className="text-xs font-bold text-emerald-300 flex items-center gap-1.5 uppercase tracking-wider">
                    <Lightbulb size={14} /> Recomendaciones Estratégicas
                  </h4>
                  {aiData.recommendations.length > 0 ? (
                    <ul className="space-y-2">
                      {aiData.recommendations.map((rec, i) => (
                        <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0"></span>
                          <span className="font-light">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No hay suficientes datos para dar sugerencias en este momento.</p>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Charts Box */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Bar Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          whileHover={{ y: -4 }}
          className="bg-slate-900/40 backdrop-blur-md p-6 rounded-3xl shadow-xl border border-white/5 lg:col-span-2 transition-all hover:border-white/10 hover:shadow-blue-500/5 duration-300"
        >
          <h3 className="text-white font-bold mb-6 flex items-center justify-between tracking-tight text-sm uppercase text-slate-300">
            <span>Ingresos por Puesto</span>
            <ArrowUpRight size={18} className="text-slate-500" />
          </h3>
          <div className="h-72 w-full">
            {locationTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={locationTrends}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `L ${value}`} />
                  <Tooltip 
                    cursor={{fill: 'rgba(255,255,255,0.03)'}}
                    formatter={(value) => [`L ${value}`, 'Total']}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', color: '#f8fafc', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)' }}
                  />
                  <Bar dataKey="total" fill="url(#blueGradient)" radius={[6, 6, 0, 0]}>
                    <defs>
                      <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#1d4ed8" />
                      </linearGradient>
                    </defs>
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex bg-white/5 items-center justify-center h-full rounded-xl text-slate-500 text-sm border border-white/5">
                No hay datos suficientes
              </div>
            )}
          </div>
        </motion.div>

        {/* Right Side Stack: Trends & Pie Chart */}
        <div className="flex flex-col gap-6">
          {/* Trends */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            whileHover={{ y: -4 }}
            className="bg-slate-900/40 backdrop-blur-md p-6 rounded-3xl shadow-xl border border-white/5 flex flex-col transition-all hover:border-white/10 hover:shadow-indigo-500/5 duration-300"
          >
            <h3 className="text-white font-bold mb-6 tracking-tight text-sm uppercase text-slate-300">Tendencias (Último Conteo)</h3>
            <div className="flex-1 overflow-y-auto pr-2 space-y-3 max-h-[190px]">
              {locationTrends.length > 0 ? (
                locationTrends.map((loc, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + idx * 0.05 }}
                    key={loc.name} 
                    className="flex justify-between items-center p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white-[0.08] transition-colors"
                  >
                    <span className="text-slate-200 font-medium text-sm">{loc.name}</span>
                    <div className={`flex items-center gap-1 text-sm font-semibold p-1 px-2.5 rounded-lg ${
                      loc.trend > 0 
                        ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/15' 
                        : loc.trend < 0 
                          ? 'text-rose-400 bg-rose-500/10 border border-rose-500/15' 
                          : 'text-slate-400 bg-slate-500/10'
                    }`}>
                      {loc.trend > 0 ? <ArrowUpRight size={14} /> : loc.trend < 0 ? <ArrowDownRight size={14} /> : <Minus size={14} />}
                      <span>L {Math.abs(loc.trend).toLocaleString()}</span>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center text-slate-500 text-sm mt-4 italic">
                  Sin datos de tendencia
                </div>
              )}
            </div>
          </motion.div>

          {/* Pie Graph - Simplified view of Manager vs Owner for total */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            whileHover={{ y: -4 }}
            className="bg-slate-900/40 backdrop-blur-md p-6 rounded-3xl shadow-xl border border-white/5 flex flex-col transition-all hover:border-white/10 hover:shadow-emerald-500/5 duration-300"
          >
            <h3 className="text-white font-bold mb-4 tracking-tight text-sm uppercase text-slate-300">Distribución Total</h3>
            <div className="flex-1 flex flex-col items-center justify-center">
              {totalCollected > 0 ? (
                <div className="h-56 w-full relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Dueño (65%)', value: totalOwner },
                          { name: 'Encargados (35%)', value: totalManager }
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={75}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        <Cell fill="url(#greenGradient)" />
                        <Cell fill="url(#goldGradient)" />
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', color: '#f8fafc', borderRadius: '12px' }}/>
                    </PieChart>
                  </ResponsiveContainer>
                  
                  {/* Embedded custom 3D gradient definitions */}
                  <svg className="absolute w-0 h-0">
                    <defs>
                      <linearGradient id="greenGradient" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#047857" />
                      </linearGradient>
                      <linearGradient id="goldGradient" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#fbbf24" />
                        <stop offset="100%" stopColor="#d97706" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              ) : (
                 <div className="flex bg-white/5 items-center justify-center h-48 w-full rounded-xl text-slate-500 text-sm border border-white/5">
                  No hay datos
                </div>
              )}
              
              {totalCollected > 0 && (
                <div className="flex gap-6 mt-2 text-xs font-semibold justify-center">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span> 
                    <span className="text-slate-300">Dueño (65%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"></span>
                    <span className="text-slate-300">Encargados (35%)</span>
                  </div>
                </div>
              )}

            </div>
          </motion.div>
        </div> {/* End Right Side Stack */}

      </div>

      {/* Evolución de Ingresos Diarios */}
      <motion.div 
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.4 }}
        whileHover={{ y: -4 }}
        className="bg-slate-900/40 backdrop-blur-md p-6 rounded-3xl shadow-xl border border-white/5 transition-all hover:border-white/10 hover:shadow-emerald-500/5 duration-300"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-white font-bold flex items-center gap-2 tracking-tight text-sm uppercase text-slate-300">
              <TrendingUp size={18} className="text-emerald-400" />
              Evolución de Ingresos Diarios
            </h3>
            <p className="text-xs text-slate-400 mt-1">Historial cronológico de recaudaciones totales por día</p>
          </div>
          {highestActivityDay && (
            <div className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/15 text-emerald-400 rounded-xl text-xs flex items-center gap-2 self-start sm:self-center">
              <CalendarDays size={14} className="text-emerald-400" />
              <span>Día con mayor actividad: <strong className="font-semibold">{highestActivityDay.formattedDate}</strong> con <strong className="font-bold">L {highestActivityDay.total.toLocaleString()}</strong></span>
            </div>
          )}
        </div>

        <div className="h-80 w-full">
          {dailyRevenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyRevenueData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="formattedDate" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(value) => `L ${value}`} />
                <Tooltip 
                  cursor={{ stroke: 'rgba(255,255,255,0.08)', strokeWidth: 1.5 }}
                  formatter={(value) => [`L ${value}`, 'Ingresos']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', color: '#f8fafc', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#10b981" 
                  strokeWidth={3} 
                  activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2, fill: '#ffffff' }} 
                  dot={{ stroke: '#10b981', strokeWidth: 2, r: 4, fill: '#0f172a' }} 
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex bg-white/5 items-center justify-center h-full rounded-xl text-slate-500 text-sm border border-white/5 italic">
              Inserta registros en el conteo para ver la evolución de ingresos diarios
            </div>
          )}
        </div>
      </motion.div>

    </div>
  );
}

function StatCard({ title, value, icon, bg, color, glowClass }: { title: string, value: string, icon: React.ReactNode, bg: string, color: string, glowClass: string }) {
  return (
    <motion.div 
      whileHover={{ y: -8, scale: 1.02, rotateX: 2, rotateY: -2 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      style={{ transformStyle: 'preserve-3d', perspective: 1000 }}
      className={`bg-slate-900/60 backdrop-blur-md p-6 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center gap-4 border border-white/5 shadow-[0_15px_35px_rgba(0,0,0,0.4)] relative overflow-hidden group`}
    >
      {/* 3D Glass shine reflection overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white-[0.03] to-white-[0.08] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      <div className="absolute -inset-x-20 -top-40 bottom-40 bg-gradient-to-b from-white/5 to-transparent rotate-12 translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-1000 pointer-events-none" />
      
      {/* Soft colorized backing light */}
      <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full blur-2xl opacity-20 group-hover:opacity-35 transition-opacity duration-300 pointer-events-none ${glowClass}`} />

      <div className={`p-4 rounded-2xl flex items-center justify-center relative shrink-0 z-10 shadow-[inner_0_1px_1px_rgba(255,255,255,0.2)] ${bg} ${color} ${glowClass}`}>
        <div className="relative transform translate-z-10 group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
      </div>
      <div className="relative z-10 mt-2 sm:mt-0">
        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{title}</p>
        <p className="text-2xl font-black text-white mt-1.5 tracking-tight group-hover:text-blue-50 transition-colors">{value}</p>
      </div>
    </motion.div>
  );
}
