import { useState } from 'react';
import {
  ArrowRight,
  Check,
  Minus,
  Plus,
  RotateCcw,
  Trash2,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { ZikirItem, ZikirState } from '../types/zikir';

interface ZikirmatikProps {
  state: ZikirState;
  onIncrement: () => void;
  onDecrement: () => void;
  onResetCurrent: () => void;
  onSelectZikir: (id: string) => void;
  onAddCustomZikir: (title: string, target: number) => void;
  onDeleteCustomZikir: (id: string) => void;
  onToggleSetting: (
    key: 'soundEnabled' | 'vibrationEnabled' | 'tesbihatChainEnabled'
  ) => void;
}

export function Zikirmatik({
  state,
  onIncrement,
  onDecrement,
  onResetCurrent,
  onSelectZikir,
  onAddCustomZikir,
  onDeleteCustomZikir,
  onToggleSetting,
}: ZikirmatikProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTarget, setNewTarget] = useState('33');
  const [formError, setFormError] = useState<string | null>(null);

  const activeItem: ZikirItem =
    state.items.find((i) => i.id === state.activeId) ?? state.items[0];

  const target = Math.max(1, activeItem.target);
  const progressRatio = Math.min(1, activeItem.count / target);
  const radius = 104;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progressRatio);
  const isTargetReached = activeItem.count >= target;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newTitle.trim();
    const parsedTarget = Number(newTarget);
    if (!trimmed) {
      setFormError('Lütfen bir zikir veya tesbih adı yazın.');
      return;
    }
    if (!Number.isFinite(parsedTarget) || parsedTarget < 1 || parsedTarget > 100000) {
      setFormError('Hedef sayısı 1 ile 100.000 arasında olmalıdır.');
      return;
    }
    setFormError(null);
    onAddCustomZikir(trimmed, Math.round(parsedTarget));
    setNewTitle('');
    setNewTarget('33');
    setShowAddForm(false);
  };

  return (
    <section className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left/Main Digital Counter Instrument */}
        <div className="lg:col-span-7 rounded-2xl border border-[#E5E0D5] bg-[#FFFFFF] p-6 sm:p-8 dark:border-[#1E2936] dark:bg-[#121A24]">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#EEEAE0] pb-5 dark:border-[#1E2936]">
            <div>
              <p className="text-xs font-medium text-[#0F6E56] dark:text-[#34D399]">
                Dijital Tesbih & Zikirmatik
              </p>
              <h1 className="mt-1 font-display text-2xl sm:text-3xl font-semibold text-[#171A19] dark:text-[#EDF2F0]">
                {activeItem.title}
              </h1>
              {activeItem.meaning && (
                <p className="mt-1 text-xs text-[#666C68] dark:text-[#8E9BA4]">
                  {activeItem.meaning}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onToggleSetting('soundEnabled')}
                aria-label={
                  state.soundEnabled ? 'Sayım sesini kapat' : 'Sayım sesini aç'
                }
                className={`inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-lg border px-2.5 text-xs font-medium transition-colors ${
                  state.soundEnabled
                    ? 'border-[#0F6E56]/30 bg-[#0F6E56]/8 text-[#0F6E56] dark:border-[#34D399]/30 dark:bg-[#10B981]/12 dark:text-[#34D399]'
                    : 'border-[#DDD7C9] bg-[#FAF9F6] text-[#575C59] dark:border-[#243242] dark:bg-[#0D141C] dark:text-[#9CA7B0]'
                }`}
              >
                {state.soundEnabled ? (
                  <Volume2 className="h-4 w-4" />
                ) : (
                  <VolumeX className="h-4 w-4" />
                )}
              </button>

              <button
                type="button"
                onClick={onResetCurrent}
                aria-label="Mevcut sayacı sıfırla"
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-[#DDD7C9] bg-[#FAF9F6] px-3 py-1.5 text-xs font-medium text-[#575C59] hover:text-[#171A19] dark:border-[#243242] dark:bg-[#0D141C] dark:text-[#9CA7B0] dark:hover:text-[#EDF2F0]"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Sıfırla</span>
              </button>
            </div>
          </div>

          {/* Arabic Calligraphic Display if available */}
          {activeItem.arabic && (
            <div className="mt-5 text-center">
              <p
                dir="rtl"
                lang="ar"
                className="font-serif text-2xl sm:text-3xl text-[#171A19] dark:text-[#EDF2F0]"
              >
                {activeItem.arabic}
              </p>
            </div>
          )}

          {/* Interactive Circular Counter Ring */}
          <div className="mt-6 flex flex-col items-center">
            <button
              type="button"
              onClick={onIncrement}
              aria-label={`${activeItem.title} sayacını artır. Mevcut sayı ${activeItem.count}`}
              className="group relative flex h-64 w-64 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0F6E56] active:scale-[0.985] transition-transform duration-100 select-none"
            >
              <svg
                viewBox="0 0 240 240"
                className="absolute inset-0 h-full w-full -rotate-90"
                aria-hidden="true"
              >
                <circle
                  cx="120"
                  cy="120"
                  r={radius}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-[#EEEAE0] dark:text-[#1D2835]"
                />
                <circle
                  cx="120"
                  cy="120"
                  r={radius}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className={`transition-[stroke-dashoffset] duration-150 ${
                    isTargetReached
                      ? 'text-[#B4832C] dark:text-[#FBBF24]'
                      : 'text-[#0F6E56] dark:text-[#10B981]'
                  }`}
                />
              </svg>

              <div className="relative flex h-48 w-48 flex-col items-center justify-center rounded-full border border-[#E5E0D5] bg-[#FAF9F6] transition-colors group-hover:bg-[#F3EFE6] dark:border-[#243242] dark:bg-[#0D141C] dark:group-hover:bg-[#15202C]">
                <span className="text-xs font-medium text-[#666C68] dark:text-[#8E9BA4]">
                  {isTargetReached ? 'Hedef Tamamlandı' : 'Dokunarak Say'}
                </span>
                <span className="mt-1 font-mono-tabular text-5xl sm:text-6xl font-semibold tracking-tight text-[#171A19] dark:text-[#EDF2F0]">
                  {activeItem.count}
                </span>
                <span className="mt-1.5 font-mono-tabular text-xs text-[#575C59] dark:text-[#9CA7B0]">
                  Hedef {activeItem.target} · Tur {activeItem.rounds}
                </span>
              </div>
            </button>

            {/* Tactile Action Row */}
            <div className="mt-6 flex w-full max-w-sm items-center gap-3">
              <button
                type="button"
                onClick={onDecrement}
                disabled={activeItem.count <= 0}
                aria-label="Sayacı bir azalt"
                className="inline-flex min-h-[48px] min-w-[56px] items-center justify-center rounded-xl border border-[#DDD7C9] bg-[#FAF9F6] text-[#575C59] hover:text-[#171A19] disabled:opacity-40 dark:border-[#243242] dark:bg-[#0D141C] dark:text-[#9CA7B0]"
              >
                <Minus className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={onIncrement}
                className="flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl bg-[#0F6E56] px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-[#0B5744] active:scale-[0.99] dark:bg-[#10B981] dark:text-[#07130E] dark:hover:bg-[#34D399]"
              >
                <Plus className="h-4 w-4" />
                <span>Zikir Çek (+1)</span>
              </button>
            </div>
          </div>

          {/* Daily Summary & Chain Mode Toggle */}
          <div className="mt-7 grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-[#EEEAE0] pt-5 dark:border-[#1E2936]">
            <div className="rounded-xl bg-[#FAF9F6] px-4 py-3 dark:bg-[#0D141C]">
              <div className="text-xs text-[#666C68] dark:text-[#8E9BA4]">
                Bugünkü Toplam
              </div>
              <div className="mt-0.5 font-mono-tabular text-xl font-semibold text-[#0F6E56] dark:text-[#34D399]">
                {state.dailyTotal.toLocaleString('tr-TR')}
              </div>
            </div>

            <div className="rounded-xl bg-[#FAF9F6] px-4 py-3 dark:bg-[#0D141C]">
              <div className="text-xs text-[#666C68] dark:text-[#8E9BA4]">
                Genel Toplam
              </div>
              <div className="mt-0.5 font-mono-tabular text-xl font-semibold">
                {state.allTimeTotal.toLocaleString('tr-TR')}
              </div>
            </div>

            <button
              type="button"
              onClick={() => onToggleSetting('tesbihatChainEnabled')}
              className={`flex flex-col justify-center rounded-xl border px-4 py-3 text-left transition-colors ${
                state.tesbihatChainEnabled
                  ? 'border-[#0F6E56]/40 bg-[#0F6E56]/6 dark:border-[#34D399]/35 dark:bg-[#10B981]/10'
                  : 'border-[#E5E0D5] bg-[#FAF9F6] dark:border-[#1E2936] dark:bg-[#0D141C]'
              }`}
            >
              <div className="flex items-center justify-between gap-2 text-xs font-medium">
                <span>33’lük Tesbihat Akışı</span>
                {state.tesbihatChainEnabled && (
                  <Check className="h-3.5 w-3.5 text-[#0F6E56] dark:text-[#34D399]" />
                )}
              </div>
              <div className="mt-0.5 text-[11px] text-[#666C68] dark:text-[#8E9BA4]">
                {state.tesbihatChainEnabled
                  ? '33’te sonraki tesbihe geçer'
                  : 'Otomatik geçiş kapalı'}
              </div>
            </button>
          </div>
        </div>

        {/* Right Panel: Presets & Custom Zikir List */}
        <div className="lg:col-span-5 rounded-2xl border border-[#E5E0D5] bg-[#FFFFFF] p-6 dark:border-[#1E2936] dark:bg-[#121A24] space-y-4">
          <div className="flex items-center justify-between border-b border-[#EEEAE0] pb-4 dark:border-[#1E2936]">
            <div>
              <h2 className="font-display text-lg font-semibold text-[#171A19] dark:text-[#EDF2F0]">
                Tesbihat ve Zikir Listesi
              </h2>
              <p className="text-xs text-[#666C68] dark:text-[#8E9BA4]">
                Hazır zikirlerden seçin veya özel zikir ekleyin
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddForm((prev) => !prev)}
              className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-[#DDD7C9] bg-[#FAF9F6] px-3 py-1.5 text-xs font-medium text-[#171A19] hover:border-[#0F6E56] dark:border-[#243242] dark:bg-[#0D141C] dark:text-[#EDF2F0] whitespace-nowrap"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Özel Ekle</span>
            </button>
          </div>

          {showAddForm && (
            <form
              onSubmit={handleAddSubmit}
              className="rounded-xl border border-[#E5E0D5] bg-[#FAF9F6] p-4 space-y-3 dark:border-[#1E2936] dark:bg-[#0D141C]"
            >
              <div>
                <label
                  htmlFor="zikir-title-input"
                  className="block text-xs font-medium text-[#575C59] dark:text-[#9CA7B0] mb-1"
                >
                  Zikir / Tesbih Adı
                </label>
                <input
                  id="zikir-title-input"
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Örn. Yâ Fettâh, Salavat-ı Şerife..."
                  className="w-full min-h-[42px] rounded-lg border border-[#DDD7C9] bg-white px-3 text-sm focus:border-[#0F6E56] focus:outline-none dark:border-[#243242] dark:bg-[#121A24]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 items-end">
                <div>
                  <label
                    htmlFor="zikir-target-input"
                    className="block text-xs font-medium text-[#575C59] dark:text-[#9CA7B0] mb-1"
                  >
                    Hedef Adet
                  </label>
                  <input
                    id="zikir-target-input"
                    type="number"
                    min={1}
                    max={100000}
                    value={newTarget}
                    onChange={(e) => setNewTarget(e.target.value)}
                    className="w-full min-h-[42px] rounded-lg border border-[#DDD7C9] bg-white px-3 font-mono-tabular text-sm focus:border-[#0F6E56] focus:outline-none dark:border-[#243242] dark:bg-[#121A24]"
                  />
                </div>

                <button
                  type="submit"
                  className="min-h-[42px] rounded-lg bg-[#0F6E56] px-4 text-xs font-medium text-white hover:bg-[#0B5744] dark:bg-[#10B981] dark:text-[#07130E]"
                >
                  Listeye Ekle
                </button>
              </div>

              {formError && (
                <p className="text-xs text-[#B91C1C] dark:text-[#FCA5A5]">
                  {formError}
                </p>
              )}
            </form>
          )}

          <div className="divide-y divide-[#EEEAE0] dark:divide-[#1A2532]">
            {state.items.map((item) => {
              const isSelected = item.id === activeItem.id;
              return (
                <div
                  key={item.id}
                  className={`flex items-center justify-between gap-2 py-2.5 px-2 rounded-lg transition-colors ${
                    isSelected
                      ? 'bg-[#0F6E56]/7 dark:bg-[#10B981]/10'
                      : 'hover:bg-[#FAF9F6] dark:hover:bg-[#17222E]'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onSelectZikir(item.id)}
                    className="flex min-h-[44px] flex-1 items-center justify-between gap-3 text-left min-w-0"
                  >
                    <div className="min-w-0">
                      <div
                        className={`text-sm font-medium truncate ${
                          isSelected
                            ? 'text-[#0F6E56] dark:text-[#34D399]'
                            : 'text-[#171A19] dark:text-[#EDF2F0]'
                        }`}
                      >
                        {item.title}
                      </div>
                      <div className="text-xs text-[#666C68] dark:text-[#8E9BA4]">
                        Tur {item.rounds} · Hedef {item.target}
                      </div>
                    </div>

                    <div className="font-mono-tabular text-sm font-semibold text-[#171A19] dark:text-[#EDF2F0] shrink-0">
                      {item.count}/{item.target}
                    </div>
                  </button>

                  {item.isCustom && (
                    <button
                      type="button"
                      onClick={() => onDeleteCustomZikir(item.id)}
                      aria-label={`${item.title} zikrini sil`}
                      className="inline-flex min-h-[38px] min-w-[38px] items-center justify-center rounded-lg text-[#7D827E] hover:bg-[#FEE2E2] hover:text-[#B91C1C] dark:hover:bg-[#451A1A] dark:hover:text-[#FCA5A5]"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

interface ZikirmatikQuickCardProps {
  state: ZikirState;
  onIncrement: () => void;
  onResetCurrent: () => void;
  onSelectZikir: (id: string) => void;
  onOpenFullZikirmatik: () => void;
}

export function ZikirmatikQuickCard({
  state,
  onIncrement,
  onResetCurrent,
  onSelectZikir,
  onOpenFullZikirmatik,
}: ZikirmatikQuickCardProps) {
  const activeItem =
    state.items.find((i) => i.id === state.activeId) ?? state.items[0];
  const progressPct = Math.min(
    100,
    Math.round((activeItem.count / Math.max(1, activeItem.target)) * 100)
  );
  const quickPresets = state.items.slice(0, 3);

  return (
    <section
      aria-label="Hızlı Zikirmatik"
      className="rounded-2xl border border-[#E5E0D5] bg-[#FFFFFF] p-5 sm:p-6 dark:border-[#1E2936] dark:bg-[#121A24]"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-[#666C68] dark:text-[#8E9BA4]">
            <span>Zikirmatik & Tesbihat</span>
            <span aria-hidden="true">·</span>
            <span>Bugün {state.dailyTotal.toLocaleString('tr-TR')} zikir</span>
          </div>
          <div className="flex flex-wrap items-baseline gap-3">
            <h2 className="font-display text-xl font-semibold text-[#171A19] dark:text-[#EDF2F0]">
              {activeItem.title}
            </h2>
            {activeItem.arabic && (
              <span
                dir="rtl"
                lang="ar"
                className="font-serif text-lg text-[#0F6E56] dark:text-[#34D399]"
              >
                {activeItem.arabic}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1 rounded-lg bg-[#F1EEE7] p-1 dark:bg-[#18222E]">
            {quickPresets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => onSelectZikir(preset.id)}
                className={`min-h-[34px] rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                  preset.id === activeItem.id
                    ? 'bg-white text-[#171A19] shadow-xs dark:bg-[#233142] dark:text-[#EDF2F0]'
                    : 'text-[#575C59] hover:text-[#171A19] dark:text-[#9CA7B0]'
                }`}
              >
                {preset.title}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onResetCurrent}
            aria-label="Zikri sıfırla"
            className="inline-flex min-h-[42px] min-w-[42px] items-center justify-center rounded-xl border border-[#DDD7C9] bg-[#FAF9F6] text-[#575C59] hover:text-[#171A19] dark:border-[#243242] dark:bg-[#0D141C] dark:text-[#9CA7B0]"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={onIncrement}
            className="inline-flex min-h-[44px] items-center gap-2.5 rounded-xl bg-[#0F6E56] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#0B5744] active:scale-[0.98] dark:bg-[#10B981] dark:text-[#07130E] dark:hover:bg-[#34D399] whitespace-nowrap"
          >
            <Plus className="h-4 w-4" />
            <span className="font-mono-tabular font-semibold">
              {activeItem.count} / {activeItem.target}
            </span>
          </button>

          <button
            type="button"
            onClick={onOpenFullZikirmatik}
            className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl border border-[#DDD7C9] bg-[#FAF9F6] px-3.5 py-2 text-xs font-medium text-[#171A19] hover:border-[#0F6E56] dark:border-[#243242] dark:bg-[#0D141C] dark:text-[#EDF2F0] whitespace-nowrap"
          >
            <span>Tam Ekran</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Subtle progress bar */}
      <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-[#EEEAE0] dark:bg-[#1E2936]">
        <div
          className="h-full rounded-full bg-[#0F6E56] transition-[width] duration-150 dark:bg-[#10B981]"
          style={{ width: `${progressPct}%` }}
        />
      </div>
    </section>
  );
}
