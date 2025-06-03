// placeholder content for src/components/Scanner.js// App.js
import React, { useState } from 'react';
import Scanner from './Scanner';
import Report from './Report';
import './styles.css';

export default function App() {
  const [view, setView] = useState('scanner');

  return (
    <div className="app-container">
      <header>
        <h1>🧾 Stocktake App</h1>
        <nav>
          <button onClick={() => setView('scanner')}>Scan Items</button>
          <button onClick={() => setView('report')}>View Report</button>
        </nav>
      </header>

      <main>
        {view === 'scanner' && <Scanner />}
        {view === 'report' && <Report />}
      </main>
    </div>
  );
}
