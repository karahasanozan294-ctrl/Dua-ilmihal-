export interface SurahMeta {
  number: number;
  nameTr: string;
  nameAr: string;
  ayahCount: number;
  revelation: 'Mekke' | 'Medine';
  meaningTr: string;
}

export interface QuranAyah {
  numberInSurah: number;
  arabic: string;
  turkish: string;
  elmalili?: string;
  audioUrl?: string;
}

export interface SurahContent {
  meta: SurahMeta;
  ayahs: QuranAyah[];
  isOfflineFallback?: boolean;
}

export interface QuranReciter {
  id: string;
  nameTr: string;
  originTr: string;
  styleTr: string;
  everyAyahFolder: string;
  quranComId?: number;
}

export const BESMELE_ARABIC = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ';
export const BESMELE_TURKISH = 'Rahmân ve Rahîm olan Allah’ın adıyla.';

export const QURAN_RECITERS: QuranReciter[] = [
  {
    id: 'alafasy',
    nameTr: 'Mişâri Râşid el-Afâsî',
    originTr: 'Kuveyt',
    styleTr: 'Mürattel',
    everyAyahFolder: 'Alafasy_128kbps',
    quranComId: 7,
  },
  {
    id: 'husary',
    nameTr: 'Mahmûd Halîl el-Husarî',
    originTr: 'Mısır · Kurra',
    styleTr: 'Mürattel',
    everyAyahFolder: 'Husary_128kbps',
    quranComId: 6,
  },
  {
    id: 'husary-muallim',
    nameTr: 'Mahmûd Halîl el-Husarî (Muallim)',
    originTr: 'Mısır · Kurra',
    styleTr: 'Talimli / Ağır',
    everyAyahFolder: 'Husary_Muallim_128kbps',
    quranComId: 12,
  },
  {
    id: 'abdulbasit-murattal',
    nameTr: 'Abdülbâsit Abdüssamed (Mürattel)',
    originTr: 'Mısır · Kurra',
    styleTr: 'Mürattel',
    everyAyahFolder: 'Abdul_Basit_Murattal_192kbps',
    quranComId: 2,
  },
  {
    id: 'abdulbasit-mujawwad',
    nameTr: 'Abdülbâsit Abdüssamed (Mücevved)',
    originTr: 'Mısır · Kurra',
    styleTr: 'Makamlı / Tecvidli',
    everyAyahFolder: 'Abdul_Basit_Mujawwad_128kbps',
    quranComId: 1,
  },
  {
    id: 'minshawi-murattal',
    nameTr: 'Muhammed Sıddîk el-Minşâvî',
    originTr: 'Mısır · Kurra',
    styleTr: 'Mürattel',
    everyAyahFolder: 'Minshawy_Murattal_128kbps',
    quranComId: 9,
  },
  {
    id: 'minshawi-mujawwad',
    nameTr: 'Muhammed Sıddîk el-Minşâvî (Mücevved)',
    originTr: 'Mısır · Kurra',
    styleTr: 'Makamlı',
    everyAyahFolder: 'Minshawy_Mujawwad_192kbps',
    quranComId: 8,
  },
  {
    id: 'mustafa-ismail',
    nameTr: 'Mustafa İsmail',
    originTr: 'Mısır · Şeyhü’l-Kurra',
    styleTr: 'Makamlı',
    everyAyahFolder: 'Mustafa_Ismail_48kbps',
  },
  {
    id: 'tablawi',
    nameTr: 'Muhammed et-Tablâvî',
    originTr: 'Mısır · Kurra',
    styleTr: 'Makamlı',
    everyAyahFolder: 'Mohammad_al_Tablaway_128kbps',
  },
  {
    id: 'banna',
    nameTr: 'Mahmûd Ali el-Bennâ',
    originTr: 'Mısır · Kurra',
    styleTr: 'Mürattel',
    everyAyahFolder: 'mahmoud_ali_al_banna_32kbps',
  },
  {
    id: 'sudais',
    nameTr: 'Abdurrahman es-Südeys',
    originTr: 'Mekke · Kâbe İmamı',
    styleTr: 'Mürattel',
    everyAyahFolder: 'Abdurrahmaan_As-Sudais_192kbps',
    quranComId: 3,
  },
  {
    id: 'shuraim',
    nameTr: 'Suûd eş-Şureym',
    originTr: 'Mekke · Kâbe İmamı',
    styleTr: 'Hadr / Akıcı',
    everyAyahFolder: 'Saood_ash-Shuraym_128kbps',
    quranComId: 10,
  },
  {
    id: 'maher',
    nameTr: 'Mâhir el-Muaykılî',
    originTr: 'Mekke · Kâbe İmamı',
    styleTr: 'Mürattel',
    everyAyahFolder: 'MaherAlMuaiqly128kbps',
  },
  {
    id: 'dossari',
    nameTr: 'Yâsir ed-Devserî',
    originTr: 'Mekke · Kâbe İmamı',
    styleTr: 'Mürattel',
    everyAyahFolder: 'Yasser_Ad-Dussary_128kbps',
  },
  {
    id: 'hudhaify',
    nameTr: 'Ali el-Huzeyfî',
    originTr: 'Medine · Mescid-i Nebevî',
    styleTr: 'Mürattel',
    everyAyahFolder: 'Hudhaify_128kbps',
  },
  {
    id: 'ayyoub',
    nameTr: 'Muhammed Eyyûb',
    originTr: 'Medine · Mescid-i Nebevî',
    styleTr: 'Hicaz Makamı',
    everyAyahFolder: 'Muhammad_Ayyoub_128kbps',
  },
  {
    id: 'ghamadi',
    nameTr: 'Sa’d el-Ğâmidî',
    originTr: 'Suudi Arabistan',
    styleTr: 'Mürattel',
    everyAyahFolder: 'Ghamadi_40kbps',
  },
  {
    id: 'shatri',
    nameTr: 'Ebû Bekir eş-Şâtırî',
    originTr: 'Cidde · Kurra',
    styleTr: 'Mürattel',
    everyAyahFolder: 'Abu_Bakr_Ash-Shaatree_128kbps',
    quranComId: 4,
  },
  {
    id: 'qatami',
    nameTr: 'Nâsır el-Katâmî',
    originTr: 'Riyad',
    styleTr: 'Mürattel',
    everyAyahFolder: 'Nasser_Alqatami_128kbps',
  },
  {
    id: 'rifai',
    nameTr: 'Hânî er-Rifâî',
    originTr: 'Cidde',
    styleTr: 'Hüzünlü Mürattel',
    everyAyahFolder: 'Hani_Rifai_192kbps',
    quranComId: 5,
  },
];

