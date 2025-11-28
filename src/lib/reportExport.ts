import { toast } from 'sonner';

export interface ReportData {
  title: string;
  organizationName?: string;
  period?: string;
  summary?: Record<string, any>;
  sections?: ReportSection[];
  tableData?: TableData;
  generatedAt?: string;
  stats?: Record<string, any>;
  data?: any[];
}

export interface ReportSection {
  title: string;
  content: string | string[];
  type?: 'text' | 'list' | 'grid';
}

export interface TableData {
  headers: string[];
  rows: string[][];
  title?: string;
}

/**
 * تصدير تقرير كملف CSV
 */
export function exportReportToCSV(data: ReportData, fileName: string = 'report'): boolean {
  try {
    let csvContent = '\uFEFF'; // BOM للتعامل مع UTF-8
    
    // العنوان
    csvContent += `${data.title}\n\n`;
    
    // المعلومات الأساسية
    if (data.organizationName) {
      csvContent += `المؤسسة,${data.organizationName}\n`;
    }
    if (data.period) {
      csvContent += `الفترة,${data.period}\n`;
    }
    csvContent += `التاريخ,${new Date().toLocaleDateString('ar-SA')}\n\n`;
    
    // الملخص
    if (data.summary) {
      csvContent += 'الملخص\n';
      Object.entries(data.summary).forEach(([key, value]) => {
        csvContent += `${key},${value}\n`;
      });
      csvContent += '\n';
    }
    
    // الأقسام
    if (data.sections && data.sections.length > 0) {
      data.sections.forEach((section) => {
        csvContent += `${section.title}\n`;
        if (Array.isArray(section.content)) {
          section.content.forEach((item) => {
            csvContent += `"${item}"\n`;
          });
        } else {
          csvContent += `"${section.content}"\n`;
        }
        csvContent += '\n';
      });
    }
    
    // الجدول
    if (data.tableData) {
      if (data.tableData.title) {
        csvContent += `${data.tableData.title}\n`;
      }
      csvContent += data.tableData.headers.join(',') + '\n';
      data.tableData.rows.forEach((row) => {
        csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
      });
    }
    
    // تحميل الملف
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${fileName}_${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('تم تصدير التقرير بنجاح');
    return true;
  } catch (error) {
    console.error('Error exporting CSV:', error);
    toast.error('فشل في تصدير التقرير');
    return false;
  }
}

/**
 * طباعة التقرير (بديل للـ PDF)
 */
export function printReport(data: ReportData) {
  try {
    // إنشاء نافذة طباعة
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('يرجى السماح بالنوافذ المنبثقة');
      return false;
    }
    
    // بناء HTML للطباعة
    let htmlContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>${data.title}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
            padding: 40px;
            background: white;
            color: #333;
            line-height: 1.6;
          }
          .header {
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 30px;
            text-align: center;
          }
          .header h1 {
            font-size: 28px;
            margin-bottom: 10px;
          }
          .header p {
            font-size: 14px;
            opacity: 0.9;
          }
          .info-box {
            background: #f3f4f6;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
          }
          .info-box p {
            margin-bottom: 8px;
            font-size: 14px;
          }
          .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 30px;
          }
          .summary-item {
            background: #f9fafb;
            padding: 15px;
            border-radius: 8px;
            border-right: 4px solid #10b981;
          }
          .summary-item .label {
            font-size: 12px;
            color: #6b7280;
            margin-bottom: 5px;
          }
          .summary-item .value {
            font-size: 24px;
            font-weight: bold;
            color: #10b981;
          }
          .section {
            margin-bottom: 30px;
          }
          .section-title {
            background: #f3f4f6;
            padding: 12px 20px;
            border-radius: 8px;
            font-size: 18px;
            font-weight: bold;
            color: #10b981;
            margin-bottom: 15px;
          }
          .section-content {
            padding: 0 20px;
          }
          .section-content ul {
            list-style: none;
            padding: 0;
          }
          .section-content li {
            padding: 8px 0;
            border-bottom: 1px solid #f3f4f6;
          }
          .section-content li:before {
            content: "• ";
            color: #10b981;
            font-weight: bold;
            margin-left: 8px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
          }
          th {
            background: #10b981;
            color: white;
            padding: 12px;
            text-align: center;
            font-size: 14px;
          }
          td {
            padding: 10px;
            text-align: center;
            border-bottom: 1px solid #e5e7eb;
            font-size: 13px;
          }
          tr:nth-child(even) {
            background: #f9fafb;
          }
          .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
            text-align: center;
            font-size: 12px;
            color: #6b7280;
          }
          @media print {
            body { padding: 20px; }
            .header { break-inside: avoid; }
            .section { break-inside: avoid; }
            table { break-inside: auto; }
            tr { break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${data.title}</h1>
          <p>منصة تحفيظ القرآن الكريم</p>
        </div>
        
        <div class="info-box">
    `;
    
    if (data.organizationName) {
      htmlContent += `<p><strong>المؤسسة:</strong> ${data.organizationName}</p>`;
    }
    if (data.period) {
      htmlContent += `<p><strong>الفترة:</strong> ${data.period}</p>`;
    }
    htmlContent += `<p><strong>التاريخ:</strong> ${new Date().toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })}</p>`;
    htmlContent += `</div>`;
    
    // الملخص
    if (data.summary) {
      htmlContent += '<div class="summary">';
      Object.entries(data.summary).forEach(([key, value]) => {
        htmlContent += `
          <div class="summary-item">
            <div class="label">${key}</div>
            <div class="value">${value}</div>
          </div>
        `;
      });
      htmlContent += '</div>';
    }
    
    // الأقسام
    if (data.sections && data.sections.length > 0) {
      data.sections.forEach((section) => {
        htmlContent += `
          <div class="section">
            <div class="section-title">${section.title}</div>
            <div class="section-content">
        `;
        
        if (Array.isArray(section.content)) {
          htmlContent += '<ul>';
          section.content.forEach((item) => {
            htmlContent += `<li>${item}</li>`;
          });
          htmlContent += '</ul>';
        } else {
          htmlContent += `<p>${section.content}</p>`;
        }
        
        htmlContent += `
            </div>
          </div>
        `;
      });
    }
    
    // الجدول
    if (data.tableData) {
      htmlContent += '<div class="section">';
      if (data.tableData.title) {
        htmlContent += `<div class="section-title">${data.tableData.title}</div>`;
      }
      htmlContent += '<table><thead><tr>';
      data.tableData.headers.forEach((header) => {
        htmlContent += `<th>${header}</th>`;
      });
      htmlContent += '</tr></thead><tbody>';
      data.tableData.rows.forEach((row) => {
        htmlContent += '<tr>';
        row.forEach((cell) => {
          htmlContent += `<td>${cell}</td>`;
        });
        htmlContent += '</tr>';
      });
      htmlContent += '</tbody></table></div>';
    }
    
    // التذييل
    htmlContent += `
        <div class="footer">
          <p>Fisand Digital Development & Visual Production</p>
          <p>Eng. Mohammed Muayyad</p>
        </div>
      </body>
      </html>
    `;
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // الانتظار قليلاً ثم الطباعة
    setTimeout(() => {
      printWindow.print();
    }, 250);
    
    toast.success('جاهز للطباعة');
    return true;
  } catch (error) {
    console.error('Error printing report:', error);
    toast.error('فشل في طباعة ا��تقرير');
    return false;
  }
}

/**
 * تصدير بيانات الجدول فقط كـ CSV
 */
export function exportTableToCSV(tableData: TableData, fileName: string = 'table') {
  return exportReportToCSV({ title: tableData.title || 'جدول', tableData }, fileName);
}
