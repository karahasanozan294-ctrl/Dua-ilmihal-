export type IslamicEventCategory = 'kandil' | 'bayram' | 'hicri';

export interface IslamicCalendarEvent {
  id: string;
  title: string;
  category: IslamicEventCategory;
  categoryLabel: string;
  hijriDateText: string;
  gregorianDate: Date;
  gregorianFormatted: string;
  daysRemaining: number;
  description: string;
}

export interface HijriParts {
  year: number;
  month: number; // 1-12
  day: number; // 1-30
  monthNameTr: string;
}

const HIJRI_MONTH_NAMES_TR = [
  'Muharrem',
  'Safer',
  'Rebiülevvel',
  'Rebiülahir',
  'Cemaziyelevvel',
  'Cemaziyelahir',
  'Recep',
  'Şaban',
  'Ramazan',
  'Şevval',
  'Zilkade',
  'Zilhicce',
];

const hijriNumericFormatter = new Intl.DateTimeFormat(
  'en-US-u-ca-islamic-umalqura',
  {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }
);

export function getHijriParts(date: Date): HijriParts {
  const parts = hijriNumericFormatter.formatToParts(date);
  const year = Number(parts.find((p) => p.type === 'year')?.value ?? 1448);
  const month = Number(parts.find((p) => p.type === 'month')?.value ?? 1);
  const day = Number(parts.find((p) => p.type === 'day')?.value ?? 1);
  const monthNameTr =
    HIJRI_MONTH_NAMES_TR[Math.max(0, Math.min(11, month - 1))] ?? 'Muharrem';

  return { year, month, day, monthNameTr };
}

function formatGregorianShort(date: Date): string {
  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    weekday: 'long',
  }).format(date);
}

function daysBetweenCalendarDates(from: Date, to: Date): number {
  const a = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const b = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.round((b.getTime() - a.getTime()) / (24 * 60 * 60 * 1000));
}

interface EventTemplate {
  id: string;
  title: string;
  category: IslamicEventCategory;
  categoryLabel: string;
  month: number;
  day: number;
  description: string;
}

