import React, { useState, useMemo } from 'react';
import { X, Search, MapPin, Check, Globe } from 'lucide-react';
import { PrayerLocation, PRESET_LOCATIONS } from '../../services/prayerTimesService';

interface PrayerLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation: PrayerLocation;
  onSelectLocation: (location: PrayerLocation) => void;
}

export const PrayerLocationModal: React.FC<PrayerLocationModalProps> = ({
  isOpen,
  onClose,
  currentLocation,
  onSelectLocation,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const [customCity, setCustomCity] = useState('');
  const [customCountry, setCustomCountry] = useState('');

  const filteredLocations = useMemo(() => {
    if (!searchQuery.trim()) return PRESET_LOCATIONS;
    const q = searchQuery.trim().toLowerCase();
    return PRESET_LOCATIONS.filter(
      (loc) =>
        loc.cityNameArabic.toLowerCase().includes(q) ||
        loc.city.toLowerCase().includes(q) ||
        loc.countryNameArabic.toLowerCase().includes(q) ||
        loc.country.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  if (!isOpen) return null;

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customCity.trim() || !customCountry.trim()) return;

    onSelectLocation({
      city: customCity.trim(),
      cityNameArabic: customCity.trim(),
      country: customCountry.trim(),
      countryNameArabic: customCountry.trim(),
    });
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
                اختر مدينتك لعرض مواقيت دقيقة
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

        {/* Search & Custom Toggle */}
        <div className="p-4 border-b border-sand-100 dark:border-night-border space-y-3">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن مدينة أو دولة (مثل: الإسكندرية، الرياض، دبي)..."
              className="w-full pr-9 pl-3 py-2 text-xs rounded-xl bg-sand-50 dark:bg-night-900 border border-sand-200 dark:border-night-border text-stone-900 dark:text-night-text placeholder:text-stone-400 dark:placeholder:text-night-muted focus:outline-none focus:ring-2 focus:ring-islamic-700/20 text-right"
              autoFocus
            />
            <Search className="w-4 h-4 text-stone-400 dark:text-night-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => setShowCustom(!showCustom)}
              className="text-islamic-700 dark:text-gold-400 hover:underline font-medium inline-flex items-center gap-1 cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{showCustom ? 'إخفاء الإدخال المخصص' : 'إدخال مدينة أخرى يدوياً؟'}</span>
            </button>
            <span className="text-[11px] text-stone-400 dark:text-night-muted">
              {filteredLocations.length} مدينة متاحة
            </span>
          </div>

          {/* Custom Input Form */}
          {showCustom && (
            <form onSubmit={handleCustomSubmit} className="pt-2 space-y-2.5 border-t border-sand-200 dark:border-night-border animate-fade-in">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-stone-500 dark:text-night-muted mb-1">
                    اسم المدينة (بالإنجليزي أو العربي)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aswan or أسوان"
                    value={customCity}
                    onChange={(e) => setCustomCity(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg bg-sand-50 dark:bg-night-900 border border-sand-200 dark:border-night-border text-stone-900 dark:text-night-text focus:outline-none focus:ring-2 focus:ring-islamic-700/20 text-right"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-stone-500 dark:text-night-muted mb-1">
                    اسم الدولة
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Egypt or مصر"
                    value={customCountry}
                    onChange={(e) => setCustomCountry(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg bg-sand-50 dark:bg-night-900 border border-sand-200 dark:border-night-border text-stone-900 dark:text-night-text focus:outline-none focus:ring-2 focus:ring-islamic-700/20 text-right"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-islamic-800 dark:bg-gold-500 hover:bg-islamic-900 text-sand-50 dark:text-islamic-950 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                تطبيق الموقع المخصص
              </button>
            </form>
          )}
        </div>

        {/* Preset Cities List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-1.5 custom-scrollbar">
          {filteredLocations.length === 0 ? (
            <div className="text-center py-8 text-stone-400 dark:text-night-muted text-xs">
              لم يتم العثور على مدينة مطابقة. يمكنك كتابة مدينتك يدوياً عبر الخيار أعلاه.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {filteredLocations.map((loc) => {
                const isSelected =
                  currentLocation.city.toLowerCase() === loc.city.toLowerCase() &&
                  currentLocation.country.toLowerCase() === loc.country.toLowerCase();

                return (
                  <button
                    key={`${loc.city}-${loc.country}`}
                    onClick={() => {
                      onSelectLocation(loc);
                      onClose();
                    }}
                    className={`flex items-center justify-between p-3 rounded-2xl border text-right transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-islamic-800 dark:bg-gold-400 text-sand-50 dark:text-islamic-950 border-islamic-800 dark:border-gold-400 shadow-sm font-semibold'
                        : 'bg-sand-50/70 dark:bg-night-900/60 hover:bg-white dark:hover:bg-night-800 text-stone-800 dark:text-night-text border-sand-200 dark:border-night-border'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold">{loc.cityNameArabic}</div>
                      <div
                        className={`text-[11px] ${
                          isSelected ? 'text-sand-200 dark:text-islamic-900' : 'text-stone-400 dark:text-night-muted'
                        }`}
                      >
                        {loc.countryNameArabic}
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
