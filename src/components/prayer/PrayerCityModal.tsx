import React, { useState, useMemo, useEffect } from 'react';
import { X, Search, MapPin, Check, Navigation, Loader2 } from 'lucide-react';
import { UserPrayerLocation } from '../../types/prayer';
import { PRESET_PRAYER_CITIES, searchTheShiaCities } from '../../services/theShiaPrayerService';

interface PrayerCityModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation: UserPrayerLocation;
  onSelectCity: (location: UserPrayerLocation) => void;
  onRequestGeolocation: () => Promise<void>;
  geoLoading: boolean;
}

export const PrayerCityModal: React.FC<PrayerCityModalProps> = ({
  isOpen,
  onClose,
  currentLocation,
  onSelectCity,
  onRequestGeolocation,
  geoLoading,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserPrayerLocation[]>([]);
  const [searching, setSearching] = useState(false);

  // Local filtered presets
  const filteredPresets = useMemo(() => {
    if (!searchQuery.trim()) return PRESET_PRAYER_CITIES;
    const q = searchQuery.trim().toLowerCase();
    return PRESET_PRAYER_CITIES.filter(
      (c) =>
        c.cityNameAr.toLowerCase().includes(q) ||
        c.cityName.toLowerCase().includes(q) ||
        c.countryNameAr?.toLowerCase().includes(q) ||
        c.countryName?.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Debounced API search when query is not matched locally
  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 2) {
      setSearchResults([]);
      setSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const matches = await searchTheShiaCities(q);
        const mapped: UserPrayerLocation[] = matches.map((m) => ({
          lat: m.lat,
          lng: m.lng,
          cityName: m.names.en || m.id,
          cityNameAr: m.names.ar || m.names.en || m.id,
          countryName: m.country,
          countryNameAr: m.country,
          tz: m.tz,
          isGeolocation: false,
        }));
        setSearchResults(mapped);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  if (!isOpen) return null;

  const displayedList = searchResults.length > 0 ? searchResults : filteredPresets;

  const handleUseMyLocation = async () => {
    await onRequestGeolocation();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs text-right font-arabic-text animate-fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-night-850 rounded-3xl border border-sand-300 dark:border-night-border shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 border-b border-sand-200 dark:border-night-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-islamic-100 dark:bg-night-800 text-islamic-800 dark:text-gold-400 border border-islamic-200/50 dark:border-night-border">
              <MapPin className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-base font-bold text-islamic-950 dark:text-night-text font-arabic-heading">
                تحديد موقع مواقيت الصلاة
              </h3>
              <p className="text-xs text-stone-500 dark:text-night-muted mt-0.5">
                اختر مدينتك أو استخدم الموقع التلقائي
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-night-text hover:bg-sand-100 dark:hover:bg-night-800 transition-colors"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Geolocation Action */}
        <div className="p-4 border-b border-sand-100 dark:border-night-border space-y-3">
          {/* Geolocation Button */}
          <button
            onClick={handleUseMyLocation}
            disabled={geoLoading}
            className="w-full py-2.5 px-4 bg-islamic-800 hover:bg-islamic-900 dark:bg-gold-500 dark:hover:bg-gold-600 text-sand-50 dark:text-islamic-950 rounded-2xl text-xs font-bold font-arabic-text flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer disabled:opacity-60"
          >
            {geoLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Navigation className="w-4 h-4" />
            )}
            <span>استخدام موقعي الحالي عبر GPS</span>
          </button>

          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن اسم المدينة (مثال: القاهرة، النجف، كربلاء، الرياض)..."
              className="w-full pr-9 pl-8 py-2 text-xs rounded-xl bg-sand-50 dark:bg-night-900 border border-sand-200 dark:border-night-border text-stone-900 dark:text-night-text placeholder:text-stone-400 dark:placeholder:text-night-muted focus:outline-none focus:ring-2 focus:ring-islamic-700/20 text-right"
              autoFocus
            />
            <Search className="w-4 h-4 text-stone-400 dark:text-night-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            {searching && (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-gold-500 absolute left-3 top-1/2 -translate-y-1/2" />
            )}
          </div>
        </div>

        {/* Cities List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-1.5 custom-scrollbar">
          {displayedList.length === 0 ? (
            <div className="text-center py-8 text-stone-400 dark:text-night-muted text-xs">
              لم يتم العثور على مدينة مطابقة. يمكنك البحث باسم المدينة بالإنجليزي أو العربي.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {displayedList.map((loc, idx) => {
                const isSelected =
                  !currentLocation.isGeolocation &&
                  Math.abs(currentLocation.lat - loc.lat) < 0.05 &&
                  Math.abs(currentLocation.lng - loc.lng) < 0.05;

                return (
                  <button
                    key={`${loc.cityName}-${loc.lat}-${idx}`}
                    onClick={() => {
                      onSelectCity(loc);
                      onClose();
                    }}
                    className={`flex items-center justify-between p-3 rounded-2xl border text-right transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-islamic-800 dark:bg-gold-400 text-sand-50 dark:text-islamic-950 border-islamic-800 dark:border-gold-400 shadow-sm font-semibold'
                        : 'bg-sand-50/70 dark:bg-night-900/60 hover:bg-white dark:hover:bg-night-800 text-stone-800 dark:text-night-text border-sand-200 dark:border-night-border'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold">{loc.cityNameAr}</div>
                      <div
                        className={`text-[11px] ${
                          isSelected ? 'text-sand-200 dark:text-islamic-900' : 'text-stone-400 dark:text-night-muted'
                        }`}
                      >
                        {loc.countryNameAr || loc.countryName}
                      </div>
                    </div>

                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-white/20 dark:bg-black/15 flex items-center justify-center">
                        <Check className="w-3 h-3 text-white dark:text-islamic-950" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
