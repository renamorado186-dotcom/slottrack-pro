import React, { useState } from 'react';
import { useStore } from '../store';
import { generateId } from '../utils';
import { MapPin, Plus, Edit2, Trash2, MonitorSmartphone, AlertTriangle, Calendar } from 'lucide-react';

export function Locations() {
  const { data, addLocation, updateLocation, deleteLocation, addMachine, updateMachine, deleteMachine } = useStore();
  
  const [newLocName, setNewLocName] = useState('');
  const [editingLoc, setEditingLoc] = useState<string | null>(null);
  const [editLocName, setEditLocName] = useState('');

  const [newMacName, setNewMacName] = useState('');
  const [newMacLocId, setNewMacLocId] = useState('');
  const [newMacDate, setNewMacDate] = useState('');
  const [editingMac, setEditingMac] = useState<string | null>(null);
  const [editMacName, setEditMacName] = useState('');
  const [editMacLocId, setEditMacLocId] = useState('');
  const [editMacDate, setEditMacDate] = useState('');

  const handleAddLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocName.trim()) return;
    addLocation({ id: generateId(), name: newLocName.trim() });
    setNewLocName('');
  };

  const handleAddMachine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMacName.trim() || !newMacLocId) return;
    addMachine({ 
      id: generateId(), 
      name: newMacName.trim(), 
      locationId: newMacLocId,
      lastMaintenanceDate: newMacDate || undefined
    });
    setNewMacName('');
    setNewMacDate('');
  };

  const isMaintenanceApproaching = (dateStr?: string) => {
    if (!dateStr) return false;
    const lastDate = new Date(dateStr);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - lastDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    // Maintenance approaching or overdue if it's been more than 23 days since last maintenance (assuming 30 day cycle)
    return diffDays >= 23;
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Administrar Puestos y Máquinas</h1>
        <p className="text-slate-400 text-sm">Agrega, edita o elimina lugares y dispositivos, y registra el mantenimiento.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* === PUESTOS === */}
        <section className="bg-slate-800/70 backdrop-blur-md rounded-3xl shadow-lg border border-white/10 overflow-hidden flex flex-col">
          <div className="bg-white/5 p-4 border-b border-white/10 flex items-center gap-2">
            <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg"><MapPin size={18} /></div>
            <h2 className="font-semibold text-white">Puestos Registrados</h2>
          </div>

          <div className="p-4 flex-1 flex flex-col">
            <ul className="space-y-3 mb-6 flex-1">
              {data.locations.map(loc => (
                <li key={loc.id} className="flex items-center justify-between p-3 rounded-xl border border-white/10 hover:border-white/20 transition-colors bg-white/5">
                  {editingLoc === loc.id ? (
                    <div className="flex flex-1 gap-2">
                      <input 
                        type="text"
                        value={editLocName}
                        onChange={e => setEditLocName(e.target.value)}
                        className="flex-1 p-1 px-2 border border-blue-500/50 bg-slate-900 text-white rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        autoFocus
                      />
                      <button onClick={() => { updateLocation(loc.id, editLocName); setEditingLoc(null); }} className="text-emerald-400 font-medium px-2">OK</button>
                      <button onClick={() => setEditingLoc(null)} className="text-slate-500 hover:text-slate-300">Cancel</button>
                    </div>
                  ) : (
                    <>
                      <span className="font-medium text-slate-200">{loc.name}</span>
                      <div className="flex gap-1 text-slate-500">
                        <button onClick={() => { setEditingLoc(loc.id); setEditLocName(loc.name); }} className="p-2 hover:text-blue-400 rounded"><Edit2 size={16}/></button>
                        <button onClick={() => { if (window.confirm('¿Seguro que deseas eliminar este puesto y sus máquinas?')) deleteLocation(loc.id)}} className="p-2 hover:text-rose-400 rounded"><Trash2 size={16}/></button>
                      </div>
                    </>
                  )}
                </li>
              ))}
              {data.locations.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">No hay puestos registrados.</p>
              )}
            </ul>

            <form onSubmit={handleAddLocation} className="flex gap-2 mt-auto">
              <input 
                type="text" 
                placeholder="Nombre del nuevo puesto..."
                value={newLocName}
                onChange={e => setNewLocName(e.target.value)}
                className="flex-1 p-3 bg-white/5 border border-white/10 text-white placeholder:text-slate-500 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none focus:bg-slate-800 transition-colors"
              />
              <button disabled={!newLocName.trim()} type="submit" className="bg-blue-600 hover:bg-blue-500 transition-colors text-white px-4 rounded-xl disabled:opacity-50 disabled:bg-white/5 disabled:border disabled:border-white/10 disabled:text-slate-500 cursor-pointer">
                <Plus size={20} />
              </button>
            </form>
          </div>
        </section>

        {/* === MÁQUINAS === */}
        <section className="bg-slate-800/70 backdrop-blur-md rounded-3xl shadow-lg border border-white/10 overflow-hidden flex flex-col">
          <div className="bg-white/5 p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg"><MonitorSmartphone size={18} /></div>
              <h2 className="font-semibold text-white">Máquinas (Mantenimiento)</h2>
            </div>
          </div>

          <div className="p-4 flex-1 flex flex-col">
            <ul className="space-y-3 mb-6 flex-1">
              {data.machines.map(mac => {
                const loc = data.locations.find(l => l.id === mac.locationId);
                const needsMaint = isMaintenanceApproaching(mac.lastMaintenanceDate);
                return (
                  <li key={mac.id} className={`flex flex-col p-3 rounded-xl border transition-colors bg-white/5 ${needsMaint ? 'border-amber-500/50 hover:border-amber-500/70' : 'border-white/10 hover:border-white/20'}`}>
                    {editingMac === mac.id ? (
                      <div className="flex flex-col gap-2">
                        <input 
                          type="text"
                          value={editMacName}
                          onChange={e => setEditMacName(e.target.value)}
                          placeholder="Nombre de máquina"
                          className="w-full p-1 px-2 border border-blue-500/50 bg-slate-900 text-white rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <select
                          value={editMacLocId}
                          onChange={e => setEditMacLocId(e.target.value)}
                          className="w-full p-1 px-2 border border-blue-500/50 bg-slate-900 text-white rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          {data.locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                        </select>
                        <div className="flex items-center gap-2 mt-1">
                          <label className="text-xs text-slate-400 flex items-center gap-1"><Calendar size={14}/> Último Mantenimiento:</label>
                          <input 
                            type="date"
                            value={editMacDate}
                            onChange={e => setEditMacDate(e.target.value)}
                            className="flex-1 p-1 px-2 border border-blue-500/50 bg-slate-900 text-white rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                          />
                        </div>
                        <div className="flex justify-end gap-2 mt-2">
                          <button onClick={() => setEditingMac(null)} className="text-slate-500 hover:text-slate-300 text-sm">Cancel</button>
                          <button 
                            onClick={() => { 
                              updateMachine(mac.id, editMacName, editMacLocId, editMacDate || undefined);
                              setEditingMac(null); 
                            }} 
                            className="text-emerald-400 font-medium px-2 text-sm"
                          >
                            Guardar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-200">{mac.name}</span>
                            {needsMaint && (
                              <span title="Mantenimiento Recomendado (Han pasado >23 días)" className="text-amber-400 flex items-center gap-1 text-[10px] font-bold bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                                <AlertTriangle size={12}/> Revisar
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5 flex gap-3">
                            <span className="flex items-center gap-1"><MapPin size={12}/> {loc?.name || 'Desconocido'}</span>
                            <span className="flex items-center gap-1"><Calendar size={12}/> {mac.lastMaintenanceDate || 'Sin registro'}</span>
                          </div>
                        </div>
                        <div className="flex gap-1 text-slate-500">
                          <button onClick={() => { setEditingMac(mac.id); setEditMacName(mac.name); setEditMacLocId(mac.locationId); setEditMacDate(mac.lastMaintenanceDate || ''); }} className="p-2 hover:text-blue-400 rounded"><Edit2 size={16}/></button>
                          <button onClick={() => { if (window.confirm('¿Seguro que deseas eliminar esta máquina?')) deleteMachine(mac.id)}} className="p-2 hover:text-rose-400 rounded"><Trash2 size={16}/></button>
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
              {data.machines.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">No hay máquinas registradas.</p>
              )}
            </ul>

            <form onSubmit={handleAddMachine} className="flex flex-col gap-2 mt-auto border-t border-white/10 pt-4">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Nueva máquina..."
                  value={newMacName}
                  onChange={e => setNewMacName(e.target.value)}
                  className="flex-1 p-3 bg-white/5 border border-white/10 text-white placeholder:text-slate-500 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none focus:bg-slate-800 transition-colors"
                />
                <select
                  value={newMacLocId}
                  onChange={e => setNewMacLocId(e.target.value)}
                  className="w-1/3 p-3 bg-white/5 border border-white/10 text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none focus:bg-slate-800 transition-colors"
                  required
                >
                  <option value="" disabled>Puesto...</option>
                  {data.locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
              <div className="flex gap-2 items-center">
                 <div className="flex-1 flex items-center bg-white/5 border border-white/10 rounded-xl px-3 overflow-hidden">
                   <label className="text-sm text-slate-400 whitespace-nowrap mr-2">Mantenimiento:</label>
                   <input 
                    type="date"
                    value={newMacDate}
                    onChange={e => setNewMacDate(e.target.value)}
                    className="flex-1 py-3 bg-transparent text-white focus:outline-none text-sm"
                  />
                 </div>
                <button disabled={!newMacName.trim() || !newMacLocId} type="submit" className="bg-indigo-600 hover:bg-indigo-500 transition-colors text-white px-4 py-3 rounded-xl disabled:opacity-50 disabled:bg-white/5 disabled:border disabled:border-white/10 disabled:text-slate-500 cursor-pointer">
                  <Plus size={20} />
                </button>
              </div>
            </form>
          </div>
        </section>

      </div>
    </div>
  );
}

