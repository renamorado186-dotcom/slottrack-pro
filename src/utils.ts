import { format } from 'date-fns';
import { RecordEntry, AppData } from './types';
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

export function generateFullBackupPDFReport(data: AppData) {
  const doc = new jsPDF();
  const records = data.records || [];
  const expenses = data.expenses || [];
  const locations = data.locations || [];
  const machines = data.machines || [];

  // 1. PAGE 1: PORTADA & EXECUTIVE SUMMARY - Deep Slate Header
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 210, 48, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("INFORME FINANCIERO Y RESPALDO TOTAL", 105, 22, { align: "center" });

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`Slot Track Pro  |  Generado: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 105, 32, { align: "center" });
  doc.text("Resumen Ejecutivo, Inventario, Recaudaciones e Historial de Gastos", 105, 38, { align: "center" });

  // Reset text color to slate-900
  doc.setTextColor(15, 23, 42);

  // Key Stats
  const totalGross = records.reduce((acc, r) => acc + r.total, 0);
  const totalOwner = records.reduce((acc, r) => acc + r.ownerShare, 0);
  const totalManager = records.reduce((acc, r) => acc + r.managerShare, 0);
  const totalExpenseAmount = expenses.reduce((acc, e) => acc + e.amount, 0);
  const netProfitCombined = totalGross - totalExpenseAmount;
  const netOwnerProfit = totalOwner - totalExpenseAmount;

  // Stats cards function
  const drawCard = (title: string, value: string, x: number, y: number, w: number, h: number, borderAccentRgb: [number, number, number]) => {
    doc.setFillColor(248, 250, 252);
    doc.rect(x, y, w, h, 'F');
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(0.5);
    doc.rect(x, y, w, h, 'S');
    // Top border accent
    doc.setFillColor(borderAccentRgb[0], borderAccentRgb[1], borderAccentRgb[2]);
    doc.rect(x, y, w, 3.5, 'F');
    // Labels
    doc.setTextColor(100, 116, 139); // slate-500
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "bold");
    doc.text(title.toUpperCase(), x + 5, y + 12);
    // Value
    doc.setTextColor(15, 23, 42); // slate-900
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text(value, x + 5, y + 23);
  };

  // Row 1 of cards
  drawCard("Recaudación Total (Bruta)", `L ${totalGross.toLocaleString()}`, 14, 58, 56, 32, [16, 185, 129]); // emerald
  drawCard("Egresos Totales (Gastos)", `L ${totalExpenseAmount.toLocaleString()}`, 77, 58, 56, 32, [244, 63, 94]); // rose
  drawCard("Balance Neto Global", `L ${netProfitCombined.toLocaleString()}`, 140, 58, 56, 32, [59, 130, 246]); // blue

  // Row 2 of cards
  drawCard("Parte Propietario (65%)", `L ${totalOwner.toLocaleString()}`, 14, 98, 56, 32, [99, 102, 241]); // indigo
  drawCard("Parte Encargados (35%)", `L ${totalManager.toLocaleString()}`, 77, 98, 56, 32, [245, 158, 11]); // amber
  drawCard("Rentabilidad Neto Propietario", `L ${netOwnerProfit.toLocaleString()}`, 140, 98, 56, 32, [107, 114, 128]); // slate

  // 2. STUNNING VECTOR FINANCIAL CHART DRAWING
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  doc.text("Gráfico: Historial de Operaciones Mensuales (Hasta 6 meses)", 14, 142);

  // Compile monthly data
  const monthlyDataMap: Record<string, { income: number, expense: number }> = {};
  records.forEach(r => {
    const m = (r.dateStr || new Date(r.timestamp).toISOString().split('T')[0]).substring(0, 7);
    if (!monthlyDataMap[m]) monthlyDataMap[m] = { income: 0, expense: 0 };
    monthlyDataMap[m].income += r.total;
  });
  expenses.forEach(e => {
    const m = (e.dateStr || new Date(e.timestamp).toISOString().split('T')[0]).substring(0, 7);
    if (!monthlyDataMap[m]) monthlyDataMap[m] = { income: 0, expense: 0 };
    monthlyDataMap[m].expense += e.amount;
  });

  const last6Months = Object.entries(monthlyDataMap)
    .map(([month, val]) => ({ month, ...val }))
    .sort((a,b) => a.month.localeCompare(b.month))
    .slice(-6);

  if (last6Months.length > 0) {
    // Draw chart outer box
    const cx = 14;
    const cy = 148;
    const cw = 182;
    const ch = 90;

    doc.setFillColor(250, 251, 252);
    doc.rect(cx, cy, cw, ch, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(cx, cy, cw, ch, 'S');

    // Find max value for scaling
    let maxVal = 1000;
    last6Months.forEach(m => {
      if (m.income > maxVal) maxVal = m.income;
      if (m.expense > maxVal) maxVal = m.expense;
    });
    // round maxVal to nice human units
    const numDigits = Math.floor(Math.log10(maxVal));
    const step = Math.pow(10, numDigits > 0 ? numDigits : 1);
    maxVal = Math.ceil(maxVal / step) * step;

    // Draw horizontal grid lines
    const gridRows = 4;
    doc.setLineWidth(0.2);
    doc.setDrawColor(226, 232, 240);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    
    for (let i = 0; i <= gridRows; i++) {
      const gy = cy + 10 + (gridRows - i) * 15; // bottom coordinate is cy + 70, top cy + 10
      doc.line(cx + 26, gy, cx + cw - 10, gy);
      const valLabel = Math.round((maxVal / gridRows) * i);
      doc.text(`L ${valLabel.toLocaleString()}`, cx + 4, gy + 1);
    }

    // Draw bars
    const baseLineY = cy + 70;
    const count = last6Months.length;
    const stepX = (cw - 45) / count;
    
    // Month Names mapping
    const monthNamesShort = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

    last6Months.forEach((m, idx) => {
      const bx = cx + 32 + idx * stepX;
      
      // Calculate heights
      const hIncome = Math.max(1, (m.income / maxVal) * 60);
      const hExpense = Math.max(1, (m.expense / maxVal) * 60);

      // Draw Income Bar (Green)
      doc.setFillColor(16, 185, 129); // emerald-500
      doc.rect(bx, baseLineY - hIncome, 8, hIncome, 'F');

      // Draw Expense Bar (Rose)
      doc.setFillColor(244, 63, 94); // rose-500
      doc.rect(bx + 9, baseLineY - hExpense, 8, hExpense, 'F');

      // Month Label
      let displayMonth = m.month;
      try {
        const parts = m.month.split('-');
        const moIdx = parseInt(parts[1], 10) - 1;
        displayMonth = `${monthNamesShort[moIdx]} ${parts[0].substring(2)}`;
      } catch(e){}

      doc.setFont("helvetica", "bold");
      doc.setTextColor(71, 85, 105); // slate-600
      doc.text(displayMonth, bx + 8, baseLineY + 6, { align: "center" });
    });

    // Draw Legend
    const lx = cx + 32;
    const ly = cy + 83;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);

    doc.setFillColor(16, 185, 129);
    doc.rect(lx, ly, 4, 4, 'F');
    doc.setTextColor(71, 85, 105);
    doc.text("Ingreso Bruto", lx + 6, ly + 3.5);

    doc.setFillColor(244, 63, 94);
    doc.rect(lx + 45, ly, 4, 4, 'F');
    doc.text("Egreso Operativo", lx + 51, ly + 3.5);

    // Dynamic short info block on page bottom
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(148, 163, 184);
    doc.text("Paso 1: Revise el inventario y recaudaciones detalladas en las siguientes páginas.", 105, 280, { align: "center" });
  } else {
    // Empty Chart fallback
    doc.setFillColor(248, 250, 252);
    doc.rect(14, 148, 182, 90, 'F');
    doc.setTextColor(148, 163, 184);
    doc.setFont("helvetica", "italic");
    doc.text("Faltan registros financieros para dibujar la evolución temporal.", 105, 195, { align: "center" });
  }

  // 3. PAGE 2: RESUMEN DE PUESTOS Y MAQUINARIA (INVENTARIO)
  doc.addPage();
  
  // Header
  doc.setFillColor(30, 41, 59); // slate-800
  doc.rect(0, 0, 210, 20, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("INVENTARIO Y RECAUDACIONES POR PUESTO DE TRABAJO", 105, 13, { align: "center" });

  doc.setTextColor(30, 41, 59);
  
  // Calculate locations metrics
  const locTableData = locations.map(loc => {
    const locRecords = records.filter(r => r.locationId === loc.id);
    const locIncomes = locRecords.reduce((sum, r) => sum + r.total, 0);
    const locOwner = locRecords.reduce((sum, r) => sum + r.ownerShare, 0);

    const locExpenses = expenses.filter(e => e.locationId === loc.id);
    const locExpTotal = locExpenses.reduce((sum, e) => sum + e.amount, 0);

    const locNet = locIncomes - locExpTotal;
    const machinesCount = machines.filter(m => m.locationId === loc.id).length;

    return [
      loc.name,
      `${machinesCount} Máquina(s)`,
      `L ${locIncomes.toLocaleString()}`,
      `L ${locOwner.toLocaleString()}`,
      `L ${locExpTotal.toLocaleString()}`,
      `L ${locNet.toLocaleString()}`
    ];
  });

  autoTable(doc, {
    startY: 28,
    head: [['Puesto de Trabajo', 'Capacidad', 'Total Ingresos', 'Mi Ganancia (65%)', 'Egresos Puesto', 'Rendimiento Neto']],
    body: locTableData,
    theme: 'striped',
    headStyles: { fillColor: [30, 41, 59] },
    margin: { left: 14, right: 14 }
  });

  // Machines list table
  const startYOfMachines = (doc as any).lastAutoTable.finalY + 12;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Detalle de Máquinas Conectadas", 14, startYOfMachines);

  const machinesData = machines.map(m => {
    const affiliatedLoc = locations.find(l => l.id === m.locationId)?.name || 'Sin Asignar';
    const machRecords = records.filter(r => r.machineId === m.id);
    const machineRecsTotal = machRecords.reduce((sum, r) => sum + r.total, 0);
    
    return [
      m.name,
      affiliatedLoc,
      m.lastMaintenanceDate ? format(new Date(m.lastMaintenanceDate), 'dd/MM/yyyy') : 'No registrado',
      `${machRecords.length} vez/veces`,
      `L ${machineRecsTotal.toLocaleString()}`
    ];
  });

  autoTable(doc, {
    startY: startYOfMachines + 4,
    head: [['Nombre de la Máquina', 'Puesto Afiliado', 'Último Mantenimiento', 'Registros Registrados', 'Total Recaudado']],
    body: machinesData,
    theme: 'grid',
    headStyles: { fillColor: [71, 85, 105] },
    margin: { left: 14, right: 14 }
  });

  // 4. PAGE 3: HISTORIAL RECAUDACIONES
  doc.addPage();
  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, 210, 20, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("HISTORIAL CRONOLÓGICO DE RECAUDACIONES", 105, 13, { align: "center" });

  const historicalRecsData = [...records]
    .sort((a,b) => b.timestamp - a.timestamp)
    .map(r => [
      format(new Date(r.timestamp), 'dd/MM/yyyy HH:mm'),
      r.locationName,
      r.machineName || 'N/A',
      `${r.coinCount} x L${r.coinValue}`,
      `L ${r.total.toLocaleString()}`,
      `L ${r.ownerShare.toLocaleString()}`,
      `L ${r.managerShare.toLocaleString()}`,
      r.notes || '-'
    ]);

  autoTable(doc, {
    startY: 28,
    head: [['Fecha', 'Puesto', 'Máquina', 'Detalle Monedas', 'Total Bruto', 'Mi Parte (65%)', 'Encargado (35%)', 'Notas']],
    body: historicalRecsData,
    theme: 'striped',
    headStyles: { fillColor: [15, 23, 42] },
    margin: { left: 14, right: 14 },
    styles: { fontSize: 8.5 }
  });

  // 5. PAGE 4: DETALLE DE EGRESOS
  if (expenses.length > 0) {
    doc.addPage();
    doc.setFillColor(30, 41, 59);
    doc.rect(0, 0, 210, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("HISTORIAL CRONOLÓGICO DE EGRESOS (GASTOS)", 105, 13, { align: "center" });

    const expensesTableData = [...expenses]
      .sort((a,b) => b.timestamp - a.timestamp)
      .map(e => [
        e.dateStr || format(new Date(e.timestamp), 'dd/MM/yyyy'),
        `L ${e.amount.toLocaleString()}`,
        e.category,
        e.notes,
        e.locationName || 'General (Sin Puesto)'
      ]);

    autoTable(doc, {
      startY: 28,
      head: [['Fecha', 'Monto', 'Categoría', 'Notas / Concepto', 'Puesto Afectado']],
      body: expensesTableData,
      theme: 'grid',
      headStyles: { fillColor: [244, 63, 94] },
      margin: { left: 14, right: 14 },
      styles: { fontSize: 9 }
    });
  }

  // Save full-backup-report as PDF
  doc.save(`Respaldo_Total_SlotTrackPro_${format(new Date(), 'yyyyMMdd_HHmm')}.pdf`);
}
