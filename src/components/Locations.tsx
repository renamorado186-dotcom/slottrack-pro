import React, { useState } from 'react';
import { useStore } from '../store';
import { generateId } from '../utils';
import { MapPin, Plus, Edit2, Trash2, MonitorSmartphone, AlertTriangle, Calendar, Sparkles, Wrench, ShieldAlert, ListChecks, RefreshCw, CheckCircle2 } from 'lucide-react';
import { PinballRevolucionGuide } from './PinballRevolucionGuide';
import { motion } from 'motion/react';

interface DiagnosticResult {
  diagnosis: string;
  troubleshootingSteps: string[];
  preventativeActions: string[];
  safetyWarning: string;
}

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

  // AI Diagnostic States
  const [diagMachineId, setDiagMachineId] = useState('');
  const [symptomText, setSymptomText] = useState('');
  const [isLoadingDiag, setIsLoadingDiag] = useState(false);
  const [diagResult, setDiagResult] = useState<DiagnosticResult | null>(null);
  const [diagError, setDiagError] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});

  const handleDiagnostic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptomText.trim()) return;

    setIsLoadingDiag(true);
    setDiagError(null);
    setDiagResult(null);
    setCompletedSteps({});

    try {
      const selectedMac = data.machines.find(m => m.id === diagMachineId);
      const response = await fetch('/api/ai/diagnostic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          machineName: selectedMac?.name || 'Tragamonedas Genérica',
          lastMaintenanceDate: selectedMac?.lastMaintenanceDate || 'Sin registro',
          symptom: symptomText.trim()
        })
      });

      if (!response.ok) {
        throw new Error('No se pudo conectar con el motor de diagnóstico de IA.');
      }

      const resData = await response.json();
      if (resData.error) {
        throw new Error(resData.error);
      }

      setDiagResult(resData);
    } catch (err: any) {
      setDiagError(err.message || 'Ocurrió un error inesperado al procesar el diagnóstico.');
    } finally {
      setIsLoadingDiag(false);
    }
  };

  const toggleStep = (idx: number) => {
    setCompletedSteps(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

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
                  className="flex-1 p-3 bg-white/5 border border-white/10 text-white placeholder:text-slate-500 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none focus:bg-slate-800 transition-colors text-sm"
                />
                <select
                  value={newMacLocId}
                  onChange={e => setNewMacLocId(e.target.value)}
                  className="w-1/3 p-3 bg-white/5 border border-white/10 text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none focus:bg-slate-800 transition-colors text-sm"
                  required
                >
                  <option value="" disabled>Puesto...</option>
                  {data.locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
              <div className="flex gap-2 items-center">
                 <div className="flex-1 flex items-center bg-white/5 border border-white/10 rounded-xl px-3 overflow-hidden">
                   <label className="text-xs text-slate-400 whitespace-nowrap mr-2">Mantenimiento:</label>
                   <input 
                    type="date"
                    value={newMacDate}
                    onChange={e => setNewMacDate(e.target.value)}
                    className="flex-1 py-3 bg-transparent text-white focus:outline-none text-xs"
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

      {/* === CENTRO DE DIAGNÓSTICO IA === */}
      <section className="bg-slate-800/70 backdrop-blur-md rounded-3xl p-6 shadow-lg border border-white/10 space-y-6">
        <div className="flex items-center gap-3 border-b border-indigo-500/10 pb-4">
          <div className="p-2 bg-gradient-to-tr from-indigo-500 to-purple-500 text-white rounded-xl shadow-md"><Wrench size={20} /></div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Centro de Diagnóstico Técnico con IA 
              <span className="text-[10px] uppercase font-bold text-indigo-300 tracking-wider bg-indigo-500/10 border border-indigo-400/20 px-2 py-0.5 rounded-full">Gemini</span>
            </h2>
            <p className="text-xs text-slate-400">¿Fallas de tolvas, lectores o software? Describe los síntomas y deja que la IA genere un plan de calibración paso a paso.</p>
          </div>
        </div>

        <form onSubmit={handleDiagnostic} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="space-y-1.5 md:col-span-1">
            <label className="text-xs font-semibold text-slate-300">Seleccionar Máquina</label>
            <select
              value={diagMachineId}
              onChange={e => setDiagMachineId(e.target.value)}
              className="w-full p-3 text-sm bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:outline-none focus:bg-slate-800 transition-colors"
            >
              <option value="">Tragamonedas Genérica (Sin historial)</option>
              {data.machines.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5 md:col-span-2 flex flex-col sm:flex-row gap-3">
            <div className="flex-1 space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Describe el Síntoma</label>
              <input
                type="text"
                placeholder="Ej. El validador se atasca, la pantalla parpadea o no lee monedas de 5..."
                value={symptomText}
                onChange={e => setSymptomText(e.target.value)}
                className="w-full p-3 text-sm bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:bg-slate-800 transition-colors"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoadingDiag || !symptomText.trim()}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer h-11 self-end min-w-[150px]"
            >
              {isLoadingDiag ? (
                <RefreshCw size={16} className="animate-spin" />
              ) : (
                <Sparkles size={16} className="text-amber-300" />
              )}
              {isLoadingDiag ? 'Analizando...' : 'Diagnosticar'}
            </button>
          </div>
        </form>

        {diagError && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start gap-2 text-rose-400 text-xs">
            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
            <p>{diagError}</p>
          </div>
        )}

        {diagResult && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4 border-t border-white/10 animate-fade-in">
            
            {/* Diagnosis & Warning Column */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-slate-900 border border-indigo-500/20 p-5 rounded-2xl">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                  <MonitorSmartphone size={14} /> Diagnóstico Presuntivo
                </span>
                <p className="text-sm font-semibold text-white mb-2">{diagResult.diagnosis}</p>
              </div>

              {diagResult.safetyWarning && (
                <div className="bg-rose-500/5 border border-rose-500/20 p-5 rounded-2xl">
                  <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                    <ShieldAlert size={14} /> Protocolo de Seguridad Eléctrica
                  </span>
                  <p className="text-xs text-rose-300/90 leading-relaxed font-light">{diagResult.safetyWarning}</p>
                </div>
              )}
            </div>

            {/* Checklist Column */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-slate-900 border border-white/10 p-5 rounded-2xl">
                <h4 className="text-xs font-bold text-teal-400 uppercase tracking-widest flex items-center gap-1.5 mb-4">
                  <ListChecks size={16} /> Workflow de Inspección Guía (Checklist Interactivo)
                </h4>
                
                <ul className="space-y-3">
                  {diagResult.troubleshootingSteps.map((step, idx) => (
                    <li 
                      key={idx} 
                      onClick={() => toggleStep(idx)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer flex items-start gap-3 transition-colors ${
                        completedSteps[idx] 
                          ? 'bg-emerald-500/5 border-emerald-500/30 text-emerald-400' 
                          : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      <button className="shrink-0 mt-0.5">
                        {completedSteps[idx] ? (
                          <CheckCircle2 size={16} className="text-emerald-500" />
                        ) : (
                          <div className="w-4 h-4 rounded border border-slate-500"></div>
                        )}
                      </button>
                      <span className={completedSteps[idx] ? 'line-through opacity-80' : ''}>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {diagResult.preventativeActions.length > 0 && (
                <div className="p-4 bg-teal-500/5 rounded-2xl border border-teal-500/10">
                  <h5 className="text-xs font-bold text-teal-300 mb-2">Para Evitar que Vuelva a Pasar:</h5>
                  <ul className="list-disc pl-4 space-y-1 text-xs text-slate-300 font-light">
                    {diagResult.preventativeActions.map((act, i) => <li key={i}>{act}</li>)}
                  </ul>
                </div>
              )}
            </div>

          </div>
        )}
      </section>

      {/* === GUÍA TÉCNICA REVOLUCIÓN PREMIUM === */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="space-y-4"
      >
        <PinballRevolucionGuide />
      </motion.section>

    </div>
  );
}

