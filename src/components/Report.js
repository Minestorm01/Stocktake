import React from 'react';

function Report({ csvData, onDelete }) {
  return (
    <div className="report">
      <h2>📊 Report Summary</h2>

      {csvData ? (
        <>
          <p><strong>Rows Detected:</strong> {csvData.split('\n').length - 1}</p>
          <button onClick={onDelete}>🗑️ Delete File</button>
        </>
      ) : (
        <p>No CSV data loaded.</p>
      )}
    </div>
  );
}

export default Report;
