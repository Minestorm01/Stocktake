// src/components/VarianceReport.js
import React from 'react';
import './VarianceReport.css';

const VarianceReport = ({ scannedItems, bookStock }) => {
  // Generate a list of variances only
  const varianceData = Object.keys(bookStock).map((sku) => {
    const bookItem = bookStock[sku];
    const scanned = scannedItems[sku] || 0;
    const variance = scanned - bookItem.bookQty;
    if (variance !== 0) {
      return {
        sku,
        description: bookItem.description,
        oldSku: bookItem.oldSku || '',
        status: bookItem.active ? 'A' : 'I',
        bookQty: bookItem.bookQty,
        actualQty: scanned,
        variance,
        price: `$${bookItem.price.toFixed(2)}`,
        location: bookItem.location || 'Unknown',
        duplicate: scannedItems[sku + '_duplicate'] ? 'Y' : 'N',
        transferFlag: bookItem.transfer ? 'Y' : 'N'
      };
    }
    return null;
  }).filter(Boolean);

  return (
    <div className="variance-report">
      <h2>STOCKTAKE VARIANCE REPORTS</h2>
      <p>The following will help you read and understand your variance report form.</p>
      <p>- BOOK (is what your computer says you have)</p>
      <p>- ACTUAL (is what you scanned on the day)</p>
      <p>- VARIANCE (is the difference between the two)</p>

      <table>
        <thead>
          <tr>
            <th>A. ITEM</th>
            <th>B. DESCRIPTION</th>
            <th>C. OLD SKU NO.</th>
            <th>D. Stock (A/I)</th>
            <th>E. BOOK UNITS</th>
            <th>F. ACTUAL UNITS</th>
            <th>G. VARIANCE UNITS</th>
            <th>H. Retail Price</th>
            <th>I. LOCATION</th>
            <th>L. Counted Twice</th>
            <th>M. Transfer Flag</th>
          </tr>
        </thead>
        <tbody>
          {varianceData.map((item, index) => (
            <tr key={index}>
              <td>{item.sku}</td>
              <td>{item.description}</td>
              <td>{item.oldSku}</td>
              <td>{item.status}</td>
              <td>{item.bookQty}</td>
              <td>{item.actualQty}</td>
              <td>{item.variance}</td>
              <td>{item.price}</td>
              <td>{item.location}</td>
              <td>{item.duplicate}</td>
              <td>{item.transferFlag}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VarianceReport;
