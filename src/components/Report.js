import React, { useMemo } from "react";
import Papa from "papaparse";
import { parseCsvRows } from "../utils";

function buildReport(csvData) {
  const parsed = Papa.parse(csvData, { header: true });
  const rows = parsed.data.filter((r) => r["ITEM"]);
  const map = new Map();
 
  rows.forEach((row) => {
    const sku = row["ITEM"];
    const location = row["LOCATION"] || "Unknown";
    const flag = (row["SCANNED/TYPED"] || row["S/T"] || "").toUpperCase();
    const bookUnits = parseInt(row["BOOK UNITS"] || 0, 10);

    if (!map.has(sku)) {
      map.set(sku, {
        ITEM: sku,
        DESCRIPTION: row["DESCRIPTION"] || "",
        "OLD SKU NO.": row["OLD SKU NO."] || "",
        STATUS: row["STATUS"] || "A",
        "BOOK UNITS": 0,
        "ACTUAL UNITS": 0,
        locations: new Set(),
        locationCounts: {},
       "RETAIL PRICE": row["RETAIL PRICE"] || "",
         "PREVIOUS COUNT": row["PREVIOUS COUNT"] || "",
        countedTwice: false,
      });
    }
    const item = map.get(sku);

    if (location !== "Unknown") {
    item.locations.add(location);
      item.locations.delete("Unknown");
    } else if (item.locations.size === 0) {
      item.locations.add("Unknown");
   }

    if (flag === "S" || flag === "T") {
      item["ACTUAL UNITS"] += 1;
      item.locationCounts[location] = (item.locationCounts[location] || 0) + 1;
      if (item["ACTUAL UNITS"] > 1) item.countedTwice = true;
    } else if (!isNaN(bookUnits)) {
      item["BOOK UNITS"] += bookUnits;
    }
  });

  const data = [];
  map.forEach((item) => {
    const variance = item["ACTUAL UNITS"] - item["BOOK UNITS"];
    if (variance !== 0) {
      data.push({
        ITEM: item.ITEM,
        DESCRIPTION: item.DESCRIPTION,
        "OLD SKU NO.": item["OLD SKU NO."],
        STATUS: item.STATUS,
       "BOOK UNITS": item["BOOK UNITS"],
        "ACTUAL UNITS": item["ACTUAL UNITS"],
        "VARIANCE UNITS": variance,
        "RETAIL PRICE": item["RETAIL PRICE"],
        "PREVIOUS COUNT": item["PREVIOUS COUNT"],
          LOCATION: Object.entries(item.locationCounts)
          .map(([loc, count]) => (count > 1 ? `${loc} x${count}` : loc))
          .join(", "),
        "COUNTED TWICE": item.countedTwice ? "✓" : "",
        "TRANSFER FLAG": Math.abs(variance) <= 2 ? "⚠" : "",
      });
    }
  });
  return data;
}

function Report({ csvData, onDelete, onBack }) {
  const reportData = useMemo(() => buildReport(csvData), [csvData]);

   const columns = [
    'ITEM',
    'DESCRIPTION',
    'OLD SKU NO.',
    'STATUS',
    'BOOK UNITS',
    'ACTUAL UNITS',
    'VARIANCE UNITS',
    'RETAIL PRICE',
    'PREVIOUS COUNT',
    'LOCATION',
    'COUNTED TWICE',
    'TRANSFER FLAG'
  ];

     const download = () => {
    const csv = Papa.unparse(reportData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "variance_report.csv");
    link.click();
  };

  return (
    <div className="report-section">
      <h2>📊 Variance Report</h2>
      {reportData.length === 0 ? (
        <p>No variances found.</p>
      ) : (
        <div className="report-table-wrapper">
          <table className="report-table">
            <thead>
              <tr>
                {columns.map(col => (
                  <th key={col}>{col}</th>
                ))}
              </tr>
           </thead>
            <tbody>
              {reportData.map((row, idx) => (
                <tr key={idx}>
                  {columns.map(col => (
                    <td
                      key={col}
                      className={col === 'DESCRIPTION' ? 'description-cell' : ''}
                    >
                      {row[col] || ''}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <button onClick={download}>Download CSV</button>
      <button onClick={onBack}>Return to Login</button>
      <button onClick={onDelete}>Reset Stocktake</button>
    </div>
  );
}

export default Report;
