import React from 'react';
import { format } from 'date-fns';
import { RecordEntry } from '../types';
import { Printer, Download } from 'lucide-react';
import { generateTicketPDF } from '../utils';

interface ReceiptProps {
  record: RecordEntry;
  onClose: () => void;
}

export function ReceiptModal({ record, onClose }: ReceiptProps) {
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    generateTicketPDF(record);
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/60 backdrop-blur-sm print:static print:bg-transparent">
      <div className="flex min-h-full items-center justify-center p-4 print:p-0">
        <div className="relative text-left bg-gradient-to-br from-slate-800 to-slate-900 max-w-md w-full rounded-3xl shadow-2xl border border-blue-500/50 print:shadow-none print:rounded-none print:border-none print:bg-white my-8 print:my-0 mx-auto">
          
          {/* Printable Area */}
          <div id="printable-receipt" className="p-8 print:p-4 text-slate-200 print:text-black font-mono">
          <div className="text-center mb-6 relative">
            <span className="absolute -top-2 right-0 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold print:hidden">Pagado</span>
            <h2 className="text-2xl font-bold uppercase tracking-widest border-b border-dashed border-white/20 print:border-black pb-2 mb-2 text-white print:text-black">Comprobante</h2>
            <p className="text-sm text-slate-400 print:text-slate-600">Control de Tragamonedas</p>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="font-semibold text-slate-400 print:text-slate-600">Fecha:</span>
              <span>{format(new Date(record.timestamp), 'dd/MM/yyyy HH:mm')}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-slate-400 print:text-slate-600">Puesto:</span>
              <span>{record.locationName}</span>
            </div>
            <div className="flex justify-between border-t border-white/10 print:border-slate-300 pt-3 mt-3">
              <span className="font-semibold text-slate-400 print:text-slate-600">Monedas Vendidas:</span>
              <span>{record.coinCount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-base my-2 text-white print:text-black">
              <span className="font-bold">Total Recaudado:</span>
              <span className="font-bold text-blue-400 print:text-black">L {record.total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-t border-white/10 print:border-slate-300 pt-3 mt-3 opacity-90">
              <span className="text-slate-400 print:text-slate-600">Me quedan (65%):</span>
              <span>L {record.ownerShare.toLocaleString()}</span>
            </div>
            <div className="flex justify-between opacity-90">
              <span className="text-slate-400 print:text-slate-600">Dejar al encargado (35%):</span>
              <span className="border-b border-double border-white/20 print:border-slate-800 pb-1">L {record.managerShare.toLocaleString()}</span>
            </div>
            {record.notes && (
              <div className="mt-4 pt-4 border-t border-dashed border-white/10 print:border-slate-300">
                <span className="font-semibold text-slate-400 print:text-slate-600 block mb-1">Notas:</span>
                <span className="italic opacity-80">{record.notes}</span>
              </div>
            )}
          </div>
          
          <div className="text-center mt-8 text-xs text-slate-500 print:text-slate-400 print:mt-12">
            <p>Ref: #{record.id.toUpperCase()}</p>
            <p>Generado automáticamente</p>
            <p className="mt-8 font-bold text-white print:text-slate-800">________________________</p>
            <p className="mt-1">Firma Encargado</p>
          </div>
        </div>

        {/* Action Buttons - Hidden when printing */}
        <div className="bg-white/5 p-5 flex gap-3 print:hidden border-t border-white/10">
          <button 
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-white/10 text-slate-300 bg-transparent rounded-xl hover:bg-white/5 transition-colors font-medium"
          >
            Cerrar
          </button>
          <button 
            onClick={handleDownloadPDF}
            className="flex-1 px-4 py-2.5 bg-rose-600/20 text-rose-400 border border-rose-500/30 rounded-xl hover:bg-rose-600/30 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <Download size={18} />
            PDF
          </button>
          <button 
            onClick={handlePrint}
            className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-colors font-medium flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
          >
            <Printer size={18} />
            Imprimir
          </button>
        </div>
      </div>
      </div>
    </div>
  );
}