export function getReciterById(reciterId: string): QuranReciter {
  return QURAN_RECITERS.find((r) => r.id === reciterId) ?? QURAN_RECITERS[0];
}

function pad3(n: number): string {
  return String(n).padStart(3, '0');
}

export function getAyahAudioUrl(
  reciterId: string,
  surahNumber: number,
  ayahNumber: number
): string {
  const reciter = getReciterById(reciterId);
  return `https://everyayah.com/data/${reciter.everyAyahFolder}/${pad3(surahNumber)}${pad3(ayahNumber)}.mp3`;
}

export function getBesmeleAudioUrl(reciterId: string): string {
  const reciter = getReciterById(reciterId);
  return `https://everyayah.com/data/${reciter.everyAyahFolder}/001001.mp3`;
}

export function stripLeadingBesmele(
  surahNumber: number,
  ayahNumber: number,
  arabicText: string
): string {
  if (surahNumber === 1 || surahNumber === 9 || ayahNumber !== 1) {
    return arabicText;
  }
  const stripped = arabicText
    .replace(
      /^بِسْمِ\s+ٱللَّهِ\s+ٱلرَّحْمَٰنِ\s+ٱلرَّحِيمِ\s*/u,
      ''
    )
    .replace(
      /^بِسْمِ\s+اللَّهِ\s+الرَّحْمَنِ\s+الرَّحِيمِ\s*/u,
      ''
    )
    .trim();
  return stripped || arabicText;
}

export interface ArabicWordToken {
  text: string;
  wordIndex: number | null;
}

const ARABIC_LETTER_RE = /[\u0621-\u064A\u0671-\u06D3]/;

export function tokenizeArabicAyah(arabic: string): ArabicWordToken[] {
  const rawTokens = arabic.trim().split(/\s+/).filter(Boolean);
  let idx = 0;
  return rawTokens.map((text) => {
    if (ARABIC_LETTER_RE.test(text)) {
      const token: ArabicWordToken = { text, wordIndex: idx };
      idx += 1;
      return token;
    }
    return { text, wordIndex: null };
  });
}

export function estimateWordWeights(tokens: ArabicWordToken[]): number[] {
  const words = tokens.filter((t) => t.wordIndex !== null);
  if (words.length === 0) return [];
  const rawWeights = words.map((w) => {
    let score = 0;
    for (const ch of w.text) {
      if (ch === '\u0653') {
        score += 3.2; // Maddah elongation
      } else if (ch === '\u0651') {
        score += 0.9; // Shaddah emphasis
      } else if (
        ch === '\u0627' ||
        ch === '\u0648' ||
        ch === '\u064A' ||
        ch === '\u0649' ||
        ch === '\u0670'
      ) {
        score += 1.4; // Vowel/elongation letter
      } else if (ARABIC_LETTER_RE.test(ch)) {
        score += 1.0;
      } else {
        score += 0.15;
      }
    }
    return Math.max(1.2, score);
  });
  const total = rawWeights.reduce((acc, v) => acc + v, 0);
  let cumulative = 0;
  return rawWeights.map((w) => {
    cumulative += w / total;
    return cumulative;
  });
}

export type WordTimingSegment = [number, number, number]; // [wordIndex0Based, startRatio, endRatio]
export type ChapterWordTimings = Record<number, WordTimingSegment[]>;

