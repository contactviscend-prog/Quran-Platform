import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { QrCode } from 'lucide-react';

interface QRCodeScannerProps {
  teacherId: string;
  organizationId: string;
}

export function QRCodeScanner({ teacherId, organizationId }: QRCodeScannerProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="w-5 h-5" />
          ماسح رمز QR
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">قريباً: ماسح رمز QR لتسجيل الحضور</p>
      </CardContent>
    </Card>
  );
}
