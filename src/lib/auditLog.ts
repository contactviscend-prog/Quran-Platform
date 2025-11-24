import { supabase, isDemoMode } from './supabase';

export type AuditAction = 
  | 'USER_CREATED'
  | 'USER_UPDATED'
  | 'USER_DELETED'
  | 'USER_ROLE_CHANGED'
  | 'USER_STATUS_CHANGED'
  | 'USER_SUSPENDED'
  | 'USER_ACTIVATED'
  | 'CIRCLE_CREATED'
  | 'CIRCLE_UPDATED'
  | 'CIRCLE_DELETED'
  | 'ATTENDANCE_RECORDED'
  | 'RECITATION_RECORDED'
  | 'RECITATION_UPDATED'
  | 'REQUEST_APPROVED'
  | 'REQUEST_REJECTED'
  | 'SETTINGS_UPDATED'
  | 'PASSWORD_CHANGED'
  | 'EMAIL_CHANGED';

export interface AuditLogEntry {
  id?: string;
  organization_id: string;
  user_id: string;
  user_name?: string;
  action: AuditAction;
  target_type?: string;
  target_id?: string;
  target_name?: string;
  old_value?: any;
  new_value?: any;
  ip_address?: string;
  user_agent?: string;
  notes?: string;
  created_at?: string;
}

// مخزن محلي للسجلات في Demo Mode
let demoAuditLogs: AuditLogEntry[] = [];

/**
 * تسجيل إجراء في سجل التدقيق
 */
export const logAuditAction = async (
  organizationId: string,
  userId: string,
  userName: string,
  action: AuditAction,
  details: {
    targetType?: string;
    targetId?: string;
    targetName?: string;
    oldValue?: any;
    newValue?: any;
    notes?: string;
  } = {}
): Promise<{ success: boolean; error?: string }> => {
  try {
    const auditEntry: AuditLogEntry = {
      id: isDemoMode() ? `audit-${Date.now()}-${Math.random()}` : undefined,
      organization_id: organizationId,
      user_id: userId,
      user_name: userName,
      action,
      target_type: details.targetType,
      target_id: details.targetId,
      target_name: details.targetName,
      old_value: details.oldValue,
      new_value: details.newValue,
      notes: details.notes,
      created_at: new Date().toISOString(),
    };

    if (isDemoMode()) {
      // في Demo Mode نحفظ في الذاكرة
      demoAuditLogs.push(auditEntry);
      console.log('📝 Audit Log (Demo):', {
        action,
        user: userName,
        target: details.targetName,
        time: new Date().toLocaleTimeString('ar-SA'),
      });
      return { success: true };
    }

    // في Production نحفظ في Supabase
    const { error } = await supabase.from('audit_logs').insert([auditEntry]);

    if (error) {
      console.error('Error logging audit action:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error in logAuditAction:', error);
    return { success: false, error: error.message };
  }
};

/**
 * جلب سجلات التدقيق
 */
export const getAuditLogs = async (
  organizationId: string,
  filters?: {
    userId?: string;
    action?: AuditAction;
    targetType?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }
): Promise<{ data: AuditLogEntry[]; error?: string }> => {
  try {
    if (isDemoMode()) {
      // في Demo Mode نجلب من الذاكرة
      let filtered = demoAuditLogs.filter(log => log.organization_id === organizationId);

      if (filters?.userId) {
        filtered = filtered.filter(log => log.user_id === filters.userId);
      }
      if (filters?.action) {
        filtered = filtered.filter(log => log.action === filters.action);
      }
      if (filters?.targetType) {
        filtered = filtered.filter(log => log.target_type === filters.targetType);
      }
      if (filters?.startDate) {
        filtered = filtered.filter(log => log.created_at && log.created_at >= filters.startDate!);
      }
      if (filters?.endDate) {
        filtered = filtered.filter(log => log.created_at && log.created_at <= filters.endDate!);
      }

      // ترتيب حسب التاريخ (الأحدث أولاً)
      filtered.sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
      });

      // تطبيق الحد الأقصى
      if (filters?.limit) {
        filtered = filtered.slice(0, filters.limit);
      }

      return { data: filtered };
    }

    // في Production نجلب من Supabase
    let query = supabase
      .from('audit_logs')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (filters?.userId) {
      query = query.eq('user_id', filters.userId);
    }
    if (filters?.action) {
      query = query.eq('action', filters.action);
    }
    if (filters?.targetType) {
      query = query.eq('target_type', filters.targetType);
    }
    if (filters?.startDate) {
      query = query.gte('created_at', filters.startDate);
    }
    if (filters?.endDate) {
      query = query.lte('created_at', filters.endDate);
    }
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching audit logs:', error);
      return { data: [], error: error.message };
    }

    return { data: data || [] };
  } catch (error: any) {
    console.error('Error in getAuditLogs:', error);
    return { data: [], error: error.message };
  }
};

