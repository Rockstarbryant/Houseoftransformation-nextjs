'use client';

import { Printer } from 'lucide-react';

/**
 * Redesigned Reusable Print Table Button Component
 * Embeds CSS directly in print window
 * Usage: <PrintTableButton title="My Report" columns={[...]} data={[...]} />
 */
export default function PrintTableButton({ 
  title, 
  subtitle = '', 
  columns = [], 
  data = [], 
  fileName = 'report',
  buttonText = 'Print List',
  headerInfo = null,
  footerInfo = null,
  className = ''
}) {

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    
    // Build table headers
    const tableHeaders = columns.map(col => 
      `<th>${col.header}</th>`
    ).join('');

    // Build table rows
    const tableRows = data.map((row, index) => {
      const cells = columns.map(col => {
        let value = '';
        
        // Handle nested properties (e.g., 'user.name')
        if (col.accessor.includes('.')) {
          const keys = col.accessor.split('.');
          value = keys.reduce((obj, key) => obj?.[key], row);
        } else {
          value = row[col.accessor];
        }

        // Apply custom render function if provided
        if (col.render) {
          value = col.render(value, row, index);
        }

        // Default fallback
        if (value === undefined || value === null) {
          value = col.fallback || 'N/A';
        }

        return `<td>${value}</td>`;
      }).join('');

      return `
        <tr>
          <td>${index + 1}</td>
          ${cells}
        </tr>
      `;
    }).join('');

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
              padding: 40px;
              background: #fff;
              color: #000;
            }
            .print-title {
              color: #8B1A1A;
              border-bottom: 3px solid #8B1A1A;
              padding-bottom: 10px;
              margin-bottom: 5px;
              font-size: 32px;
              font-weight: 700;
            }
            .print-subtitle {
              color: #6b7280;
              font-size: 16px;
              margin-bottom: 24px;
              font-weight: 400;
            }
            .print-header-info {
              margin: 24px 0;
              background: #f8f9fa;
              padding: 20px;
              border-radius: 8px;
              border-left: 4px solid #8B1A1A;
            }
            .print-header-info p {
              margin: 6px 0;
              font-size: 14px;
              color: #374151;
            }
            .print-header-info strong {
              color: #111827;
              font-weight: 600;
            }
            .print-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 24px;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
              border-radius: 8px;
              overflow: hidden;
            }
            .print-table th {
              background: #8B1A1A;
              color: white;
              padding: 14px 16px;
              text-align: left;
              font-weight: 600;
              font-size: 13px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .print-table td {
              padding: 12px 16px;
              border-bottom: 1px solid #e5e7eb;
              font-size: 13px;
              color: #374151;
            }
            .print-table tr:nth-child(even) {
              background-color: #f9fafb;
            }
            .print-table tr:hover {
              background: #f1f5f9;
            }
            .print-table tbody tr:last-child td {
              border-bottom: none;
            }
            .print-footer {
              margin-top: 48px;
              padding-top: 24px;
              border-top: 2px solid #e5e7eb;
              text-align: center;
              color: #6b7280;
              font-size: 13px;
            }
            .print-footer p {
              margin: 6px 0;
            }
            .print-footer strong {
              color: #374151;
              font-weight: 600;
            }
            .print-button {
              position: fixed;
              top: 24px;
              right: 24px;
              padding: 14px 28px;
              background: #8B1A1A;
              color: white;
              border: none;
              border-radius: 8px;
              cursor: pointer;
              font-weight: 600;
              box-shadow: 0 4px 12px rgba(139, 26, 26, 0.3);
              font-size: 14px;
            }
            .print-button:hover {
              background: #7f1d1d;
            }
            @media print {
              body { padding: 20px; }
              .no-print { display: none !important; }
              @page { margin: 1.5cm; }
              tr { page-break-inside: avoid; }
              .print-table { box-shadow: none; }
            }
          </style>
        </head>
        <body>
          <h1 class="print-title">${title}</h1>
          ${subtitle ? `<h2 class="print-subtitle">${subtitle}</h2>` : ''}
          
          ${headerInfo ? `
            <div class="print-header-info">
              ${headerInfo}
            </div>
          ` : ''}
          
          <table class="print-table">
            <thead>
              <tr>
                <th>#</th>
                ${tableHeaders}
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
          
          <div class="print-footer">
            ${footerInfo || `
              <p><strong>Generated on:</strong> ${new Date().toLocaleString()}</p>
              <p><strong>Total Records:</strong> ${data.length}</p>
              <p style="margin-top: 12px; font-weight: 500;">House of Transformation Church, Mombasa, Kenya</p>
            `}
          </div>
          
          <button class="print-button no-print" onclick="window.print()">
            Print PDF
          </button>
        </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  return (
    <button
      onClick={handlePrint}
      disabled={!data || data.length === 0}
      className={`
        px-4 py-2 bg-[#8B1A1A] text-white font-semibold rounded-lg 
        hover:bg-red-900 transition-colors flex items-center gap-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      <Printer size={18} />
      {buttonText}
    </button>
  );
}