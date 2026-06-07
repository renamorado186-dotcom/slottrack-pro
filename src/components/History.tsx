import React, { useState, useMemo } from 'react';
import { useStore } from '../store';
import { format } from 'date-fns';
import { Search, Filter, Trash2, Printer, Edit2, X, Save } from 'lucide-react';
import { ReceiptModal } from './ReceiptModal';
import { RecordEntry } from '../types';

export function History() {
  const { data, deleteRecord, updateRecord, clearRecords } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  
  const [viewReceipt, setViewReceipt] = useState<RecordEntry | null>(null);
  const [editingRecord, setEditingRecord] = useState<RecordEntry | null>(null);

  const [editCoins, setEditCoins] = useState('');
  const [editValue, setEditValue] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editDate, setEditDate] = useState('');

  const [confirmClear, setConfirmClear] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const filteredRecords = useMemo(() => {
    return data.records.filter(r => {
      const matchSearch = String(r.notes || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          String(r.locationName || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchLoc = filterLocation ? r.locationId === filterLocation : true;
      return matchSearch && matchLoc;
    });
  }, [data.records, searchTerm, filterLocation]);

  const startEdit = (r: RecordEntry) => {
    setEditingRecord(r);
    setEditCoins(r.coinCount.toString());
    setEditValue(r.coinValue.toString());
    setEditNotes(r.notes || '');
    setEditDate(new Date(r.timestamp - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16));
  };

  const saveEdit = () => {
    if (!editingRecord) return;
    const numCoins = parseInt(editCoins) || 0;
    const valCoin = parseInt(editValue) || 0;
    if (numCoins <= 0 || valCoin <= 0) return;

    const total = numCoins * valCoin;
    const ownerShare = total * 0.65;
    const managerShare = total * 0.35;
    
    let timestamp = editingRecord.timestamp;
    let dateStr = editingRecord.dateStr;
    if (editDate) {
      timestamp = new Date(editDate).getTime();
      dateStr = new Date(timestamp).toISOString().split('T')[0];
    }

    updateRecord(editingRecord.id, {
      coinCount: numCoins,
      coinValue: valCoin,
      total,
      ownerShare,
      managerShare,
      notes: editNotes,
      timestamp,
      dateStr
    });
    setEditingRecord(null);
  };

  return (
    <div className="space-y-6">
      
      {viewReceipt && <ReceiptModal record={viewReceipt} onClose={() => setViewReceipt(null)} />}

      {editingRecord && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-900/80 backdrop-blur-sm">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative text-left bg-slate-800 rounded-3xl p-6 w-full max-w-md border border-white/10 shadow-2xl my-8 mx-auto">
              <button onClick={() => setEditingRecord(null)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg transition-colors">
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold text-white mb-6">Modificar Registro</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-300 block mb-1">Puesto</label>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-slate-400 cursor-not-allowed text-sm truncate">
                    {editingRecord.locationName}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-300 block mb-1">Fecha</label>
                  <input 
                    type="datetime-local"
                    value={editDate}
                    onChange={e => setEditDate(e.target.value)}
                    className="w-full p-2 rounded-xl border border-white/10 bg-slate-900 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-300 block mb-1">Monedas</label>
                  <input 
                    type="number"
                    min="1"
                    value={editCoins}
                    onChange={e => setEditCoins(e.target.value)}
                    className="w-full p-3 rounded-xl border border-white/10 bg-slate-900 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-300 block mb-1">Valor (L)</label>
                  <input 
                    type="number"
                    min="1"
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                    className="w-full p-3 rounded-xl border border-white/10 bg-slate-900 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-300 block mb-1">Observaciones</label>
                <textarea 
                  value={editNotes}
                  onChange={e => setEditNotes(e.target.value)}
                  className="w-full p-3 rounded-xl border border-white/10 bg-slate-900 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                  rows={2}
                />
              </div>

              <div className="pt-4 border-t border-white/10">
                <button 
                  onClick={saveEdit}
                  disabled={!parseInt(editCoins) || parseInt(editCoins) <= 0 || !parseInt(editValue) || parseInt(editValue) <= 0}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-colors flex justify-center items-center gap-2"
                >
                  <Save size={18} /> Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        </div>
        </div>
      )}

      {confirmDeleteId && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-900/80 backdrop-blur-sm">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative text-center bg-slate-800 rounded-3xl p-6 w-full max-w-sm border border-white/10 shadow-2xl my-8 mx-auto">
              <h2 className="text-xl font-bold text-white mb-4">¿Eliminar registro?</h2>
            <p className="text-slate-300 mb-6 text-sm">Esta acción no se puede deshacer.</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors font-medium"
              >
                Cancelar
              </button>
              <button 
                onClick={() => {
                  deleteRecord(confirmDeleteId);
                  setConfirmDeleteId(null);
                }}
                className="flex-1 px-4 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl transition-colors font-medium"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
        </div>
      )}

      {confirmClear && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-900/80 backdrop-blur-sm">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative text-center bg-slate-800 rounded-3xl p-6 w-full max-w-sm border border-white/10 shadow-2xl my-8 mx-auto">
              <h2 className="text-xl font-bold text-white mb-4">¿Borrar todos los registros?</h2>
            <p className="text-slate-300 mb-6 text-sm">Esto pondrá el panel inicial en cero. Esta acción es irreversible.</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setConfirmClear(false)}
                className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors font-medium"
              >
                Cancelar
              </button>
              <button 
                onClick={() => {
                  clearRecords();
                  setConfirmClear(false);
                }}
                className="flex-1 px-4 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl transition-colors font-medium"
              >
                Sí, borrar todo
              </button>
            </div>
          </div>
        </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Historial de Registros</h1>
          <p className="text-slate-400 text-sm">Lista de conteos realizados</p>
        </div>
        {data.records.length > 0 && (
          <button 
            onClick={() => setConfirmClear(true)}
            className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl font-medium transition-colors"
          >
            <Trash2 size={18} />
            Borrar Todos
          </button>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4 bg-slate-800/70 backdrop-blur-md p-4 rounded-3xl shadow-lg border border-white/10">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text"
            placeholder="Buscar por notas o puesto..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 text-white placeholder:text-slate-500 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none focus:bg-slate-800 transition-colors"
          />
        </div>
        <div className="md:w-64 relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <select
            value={filterLocation}
            onChange={e => setFilterLocation(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-white/10 text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none"
          >
            <option value="">Todos los puestos</option>
            {data.locations.map(loc => (
              <option key={loc.id} value={loc.id}>{loc.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-slate-800/70 backdrop-blur-md rounded-3xl shadow-lg border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-white/5 text-slate-400 text-xs uppercase font-semibold border-b border-white/10">
              <tr>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Puesto</th>
                <th className="px-6 py-4">Monedas</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No se encontraron registros.
                  </td>
                </tr>
              ) : (
                filteredRecords.map(r => (
                  <tr key={r.id} className="hover:bg-white/5 transition-colors cursor-default">
                    <td className="px-6 py-4 font-medium text-white whitespace-nowrap">
                      {format(new Date(r.timestamp), 'dd/MMM/yyyy')}
                      <span className="block text-xs font-normal text-slate-500">{format(new Date(r.timestamp), 'HH:mm')}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-200 block">{r.locationName}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-medium text-slate-200">{r.coinCount.toLocaleString()}</span> <span className="text-xs text-slate-500">(L {r.coinValue})</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-blue-400 font-semibold">
                      L {r.total.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs">
                      <div className="text-emerald-400 font-semibold mb-0.5">D: L {r.ownerShare.toLocaleString()}</div>
                      <div className="text-amber-400">E: L {r.managerShare.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button 
                          onClick={() => setViewReceipt(r)}
                          className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                          title="Ver Comprobante"
                        >
                          <Printer size={18} />
                        </button>
                        <button 
                          onClick={() => startEdit(r)}
                          className="p-2 text-emerald-400 hover:bg-emerald-500/20 rounded-lg transition-colors"
                          title="Editar registro"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => setConfirmDeleteId(r.id)}
                          className="p-2 text-rose-400 hover:bg-rose-500/20 rounded-lg transition-colors"
                          title="Eliminar registro"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
