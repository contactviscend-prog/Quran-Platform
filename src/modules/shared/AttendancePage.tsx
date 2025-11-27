import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { CheckCircle, XCircle, Calendar, Search } from 'lucide-react';
import { supabase, isDemoMode } from '../../lib/supabase';
import { toast } from 'sonner';

interface AttendancePageProps {
  organizationId: string;
  userRole: string;
  userId: string;
}

interface AttendanceRecord {
  id: string;
  studentName: string;
  date: string;
  status: 'present' | 'absent' | 'excused';
  notes?: string;
}

export function AttendancePage({ organizationId, userRole, userId }: AttendancePageProps) {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchAttendanceRecords();
  }, [organizationId, userId, selectedDate]);

  useEffect(() => {
    filterRecords();
  }, [searchQuery, attendanceRecords]);

  const fetchAttendanceRecords = async () => {
    try {
      setLoading(true);

      if (isDemoMode()) {
        const mockData: AttendanceRecord[] = [
          { id: '1', studentName: 'أحمد محمد', date: selectedDate, status: 'present', notes: '' },
          { id: '2', studentName: 'فاطمة علي', date: selectedDate, status: 'present', notes: '' },
          { id: '3', studentName: 'محمود سلام', date: selectedDate, status: 'absent', notes: '' },
          { id: '4', studentName: 'نور الدين', date: selectedDate, status: 'excused', notes: 'مريض' },
        ];
        setAttendanceRecords(mockData);
        return;
      }

      const { data, error } = await supabase
        .from('attendance')
        .select(`
          id,
          date,
          status,
          notes,
          profiles!student_id(full_name)
        `)
        .eq('organization_id', organizationId)
        .eq('date', selectedDate)
        .order('date', { ascending: false });

      if (error) throw error;

      const records = (data || []).map((record: any) => ({
        id: record.id,
        studentName: record.profiles?.full_name || 'Unknown',
        date: record.date,
        status: record.status,
        notes: record.notes,
      }));

      setAttendanceRecords(records);
    } catch (error: any) {
      console.error('Error fetching attendance records:', error);
      if (!isDemoMode()) {
        toast.error('فشل في تحميل سجلات ا��حضور');
      }
    } finally {
      setLoading(false);
    }
  };

  const filterRecords = () => {
    const filtered = attendanceRecords.filter(record =>
      record.studentName.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredRecords(filtered);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
        return <Badge className="bg-green-500"><CheckCircle className="w-4 h-4 mr-1" />حاضر</Badge>;
      case 'absent':
        return <Badge className="bg-red-500"><XCircle className="w-4 h-4 mr-1" />غائب</Badge>;
      case 'excused':
        return <Badge className="bg-yellow-500">معذور</Badge>;
      default:
        return <Badge>غير محدد</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            سجل الحضور والغياب
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Input
                placeholder="ابحث عن الطالب..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              <Search className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-40"
            />
          </div>

          {loading ? (
            <div className="text-center py-8 text-gray-500">جاري التحميل...</div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-8 text-gray-500">لا توجد سجلات حضور</div>
          ) : (
            <div className="overflow-x-auto">
              <Table dir="rtl">
                <TableHeader>
                  <TableRow>
                    <TableHead>اسم الطالب</TableHead>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>ملاحظات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{record.studentName}</TableCell>
                      <TableCell>{new Date(record.date).toLocaleDateString('ar-SA')}</TableCell>
                      <TableCell>{getStatusBadge(record.status)}</TableCell>
                      <TableCell>{record.notes || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