export const SURAH_CATALOG: SurahMeta[] = [
  { number: 1, nameTr: 'Fâtiha', nameAr: 'الفاتحة', ayahCount: 7, revelation: 'Mekke', meaningTr: 'Açılış' },
  { number: 2, nameTr: 'Bakara', nameAr: 'البقرة', ayahCount: 286, revelation: 'Medine', meaningTr: 'İnek' },
  { number: 3, nameTr: 'Âl-i İmrân', nameAr: 'آل عمران', ayahCount: 200, revelation: 'Medine', meaningTr: 'İmrân Ailesi' },
  { number: 4, nameTr: 'Nisâ', nameAr: 'النساء', ayahCount: 176, revelation: 'Medine', meaningTr: 'Kadınlar' },
  { number: 5, nameTr: 'Mâide', nameAr: 'المائدة', ayahCount: 120, revelation: 'Medine', meaningTr: 'Sofra' },
  { number: 6, nameTr: 'En’âm', nameAr: 'الأنعام', ayahCount: 165, revelation: 'Mekke', meaningTr: 'Hayvanlar' },
  { number: 7, nameTr: 'A’râf', nameAr: 'الأعراف', ayahCount: 206, revelation: 'Mekke', meaningTr: 'Surlar' },
  { number: 8, nameTr: 'Enfâl', nameAr: 'الأنفال', ayahCount: 75, revelation: 'Medine', meaningTr: 'Savaş Ganimetleri' },
  { number: 9, nameTr: 'Tevbe', nameAr: 'التوبة', ayahCount: 129, revelation: 'Medine', meaningTr: 'Tövbe' },
  { number: 10, nameTr: 'Yûnus', nameAr: 'يونس', ayahCount: 109, revelation: 'Mekke', meaningTr: 'Hz. Yûnus' },
  { number: 11, nameTr: 'Hûd', nameAr: 'هود', ayahCount: 123, revelation: 'Mekke', meaningTr: 'Hz. Hûd' },
  { number: 12, nameTr: 'Yûsuf', nameAr: 'يوسف', ayahCount: 111, revelation: 'Mekke', meaningTr: 'Hz. Yûsuf' },
  { number: 13, nameTr: 'Ra’d', nameAr: 'الرعد', ayahCount: 43, revelation: 'Medine', meaningTr: 'Gök Gürültüsü' },
  { number: 14, nameTr: 'İbrâhîm', nameAr: 'إبراهيم', ayahCount: 52, revelation: 'Mekke', meaningTr: 'Hz. İbrâhîm' },
  { number: 15, nameTr: 'Hicr', nameAr: 'الحجر', ayahCount: 99, revelation: 'Mekke', meaningTr: 'Hicr Bölgesi' },
  { number: 16, nameTr: 'Nahl', nameAr: 'النحل', ayahCount: 128, revelation: 'Mekke', meaningTr: 'Arı' },
  { number: 17, nameTr: 'İsrâ', nameAr: 'الإسراء', ayahCount: 111, revelation: 'Mekke', meaningTr: 'Gece Yürüyüşü' },
  { number: 18, nameTr: 'Kehf', nameAr: 'الكهف', ayahCount: 110, revelation: 'Mekke', meaningTr: 'Mağara' },
  { number: 19, nameTr: 'Meryem', nameAr: 'مريم', ayahCount: 98, revelation: 'Mekke', meaningTr: 'Hz. Meryem' },
  { number: 20, nameTr: 'Tâhâ', nameAr: 'طه', ayahCount: 135, revelation: 'Mekke', meaningTr: 'Tâhâ' },
  { number: 21, nameTr: 'Enbiyâ', nameAr: 'الأنبياء', ayahCount: 112, revelation: 'Mekke', meaningTr: 'Peygamberler' },
  { number: 22, nameTr: 'Hac', nameAr: 'الحج', ayahCount: 78, revelation: 'Medine', meaningTr: 'Hac' },
  { number: 23, nameTr: 'Mü’minûn', nameAr: 'المؤمنون', ayahCount: 118, revelation: 'Mekke', meaningTr: 'Müminler' },
  { number: 24, nameTr: 'Nûr', nameAr: 'النور', ayahCount: 64, revelation: 'Medine', meaningTr: 'Nur' },
  { number: 25, nameTr: 'Furkân', nameAr: 'الفرقان', ayahCount: 77, revelation: 'Mekke', meaningTr: 'Hak ile Batılı Ayıran' },
  { number: 26, nameTr: 'Şuarâ', nameAr: 'الشعراء', ayahCount: 227, revelation: 'Mekke', meaningTr: 'Şairler' },
  { number: 27, nameTr: 'Neml', nameAr: 'النمل', ayahCount: 93, revelation: 'Mekke', meaningTr: 'Karınca' },
  { number: 28, nameTr: 'Kasas', nameAr: 'القصص', ayahCount: 88, revelation: 'Mekke', meaningTr: 'Kıssalar' },
  { number: 29, nameTr: 'Ankebût', nameAr: 'العنكبوت', ayahCount: 69, revelation: 'Mekke', meaningTr: 'Örümcek' },
  { number: 30, nameTr: 'Rûm', nameAr: 'الروم', ayahCount: 60, revelation: 'Mekke', meaningTr: 'Rûmlar' },
  { number: 31, nameTr: 'Lokmân', nameAr: 'لقمان', ayahCount: 34, revelation: 'Mekke', meaningTr: 'Hz. Lokmân' },
  { number: 32, nameTr: 'Secde', nameAr: 'السجدة', ayahCount: 30, revelation: 'Mekke', meaningTr: 'Secde' },
  { number: 33, nameTr: 'Ahzâb', nameAr: 'الأحزاب', ayahCount: 73, revelation: 'Medine', meaningTr: 'Gruplar' },
  { number: 34, nameTr: 'Sebe’', nameAr: 'سبأ', ayahCount: 54, revelation: 'Mekke', meaningTr: 'Sebe Halkı' },
  { number: 35, nameTr: 'Fâtır', nameAr: 'فاطر', ayahCount: 45, revelation: 'Mekke', meaningTr: 'Yaratan' },
  { number: 36, nameTr: 'Yâsîn', nameAr: 'يس', ayahCount: 83, revelation: 'Mekke', meaningTr: 'Yâsîn' },
  { number: 37, nameTr: 'Sâffât', nameAr: 'الصافات', ayahCount: 182, revelation: 'Mekke', meaningTr: 'Saf Tutanlar' },
  { number: 38, nameTr: 'Sâd', nameAr: 'ص', ayahCount: 88, revelation: 'Mekke', meaningTr: 'Sâd' },
  { number: 39, nameTr: 'Zümer', nameAr: 'الزمر', ayahCount: 75, revelation: 'Mekke', meaningTr: 'Zümreler' },
  { number: 40, nameTr: 'Mü’min (Gâfir)', nameAr: 'غافر', ayahCount: 85, revelation: 'Mekke', meaningTr: 'Bağışlayan' },
  { number: 41, nameTr: 'Fussilet', nameAr: 'فصلت', ayahCount: 54, revelation: 'Mekke', meaningTr: 'Açıklanmış' },
  { number: 42, nameTr: 'Şûrâ', nameAr: 'الشورى', ayahCount: 53, revelation: 'Mekke', meaningTr: 'Danışma' },
  { number: 43, nameTr: 'Zuhruf', nameAr: 'الزخرف', ayahCount: 89, revelation: 'Mekke', meaningTr: 'Altın Süs' },
  { number: 44, nameTr: 'Duhân', nameAr: 'الدخان', ayahCount: 59, revelation: 'Mekke', meaningTr: 'Duman' },
  { number: 45, nameTr: 'Câsiye', nameAr: 'الجاثية', ayahCount: 37, revelation: 'Mekke', meaningTr: 'Diz Çöken' },
  { number: 46, nameTr: 'Ahkâf', nameAr: 'الأحقاف', ayahCount: 35, revelation: 'Mekke', meaningTr: 'Kum Tepeleri' },
  { number: 47, nameTr: 'Muhammed', nameAr: 'محمد', ayahCount: 38, revelation: 'Medine', meaningTr: 'Hz. Muhammed' },
  { number: 48, nameTr: 'Fetih', nameAr: 'الفتح', ayahCount: 29, revelation: 'Medine', meaningTr: 'Fetih' },
  { number: 49, nameTr: 'Hucurât', nameAr: 'الحجرات', ayahCount: 18, revelation: 'Medine', meaningTr: 'Odalar' },
  { number: 50, nameTr: 'Kâf', nameAr: 'ق', ayahCount: 45, revelation: 'Mekke', meaningTr: 'Kâf' },
  { number: 51, nameTr: 'Zâriyât', nameAr: 'الذاريات', ayahCount: 60, revelation: 'Mekke', meaningTr: 'Savuran Rüzgârlar' },
  { number: 52, nameTr: 'Tûr', nameAr: 'الطور', ayahCount: 49, revelation: 'Mekke', meaningTr: 'Tûr Dağı' },
  { number: 53, nameTr: 'Necm', nameAr: 'النجم', ayahCount: 62, revelation: 'Mekke', meaningTr: 'Yıldız' },
  { number: 54, nameTr: 'Kamer', nameAr: 'القمر', ayahCount: 55, revelation: 'Mekke', meaningTr: 'Ay' },
  { number: 55, nameTr: 'Rahmân', nameAr: 'الرحمن', ayahCount: 78, revelation: 'Medine', meaningTr: 'Rahmân' },
  { number: 56, nameTr: 'Vâkıa', nameAr: 'الواقعة', ayahCount: 96, revelation: 'Mekke', meaningTr: 'Kıyamet Olayı' },
  { number: 57, nameTr: 'Hadîd', nameAr: 'الحديد', ayahCount: 29, revelation: 'Medine', meaningTr: 'Demir' },
  { number: 58, nameTr: 'Mücâdele', nameAr: 'المجادلة', ayahCount: 22, revelation: 'Medine', meaningTr: 'Mücadele' },
  { number: 59, nameTr: 'Haşr', nameAr: 'الحشر', ayahCount: 24, revelation: 'Medine', meaningTr: 'Toplanma' },
  { number: 60, nameTr: 'Mümtehine', nameAr: 'الممتحنة', ayahCount: 13, revelation: 'Medine', meaningTr: 'İmtihan Edilen' },
  { number: 61, nameTr: 'Saf', nameAr: 'الصف', ayahCount: 14, revelation: 'Medine', meaningTr: 'Saf' },
  { number: 62, nameTr: 'Cuma', nameAr: 'الجمعة', ayahCount: 11, revelation: 'Medine', meaningTr: 'Cuma' },
  { number: 63, nameTr: 'Münâfikûn', nameAr: 'المنافقون', ayahCount: 11, revelation: 'Medine', meaningTr: 'Münafıklar' },
  { number: 64, nameTr: 'Teğâbün', nameAr: 'التغابن', ayahCount: 18, revelation: 'Medine', meaningTr: 'Aldanma' },
  { number: 65, nameTr: 'Talâk', nameAr: 'الطلاق', ayahCount: 12, revelation: 'Medine', meaningTr: 'Boşanma' },
  { number: 66, nameTr: 'Tahrîm', nameAr: 'التحريم', ayahCount: 12, revelation: 'Medine', meaningTr: 'Haram Kılma' },
  { number: 67, nameTr: 'Mülk', nameAr: 'الملك', ayahCount: 30, revelation: 'Mekke', meaningTr: 'Mülk / Hükümranlık' },
  { number: 68, nameTr: 'Kalem', nameAr: 'القلم', ayahCount: 52, revelation: 'Mekke', meaningTr: 'Kalem' },
  { number: 69, nameTr: 'Hâkka', nameAr: 'الحاقة', ayahCount: 52, revelation: 'Mekke', meaningTr: 'Gerçekleşecek Olan' },
  { number: 70, nameTr: 'Meâric', nameAr: 'المعارج', ayahCount: 44, revelation: 'Mekke', meaningTr: 'Yükselme Dereceleri' },
  { number: 71, nameTr: 'Nûh', nameAr: 'نوح', ayahCount: 28, revelation: 'Mekke', meaningTr: 'Hz. Nûh' },
  { number: 72, nameTr: 'Cin', nameAr: 'الجن', ayahCount: 28, revelation: 'Mekke', meaningTr: 'Cinler' },
  { number: 73, nameTr: 'Müzzemmil', nameAr: 'المزمل', ayahCount: 20, revelation: 'Mekke', meaningTr: 'Örtünüp Bürünen' },
  { number: 74, nameTr: 'Müddessir', nameAr: 'المدثر', ayahCount: 56, revelation: 'Mekke', meaningTr: 'Bürünüp Sarınan' },
  { number: 75, nameTr: 'Kıyâmet', nameAr: 'القيامة', ayahCount: 40, revelation: 'Mekke', meaningTr: 'Kıyamet' },
  { number: 76, nameTr: 'İnsân', nameAr: 'الإنسان', ayahCount: 31, revelation: 'Medine', meaningTr: 'İnsan' },
  { number: 77, nameTr: 'Mürselât', nameAr: 'المرسلات', ayahCount: 50, revelation: 'Mekke', meaningTr: 'Gönderilenler' },
  { number: 78, nameTr: 'Nebe’', nameAr: 'النبأ', ayahCount: 40, revelation: 'Mekke', meaningTr: 'Büyük Haber' },
  { number: 79, nameTr: 'Nâziât', nameAr: 'النازعات', ayahCount: 46, revelation: 'Mekke', meaningTr: 'Söküp Çıkaranlar' },
  { number: 80, nameTr: 'Abese', nameAr: 'عبس', ayahCount: 42, revelation: 'Mekke', meaningTr: 'Yüzünü Ekşitti' },
  { number: 81, nameTr: 'Tekvîr', nameAr: 'التكوير', ayahCount: 29, revelation: 'Mekke', meaningTr: 'Dürülme' },
  { number: 82, nameTr: 'İnfitâr', nameAr: 'الانفطار', ayahCount: 19, revelation: 'Mekke', meaningTr: 'Yarılma' },
  { number: 83, nameTr: 'Mutaffifîn', nameAr: 'المطففين', ayahCount: 36, revelation: 'Mekke', meaningTr: 'Ölçüde Hile Yapanlar' },
  { number: 84, nameTr: 'İnşikâk', nameAr: 'الانشقاق', ayahCount: 25, revelation: 'Mekke', meaningTr: 'Yarılma' },
  { number: 85, nameTr: 'Burûc', nameAr: 'البروج', ayahCount: 22, revelation: 'Mekke', meaningTr: 'Burçlar' },
  { number: 86, nameTr: 'Târık', nameAr: 'الطارق', ayahCount: 17, revelation: 'Mekke', meaningTr: 'Gece Gelen Yıldız' },
  { number: 87, nameTr: 'A’lâ', nameAr: 'الأعلى', ayahCount: 19, revelation: 'Mekke', meaningTr: 'En Yüce' },
  { number: 88, nameTr: 'Gâşiye', nameAr: 'الغاشية', ayahCount: 26, revelation: 'Mekke', meaningTr: 'Kaplayıp Bürüyecek Olan' },
  { number: 89, nameTr: 'Fecr', nameAr: 'الفجر', ayahCount: 30, revelation: 'Mekke', meaningTr: 'Şafak' },
  { number: 90, nameTr: 'Beled', nameAr: 'البلد', ayahCount: 20, revelation: 'Mekke', meaningTr: 'Şehir (Mekke)' },
  { number: 91, nameTr: 'Şems', nameAr: 'الشمس', ayahCount: 15, revelation: 'Mekke', meaningTr: 'Güneş' },
  { number: 92, nameTr: 'Leyl', nameAr: 'الليل', ayahCount: 21, revelation: 'Mekke', meaningTr: 'Gece' },
  { number: 93, nameTr: 'Duhâ', nameAr: 'الضحى', ayahCount: 11, revelation: 'Mekke', meaningTr: 'Kuşluk Vakti' },
  { number: 94, nameTr: 'İnşirâh', nameAr: 'الشرح', ayahCount: 8, revelation: 'Mekke', meaningTr: 'Gönül Ferahlığı' },
  { number: 95, nameTr: 'Tîn', nameAr: 'التين', ayahCount: 8, revelation: 'Mekke', meaningTr: 'İncir' },
  { number: 96, nameTr: 'Alak', nameAr: 'العلق', ayahCount: 19, revelation: 'Mekke', meaningTr: 'Alak / İlk Vahiy' },
  { number: 97, nameTr: 'Kadir', nameAr: 'القدر', ayahCount: 5, revelation: 'Mekke', meaningTr: 'Kadir Gecesi' },
  { number: 98, nameTr: 'Beyyine', nameAr: 'البينة', ayahCount: 8, revelation: 'Medine', meaningTr: 'Apaçık Delil' },
  { number: 99, nameTr: 'Zilzâl', nameAr: 'الزلزلة', ayahCount: 8, revelation: 'Medine', meaningTr: 'Deprem' },
  { number: 100, nameTr: 'Âdiyât', nameAr: 'العاديات', ayahCount: 11, revelation: 'Mekke', meaningTr: 'Koşan Atlar' },
  { number: 101, nameTr: 'Kâria', nameAr: 'القارعة', ayahCount: 11, revelation: 'Mekke', meaningTr: 'Kapıyı Çalan Kıyamet' },
  { number: 102, nameTr: 'Tekâsür', nameAr: 'التكاثر', ayahCount: 8, revelation: 'Mekke', meaningTr: 'Çoğalma Yarışı' },
  { number: 103, nameTr: 'Asr', nameAr: 'العصر', ayahCount: 3, revelation: 'Mekke', meaningTr: 'İkindi / Zaman' },
  { number: 104, nameTr: 'Hümeze', nameAr: 'الهمزة', ayahCount: 9, revelation: 'Mekke', meaningTr: 'Kınayan' },
  { number: 105, nameTr: 'Fîl', nameAr: 'الفيل', ayahCount: 5, revelation: 'Mekke', meaningTr: 'Fil' },
  { number: 106, nameTr: 'Kureyş', nameAr: 'قريش', ayahCount: 4, revelation: 'Mekke', meaningTr: 'Kureyş Kabilesi' },
  { number: 107, nameTr: 'Mâûn', nameAr: 'الماعون', ayahCount: 7, revelation: 'Mekke', meaningTr: 'Yardımlaşma' },
  { number: 108, nameTr: 'Kevser', nameAr: 'الكوثر', ayahCount: 3, revelation: 'Mekke', meaningTr: 'Kevser / Bol Nimet' },
  { number: 109, nameTr: 'Kâfirûn', nameAr: 'الكافرون', ayahCount: 6, revelation: 'Mekke', meaningTr: 'İnkârcılar' },
  { number: 110, nameTr: 'Nasr', nameAr: 'النصر', ayahCount: 3, revelation: 'Medine', meaningTr: 'Yardım' },
  { number: 111, nameTr: 'Tebbet', nameAr: 'المسد', ayahCount: 5, revelation: 'Mekke', meaningTr: 'Alev / Tebbet' },
  { number: 112, nameTr: 'İhlâs', nameAr: 'الإخلاص', ayahCount: 4, revelation: 'Mekke', meaningTr: 'Samimi Tevhid' },
  { number: 113, nameTr: 'Felak', nameAr: 'الفلق', ayahCount: 5, revelation: 'Mekke', meaningTr: 'Sabah Aydınlığı' },
  { number: 114, nameTr: 'Nâs', nameAr: 'الناس', ayahCount: 6, revelation: 'Mekke', meaningTr: 'İnsanlar' },
];

