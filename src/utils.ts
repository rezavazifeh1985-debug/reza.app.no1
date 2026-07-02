/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Helper to format currency numbers to Persian style with commas
export function formatCurrency(num: number): string {
  return new Intl.NumberFormat('fa-IR', {
    style: 'decimal',
    useGrouping: true,
  }).format(num) + ' تومان';
}

// Helper to convert standard digits to Persian digits
export function toPersianDigits(value: string | number): string {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(value).replace(/[0-9]/g, (w) => persianDigits[parseInt(w, 10)]);
}

// Convert Persian digits string back to normal digits for math
export function toEnglishDigits(value: string): string {
  const p = [/۰/g, /۱/g, /۲/g, /۳/g, /۴/g, /۵/g, /۶/g, /۷/g, /۸/g, /۹/g];
  let out = value;
  for (let i = 0; i < 10; i++) {
    out = out.replace(p[i], String(i));
  }
  return out;
}

// Generate current Gregorian date in a Persian representation
export function getPersianTodayString(): string {
  const options: Intl.DateTimeFormatOptions = {
    calendar: 'persian',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  };
  return new Intl.DateTimeFormat('fa-IR', options).format(new Date());
}

// Simple export simulation to demonstrate client-side excel downloads
export function downloadCSV(dataArray: any[], fileName: string): void {
  const jsonKeys = Object.keys(dataArray[0] || {});
  const csvHeaders = jsonKeys.join(',') + '\r\n';
  const csvRows = dataArray
    .map((row) =>
      jsonKeys
        .map((key) => {
          const cell = row[key];
          return `"${String(cell || '').replace(/"/g, '""')}"`;
        })
        .join(',')
    )
    .join('\r\n');

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + encodeURIComponent(csvHeaders + csvRows);
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', csvContent);
  downloadAnchor.setAttribute('download', `${fileName}.csv`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  document.body.removeChild(downloadAnchor);
}

// Simple print layout triggers for simulating PDF creation
export function printDocument(elementId: string): void {
  const printContent = document.getElementById(elementId);
  if (!printContent) return;

  const originalContent = document.body.innerHTML;
  const printWindow = window.open('', '_blank');
  
  if (printWindow) {
    printWindow.document.write(`
      <html lang="fa" dir="rtl">
        <head>
          <title>چاپ سند هلدینگ کاویان سپنتا</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link href="https://fonts.googleapis.com/css2?family=Vazirmatn&display=swap" rel="stylesheet">
          <style>
            body {
              font-family: 'Vazirmatn', sans-serif;
              padding: 30px;
              color: #1e293b;
              direction: rtl;
            }
            .no-print { display: none; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #cbd5e1; padding: 12px; text-align: right; }
            th { background-color: #f1f5f9; }
            .header { border-bottom: 2px solid #00b6f0; padding-bottom: 15px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
            .stamp { border: 2px solid #00b6f0; color: #00b6f0; padding: 10px; border-radius: 6px; float: left; transform: rotate(-5deg); font-weight: bold; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div class="header">
            <div>
              <h2>هلدینگ کاویان سپنتا</h2>
              <p>ستاد اداری و هماهنگ‌کننده مرکزی</p>
            </div>
            <div class="stamp">سامانه اتوماسیون هوشمند</div>
          </div>
          <div>
            ${printContent.innerHTML}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  }
}
