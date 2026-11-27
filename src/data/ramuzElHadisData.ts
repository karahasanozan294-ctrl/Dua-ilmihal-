export interface RamuzPage {
  p: number;
  hasArabic: boolean;
  paragraphs: string[];
}

export interface RamuzSubsection {
  label: string;
  page: number;
}

export interface RamuzChapter {
  id: string;
  volume: 1 | 2;
  chapterNo: number;
  title: string;
  startPage: number;
  endPage: number;
  subsections: RamuzSubsection[];
  pages: RamuzPage[];
}

export interface RamuzDataset {
  title: string;
  author: string;
  commentator: string;
  volumes: number;
  totalChapters: number;
  chapters: RamuzChapter[];
}

export interface RamuzSourceRemiz {
  symbol: string;
  scholar: string;
  bookTitle: string;
}

export interface RamuzSelectedHadith {
  id: string;
  letterGroup: string;
  ramuzRef: string;
  arabic: string;
  transliteration: string;
  turkish: string;
  narrator: string;
  remiz: string;
  sourceDetail: string;
  lessonVolume?: 1 | 2;
  lessonPage?: number;
}

export const RAMUZ_BOOK_META = {
  title: 'Râmûzü’l-Ehâdîs',
  subtitle: 'Ahmed Ziyâeddin Gümüşhânevî (k.s.) · Hadis Külliyatı ve Dersleri (2 Cilt Tam Metin)',
  author: 'Ahmed Ziyâeddin b. Mustafa el-Gümüşhânevî (1813–1893)',
  commentator: 'Mehmed Zâhid Kotku (rh.a.) · Hazırlayan: Dr. Metin Erkaya',
  structureSummary:
    'I. Bölüm: Elif’ten Yâ’ya alfabetik tertiple 6.400 hadis · II. Bölüm: Şemâil-i Şerîfe hakkında 701 hadis · Toplam 7.101 hadis-i şerif (125+ kaynak eser)',
  totalVolumes: 2,
  totalChapters: 34,
  totalPages: 1283,
};

export const RAMUZ_PREFACE = {
  biographyTitle: 'Müellif Ahmed Ziyâeddin Gümüşhânevî (k.s.) ve Râmûzü’l-Ehâdîs Hakkında',
  paragraphs: [
    'Ahmed Ziyâeddin Gümüşhânevî Hazretleri (1813–1893), 19. yüzyıl Osmanlı ilim ve irfan dünyasının önde gelen muhaddis, fakih ve Nakşibendî-Hâlidî mürşidlerindendir. Beyazıt ve Mahmudpaşa medreselerinde yetişen müellif, hadis ilminin ihyâsı için ömrünü vakfetmiş ve elliyi aşkın eser telif etmiştir.',
    '“Hadislerin İşaretleri / Denizleri” mânâsına gelen Râmûzü’l-Ehâdîs alâ Tertîbi Hurûfi’l-Hicâ adlı eseri, az sözle çok mânâ ifade eden, ezberlenmesi kolay ve muteber 7.101 hadis-i şerifi bir araya getirir. Müellif bu eseri 125’i aşkın temel hadis kaynağından istifade ederek hazırlamıştır.',
    'Eser iki ana kısımdan oluşur: Birinci bölümde hadisler ilk kelimelerinin harf sırasına göre (Elif’ten Yâ’ya) dizilmiş 6.400 hadis yer alır; ikinci bölümde ise Peygamber Efendimiz’in (s.a.v.) mübarek vasıfları, ahlâkı ve şemâilini anlatan 701 hadis bulunmaktadır. Her hadisin sonunda kaynak eser remizleri (kısaltmaları) ve sahâbî râvîsi zikredilir.',
    'İstanbul Fatih İskenderpaşa Camii’nde Mehmed Zâhid Kotku (rh.a.) Hocaefendi tarafından yıllarca okutulan Râmûzü’l-Ehâdîs Dersleri’nin iki ciltlik (1.283 sayfa) tam metni hem aranabilir metin görünümüyle hem de orijinal Arapça harekeli metinleriyle birlikte tam PDF sayfaları hâlinde bu kitaplıkta yer almaktadır.',
  ],
};

