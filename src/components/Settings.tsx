import React, { useState } from 'react';
import { useStore } from '../store';
import { Settings, Download, Upload, Shield, Save, FileText } from 'lucide-react';
import { exportToCSV, exportBackup, generateMonthlyPDFReport, generateFullBackupPDFReport } from '../utils';
import { format } from 'date-fns';

export function SettingsView() {
  const { data, updateSettings, importData } = useStore();
  
  const [password, setPassword] = useState(data.settings.masterPassword || '');
  const [saveMessage, setSaveMessage] = useState('');
  const [reportMonth, setReportMonth] = useState(format(new Date(), 'yyyy-MM'));

  const handleSaveSecurity = () => {
    updateSettings({ masterPassword: password });
    setSaveMessage('Ajustes de seguridad guardados');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = event.target?.result as string;
        const imported = JSON.parse(json);
        // Basic validation
        if (imported.locations && imported.machines && imported.records) {
          if(window.confirm('¿Desea sobrescribir los datos actuales con este respaldo?')) {
            importData(imported);
            alert("Datos restaurados correctamente.");
          }
        } else {
          alert('El archivo no tiene el formato correcto.');
        }
      } catch (err) {
        alert('Error al leer el archivo JSON.');
      }
    };
    reader.readAsText(file);
    
    // reset input
    e.target.value = '';
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white">Ajustes y Datos</h1>
        <p className="text-slate-400 text-sm">Seguridad, exportación y copias de respaldo</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Security Box */}
        <div className="bg-slate-800/70 backdrop-blur-md p-6 rounded-3xl shadow-lg border border-white/10">
          <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
            <div className="p-3 bg-blue-500/20 text-blue-400 rounded-lg"><Shield size={20} /></div>
            <h2 className="text-lg font-semibold text-white">Seguridad</h2>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Contraseña Maestra</label>
              <input 
                type="text" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Dejar vacío para deshabilitar"
                className="w-full p-3 bg-white/5 border border-white/10 text-white placeholder:text-slate-500 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none focus:bg-slate-800 transition-colors"
              />
              <p className="text-xs text-slate-400">Si se establece una contraseña, la aplicación la pedirá al abrirse.</p>
            </div>
            
            <button 
              onClick={handleSaveSecurity}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 border border-transparent shadow-lg shadow-blue-500/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Save size={16} /> Guardar
            </button>
            {saveMessage && <p className="text-emerald-400 text-sm font-medium">{saveMessage}</p>}
          </div>
        </div>

        {/* Data Box */}
        <div className="bg-slate-800/70 backdrop-blur-md p-6 rounded-3xl shadow-lg border border-white/10">
          <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
            <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-lg"><Settings size={20} /></div>
            <h2 className="text-lg font-semibold text-white">Gestión de Datos</h2>
          </div>

          <div className="space-y-4">
            
            <div>
              <p className="text-sm font-medium text-slate-300 mb-2">Exportar Reportes (Formatos Legibles)</p>
              
              <div className="flex gap-3 mb-4">
                <input 
                  type="month" 
                  value={reportMonth}
                  onChange={(e) => setReportMonth(e.target.value)}
                  className="p-3 bg-white/5 border border-white/10 text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none focus:bg-slate-800 transition-colors"
                />
                <button 
                  onClick={() => generateMonthlyPDFReport(data.records, reportMonth)}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 px-4 py-3 rounded-xl text-sm font-semibold transition-colors"
                >
                  <FileText size={18} /> Reporte PDF
                </button>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => exportToCSV(data.records)}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-4 py-3 rounded-xl text-sm font-semibold transition-colors"
                >
                  <Download size={18} /> Exportar Excel / CSV (Todos)
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-300 mb-1">Copia de Seguridad y Reporte Visual</p>
                <p className="text-xs text-slate-500 mb-2">Descarga un documento PDF completo con estadísticas, gráficos e inventario financiero.</p>
                <button 
                  onClick={() => generateFullBackupPDFReport(data)}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 border border-transparent shadow-md px-4 py-3 rounded-xl text-sm font-bold text-white transition-all transform active:scale-95 cursor-pointer"
                >
                  <FileText size={18} /> Descargar Respaldo Total (PDF con Gráficos)
                </button>
              </div>

              <div className="border-t border-white/5 pt-3">
                <p className="text-sm font-medium text-slate-300 mb-1">Sincronización Técnica (JSON)</p>
                <p className="text-xs text-slate-500 mb-2">Útil para exportar el archivo técnico de datos y cargarlo en otro dispositivo celular.</p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button 
                    onClick={() => exportBackup(data)}
                    className="flex-1 flex items-center justify-center gap-2 bg-transparent hover:bg-white/5 text-slate-300 border border-white/10 px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Download size={14} /> Descargar Respaldo JSON
                  </button>
                  
                  <label className="flex-1 flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white cursor-pointer px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors">
                    <Upload size={14} /> Cargar Respaldo (.json)
                    <input type="file" accept=".json" className="hidden" onChange={handleImport} />
                  </label>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