// Built-in offline fallback for core short surahs so reading works instantaneously even without network
const OFFLINE_SURAHS: Record<number, QuranAyah[]> = {
  1: [
    { numberInSurah: 1, arabic: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ', turkish: 'Rahmân ve Rahîm olan Allah’ın adıyla.', elmalili: 'Rahmân ve Rahîm olan Allah’ın ismiyle.' },
    { numberInSurah: 2, arabic: 'ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ', turkish: 'Hamd, âlemlerin Rabbi Allah’a mahsustur.', elmalili: 'Hamd o âlemlerin Rabbi,' },
    { numberInSurah: 3, arabic: 'ٱلرَّحْمَٰنِ ٱلرَّحِيمِ', turkish: 'O, Rahmân’dır, Rahîm’dir.', elmalili: 'O Rahmân ve Rahîm,' },
    { numberInSurah: 4, arabic: 'مَٰلِكِ يَوْمِ ٱلدِّينِ', turkish: 'Din (hesap) gününün mâlikidir.', elmalili: 'O, din gününün mâliki Allah’ın.' },
    { numberInSurah: 5, arabic: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ', turkish: '(Rabbimiz!) Ancak sana kulluk eder ve yalnız senden yardım dileriz.', elmalili: 'Ancak sana ederiz kulluğu, ibadeti ve ancak senden dileriz yardımı, inayeti. (Yâ Rab!)' },
    { numberInSurah: 6, arabic: 'ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ', turkish: 'Bizi dosdoğru yola ilet;', elmalili: 'Hidayet eyle bizi doğru yola,' },
    { numberInSurah: 7, arabic: 'صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ', turkish: 'Kendilerine nimet verdiklerinin yoluna; gazaba uğrayanların ve sapkınların yoluna değil.', elmalili: 'O kendilerine nimet verdiğin mutlu kimselerin yoluna; o gazaba uğramışların ve o sapmışların yoluna değil.' },
  ],
  103: [
    { numberInSurah: 1, arabic: 'وَٱلْعَصْرِ', turkish: 'Asra (zamana) yemin olsun ki,', elmalili: 'Asra yemin olsun ki,' },
    { numberInSurah: 2, arabic: 'إِنَّ ٱلْإِنسَٰنَ لَفِى خُسْرٍ', turkish: 'İnsan gerçekten ziyan içindedir.', elmalili: 'İnsan mutlaka ziyandadır.' },
    { numberInSurah: 3, arabic: 'إِلَّا ٱلَّذِينَ ءَامَنُوا۟ وَعَمِلُوا۟ ٱلصَّٰلِحَٰتِ وَتَوَاصَوْا۟ بِٱلْحَقِّ وَتَوَاصَوْا۟ بِٱلصَّبْرِ', turkish: 'Ancak iman edip salih ameller işleyenler, birbirlerine hakkı tavsiye edenler ve birbirlerine sabrı tavsiye edenler başka.', elmalili: 'Ancak iman edenler, salih amel (iyi işler) işleyenler, birbirlerine hakkı tavsiye eden ve sabrı tavsiye edenler bunun dışındadır.' },
  ],
  108: [
    { numberInSurah: 1, arabic: 'إِنَّآ أَعْطَيْنَٰكَ ٱلْكَوْثَرَ', turkish: 'Şüphesiz biz sana Kevser’i verdik.', elmalili: 'Muhakkak biz sana Kevser’i verdik.' },
    { numberInSurah: 2, arabic: 'فَصَلِّ لِرَبِّكَ وَٱنْحَرْ', turkish: 'Öyleyse Rabbin için namaz kıl ve kurban kes.', elmalili: 'Sen de Rabbin için namaz kıl ve kurban kes!' },
    { numberInSurah: 3, arabic: 'إِنَّ شَانِئَكَ هُوَ ٱلْأَبْتَرُ', turkish: 'Doğrusu sana kin besleyen asıl soyu kesik olanın ta kendisidir.', elmalili: 'Doğrusu sana buğzeden, soyu kesik olanın ta kendisidir.' },
  ],
  112: [
    { numberInSurah: 1, arabic: 'قُلْ هُوَ ٱللَّهُ أَحَدٌ', turkish: 'De ki: O, Allah’tır, bir tektir.', elmalili: 'De ki: O, Allah bir tektir.' },
    { numberInSurah: 2, arabic: 'ٱللَّهُ ٱلصَّمَدُ', turkish: 'Allah Samed’dir (her şey O’na muhtaçtır, O hiçbir şeye muhtaç değildir).', elmalili: 'Allah Samed’dir (her şey O’na muhtaç, O hiçbir şeye muhtaç değildir).' },
    { numberInSurah: 3, arabic: 'لَمْ يَلِدْ وَلَمْ يُولَدْ', turkish: 'O doğurmamış ve doğmamıştır.', elmalili: 'O doğurmadı ve doğurulmadı.' },
    { numberInSurah: 4, arabic: 'وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌ', turkish: 'O’nun hiçbir dengi de yoktur.', elmalili: 'O’na bir denk de olmadı.' },
  ],
  113: [
    { numberInSurah: 1, arabic: 'قُلْ أَعُوذُ بِرَبِّ ٱلْفَلَقِ', turkish: 'De ki: Yaratılmışların şerrinden sabahın Rabbine sığınırım;', elmalili: 'De ki: Sığınırım o sabahın Rabbine,' },
    { numberInSurah: 2, arabic: 'مِن شَرِّ مَا خَلَقَ', turkish: 'Yarattığı şeylerin şerrinden,', elmalili: 'Yarattığı şeylerin şerrinden,' },
    { numberInSurah: 3, arabic: 'وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ', turkish: 'Karanlığı çöktüğü zaman gecenin şerrinden,', elmalili: 'Karanlığı çöküp bastırdığı zaman gecenin şerrinden,' },
    { numberInSurah: 4, arabic: 'وَمِن شَرِّ ٱلنَّفَّٰثَٰتِ فِى ٱلْعُقَدِ', turkish: 'Düğümlere üfleyen büyücülerin şerrinden,', elmalili: 'O düğümlere üfleyen üfürükçülerin şerrinden,' },
    { numberInSurah: 5, arabic: 'وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ', turkish: 'Ve haset ettiği zaman hasetçinin şerrinden (Allah’a sığınırım).', elmalili: 'Ve haset ettiği zaman hasetçinin şerrinden!' },
  ],
  114: [
    { numberInSurah: 1, arabic: 'قُلْ أَعُوذُ بِرَبِّ ٱلنَّاسِ', turkish: 'De ki: İnsanların Rabbine sığınırım,', elmalili: 'De ki: Sığınırım ben insanların Rabbine,' },
    { numberInSurah: 2, arabic: 'مَلِكِ ٱلنَّاسِ', turkish: 'İnsanların Melikine (hükümdarına),', elmalili: 'İnsanların hükümdarına,' },
    { numberInSurah: 3, arabic: 'إِلَٰهِ ٱلنَّاسِ', turkish: 'İnsanların İlâhına;', elmalili: 'İnsanların ilâhına,' },
    { numberInSurah: 4, arabic: 'مِن شَرِّ ٱلْوَسْوَاسِ ٱلْخَنَّاسِ', turkish: 'Sinsi vesvesecinin şerrinden;', elmalili: 'O sinsi vesvesecinin şerrinden!' },
    { numberInSurah: 5, arabic: 'ٱلَّذِى يُوَسْوِسُ فِى صُدُورِ ٱلنَّاسِ', turkish: 'O ki insanların göğüslerine vesvese verir;', elmalili: 'Ki o, insanların göğüslerine vesvese verir durur;' },
    { numberInSurah: 6, arabic: 'مِنَ ٱلْجِنَّةِ وَٱلنَّاسِ', turkish: 'Gerek cinlerden gerek insanlardan (olan vesvesecinin şerrinden).', elmalili: 'Gerek cinlerden, gerek insanlardan.' },
  ],
};

const surahMemoryCache = new Map<number, SurahContent>();
const wordTimingsCache = new Map<string, ChapterWordTimings>();

interface AlQuranApiEdition {
  ayahs: {
    numberInSurah: number;
    text: string;
    audio?: string;
  }[];
}

function normalizeSurahContent(
  surahNumber: number,
  content: SurahContent
): SurahContent {
  return {
    ...content,
    ayahs: content.ayahs.map((a) => ({
      ...a,
      arabic: stripLeadingBesmele(surahNumber, a.numberInSurah, a.arabic),
    })),
  };
}

export async function fetchSurahContent(
  surahNumber: number,
  signal?: AbortSignal
): Promise<SurahContent> {
  const meta =
    SURAH_CATALOG.find((s) => s.number === surahNumber) ?? SURAH_CATALOG[0];

  const cached = surahMemoryCache.get(surahNumber);
  if (cached) return cached;

  // Check localStorage cache first
  if (typeof window !== 'undefined') {
    try {
      const stored = window.localStorage.getItem(`mihrab_surah_v2_${surahNumber}`);
      if (stored) {
        const parsed = normalizeSurahContent(
          surahNumber,
          JSON.parse(stored) as SurahContent
        );
        if (parsed.ayahs?.length > 0) {
          surahMemoryCache.set(surahNumber, parsed);
          return parsed;
        }
      }
    } catch {
      // Ignore storage read errors
    }
  }

  try {
    const url = `https://api.alquran.cloud/v1/surah/${surahNumber}/editions/quran-uthmani,tr.diyanet,tr.yazir,ar.alafasy`;
    const response = await fetch(url, { signal });
    if (!response.ok) {
      throw new Error('Sure metni sunucudan alınamadı');
    }
    const json = (await response.json()) as {
      code: number;
      data?: AlQuranApiEdition[];
    };

    if (!json.data || json.data.length < 3) {
      throw new Error('Beklenmeyen Kur’an API yanıtı');
    }

    const arabicEdition = json.data[0];
    const diyanetEdition = json.data[1];
    const elmaliliEdition = json.data[2];
    const audioEdition = json.data[3];

    const ayahs: QuranAyah[] = arabicEdition.ayahs.map((arAyah, idx) => ({
      numberInSurah: arAyah.numberInSurah,
      arabic: stripLeadingBesmele(
        surahNumber,
        arAyah.numberInSurah,
        arAyah.text
      ),
      turkish: diyanetEdition.ayahs[idx]?.text ?? '',
      elmalili: elmaliliEdition.ayahs[idx]?.text ?? '',
      audioUrl: audioEdition?.ayahs[idx]?.audio,
    }));

    const result: SurahContent = { meta, ayahs, isOfflineFallback: false };
    surahMemoryCache.set(surahNumber, result);

    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(
          `mihrab_surah_v2_${surahNumber}`,
          JSON.stringify(result)
        );
      } catch {
        // Ignore storage quota errors
      }
    }

    return result;
  } catch (err) {
    if ((err as Error).name === 'AbortError') throw err;

    const fallback = OFFLINE_SURAHS[surahNumber];
    if (fallback) {
      return { meta, ayahs: fallback, isOfflineFallback: true };
    }
    throw err;
  }
}

