import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { QrCode, Camera } from 'lucide-react';
import { toast } from 'sonner';

interface QRCodeScannerProps {
  organizationId: string;
  onScan?: (data: string) => void;
}

export function QRCodeScanner({ organizationId, onScan }: QRCodeScannerProps) {
  const [scannedData, setScannedData] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);

  const handleScan = (e: React.ChangeEvent<HTMLInputElement>) => {
    const data = e.target.value;
    if (data) {
      setScannedData(data);
      onScan?.(data);
      toast.success('تم مسح رمز الاستجابة السريعة بنجاح');
      e.target.value = '';
    }
  };

  const handleStartScanning = () => {
    setIsScanning(true);
    toast.info('موجه الكاميرا نحو رمز الاستجابة السريعة');
  };

  const handleStopScanning = () => {
    setIsScanning(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <QrCode className="w-5 h-5" />
          <CardTitle>ماسح رمز الاستجابة السريعة</CardTitle>
          {isScanning && <Badge>جاري المسح</Badge>}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          {!isScanning ? (
            <Button
              onClick={handleStartScanning}
              className="w-full"
            >
              <Camera className="w-4 h-4 ml-2" />
              بدء المسح
            </Button>
          ) : (
            <Button
              onClick={handleStopScanning}
              variant="destructive"
              className="w-full"
            >
              إيقاف المسح
            </Button>
          )}
        </div>

        {isScanning && (
          <div className="border-2 border-dashed border-blue-300 rounded-lg p-4 bg-blue-50">
            <p className="text-center text-blue-600 text-sm">
              جاري محاولة الوصول إلى الكاميرا...
            </p>
            <input
              type="text"
              autoFocus
              onChange={handleScan}
              className="mt-2 w-full p-2 border border-blue-300 rounded text-center hidden"
              placeholder="الكاميرا ستظهر هنا في المتصفح الذي يدعمها"
            />
          </div>
        )}

        {scannedData && (
          <div className="border border-green-300 rounded-lg p-4 bg-green-50">
            <p className="text-sm text-gray-600 mb-2">آخر بيانات تم مسحها:</p>
            <p className="font-mono text-green-700 break-all">{scannedData}</p>
          </div>
        )}

        <div className="text-xs text-gray-500 text-center">
          <p>تأكد من تفعيل الكاميرا في المتصفح</p>
          <p>أو استخدم جهاز يدعم الكاميرا</p>
        </div>
      </CardContent>
    </Card>
  );
}
