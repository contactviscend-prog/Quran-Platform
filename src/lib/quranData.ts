// بيانات سور القرآن الكريم الكاملة

export interface Surah {
  number: number;
  name: string;
  englishName: string;
  ayahs: number;
  type: 'مكية' | 'مدنية';
  juz: number[];
  page: number;
}

export const quranSurahs: Surah[] = [
  { number: 1, name: 'الفاتحة', englishName: 'Al-Fatihah', ayahs: 7, type: 'مكية', juz: [1], page: 1 },
  { number: 2, name: 'البقرة', englishName: 'Al-Baqarah', ayahs: 286, type: 'مدنية', juz: [1, 2, 3], page: 2 },
  { number: 3, name: 'آل عمران', englishName: 'Ali \'Imran', ayahs: 200, type: 'مدنية', juz: [3, 4], page: 50 },
  { number: 4, name: 'النساء', englishName: 'An-Nisa', ayahs: 176, type: 'مدنية', juz: [4, 5, 6], page: 77 },
  { number: 5, name: 'المائدة', englishName: 'Al-Ma\'idah', ayahs: 120, type: 'مدنية', juz: [6, 7], page: 106 },
  { number: 6, name: 'الأنعام', englishName: 'Al-An\'am', ayahs: 165, type: 'مكية', juz: [7, 8], page: 128 },
  { number: 7, name: 'الأعراف', englishName: 'Al-A\'raf', ayahs: 206, type: 'مكية', juz: [8, 9], page: 151 },
  { number: 8, name: 'الأنفال', englishName: 'Al-Anfal', ayahs: 75, type: 'مدنية', juz: [9, 10], page: 177 },
  { number: 9, name: 'التوبة', englishName: 'At-Tawbah', ayahs: 129, type: 'مدنية', juz: [10, 11], page: 187 },
  { number: 10, name: 'يونس', englishName: 'Yunus', ayahs: 109, type: 'مكية', juz: [11], page: 208 },
  { number: 11, name: 'هود', englishName: 'Hud', ayahs: 123, type: 'مكية', juz: [11, 12], page: 221 },
  { number: 12, name: 'يوسف', englishName: 'Yusuf', ayahs: 111, type: 'مكية', juz: [12, 13], page: 235 },
  { number: 13, name: 'الرعد', englishName: 'Ar-Ra\'d', ayahs: 43, type: 'مدنية', juz: [13], page: 249 },
  { number: 14, name: 'إبراهيم', englishName: 'Ibrahim', ayahs: 52, type: 'مكية', juz: [13], page: 255 },
  { number: 15, name: 'الحجر', englishName: 'Al-Hijr', ayahs: 99, type: 'مكية', juz: [14], page: 262 },
  { number: 16, name: 'النحل', englishName: 'An-Nahl', ayahs: 128, type: 'مكية', juz: [14], page: 267 },
  { number: 17, name: 'الإسراء', englishName: 'Al-Isra', ayahs: 111, type: 'مكية', juz: [15], page: 282 },
  { number: 18, name: 'الكهف', englishName: 'Al-Kahf', ayahs: 110, type: 'مكية', juz: [15, 16], page: 293 },
  { number: 19, name: 'مريم', englishName: 'Maryam', ayahs: 98, type: 'مكية', juz: [16], page: 305 },
  { number: 20, name: 'طه', englishName: 'Taha', ayahs: 135, type: 'مكية', juz: [16], page: 312 },
  { number: 21, name: 'الأنبياء', englishName: 'Al-Anbya', ayahs: 112, type: 'مكية', juz: [17], page: 322 },
  { number: 22, name: 'الحج', englishName: 'Al-Hajj', ayahs: 78, type: 'مدنية', juz: [17], page: 332 },
  { number: 23, name: 'المؤمنون', englishName: 'Al-Mu\'minun', ayahs: 118, type: 'مكية', juz: [18], page: 342 },
  { number: 24, name: 'النور', englishName: 'An-Nur', ayahs: 64, type: 'مدنية', juz: [18], page: 350 },
  { number: 25, name: 'الفرقان', englishName: 'Al-Furqan', ayahs: 77, type: 'مكية', juz: [18, 19], page: 359 },
  { number: 26, name: 'الشعراء', englishName: 'Ash-Shu\'ara', ayahs: 227, type: 'مكية', juz: [19], page: 367 },
  { number: 27, name: 'النمل', englishName: 'An-Naml', ayahs: 93, type: 'مكية', juz: [19, 20], page: 377 },
  { number: 28, name: 'القصص', englishName: 'Al-Qasas', ayahs: 88, type: 'مكية', juz: [20], page: 385 },
  { number: 29, name: 'العنكبوت', englishName: 'Al-\'Ankabut', ayahs: 69, type: 'مكية', juz: [20, 21], page: 396 },
  { number: 30, name: 'الروم', englishName: 'Ar-Rum', ayahs: 60, type: 'مكية', juz: [21], page: 404 },
  { number: 31, name: 'لقمان', englishName: 'Luqman', ayahs: 34, type: 'مكية', juz: [21], page: 411 },
  { number: 32, name: 'السجدة', englishName: 'As-Sajdah', ayahs: 30, type: 'مكية', juz: [21], page: 415 },
  { number: 33, name: 'الأحزاب', englishName: 'Al-Ahzab', ayahs: 73, type: 'مدنية', juz: [21, 22], page: 418 },
  { number: 34, name: 'سبأ', englishName: 'Saba', ayahs: 54, type: 'مكية', juz: [22], page: 428 },
  { number: 35, name: 'فاطر', englishName: 'Fatir', ayahs: 45, type: 'مكية', juz: [22], page: 434 },
  { number: 36, name: 'يس', englishName: 'Ya-Sin', ayahs: 83, type: 'مكية', juz: [22, 23], page: 440 },
  { number: 37, name: 'الصافات', englishName: 'As-Saffat', ayahs: 182, type: 'مكية', juz: [23], page: 446 },
  { number: 38, name: 'ص', englishName: 'Sad', ayahs: 88, type: 'مكية', juz: [23], page: 453 },
  { number: 39, name: 'الزمر', englishName: 'Az-Zumar', ayahs: 75, type: 'مكية', juz: [23, 24], page: 458 },
  { number: 40, name: 'غافر', englishName: 'Ghafir', ayahs: 85, type: 'مكية', juz: [24], page: 467 },
  { number: 41, name: 'فصلت', englishName: 'Fussilat', ayahs: 54, type: 'مكية', juz: [24, 25], page: 477 },
  { number: 42, name: 'الشورى', englishName: 'Ash-Shuraa', ayahs: 53, type: 'مكية', juz: [25], page: 483 },
  { number: 43, name: 'الزخرف', englishName: 'Az-Zukhruf', ayahs: 89, type: 'مكية', juz: [25], page: 489 },
  { number: 44, name: 'الدخان', englishName: 'Ad-Dukhan', ayahs: 59, type: 'مكية', juz: [25], page: 496 },
  { number: 45, name: 'الجاثية', englishName: 'Al-Jathiyah', ayahs: 37, type: 'مكية', juz: [25], page: 499 },
  { number: 46, name: 'الأحقاف', englishName: 'Al-Ahqaf', ayahs: 35, type: 'مكية', juz: [26], page: 502 },
  { number: 47, name: 'محمد', englishName: 'Muhammad', ayahs: 38, type: 'مدنية', juz: [26], page: 507 },
  { number: 48, name: 'الفتح', englishName: 'Al-Fath', ayahs: 29, type: 'مدنية', juz: [26], page: 511 },
  { number: 49, name: 'الحجرات', englishName: 'Al-Hujurat', ayahs: 18, type: 'مدنية', juz: [26], page: 515 },
  { number: 50, name: 'ق', englishName: 'Qaf', ayahs: 45, type: 'مكية', juz: [26], page: 518 },
  { number: 51, name: 'الذاريات', englishName: 'Adh-Dhariyat', ayahs: 60, type: 'مكية', juz: [26, 27], page: 520 },
  { number: 52, name: 'الطور', englishName: 'At-Tur', ayahs: 49, type: 'مكية', juz: [27], page: 523 },
  { number: 53, name: 'النجم', englishName: 'An-Najm', ayahs: 62, type: 'مكية', juz: [27], page: 526 },
  { number: 54, name: 'القمر', englishName: 'Al-Qamar', ayahs: 55, type: 'مكية', juz: [27], page: 528 },
  { number: 55, name: 'الرحمن', englishName: 'Ar-Rahman', ayahs: 78, type: 'مدنية', juz: [27], page: 531 },
  { number: 56, name: 'الواقعة', englishName: 'Al-Waqi\'ah', ayahs: 96, type: 'مكية', juz: [27], page: 534 },
  { number: 57, name: 'الحديد', englishName: 'Al-Hadid', ayahs: 29, type: 'مدنية', juz: [27], page: 537 },
  { number: 58, name: 'المجادلة', englishName: 'Al-Mujadila', ayahs: 22, type: 'مدنية', juz: [28], page: 542 },
  { number: 59, name: 'الحشر', englishName: 'Al-Hashr', ayahs: 24, type: 'مدنية', juz: [28], page: 545 },
  { number: 60, name: 'الممتحنة', englishName: 'Al-Mumtahanah', ayahs: 13, type: 'مدنية', juz: [28], page: 549 },
  { number: 61, name: 'الصف', englishName: 'As-Saf', ayahs: 14, type: 'مدنية', juz: [28], page: 551 },
  { number: 62, name: 'الجمعة', englishName: 'Al-Jumu\'ah', ayahs: 11, type: 'مدنية', juz: [28], page: 553 },
  { number: 63, name: 'المنافقون', englishName: 'Al-Munafiqun', ayahs: 11, type: 'مدنية', juz: [28], page: 554 },
  { number: 64, name: 'التغابن', englishName: 'At-Taghabun', ayahs: 18, type: 'مدنية', juz: [28], page: 556 },
  { number: 65, name: 'الطلاق', englishName: 'At-Talaq', ayahs: 12, type: 'مدنية', juz: [28], page: 558 },
  { number: 66, name: 'التحريم', englishName: 'At-Tahrim', ayahs: 12, type: 'مدنية', juz: [28], page: 560 },
  { number: 67, name: 'الملك', englishName: 'Al-Mulk', ayahs: 30, type: 'مكية', juz: [29], page: 562 },
  { number: 68, name: 'القلم', englishName: 'Al-Qalam', ayahs: 52, type: 'مكية', juz: [29], page: 564 },
  { number: 69, name: 'الحاقة', englishName: 'Al-Haqqah', ayahs: 52, type: 'مكية', juz: [29], page: 566 },
  { number: 70, name: 'المعارج', englishName: 'Al-Ma\'arij', ayahs: 44, type: 'مكية', juz: [29], page: 568 },
  { number: 71, name: 'نوح', englishName: 'Nuh', ayahs: 28, type: 'مكية', juz: [29], page: 570 },
  { number: 72, name: 'الجن', englishName: 'Al-Jinn', ayahs: 28, type: 'مكية', juz: [29], page: 572 },
  { number: 73, name: 'المزمل', englishName: 'Al-Muzzammil', ayahs: 20, type: 'مكية', juz: [29], page: 574 },
  { number: 74, name: 'المدثر', englishName: 'Al-Muddaththir', ayahs: 56, type: 'مكية', juz: [29], page: 575 },
  { number: 75, name: 'القيامة', englishName: 'Al-Qiyamah', ayahs: 40, type: 'مكية', juz: [29], page: 577 },
  { number: 76, name: 'الإنسان', englishName: 'Al-Insan', ayahs: 31, type: 'مدنية', juz: [29], page: 578 },
  { number: 77, name: 'المرسلات', englishName: 'Al-Mursalat', ayahs: 50, type: 'مكية', juz: [29], page: 580 },
  { number: 78, name: 'النبأ', englishName: 'An-Naba', ayahs: 40, type: 'مكية', juz: [30], page: 582 },
  { number: 79, name: 'النازعات', englishName: 'An-Nazi\'at', ayahs: 46, type: 'مكية', juz: [30], page: 583 },
  { number: 80, name: 'عبس', englishName: 'Abasa', ayahs: 42, type: 'مكية', juz: [30], page: 585 },
  { number: 81, name: 'التكوير', englishName: 'At-Takwir', ayahs: 29, type: 'مكية', juz: [30], page: 586 },
  { number: 82, name: 'الانفطار', englishName: 'Al-Infitar', ayahs: 19, type: 'مكية', juz: [30], page: 587 },
  { number: 83, name: 'المطففين', englishName: 'Al-Mutaffifin', ayahs: 36, type: 'مكية', juz: [30], page: 587 },
  { number: 84, name: 'الانشقاق', englishName: 'Al-Inshiqaq', ayahs: 25, type: 'مكية', juz: [30], page: 589 },
  { number: 85, name: 'البروج', englishName: 'Al-Buruj', ayahs: 22, type: 'مكية', juz: [30], page: 590 },
  { number: 86, name: 'الطارق', englishName: 'At-Tariq', ayahs: 17, type: 'مكية', juz: [30], page: 591 },
  { number: 87, name: 'الأعلى', englishName: 'Al-A\'la', ayahs: 19, type: 'مكية', juz: [30], page: 591 },
  { number: 88, name: 'الغاشية', englishName: 'Al-Ghashiyah', ayahs: 26, type: 'مكية', juz: [30], page: 592 },
  { number: 89, name: 'الفجر', englishName: 'Al-Fajr', ayahs: 30, type: 'مكية', juz: [30], page: 593 },
  { number: 90, name: 'البلد', englishName: 'Al-Balad', ayahs: 20, type: 'مكية', juz: [30], page: 594 },
  { number: 91, name: 'الشمس', englishName: 'Ash-Shams', ayahs: 15, type: 'مكية', juz: [30], page: 595 },
  { number: 92, name: 'الليل', englishName: 'Al-Layl', ayahs: 21, type: 'مكية', juz: [30], page: 595 },
  { number: 93, name: 'الضحى', englishName: 'Ad-Duhaa', ayahs: 11, type: 'مكية', juz: [30], page: 596 },
  { number: 94, name: 'الشرح', englishName: 'Ash-Sharh', ayahs: 8, type: 'مكية', juz: [30], page: 596 },
  { number: 95, name: 'التين', englishName: 'At-Tin', ayahs: 8, type: 'مكية', juz: [30], page: 597 },
  { number: 96, name: 'العلق', englishName: 'Al-Alaq', ayahs: 19, type: 'مكية', juz: [30], page: 597 },
  { number: 97, name: 'القدر', englishName: 'Al-Qadr', ayahs: 5, type: 'مكية', juz: [30], page: 598 },
  { number: 98, name: 'البينة', englishName: 'Al-Bayyinah', ayahs: 8, type: 'مدنية', juz: [30], page: 598 },
  { number: 99, name: 'الزلزلة', englishName: 'Az-Zalzalah', ayahs: 8, type: 'مدنية', juz: [30], page: 599 },
  { number: 100, name: 'العاديات', englishName: 'Al-Adiyat', ayahs: 11, type: 'مكية', juz: [30], page: 599 },
  { number: 101, name: 'القارعة', englishName: 'Al-Qari\'ah', ayahs: 11, type: 'مكية', juz: [30], page: 600 },
  { number: 102, name: 'التكاثر', englishName: 'At-Takathur', ayahs: 8, type: 'مكية', juz: [30], page: 600 },
  { number: 103, name: 'العصر', englishName: 'Al-Asr', ayahs: 3, type: 'مكية', juz: [30], page: 601 },
  { number: 104, name: 'الهمزة', englishName: 'Al-Humazah', ayahs: 9, type: 'مكية', juz: [30], page: 601 },
  { number: 105, name: 'الفيل', englishName: 'Al-Fil', ayahs: 5, type: 'مكية', juz: [30], page: 601 },
  { number: 106, name: 'قريش', englishName: 'Quraysh', ayahs: 4, type: 'مكية', juz: [30], page: 602 },
  { number: 107, name: 'الماعون', englishName: 'Al-Ma\'un', ayahs: 7, type: 'مكية', juz: [30], page: 602 },
  { number: 108, name: 'الكوثر', englishName: 'Al-Kawthar', ayahs: 3, type: 'مكية', juz: [30], page: 602 },
  { number: 109, name: 'الكافرون', englishName: 'Al-Kafirun', ayahs: 6, type: 'مكية', juz: [30], page: 603 },
  { number: 110, name: 'النصر', englishName: 'An-Nasr', ayahs: 3, type: 'مدنية', juz: [30], page: 603 },
  { number: 111, name: 'المسد', englishName: 'Al-Masad', ayahs: 5, type: 'مكية', juz: [30], page: 603 },
  { number: 112, name: 'الإخلاص', englishName: 'Al-Ikhlas', ayahs: 4, type: 'مكية', juz: [30], page: 604 },
  { number: 113, name: 'الفلق', englishName: 'Al-Falaq', ayahs: 5, type: 'مكية', juz: [30], page: 604 },
  { number: 114, name: 'الناس', englishName: 'An-Nas', ayahs: 6, type: 'مكية', juz: [30], page: 604 },
];

