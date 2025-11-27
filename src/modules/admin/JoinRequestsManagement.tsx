import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { CheckCircle, XCircle, Clock, Eye, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase, isDemoMode, JoinRequest, getRoleLabel } from '../../lib/supabase';

interface JoinRequestsManagementProps {
  organizationId: string;
  userId: string;
}

export function JoinRequestsManagement({ organizationId, userId }: JoinRequestsManagementProps) {
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<JoinRequest | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, [organizationId]);

  const fetchRequests = async () => {
    try {
      // In demo mode, use empty list
      if (isDemoMode()) {
        console.log('📝 وضع العرض التوضيحي - بدون طلبات انضمام');
        setRequests([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('join_requests')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error: any) {
      console.error('Error fetching requests:', error);
      // In demo mode, show info instead of error
      if (isDemoMode()) {
        console.log('⚠️ وضع العرض التوضيحي - لا توجد بيانات حقيقية');
      } else {
        toast.error('فشل تح��يل الطلبات');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (request: JoinRequest) => {
    setProcessingId(request.id);
    
    try {
      // Demo mode - just show success message
      if (isDemoMode()) {
        toast.success('تمت الموافقة على الطلب بنجاح (Demo Mode)');
        fetchRequests();
        setProcessingId(null);
        return;
      }

      // Real Supabase operation
      // إنشاء مستخدم جديد في Supabase Auth
      const tempPassword = Math.random().toString(36).slice(-8) + 'Aa1!';
      
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: request.email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          full_name: request.full_name,
          role: request.requested_role,
          organization_id: organizationId,
        },
      });

      if (authError) throw authError;

      // إنشاء ملف شخصي للمستخدم
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          organization_id: organizationId,
          full_name: request.full_name,
          phone: request.phone,
          date_of_birth: request.date_of_birth,
          gender: request.gender,
          address: request.address,
          role: request.requested_role,
          status: 'active',
          qualifications: request.qualifications ? [request.qualifications] : null,
        });

      if (profileError) throw profileError;

      // تحديث حالة الطلب
      const { error: updateError } = await supabase
        .from('join_requests')
        .update({
          status: 'approved',
          reviewed_by: userId,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', request.id);

      if (updateError) throw updateError;

      // إرسال إشعار للمستخدم الجديد
      await supabase.from('notifications').insert({
        organization_id: organizationId,
        user_id: authData.user.id,
        title: 'تمت الموافقة على طلبك',
        message: `مرحباً ${request.full_name}، تمت الموافقة على طلب انضمامك. يمكنك الآن تسجيل الدخول باستخدام بريدك الإلكتروني. كلمة المرور المؤقتة: ${tempPassword}`,
        type: 'success',
      });

      toast.success('تمت الموافقة على الطلب بنجاح');
      fetchRequests();
    } catch (error: any) {
      console.error('Error approving request:', error);
      if (!isDemoMode()) {
        toast.error('فشل الموافقة على الطلب: ' + error.message);
      }
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest || !rejectionReason.trim()) {
      toast.error('الرجاء إدخال سبب الرفض');
      return;
    }

    setProcessingId(selectedRequest.id);

    try {
      const { error } = await supabase
        .from('join_requests')
        .update({
          status: 'rejected',
          reviewed_by: userId,
          reviewed_at: new Date().toISOString(),
          rejection_reason: rejectionReason,
        })
        .eq('id', selectedRequest.id);

      if (error) throw error;

      toast.success('تم رفض الطلب');
      setIsRejectDialogOpen(false);
      setRejectionReason('');
      setSelectedRequest(null);
      fetchRequests();
    } catch (error: any) {
      console.error('Error rejecting request:', error);
      toast.error('فشل رفض الطلب');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
          <Clock className="w-3 h-3 ml-1" />
          قيد المراجعة
        </Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
          <CheckCircle className="w-3 h-3 ml-1" />
          تمت الموافقة
        </Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">
          <XCircle className="w-3 h-3 ml-1" />
          مرفوض
        </Badge>;
      default:
        return null;
    }
  };

  const viewDetails = (request: JoinRequest) => {
    setSelectedRequest(request);
    setIsDetailDialogOpen(true);
  };

  const openRejectDialog = (request: JoinRequest) => {
    setSelectedRequest(request);
    setIsRejectDialogOpen(true);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-gray-500">جاري التحميل...</p>
        </CardContent>
      </Card>
    );
  }

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const processedRequests = requests.filter(r => r.status !== 'pending');

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>طلبات الانضمام ({pendingRequests.length})</span>
            {pendingRequests.length > 0 && (
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                {pendingRequests.length} طلب جديد
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingRequests.length === 0 ? (
            <p className="text-center text-gray-500 py-8">لا توجد طلبات جديدة</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">الاسم</TableHead>
                  <TableHead className="text-right">البريد الإلكتروني</TableHead>
                  <TableHead className="text-right">الدور المطلوب</TableHead>
                  <TableHead className="text-right">تاريخ الطلب</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>{request.full_name}</TableCell>
                    <TableCell dir="ltr" className="text-right">{request.email}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{getRoleLabel(request.requested_role)}</Badge>
                    </TableCell>
                    <TableCell>{new Date(request.created_at).toLocaleDateString('ar-SA')}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => viewDetails(request)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-green-600 hover:text-green-700"
                          onClick={() => handleApprove(request)}
                          disabled={processingId === request.id}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => openRejectDialog(request)}
                          disabled={processingId === request.id}
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Processed requests */}
      {processedRequests.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>الطلبات المعالجة</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">الاسم</TableHead>
                  <TableHead className="text-right">الدور</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">تاريخ المراجعة</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {processedRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>{request.full_name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{getRoleLabel(request.requested_role)}</Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell>
                      {request.reviewed_at ? new Date(request.reviewed_at).toLocaleDateString('ar-SA') : '-'}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => viewDetails(request)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle>تفاصيل الطلب</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-600">الاسم الكامل</Label>
                  <p className="mt-1">{selectedRequest.full_name}</p>
                </div>
                <div>
                  <Label className="text-gray-600">الدور المطلوب</Label>
                  <p className="mt-1">{getRoleLabel(selectedRequest.requested_role)}</p>
                </div>
                <div>
                  <Label className="text-gray-600">البريد الإلكتروني</Label>
                  <p className="mt-1" dir="ltr">{selectedRequest.email}</p>
                </div>
                <div>
                  <Label className="text-gray-600">رقم الجوال</Label>
                  <p className="mt-1" dir="ltr">{selectedRequest.phone}</p>
                </div>
                {selectedRequest.date_of_birth && (
                  <div>
                    <Label className="text-gray-600">تاريخ الميلاد</Label>
                    <p className="mt-1">{new Date(selectedRequest.date_of_birth).toLocaleDateString('ar-SA')}</p>
                  </div>
                )}
                {selectedRequest.gender && (
                  <div>
                    <Label className="text-gray-600">الجنس</Label>
                    <p className="mt-1">{selectedRequest.gender === 'male' ? 'ذكر' : 'أنثى'}</p>
                  </div>
                )}
              </div>

              {selectedRequest.address && (
                <div>
                  <Label className="text-gray-600">العنوان</Label>
                  <p className="mt-1">{selectedRequest.address}</p>
                </div>
              )}

              {selectedRequest.requested_role === 'student' && (
                <>
                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-3">بيانات ولي الأمر</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedRequest.guardian_name && (
                      <div>
                        <Label className="text-gray-600">اسم ولي الأمر</Label>
                        <p className="mt-1">{selectedRequest.guardian_name}</p>
                      </div>
                    )}
                    {selectedRequest.guardian_phone && (
                      <div>
                        <Label className="text-gray-600">جوال ولي الأمر</Label>
                        <p className="mt-1" dir="ltr">{selectedRequest.guardian_phone}</p>
                      </div>
                    )}
                  </div>
                </>
              )}

              {selectedRequest.qualifications && (
                <div>
                  <Label className="text-gray-600">المؤهلات</Label>
                  <p className="mt-1">{selectedRequest.qualifications}</p>
                </div>
              )}

              {selectedRequest.notes && (
                <div>
                  <Label className="text-gray-600">ملاحظات</Label>
                  <p className="mt-1">{selectedRequest.notes}</p>
                </div>
              )}

              {selectedRequest.status === 'rejected' && selectedRequest.rejection_reason && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <Label className="text-red-900">سبب الرفض</Label>
                  <p className="mt-1 text-red-800">{selectedRequest.rejection_reason}</p>
                </div>
              )}

              <div className="flex gap-2 pt-4 border-t">
                {selectedRequest.status === 'pending' && (
                  <>
                    <Button
                      onClick={() => {
                        setIsDetailDialogOpen(false);
                        handleApprove(selectedRequest);
                      }}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      disabled={processingId === selectedRequest.id}
                    >
                      <CheckCircle className="w-4 h-4 ml-2" />
                      الموافقة على الطلب
                    </Button>
                    <Button
                      onClick={() => {
                        setIsDetailDialogOpen(false);
                        openRejectDialog(selectedRequest);
                      }}
                      variant="destructive"
                      className="flex-1"
                      disabled={processingId === selectedRequest.id}
                    >
                      <XCircle className="w-4 h-4 ml-2" />
                      رفض الطلب
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>رفض الطلب</DialogTitle>
            <DialogDescription>
              الرجاء إدخال سبب رفض الطلب
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rejection_reason">سبب الرفض</Label>
              <Textarea
                id="rejection_reason"
                placeholder="اذكر سبب رفض الطلب..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleReject}
                variant="destructive"
                className="flex-1"
                disabled={!rejectionReason.trim() || processingId !== null}
              >
                تأكيد الرفض
              </Button>
              <Button
                onClick={() => {
                  setIsRejectDialogOpen(false);
                  setRejectionReason('');
                }}
                variant="outline"
                className="flex-1"
              >
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
