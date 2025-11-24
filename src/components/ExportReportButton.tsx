import { useState } from 'react';
import { Button } from './ui/button';
import { Download, Printer, FileSpreadsheet, ChevronDown } from 'lucide-react';
import { exportReportToCSV, printReport, type ReportData } from '../lib/reportExport';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface ExportReportButtonProps {
  reportData: ReportData;
  fileName?: string;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function ExportReportButton({ 
  reportData, 
  fileName = 'report',
  className = '',
  variant = 'default',
  size = 'default',
}: ExportReportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportCSV = () => {
    setIsExporting(true);
    try {
      exportReportToCSV(reportData, fileName);
    } catch (error) {
      console.error('CSV export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    setIsExporting(true);
    try {
      printReport(reportData);
    } catch (error) {
      console.error('Print error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          disabled={isExporting}
          className={className}
          variant={variant}
          size={size}
        >
          <Download className="w-4 h-4 ml-2" />
          تصدير التقرير
          <ChevronDown className="w-4 h-4 mr-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handlePrint} disabled={isExporting}>
          <Printer className="w-4 h-4 ml-2" />
          طباعة (PDF)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportCSV} disabled={isExporting}>
          <FileSpreadsheet className="w-4 h-4 ml-2" />
          تصدير Excel (CSV)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}