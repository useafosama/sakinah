import React from 'react';
import { ShieldCheck, BookCheck, Scroll, CheckCircle2 } from 'lucide-react';

export const SourcesView: React.FC = () => {
  const sources = [
    {
      title: 'حصن المسلم من أذكار الكتاب والسنة',
      author: 'فضيلة الشيخ د. سعيد بن علي بن وهف القحطاني (رحمه الله)',
      desc: 'المصدر الأساسي المعتمد في تجميع أذكار الصباح والمساء وأدعية اليوم والليلة بعد مراجعة التخريج والتحقيق.',
      tag: 'كتاب معتمد',
    },
    {
      title: 'صحيح الإمام البخاري',
      author: 'الإمام محمد بن إسماعيل البخاري (رحمه الله)',
      desc: 'أصح كتاب بعد كتاب الله عز وجل، تم توثيق الأحاديث بأرقامها الصحيحة في طبعة دار التأصيل وطوق النجاة.',
      tag: 'صحيح متفق عليه',
    },
    {
      title: 'صحيح الإمام مسلم',
      author: 'الإمام مسلم بن الحجاج النيسابوري (رحمه الله)',
      desc: 'الديوان الصحيح الثاني في السنة النبوية المطهرة مع ضبط المتون والروايات.',
      tag: 'صحيح',
    },
    {
      title: 'سنن أبي داود وجامع الترمذي',
      author: 'الإمام أبو داود السجستاني والإمام أبو عيسى الترمذي',
      desc: 'الاعتماد على الأحاديث التي حكم عليها أئمة الحديث المتقدمين والمحققين (كالشيخ الألباني) بالصحة أو الحسن.',
      tag: 'صحيح / حسن',
    },
  ];

  const methodologyPoints = [
    {
      title: 'صحة السند والمتن',
      desc: 'الاقتصار على الأحاديث الثابتة عن النبي ﷺ وتجنب الأحاديث الضعيفة والمكذوبة والموضوعة.',
    },
    {
      title: 'التوثيق الدقيق والعزو',
      desc: 'ذكر الكتاب واسم الراوي ورقم الحديث أو الباب بجانب كل نص لتسهيل الرجوع للأصل.',
    },
    {
      title: 'الضبط والتشكيل العربي',
      desc: 'مراجعة الحركات والتشكيل بما يتطابق مع الرسم القرآني ونصوص كتب الحديث لتيسير القراءة الصحيحة.',
    },
    {
      title: 'الدقة في الترجمة',
      desc: 'تقديم ترجمة إنجليزية معتمدة للأذكار والأحاديث تعكس المعنى الشرعي الأصيل بوضوح.',
    },
  ];

  return (
    <div className="w-full mx-auto py-2 sm:py-4">
      {/* Page Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-sand-100 dark:bg-night-850 text-islamic-900 dark:text-gold-400 border border-sand-200 dark:border-night-border mb-3">
          <ShieldCheck className="w-3.5 h-3.5 text-gold-500" />
          <span>التوثيق والاعتماد</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold font-arabic-text text-islamic-900 dark:text-night-text mb-2">
          المصادر والمنهجية العلمية
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 dark:text-night-muted max-w-md mx-auto">
          التزام راسخ بصحيح المنقول وثابت المأثور من كتاب الله وسنة رسوله ﷺ
        </p>
      </div>

      {/* Methodology Section */}
      <div className="bg-white dark:bg-night-850 rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-sand-300/70 dark:border-night-border shadow-card mb-6">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-sand-100 dark:border-night-border">
          <Scroll className="w-4 h-4 text-gold-500" />
          <h2 className="text-base sm:text-lg font-bold text-islamic-900 dark:text-night-text font-arabic-text">
            منهجية انتقاء وضبط المحتوى
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {methodologyPoints.map((point, idx) => (
            <div key={idx} className="p-3.5 bg-sand-50 dark:bg-night-900/60 rounded-xl border border-sand-200/60 dark:border-night-border">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <h3 className="text-xs sm:text-sm font-bold text-islamic-900 dark:text-night-text font-arabic-text">
                  {point.title}
                </h3>
              </div>
              <p className="text-[11px] sm:text-xs text-stone-500 dark:text-night-muted leading-relaxed">
                {point.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Verified Books Section */}
      <div className="bg-white dark:bg-night-850 rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-sand-300/70 dark:border-night-border shadow-card">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-sand-100 dark:border-night-border">
          <BookCheck className="w-4 h-4 text-islamic-800 dark:text-gold-400" />
          <h2 className="text-base sm:text-lg font-bold text-islamic-900 dark:text-night-text font-arabic-text">
            المراجع ودواوين السنة المعتمدة
          </h2>
        </div>

        <div className="space-y-3.5">
          {sources.map((source, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-sand-200/70 dark:border-night-border bg-sand-50/40 dark:bg-night-900/40 text-right"
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <h3 className="text-sm sm:text-base font-bold text-islamic-950 dark:text-night-text font-arabic-text">
                  {source.title}
                </h3>
                <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.2 rounded-full border border-emerald-200 dark:border-emerald-800">
                  {source.tag}
                </span>
              </div>
              <p className="text-xs font-semibold text-gold-600 dark:text-gold-400 mb-1 font-arabic-text">
                {source.author}
              </p>
              <p className="text-[11px] sm:text-xs text-stone-500 dark:text-night-muted leading-relaxed">
                {source.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
