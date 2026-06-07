import React, { useState } from 'react';
import { useStore } from '../store';
import { generateId } from '../utils';
import { ReceiptModal } from './ReceiptModal';
import { Save, Calculator, Eraser, Banknote, ChevronDown, ChevronUp, Sparkles, RefreshCw } from 'lucide-react';
import { RecordEntry } from '../types';

export function NewRecord() {
  const { data, addRecord } = useStore();
  const [locationId, setLocationId] = useState('');
  const [machineId, setMachineId] = useState('');
  const [coinCount, setCoinCount] = useState('');
  const [coinValue, setCoinValue] = useState('5'); // Default 5 per coin
  const [notes, setNotes] = useState('');
  const [isGeneratingNotes, setIsGeneratingNotes] = useState(false);
  const [notesError, setNotesError] = useState<string | null>(null);
  
  // Format current date for datetime-local input
  const localIsoString = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  const [customDate, setCustomDate] = useState(localIsoString);
  
  const [savedRecord, setSavedRecord] = useState<RecordEntry | null>(null);

  const [showCalc, setShowCalc] = useState(false);
  const [denoms, setDenoms] = useState({
    d500: '', d200: '', d100: '', d50: '', d20: '', d10: '', d5: '', d2: '', d1: ''
  });

  const denomTotal = 
    (parseInt(denoms.d500) || 0) * 500 +
    (parseInt(denoms.d200) || 0) * 200 +
    (parseInt(denoms.d100) || 0) * 100 +
    (parseInt(denoms.d50) || 0) * 50 +
    (parseInt(denoms.d20) || 0) * 20 +
    (parseInt(denoms.d10) || 0) * 10 +
    (parseInt(denoms.d5) || 0) * 5 +
    (parseInt(denoms.d2) || 0) * 2 +
    (parseInt(denoms.d1) || 0) * 1;

  const numCoins = parseInt(coinCount) || 0;
  const valCoin = parseInt(coinValue) || 0;
  const total = numCoins * valCoin;
  const ownerShare = total * 0.65;
  const managerShare = total * 0.35;

  // Filter machines based on selected location
  const filteredMachines = data.machines.filter(m => m.locationId === locationId);

  const handleSuggestNotes = async () => {
    if (!locationId) {
      setNotesError('Por favor seleccione un puesto primero para dar contexto a la IA.');
      return;
    }
    setIsGeneratingNotes(true);
    setNotesError(null);
    try {
      const selectedLocObj = data.locations.find(l => l.id === locationId);
      const selectedMacObj = data.machines.find(m => m.id === machineId);

      const response = await fetch('/api/ai/suggest-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationName: selectedLocObj?.name || 'Desconocido',
          machineName: selectedMacObj?.name || '',
          coinCount: numCoins,
          coinValue: valCoin,
          total,
          currentNotes: notes
        })
      });

      if (!response.ok) {
        throw new Error('Lo sentimos, falló la conexión con la IA.');
      }

      const resData = await response.json();
      if (resData.error) {
        throw new Error(resData.error);
      }

      setNotes(resData.suggestedNote || '');
    } catch (err: any) {
      setNotesError(err.message || 'Error al conectar.');
    } finally {
      setIsGeneratingNotes(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationId || numCoins <= 0 || valCoin <= 0) return;

    const locName = data.locations.find(l => l.id === locationId)?.name || 'Desconocido';
    const macName = data.machines.find(m => m.id === machineId)?.name;
    const timestamp = customDate ? new Date(customDate).getTime() : Date.now();
    const date = new Date(timestamp);
    const dateStr = date.toISOString().split('T')[0];

    const record: RecordEntry = {
      id: generateId(),
      timestamp,
      dateStr,
      locationId,
      locationName: locName,
      machineId: machineId || undefined,
      machineName: macName || undefined,
      coinCount: numCoins,
      coinValue: valCoin,
      total,
      ownerShare,
      managerShare,
      notes
    };

    addRecord(record);
    setSavedRecord(record);
    
    // Reset form
    setLocationId('');
    setMachineId('');
    setCoinCount('');
    setNotes('');
    setCustomDate(new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16));
    setDenoms({ d500: '', d200: '', d100: '', d50: '', d20: '', d10: '', d5: '', d2: '', d1: '' });
    setShowCalc(false);
  };

  const handleClear = () => {
    setLocationId('');
    setMachineId('');
    setCoinCount('');
    setCoinValue('5');
    setNotes('');
    setCustomDate(new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16));
    setDenoms({ d500: '', d200: '', d100: '', d50: '', d20: '', d10: '', d5: '', d2: '', d1: '' });
    setShowCalc(false);
  };

  const handleApplyCalc = () => {
    if (denomTotal > 0 && valCoin > 0) {
      setCoinCount(Math.floor(denomTotal / valCoin).toString());
      setShowCalc(false);
    }
  };

  const handleClearCalc = () => {
    setDenoms({ d500: '', d200: '', d100: '', d50: '', d20: '', d10: '', d5: '', d2: '', d1: '' });
  };

  if (savedRecord) {
    return <ReceiptModal record={savedRecord} onClose={() => setSavedRecord(null)} />;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-white">Nuevo Conteo</h1>
      
      <form onSubmit={handleSave} className="bg-slate-800/70 backdrop-blur-md p-6 rounded-3xl shadow-lg border border-white/10 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="space-y-2 lg:col-span-2">
            <label className="text-sm font-medium text-slate-300">Fecha y Hora (Opcional - Para historiales pasados)</label>
            <input 
              type="datetime-local"
              value={customDate}
              onChange={e => setCustomDate(e.target.value)}
              className="w-full p-3 rounded-xl border border-white/10 bg-slate-900 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none focus:bg-slate-800 transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Puesto</label>
            <select 
              value={locationId} 
              onChange={e => {
                setLocationId(e.target.value);
                setMachineId(''); // reset machine selection
              }}
              className="w-full p-3 rounded-xl border border-white/10 bg-slate-900 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none focus:bg-slate-800 appearance-none"
              required
            >
              <option value="">Seleccione Puesto</option>
              {data.locations.map(loc => (
                <option key={loc.id} value={loc.id}>{loc.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Máquina (Opcional)</label>
            <select 
              value={machineId}
              onChange={e => setMachineId(e.target.value)}
              disabled={!locationId || filteredMachines.length === 0}
              className="w-full p-3 rounded-xl border border-white/10 bg-slate-900 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none focus:bg-slate-800 appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">
                {!locationId 
                  ? 'Seleccione puesto primero' 
                  : filteredMachines.length === 0 
                  ? 'Sin máquinas registradas' 
                  : 'Seleccione Máquina (Todas)'}
              </option>
              {filteredMachines.map(mac => (
                <option key={mac.id} value={mac.id}>{mac.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Cantidad de Monedas</label>
            <input 
              type="number"
              min="1"
              value={coinCount}
              onChange={e => setCoinCount(e.target.value)}
              className="w-full p-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:bg-white/10 transition-colors"
              required
              placeholder="Ej. 1500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Valor de la Moneda (Lempiras)</label>
            <input 
              type="number"
              min="1"
              value={coinValue}
              onChange={e => setCoinValue(e.target.value)}
              className="w-full p-3 rounded-xl border border-white/10 bg-white/5 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none focus:bg-white/10 transition-colors"
              required
            />
          </div>

        </div>

        {/* Cash Denomination Calculator */}
        <div className="border border-white/10 rounded-2xl overflow-hidden bg-slate-900/50">
          <button
            type="button"
            onClick={() => setShowCalc(!showCalc)}
            className="w-full p-4 flex justify-between items-center bg-white/5 hover:bg-white/10 transition-colors text-slate-200 font-medium"
          >
            <div className="flex items-center gap-2">
              <Banknote size={18} className="text-blue-400" />
              Calculadora de Denominaciones
            </div>
            {showCalc ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          
          {showCalc && (
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[500, 200, 100, 50, 20, 10, 5, 2, 1].map(bill => (
                  <div key={bill} className="flex items-center gap-2">
                    <span className="w-12 text-sm font-medium text-slate-400 text-right">L {bill}</span>
                    <input
                      type="number"
                      min="0"
                      value={denoms[`d${bill}` as keyof typeof denoms]}
                      onChange={e => setDenoms({...denoms, [`d${bill}`]: e.target.value})}
                      className="w-full p-2 text-sm rounded-lg border border-white/10 bg-black/20 text-white focus:ring-1 focus:ring-blue-500 focus:outline-none focus:bg-black/40 transition-colors"
                      placeholder="0"
                    />
                  </div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 border-t border-white/10 mt-4 gap-4">
                <div className="text-sm">
                  <span className="text-slate-400">Total efectivo: </span>
                  <span className="text-lg font-bold text-white">L {denomTotal.toLocaleString()}</span>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button type="button" onClick={handleClearCalc} className="flex-1 sm:flex-none px-3 py-2 text-sm rounded-lg bg-white/5 text-slate-300 hover:bg-white/10 transition-colors border border-white/10">Limpiar</button>
                  <button type="button" onClick={handleApplyCalc} disabled={denomTotal <= 0} className="flex-1 sm:flex-none px-3 py-2 text-sm rounded-lg bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 hover:text-blue-200 transition-colors border border-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed font-medium">Auto-completar</button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Live Calculation Box */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-blue-500/50 rounded-2xl p-6 space-y-4 shadow-lg shadow-blue-500/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="flex items-center gap-2 text-blue-400 font-semibold mb-2 border-b border-white/10 pb-3 relative z-10">
            <Calculator size={18} /> Resumen Calculado
          </div>
          
          <div className="flex justify-between items-center text-sm relative z-10">
            <span className="text-slate-400">Total Recaudado</span>
            <span className="font-bold text-white text-xl">L {total.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center text-sm relative z-10">
            <span className="text-slate-400">Me quedan (65%)</span>
            <span className="font-bold text-emerald-400 text-lg">L {ownerShare.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center text-sm relative z-10">
            <span className="text-slate-400">Dejar al encargado (35%)</span>
            <span className="font-bold text-amber-400 text-lg">L {managerShare.toLocaleString()}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-slate-300">Observaciones (Opcional)</label>
            <button
              type="button"
              onClick={handleSuggestNotes}
              disabled={isGeneratingNotes || !locationId}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isGeneratingNotes ? (
                <RefreshCw size={12} className="animate-spin" />
              ) : (
                <Sparkles size={12} className="text-amber-300 animate-pulse" />
              )}
              {isGeneratingNotes ? 'Escribiendo...' : 'Redactar con IA'}
            </button>
          </div>
          <textarea 
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="w-full p-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none focus:bg-white/10 transition-colors text-sm"
            rows={2.5}
            placeholder="Escribe algo corto o presiona el botón de IA para redactar una auditoría automática formal."
          />
          {notesError && <p className="text-xs text-rose-400 font-light">{notesError}</p>}
        </div>

        <div className="flex gap-4">
          <button 
            type="button"
            onClick={handleClear}
            className="w-1/3 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-medium py-4 rounded-xl shadow-lg transition-colors flex justify-center items-center gap-2 cursor-pointer"
          >
            <Eraser size={20} />
            Limpiar
          </button>
          
          <button 
            type="submit"
            disabled={!locationId || numCoins <= 0 || valCoin <= 0}
            className="w-2/3 bg-blue-600 hover:bg-blue-500 border border-transparent disabled:border-white/10 disabled:bg-white/5 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-medium py-4 rounded-xl shadow-lg shadow-blue-500/20 transition-colors flex justify-center items-center gap-2 text-lg cursor-pointer"
          >
            <Save size={20} />
            Guardar
          </button>
        </div>

      </form>
    </div>
  );
}
