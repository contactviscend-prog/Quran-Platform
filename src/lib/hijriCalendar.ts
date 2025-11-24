// نظام التقويم الهجري الإسلامي

export interface HijriDate {
  day: number;
  month: number;
  year: number;
  monthName: string;
  dayName: string;
  formatted: string;
}

// أسماء الأشهر الهجرية
export const hijriMonths = [
  'محرم',
  'صفر',
  'ربيع الأول',
  'ربيع الثاني',
  'جمادى الأولى',
  'جمادى الآخرة',
  'رجب',
  'شعبان',
  'رمضان',
  'شوال',
  'ذو القعدة',
  'ذو الحجة',
];

// أسماء أيام الأسبوع
export const arabicDayNames = [
  'الأحد',
  'الاثنين',
  'الثلاثاء',
  'الأربعاء',
  'الخميس',
  'الجمعة',
  'السبت',
];

/**
 * تحويل التاريخ الميلادي إلى هجري (تقريبي)
 * هذه دالة تقريبية - في بيئة الإنتاج يجب استخدام مكتبة متخصصة
 */
export function gregorianToHijri(date: Date = new Date()): HijriDate {
  // الفرق التقريبي بين التقويمين
  const gregorianYear = date.getFullYear();
  const gregorianMonth = date.getMonth() + 1;
  const gregorianDay = date.getDate();
  
  // حساب تقريبي للسنة الهجرية
  // السنة الهجرية = (السنة الميلادية - 622) × 1.030684
  const hijriYear = Math.floor((gregorianYear - 622) * 1.030684);
  
  // حساب تقريبي للشهر والي وم (يحتاج تحسين بمكتبة متخصصة)
  // هذا مجرد تقريب بسيط
  const dayOfYear = getDayOfYear(date);
  const hijriMonthEstimate = Math.floor((dayOfYear / 354) * 12) + 1;
  const hijriDayEstimate = Math.floor((dayOfYear % 30)) + 1;
  
  const month = Math.min(hijriMonthEstimate, 12);
  const day = Math.min(hijriDayEstimate, 30);
  
  const dayName = arabicDayNames[date.getDay()];
  const monthName = hijriMonths[month - 1];
  
  return {
    day,
    month,
    year: hijriYear,
    monthName,
    dayName,
    formatted: `${dayName} ${day} ${monthName} ${hijriYear}هـ`,
  };
}

/**
 * الحصول على رقم اليوم في السنة
 */
function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

/**
 * تنسيق التاريخ الهجري
 */
export function formatHijriDate(hijriDate: HijriDate, format: 'short' | 'long' | 'full' = 'long'): string {
  switch (format) {
    case 'short':
      return `${hijriDate.day}/${hijriDate.month}/${hijriDate.year}هـ`;
    case 'long':
      return `${hijriDate.day} ${hijriDate.monthName} ${hijriDate.year}هـ`;
    case 'full':
      return `${hijriDate.dayName} ${hijriDate.day} ${hijriDate.monthName} ${hijriDate.year}هـ`;
    default:
      return hijriDate.formatted;
  }
}

/**
 * الحصول على التاريخ الهجري الحالي
 */
export function getCurrentHijriDate(): HijriDate {
  return gregorianToHijri(new Date());
}

/**
 * تحويل نص التاريخ الهجري إلى كائن HijriDate
 * مثال: "1446-03-20" => { day: 20, month: 3, year: 1446, ... }
 */
export function parseHijriDate(dateString: string): HijriDate {
  const parts = dateString.split('-');
  const year = parseInt(parts[0]);
  const month = parseInt(parts[1]);
  const day = parseInt(parts[2]);
  
  return {
    day,
    month,
    year,
    monthName: hijriMonths[month - 1],
    dayName: '', // لا نعرف يوم الأسبوع من النص فقط
    formatted: `${day} ${hijriMonths[month - 1]} ${year}هـ`,
  };
}

/**
 * تنسيق التاريخ الهجري كنص قابل للتخزين
 * مثال: { day: 20, month: 3, year: 1446 } => "1446-03-20"
 */
export function formatHijriDateForStorage(hijriDate: HijriDate): string {
  const month = hijriDate.month.toString().padStart(2, '0');
  const day = hijriDate.day.toString().padStart(2, '0');
  return `${hijriDate.year}-${month}-${day}`;
}

/**
 * إضافة أيام إلى تاريخ هجري
 */
export function addHijriDays(hijriDate: HijriDate, days: number): HijriDate {
  let newDay = hijriDate.day + days;
  let newMonth = hijriDate.month;
  let newYear = hijriDate.year;
  
  // تبسيط: نفترض كل شهر 30 يوم (السنة الهجرية 354 يوم)
  while (newDay > 30) {
    newDay -= 30;
    newMonth++;
    if (newMonth > 12) {
      newMonth = 1;
      newYear++;
    }
  }
  
  while (newDay < 1) {
    newMonth--;
    if (newMonth < 1) {
      newMonth = 12;
      newYear--;
    }
    newDay += 30;
  }
  
  return {
    day: newDay,
    month: newMonth,
    year: newYear,
    monthName: hijriMonths[newMonth - 1],
    dayName: '',
    formatted: `${newDay} ${hijriMonths[newMonth - 1]} ${newYear}هـ`,
  };
}

/**
 * مقارنة تاريخين هجريين
 * ترجع: -1 إذا كان date1 قبل date2، 0 إذا متساويان، 1 إذا كان date1 بعد date2
 */
export function compareHijriDates(date1: HijriDate, date2: HijriDate): number {
  if (date1.year !== date2.year) {
    return date1.year < date2.year ? -1 : 1;
  }
  if (date1.month !== date2.month) {
    return date1.month < date2.month ? -1 : 1;
  }
  if (date1.day !== date2.day) {
    return date1.day < date2.day ? -1 : 1;
  }
  return 0;
}

/**
 * الحصول على بداية الشهر الهجري
 */
export function getHijriMonthStart(year: number, month: number): HijriDate {
  return {
    day: 1,
    month,
    year,
    monthName: hijriMonths[month - 1],
    dayName: '',
    formatted: `1 ${hijriMonths[month - 1]} ${year}هـ`,
  };
}

/**
 * الحصول على نهاية الشهر الهجري
 */
export function getHijriMonthEnd(year: number, month: number): HijriDate {
  return {
    day: 30,
    month,
    year,
    monthName: hijriMonths[month - 1],
    dayName: '',
    formatted: `30 ${hijriMonths[month - 1]} ${year}هـ`,
  };
}

/**
 * الحصول على اليوم الهجري من نص التاريخ بصيغة YYYY-MM-DD
 */
export function getHijriDayFromString(dateString: string): string {
  // هذه دالة للتحويل التقريبي من التاريخ الميلادي
  // في بيئة الإنتاج يجب استخدام مكتبة دقيقة
  const date = new Date(dateString);
  const hijri = gregorianToHijri(date);
  return formatHijriDateForStorage(hijri);
}

/**
 * الحصول على تاريخ هجري مقروء من نص التاريخ
 */
export function getFormattedHijriFromDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const hijri = gregorianToHijri(dateObj);
  return formatHijriDate(hijri, 'long');
}
