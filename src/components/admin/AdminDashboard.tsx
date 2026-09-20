import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  Radio,
  TrendingDown,
  Moon,
  Flame,
  Calendar as CalendarIcon,
  X,
  Printer
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
  const [activeTab, setActiveTab] = useState<'overview' | 'radar' | 'islamic' | 'features' | 'audience' | 'funnel' | 'events'>('overview');
  const [chartMetric, setChartMetric] = useState<'visitors' | 'sessions' | 'pageViews'>('visitors');
  const [eventSearch, setEventSearch] = useState('');
  const [selectedEventFilter, setSelectedEventFilter] = useState('all');

  // Custom date picker modal
  const [isCustomDateOpen, setIsCustomDateOpen] = useState(false);
  const [customStartDate, setCustomStartDate] = useState(
    new Date(Date.now() - 14 * 86400000).toISOString().slice(0, 10)
  );

  // In-Memory SWR Cache for instant 0ms switching
  const cacheRef = useRef<Map<string, AnalyticsDashboardData>>(new Map());

  const fetchStats = async (selectedRange = range, isBackground = false, customDate?: string) => {
    const cacheKey = customDate ? `custom_${customDate}` : selectedRange;

    // SWR: If cache exists and not a manual refresh, use cached data instantly
    if (!isBackground && cacheRef.current.has(cacheKey)) {
      setData(cacheRef.current.get(cacheKey)!);
      setIsLoading(false);
    } else if (!isBackground) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }

    const token = localStorage.getItem('sakinah_admin_token') || '';
    const queryUrl = customDate
      ? `/api/admin/stats?range=custom&startDate=${customDate}`
      : `/api/admin/stats?range=${selectedRange}`;

    try {
      const res = await fetch(queryUrl, {
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
        cacheRef.current.set(cacheKey, json);
      } else {
        if (!data) showToast(json.error || 'فشل تحميل البيانات');
      }
    } catch {
      if (!data) showToast('تعذر الاتصال بالخادم لجلب الإحصائيات');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats(range);
    // Auto refresh active radar every 20 seconds
    const interval = setInterval(() => {
      fetchStats(range, true);
    }, 20000);
    return () => clearInterval(interval);
  }, [range]);

  const handleRangeChange = (newRange: TimeRange) => {
    setRange(newRange);
  };

  const handleApplyCustomDate = () => {
    setRange('custom');
    setIsCustomDateOpen(false);
    fetchStats('custom', false, customStartDate);
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

  // Print Report
  const handlePrint = () => {
    window.print();
  };

  // Filtered Events
  const filteredEvents = useMemo(() => {
    if (!data?.recentEvents) return [];
    return data.recentEvents.filter((ev) => {
      const matchSearch =
        ev.eventName.toLowerCase().includes(eventSearch.toLowerCase()) ||
        ev.path.toLowerCase().includes(eventSearch.toLowerCase()) ||
        (ev.country && ev.country.toLowerCase().includes(eventSearch.toLowerCase())) ||
        (ev.visitorName && ev.visitorName.toLowerCase().includes(eventSearch.toLowerCase())) ||
        (ev.metadata?.name && String(ev.metadata.name).toLowerCase().includes(eventSearch.toLowerCase()));
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

  const hourlyMax = useMemo(() => {
    if (!data?.islamicInsights?.hourlyPeaks) return 10;
    const maxVal = Math.max(...data.islamicInsights.hourlyPeaks.map((h) => h.count));
    return maxVal > 0 ? maxVal * 1.15 : 10;
  }, [data?.islamicInsights?.hourlyPeaks]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-24 print:bg-white print:text-black" dir="rtl">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-xl border-b border-white/10 px-4 lg:px-8 py-3.5 print:hidden">
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
                    Admin Pro
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 hidden sm:block">
                  بيانات حقيقية مجهولة الهوية 100% • SWR Instant Cache
                </p>
              </div>
            </div>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live Indicator Button (switches to Radar tab) */}
            {data?.kpis && (
              <button
                onClick={() => setActiveTab('radar')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs transition-all ${
                  activeTab === 'radar'
                    ? 'bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-500/20'
                    : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                }`}
                title="عرض الرادار المباشر"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="font-semibold">{data.kpis.activeVisitorsNow}</span>
                <span className="text-[11px] hidden sm:inline">نشط الآن</span>
              </button>
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

            {/* Print / PDF */}
            <button
              onClick={handlePrint}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 transition-colors hidden sm:block"
              title="طباعة التقرير"
            >
              <Printer className="w-4 h-4" />
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
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-slate-900/60 backdrop-blur-lg border border-white/10 rounded-2xl p-3 print:hidden">
          {/* Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {[
              { id: 'overview', label: 'نظرة عامة', icon: Activity },
              { id: 'radar', label: '🔴 الرادار المباشر', icon: Radio },
              { id: 'islamic', label: '🕌 أوقات الذروة والعبادات', icon: Moon },
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

            <button
              onClick={() => setIsCustomDateOpen(true)}
              className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
                range === 'custom'
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
              title="تاريخ مخصص"
            >
              <CalendarIcon className="w-3 h-3" />
              <span className="hidden sm:inline">مخصص</span>
            </button>
          </div>
        </div>

        {/* Custom Date Modal */}
        {isCustomDateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-sm space-y-4 shadow-2xl">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-emerald-400" />
                  اختيار تاريخ بداية التقرير
                </h3>
                <button onClick={() => setIsCustomDateOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-2">تاريخ البدء:</label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500/50"
                />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button
                  onClick={() => setIsCustomDateOpen(false)}
                  className="px-3 py-1.5 rounded-xl bg-white/5 text-slate-400 text-xs hover:bg-white/10"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleApplyCustomDate}
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-500"
                >
                  تطبيق
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading State Skeleton */}
        {isLoading && !data ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 animate-pulse">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-28 rounded-2xl bg-slate-900/60 border border-white/5" />
            ))}
          </div>
        ) : data ? (
          <>
            {/* 1. TOP KPI CARDS WITH GROWTH BADGES */}
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
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px] text-slate-400">Unique</span>
                  {data.kpis.growth && (
                    <span
                      className={`text-[10px] font-semibold flex items-center gap-0.5 ${
                        data.kpis.growth.visitorsGrowth >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {data.kpis.growth.visitorsGrowth >= 0 ? '+' : ''}
                      {data.kpis.growth.visitorsGrowth}%
                      {data.kpis.growth.visitorsGrowth >= 0 ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                    </span>
                  )}
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
                  لحظي (آخر 60ث)
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
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px] text-sky-400/80">
                    {data.kpis.totalSessions > 0
                      ? `${(data.kpis.totalPageViews / data.kpis.totalSessions).toFixed(1)}/جلسة`
                      : '0'}
                  </span>
                  {data.kpis.growth && (
                    <span
                      className={`text-[10px] font-semibold flex items-center gap-0.5 ${
                        data.kpis.growth.pageViewsGrowth >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {data.kpis.growth.pageViewsGrowth >= 0 ? '+' : ''}
                      {data.kpis.growth.pageViewsGrowth}%
                    </span>
                  )}
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
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px] text-amber-400/80">Sessions</span>
                  {data.kpis.growth && (
                    <span
                      className={`text-[10px] font-semibold flex items-center gap-0.5 ${
                        data.kpis.growth.sessionsGrowth >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {data.kpis.growth.sessionsGrowth >= 0 ? '+' : ''}
                      {data.kpis.growth.sessionsGrowth}%
                    </span>
                  )}
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

                  {/* SVG Bar Chart */}
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

            {/* TAB: REAL-TIME RADAR */}
            {activeTab === 'radar' && (
              <div className="space-y-6">
                {/* Hero Radar Banner */}
                <div className="bg-gradient-to-br from-emerald-950/40 via-slate-900/80 to-teal-950/40 border border-emerald-500/20 rounded-3xl p-6 lg:p-8 relative overflow-hidden">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="space-y-2 text-center sm:text-right">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        رادار البث اللحظي (Live Activity Radar)
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-bold text-white">
                        {data.radar?.activeCount || data.kpis.activeVisitorsNow}{' '}
                        <span className="text-emerald-400 font-medium text-lg">زائر يتصفح سكينة الآن</span>
                      </h2>
                      <p className="text-xs text-slate-400">
                        يتم تحديث نشاط الزوار بالثواني عبر إشارات البث الحية
                      </p>
                    </div>

                    {/* Radar Pulse Visual */}
                    <div className="relative w-28 h-28 flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full border border-emerald-500/20 animate-ping" />
                      <div className="absolute inset-2 rounded-full border border-emerald-500/40" />
                      <div className="absolute inset-6 rounded-full bg-emerald-500/10 border border-emerald-500/50" />
                      <Radio className="w-8 h-8 text-emerald-400 animate-pulse relative z-10" />
                    </div>
                  </div>
                </div>

                {/* Radar Subsections: Active Pages & Countries */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Active Pages Now */}
                  <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-5">
                    <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                      <Eye className="w-4 h-4 text-emerald-400" />
                      الصفحات المفتوحة حالياً (Active Pages Right Now)
                    </h3>
                    <div className="space-y-3">
                      {data.radar?.activePages && data.radar.activePages.length > 0 ? (
                        data.radar.activePages.map((p, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between"
                          >
                            <span className="text-xs text-slate-200 font-medium">{p.title}</span>
                            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                              {p.count} نشط
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-500">لا يوجد زوار نشطون في هذه اللحظة</p>
                      )}
                    </div>
                  </div>

                  {/* Active Countries Now */}
                  <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-5">
                    <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                      <Globe className="w-4 h-4 text-teal-400" />
                      الدول المتصلة الآن (Active Countries Right Now)
                    </h3>
                    <div className="space-y-3">
                      {data.radar?.activeCountries && data.radar.activeCountries.length > 0 ? (
                        data.radar.activeCountries.map((c, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between"
                          >
                            <span className="text-xs text-slate-200 font-medium">{c.name}</span>
                            <span className="px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20 text-xs font-bold">
                              {c.count} متصل
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-500">لا توجد دول متصلة حالياً</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Live Pulse Feed */}
                <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-5">
                  <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-sky-400" />
                    شريط النبضات الحية لأحدث التفاعلات (Live Activity Stream)
                  </h3>
                  <div className="space-y-2">
                    {data.radar?.livePulseFeed && data.radar.livePulseFeed.length > 0 ? (
                      data.radar.livePulseFeed.map((ev) => (
                        <div
                          key={ev.id}
                          className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                            <span className="font-semibold text-emerald-300">{ev.eventName}</span>
                            {(ev.visitorName || ev.metadata?.name) && (
                              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[11px] font-medium border border-emerald-500/30 flex items-center gap-1">
                                <span>👤</span>
                                <span>{ev.visitorName || (ev.metadata?.name ? String(ev.metadata.name) : '')}</span>
                              </span>
                            )}
                            <span className="text-slate-400 font-mono">{ev.path}</span>
                          </div>
                          <div className="flex items-center gap-3 text-slate-400">
                            <span>{ev.country || '🌍'}</span>
                            <span>
                              {new Date(ev.createdAt).toLocaleTimeString('ar-EG', {
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500">لا توجد نبضات حية مسجلة حديثاً</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: ISLAMIC PEAKS & INSIGHTS */}
            {activeTab === 'islamic' && (
              <div className="space-y-6">
                {/* 24-Hour Prayer Peak Heatmap */}
                <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Flame className="w-4 h-4 text-amber-400" />
                        أوقات الذروة والتفاعل حول أوقات الصلوات (24-Hour Peak Distribution)
                      </h3>
                      <p className="text-xs text-slate-400">
                        يوضح هذا المخطط أوقات إقبال الزوار على مدار الـ 24 ساعة لضبط مواعيد التذكير المناسبة
                      </p>
                    </div>
                  </div>

                  {/* 24-Hour Chart */}
                  <div className="h-56 w-full relative flex items-end gap-1 sm:gap-1.5 pt-8 pb-6 px-2 overflow-x-auto">
                    {data.islamicInsights?.hourlyPeaks.map((h, i) => {
                      const heightPercent = Math.max(6, (h.count / hourlyMax) * 100);
                      const isPrayerTime = !!h.prayerContext;

                      return (
                        <div
                          key={i}
                          className="flex-1 min-w-[24px] flex flex-col items-center h-full justify-end group relative"
                        >
                          {/* Tooltip */}
                          <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[10px] px-2 py-1 rounded-lg border border-white/10 shadow-xl pointer-events-none z-20 whitespace-nowrap">
                            <span className="font-bold">{h.count} تفاعل</span> ({h.label})
                            {h.prayerContext && <div className="text-amber-400">{h.prayerContext}</div>}
                          </div>

                          {/* Bar */}
                          <div
                            style={{ height: `${heightPercent}%` }}
                            className={`w-full rounded-t-md transition-all ${
                              isPrayerTime
                                ? 'bg-gradient-to-t from-amber-600 to-amber-400 shadow-sm shadow-amber-500/20'
                                : 'bg-gradient-to-t from-slate-700 to-slate-500'
                            }`}
                          />

                          {/* Hour Label */}
                          <span className="text-[8px] sm:text-[9px] text-slate-500 mt-1.5">
                            {h.hour % 3 === 0 ? h.label : ''}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-4 text-[11px] text-slate-400 border-t border-white/5 pt-3 mt-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-sm bg-amber-400" />
                      <span>فترات الصلوات الخمس (الفجر، الظهر، العصر، المغرب، العشاء)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-sm bg-slate-600" />
                      <span>ساعات اليوم الأخرى</span>
                    </div>
                  </div>
                </div>

                {/* Two Columns: Dhikr Categories & Charity Breakdown */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Top Dhikr Categories */}
                  <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-5">
                    <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-emerald-400" />
                      أكثر فئات الأذكار قراءة واكتمالاً (Top Adhkar Categories)
                    </h3>
                    <div className="space-y-3">
                      {data.islamicInsights?.topDhikrCategories &&
                      data.islamicInsights.topDhikrCategories.length > 0 ? (
                        data.islamicInsights.topDhikrCategories.map((c, idx) => (
                          <div key={idx} className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-200 font-medium">{c.label}</span>
                              <span className="text-emerald-400 font-bold">
                                {c.count.toLocaleString()} ({c.percentage}%)
                              </span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                              <div
                                className="h-full bg-emerald-500 rounded-full"
                                style={{ width: `${Math.max(4, c.percentage)}%` }}
                              />
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-500">لا توجد بيانات أذكار مسجلة بعد</p>
                      )}
                    </div>
                  </div>

                  {/* Charity Types Breakdown */}
                  <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-5">
                    <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                      <Heart className="w-4 h-4 text-rose-400" />
                      توزيع أصناف الخير والصدقة (Good Deeds Categories)
                    </h3>
                    <div className="space-y-3">
                      {data.islamicInsights?.charityCategories &&
                      data.islamicInsights.charityCategories.length > 0 ? (
                        data.islamicInsights.charityCategories.map((c, idx) => (
                          <div key={idx} className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-200 font-medium">{c.label}</span>
                              <span className="text-rose-400 font-bold">
                                {c.count.toLocaleString()} ({c.percentage}%)
                              </span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                              <div
                                className="h-full bg-rose-500 rounded-full"
                                style={{ width: `${Math.max(4, c.percentage)}%` }}
                              />
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-500">لا توجد أعمال خير مسجلة في هذه الفترة</p>
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
                  <div className="bg-slate-900/60 backdrop-blur-md border border-teal-500/20 rounded-2xl p-5">
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
                            <td className="p-3">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-semibold text-emerald-400">
                                  {ev.eventName}
                                </span>
                                {(ev.visitorName || ev.metadata?.name) && (
                                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 text-[10px] font-medium border border-emerald-500/30 flex items-center gap-1">
                                    <span>👤</span>
                                    <span>{ev.visitorName || (ev.metadata?.name ? String(ev.metadata.name) : '')}</span>
                                  </span>
                                )}
                              </div>
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
        ) : (
          <div className="min-h-[350px] flex flex-col items-center justify-center gap-3 bg-slate-900/40 rounded-2xl border border-white/5 p-8 text-center">
            <p className="text-sm text-slate-300 font-medium">تعذر تحميل بيانات التحليلات</p>
            <p className="text-xs text-slate-500 max-w-sm">يرجى التحقق من اتصالك وإعادة المحاولة</p>
            <button
              onClick={() => fetchStats(range, false)}
              className="mt-2 px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-medium hover:bg-emerald-500/30 transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              إعادة المحاولة
            </button>
          </div>
        )}
      </main>
    </div>
  );
};
