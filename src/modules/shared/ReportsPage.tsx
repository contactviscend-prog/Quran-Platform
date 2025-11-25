import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { BarChart3 } from 'lucide-react';

interface ReportsPageProps {
  organizationId?: string;
}

export function ReportsPage({ organizationId }: ReportsPageProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          التقارير
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">قريباً: عرض التقارير والإحصائيات</p>
      </CardContent>
    </Card>
  );
}
