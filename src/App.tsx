import { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { MobileNav } from './components/layout/MobileNav';
import { Footer } from './components/layout/Footer';
import { HomeBanner } from './components/home/HomeBanner';
import { DailyWird } from './components/home/DailyWird';
import { HeroVerse } from './components/home/HeroVerse';
import { DailyDhikr } from './components/home/DailyDhikr';
import { DailyMessageCard } from './components/home/DailyMessageCard';
import { PrayerTimes } from './components/home/PrayerTimes';
import { CategoryGrid } from './components/home/CategoryGrid';
import { HadithSpotlight } from './components/home/HadithSpotlight';
import { SuggestedVideos } from './components/home/SuggestedVideos';
import { PrayerTimesView } from './components/prayer/PrayerTimesView';
import { QiblaView } from './components/qibla/QiblaView';
import { AdhkarView } from './components/adhkar/AdhkarView';
import { HadithView } from './components/hadith/HadithView';
import { FavoritesView } from './components/favorites/FavoritesView';
import { SourcesView } from './components/sources/SourcesView';
import { SearchModal } from './components/common/SearchModal';
import { TasbeehModal } from './components/common/TasbeehModal';
import { SettingsModal } from './components/common/SettingsModal';
import { ShareCardModal } from './components/common/ShareCardModal';
import { ReadingModeModal } from './components/common/ReadingModeModal';
import { PWAInstallModal } from './components/common/PWAInstallModal';
import { PWAInstallBanner } from './components/common/PWAInstallBanner';
import { WelcomeModal } from './components/common/WelcomeModal';
import { QuickSetupModal } from './components/onboarding/QuickSetupModal';
import { CharityCard } from './components/charity/CharityCard';
import { LogGoodDeedModal } from './components/charity/LogGoodDeedModal';
import { CharityHarvestView } from './components/charity/CharityHarvestView';
import { AdminLoginView } from './components/admin/AdminLoginView';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { OfflineBanner } from './components/common/OfflineBanner';
import { ToastProvider } from './components/common/Toast';

import { PageType, AdhkarCategory, HadithTopic, Dhikr, Hadith, DailyMessage } from './types';
import { HomeCardId } from './types/onboarding';
import { useFavorites } from './hooks/useFavorites';
import { useDhikrProgress } from './hooks/useDhikrProgress';
import { useReadingSettings } from './hooks/useReadingSettings';
import { useTheme } from './hooks/useTheme';
import { useLastPosition } from './hooks/useLastPosition';
import { usePWAInstall } from './hooks/usePWAInstall';
import { useOnboarding } from './hooks/useOnboarding';
import { useCharity } from './hooks/useCharity';
import { useAnalytics } from './hooks/useAnalytics';

import adhkarDataRaw from './data/adhkar.json';
import hadithsDataRaw from './data/hadiths.json';
import versesDataRaw from './data/verses.json';
import dailyMessagesDataRaw from './data/dailyMessages.json';

const adhkarData = adhkarDataRaw as Dhikr[];
const hadithsData = hadithsDataRaw as Hadith[];
const versesData = versesDataRaw;
const dailyMessagesData = dailyMessagesDataRaw as DailyMessage[];

export function AppContent() {
  const [currentPage, setCurrentPage] = useState<PageType>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path === '/admin' || window.location.search.includes('admin')) {
        return 'admin';
      }
    }
    return 'home';
  });

  const [adminToken, setAdminToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem('sakinah_admin_token');
    } catch {
      return null;
    }
  });

  const [selectedAdhkarCategory, setSelectedAdhkarCategory] = useState<AdhkarCategory>('morning');
  const [selectedHadithTopic, setSelectedHadithTopic] = useState<HadithTopic>('all');

  // Modals
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isTasbeehOpen, setIsTasbeehOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isReadingModeOpen, setIsReadingModeOpen] = useState(false);
  const [shareItem, setShareItem] = useState<Dhikr | Hadith | null>(null);

  // Automatic anonymous page view tracking
  useAnalytics(currentPage, isSettingsOpen);

  // Quick Setup & Onboarding Hook
  const {
    onboardingState,
    userPreferences,
    isOpen: isOnboardingOpen,
    openSetup,
    closeSetup,
    updatePreferences,
    toggleHomeCard,
    moveHomeCard,
    requestNotificationPermission,
    handleComplete: handleCompleteOnboarding,
    handleSkip: handleSkipOnboarding,
    handleRestart: handleRestartOnboarding,
    handleResetSettings,
    handleFullReset,
  } = useOnboarding();

  // Charity & Good Deeds Hook
  const {
    deeds: charityDeeds,
    todayDeeds: charityTodayDeeds,
    hasLoggedToday: charityHasLoggedToday,
    weeklySummary: charityWeeklySummary,
    streak: charityStreak,
    randomSecretIdea,
    refreshSecretIdea,
    isLoggingOpen: isCharityLoggingOpen,
    openLogging: openCharityLogging,
    closeLogging: closeCharityLogging,
    logDeed: logCharityDeed,
    logSecretDeed,
    deleteDeed: deleteCharityDeed,
    snoozeReminder: snoozeCharityReminder,
  } = useCharity();

  const [isWelcomeOpen, setIsWelcomeOpen] = useState(() => {
    try {
      // If onboarding is active on first launch, don't show the legacy welcome modal
      return false;
    } catch {
      return false;
    }
  });

  const handleCloseWelcome = () => {
    setIsWelcomeOpen(false);
    try {
      sessionStorage.setItem('sakinah_welcome_seen_v1', 'true');
    } catch {
      // Ignored
    }
  };

  // Settings, Theme, PWA & Storage hooks
  const { theme, isDark, toggleTheme } = useTheme();
  const { settings, updateSetting, increaseFontSize, decreaseFontSize, resetSettings } = useReadingSettings();
  const { lastPosition, savePosition } = useLastPosition();
  const { isInstallable, showIOSModal, setShowIOSModal, triggerInstall } = usePWAInstall();

  const {
    favorites,
    toggleDhikrFavorite,
    toggleHadithFavorite,
    isDhikrFavorite,
    isHadithFavorite,
    totalFavoritesCount,
    clearAllFavorites,
  } = useFavorites();

  const {
    counts,
    incrementCount,
    resetCount,
    resetAllCategoryCounts,
  } = useDhikrProgress(settings.soundEnabled, settings.vibrationEnabled);

  // Daily Dhikr & Hadith determination
  const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const dailyDhikr = adhkarData[dayOfYear % adhkarData.length] || adhkarData[0];
  const dailyHadith = hadithsData[dayOfYear % hadithsData.length] || hadithsData[0];

  const handleNavigate = (page: PageType) => {
    setCurrentPage(page);
    if (typeof window !== 'undefined' && window.history) {
      if (page === 'admin') {
        window.history.pushState(null, '', '/admin');
      } else if (window.location.pathname === '/admin') {
        window.history.pushState(null, '', '/');
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Keyboard shortcut (Cmd+K / Ctrl+K) for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Adhkar for current reading mode
  const currentReadingItems = adhkarData.filter((item) => item.category === selectedAdhkarCategory);

  // Dynamic Home Card Renderer
  const renderHomeCard = (cardId: HomeCardId) => {
    switch (cardId) {
      case 'prayerTimes':
        return <PrayerTimes key="prayerTimes" onNavigate={handleNavigate} />;
      case 'dailyMessage':
        return <DailyMessageCard key="dailyMessage" messages={dailyMessagesData} />;
      case 'charityToday':
        return (
          <CharityCard
            key="charityToday"
            todayDeeds={charityTodayDeeds}
            hasLoggedToday={charityHasLoggedToday}
            streakDays={charityStreak.currentStreakDays}
            onOpenLogging={openCharityLogging}
            onSnooze={snoozeCharityReminder}
            onNavigate={handleNavigate}
          />
        );
      case 'dailyWird':
        return (
          <DailyWird
            key="dailyWird"
            allAdhkar={adhkarData}
            counts={counts}
            lastPosition={lastPosition}
            onNavigate={handleNavigate}
            onSelectCategory={(cat) => setSelectedAdhkarCategory(cat)}
          />
        );
      case 'heroVerse':
        return <HeroVerse key="heroVerse" verses={versesData} />;
      case 'dailyDhikr':
        return (
          <DailyDhikr
            key="dailyDhikr"
            dhikr={dailyDhikr}
            count={counts[dailyDhikr.id] || 0}
            onIncrement={() => {
              savePosition(dailyDhikr.category, dailyDhikr.id);
              incrementCount(dailyDhikr.id, dailyDhikr.count);
            }}
            onReset={() => resetCount(dailyDhikr.id)}
            isFavorite={isDhikrFavorite(dailyDhikr.id)}
            onToggleFavorite={() => toggleDhikrFavorite(dailyDhikr.id)}
            onOpenShare={(d) => setShareItem(d)}
            onNavigate={handleNavigate}
          />
        );
      case 'categoryGrid':
        return (
          <CategoryGrid
            key="categoryGrid"
            onNavigate={handleNavigate}
            onSelectCategory={(cat) => setSelectedAdhkarCategory(cat)}
            onOpenTasbeeh={() => setIsTasbeehOpen(true)}
          />
        );
      case 'hadithSpotlight':
        return (
          <HadithSpotlight
            key="hadithSpotlight"
            hadith={dailyHadith}
            isFavorite={isHadithFavorite(dailyHadith.id)}
            onToggleFavorite={() => toggleHadithFavorite(dailyHadith.id)}
            onOpenShare={(h) => setShareItem(h)}
            onNavigate={handleNavigate}
          />
        );
      case 'suggestedVideos':
        return <SuggestedVideos key="suggestedVideos" />;
      default:
        return null;
    }
  };

  if (currentPage === 'admin') {
    if (!adminToken) {
      return (
        <AdminLoginView
          onLoginSuccess={(token) => setAdminToken(token)}
          onNavigateHome={() => handleNavigate('home')}
        />
      );
    }
    return (
      <AdminDashboard
        onLogout={() => {
          localStorage.removeItem('sakinah_admin_token');
          setAdminToken(null);
        }}
        onNavigateHome={() => handleNavigate('home')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-sand-50 dark:bg-night-900 bg-islamic-pattern flex flex-col justify-between text-stone-800 dark:text-night-text transition-colors duration-200">
      <div>
        {/* Top Navbar */}
        <Navbar
          currentPage={currentPage}
          onNavigate={handleNavigate}
          favoritesCount={totalFavoritesCount}
          isDark={isDark}
          isInstallable={isInstallable}
          onInstall={triggerInstall}
          onToggleTheme={toggleTheme}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenTasbeeh={() => setIsTasbeehOpen(true)}
          onOpenReadingMode={() => setIsReadingModeOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        {/* Main Content Focused Container */}
        <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-2 sm:pt-4 pb-8">
          {currentPage === 'home' && (
            <div className="space-y-3.5 sm:space-y-4.5">
              {/* Featured Brand Hero Banner with Greeting & Resume setup if skipped */}
              <HomeBanner
                onNavigate={handleNavigate}
                displayName={userPreferences.displayName}
                isSkippedOnboarding={onboardingState.skipped && !onboardingState.completed}
                onOpenSetup={openSetup}
              />

              {/* Dynamically Ordered and Configured Home Cards */}
              {userPreferences.homeLayout
                .filter((cardId) => !userPreferences.disabledHomeCards?.includes(cardId))
                .map((cardId) => renderHomeCard(cardId))}

              {/* PWA Install Banner */}
              <PWAInstallBanner
                isInstallable={isInstallable}
                onInstall={triggerInstall}
              />
            </div>
          )}

          {currentPage === 'prayer-times' && (
            <PrayerTimesView
              onNavigate={handleNavigate}
              onRestartSetup={handleRestartOnboarding}
            />
          )}

          {currentPage === 'qibla' && (
            <QiblaView onNavigate={handleNavigate} />
          )}

          {currentPage === 'charity' && (
            <CharityHarvestView
              deeds={charityDeeds}
              todayDeeds={charityTodayDeeds}
              weeklySummary={charityWeeklySummary}
              streak={charityStreak}
              randomSecretIdea={randomSecretIdea}
              onRefreshSecretIdea={refreshSecretIdea}
              onOpenLogging={openCharityLogging}
              onLogSecretDeed={logSecretDeed}
              onDeleteDeed={deleteCharityDeed}
              onNavigate={handleNavigate}
            />
          )}

          {currentPage === 'adhkar' && (
            <AdhkarView
              adhkar={adhkarData}
              counts={counts}
              onIncrement={incrementCount}
              onReset={resetCount}
              onResetAllCategory={resetAllCategoryCounts}
              isFavorite={isDhikrFavorite}
              onToggleFavorite={toggleDhikrFavorite}
              onOpenShare={(d) => setShareItem(d)}
              onOpenReadingMode={() => setIsReadingModeOpen(true)}
              onSavePosition={savePosition}
              lastPosition={lastPosition}
              settings={settings}
              selectedCategory={selectedAdhkarCategory}
              onSelectCategory={setSelectedAdhkarCategory}
            />
          )}

          {currentPage === 'hadith' && (
            <HadithView
              hadiths={hadithsData}
              isFavorite={isHadithFavorite}
              onToggleFavorite={toggleHadithFavorite}
              onOpenShare={(h) => setShareItem(h)}
              settings={settings}
              activeTopic={selectedHadithTopic}
              onSelectTopic={setSelectedHadithTopic}
            />
          )}

          {currentPage === 'favorites' && (
            <FavoritesView
              allAdhkar={adhkarData}
              allHadiths={hadithsData}
              favoriteAdhkarIds={favorites.adhkar}
              favoriteHadithIds={favorites.hadiths}
              counts={counts}
              onIncrementDhikr={incrementCount}
              onResetDhikr={resetCount}
              onToggleDhikrFavorite={toggleDhikrFavorite}
              onToggleHadithFavorite={toggleHadithFavorite}
              onOpenShareDhikr={(d) => setShareItem(d)}
              onOpenShareHadith={(h) => setShareItem(h)}
              onClearAll={clearAllFavorites}
              onNavigate={handleNavigate}
              settings={settings}
            />
          )}

          {currentPage === 'sources' && (
            <SourcesView />
          )}
        </main>
      </div>

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Mobile Bottom Navigation */}
      <MobileNav
        currentPage={currentPage}
        onNavigate={handleNavigate}
        favoritesCount={totalFavoritesCount}
      />

      {/* Global Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        adhkar={adhkarData}
        hadiths={hadithsData}
        onSelectDhikr={(dhikr) => {
          setSelectedAdhkarCategory(dhikr.category);
          savePosition(dhikr.category, dhikr.id);
          handleNavigate('adhkar');
        }}
        onSelectHadith={(hadith) => {
          setSelectedHadithTopic(hadith.topic);
          handleNavigate('hadith');
        }}
        onNavigate={handleNavigate}
      />

      {/* Distraction-Free Reading Mode Modal */}
      <ReadingModeModal
        isOpen={isReadingModeOpen}
        onClose={() => setIsReadingModeOpen(false)}
        items={currentReadingItems}
        counts={counts}
        onIncrement={incrementCount}
        onReset={resetCount}
        settings={settings}
      />

      {/* Beautiful Share Card Modal */}
      <ShareCardModal
        isOpen={!!shareItem}
        onClose={() => setShareItem(null)}
        item={shareItem}
      />

      {/* PWA iOS / Safari Install Instructions Modal */}
      <PWAInstallModal
        isOpen={showIOSModal}
        onClose={() => setShowIOSModal(false)}
      />

      {/* Standalone Electronic Tasbeeh Modal */}
      <TasbeehModal
        isOpen={isTasbeehOpen}
        onClose={() => setIsTasbeehOpen(false)}
        soundEnabled={settings.soundEnabled}
        vibrationEnabled={settings.vibrationEnabled}
      />

      {/* Spiritual Welcome Modal */}
      <WelcomeModal
        isOpen={isWelcomeOpen}
        onClose={handleCloseWelcome}
      />

      {/* Reading, Typography & Full Setup Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={{ ...settings, theme }}
        isInstallable={isInstallable}
        onInstall={triggerInstall}
        updateSetting={updateSetting}
        increaseFontSize={increaseFontSize}
        decreaseFontSize={decreaseFontSize}
        resetSettings={resetSettings}
        onRestartSetup={handleRestartOnboarding}
        onResetPreferences={handleResetSettings}
        onFullAppReset={handleFullReset}
      />

      {/* Quick Setup / Onboarding Modal */}
      <QuickSetupModal
        isOpen={isOnboardingOpen}
        onClose={closeSetup}
        onComplete={handleCompleteOnboarding}
        onSkip={handleSkipOnboarding}
        userPreferences={userPreferences}
        onUpdatePreferences={updatePreferences}
        onToggleHomeCard={toggleHomeCard}
        onMoveHomeCard={moveHomeCard}
        onRequestNotificationPermission={requestNotificationPermission}
      />

      {/* Log Good Deed Modal */}
      <LogGoodDeedModal
        isOpen={isCharityLoggingOpen}
        onClose={closeCharityLogging}
        onLogDeed={logCharityDeed}
      />

      {/* Offline Status & Sync Banner */}
      <OfflineBanner />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
