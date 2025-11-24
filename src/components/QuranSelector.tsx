import { useState, useEffect } from 'react';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { quranSurahs, getSurah, calculateLines } from '../lib/quranData';
import { BookOpen, Info } from 'lucide-react';

interface QuranSelectorProps {
  onSelectionChange?: (selection: QuranSelection) => void;
  defaultSurah?: number;
  defaultFromAyah?: number;
  defaultToAyah?: number;
}

export interface QuranSelection {
  surahNumber: number;
  surahName: string;
  fromAyah: number;
  toAyah: number;
  totalAyahs: number;
  estimatedLines: number;
}

export function QuranSelector({ 
  onSelectionChange, 
  defaultSurah = 1, 
  defaultFromAyah = 1,
  defaultToAyah = 1 
}: QuranSelectorProps) {
  const [selectedSurah, setSelectedSurah] = useState<number>(defaultSurah);
  const [fromAyah, setFromAyah] = useState<number>(defaultFromAyah);
  const [toAyah, setToAyah] = useState<number>(defaultToAyah);

  const currentSurah = getSurah(selectedSurah);
  const maxAyahs = currentSurah?.ayahs || 1;

  useEffect(() => {
    // التأكد من أن الآيات ضمن النطاق الصحيح
    if (fromAyah > maxAyahs) {
      setFromAyah(maxAyahs);
    }
    if (toAyah > maxAyahs) {
      setToAyah(maxAyahs);
    }
    if (fromAyah > toAyah) {
      setToAyah(fromAyah);
    }
  }, [selectedSurah, maxAyahs]);

  useEffect(() => {
    if (currentSurah && onSelectionChange) {
      const selection: QuranSelection = {
        surahNumber: selectedSurah,
        surahName: currentSurah.name,
        fromAyah,
        toAyah,
        totalAyahs: toAyah - fromAyah + 1,
        estimatedLines: calculateLines(fromAyah, toAyah),
      };
      onSelectionChange(selection);
    }
  }, [selectedSurah, fromAyah, toAyah]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <BookOpen className="w-5 h-5 text-emerald-600" />
        <h3 className="font-medium">تحديد نطاق التسميع</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* اختيار السورة */}
        <div className="space-y-2">
          <Label>السورة *</Label>
          <Select 
            value={selectedSurah.toString()} 
            onValueChange={(value) => {
              setSelectedSurah(parseInt(value));
              setFromAyah(1);
              setToAyah(1);
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {quranSurahs.map((surah) => (
                <SelectItem key={surah.number} value={surah.number.toString()}>
                  <div className="flex items-center gap-2">
                    <span>{surah.number}.</span>
                    <span>{surah.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {surah.ayahs} آية
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* معلومات السورة */}
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <Info className="w-4 h-4 text-gray-500" />
          <div className="text-sm">
            <p className="text-gray-600">
              <span className="font-medium">{currentSurah?.name}</span> • 
              <span className="mr-1">{currentSurah?.ayahs} آية</span> • 
              <span className="mr-1">{currentSurah?.type}</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              الجزء {currentSurah?.juz.join(', ')} • صفحة {currentSurah?.page}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* من آية */}
        <div className="space-y-2">
          <Label htmlFor="from-ayah">من آية *</Label>
          <Input
            id="from-ayah"
            type="number"
            min={1}
            max={maxAyahs}
            value={fromAyah}
            onChange={(e) => {
              const value = parseInt(e.target.value) || 1;
              const validValue = Math.max(1, Math.min(value, maxAyahs));
              setFromAyah(validValue);
              if (validValue > toAyah) {
                setToAyah(validValue);
              }
            }}
            className="text-center"
            dir="ltr"
          />
        </div>

        {/* إلى آية */}
        <div className="space-y-2">
          <Label htmlFor="to-ayah">إلى آية *</Label>
          <Input
            id="to-ayah"
            type="number"
            min={fromAyah}
            max={maxAyahs}
            value={toAyah}
            onChange={(e) => {
              const value = parseInt(e.target.value) || fromAyah;
              const validValue = Math.max(fromAyah, Math.min(value, maxAyahs));
              setToAyah(validValue);
            }}
            className="text-center"
            dir="ltr"
          />
        </div>
      </div>

      {/* ملخص النطاق */}
      <div className="flex flex-wrap gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
        <Badge className="bg-emerald-600">
          النطاق: {currentSurah?.name} من آية {fromAyah} إلى {toAyah}
        </Badge>
        <Badge variant="secondary">
          عدد الآيات: {toAyah - fromAyah + 1}
        </Badge>
        <Badge variant="secondary">
          الأسطر التقديرية: {calculateLines(fromAyah, toAyah)} سطر
        </Badge>
      </div>
    </div>
  );
}
