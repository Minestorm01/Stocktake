import Papa from 'papaparse';

const fieldMap = {
  ITEM: ['ITEM', 'Sku', 'SKU', 'sku'],
  DESCRIPTION: ['DESCRIPTION', 'Desc', 'DESC'],
  'OLD SKU NO.': ['OLD SKU NO.', 'OldNewSku', 'OldSku'],
  STATUS: ['STATUS', 'Status'],
  'BOOK UNITS': ['BOOK UNITS', 'Soh', 'SOH'],
  'RETAIL PRICE': ['RETAIL PRICE', 'Retail'],
  'PREVIOUS COUNT': ['PREVIOUS COUNT', 'Check'],
  LOCATION: ['LOCATION', 'Loc', 'Location'],
  'SCANNED/TYPED': ['SCANNED/TYPED', 'S/T']
};

function getValue(row, keys) {
  for (const k of keys) {
    if (row[k] !== undefined && row[k] !== '') {
      return row[k];
    }
  }
  return '';
}

function normalizeRow(row) {
  const result = {};
  for (const [key, aliases] of Object.entries(fieldMap)) {
    const val = getValue(row, aliases);
    if (val !== '') {
      result[key] = val;
    }
  }
  if (!result.STATUS) result.STATUS = 'A';
  return result;
}

export function parseCsvRows(csvData) {
  const parsed = Papa.parse(csvData, { header: true });
  return parsed.data
    .map(normalizeRow)
    .filter(r => r.ITEM);
}
