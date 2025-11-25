import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { BookOpen } from 'lucide-react';

interface CirclesManagementProps {
  organizationId: string;
}

export function CirclesManagement({ organizationId }: CirclesManagementProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          إدارة الحلقات
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">قريباً: إدارة الحلقات الدراسية</p>
      </CardContent>
    </Card>
  );
}
