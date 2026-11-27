export type SahihBookCollectionId = 'bukhari' | 'muslim';

export interface SahihHadithEntry {
  n: number;
  b: number;
  a: string;
  t: string;
}

export interface SahihBookSection {
  id: number;
  titleTr: string;
  titleAr: string;
  start: number;
  end: number;
  count: number;
}

export interface SahihFullDataset {
  books: SahihBookSection[];
  hadiths: SahihHadithEntry[];
}

export interface SahihBookMeta {
  id: SahihBookCollectionId;
  shortTitle: string;
  fullTitle: string;
  author: string;
  subtitle: string;
  description: string;
  totalBooks: number;
  totalHadiths: number;
  dataUrl: string;
}

export const SAHIHAYN_META: Record<SahihBookCollectionId, SahihBookMeta> = {
  bukhari: {
    id: 'bukhari',
    shortTitle: 'Sahîh-i Buhârî',
    fullTitle: 'el-Câmiu’s-Sahîh — Sahîh-i Buhârî',
    author: 'İmâm Ebû Abdillâh Muhammed b. İsmâîl el-Buhârî (ö. 256/870)',
    subtitle: 'Kur’an-ı Kerim’den Sonra En Sahih Kabul Edilen Hadis Külliyatı',
    description:
      'Buhârâlı İmâm Buhârî’nin 16 yılda titizlikle derlediği; 97 ana kitâb ve 7.583 hadis-i şeriften oluşan tam külliyat.',
    totalBooks: 97,
    totalHadiths: 7583,
    dataUrl: `${import.meta.env.BASE_URL}data/sahih-buhari-full.json`,
  },
  muslim: {
    id: 'muslim',
    shortTitle: 'Sahîh-i Müslim',
    fullTitle: 'el-Câmiu’s-Sahîh — Sahîh-i Müslim',
    author: 'İmâm Ebü’l-Hüseyn Müslim b. el-Haccâc el-Kuşeyrî (ö. 261/875)',
    subtitle: 'Sened Zinciri ve Konu Tertibiyle Meşhur Sahîh Hadis Külliyatı',
    description:
      'Nîşâburlu İmâm Müslim’in meşhur Mukaddime’siyle birlikte 57 kitâb ve 7.466 hadis-i şeriften oluşan tam külliyat.',
    totalBooks: 57,
    totalHadiths: 7466,
    dataUrl: `${import.meta.env.BASE_URL}data/sahih-muslim-full.json`,
  },
};

export interface MuttefekunHadithItem {
  id: string;
  topic: string;
  arabic: string;
  turkish: string;
  narrator: string;
  bukhariNo: number;
  muslimNo: number;
  note: string;
}

