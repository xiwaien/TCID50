let xlsx;
try {
  xlsx = require('./xlsx.mini.min.js');
} catch (e) {
  console.error('Failed to load xlsx library', e);
}

const COLUMN_KEYS = [
  '测定时间',
  '实验类型',
  '算法名称',
  '初始稀释度(指数)',
  '稀释倍数',
  '每组孔数',
  '阳性孔序列',
  '最终结果'
];

function generateXLS(records, selectedCols) {
  if (!xlsx) {
    throw new Error('XLSX library not loaded');
  }

  if (!selectedCols || selectedCols.length === 0) {
    selectedCols = COLUMN_KEYS;
  }

  // Build the AoA (Array of Arrays)
  const aoa = [];

  // Header row
  aoa.push(selectedCols);

  // Data rows
  records.forEach(r => {
    const row = [];
    selectedCols.forEach(col => {
      let val = '';
      switch (col) {
        case '测定时间':
          val = r.timeStr || '';
          break;
        case '实验类型':
          val = r.expType || 'TCID50';
          break;
        case '算法名称':
          val = r.algName || '';
          break;
        case '初始稀释度(指数)':
          val = r.startExp !== undefined ? r.startExp : r.startLog;
          break;
        case '稀释倍数':
          val = r.stepFactor || Math.pow(10, r.stepLog);
          break;
        case '每组孔数':
          val = r.rep;
          break;
        case '阳性孔序列':
          val = (r.positives || []).join(', ');
          break;
        case '最终结果':
          val = r.resultStr || '';
          break;
      }
      row.push(val);
    });
    aoa.push(row);
  });

  // Create workbook and worksheet
  const ws = xlsx.utils.aoa_to_sheet(aoa);

  // Set column widths to avoid '######' for dates/long text
  const wscols = selectedCols.map(col => {
    if (col === '测定时间') return { wch: 22 }; // Wider for time
    if (col === '阳性孔序列') return { wch: 20 };
    if (col === '最终结果') return { wch: 20 };
    if (col === '算法名称') return { wch: 15 };
    return { wch: 15 };
  });
  ws['!cols'] = wscols;

  const wb = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wb, ws, "Sheet1");

  // Output as base64
  const base64Str = xlsx.write(wb, { bookType: "xlsx", type: 'base64' });
  return base64Str;
}

module.exports = { generateXLS };
