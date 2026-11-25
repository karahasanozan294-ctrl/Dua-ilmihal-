import {
  Bell,
  BookOpen,
  CalendarDays,
  Clock,
  Compass,
  MapPin,
} from 'lucide-react';
import { LocationInfo } from '../types/prayer';

export type AppSection =
  | 'vakitler'
  | 'kible'
  | 'kuran'
  | 'takvim'
  | 'bildirimler';

interface HeaderProps {
  activeSection: AppSection;
  onSelectSection: (section: AppSection) => void;
  location: LocationInfo;
  onOpenLocationModal: () => void;
}

const NAV_ITEMS: { id: AppSection; label: string; mobileLabel: string }[] = [
  { id: 'vakitler', label: 'Vakitler', mobileLabel: 'Vakitler' },
  { id: 'kible', label: 'Kıble', mobileLabel: 'Kıble' },
  { id: 'kuran', label: 'Kur’an & Kitaplık', mobileLabel: 'Kitaplık' },
  { id: 'takvim', label: 'Dini Günler', mobileLabel: 'Takvim' },
  { id: 'bildirimler', label: 'Bildirimler', mobileLabel: 'Bildirim' },
];

export function Header({
  activeSection,
  onSelectSection,
  location,
  onOpenLocationModal,
}: HeaderProps) {
  return (
    <>
      <header className="md:sticky md:top-0 z-30 border-b border-[#E5E0D5] bg-[#F7F5F0]/90 pt-[env(safe-area-inset-top)] backdrop-blur-md dark:border-[#1E2936] dark:bg-[#0B1117]/90">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
          {/* Zone 1: Single-line Brand Wordmark */}
          <button
            type="button"
            onClick={() => onSelectSection('vakitler')}
            className="font-display text-2xl font-semibold tracking-tight text-[#171A19] dark:text-[#EDF2F0] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0F6E56]"
          >
            Mihrab
          </button>

          {/* Zone 2: 5 single-line text nav links */}
          <nav
            aria-label="Ana gezinme"
            className="hidden md:flex items-center gap-6 lg:gap-7 text-sm font-medium"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectSection(item.id)}
                  className={`relative py-2 whitespace-nowrap shrink-0 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0F6E56] ${
                    isActive
                      ? 'text-[#0F6E56] dark:text-[#34D399]'
                      : 'text-[#575C59] hover:text-[#171A19] dark:text-[#9CA7B0] dark:hover:text-[#EDF2F0]'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-0 -bottom-[17px] h-0.5 bg-[#0F6E56] dark:bg-[#34D399]"
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="shrink-0">
            <button
              type="button"
              onClick={onOpenLocationModal}
              className="inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-[#0F6E56] px-3.5 py-2 text-xs sm:text-sm font-medium text-white transition-colors duration-150 hover:bg-[#0B5744] dark:bg-[#10B981] dark:text-[#07130E] dark:hover:bg-[#34D399] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F6E56]"
            >
              <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="max-w-[140px] sm:max-w-[180px] truncate">
                {location.name}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Tab Bar (Thumb Zone) */}
      <nav
        aria-label="Mobil alt menü"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-[#E5E0D5] bg-[#FFFFFF]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md dark:border-[#1E2936] dark:bg-[#101820]/95"
      >
        <div className="grid h-16 grid-cols-5 items-center">
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            const Icon =
              item.id === 'vakitler'
                ? Clock
                : item.id === 'kible'
                ? Compass
                : item.id === 'kuran'
                ? BookOpen
                : item.id === 'takvim'
                ? CalendarDays
                : Bell;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectSection(item.id)}
                className={`flex min-h-[44px] flex-col items-center justify-center gap-1 transition-colors duration-150 ${
                  isActive
                    ? 'text-[#0F6E56] dark:text-[#34D399]'
                    : 'text-[#666C68] dark:text-[#8E9BA4]'
                }`}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                <span className="text-[11px] font-medium tracking-tight whitespace-nowrap">
                  {item.mobileLabel}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