const FIXED_HIJRI_EVENTS: EventTemplate[] = [
  {
    id: 'hicri-yilbasi',
    title: 'Hicri Yılbaşı',
    category: 'hicri',
    categoryLabel: 'Hicri Gün',
    month: 1,
    day: 1,
    description: '1 Muharrem — Hicri kameri yılın başlangıcı ve Muharrem ayının ilk günü.',
  },
  {
    id: 'asure-gunu',
    title: 'Aşure Günü',
    category: 'hicri',
    categoryLabel: 'Hicri Gün',
    month: 1,
    day: 10,
    description: '10 Muharrem — Bereket, paylaşma ve şükrün simgesi olan mübarek Aşure günü.',
  },
  {
    id: 'mevlid-kandili',
    title: 'Mevlid Kandili',
    category: 'kandil',
    categoryLabel: 'Kandil Gecesi',
    month: 3,
    day: 12,
    description: '12 Rebiülevvel — Peygamber Efendimiz Hz. Muhammed’in (s.a.v.) dünyayı teşrif ettiği gece.',
  },
  {
    id: 'uc-aylar-baslangic',
    title: 'Üç Ayların Başlangıcı',
    category: 'hicri',
    categoryLabel: 'Hicri Gün',
    month: 7,
    day: 1,
    description: '1 Recep — Recep, Şaban ve Ramazan aylarını kapsayan manevi mevsimin ilk günü.',
  },
  {
    id: 'mirac-kandili',
    title: 'Miraç Kandili',
    category: 'kandil',
    categoryLabel: 'Kandil Gecesi',
    month: 7,
    day: 27,
    description: '27 Recep — İsra ve Miraç mucizesinin gerçekleştiği, beş vakit namazın farz kılındığı mübarek gece.',
  },
  {
    id: 'berat-kandili',
    title: 'Berat Kandili',
    category: 'kandil',
    categoryLabel: 'Kandil Gecesi',
    month: 8,
    day: 15,
    description: '15 Şaban — Ramazan ayının müjdecisi, af, mağfiret ve arınma gecesi.',
  },
  {
    id: 'ramazan-baslangic',
    title: 'Ramazan Ayı Başlangıcı',
    category: 'hicri',
    categoryLabel: 'Hicri Gün',
    month: 9,
    day: 1,
    description: '1 Ramazan — Kur’an-ı Kerim’in indirildiği, oruç ve rahmet ayının ilk günü.',
  },
  {
    id: 'kadir-gecesi',
    title: 'Kadir Gecesi',
    category: 'kandil',
    categoryLabel: 'Kandil Gecesi',
    month: 9,
    day: 27,
    description: '27 Ramazan — Kur’an’da bin aydan daha hayırlı olduğu bildirilen mübarek gece.',
  },
  {
    id: 'ramazan-bayrami-1',
    title: 'Ramazan Bayramı (1. Gün)',
    category: 'bayram',
    categoryLabel: 'Bayram Günü',
    month: 10,
    day: 1,
    description: '1 Şevval — Ramazan orucunun ardından kutlanan İyd-i Fıtr sevinci.',
  },
  {
    id: 'ramazan-bayrami-2',
    title: 'Ramazan Bayramı (2. Gün)',
    category: 'bayram',
    categoryLabel: 'Bayram Günü',
    month: 10,
    day: 2,
    description: '2 Şevval — Sıla-i rahim, ziyaret ve bayramlaşma günü.',
  },
  {
    id: 'ramazan-bayrami-3',
    title: 'Ramazan Bayramı (3. Gün)',
    category: 'bayram',
    categoryLabel: 'Bayram Günü',
    month: 10,
    day: 3,
    description: '3 Şevval — Ramazan Bayramı’nın üçüncü günü.',
  },
  {
    id: 'kurban-arife',
    title: 'Kurban Bayramı Arifesi',
    category: 'bayram',
    categoryLabel: 'Bayram Günü',
    month: 12,
    day: 9,
    description: '9 Zilhicce — Hac ibadetinin rüknü olan Arafat vakfesinin yapıldığı mübarek Arife günü.',
  },
  {
    id: 'kurban-bayrami-1',
    title: 'Kurban Bayramı (1. Gün)',
    category: 'bayram',
    categoryLabel: 'Bayram Günü',
    month: 12,
    day: 10,
    description: '10 Zilhicce — İbadet, teslimiyet ve paylaşmanın simgesi Kurban Bayramı’nın ilk günü.',
  },
  {
    id: 'kurban-bayrami-2',
    title: 'Kurban Bayramı (2. Gün)',
    category: 'bayram',
    categoryLabel: 'Bayram Günü',
    month: 12,
    day: 11,
    description: '11 Zilhicce — Kurban Bayramı ve teşrik günlerinin ikinci günü.',
  },
  {
    id: 'kurban-bayrami-3',
    title: 'Kurban Bayramı (3. Gün)',
    category: 'bayram',
    categoryLabel: 'Bayram Günü',
    month: 12,
    day: 12,
    description: '12 Zilhicce — Kurban Bayramı’nın üçüncü günü.',
  },
  {
    id: 'kurban-bayrami-4',
    title: 'Kurban Bayramı (4. Gün)',
    category: 'bayram',
    categoryLabel: 'Bayram Günü',
    month: 12,
    day: 13,
    description: '13 Zilhicce — Kurban Bayramı’nın dördüncü günü.',
  },
];

