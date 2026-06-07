import React from 'react';
import { useStore } from '../store';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Coins, CircleDollarSign, TrendingUp, Users, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export function Dashboard() {
  const { data } = useStore();

  const totalCollected = data.records.reduce((acc, r) => acc + r.total, 0);
  const totalCoins = data.records.reduce((acc, r) => acc + r.coinCount, 0);
  const totalOwner = data.records.reduce((acc, r) => acc + r.ownerShare, 0);
  const totalManager = data.records.reduce((acc, r) => acc + r.managerShare, 0);
  const totalRecords = data.records.length;

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
      <div>
        <h1 className="text-2xl font-bold text-white">Panel Inicial</h1>
        <p className="text-slate-400 text-sm">Resumen general de ingresos</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Recaudado" value={`L ${totalCollected.toLocaleString()}`} icon={<CircleDollarSign size={24} />} bg="bg-blue-500/10 border border-blue-500/20" color="text-blue-400" />
        <StatCard title="Total Monedas" value={totalCoins.toLocaleString()} icon={<Coins size={24} />} bg="bg-indigo-500/10 border border-indigo-500/20" color="text-indigo-400" />
        <StatCard title="Mi Ganancia (65%)" value={`L ${totalOwner.toLocaleString()}`} icon={<TrendingUp size={24} />} bg="bg-emerald-500/10 border border-emerald-500/20" color="text-emerald-400" />
        <StatCard title="Encargados (35%)" value={`L ${totalManager.toLocaleString()}`} icon={<Users size={24} />} bg="bg-amber-500/10 border border-amber-500/20" color="text-amber-400" />
      </div>

      {/* Charts Box */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Bar Chart */}
        <div className="bg-slate-800/70 backdrop-blur-md p-6 rounded-3xl shadow-lg border border-white/10 lg:col-span-2">
          <h3 className="text-white font-semibold mb-6 flex items-center justify-between">
            Ingresos por Puesto
            <ArrowUpRight size={18} className="text-slate-500" />
          </h3>
          <div className="h-72 w-full">
            {locationTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={locationTrends}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `L ${value}`} />
                  <Tooltip 
                    cursor={{fill: 'rgba(255,255,255,0.05)'}}
                    formatter={(value) => [`L ${value}`, 'Total']}
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: 'rgba(255,255,255,0.1)', color: '#f8fafc', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)' }}
                  />
                  <Bar dataKey="total" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex bg-white/5 items-center justify-center h-full rounded-xl text-slate-500 text-sm border border-white/5">
                No hay datos suficientes
              </div>
            )}
          </div>
        </div>

        {/* Right Side Stack: Trends & Pie Chart */}
        <div className="flex flex-col gap-6">
          {/* Trends */}
          <div className="bg-slate-800/70 backdrop-blur-md p-6 rounded-3xl shadow-lg border border-white/10 flex flex-col">
          <h3 className="text-white font-semibold mb-6">Tendencias (Último Conteo)</h3>
          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            {locationTrends.length > 0 ? (
              locationTrends.map(loc => (
                <div key={loc.name} className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-slate-200 font-medium text-sm">{loc.name}</span>
                  <div className={`flex items-center gap-1 text-sm font-semibold ${loc.trend > 0 ? 'text-emerald-400' : loc.trend < 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                    {loc.trend > 0 ? <ArrowUpRight size={16} /> : loc.trend < 0 ? <ArrowDownRight size={16} /> : <Minus size={16} />}
                    L {Math.abs(loc.trend).toLocaleString()}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-slate-500 text-sm mt-4">
                Sin datos de tendencia
              </div>
            )}
          </div>
        </div>

        {/* Pie Graph - Simplified view of Manager vs Owner for total */}
        <div className="bg-slate-800/70 backdrop-blur-md p-6 rounded-3xl shadow-lg border border-white/10 flex flex-col">
          <h3 className="text-white font-semibold mb-6">Distribución Total</h3>
          <div className="flex-1 flex flex-col items-center justify-center">
            {totalCollected > 0 ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Dueño (65%)', value: totalOwner },
                        { name: 'Encargados (35%)', value: totalManager }
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      <Cell fill="#10b981" />
                      <Cell fill="#f59e0b" />
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: 'rgba(255,255,255,0.1)', color: '#f8fafc', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)' }}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
               <div className="flex bg-white/5 items-center justify-center h-full w-full rounded-xl text-slate-500 text-sm border border-white/5">
                No hay datos
              </div>
            )}
            
            {totalCollected > 0 && (
              <div className="flex gap-6 mt-4 text-sm">
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-500"></span> Dueño</div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-amber-500"></span> Encargados</div>
              </div>
            )}

          </div>
        </div>
        </div> {/* End Right Side Stack */}

      </div>

    </div>
  );
}

function StatCard({ title, value, icon, bg, color }: { title:string, value:string, icon:React.ReactNode, bg:string, color:string }) {
  return (
    <div className="bg-slate-800/70 backdrop-blur-md p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center gap-4 border border-white/10 shadow-lg">
      <div className={`p-4 rounded-xl ${bg} ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-bold text-white mt-1">{value}</p>
      </div>
    </div>
  )
}
