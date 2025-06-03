import React, { useState } from 'react';
import Papa from 'papaparse';

function Report({ csvData, onDelete }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const parsedData = Papa.parse(csvData.trim(), { header: true }).data;
  const filteredData = searchTerm
    ? parsedData.filter(
        (row) =>
          row['Product Name']?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          row['Location']?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : parsedData;

  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const toggleExpand = () => setIsExpanded((prev) => !prev);

  return (
    <div className={`report ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="report-header" onClick={toggleExpand}>
        <h2>📊 Stocktake Report</h2>
        <span>{isExpanded ? '▲' : '▼'}</span>
      </div>
      {isExpanded && (
        <div className="report-body">
          <input
            type="text"
            placeholder="Search product or location..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <table>
            <thead>
              <tr>
                <th>Location</th>
                <th>Product</th>
                <th>Count</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row, i) => (
                <tr key={i}>
                  <td>{row['Location']}</td>
                  <td>{row['Product Name']}</td>
                  <td>{row['Count']}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={onDelete} className="delete-button">🗑️ Clear</button>
        </div>
      )}
    </div>
  );
}

export default Report;
