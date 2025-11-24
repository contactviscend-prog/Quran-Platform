import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { FileText, Download, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface ReportsPa geProps {
  organizationId: string;
  userRole: string;
}

interface Report {
  id: string;
  name: string;
  type: string;
  createdAt: string;
  period: string;
}

export function ReportsPage({ organizationId, userRole }: ReportsPa geProps) {
  const [reports] = useState<Report[]>([
    {
      id: '1',
      name: 'تقرير الحضور الشهري',
      type: 'attendance',
      createdAt: new Date().toISOString(),
      period: 'يناير 2024'
    },
    {
      id: '2',
      name: 'تقرير التسميع',
      type: 'recitation',
      createdAt: new Date().toISOString(),
      period: 'يناير 2024'
    }
  ]);

  const handleDownload = (reportId: string) => {
    toast.success('تم تحميل التقرير');
  };

  const handleView = (reportId: string) => {
    toast.success('جاري فتح التقرير');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">التقارير</h2>
        <p className="text-gray-600 text-sm mt-1">عرض وتحميل التقارير المختلفة</p>
      </div>

      <div className="grid gap-4">
        {reports.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-gray-500">لا توجد تقارير</p>
            </CardContent>
          </Card>
        ) : (
          reports.map(report => (
            <Card key={report.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-blue-600 mt-1" />
                    <div>
                      <CardTitle>{report.name}</CardTitle>
                      <p className="text-sm text-gray-500 mt-1">{report.period}</p>
                    </div>
                  </div>
                  <Badge variant="outline">{report.type}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleView(report.id)}
                  >
                    <Eye className="w-4 h-4 ml-2" />
                    عرض
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleDownload(report.id)}
                  >
                    <Download className="w-4 h-4 ml-2" />
                    تحميل
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}