export const RAMUZ_SOURCE_REMIZLERI: RamuzSourceRemiz[] = [
  { symbol: 'خ', scholar: 'İmâm Buhârî', bookTitle: 'el-Câmiu’s-Sahîh (Sahîh-i Buhârî)' },
  { symbol: 'م', scholar: 'İmâm Müslim', bookTitle: 'el-Câmiu’s-Sahîh (Sahîh-i Müslim)' },
  { symbol: 'د', scholar: 'Ebû Dâvud es-Sicistânî', bookTitle: 'Sünen-i Ebî Dâvud' },
  { symbol: 'ت', scholar: 'İmâm Tirmizî', bookTitle: 'Sünen-i Tirmizî (el-Câmi)' },
  { symbol: 'ن', scholar: 'İmâm Nesâî', bookTitle: 'Sünen-i Nesâî (el-Müctebâ)' },
  { symbol: 'ه', scholar: 'İbn Mâce el-Kazvînî', bookTitle: 'Sünen-i İbn Mâce' },
  { symbol: 'حم', scholar: 'Ahmed b. Hanbel', bookTitle: 'el-Müsned' },
  { symbol: 'عب', scholar: 'Abdürrezzâk es-San’ânî', bookTitle: 'el-Musannef' },
  { symbol: 'ط', scholar: 'Ebû Dâvud et-Tayâlisî', bookTitle: 'el-Müsned' },
  { symbol: 'ش', scholar: 'İbn Ebî Şeybe', bookTitle: 'el-Musannef' },
  { symbol: 'ع', scholar: 'Ebû Ya’lâ el-Mevsılî', bookTitle: 'el-Müsned' },
  { symbol: 'طب', scholar: 'İmâm Taberânî', bookTitle: 'el-Mu’cemü’l-Kebîr' },
  { symbol: 'طس', scholar: 'İmâm Taberânî', bookTitle: 'el-Mu’cemü’l-Evsat' },
  { symbol: 'قط', scholar: 'İmâm Dârekutnî', bookTitle: 'Sünen-i Dârekutnî' },
  { symbol: 'حل', scholar: 'Ebû Nuaym el-İsfehânî', bookTitle: 'Hilyetü’l-Evliyâ' },
  { symbol: 'ق', scholar: 'İmâm Beyhakî', bookTitle: 'es-Sünenü’l-Kübrâ' },
  { symbol: 'هب', scholar: 'İmâm Beyhakî', bookTitle: 'Şuabü’l-İmân' },
  { symbol: 'عق', scholar: 'İmâm Ukaylî', bookTitle: 'Kitâbü’d-Duafâ' },
  { symbol: 'عد', scholar: 'İbn Adî', bookTitle: 'el-Kâmil fi’d-Duafâ' },
  { symbol: 'خط', scholar: 'Hatîb el-Bağdâdî', bookTitle: 'Târîhu Bağdâd' },
  { symbol: 'كر', scholar: 'İbn Asâkir', bookTitle: 'Târîhu Dımaşk' },
  { symbol: 'حب', scholar: 'İbn Hibbân', bookTitle: 'es-Sahîh (Sahîh-i İbn Hibbân)' },
  { symbol: 'ك', scholar: 'Hâkim en-Nîsâbûrî', bookTitle: 'el-Müstedrek ale’s-Sahîhayn' },
  { symbol: 'ض', scholar: 'Ziyâ el-Makdisî', bookTitle: 'el-Ehâdîsü’l-Muhtâre' },
  { symbol: 'در', scholar: 'İmâm Dârimî', bookTitle: 'Sünen-i Dârimî' },
  { symbol: 'خز', scholar: 'İbn Huzeyme', bookTitle: 'es-Sahîh (Sahîh-i İbn Huzeyme)' },
  { symbol: 'بر', scholar: 'İbn Abdilberr', bookTitle: 'el-İstîâb fî Ma’rifeti’l-Ashâb' },
  { symbol: 'غ', scholar: 'İmâm Begavî', bookTitle: 'Şerhu’s-Sünne' },
  { symbol: 'طح', scholar: 'İmâm Tahâvî', bookTitle: 'Şerhu Meâni’l-Âsâr' },
];