interface QuranComTimestamp {
  verse_key: string;
  timestamp_from: number;
  timestamp_to: number;
  segments?: number[][];
}

export async function fetchChapterWordTimings(
  reciterId: string,
  surahNumber: number,
  signal?: AbortSignal
): Promise<ChapterWordTimings> {
  const reciter = getReciterById(reciterId);
  if (!reciter.quranComId) return {};

  const cacheKey = `${reciter.quranComId}:${surahNumber}`;
  const cached = wordTimingsCache.get(cacheKey);
  if (cached) return cached;

  try {
    const res = await fetch(
      `https://api.quran.com/api/v4/chapter_recitations/${reciter.quranComId}/${surahNumber}?segments=true`,
      { signal }
    );
    if (!res.ok) return {};
    const data = (await res.json()) as {
      audio_file?: { timestamps?: QuranComTimestamp[] };
    };
    const list = data.audio_file?.timestamps;
    if (!Array.isArray(list)) return {};

    const result: ChapterWordTimings = {};
    for (const ts of list) {
      const ayahStr = ts.verse_key?.split(':')[1];
      const ayahNum = ayahStr ? Number(ayahStr) : NaN;
      if (!Number.isFinite(ayahNum) || !ts.segments?.length) continue;

      const validSegs = ts.segments.filter(
        (s) => s.length >= 3 && s[0] >= 1 && s[2] >= s[1]
      );
      if (validSegs.length === 0) continue;

      const baseStart = Math.min(ts.timestamp_from, validSegs[0][1]);
      const baseEnd = Math.max(
        ts.timestamp_to,
        validSegs[validSegs.length - 1][2]
      );
      const span = Math.max(1, baseEnd - baseStart);

      result[ayahNum] = validSegs.map((s) => [
        s[0] - 1,
        Math.max(0, (s[1] - baseStart) / span),
        Math.min(1, (s[2] - baseStart) / span),
      ]);
    }

    wordTimingsCache.set(cacheKey, result);
    return result;
  } catch {
    return {};
  }
}
