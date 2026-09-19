import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronRight,
  ChevronLeft,
  Eye,
  Check,
  Clock
} from 'lucide-react';
import { DayPrayerSummary, ObligatoryPrayerId } from '../../types/prayer';
import { getDaySummary } from '../../services/prayerStorage';
import { formatDateISO } from '../../services/theShiaPrayerService';
import { PrayerStatusModal } from './PrayerStatusModal';

interface PrayerHistoryTabProps {
  weekSummaries: DayPrayerSummary[];
  selectedDateStr: string;
  onSelectDate: (dateStr: string) => void;
  onQuickLog: (prayer: ObligatoryPrayerId, scheduledTime24: string, status?: 'prayed_on_time' | 'prayed_late' | 'missed') => void;
  onRemoveLog: (prayer: ObligatoryPrayerId) => void;
}

const ARABIC_DAYS = ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
const PRAYERS_LIST: ObligatoryPrayerId[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
const PRAYER_NAMES: Record<ObligatoryPrayerId, string> = {
  fajr: 'الفجر',
  dhuhr: 'الظهر',
  asr: 'العصر',
  maghrib: 'المغرب',
  isha: 'العشاء',
};

export const PrayerHistoryTab: React.FC<PrayerHistoryTabProps> = ({
  weekSummaries,
  selectedDateStr,
  onSelectDate,
  onQuickLog,
  onRemoveLog,
}) => {
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [calendarMonth, setCalendarMonth] = useState<Date>(() => new Date());
  const [editingPrayer, setEditingPrayer] = useState<{
    prayer: ObligatoryPrayerId;
    date: string;
  } | null>(null);

  // Month navigation
  const monthYearLabel = useMemo(() => {
    try {
      return new Intl.DateTimeFormat('ar-EG', { month: 'long', year: 'numeric' }).format(calendarMonth);
    } catch {
      return `${calendarMonth.getMonth() + 1} / ${calendarMonth.getFullYear()}`;
    }
  }, [calendarMonth]);

  const handlePrevMonth = () => {
    setCalendarMonth((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() - 1);
      return d;
    });
  };

  const handleNextMonth = () => {
    setCalendarMonth((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + 1);
      return d;
    });
  };

  // Build calendar matrix for the month
  const calendarDays = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const totalDays = lastDayOfMonth.getDate();
    // In our Arabic week, Saturday is index 0
    // getDay(): 0=Sun, 1=Mon, ..., 6=Sat -> Sat is (getDay() + 1) % 7
    const startingOffset = (firstDayOfMonth.getDay() + 1) % 7;

    const daysArray: Array<{
      dayNum: number;
      dateStr: string;
      isCurrentMonth: boolean;
      summary: DayPrayerSummary;
    }> = [];

    // Fill days of month
    for (let d = 1; d <= totalDays; d++) {
      const dateObj = new Date(year, month, d);
      const dateStr = formatDateISO(dateObj);
      daysArray.push({
        dayNum: d,
        dateStr,
        isCurrentMonth: true,
        summary: getDaySummary(dateStr),
      });
    }

    return { startingOffset, daysArray };
  }, [calendarMonth]);

  // Selected date summary
  const selectedDaySummary = useMemo(() => {
    return getDaySummary(selectedDateStr);
  }, [selectedDateStr]);

  return (
    <div className="space-y-5 animate-fade-in text-right font-arabic-text" dir="rtl">
      {/* View Switcher Header */}
      <div className="bg-white dark:bg-night-850 rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-sand-300/70 dark:border-night-border shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-islamic-100 dark:bg-night-800 text-islamic-800 dark:text-gold-400 border border-islamic-200/50 dark:border-night-border">
            <CalendarIcon className="w-4 h-4" />
          </span>
          <div>
            <h2 className="text-base font-bold text-islamic-950 dark:text-night-text font-arabic-heading">
              سجل صلاتي والتقويم
            </h2>
            <p className="text-xs text-stone-500 dark:text-night-muted">
              متابعة سجل الأداء اليومي والأسبوعي والشهري
            </p>
          </div>
        </div>

        {/* Segmented control */}
        <div className="flex items-center bg-sand-100 dark:bg-night-900 p-1 rounded-2xl border border-sand-200/80 dark:border-night-border self-start sm:self-center">
          <button
            onClick={() => setViewMode('week')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'week'
                ? 'bg-islamic-800 dark:bg-gold-400 text-sand-50 dark:text-islamic-950 shadow-xs'
                : 'text-stone-600 dark:text-night-muted hover:text-stone-900 dark:hover:text-night-text'
            }`}
          >
            عرض الأسبوع
          </button>
          <button
            onClick={() => setViewMode('month')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'month'
                ? 'bg-islamic-800 dark:bg-gold-400 text-sand-50 dark:text-islamic-950 shadow-xs'
                : 'text-stone-600 dark:text-night-muted hover:text-stone-900 dark:hover:text-night-text'
            }`}
          >
            التقويم الشهري
          </button>
        </div>
      </div>

      {/* Week View */}
      {viewMode === 'week' && (
        <div className="bg-white dark:bg-night-850 rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-sand-300/70 dark:border-night-border shadow-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-sand-100 dark:border-night-border">
            <h3 className="text-sm font-bold text-islamic-950 dark:text-night-text font-arabic-heading">
              الأسبوع الحالي
            </h3>
            <span className="text-xs text-stone-400 dark:text-night-muted">
              اضغط على أي يوم لعرض تفاصيله وتسجيله
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 sm:gap-3">
            {weekSummaries.map((summary, idx) => {
              const dateObj = new Date(summary.date);
              const dayName = ARABIC_DAYS[idx] || '';
              const isSelected = selectedDateStr === summary.date;
              const isTodayDate = formatDateISO(new Date()) === summary.date;

              return (
                <button
                  key={summary.date}
                  onClick={() => onSelectDate(summary.date)}
                  className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-between min-h-[115px] ${
                    isSelected
                      ? 'bg-islamic-800 dark:bg-gold-400 text-sand-50 dark:text-islamic-950 border-islamic-800 dark:border-gold-400 shadow-md scale-[1.02]'
                      : 'bg-sand-50/60 dark:bg-night-900/40 hover:bg-sand-100/70 dark:hover:bg-night-800/60 border-sand-200/80 dark:border-night-border text-stone-800 dark:text-night-text'
                  }`}
                >
                  <div className="w-full flex items-center justify-between text-[11px] mb-1 font-bold">
                    <span className={isSelected ? 'text-sand-100 dark:text-islamic-950' : 'text-stone-500 dark:text-night-muted'}>
                      {dayName}
                    </span>
                    {isTodayDate && (
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded-md font-bold ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-gold-100 text-gold-800 dark:bg-night-800 dark:text-gold-400'
                        }`}
                      >
                        اليوم
                      </span>
                    )}
                  </div>

                  <div className="text-lg font-bold font-sans my-0.5">
                    {dateObj.getDate()}
                  </div>

                  {/* 5 mini dots for prayers */}
                  <div className="flex items-center gap-1 mt-1.5">
                    {PRAYERS_LIST.map((p) => {
                      const log = summary.logs[p];
                      const statusColor =
                        log?.status === 'prayed_on_time'
                          ? 'bg-emerald-500'
                          : log?.status === 'prayed_late'
                          ? 'bg-amber-500'
                          : log?.status === 'missed'
                          ? 'bg-red-500'
                          : isSelected
                          ? 'bg-white/30'
                          : 'bg-sand-300 dark:bg-night-700';

                      return <span key={p} className={`w-2 h-2 rounded-full ${statusColor}`} />;
                    })}
                  </div>

                  <div
                    className={`text-[10px] font-sans mt-1.5 ${
                      isSelected ? 'text-sand-200 dark:text-islamic-900' : 'text-stone-400 dark:text-night-muted'
                    }`}
                  >
                    {summary.completedCount} / 5
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Month Calendar View */}
      {viewMode === 'month' && (
        <div className="bg-white dark:bg-night-850 rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-sand-300/70 dark:border-night-border shadow-card space-y-4">
          {/* Month Navigator */}
          <div className="flex items-center justify-between pb-3 border-b border-sand-100 dark:border-night-border">
            <button
              onClick={handlePrevMonth}
              className="p-2 rounded-xl bg-sand-50 dark:bg-night-900 hover:bg-sand-100 dark:hover:bg-night-800 border border-sand-200 dark:border-night-border text-stone-700 dark:text-night-text transition-colors"
              title="الشهر السابق"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <h3 className="text-sm sm:text-base font-bold text-islamic-950 dark:text-night-text font-arabic-heading">
              {monthYearLabel}
            </h3>

            <button
              onClick={handleNextMonth}
              className="p-2 rounded-xl bg-sand-50 dark:bg-night-900 hover:bg-sand-100 dark:hover:bg-night-800 border border-sand-200 dark:border-night-border text-stone-700 dark:text-night-text transition-colors"
              title="الشهر التالي"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-xs font-bold text-stone-500 dark:text-night-muted pb-1">
            {ARABIC_DAYS.map((day) => (
              <div key={day} className="py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {/* Empty offset days */}
            {Array.from({ length: calendarDays.startingOffset }).map((_, idx) => (
              <div key={`offset-${idx}`} className="h-14 sm:h-16 rounded-xl bg-transparent" />
            ))}

            {/* Active Month Days */}
            {calendarDays.daysArray.map((item) => {
              const isSelected = selectedDateStr === item.dateStr;
              const isTodayDate = formatDateISO(new Date()) === item.dateStr;
              const { summary } = item;

              return (
                <button
                  key={item.dateStr}
                  onClick={() => onSelectDate(item.dateStr)}
                  className={`h-14 sm:h-16 rounded-xl sm:rounded-2xl p-1.5 sm:p-2 border transition-all cursor-pointer flex flex-col items-center justify-between text-center ${
                    isSelected
                      ? 'bg-islamic-800 dark:bg-gold-400 text-sand-50 dark:text-islamic-950 border-islamic-800 dark:border-gold-400 shadow-md font-bold'
                      : 'bg-sand-50/50 dark:bg-night-900/40 hover:bg-sand-100/60 dark:hover:bg-night-800/60 border-sand-200/70 dark:border-night-border text-stone-800 dark:text-night-text'
                  }`}
                >
                  <div className="w-full flex items-center justify-between text-[10px]">
                    <span className="font-sans font-bold">{item.dayNum}</span>
                    {isTodayDate && (
                      <span className="w-1.5 h-1.5 rounded-full bg-gold-500" />
                    )}
                  </div>

                  {/* Summary progress dots */}
                  <div className="flex items-center gap-0.5 sm:gap-1">
                    {summary.completedCount > 0 && (
                      <span
                        className={`text-[9px] font-sans px-1 rounded-md font-bold ${
                          isSelected
                            ? 'bg-white/20 text-white'
                            : summary.completedCount === 5
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                            : 'bg-sand-200 dark:bg-night-800 text-stone-600 dark:text-night-muted'
                        }`}
                      >
                        {summary.completedCount}/5
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected Day Inspection & Log Editor */}
      <div className="bg-white dark:bg-night-850 rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-sand-300/70 dark:border-night-border shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-sand-100 dark:border-night-border">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-gold-600 dark:text-gold-400" />
            <h3 className="text-sm sm:text-base font-bold text-islamic-950 dark:text-night-text font-arabic-heading">
              تفاصيل اليوم المحدد ({selectedDateStr})
            </h3>
          </div>
          <span className="text-xs font-bold font-sans text-islamic-800 dark:text-gold-400">
            {selectedDaySummary.completedCount} من 5 صلوات مسجلة
          </span>
        </div>

        <div className="space-y-2">
          {PRAYERS_LIST.map((prayerId) => {
            const log = selectedDaySummary.logs[prayerId];
            const isCompleted = log?.status === 'prayed_on_time' || log?.status === 'prayed_late';

            return (
              <div
                key={prayerId}
                className="p-3.5 rounded-2xl bg-sand-50/50 dark:bg-night-900/40 border border-sand-200/80 dark:border-night-border flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      isCompleted
                        ? 'bg-emerald-600 text-white'
                        : log?.status === 'missed'
                        ? 'bg-red-500 text-white'
                        : 'bg-sand-200 dark:bg-night-800 text-stone-500 dark:text-night-muted'
                    }`}
                  >
                    {isCompleted ? <Check className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-islamic-950 dark:text-night-text">
                      صلاة {PRAYER_NAMES[prayerId]}
                    </div>
                    <div className="text-[11px] text-stone-400 dark:text-night-muted font-sans">
                      {log ? `تم التسجيل: ${log.loggedAt}` : 'لم تسجل بعد'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingPrayer({ prayer: prayerId, date: selectedDateStr })}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      log?.status === 'prayed_on_time'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : log?.status === 'prayed_late'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                        : log?.status === 'missed'
                        ? 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
                        : 'bg-islamic-800 text-sand-50 dark:bg-gold-500 dark:text-islamic-950 hover:bg-islamic-900'
                    }`}
                  >
                    {log?.status === 'prayed_on_time'
                      ? 'في وقتها ✓'
                      : log?.status === 'prayed_late'
                      ? 'متأخرة 🕐'
                      : log?.status === 'missed'
                      ? 'فاتتني ❌'
                      : 'تسجيل الصلاة'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit Status Modal */}
      <PrayerStatusModal
        isOpen={!!editingPrayer}
        onClose={() => setEditingPrayer(null)}
        prayerId={editingPrayer?.prayer || null}
        scheduledTime24=""
        currentLog={editingPrayer ? selectedDaySummary.logs[editingPrayer.prayer] : undefined}
        onSaveStatus={(status) => {
          if (editingPrayer) {
            onQuickLog(editingPrayer.prayer, '', status);
          }
        }}
        onRemoveLog={() => {
          if (editingPrayer) {
            onRemoveLog(editingPrayer.prayer);
          }
        }}
      />
    </div>
  );
};
