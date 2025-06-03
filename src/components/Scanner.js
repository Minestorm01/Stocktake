import React, { useState } from 'react';
import Papa from 'papaparse';

function Scanner({ csvData, onCsvChange }) {
  const [input, setInput] = useState('');
  const [lastMatch, setLastMatch] = useState(null);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInput(value);
    if (value.length > 1) {
      const rows = Papa.parse(csvData.trim(), { header: true }).data;
      const match = rows.find(row => row?.Code?.trim() === value.trim());
      if (match) {
        setLastMatch(match);
      } else {
        setLastMatch(null);
      }
    } else {
      setLastMatch(null);
    }
  };

  const handleUpdate = () => {
    const rows = Papa.parse(csvData.trim(), { header: true });
    const updatedRows = rows.data.map(row => {
      if (row?.Code?.trim() === input.trim()) {
        return {
          ...row,
          Counted: row.Counted === 'Yes' ? 'No' : 'Yes'
        };
      }
      return row;
    });
    const newCsv = Papa.unparse(updatedRows);
    onCsvChange(newCsv);
    setInput('');
    setLastMatch(null);
  };

  return (
    <div className="scanner">
      <input
        type="text"
        placeholder="Enter or scan a code"
        value={input}
        onChange={handleInputChange}
      />
      <button onClick={handleUpdate}>Update</button>
      {lastMatch && (
        <div className="result">
          <p><strong>Description:</strong> {lastMatch.Description}</p>
          <p><strong>Location:</strong> {lastMatch.Location}</p>
          <p><strong>Status:</strong> {lastMatch.Counted}</p>
        </div>
      )}
    </div>
  );
}

export default Scanner;