export const SAHIHAYN_MUTTEFEKUN_ALEYH: MuttefekunHadithItem[] = [
  {
    id: 'ma-niyet',
    topic: 'İhlâs ve Niyet',
    arabic:
      'إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى، فَمَنْ كَانَتْ هِجْرَتُهُ إِلَى اللهِ وَرَسُولِهِ فَهِجْرَتُهُ إِلَى اللهِ وَرَسُولِهِ، وَمَنْ كَانَتْ هِجْرَتُهُ لِدُنْيَا يُصِيبُهَا أَوِ امْرَأَةٍ يَنْكِحُهَا فَهِجْرَتُهُ إِلَى مَا هَاجَرَ إِلَيْهِ',
    turkish:
      'Ameller ancak niyetlere göredir ve herkes için niyet ettiği şeyin karşılığı vardır. Kimin hicreti Allah’a ve Resûlü’ne ise, onun hicreti Allah’a ve Resûlü’nedir; kimin hicreti de elde edeceği bir dünyalığa veya evleneceği bir kadına ise, onun hicreti de hicret ettiği şeyedir.',
    narrator: 'Hz. Ömer b. Hattâb (r.a.)',
    bukhariNo: 1,
    muslimNo: 4927,
    note: 'İmâm Şâfiî ve Ahmed b. Hanbel’e göre İslam ilminin üçte birini teşkil eden temel hadis.',
  },
  {
    id: 'ma-islam-bes',
    topic: 'İslam’ın Beş Temeli',
    arabic:
      'بُنِيَ الإِسْلَامُ عَلَى خَمْسٍ: شَهَادَةِ أَنْ لَا إِلَهَ إِلَّا اللهُ وَأَنَّ مُحَمَّدًا رَسُولُ اللهِ، وَإِقَامِ الصَّلَاةِ، وَإِيتَاءِ الزَّكَاةِ، وَالْحَجِّ، وَصَوْمِ رَمَضَانَ',
    turkish:
      'İslam beş temel üzerine bina edilmiştir: Allah’tan başka ilâh olmadığına ve Muhammed’in Allah’ın Resûlü olduğuna şahitlik etmek, namazı dosdoğru kılmak, zekâtı vermek, haccetmek ve Ramazan orucunu tutmak.',
    narrator: 'Abdullah b. Ömer (r.a.)',
    bukhariNo: 8,
    muslimNo: 111,
    note: 'Müslümanın kulluk hayatını ayakta tutan beş ana rüknü özlü biçimde bildirir.',
  },
  {
    id: 'ma-cibril',
    topic: 'İman, İslam ve İhsan (Cibrîl Hadisi)',
    arabic:
      'أَنْ تُؤْمِنَ بِاللهِ وَمَلَائِكَتِهِ وَكُتُبِهِ وَرُسُلِهِ وَالْيَوْمِ الْآخِرِ، وَتُؤْمِنَ بِالْقَدَرِ خَيْرِهِ وَشَرِّهِ',
    turkish:
      'İman; Allah’a, meleklerine, kitaplarına, peygamberlerine, ahiret gününe ve hayrı ile şerriyle kadere inanmandır. İhsan ise Allah’ı görüyormuşsun gibi ibadet etmendir; her ne kadar sen O’nu görmüyorsan da O seni görmektedir.',
    narrator: 'Ebû Hüreyre & Hz. Ömer (r.a.)',
    bukhariNo: 50,
    muslimNo: 97,
    note: 'Cebrâil (a.s.)’ın sahâbeye dinin özünü öğretmek üzere sorduğu meşhur sual ve cevap.',
  },
  {
    id: 'ma-kardeslik',
    topic: 'İman ve Kardeşlik Sevgisi',
    arabic:
      'لَا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لِأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ',
    turkish:
      'Sizden biriniz kendisi için arzu edip sevdiği hayrı, Müslüman kardeşi için de arzu edip sevmedikçe kâmil mânada iman etmiş olmaz.',
    narrator: 'Enes b. Mâlik (r.a.)',
    bukhariNo: 13,
    muslimNo: 170,
    note: 'İslam kardeşliğinin ölçüsünün empati, hasetten arınmak ve hayırseverlik olduğunu gösterir.',
  },
  {
    id: 'ma-helal-haram',
    topic: 'Şüpheli Şeylerden Sakınmak ve Kalp',
    arabic:
      'الْحَلَالُ بَيِّنٌ وَالْحَرَامُ بَيِّنٌ، وَبَيْنَهُمَا مُشْتَبِهَاتٌ لَا يَعْلَمُهَا كَثِيرٌ مِنَ النَّاسِ، فَمَنِ اتَّقَى الشُّبُهَاتِ اسْتَبْرَأَ لِدِينِهِ وَعِرْضِهِ',
    turkish:
      'Helâl bellidir, haram da bellidir. İkisinin arasında ise pek çok insanın bilmediği şüpheli şeyler vardır. Kim şüpheli şeylerden sakınırsa dinini ve namusunu korumuş olur. Dikkat edin, bedende bir et parçası vardır; o iyi olursa bütün beden iyi olur, bozulursa bütün beden bozulur. İşte o kalptir.',
    narrator: 'Nu’mân b. Beşîr (r.a.)',
    bukhariNo: 52,
    muslimNo: 4094,
    note: 'Fıkıhta vera, takvâ ve kalbî arınmanın ana düsturu sayılan hadis.',
  },
  {
    id: 'ma-komsu-soz',
    topic: 'Dil Âdâbı, Komşuluk ve Misafirperverlik',
    arabic:
      'مَنْ كَانَ يُؤْمِنُ بِاللهِ وَالْيَوْمِ الْآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ، وَمَنْ كَانَ يُؤْمِنُ بِاللهِ وَالْيَوْمِ الْآخِرِ فَلْيُكْرِمْ جَارَهُ، وَمَنْ كَانَ يُؤْمِنُ بِاللهِ وَالْيَوْمِ الْآخِرِ فَلْيُكْرِمْ ضَيْفَهُ',
    turkish:
      'Kim Allah’a ve ahiret gününe iman ediyorsa ya hayır söylesin ya da sussun. Kim Allah’a ve ahiret gününe iman ediyorsa komşusuna ikramda bulunsun. Kim Allah’a ve ahiret gününe iman ediyorsa misafirine ikram etsin.',
    narrator: 'Ebû Hüreyre (r.a.)',
    bukhariNo: 6018,
    muslimNo: 173,
    note: 'Sözün sorumluluğunu ve sosyal nezaketi doğrudan iman ile ilişkilendirir.',
  },
  {
    id: 'ma-ofke',
    topic: 'Nefse Hâkimiyet ve Öfke Kontrolü',
    arabic:
      'لَيْسَ الشَّدِيدُ بِالصُّرَعَةِ، إِنَّمَا الشَّدِيدُ الَّذِي يَمْلِكُ نَفْسَهُ عِنْدَ الْغَضَبِ',
    turkish:
      'Gerçek pehlivan güreşte rakibini yenen değildir; gerçek pehlivan, öfkelendiği anda nefsine hâkim olabilen kimsedir.',
    narrator: 'Ebû Hüreyre (r.a.)',
    bukhariNo: 6114,
    muslimNo: 6643,
    note: 'Manevî olgunluğun ve gerçek kuvvetin öfkeyi yutmakta olduğunu öğretir.',
  },
  {
    id: 'ma-zikir',
    topic: 'Mizânda Ağır Gelen İki Tesbih',
    arabic:
      'كَلِمَتَانِ خَفِيفَتَانِ عَلَى اللِّسَانِ، ثَقِيلَتَانِ فِي الْمِيزَانِ، حَبِيبَتَانِ إِلَى الرَّحْمَنِ: سُبْحَانَ اللهِ وَبِحَمْدِهِ، سُبْحَانَ اللهِ الْعَظِيمِ',
    turkish:
      'Dile hafif, mizanda (terazide) ağır ve Rahmân’a çok sevgili iki cümle vardır: “Sübhânallâhi ve bi-hamdihî, Sübhânallâhi’l-azîm.”',
    narrator: 'Ebû Hüreyre (r.a.)',
    bukhariNo: 6406,
    muslimNo: 6846,
    note: 'Sahîh-i Buhârî’nin son hadisi olarak da yer alan bu mübarek tesbih, dilin en kolay zikridir.',
  },
];

const cachedCollections: Partial<Record<SahihBookCollectionId, SahihFullDataset>> = {};

export async function fetchSahihCollection(
  collection: SahihBookCollectionId,
  signal?: AbortSignal
): Promise<SahihFullDataset> {
  const existing = cachedCollections[collection];
  if (existing) {
    return existing;
  }

  const meta = SAHIHAYN_META[collection];
  const response = await fetch(meta.dataUrl, { signal });
  if (!response.ok) {
    throw new Error(`${meta.shortTitle} tam metin verisi yüklenemedi.`);
  }

  const parsed = (await response.json()) as SahihFullDataset;
  if (!parsed || !Array.isArray(parsed.books) || !Array.isArray(parsed.hadiths)) {
    throw new Error(`${meta.shortTitle} veri biçimi geçersiz.`);
  }

  cachedCollections[collection] = parsed;
  return parsed;
}

export function stripArabicDiacritics(input: string): string {
  return input
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه');
}