export const RAMUZ_FEATURED_HADITHS: RamuzSelectedHadith[] = [
  {
    id: 're-naddara',
    letterGroup: 'Nûn (ن) Harfi',
    ramuzRef: 'RE. Ders 1 · İlim ve Tebliğ',
    arabic:
      'نَضَّرَ اللّٰهُ امْرَأً سَمِعَ مِنَّا شَيْئًا فَبَلَّغَهُ كَمَا سَمِعَهُ، فَرُبَّ مُبَلَّغٍ أَوْعَى مِنْ سَامِعٍ',
    transliteration:
      'Naddarallâhu’mreen semia minnâ şey’en febelleğahû kemâ semiahû, ferubbe mübellağin ev’â min sâmiin.',
    turkish:
      'Allah yüzünü ağartsın o kimsenin ki, bizden bir söz işitir ve onu işittiği gibi başkalarına ulaştırır. Nice kendisine ulaştırılan kimseler vardır ki, bizzat işitenden daha iyi kavrayıcıdır.',
    narrator: 'Abdullah b. Mes’ûd (r.a.)',
    remiz: '(ت. حب. هب. عن ابن مسعود)',
    sourceDetail: 'Tirmizî, İlim, 7 (2657); İbn Hibbân, Sahîh, 69; Beyhakî, Şuabü’l-İmân, 1738',
    lessonVolume: 1,
    lessonPage: 30,
  },
  {
    id: 're-salavat',
    letterGroup: 'Elif (أ / إنّ) Harfi',
    ramuzRef: 'RE. Ders 1 · Salât ü Selâm',
    arabic:
      'إِنَّ أَوْلَى النَّاسِ بِي يَوْمَ الْقِيَامَةِ أَكْثَرُهُمْ عَلَيَّ صَلَاةً',
    transliteration:
      'İnne evle’n-nâsi bî yevme’l-kıyâmeti ekseruhüm aleyye salâten.',
    turkish:
      'Kıyamet gününde insanların bana en yakın ve şefaatime en lâyık olanı, bana en çok salât ü selâm getirendir.',
    narrator: 'Abdullah b. Mes’ûd (r.a.)',
    remiz: '(ت. حب. طب. هب. عن ابن مسعود)',
    sourceDetail: 'Tirmizî, Vitr, 21 (484); İbn Hibbân, Sahîh, 911; Taberânî, el-Mu’cemü’l-Kebîr',
    lessonVolume: 1,
    lessonPage: 30,
  },
  {
    id: 're-niyyat',
    letterGroup: 'Elif (أ / إنّما) Harfi',
    ramuzRef: 'RE. 101/1 · İhlâs ve Niyet',
    arabic:
      'إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى',
    transliteration:
      'İnneme’l-a’mâlü bi’n-niyyât, ve innemâ li-külli’mriin mâ nevâ.',
    turkish:
      'Ameller ancak niyetlere göredir ve her kişiye ancak niyet ettiği şeyin karşılığı vardır.',
    narrator: 'Hz. Ömer b. Hattâb (r.a.)',
    remiz: '(خ. م. د. ت. ن. ه. عن عمر)',
    sourceDetail: 'Buhârî, Bed’ü’l-Vahy, 1; Müslim, İmâre, 155; Ebû Dâvud; Tirmizî; Nesâî; İbn Mâce',
  },
  {
    id: 're-valideyn-dua',
    letterGroup: 'Elif (إ / إذا) Harfi',
    ramuzRef: 'RE. 39/1 · Anne-Babaya Dua',
    arabic:
      'إِذَا تَرَكَ الْعَبْدُ الدُّعَاءَ لِلْوَالِدَيْنِ فَإِنَّهُ يَنْقَطِعُ عَنْهُ الرِّزْقُ',
    transliteration:
      'İzâ tereke’l-abdü’d-duâe li’l-vâlideyni feinnehû yenkatıu anhü’r-rızk.',
    turkish:
      'Kul, anne ve babası için dua etmeyi terk ettiği zaman, ondan (maddî-manevî bereket ve feyiz) rızkı kesilir.',
    narrator: 'Enes b. Mâlik (r.a.)',
    remiz: '(ك. في التاريخ، والديلمي عن أنس)',
    sourceDetail: 'Hâkim, Târîh; Deylemî, Müsnedü’l-Firdevs, 1222; Câmiü’l-Ehâdîs, 1614',
    lessonVolume: 2,
    lessonPage: 189,
  },
  {
    id: 're-takva',
    letterGroup: 'Elif (أ / اتق) Harfi',
    ramuzRef: 'RE. Takvâ ve Güzel Ahlâk',
    arabic:
      'اِتَّقِ اللّٰهَ حَيْثُمَا كُنْتَ، وَأَتْبِعِ السَّيِّئَةَ الْحَسَنَةَ تَمْحُهَا، وَخَالِقِ النَّاسَ بِخُلُقٍ حَسَنٍ',
    transliteration:
      'İttekıllâhe haysümâ künte, ve etbii’s-seyyiete’l-hasenete temhuhâ, ve hâlikı’n-nâse bi-hulukin hasen.',
    turkish:
      'Nerede olursan ol Allah’tan kork; kötülüğün ardından hemen onu silecek bir iyilik yap ve insanlara güzel ahlâkla muamele et.',
    narrator: 'Ebû Zer ve Muâz b. Cebel (r.anhümâ)',
    remiz: '(حم. ت. ك. عن أبي ذر ومعاذ)',
    sourceDetail: 'Tirmizî, Birr, 55 (1987); Ahmed b. Hanbel, Müsned; Hâkim, el-Müstedrek',
    lessonVolume: 1,
    lessonPage: 306,
  },
  {
    id: 're-merhamet',
    letterGroup: 'Râ (ر) Harfi',
    ramuzRef: 'RE. Merhamet ve Şefkat',
    arabic:
      'اَلرَّاحِمُونَ يَرْحَمُهُمُ الرَّحْمٰنُ، اِرْحَمُوا مَنْ فِي الْأَرْضِ يَرْحَمْكُمْ مَنْ فِي السَّمَاءِ',
    transliteration:
      'Er-Râhimûne yerhamuhümü’r-Rahmân, irhamû men fi’l-ardi yerhamküm men fi’s-semâ.',
    turkish:
      'Merhamet edenlere Rahmân olan Allah da merhamet eder. Yeryüzündekilere merhamet edin ki göktekiler (ve Arş’ın sahibi) de size merhamet etsin.',
    narrator: 'Abdullah b. Amr (r.a.)',
    remiz: '(حم. د. ت. ك. عن ابن عمرو)',
    sourceDetail: 'Ebû Dâvud, Edeb, 58 (4941); Tirmizî, Birr, 16 (1924); Hâkim, el-Müstedrek',
  },
  {
    id: 're-muslim-tanimi',
    letterGroup: 'Mîm (م) Harfi · El-Takılı',
    ramuzRef: 'RE. Müslümanın Vasıfları',
    arabic:
      'اَلْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ، وَالْمُهَاجِرُ مَنْ هَجَرَ مَا نَهَى اللّٰهُ عَنْهُ',
    transliteration:
      'El-Müslimü men selime’l-müslimûne min lisânihî ve yedih, ve’l-muhâciru men hecera mâ nehallâhu anh.',
    turkish:
      'Gerçek Müslüman, elinden ve dilinden diğer Müslümanların güven içinde olduğu kimsedir. Gerçek muhacir ise Allah’ın yasakladığı şeyleri terk edendir.',
    narrator: 'Abdullah b. Amr (r.a.)',
    remiz: '(خ. م. د. ن. عن عبد الله بن عمرو)',
    sourceDetail: 'Buhârî, Îmân, 4; Müslim, Îmân, 64; Ebû Dâvud; Nesâî',
    lessonVolume: 1,
    lessonPage: 636,
  },
  {
    id: 're-kuran-hayirlisi',
    letterGroup: 'Hâ (خ) Harfi',
    ramuzRef: 'RE. Kur’an Eğitimi',
    arabic:
      'خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ',
    transliteration:
      'Hayruküm men tealleme’l-Kur’âne ve allemehû.',
    turkish:
      'Sizin en hayırlınız Kur’an’ı öğrenen ve onu başkalarına öğretendir.',
    narrator: 'Hz. Osman b. Affân (r.a.)',
    remiz: '(خ. د. ت. ه. عن عثمان)',
    sourceDetail: 'Buhârî, Fedâilü’l-Kur’ân, 21 (5027); Tirmizî; Ebû Dâvud; İbn Mâce',
  },
  {
    id: 're-selam-ifsa',
    letterGroup: 'Elif (أ) Harfi',
    ramuzRef: 'RE. Kardeşlik ve Selâm',
    arabic:
      'أَفْشُوا السَّلَامَ، وَأَطْعِمُوا الطَّعَامَ، وَصِلُوا الْأَرْحَامَ، وَصَلُّوا بِاللَّيْلِ وَالنَّاسُ نِيَامٌ، تَدْخُلُوا الْجَنَّةَ بِسَلَامٍ',
    transliteration:
      'Efşü’s-selâme ve et’ımü’t-taâme ve sılü’l-erhâme ve sallû bi’l-leyli ve’n-nâsü niyâm, tedhulü’l-cennete bi-selâm.',
    turkish:
      'Aranızda selâmı yayın, yemek yedirin, akraba bağlarını gözetin ve insanlar uykudayken geceleyin namaz kılın ki selâmetle cennete giresiniz.',
    narrator: 'Abdullah b. Selâm (r.a.)',
    remiz: '(حم. ت. ه. ك. عن عبد الله بن سلام)',
    sourceDetail: 'Tirmizî, Sıfatü’l-Kıyâme, 42 (2485); İbn Mâce; Hâkim, el-Müstedrek',
    lessonVolume: 2,
    lessonPage: 36,
  },
  {
    id: 're-semail',
    letterGroup: 'Bölüm II · Şemâil-i Şerîfe',
    ramuzRef: 'RE. II. Bölüm (Şemâil) · Ahlâk-ı Nebevî',
    arabic:
      'كَانَ خُلُقُهُ الْقُرْآنَ',
    transliteration:
      'Kâne huluku’l-Kur’ân.',
    turkish:
      'Rasûlüllah’ın (s.a.v.) ahlâkı Kur’an’ın ta kendisi idi (Kur’an’ın hoşnut olduğu şeylere rıza gösterir, sakındırdıklarına öfkelenirdi).',
    narrator: 'Hz. Âişe (r.anhâ)',
    remiz: '(حم. م. د. ن. عن عائشة)',
    sourceDetail: 'Müslim, Salâtü’l-Müsâfirîn, 139 (746); Ahmed b. Hanbel, Müsned; Ebû Dâvud; Nesâî',
  },
];

let cachedRamuzPromise: Promise<RamuzDataset> | null = null;

export function fetchRamuzDataset(signal?: AbortSignal): Promise<RamuzDataset> {
  if (!cachedRamuzPromise) {
    const url = new URL('data/ramuz-el-hadis.json', window.location.href).toString();
    cachedRamuzPromise = fetch(url, { signal })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        return res.json() as Promise<RamuzDataset>;
      })
      .catch((err) => {
        cachedRamuzPromise = null;
        throw err;
      });
  }
  return cachedRamuzPromise;
}