/**
 * حذف سجلات التدقيق القديمة (للصيانة)
 */
export const cleanupOldAuditLogs = async (
  organizationId: string,
  daysToKeep: number = 90
): Promise<{ success: boolean; deletedCount?: number; error?: string }> => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    const cutoffISO = cutoffDate.toISOString();

    if (isDemoMode()) {
      const beforeCount = demoAuditLogs.length;
      demoAuditLogs = demoAuditLogs.filter(
        log => 
          log.organization_id !== organizationId || 
          (log.created_at && log.created_at >= cutoffISO)
      );
      const deletedCount = beforeCount - demoAuditLogs.length;
      return { success: true, deletedCount };
    }

    const { data, error } = await supabase
      .from('audit_logs')
      .delete()
      .eq('organization_id', organizationId)
      .lt('created_at', cutoffISO)
      .select();

    if (error) {
      console.error('Error cleaning up audit logs:', error);
      return { success: false, error: error.message };
    }

    return { success: true, deletedCount: data?.length || 0 };
  } catch (error: any) {
    console.error('Error in cleanupOldAuditLogs:', error);
    return { success: false, error: error.message };
  }
};

/**
 * الحصول على إحصائيات سجلات التدقيق
 */
export const getAuditStats = async (
  organizationId: string,
  startDate?: string,
  endDate?: string
): Promise<{
  totalActions: number;
  actionsByType: { [key: string]: number };
  activeUsers: number;
  recentActions: AuditLogEntry[];
  error?: string;
}> => {
  try {
    const { data: logs, error } = await getAuditLogs(organizationId, {
      startDate,
      endDate,
      limit: 1000,
    });

    if (error) {
      return {
        totalActions: 0,
        actionsByType: {},
        activeUsers: 0,
        recentActions: [],
        error,
      };
    }

    const actionsByType: { [key: string]: number } = {};
    const uniqueUsers = new Set<string>();

    logs.forEach(log => {
      // عد الإجراءات حسب النوع
      actionsByType[log.action] = (actionsByType[log.action] || 0) + 1;
      // عد المستخدمين الفريدين
      uniqueUsers.add(log.user_id);
    });

    return {
      totalActions: logs.length,
      actionsByType,
      activeUsers: uniqueUsers.size,
      recentActions: logs.slice(0, 10),
    };
  } catch (error: any) {
    console.error('Error in getAuditStats:', error);
    return {
      totalActions: 0,
      actionsByType: {},
      activeUsers: 0,
      recentActions: [],
      error: error.message,
    };
  }
};

/**
 * ترجمة الإجراء إلى العربية
 */
export const getActionLabel = (action: AuditAction): string => {
  const labels: Record<AuditAction, string> = {
    USER_CREATED: 'إضافة مستخدم',
    USER_UPDATED: 'تحديث مستخدم',
    USER_DELETED: 'حذف مستخدم',
    USER_ROLE_CHANGED: 'تغيير دور المستخدم',
    USER_STATUS_CHANGED: 'تغيير حالة المستخدم',
    USER_SUSPENDED: 'تعليق مستخدم',
    USER_ACTIVATED: 'تفعيل مستخدم',
    CIRCLE_CREATED: 'إنشاء حلقة',
    CIRCLE_UPDATED: 'تحديث حلقة',
    CIRCLE_DELETED: 'حذف حلقة',
    ATTENDANCE_RECORDED: 'تسجيل حضور',
    RECITATION_RECORDED: 'تسجيل تسميع',
    RECITATION_UPDATED: 'تحديث تسميع',
    REQUEST_APPROVED: 'الموافقة على طلب',
    REQUEST_REJECTED: 'رفض طلب',
    SETTINGS_UPDATED: 'تحديث الإعدادات',
    PASSWORD_CHANGED: 'تغيير كلمة المرور',
    EMAIL_CHANGED: 'تغيير البريد الإلكتروني',
  };
  return labels[action] || action;
};

/**
 * تنسيق تفاصيل التغيير للعرض
 */
export const formatChangeDetails = (
  oldValue: any,
  newValue: any
): { label: string; old: string; new: string }[] => {
  const changes: { label: string; old: string; new: string }[] = [];

  if (typeof oldValue === 'object' && typeof newValue === 'object') {
    const keys = new Set([...Object.keys(oldValue || {}), ...Object.keys(newValue || {})]);
    
    keys.forEach(key => {
      if (oldValue?.[key] !== newValue?.[key]) {
        changes.push({
          label: key,
          old: String(oldValue?.[key] || '-'),
          new: String(newValue?.[key] || '-'),
        });
      }
    });
  } else if (oldValue !== newValue) {
    changes.push({
      label: 'القيمة',
      old: String(oldValue || '-'),
      new: String(newValue || '-'),
    });
  }

  return changes;
};
