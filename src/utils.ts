import { format } from 'date-fns';
import { RecordEntry } from './types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function generateTicketPDF(record: RecordEntry) {
  const doc = new jsPDF();
  
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("RECIBO DE RECAUDACIÓN", 105, 20, { align: "center" });

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`Fecha: ${format(new Date(record.timestamp), 'dd/MM/yyyy HH:mm')}`, 20, 35);
  doc.text(`Recibo #: ${record.id.toUpperCase()}`, 190, 35, { align: "right" });

  doc.setLineWidth(0.5);
  doc.line(20, 40, 190, 40);

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(`Puesto: ${record.locationName}`, 20, 50);
  doc.text(`Máquina: ${record.machineName}`, 20, 58);

  doc.line(20, 65, 190, 65);

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("Monedas Contadas:", 20, 75);
  doc.text(record.coinCount.toString(), 190, 75, { align: "right" });

  doc.text("Valor de Moneda:", 20, 83);
  doc.text(`L ${record.coinValue.toLocaleString()}`, 190, 83, { align: "right" });

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("TOTAL RECAUDADO:", 20, 95);
  doc.text(`L ${record.total.toLocaleString()}`, 190, 95, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.line(20, 102, 190, 102);

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("DISTRIBUCIÓN", 105, 112, { align: "center" });

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("Me quedan (65%):", 20, 122);
  doc.text(`L ${record.ownerShare.toLocaleString()}`, 190, 122, { align: "right" });

  doc.text("Dejar al Encargado (35%):", 20, 130);
  doc.text(`L ${record.managerShare.toLocaleString()}`, 190, 130, { align: "right" });

  if (record.notes) {
    doc.line(20, 140, 190, 140);
    doc.setFont("helvetica", "bold");
    doc.text("Observaciones:", 20, 150);
    doc.setFont("helvetica", "italic");
    const splitNotes = doc.splitTextToSize(record.notes, 170);
    doc.text(splitNotes, 20, 158);
  }

  // Signature line
  doc.setLineWidth(0.5);
  doc.line(120, 250, 190, 250);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Firma Encargado", 155, 255, { align: "center" });

  doc.save(`Recibo_${record.locationName}_${format(new Date(record.timestamp), 'yyyyMMdd_HHmm')}.pdf`);
}

export function generateMonthlyPDFReport(records: RecordEntry[], monthStr: string) {
  // monthStr is expected to be 'YYYY-MM'
  
  const [year, month] = monthStr.split('-').map(Number);
  
  // Filter records by month
  const monthlyRecords = records.filter(r => {
    const d = new Date(r.timestamp);
    return d.getFullYear() === year && d.getMonth() + 1 === month;
  });

  if (monthlyRecords.length === 0) {
    alert("No hay registros para este mes.");
    return;
  }

  // Calculate totals by location
  const locationTotals: Record<string, { total: number, owner: number, manager: number }> = {};
  let totalGlobal = 0;
  let totalOwnerGlobal = 0;
  let totalManagerGlobal = 0;

  monthlyRecords.forEach(r => {
    if (!locationTotals[r.locationName]) {
      locationTotals[r.locationName] = { total: 0, owner: 0, manager: 0 };
    }
    locationTotals[r.locationName].total += r.total;
    locationTotals[r.locationName].owner += r.ownerShare;
    locationTotals[r.locationName].manager += r.managerShare;

    totalGlobal += r.total;
    totalOwnerGlobal += r.ownerShare;
    totalManagerGlobal += r.managerShare;
  });

  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(18);
  doc.text(`Reporte Mensual (${monthStr})`, 14, 20);
  
  // Summary Table
  const tableData = Object.entries(locationTotals).map(([locName, totals]) => [
    locName,
    `L ${totals.total.toLocaleString()}`,
    `L ${totals.owner.toLocaleString()}`,
    `L ${totals.manager.toLocaleString()}`
  ]);

  tableData.push([
    'TOTAL GENERAL',
    `L ${totalGlobal.toLocaleString()}`,
    `L ${totalOwnerGlobal.toLocaleString()}`,
    `L ${totalManagerGlobal.toLocaleString()}`
  ]);

  autoTable(doc, {
    startY: 30,
    head: [['Puesto', 'Total Recaudado', 'Ganancia (65%)', 'Encargado (35%)']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246] },
    footStyles: { fillColor: [30, 41, 59] },
    showFoot: 'lastPage',
    didParseCell: function (data) {
      if (data.row.index === tableData.length - 1) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.textColor = [255, 255, 255];
        data.cell.styles.fillColor = [30, 41, 59];
      }
    }
  });

  doc.save(`Reporte_Mensual_${monthStr}.pdf`);
}

export function exportToCSV(records: RecordEntry[]) {
  if (records.length === 0) {
    alert("No hay registros para exportar.");
    return;
  }

  const headers = [
    "Fecha",
    "Puesto",
    "Máquina",
    "Monedas",
    "Valor Moneda",
    "Total",
    "Ganancia (65%)",
    "Encargado (35%)",
    "Observaciones"
  ];

  const rows = records.map(r => [
    format(new Date(r.timestamp), 'dd/MM/yyyy HH:mm'),
    r.locationName,
    r.machineName,
    r.coinCount.toString(),
    r.coinValue.toString(),
    r.total.toString(),
    r.ownerShare.toString(),
    r.managerShare.toString(),
    `"${(r.notes || "").replace(/"/g, '""')}"`
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map(row => row.join(","))
  ].join("\n");

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `reporte_tragamonedas_${format(new Date(), 'yyyyMMdd')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportBackup(data: any) {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `respaldo_tragamonedas_${format(new Date(), 'yyyyMMdd_HHmm')}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function generateId() {
  return Math.random().toString(36).substring(2, 9);
}
