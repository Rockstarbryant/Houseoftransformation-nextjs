'use client';

import { Printer } from 'lucide-react';

/**
 * Reusable Print Table Button Component
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
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body { 
              font-family: 'Segoe UI', Arial, sans-serif; 
              padding: 40px;
              background: #fff;
              color: #000;
            }
            
            h1 { 
              color: #8B1A1A; 
              border-bottom: 3px solid #8B1A1A; 
              padding-bottom: 10px;
              margin-bottom: 5px;
              font-size: 28px;
            }
            
            h2 {
              color: #666;
              font-size: 16px;
              margin-bottom: 20px;
              font-weight: normal;
            }
            
            .header-info { 
              margin: 20px 0; 
              background: #f8f9fa; 
              padding: 15px; 
              border-radius: 8px;
              border-left: 4px solid #8B1A1A;
            }
            
            .header-info p { 
              margin: 5px 0;
              font-size: 14px;
            }
            
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 20px;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            
            th { 
              background: #8B1A1A; 
              color: white; 
              padding: 12px; 
              text-align: left; 
              font-weight: bold;
              font-size: 13px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            
            td { 
              padding: 10px 12px; 
              border-bottom: 1px solid #ddd;
              font-size: 13px;
            }
            
            tr:nth-child(even) {
              background-color: #f9fafb;
            }
            
            tr:hover { 
              background: #f1f5f9; 
            }
            
            .badge { 
              padding: 4px 8px; 
              border-radius: 4px; 
              font-size: 11px; 
              font-weight: bold;
              display: inline-block;
            }
            
            .badge-green { background: #dcfce7; color: #166534; }
            .badge-blue { background: #dbeafe; color: #1e40af; }
            .badge-yellow { background: #fef3c7; color: #92400e; }
            .badge-red { background: #fee2e2; color: #991b1b; }
            .badge-gray { background: #f3f4f6; color: #374151; }
            
            .footer { 
              margin-top: 40px; 
              padding-top: 20px;
              border-top: 2px solid #e5e7eb;
              text-align: center; 
              color: #666; 
              font-size: 12px;
            }
            
            .footer p {
              margin: 5px 0;
            }
            
            .no-print { 
              display: none; 
            }
            
            @media print {
              body {
                padding: 20px;
              }
              
              .no-print { 
                display: none !important; 
              }
              
              @page {
                margin: 1cm;
              }
            }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          ${subtitle ? `<h2>${subtitle}</h2>` : ''}
          
          ${headerInfo ? `
            <div class="header-info">
              ${headerInfo}
            </div>
          ` : ''}
          
          <table>
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
          
          <div class="footer">
            ${footerInfo || `
              <p><strong>Generated on:</strong> ${new Date().toLocaleString()}</p>
              <p><strong>Total Records:</strong> ${data.length}</p>
              <p style="margin-top: 10px;">House of Transformation Church, Mombasa, Kenya</p>
            `}
          </div>
          
          <button 
            class="no-print" 
            onclick="window.print()" 
            style="
              position: fixed; 
              top: 20px; 
              right: 20px; 
              padding: 12px 24px; 
              background: #8B1A1A; 
              color: white; 
              border: none; 
              border-radius: 8px; 
              cursor: pointer; 
              font-weight: bold;
              box-shadow: 0 4px 6px rgba(0,0,0,0.2);
              font-size: 14px;
            "
          >
            🖨️ Print PDF
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
        px-4 py-2 bg-[#8B1A1A] text-white font-bold rounded-lg 
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