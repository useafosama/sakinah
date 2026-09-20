import React, { useState, useMemo } from 'react';
import {
  Heart,
  Sparkles,
  Lock,
  Plus,
  Flame,
  Trash2,
  Coins,
  Utensils,
  Droplet,
  HandHeart,
  Cat,
  Users,
  CheckCircle2,
  RefreshCw,
  ShieldCheck
} from 'lucide-react';
import { PageType } from '../../types';
import { GoodDeedType, GoodDeedRecord, SecretDeedIdea } from '../../types/charity';
import { GOOD_DEED_OPTIONS } from '../../services/charityService';
import { useToast } from '../common/Toast';

interface CharityHarvestViewProps {
  deeds: GoodDeedRecord[];
  todayDeeds: GoodDeedRecord[];
  weeklySummary: {
    totalCount: number;
    byType: Record<GoodDeedType, number>;
    daysActiveCount: number;
    charityCount: number;
    secretDeedsCount: number;
    currentStreakDays: number;
    bestStreakDays: number;
  };
  streak: { currentStreakDays: number; bestStreakDays: number };
  randomSecretIdea: SecretDeedIdea;
  onRefreshSecretIdea: () => void;
  onOpenLogging: () => void;
  onLogSecretDeed: (idea: SecretDeedIdea) => void;
  onDeleteDeed: (id: string) => void;
  onNavigate?: (page: PageType) => void;
}