// دالة للبحث عن سورة
export function getSurah(number: number): Surah | undefined {
  return quranSurahs.find(s => s.number === number);
}

// دالة للبحث عن سورة بالاسم
export function getSurahByName(name: string): Surah | undefined {
  return quranSurahs.find(s => s.name === name);
}

// دالة للحصول على جميع السور
export function getAllSurahs(): Surah[] {
  return quranSurahs;
}

// دالة للحصول على السور حسب الجزء
export function getSurahsByJuz(juzNumber: number): Surah[] {
  return quranSurahs.filter(s => s.juz.includes(juzNumber));
}

// دالة لحساب عدد الصفحات بين آيتين
export function calculatePages(fromAyah: number, toAyah: number): number {
  // متوسط 15 آية في الصفحة
  const ayahCount = toAyah - fromAyah + 1;
  return Math.ceil(ayahCount / 15);
}

// دالة لحساب عدد الأسطر بين آيتين
export function calculateLines(fromAyah: number, toAyah: number): number {
  // متوسط آية واحدة = 2 سطر تقريباً
  const ayahCount = toAyah - fromAyah + 1;
  return Math.ceil(ayahCount * 2);
}

// أسماء الأجزاء
export const juzNames: string[] = [
  'الجزء الأول',
  'الجزء الثاني',
  'الجزء الثالث',
  'الجزء الرابع',
  'الجزء الخامس',
  'الجزء السادس',
  'الجزء السابع',
  'الجزء الثامن',
  'الجزء التاسع',
  'الجزء العاشر',
  'الجزء الحادي عشر',
  'الجزء الثاني عشر',
  'الجزء الثالث عشر',
  'الجزء الرابع عشر',
  'الجزء الخامس عشر',
  'الجزء السادس عشر',
  'الجزء السابع عشر',
  'الجزء الثامن عشر',
  'الجزء التاسع عشر',
  'الجزء العشرون',
  'الجزء الحادي والعشرون',
  'الجزء الثاني والعشرون',
  'الجزء الثالث والعشرون',
  'الجزء الرابع والعشرون',
  'الجزء الخامس والعشرون',
  'الجزء السادس والعشرون',
  'الجزء السابع والعشرون',
  'الجزء الثامن والعشرون',
  'الجزء التاسع والعشرون',
  'الجزء الثلاثون',
];
