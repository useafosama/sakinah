import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Eye,
  Clock,
  RotateCcw,
  Smartphone,
  Globe,
  Compass,
  Heart,
  BookOpen,
  Bell,
  Download,
  LogOut,
  RefreshCw,
  Search,
  TrendingUp,
  Activity,
  Layers,
  Sparkles,
  ShieldCheck,
  Radio
} from 'lucide-react';
import {
  TimeRange,
  AnalyticsDashboardData
} from '../../types/analytics';
import { useToast } from '../common/Toast';

interface AdminDashboardProps {
  onLogout: () => void;
  onNavigateHome: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onLogout,
  onNavigateHome
}) => {
  const { showToast } = useToast();
  const [range, setRange] = useState<TimeRange>('7d');
  const [data, setData] = useState<AnalyticsDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'features' | 'audience' | 'funnel' | 'events'>('overview');
  const [chartMetric, setChartMetric] = useState<'visitors' | 'sessions' | 'pageViews'>('visitors');
  const [eventSearch, setEventSearch] = useState('');
  const [selectedEventFilter, setSelectedEventFilter] = useState('all');

  const fetchStats = async (selectedRange = range, isManual = false) => {
    if (isManual) setIsRefreshing(true);
    else setIsLoading(true);

    const token = localStorage.getItem('sakinah_admin_token') || '';

    try {
      const res = await fetch(`/api/admin/stats?range=${selectedRange}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.status === 401) {
        showToast('انتهت صلاحية الجلسة، يرجى تسجيل الدخول مجدداً');
        localStorage.removeItem('sakinah_admin_token');
        onLogout();
        return;
      }

      const json = await res.json();
      if (res.ok) {
        setData(json);
      } else {
        showToast(json.error || 'فشل تحميل البيانات');
      }
    } catch {
      showToast('تعذر الاتصال بالخادم لجلب الإحصائيات');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats(range);
    // Auto-refresh every 30 seconds for live data
    const interval = setInterval(() => {
      fetchStats(range, true);
    }, 30000);
    return () => clearInterval(interval);
  }, [range]);

  const handleRangeChange = (newRange: TimeRange) => {
    setRange(newRange);
  };

  // Format seconds to human readable
  const formatDuration = (seconds: number) => {
    if (!seconds || seconds <= 0) return '0ث';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m === 0) return `${s}ث`;
    return `${m}د ${s}ث`;
  };

  // CSV Exporter
  const handleExportCSV = () => {
    if (!data) return;

    let csvContent = 'data:text/csv;charset=utf-8,\uFEFF';
    csvContent += 'الفئة,المقياس,القيمة\n';
    csvContent += `KPIs,إجمالي الزوار الفريدين,${data.kpis.totalVisitors}\n`;
    csvContent += `KPIs,الزوار النشطون الآن,${data.kpis.activeVisitorsNow}\n`;
    csvContent += `KPIs,الزوار العائدون,${data.kpis.returningVisitors}\n`;
    csvContent += `KPIs,إجمالي مشاهدات الصفحات,${data.kpis.totalPageViews}\n`;
    csvContent += `KPIs,إجمالي الجلسات,${data.kpis.totalSessions}\n`;
    csvContent += `KPIs,متوسط مدة الجلسة (ثواني),${data.kpis.avgSessionDurationSeconds}\n`;
    csvContent += `KPIs,معدل الارتداد (%),${data.kpis.bounceRatePercentage}%\n\n`;

    csvContent += 'التاريخ,الزوار,الجلسات,المشاهدات\n';
    data.chartData.forEach((row) => {
      csvContent += `${row.date},${row.visitors},${row.sessions},${row.pageViews}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sakinah_analytics_${range}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('تم تصدير ملف CSV بنجاح');
  };

  // Filtered Events
  const filteredEvents = useMemo(() => {
    if (!data?.recentEvents) return [];
    return data.recentEvents.filter((ev) => {
      const matchSearch =
        ev.eventName.toLowerCase().includes(eventSearch.toLowerCase()) ||
        ev.path.toLowerCase().includes(eventSearch.toLowerCase()) ||
        (ev.country && ev.country.toLowerCase().includes(eventSearch.toLowerCase()));
      const matchType = selectedEventFilter === 'all' || ev.eventName === selectedEventFilter;
      return matchSearch && matchType;
    });
  }, [data?.recentEvents, eventSearch, selectedEventFilter]);

  // Chart max value for scaling
  const chartMax = useMemo(() => {
    if (!data?.chartData || data.chartData.length === 0) return 10;
    const maxVal = Math.max(...data.chartData.map((d) => d[chartMetric]));
    return maxVal > 0 ? maxVal * 1.15 : 10;
  }, [data?.chartData, chartMetric]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-24" dir="rtl">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-xl border-b border-white/10 px-4 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onNavigateHome}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors text-xs flex items-center gap-1"
            >
              الرئيسية
            </button>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-sm font-bold text-white">تحليلات سكينة</h1>
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                    Admin
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 hidden sm:block">
                  بيانات حقيقية مجهولة الهوية 100%
                </p>
              </div>
            </div>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live Indicator */}
            {data?.kpis && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="font-semibold">{data.kpis.activeVisitorsNow}</span>
                <span className="text-[11px] text-emerald-300/80 hidden sm:inline">نشط الآن</span>
              </div>
            )}

            {/* Refresh Button */}
            <button
              onClick={() => fetchStats(range, true)}
              disabled={isRefreshing}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 transition-colors"
              title="تحديث البيانات"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
            </button>

            {/* Export CSV */}
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 text-xs flex items-center gap-1.5 transition-colors hidden sm:flex"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تصدير CSV</span>
            </button>

            {/* Logout */}
            <button
              onClick={onLogout}
              className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
              title="تسجيل الخروج"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 pt-6 space-y-6">
        {/* Date Range & Subnav Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-slate-900/60 backdrop-blur-lg border border-white/10 rounded-2xl p-3">
          {/* Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {[
              { id: 'overview', label: 'نظرة عامة', icon: Activity },
              { id: 'features', label: 'ميزات سكينة', icon: Sparkles },
              { id: 'audience', label: 'الجمهور والأجهزة', icon: Globe },
              { id: 'funnel', label: 'المسار والاستمرارية', icon: TrendingUp },
              { id: 'events', label: 'سجل الأحداث المباشر', icon: Layers }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Time Range Selector */}
          <div className="flex items-center gap-1 bg-black/30 p-1 rounded-xl border border-white/5 self-end md:self-auto">
            {[
              { id: 'today', label: 'اليوم' },
              { id: 'yesterday', label: 'الأمس' },
              { id: '7d', label: '7 أيام' },
              { id: '30d', label: '30 يوماً' },
              { id: '90d', label: '90 يوماً' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => handleRangeChange(item.id as TimeRange)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  range === item.id
                    ? 'bg-emerald-500 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && !data ? (
          <div className="min-h-[400px] flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
            <p className="text-xs text-slate-400">جاري تجميع بيانات التحليلات من السيرفر...</p>
          </div>
        ) : data ? (
          <>
            {/* 1. TOP KPI CARDS */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
              {/* Total Visitors */}
              <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-[11px] font-medium">الزوار الفريدين</span>
                  <Users className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-xl lg:text-2xl font-bold text-white tracking-tight">
                  {data.kpis.totalVisitors.toLocaleString()}
                </div>
                <div className="text-[10px] text-emerald-400/80 mt-1 flex items-center gap-1">
                  <span>Unique Visitors</span>
                </div>
              </div>

              {/* Active Now */}
              <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-[11px] font-medium">النشطون الآن</span>
                  <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                </div>
                <div className="text-xl lg:text-2xl font-bold text-emerald-400 tracking-tight">
                  {data.kpis.activeVisitorsNow.toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  آخر 5 دقائق
                </div>
              </div>

              {/* Returning Visitors */}
              <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-[11px] font-medium">الزوار العائدون</span>
                  <RotateCcw className="w-4 h-4 text-teal-400" />
                </div>
                <div className="text-xl lg:text-2xl font-bold text-white tracking-tight">
                  {data.kpis.returningVisitors.toLocaleString()}
                </div>
                <div className="text-[10px] text-teal-400/80 mt-1">
                  {data.kpis.totalVisitors > 0
                    ? `${Math.round((data.kpis.returningVisitors / data.kpis.totalVisitors) * 100)}% عودة`
                    : '0%'}
                </div>
              </div>

              {/* Total Page Views */}
              <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-[11px] font-medium">مشاهدات الصفحات</span>
                  <Eye className="w-4 h-4 text-sky-400" />
                </div>
                <div className="text-xl lg:text-2xl font-bold text-white tracking-tight">
                  {data.kpis.totalPageViews.toLocaleString()}
                </div>
                <div className="text-[10px] text-sky-400/80 mt-1">
                  {data.kpis.totalSessions > 0
                    ? `${(data.kpis.totalPageViews / data.kpis.totalSessions).toFixed(1)} صفحة/جلسة`
                    : '0'}
                </div>
              </div>

              {/* Total Sessions */}
              <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-[11px] font-medium">إجمالي الجلسات</span>
                  <Layers className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-xl lg:text-2xl font-bold text-white tracking-tight">
                  {data.kpis.totalSessions.toLocaleString()}
                </div>
                <div className="text-[10px] text-amber-400/80 mt-1">
                  Total Sessions
                </div>
              </div>

              {/* Avg Session Duration */}
              <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-[11px] font-medium">متوسط مدة الجلسة</span>
                  <Clock className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="text-xl lg:text-2xl font-bold text-white tracking-tight">
                  {formatDuration(data.kpis.avgSessionDurationSeconds)}
                </div>
                <div className="text-[10px] text-indigo-400/80 mt-1">
                  الارتداد: {data.kpis.bounceRatePercentage}%
                </div>
              </div>
            </div>

            {/* TAB: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Visual Chart Card */}
                <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <h2 className="text-sm font-bold text-white flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                        النشاط والزيارات عبر الزمن
                      </h2>
                      <p className="text-xs text-slate-400">
                        مخطط بياني لتطور الزوار والجلسات والمشاهدات
                      </p>
                    </div>

                    {/* Metric Selector */}
                    <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5 self-start sm:self-auto">
                      {[
                        { id: 'visitors', label: 'الزوار (Visitors)' },
                        { id: 'sessions', label: 'الجلسات (Sessions)' },
                        { id: 'pageViews', label: 'المشاهدات (Views)' }
                      ].map((m) => (
                        <button
                          key={m.id}
                          onClick={() => setChartMetric(m.id as any)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            chartMetric === m.id
                              ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* SVG Line / Bar Chart */}
                  {data.chartData && data.chartData.length > 0 ? (
                    <div className="h-64 w-full relative flex items-end gap-2 pt-8 pb-6 px-2">
                      {data.chartData.map((point, index) => {
                        const val = point[chartMetric];
                        const heightPercent = Math.max(4, (val / chartMax) * 100);

                        return (
                          <div
                            key={index}
                            className="flex-1 flex flex-col items-center h-full justify-end group relative"
                          >
                            {/* Hover Tooltip */}
                            <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[10px] px-2.5 py-1 rounded-lg border border-white/10 shadow-xl pointer-events-none z-20 whitespace-nowrap">
                              <span className="font-bold">{val}</span> {chartMetric} ({point.date})
                            </div>

                            {/* Bar Visual */}
                            <div
                              style={{ height: `${heightPercent}%` }}
                              className="w-full max-w-[32px] rounded-t-lg bg-gradient-to-t from-emerald-600/40 to-emerald-400 group-hover:from-emerald-500 group-hover:to-teal-300 transition-all shadow-sm"
                            />

                            {/* Label */}
                            <span className="text-[9px] text-slate-500 mt-2 truncate max-w-full">
                              {point.date.length > 5 ? point.date.slice(5) : point.date}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="h-48 flex items-center justify-center text-xs text-slate-500">
                      لا توجد بيانات مسجلة في هذا النطاق الزمني
                    </div>
                  )}
                </div>

                {/* Grid 2 Columns: Sources & Top Pages */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Traffic Sources */}
                  <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-5">
                    <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                      <Compass className="w-4 h-4 text-teal-400" />
                      مصادر الزيارات (Traffic Sources)
                    </h3>
                    <div className="space-y-3">
                      {data.trafficSources && data.trafficSources.length > 0 ? (
                        data.trafficSources.map((src, i) => (
                          <div key={i} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-300 font-medium">{src.source}</span>
                              <span className="text-slate-400">
                                {src.count.toLocaleString()} ({src.percentage}%)
                              </span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                              <div
                                className="h-full bg-teal-500 rounded-full"
                                style={{ width: `${Math.max(3, src.percentage)}%` }}
                              />
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-500">لا توجد مصادر مسجلة بعد</p>
                      )}
                    </div>
                  </div>

                  {/* Top Pages */}
                  <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-5">
                    <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                      <Eye className="w-4 h-4 text-sky-400" />
                      أكثر الصفحات زيارة (Top Pages)
                    </h3>
                    <div className="space-y-3">
                      {data.topPages && data.topPages.length > 0 ? (
                        data.topPages.map((page, i) => (
                          <div key={i} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-300 font-medium">{page.title}</span>
                              <span className="text-slate-400">
                                {page.views.toLocaleString()} ({page.percentage}%)
                              </span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                              <div
                                className="h-full bg-sky-500 rounded-full"
                                style={{ width: `${Math.max(3, page.percentage)}%` }}
                              />
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-500">لا توجد مشاهدات مسجلة بعد</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: SAKINAH FEATURES */}
            {activeTab === 'features' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Dhikr Usage */}
                  <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-white mb-1">الأذكار اليومية</h3>
                    <p className="text-xs text-slate-400 mb-4">تفاعل الزوار مع أذكار الصباح والمساء</p>
                    <div className="space-y-2 border-t border-white/5 pt-3">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">عدد مرات فتح الأذكار:</span>
                        <span className="font-bold text-white">{data.features.dhikrViews.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">عدد إكمال الورد كاملاً:</span>
                        <span className="font-bold text-emerald-400">{data.features.dhikrCompletions.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Prayer Times Usage */}
                  <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-5">
                    <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 mb-4">
                      <Clock className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-white mb-1">مواقيت الصلاة والقبلة</h3>
                    <p className="text-xs text-slate-400 mb-4">استعراض المواقيت وتفعيل تنبيهات الأذان</p>
                    <div className="space-y-2 border-t border-white/5 pt-3">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">استعراض صفحة المواقيت:</span>
                        <span className="font-bold text-white">{data.features.prayerViews.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">تفعيل إشعارات الصلاة:</span>
                        <span className="font-bold text-teal-400">{data.features.prayerNotifications.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Charity & Good Deeds Usage */}
                  <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-5">
                    <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4">
                      <Heart className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-white mb-1">الخير والصدقة</h3>
                    <p className="text-xs text-slate-400 mb-4">تسجيل أعمال الخير والصدقات الخفية</p>
                    <div className="space-y-2 border-t border-white/5 pt-3">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">إجمالي أعمال الخير المسجلة:</span>
                        <span className="font-bold text-white">{data.features.goodDeedsLogged.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">الصدقات الخفية الموثقة:</span>
                        <span className="font-bold text-rose-400">{data.features.secretDeedsLogged.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Setup */}
                  <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-5">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-white mb-1">الإعداد السريع (Onboarding)</h3>
                    <p className="text-xs text-slate-400 mb-4">إكمال خطوات التخصيص عند أول فتح</p>
                    <div className="space-y-2 border-t border-white/5 pt-3">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">إكمال الإعداد السريع:</span>
                        <span className="font-bold text-indigo-400">{data.features.quickSetupCompleted.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Reminders */}
                  <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-5">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4">
                      <Bell className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-white mb-1">التذكيرات والإشعارات</h3>
                    <p className="text-xs text-slate-400 mb-4">تفعيل تذكيرات الأذكار والسنن</p>
                    <div className="space-y-2 border-t border-white/5 pt-3">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">تفعيل التذكيرات:</span>
                        <span className="font-bold text-amber-400">{data.features.reminderEnabled.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* PWA Installs */}
                  <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-5">
                    <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 mb-4">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-white mb-1">تثبيت التطبيق (PWA)</h3>
                    <p className="text-xs text-slate-400 mb-4">تثبيت سكينة كتطبيق على شاشة الهاتف</p>
                    <div className="space-y-2 border-t border-white/5 pt-3">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">تثبيت ناجح للتطبيق:</span>
                        <span className="font-bold text-sky-400">{data.features.pwaInstalled.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: AUDIENCE & DEVICES */}
            {activeTab === 'audience' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Countries List */}
                <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-5 lg:col-span-2">
                  <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-emerald-400" />
                    التوزيع الجغرافي للزوار (Visitors by Country)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {data.countries && data.countries.length > 0 ? (
                      data.countries.map((c, i) => (
                        <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-medium text-slate-200">{c.name}</span>
                            <span className="text-slate-400">
                              {c.count.toLocaleString()} ({c.percentage}%)
                            </span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-black/40 overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${Math.max(4, c.percentage)}%` }}
                            />
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500">لا توجد بيانات بلدان بعد</p>
                    )}
                  </div>
                </div>

                {/* Devices & Browsers */}
                <div className="space-y-6">
                  {/* Devices */}
                  <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-5">
                    <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-teal-400" />
                      نوع الجهاز (Devices)
                    </h3>
                    <div className="space-y-3">
                      {data.devices &&
                        data.devices.map((d, i) => (
                          <div key={i} className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-300">
                                {d.device === 'mobile' ? 'هاتف (Mobile) 📱' : d.device === 'tablet' ? 'جهاز لوحي (Tablet) 📲' : 'كمبيوتر (Desktop) 💻'}
                              </span>
                              <span className="text-slate-400">{d.count} ({d.percentage}%)</span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                              <div
                                className="h-full bg-teal-500 rounded-full"
                                style={{ width: `${Math.max(4, d.percentage)}%` }}
                              />
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Browsers */}
                  <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-5">
                    <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                      <Globe className="w-4 h-4 text-sky-400" />
                      المتصفحات (Browsers)
                    </h3>
                    <div className="space-y-3">
                      {data.browsers &&
                        data.browsers.map((b, i) => (
                          <div key={i} className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-300">{b.browser}</span>
                              <span className="text-slate-400">{b.count} ({b.percentage}%)</span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                              <div
                                className="h-full bg-sky-500 rounded-full"
                                style={{ width: `${Math.max(4, b.percentage)}%` }}
                              />
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: FUNNEL & RETENTION */}
            {activeTab === 'funnel' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Onboarding & Activation Funnel */}
                <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-5">
                  <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    مسار التحويل والتفعيل (Onboarding Funnel)
                  </h3>
                  <p className="text-xs text-slate-400 mb-6">
                    متابعة انتقال الزائر من أول فتح للموقع إلى تفعيل الميزات والعبادات
                  </p>

                  <div className="space-y-4">
                    {data.funnel &&
                      data.funnel.map((step, idx) => (
                        <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-white">{step.stepName}</span>
                            <span className="text-emerald-400 font-bold">
                              {step.count.toLocaleString()} ({step.conversionRate}%)
                            </span>
                          </div>
                          <div className="h-2.5 w-full rounded-full bg-black/40 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-emerald-600 to-teal-400 rounded-full transition-all duration-500"
                              style={{ width: `${Math.max(4, step.conversionRate)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Simplified Retention */}
                <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-5 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                      <RotateCcw className="w-4 h-4 text-teal-400" />
                      مؤشرات عودة واستمرارية الزوار (Retention)
                    </h3>
                    <p className="text-xs text-slate-400 mb-6">
                      نسبة الزوار الذين عادوا للموقع بعد فترات زمنية مختلفة
                    </p>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center">
                        <div className="text-2xl font-bold text-emerald-400 mb-1">
                          {data.retention.day1Rate}%
                        </div>
                        <div className="text-[11px] text-slate-400">العودة بعد يوم (Day 1)</div>
                      </div>

                      <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center">
                        <div className="text-2xl font-bold text-teal-400 mb-1">
                          {data.retention.day7Rate}%
                        </div>
                        <div className="text-[11px] text-slate-400">العودة بعد أسبوع (Day 7)</div>
                      </div>

                      <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center">
                        <div className="text-2xl font-bold text-sky-400 mb-1">
                          {data.retention.day30Rate}%
                        </div>
                        <div className="text-[11px] text-slate-400">العودة بعد شهر (Day 30)</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-slate-300">
                    💡 <strong className="text-emerald-400">الاستمرارية الروحانية:</strong> تعكس هذه النسب مدى اعتياد الزوار على العودة لقراءة الأذكار ومتابعة الصلاة اليومية.
                  </div>
                </div>
              </div>
            )}

            {/* TAB: EVENTS LOG */}
            {activeTab === 'events' && (
              <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Layers className="w-4 h-4 text-emerald-400" />
                      مستكشف الأحداث المباشرة (Live Event Explorer)
                    </h3>
                    <p className="text-xs text-slate-400">آخر 50 تفاعل مسجل في قاعدة البيانات</p>
                  </div>

                  {/* Search & Filter */}
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedEventFilter}
                      onChange={(e) => setSelectedEventFilter(e.target.value)}
                      className="px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500/40"
                    >
                      <option value="all">كل الأحداث (All Events)</option>
                      <option value="page_view">page_view</option>
                      <option value="quick_setup_started">quick_setup_started</option>
                      <option value="quick_setup_completed">quick_setup_completed</option>
                      <option value="dhikr_opened">dhikr_opened</option>
                      <option value="dhikr_completed">dhikr_completed</option>
                      <option value="prayer_times_opened">prayer_times_opened</option>
                      <option value="prayer_notification_enabled">prayer_notification_enabled</option>
                      <option value="good_deed_logged">good_deed_logged</option>
                      <option value="secret_good_deed_logged">secret_good_deed_logged</option>
                      <option value="pwa_installed">pwa_installed</option>
                    </select>

                    <div className="relative">
                      <input
                        type="text"
                        value={eventSearch}
                        onChange={(e) => setEventSearch(e.target.value)}
                        placeholder="بحث في الأحداث..."
                        className="px-3 py-1.5 pr-8 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/40"
                      />
                      <Search className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto rounded-xl border border-white/5">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-white/5 text-slate-400 border-b border-white/5">
                      <tr>
                        <th className="p-3 font-medium">الوقت</th>
                        <th className="p-3 font-medium">الحدث (Event)</th>
                        <th className="p-3 font-medium">الصفحة (Path)</th>
                        <th className="p-3 font-medium">الدولة</th>
                        <th className="p-3 font-medium">الجهاز</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-slate-300">
                      {filteredEvents.length > 0 ? (
                        filteredEvents.map((ev) => (
                          <tr key={ev.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="p-3 text-slate-400 whitespace-nowrap">
                              {new Date(ev.createdAt).toLocaleTimeString('ar-EG', {
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit'
                              })}
                            </td>
                            <td className="p-3 font-semibold text-emerald-400">
                              {ev.eventName}
                            </td>
                            <td className="p-3 text-slate-400 font-mono text-[11px]">{ev.path}</td>
                            <td className="p-3 text-slate-300">{ev.country || 'Unknown'}</td>
                            <td className="p-3 text-slate-400">{ev.deviceType || 'desktop'}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="p-6 text-center text-slate-500">
                            لا توجد أحداث مطابقة للبحث
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        ) : null}
      </main>
    </div>
  );
};