export function getIslamicEventsForHijriYear(
  targetHijriYear: number,
  referenceToday: Date = new Date()
): IslamicCalendarEvent[] {
  // Approximate Gregorian start for a Hijri year: scan window of ~420 days around estimate
  // Islamic year 1448 started ~June 2026
  const approxYear = Math.round(targetHijriYear * 0.970224 + 621.57);
  const scanStart = new Date(approxYear - 1, 0, 1, 12, 0, 0);
  const totalScanDays = 750;

  const events: IslamicCalendarEvent[] = [];
  let foundRegaip = false;
  let ramazanLastDay: { date: Date; hijri: HijriParts } | null = null;

  for (let i = 0; i < totalScanDays; i++) {
    const d = new Date(scanStart.getTime() + i * 24 * 60 * 60 * 1000);
    const hijri = getHijriParts(d);
    if (hijri.year !== targetHijriYear) continue;

    // Regaip Kandili: First Thursday (dayOfWeek === 4) in Rajab (month === 7)
    if (!foundRegaip && hijri.month === 7 && d.getDay() === 4) {
      foundRegaip = true;
      events.push({
        id: `regaip-${targetHijriYear}`,
        title: 'Regaip Kandili',
        category: 'kandil',
        categoryLabel: 'Kandil Gecesi',
        hijriDateText: `${hijri.day} ${hijri.monthNameTr} ${hijri.year}`,
        gregorianDate: d,
        gregorianFormatted: formatGregorianShort(d),
        daysRemaining: daysBetweenCalendarDates(referenceToday, d),
        description:
          'Recep ayının ilk Perşembeyi Cumaya bağlayan gecesi; rahmet, rağbet ve dua gecesi.',
      });
    }

    // Track last day of Ramadan for Ramazan Bayramı Arifesi
    if (hijri.month === 9 && (hijri.day === 29 || hijri.day === 30)) {
      ramazanLastDay = { date: d, hijri };
    }

    // Match fixed Hijri events
    for (const tpl of FIXED_HIJRI_EVENTS) {
      if (hijri.month === tpl.month && hijri.day === tpl.day) {
        events.push({
          id: `${tpl.id}-${targetHijriYear}`,
          title: tpl.title,
          category: tpl.category,
          categoryLabel: tpl.categoryLabel,
          hijriDateText: `${hijri.day} ${hijri.monthNameTr} ${hijri.year}`,
          gregorianDate: d,
          gregorianFormatted: formatGregorianShort(d),
          daysRemaining: daysBetweenCalendarDates(referenceToday, d),
          description: tpl.description,
        });
      }
    }
  }

  if (ramazanLastDay) {
    events.push({
      id: `ramazan-arife-${targetHijriYear}`,
      title: 'Ramazan Bayramı Arifesi',
      category: 'bayram',
      categoryLabel: 'Bayram Günü',
      hijriDateText: `${ramazanLastDay.hijri.day} ${ramazanLastDay.hijri.monthNameTr} ${ramazanLastDay.hijri.year}`,
      gregorianDate: ramazanLastDay.date,
      gregorianFormatted: formatGregorianShort(ramazanLastDay.date),
      daysRemaining: daysBetweenCalendarDates(
        referenceToday,
        ramazanLastDay.date
      ),
      description:
        'Ramazan ayının son günü; bayrama hazırlık ve arefe günü.',
    });
  }

  return events.sort(
    (a, b) => a.gregorianDate.getTime() - b.gregorianDate.getTime()
  );
}

export interface MonthCalendarDay {
  date: Date;
  gregorianDay: number;
  hijri: HijriParts;
  isCurrentMonth: boolean;
  isToday: boolean;
  event?: IslamicCalendarEvent;
}

export function buildGregorianHijriMonthGrid(
  year: number,
  monthZeroIndexed: number,
  today: Date = new Date()
): MonthCalendarDay[] {
  const firstOfMonth = new Date(year, monthZeroIndexed, 1, 12, 0, 0);
  const lastOfMonth = new Date(year, monthZeroIndexed + 1, 0, 12, 0, 0);

  // Monday-first weekday index (0 = Mon, 6 = Sun)
  const startOffset = (firstOfMonth.getDay() + 6) % 7;
  const totalDaysInMonth = lastOfMonth.getDate();
  const totalCells = Math.ceil((startOffset + totalDaysInMonth) / 7) * 7;

  const currentHijriYear = getHijriParts(firstOfMonth).year;
  const eventsPool = [
    ...getIslamicEventsForHijriYear(currentHijriYear - 1, today),
    ...getIslamicEventsForHijriYear(currentHijriYear, today),
    ...getIslamicEventsForHijriYear(currentHijriYear + 1, today),
  ];

  const eventMap = new Map<string, IslamicCalendarEvent>();
  for (const ev of eventsPool) {
    const key = `${ev.gregorianDate.getFullYear()}-${ev.gregorianDate.getMonth()}-${ev.gregorianDate.getDate()}`;
    eventMap.set(key, ev);
  }

  const todayKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;

  const cells: MonthCalendarDay[] = [];
  for (let idx = 0; idx < totalCells; idx++) {
    const cellDate = new Date(
      year,
      monthZeroIndexed,
      1 - startOffset + idx,
      12,
      0,
      0
    );
    const key = `${cellDate.getFullYear()}-${cellDate.getMonth()}-${cellDate.getDate()}`;
    cells.push({
      date: cellDate,
      gregorianDay: cellDate.getDate(),
      hijri: getHijriParts(cellDate),
      isCurrentMonth: cellDate.getMonth() === monthZeroIndexed,
      isToday: key === todayKey,
      event: eventMap.get(key),
    });
  }

  return cells;
}
