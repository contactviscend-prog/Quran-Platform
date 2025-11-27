import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Info, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';

export function DemoModeBanner() {
  return (
    <Alert className="bg-blue-50 border-blue-200">
      <Info className="h-4 w-4 text-blue-600" />
      <AlertTitle className="text-blue-900">وضع العرض التوضيحي</AlertTitle>
      <AlertDescription className="text-blue-800">
        <p className="mb-2">
          المنصة تعمل حالياً في وضع العرض التوضيحي بدون قاعدة بيانات حقيقية.
        </p>
        <div className="space-y-1 text-sm mb-3">
          <p>✅ يمكنك استعراض جميع واجهات المنصة</p>
          <p>⚠️ البيانات المُدخلة لن يتم حفظها</p>
        </div>
        <div className="bg-white border border-blue-200 rounded p-3 mb-3 text-sm">
          <p className="font-medium mb-2">لتفعيل قاعدة البيانات الحقيقية:</p>
          <ol className="list-decimal list-inside space-y-1 mr-2">
            <li>انتقل إلى <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">Supabase.com <ExternalLink className="w-3 h-3" /></a> وأنشئ مشروع جديد</li>
            <li>نفّذ السكريبت SQL الموجود في ملف <code className="bg-gray-100 px-1 py-0.5 rounded">QUICKSTART.md</code></li>
            <li>أضف <code className="bg-gray-100 px-1 py-0.5 rounded">VITE_SUPABASE_URL</code> و <code className="bg-gray-100 px-1 py-0.5 rounded">VITE_SUPABASE_ANON_KEY</code> إلى متغيرات البيئة</li>
          </ol>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="text-blue-600 border-blue-300 hover:bg-blue-100"
          onClick={() => window.open('https://supabase.com', '_blank')}
        >
          <ExternalLink className="w-4 h-4 ml-2" />
          إنشاء مشروع Supabase
        </Button>
      </AlertDescription>
    </Alert>
  );
}