export const CharityHarvestView: React.FC<CharityHarvestViewProps> = ({
  deeds,
  weeklySummary,
  streak,
  randomSecretIdea,
  onRefreshSecretIdea,
  onOpenLogging,
  onLogSecretDeed,
  onDeleteDeed,
}) => {
  const { showToast } = useToast();
  const [selectedFilter, setSelectedFilter] = useState<'all' | GoodDeedType | 'secret'>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredDeeds = useMemo(() => {
    if (selectedFilter === 'all') return deeds;
    if (selectedFilter === 'secret') return deeds.filter((d) => d.isSecret);
    return deeds.filter((d) => d.type === selectedFilter);
  }, [deeds, selectedFilter]);

  const handleSecretDone = () => {
    onLogSecretDeed(randomSecretIdea);
    showToast('تقبّل الله منك طاعتك وسرك 🤍');
    onRefreshSecretIdea();
  };

  const handleDeleteClick = (id: string) => {
    if (deletingId === id) {
      onDeleteDeed(id);
      setDeletingId(null);
      showToast('تم حذف العمل من السجل');
    } else {
      setDeletingId(id);
      setTimeout(() => setDeletingId(null), 3500);
    }
  };

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'Coins':
        return <Coins className="w-4 h-4" />;
      case 'Utensils':
        return <Utensils className="w-4 h-4" />;
      case 'Droplet':
        return <Droplet className="w-4 h-4" />;
      case 'HandHeart':
        return <HandHeart className="w-4 h-4" />;
      case 'Heart':
        return <Heart className="w-4 h-4" />;
      case 'Cat':
        return <Cat className="w-4 h-4" />;
      case 'Users':
        return <Users className="w-4 h-4" />;
      default:
        return <Sparkles className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 text-right font-arabic-text animate-fade-in" dir="rtl">
      {/* Page Header */}
      <div className="bg-white dark:bg-night-850 rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-sand-300/70 dark:border-night-border shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-gold-500/10 dark:bg-gold-400/10 text-gold-600 dark:text-gold-400 border border-gold-200/50 dark:border-night-border shadow-2xs">
              <Heart className="w-6 h-6 fill-current" />
            </span>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-islamic-950 dark:text-night-text font-arabic-heading">
                حصاد الخير والصدقة
              </h1>
              <p className="text-xs text-stone-500 dark:text-night-muted mt-0.5">
                تتبع مسيرتك في صنائع المعروف والصدقات الخفية
              </p>
            </div>
          </div>

          <button
            onClick={onOpenLogging}
            className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-islamic-800 hover:bg-islamic-900 dark:bg-gold-500 dark:hover:bg-gold-600 text-sand-50 dark:text-islamic-950 text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>تسجيل عمل خير</span>
          </button>
        </div>
      </div>

      {/* Weekly Reflection Card */}
      <div className="bg-gradient-to-br from-white via-sand-50 to-gold-50/40 dark:from-night-850 dark:via-night-850 dark:to-night-900 rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-sand-300/80 dark:border-night-border shadow-card space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-sand-200/70 dark:border-night-border">
          <div className="flex items-center gap-2">
            <span className="text-lg">🌙</span>
            <div>
              <h3 className="text-base font-bold text-islamic-950 dark:text-night-text font-arabic-heading">
                حصاد هذا الأسبوع والتأمل
              </h3>
              <p className="text-xs text-stone-500 dark:text-night-muted">
                {weeklySummary.totalCount > 0
                  ? `أحسنت، كان لك هذا الأسبوع ${weeklySummary.totalCount} أعمال خير 🤍`
                  : 'ابدأ أسبوعك بصنيع معروف واجعل لك نصيباً من الأجر'}
              </p>
            </div>
          </div>

          {streak.currentStreakDays > 0 && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gold-100 dark:bg-gold-950/50 text-gold-800 dark:text-gold-400 text-xs font-bold border border-gold-200/60 dark:border-gold-800/40">
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>{streak.currentStreakDays} أيام استمرارية</span>
            </span>
          )}
        </div>

        {/* Stats 4-box grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-3 rounded-2xl bg-white/80 dark:bg-night-900/60 border border-sand-200/80 dark:border-night-border text-center">
            <span className="text-xs text-stone-500 dark:text-night-muted block mb-1">
              إجمالي أعمال الأسبوع
            </span>
            <span className="text-xl font-bold text-islamic-950 dark:text-night-text font-sans">
              {weeklySummary.totalCount}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-white/80 dark:bg-night-900/60 border border-sand-200/80 dark:border-night-border text-center">
            <span className="text-xs text-stone-500 dark:text-night-muted block mb-1">
              أيام الخير النشطة
            </span>
            <span className="text-xl font-bold text-islamic-950 dark:text-night-text font-sans">
              {weeklySummary.daysActiveCount} / 7
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-white/80 dark:bg-night-900/60 border border-sand-200/80 dark:border-night-border text-center">
            <span className="text-xs text-stone-500 dark:text-night-muted block mb-1">
              الصدقات المسجلة
            </span>
            <span className="text-xl font-bold text-gold-700 dark:text-gold-400 font-sans">
              {weeklySummary.charityCount}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-white/80 dark:bg-night-900/60 border border-sand-200/80 dark:border-night-border text-center">
            <span className="text-xs text-stone-500 dark:text-night-muted block mb-1">
              صدقات خفية (في السر)
            </span>
            <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 font-sans">
              {weeklySummary.secretDeedsCount}
            </span>
          </div>
        </div>

        <p className="text-xs text-stone-600 dark:text-night-muted text-center pt-1 leading-relaxed">
          «استمر، واجعل لك نصيبًا من الخير كل يوم ولو بتبسم أو شربة ماء.»
        </p>
      </div>

      {/* Secret Good Deed (صدقة خفية) Spotlight Card */}
      <div className="bg-white dark:bg-night-850 rounded-2xl sm:rounded-3xl p-5 sm:p-6 border-2 border-gold-400/40 dark:border-gold-500/30 shadow-card space-y-3.5 relative overflow-hidden">
        <div className="flex items-center justify-between pb-2 border-b border-sand-100 dark:border-night-border">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-gold-100 dark:bg-night-800 text-gold-600 dark:text-gold-400">
              <Lock className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-base font-bold text-islamic-950 dark:text-night-text font-arabic-heading">
                صدقة خفية (بينك وبين الله)
              </h3>
              <p className="text-xs text-stone-500 dark:text-night-muted">
                اختر عمل خير تفعله في الخفاء دون أن يعرف به أحد
              </p>
            </div>
          </div>

          <button
            onClick={onRefreshSecretIdea}
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-night-text hover:bg-sand-100 dark:hover:bg-night-800 transition-colors cursor-pointer flex items-center gap-1 text-xs"
            title="فكرة أخرى"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px]">فكرة أخرى</span>
          </button>
        </div>

        {/* Idea Banner */}
        <div className="p-4 rounded-2xl bg-sand-50 dark:bg-night-900 border border-sand-200/80 dark:border-night-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-sm font-bold text-islamic-950 dark:text-night-text block mb-1">
              ✨ {randomSecretIdea.title}
            </span>
            <p className="text-xs text-stone-600 dark:text-night-muted leading-relaxed">
              {randomSecretIdea.description}
            </p>
          </div>

          <button
            onClick={handleSecretDone}
            className="py-2.5 px-4 rounded-xl bg-gold-500 hover:bg-gold-600 dark:bg-gold-400 dark:hover:bg-gold-500 text-islamic-950 font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>فعلتها 🤍</span>
          </button>
        </div>
      </div>

      {/* Good Deeds History Section */}
      <div className="bg-white dark:bg-night-850 rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-sand-300/70 dark:border-night-border shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-sand-100 dark:border-night-border">
          <div>
            <h3 className="text-base font-bold text-islamic-950 dark:text-night-text font-arabic-heading">
              سجل الأعمال والصدقات
            </h3>
            <p className="text-xs text-stone-500 dark:text-night-muted">
              {deeds.length} أعمال مسجلة في ذاكرة جهازك
            </p>
          </div>

          {/* Filter Chips */}
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                selectedFilter === 'all'
                  ? 'bg-islamic-800 dark:bg-gold-400 text-sand-50 dark:text-islamic-950'
                  : 'bg-sand-100 dark:bg-night-800 text-stone-600 dark:text-night-muted'
              }`}
            >
              الكل
            </button>
            <button
              onClick={() => setSelectedFilter('charity')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                selectedFilter === 'charity'
                  ? 'bg-islamic-800 dark:bg-gold-400 text-sand-50 dark:text-islamic-950'
                  : 'bg-sand-100 dark:bg-night-800 text-stone-600 dark:text-night-muted'
              }`}
            >
              💰 صدقة مالية
            </button>
            <button
              onClick={() => setSelectedFilter('feeding')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                selectedFilter === 'feeding'
                  ? 'bg-islamic-800 dark:bg-gold-400 text-sand-50 dark:text-islamic-950'
                  : 'bg-sand-100 dark:bg-night-800 text-stone-600 dark:text-night-muted'
              }`}
            >
              🍞 إطعام
            </button>
            <button
              onClick={() => setSelectedFilter('secret')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                selectedFilter === 'secret'
                  ? 'bg-islamic-800 dark:bg-gold-400 text-sand-50 dark:text-islamic-950'
                  : 'bg-sand-100 dark:bg-night-800 text-stone-600 dark:text-night-muted'
              }`}
            >
              🤍 في السر
            </button>
          </div>
        </div>

        {/* Deeds List */}
        {filteredDeeds.length > 0 ? (
          <div className="space-y-2.5">
            {filteredDeeds.map((deed) => {
              const opt = GOOD_DEED_OPTIONS.find((o) => o.id === deed.type);
              const formattedDate = new Date(deed.createdAt || deed.date).toLocaleDateString('ar-EG', {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
              });

              return (
                <div
                  key={deed.id}
                  className="p-3.5 rounded-2xl bg-sand-50/70 dark:bg-night-900/40 border border-sand-200/80 dark:border-night-border flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="p-2 rounded-xl bg-white dark:bg-night-800 text-gold-600 dark:text-gold-400 shadow-2xs">
                      {renderIcon(opt?.iconName || 'Sparkles')}
                    </span>

                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs sm:text-sm font-bold text-islamic-950 dark:text-night-text">
                          {deed.title || opt?.label}
                        </span>

                        {deed.amount && (
                          <span className="text-xs font-bold text-gold-700 dark:text-gold-400 font-sans">
                            ({deed.amount} {deed.currency})
                          </span>
                        )}

                        {deed.isSecret && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.2 rounded-md bg-gold-200/70 dark:bg-gold-950 text-gold-900 dark:text-gold-300">
                            <Lock className="w-2.5 h-2.5" />
                            <span>سرّي</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-stone-400 dark:text-night-muted">
                        <span>{formattedDate}</span>
                        {deed.note && <span>• {deed.note}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteClick(deed.id)}
                    className={`p-1.5 rounded-xl transition-colors cursor-pointer text-xs ${
                      deletingId === deed.id
                        ? 'bg-red-500 text-white font-bold px-2'
                        : 'text-stone-300 hover:text-red-500 hover:bg-sand-100 dark:hover:bg-night-800'
                    }`}
                    title={deletingId === deed.id ? 'اضغط مرة أخرى للتأكيد' : 'حذف'}
                  >
                    {deletingId === deed.id ? 'تأكيد؟' : <Trash2 className="w-3.5 h-3.5" />}
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-8 space-y-3">
            <div className="w-14 h-14 mx-auto rounded-3xl bg-sand-100 dark:bg-night-800 flex items-center justify-center text-stone-400">
              <Heart className="w-6 h-6 text-gold-500" />
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-bold text-islamic-950 dark:text-night-text font-arabic-heading">
                🌱 ابدأ أول خطوة
              </h4>
              <p className="text-xs text-stone-500 dark:text-night-muted max-w-xs mx-auto">
                اجعل لك كل يوم نصيبًا من الخير، ولو بشيء بسيط تبتغي به وجه الله تعالى.
              </p>
            </div>

            <button
              onClick={onOpenLogging}
              className="py-2.5 px-5 rounded-2xl bg-islamic-800 hover:bg-islamic-900 dark:bg-gold-500 dark:hover:bg-gold-600 text-sand-50 dark:text-islamic-950 text-xs font-bold transition-all shadow-2xs inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>سجّل أول عمل خير 🤍</span>
            </button>
          </div>
        )}

        {/* Privacy Note */}
        <div className="pt-2 border-t border-sand-100 dark:border-night-border flex items-center justify-between text-[11px] text-stone-400 dark:text-night-muted">
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>جميع السجلات والمبالغ محفوظة محلياً على جهازك دون إرسالها لأي خادم.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
