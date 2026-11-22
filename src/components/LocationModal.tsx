import { useEffect, useRef, useState } from 'react';
import {
  Compass,
  Loader2,
  MapPin,
  Navigation,
  Search,
  X,
} from 'lucide-react';
import {
  ALL_PRESET_CITIES,
  reverseGeocodeLocation,
  searchGlobalCities,
  searchPresetCities,
} from '../data/cities';
import { LocationInfo } from '../types/prayer';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation: LocationInfo;
  recentLocations: LocationInfo[];
  onSelectLocation: (location: LocationInfo) => void;
}

const POPULAR_IDS = [
  'tr-istanbul',
  'tr-ankara',
  'tr-izmir',
  'tr-bursa',
  'tr-antalya',
  'tr-konya',
  'sa-makkah',
  'de-berlin',
];

const COMMON_TIMEZONES = [
  'Europe/Istanbul',
  'Europe/Berlin',
  'Europe/London',
  'Europe/Paris',
  'Europe/Amsterdam',
  'Asia/Riyadh',
  'Asia/Baku',
  'Asia/Dubai',
  'America/New_York',
  'America/Chicago',
  'Asia/Tokyo',
  'UTC',
];

export function LocationModal({
  isOpen,
  onClose,
  currentLocation,
  recentLocations,
  onSelectLocation,
}: LocationModalProps) {
  const [tab, setTab] = useState<'search' | 'manual'>('search');
  const [query, setQuery] = useState('');
  const [globalResults, setGlobalResults] = useState<LocationInfo[]>([]);
  const [isSearchingGlobal, setIsSearchingGlobal] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [isLocatingGps, setIsLocatingGps] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Manual coordinates state
  const [manualName, setManualName] = useState('');
  const [manualLat, setManualLat] = useState(
    String(currentLocation.latitude)
  );
  const [manualLon, setManualLon] = useState(
    String(currentLocation.longitude)
  );
  const [manualTz, setManualTz] = useState(currentLocation.timezone);
  const [manualError, setManualError] = useState<string | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    setGpsError(null);
    setManualLat(String(currentLocation.latitude));
    setManualLon(String(currentLocation.longitude));
    setManualTz(currentLocation.timezone);
    const timer = setTimeout(() => {
      searchInputRef.current?.focus();
    }, 60);
    return () => clearTimeout(timer);
  }, [isOpen, currentLocation]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setGlobalResults([]);
      setSearchError(null);
      setIsSearchingGlobal(false);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setIsSearchingGlobal(true);
      setSearchError(null);
      try {
        const results = await searchGlobalCities(trimmed, controller.signal);
        setGlobalResults(results);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setSearchError(
            'Çevrimiçi küresel arama şu an kullanılamıyor; yerel şehir listesi gösteriliyor.'
          );
        }
      } finally {
        setIsSearchingGlobal(false);
      }
    }, 320);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  if (!isOpen) return null;

  const presetMatches = searchPresetCities(query);

  // Merge preset matches and global geocoding results without duplicates
  const mergedResults: LocationInfo[] = [...presetMatches];
  for (const item of globalResults) {
    const exists = mergedResults.some(
      (existing) =>
        Math.abs(existing.latitude - item.latitude) < 0.08 &&
        Math.abs(existing.longitude - item.longitude) < 0.08
    );
    if (!exists) {
      mergedResults.push(item);
    }
  }

  const popularCities = POPULAR_IDS.map((id) =>
    ALL_PRESET_CITIES.find((c) => c.id === id)
  ).filter((c): c is LocationInfo => Boolean(c));

  const handleUseGps = () => {
    if (!('geolocation' in navigator)) {
      setGpsError('Tarayıcınız konum servislerini desteklemiyor.');
      return;
    }

    setIsLocatingGps(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const resolved = await reverseGeocodeLocation(
            pos.coords.latitude,
            pos.coords.longitude
          );
          onSelectLocation(resolved);
          onClose();
        } catch {
          setGpsError('Konum bilgisi çözümlenemedi. Lütfen tekrar deneyin.');
        } finally {
          setIsLocatingGps(false);
        }
      },
      (err) => {
        setIsLocatingGps(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGpsError(
            'Konum izni reddedildi. Tarayıcı ayarlarından konum izni verebilir veya aşağıdan şehir seçebilirsiniz.'
          );
        } else if (err.code === err.TIMEOUT) {
          setGpsError(
            'Konum tespiti zaman aşımına uğradı. Lütfen şehir arayarak seçin.'
          );
        } else {
          setGpsError(
            'GPS konumu alınamadı. Şehir arayarak veya koordinat girerek devam edebilirsiniz.'
          );
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = Number(manualLat.replace(',', '.'));
    const lon = Number(manualLon.replace(',', '.'));

    if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
      setManualError('Enlem değeri -90 ile 90 arasında geçerli bir sayı olmalıdır.');
      return;
    }
    if (!Number.isFinite(lon) || lon < -180 || lon > 180) {
      setManualError('Boylam değeri -180 ile 180 arasında geçerli bir sayı olmalıdır.');
      return;
    }

    setManualError(null);
    onSelectLocation({
      id: `manual-${lat.toFixed(4)}-${lon.toFixed(4)}`,
      name: manualName.trim() || `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`,
      country: 'Özel Koordinat',
      latitude: Number(lat.toFixed(4)),
      longitude: Number(lon.toFixed(4)),
      timezone: manualTz,
      source: 'manual',
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="location-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-xl max-h-[88vh] flex flex-col rounded-t-2xl sm:rounded-2xl border border-[#E5E0D5] bg-[#FFFFFF] text-[#171A19] shadow-xl dark:border-[#233040] dark:bg-[#121A24] dark:text-[#EDF2F0]">
        {/* Drag affordance on mobile */}
        <div className="sm:hidden mx-auto mt-3 h-1.5 w-10 rounded-full bg-[#D7D2C7] dark:bg-[#2C3A4A]" />

        <div className="flex items-center justify-between border-b border-[#E5E0D5] px-5 py-4 dark:border-[#1E2936]">
          <div>
            <h2
              id="location-modal-title"
              className="font-display text-lg font-semibold"
            >
              Konum Seçimi
            </h2>
            <p className="text-xs text-[#666C68] dark:text-[#8E9BA4] mt-0.5">
              Dünyanın her noktası için ezan saatleri ve kıble açısı hesaplanır
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Kapat"
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-[#575C59] hover:bg-[#F1EEE7] dark:text-[#9CA7B0] dark:hover:bg-[#1A2532]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-5 space-y-5">
          {/* GPS Button */}
          <div>
            <button
              type="button"
              onClick={handleUseGps}
              disabled={isLocatingGps}
              className="flex w-full min-h-[48px] items-center justify-center gap-2.5 rounded-xl bg-[#0F6E56] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#0B5744] disabled:opacity-60 dark:bg-[#10B981] dark:text-[#07130E] dark:hover:bg-[#34D399]"
            >
              {isLocatingGps ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Navigation className="h-4 w-4" aria-hidden="true" />
              )}
              <span>
                {isLocatingGps
                  ? 'Konumunuz belirleniyor...'
                  : 'GPS ile Mevcut Konumumu Kullan'}
              </span>
            </button>
            {gpsError && (
              <p className="mt-2 text-xs text-[#B91C1C] dark:text-[#FCA5A5]">
                {gpsError}
              </p>
            )}
          </div>

          {/* Mode Tabs */}
          <div className="grid grid-cols-2 gap-1 rounded-lg bg-[#F1EEE7] p-1 dark:bg-[#18222E]">
            <button
              type="button"
              onClick={() => setTab('search')}
              className={`min-h-[40px] rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                tab === 'search'
                  ? 'bg-white text-[#171A19] shadow-xs dark:bg-[#233142] dark:text-[#EDF2F0]'
                  : 'text-[#575C59] hover:text-[#171A19] dark:text-[#9CA7B0] dark:hover:text-[#EDF2F0]'
              }`}
            >
              Şehir veya İlçe Ara
            </button>
            <button
              type="button"
              onClick={() => setTab('manual')}
              className={`min-h-[40px] rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                tab === 'manual'
                  ? 'bg-white text-[#171A19] shadow-xs dark:bg-[#233142] dark:text-[#EDF2F0]'
                  : 'text-[#575C59] hover:text-[#171A19] dark:text-[#9CA7B0] dark:hover:text-[#EDF2F0]'
              }`}
            >
              Enlem / Boylam Gir
            </button>
          </div>

          {tab === 'search' ? (
            <div className="space-y-4">
              {/* Search Box */}
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#666C68] dark:text-[#8E9BA4]"
                  aria-hidden="true"
                />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="İl, ilçe veya dünya şehri yazın (örn. Konya, Londra, Tokyo)..."
                  className="w-full min-h-[46px] rounded-xl border border-[#DDD7C9] bg-[#FAF9F6] pl-10 pr-10 text-sm text-[#171A19] placeholder:text-[#7D827E] focus:border-[#0F6E56] focus:outline-none dark:border-[#263445] dark:bg-[#0D141C] dark:text-[#EDF2F0] dark:placeholder:text-[#6E7B85] dark:focus:border-[#34D399]"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    aria-label="Aramayı temizle"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-[#666C68] hover:text-[#171A19] dark:text-[#8E9BA4]"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {searchError && (
                <p className="text-xs text-[#9A6700] dark:text-[#FCD34D]">
                  {searchError}
                </p>
              )}

              {/* Search Results or Recent + Popular */}
              {query.trim().length > 0 ? (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-[#666C68] dark:text-[#8E9BA4]">
                    <span>Arama Sonuçları</span>
                    {isSearchingGlobal && (
                      <span className="inline-flex items-center gap-1.5">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Küresel konumlar taranıyor
                      </span>
                    )}
                  </div>
                  {mergedResults.length === 0 && !isSearchingGlobal ? (
                    <div className="rounded-xl border border-[#E5E0D5] p-6 text-center text-sm text-[#666C68] dark:border-[#1E2936] dark:text-[#8E9BA4]">
                      “{query}” için eşleşen konum bulunamadı. Farklı bir şehir adı deneyin veya “Enlem / Boylam Gir” sekmesini kullanın.
                    </div>
                  ) : (
                    <div className="divide-y divide-[#EEEAE0] rounded-xl border border-[#E5E0D5] dark:divide-[#1E2936] dark:border-[#1E2936]">
                      {mergedResults.map((city) => {
                        const isSelected =
                          Math.abs(city.latitude - currentLocation.latitude) < 0.01 &&
                          Math.abs(city.longitude - currentLocation.longitude) < 0.01;
                        return (
                          <button
                            key={city.id}
                            type="button"
                            onClick={() => {
                              onSelectLocation(city);
                              onClose();
                            }}
                            className={`flex w-full min-h-[54px] items-center justify-between gap-3 px-4 py-2.5 text-left transition-colors hover:bg-[#F7F5F0] dark:hover:bg-[#17222E] ${
                              isSelected
                                ? 'bg-[#0F6E56]/5 dark:bg-[#10B981]/10'
                                : ''
                            }`}
                          >
                            <div className="min-w-0">
                              <div className="text-sm font-medium truncate">
                                {city.name}
                              </div>
                              <div className="text-xs text-[#666C68] dark:text-[#8E9BA4] truncate">
                                {[city.region, city.country]
                                  .filter(Boolean)
                                  .join(' · ')}
                              </div>
                            </div>
                            <span className="font-mono-tabular text-xs text-[#666C68] dark:text-[#8E9BA4] shrink-0">
                              {city.latitude.toFixed(2)}°, {city.longitude.toFixed(2)}°
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-5">
                  {recentLocations.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-xs font-medium text-[#666C68] dark:text-[#8E9BA4]">
                        Son Kullanılan Konumlar
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        {recentLocations.slice(0, 4).map((city) => (
                          <button
                            key={city.id}
                            type="button"
                            onClick={() => {
                              onSelectLocation(city);
                              onClose();
                            }}
                            className="flex min-h-[48px] items-center gap-2.5 rounded-xl border border-[#E5E0D5] px-3 py-2 text-left transition-colors hover:border-[#0F6E56] hover:bg-[#F7F5F0] dark:border-[#1E2936] dark:hover:border-[#34D399] dark:hover:bg-[#17222E]"
                          >
                            <MapPin className="h-4 w-4 shrink-0 text-[#0F6E56] dark:text-[#34D399]" />
                            <div className="min-w-0">
                              <div className="text-sm font-medium truncate">
                                {city.name}
                              </div>
                              <div className="text-[11px] text-[#666C68] dark:text-[#8E9BA4] truncate">
                                {city.country}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <h3 className="text-xs font-medium text-[#666C68] dark:text-[#8E9BA4]">
                      Sık Seçilen Şehirler (81 İl & Dünya)
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {popularCities.map((city) => {
                        const isActive = city.id === currentLocation.id;
                        return (
                          <button
                            key={city.id}
                            type="button"
                            onClick={() => {
                              onSelectLocation(city);
                              onClose();
                            }}
                            className={`min-h-[44px] rounded-xl border px-3 py-2 text-left text-sm transition-colors ${
                              isActive
                                ? 'border-[#0F6E56] bg-[#0F6E56]/8 font-medium text-[#0F6E56] dark:border-[#34D399] dark:bg-[#10B981]/12 dark:text-[#34D399]'
                                : 'border-[#E5E0D5] hover:border-[#C5BFB0] hover:bg-[#F7F5F0] dark:border-[#1E2936] dark:hover:border-[#2E3E52] dark:hover:bg-[#17222E]'
                            }`}
                          >
                            <div className="truncate">{city.name}</div>
                            <div className="text-[11px] text-[#666C68] dark:text-[#8E9BA4] truncate">
                              {city.country}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="manual-name"
                  className="block text-xs font-medium text-[#575C59] dark:text-[#9CA7B0] mb-1.5"
                >
                  Konum Adı (İsteğe Bağlı)
                </label>
                <input
                  id="manual-name"
                  type="text"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  placeholder="Örn. Yayla, Köy veya Şehir Adı"
                  className="w-full min-h-[44px] rounded-xl border border-[#DDD7C9] bg-[#FAF9F6] px-3.5 text-sm focus:border-[#0F6E56] focus:outline-none dark:border-[#263445] dark:bg-[#0D141C] dark:focus:border-[#34D399]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="manual-lat"
                    className="block text-xs font-medium text-[#575C59] dark:text-[#9CA7B0] mb-1.5"
                  >
                    Enlem (Latitude)
                  </label>
                  <input
                    id="manual-lat"
                    type="text"
                    inputMode="decimal"
                    value={manualLat}
                    onChange={(e) => setManualLat(e.target.value)}
                    placeholder="41.0082"
                    className="w-full min-h-[44px] rounded-xl border border-[#DDD7C9] bg-[#FAF9F6] px-3.5 font-mono-tabular text-sm focus:border-[#0F6E56] focus:outline-none dark:border-[#263445] dark:bg-[#0D141C] dark:focus:border-[#34D399]"
                  />
                </div>
                <div>
                  <label
                    htmlFor="manual-lon"
                    className="block text-xs font-medium text-[#575C59] dark:text-[#9CA7B0] mb-1.5"
                  >
                    Boylam (Longitude)
                  </label>
                  <input
                    id="manual-lon"
                    type="text"
                    inputMode="decimal"
                    value={manualLon}
                    onChange={(e) => setManualLon(e.target.value)}
                    placeholder="28.9784"
                    className="w-full min-h-[44px] rounded-xl border border-[#DDD7C9] bg-[#FAF9F6] px-3.5 font-mono-tabular text-sm focus:border-[#0F6E56] focus:outline-none dark:border-[#263445] dark:bg-[#0D141C] dark:focus:border-[#34D399]"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="manual-tz"
                  className="block text-xs font-medium text-[#575C59] dark:text-[#9CA7B0] mb-1.5"
                >
                  Saat Dilimi
                </label>
                <select
                  id="manual-tz"
                  value={manualTz}
                  onChange={(e) => setManualTz(e.target.value)}
                  className="w-full min-h-[44px] rounded-xl border border-[#DDD7C9] bg-[#FAF9F6] px-3.5 text-sm focus:border-[#0F6E56] focus:outline-none dark:border-[#263445] dark:bg-[#0D141C] dark:focus:border-[#34D399]"
                >
                  {!COMMON_TIMEZONES.includes(manualTz) && (
                    <option value={manualTz}>{manualTz}</option>
                  )}
                  {COMMON_TIMEZONES.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </select>
              </div>

              {manualError && (
                <p className="text-xs text-[#B91C1C] dark:text-[#FCA5A5]">
                  {manualError}
                </p>
              )}

              <button
                type="submit"
                className="flex w-full min-h-[46px] items-center justify-center gap-2 rounded-xl bg-[#0F6E56] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#0B5744] dark:bg-[#10B981] dark:text-[#07130E] dark:hover:bg-[#34D399]"
              >
                <Compass className="h-4 w-4" />
                <span>Bu Koordinatlarla Hesapla</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
