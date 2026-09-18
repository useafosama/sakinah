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
import { QuranPlayer } from './components/home/QuranPlayer';
import { HadithSpotlight } from './components/home/HadithSpotlight';
import { SuggestedVideos } from './components/home/SuggestedVideos';
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
import { ToastProvider } from './components/common/Toast';

import { PageType, AdhkarCategory, HadithTopic, Dhikr, Hadith, DailyMessage } from './types';
import { useFavorites } from './hooks/useFavorites';
import { useDhikrProgress } from './hooks/useDhikrProgress';
import { useReadingSettings } from './hooks/useReadingSettings';
import { useTheme } from './hooks/useTheme';
import { useLastPosition } from './hooks/useLastPosition';
import { usePWAInstall } from './hooks/usePWAInstall';

import adhkarDataRaw from './data/adhkar.json';
import hadithsDataRaw from './data/hadiths.json';
import versesDataRaw from './data/verses.json';
import dailyMessagesDataRaw from './data/dailyMessages.json';

const adhkarData = adhkarDataRaw as Dhikr[];
const hadithsData = hadithsDataRaw as Hadith[];
const versesData = versesDataRaw;
const dailyMessagesData = dailyMessagesDataRaw as DailyMessage[];

export function AppContent() {
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [selectedAdhkarCategory, setSelectedAdhkarCategory] = useState<AdhkarCategory>('morning');
  const [selectedHadithTopic, setSelectedHadithTopic] = useState<HadithTopic>('all');

  // Modals
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isTasbeehOpen, setIsTasbeehOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isReadingModeOpen, setIsReadingModeOpen] = useState(false);
  const [shareItem, setShareItem] = useState<Dhikr | Hadith | null>(null);
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(() => {
    try {
      return !sessionStorage.getItem('sakinah_welcome_seen_v1');
    } catch {
      return true;
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
              {/* Featured Brand Hero Banner */}
              <HomeBanner onNavigate={handleNavigate} />

              {/* Daily Spiritual Message / Reminder */}
              <DailyMessageCard messages={dailyMessagesData} />

              {/* Prayer Times & Live Next Prayer Countdown */}
              <PrayerTimes />

              {/* Daily Wird Section with Progress & Continue */}
              <DailyWird
                allAdhkar={adhkarData}
                counts={counts}
                lastPosition={lastPosition}
                onNavigate={handleNavigate}
                onSelectCategory={(cat) => setSelectedAdhkarCategory(cat)}
              />

              {/* Quran Verse of Serenity */}
              <HeroVerse verses={versesData} />

              {/* Daily Dhikr Spotlight with Interactive Counter */}
              <DailyDhikr
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

              {/* Exploration Category Grid */}
              <CategoryGrid
                onNavigate={handleNavigate}
                onSelectCategory={(cat) => setSelectedAdhkarCategory(cat)}
                onOpenTasbeeh={() => setIsTasbeehOpen(true)}
              />

              {/* Full Quran Listening Section */}
              <QuranPlayer />

              {/* PWA Install Banner */}
              <PWAInstallBanner
                isInstallable={isInstallable}
                onInstall={triggerInstall}
              />

              {/* Daily Hadith Spotlight */}
              <HadithSpotlight
                hadith={dailyHadith}
                isFavorite={isHadithFavorite(dailyHadith.id)}
                onToggleFavorite={() => toggleHadithFavorite(dailyHadith.id)}
                onOpenShare={(h) => setShareItem(h)}
                onNavigate={handleNavigate}
              />

              {/* Curated Islamic Videos Section */}
              <SuggestedVideos />
            </div>
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

      {/* Reading & Typography Settings Modal */}
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
      />
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
