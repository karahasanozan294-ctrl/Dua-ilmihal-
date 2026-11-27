export interface RiyazHadithEntry {
  hadithNo: number;
  arabic: string;
  turkish: string;
  narrator: string;
  source: string;
  explanation: string;
}

export interface RiyazBabChapter {
  id: string;
  babNo: number;
  title: string;
  verseRef?: string;
  verseText?: string;
  hadiths: RiyazHadithEntry[];
}

export interface RiyazFullHadith {
  n: number;
  a: string;
  t: string;
  b: number;
}

export interface RiyazFullBook {
  id: number;
  titleTr: string;
  titleAr: string;
  start: number;
  end: number;
}

export interface RiyazFullDataset {
  books: RiyazFullBook[];
  hadiths: RiyazFullHadith[];
}

export const RIYAZ_BOOK_META = {
  title: 'Riyâzu’s-Sâlihîn',
  subtitle: 'Tercüme ve Açıklaması · Rasûlullah (s.a.v.)’den Hayat Ölçüleri',
  author: 'İmâm Nevevî (Ebû Zekeriyyâ Yahyâ b. Şeref en-Nevevî)',
  preparedBy: 'Abdulhâdî b. Saîd el-Bustânî · Ziyâd b. Muhammed Muhammed',
  translators: 'Ahmet İhsan Dündar · Abdullah Öztürk',
  publisher: 'Darussalam',
  totalBooks: 20,
  totalHadiths: 1900,
  coverImagePath:
    `${import.meta.env.BASE_URL}assets/aistudio/17953262245936383038996986437604_519c3f47.jpg`,
};

export const MUKADDIMAT_MILESTONES: { hadithNo: number; label: string }[] = [
  { hadithNo: 1, label: '1. İhlâs & Niyet' },
  { hadithNo: 13, label: '13. Tövbe' },
  { hadithNo: 25, label: '25. Sabır' },
  { hadithNo: 54, label: '54. Doğruluk & Takvâ' },
  { hadithNo: 73, label: '73. Tevekkül & İstikâmet' },
  { hadithNo: 141, label: '141. Sünnete Bağlılık' },
  { hadithNo: 224, label: '224. Merhamet & Kardeşlik' },
  { hadithNo: 304, label: '304. Komşuluk & Sıla-i Rahim' },
  { hadithNo: 455, label: '455. Zühd & Cömertlik' },
  { hadithNo: 602, label: '602. Tevâzu & Hilm' },
];

export const RIYAZ_CHAPTERS: RiyazBabChapter[] = [
  {
    id: 'ihlas-niyet',
    babNo: 1,
    title: 'İhlâs ve Bütün İşlerde Niyeti Düzeltmek',
    verseRef: 'Beyyine Suresi, 5',
    verseText:
      '“Hâlbuki onlara, ancak dini Allah’a has kılarak, hakka yönelen kimseler olarak O’na kulluk etmeleri, namazı kılmaları ve zekâtı vermeleri emredilmişti. İşte dosdoğru din budur.”',
    hadiths: [
      {
        hadithNo: 1,
        arabic:
          'إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى، فَمَنْ كَانَتْ هِجْرَتُهُ إِلَى اللهِ وَرَسُولِهِ فَهِجْرَتُهُ إِلَى اللهِ وَرَسُولِهِ، وَمَنْ كَانَتْ هِجْرَتُهُ لِدُنْيَا يُصِيبُهَا أَوْ امْرَأَةٍ يَنْكِحُهَا فَهِجْرَتُهُ إِلَى مَا هَاجَرَ إِلَيْهِ',
        turkish:
          'Ameller ancak niyetlere göre değer kazanır. Herkese niyet ettiği şeyin karşılığı vardır. Kimin hicreti Allah’a ve Resûlüne ise, onun hicreti Allah’a ve Resûlünedir. Kimin hicreti de elde edeceği bir dünyalığa veya evleneceği bir kadına ise, onun hicreti de hicret ettiği şeyedir.',
        narrator: 'Hz. Ömer b. Hattâb (r.a.)',
        source: 'Buhârî, Bed’ü’l-Vahy, 1; Müslim, İmâre, 155',
        explanation:
          'Hayat Ölçüsü: İbadet ile âdeti birbirinden ayıran temel ölçü niyettir. Müslüman günlük işlerini dahi Allah rızası niyetiyle yaptığında ibadet sevabı kazanır; gösteriş ve menfaat niyeti ise salih ameli boşa çıkarır.',
      },
      {
        hadithNo: 7,
        arabic:
          'إِنَّ اللهَ لاَ يَنْظُرُ إِلَى أَجْسَامِكُمْ، وَلاَ إِلَى صُوَرِكُمْ، وَلَكِنْ يَنْظُرُ إِلَى قُلُوبِكُمْ',
        turkish:
          'Şüphesiz Allah sizin bedenlerinize ve dış görünüşlerinize değil, kalplerinize (ve niyetlerinize) bakar.',
        narrator: 'Ebû Hüreyre (r.a.)',
        source: 'Müslim, Birr, 33',
        explanation:
          'Hayat Ölçüsü: Allah katındaki değer, maddi görünüm, makam veya zenginlikle değil; kalbin temizliği, ihlası ve takvasıyla ölçülür.',
      },
    ],
  },
  {
    id: 'tovbe',
    babNo: 2,
    title: 'Tövbe ve Allah’a Dönüş',
    verseRef: 'Tahrîm Suresi, 8',
    verseText:
      '“Ey iman edenler! Allah’a içtenlikle (nasûh bir tövbe ile) tövbe edin.”',
    hadiths: [
      {
        hadithNo: 13,
        arabic:
          'وَاللَّهِ إِنِّي لَأَسْتَغْفِرُ اللهَ وَأَتُوبُ إِلَيْهِ فِي الْيَوْمِ أَكْثَرَ مِنْ سَبْعِينَ مَرَّةً',
        turkish:
          'Allah’a yemin ederim ki ben günde yetmiş defadan fazla Allah’tan bağışlanma diler ve O’na tövbe ederim.',
        narrator: 'Ebû Hüreyre (r.a.)',
        source: 'Buhârî, Daavât, 3',
        explanation:
          'Hayat Ölçüsü: Günahlardan korunmuş olan Peygamber Efendimiz (s.a.v.) dahi günde onlarca kez istiğfar ediyorsa, mümin ümitsizliğe kapılmadan sürekli tövbe ve yenilenme hâlinde olmalıdır.',
      },
      {
        hadithNo: 19,
        arabic:
          'إِنَّ اللهَ تَعَالَى يَبْسُطُ يَدَهُ بِاللَّيْلِ لِيَتُوبَ مُسِيءُ النَّهَارِ، وَيَبْسُطُ يَدَهُ بِالنَّهَارِ لِيَتُوبَ مُسِيءُ اللَّيْلِ، حَتَّى تَطْلُعَ الشَّمْسُ مِنْ مَغْرِبِهَا',
        turkish:
          'Şüphesiz Allah Teâlâ, gündüzün günah işleyen tövbe etsin diye geceleyin rahmet elini açar; geceleyin günah işleyen tövbe etsin diye de gündüzün rahmet elini açar. Güneş batıdan doğuncaya (kıyamet alâmeti belirinceye) kadar bu böyle devam eder.',
        narrator: 'Ebû Mûsâ el-Eş’arî (r.a.)',
        source: 'Müslim, Tevbe, 31',
        explanation:
          'Hayat Ölçüsü: Tövbe kapısı hayat boyu açıktır. Gerçek tövbe; günahı terk etmek, pişmanlık duymak ve bir daha dönmemeye azmetmektir; kul hakkı varsa helalleşmeyi de gerektirir.',
      },
    ],
  },
  {
    id: 'sabir',
    babNo: 3,
    title: 'Sabır ve Metanet',
    verseRef: 'Bakara Suresi, 153',
    verseText:
      '“Ey iman edenler! Sabır ve namazla Allah’tan yardım isteyin. Şüphesiz Allah sabredenlerle beraberdir.”',
    hadiths: [
      {
        hadithNo: 27,
        arabic:
          'عَجَبًا لِأَمْرِ الْمُؤْمِنِ إِنَّ أَمْرَهُ كُلَّهُ خَيْرٌ، وَلَيْسَ ذَاكَ لِأَحَدٍ إِلَّا لِلْمُؤْمِنِ؛ إِنْ أَصَابَتْهُ سَرَّاءُ شَكَرَ فَكَانَ خَيْرًا لَهُ، وَإِنْ أَصَابَتْهُ ضَرَّاءُ صَبَرَ فَكَانَ خَيْرًا لَهُ',
        turkish:
          'Müminin durumu ne hayranlık vericidir! Onun her hâli kendisi için hayırdır; bu durum yalnız mümine mahsustur: Başına sevinçli bir hâl gelirse şükreder, bu onun için hayır olur; başına bir sıkıntı gelirse sabreder, bu da onun için hayır olur.',
        narrator: 'Suheyb b. Sinân (r.a.)',
        source: 'Müslim, Zühd, 64',
        explanation:
          'Hayat Ölçüsü: İman, hayatın hem bolluk hem darlık zamanlarında kalbi dengede tutar. Şükür nimeti artırır, sabır ise musibeti derece ve ecre dönüştürür.',
      },
      {
        hadithNo: 31,
        arabic: 'إِنَّمَا الصَّبْرُ عِنْدَ الصَّدْمَةِ الْأُولَى',
        turkish:
          'Gerçek sabır, musibetle ilk karşılaşıldığı anda gösterilen sabırdır.',
        narrator: 'Enes b. Mâlik (r.a.)',
        source: 'Buhârî, Cenâiz, 32; Müslim, Cenâiz, 15',
        explanation:
          'Hayat Ölçüsü: Zaman geçtikçe herkes ister istemez alışır; asıl fazilet, acının ve şokun ilk anında isyan sözü söylemeyip Allah’a teslim olabilmektir.',
      },
      {
        hadithNo: 46,
        arabic:
          'لَيْسَ الشَّدِيدُ بِالصُّرَعَةِ، إِنَّمَا الشَّدِيدُ الَّذِي يَمْلِكُ نَفْسَهُ عِنْدَ الْغَضَبِ',
        turkish:
          'Gerçek pehlivan, güreşte rakibini yenen değil; öfkelendiği anda nefsine hâkim olabilen kimsedir.',
        narrator: 'Ebû Hüreyre (r.a.)',
        source: 'Buhârî, Edeb, 76; Müslim, Birr, 107',
        explanation:
          'Hayat Ölçüsü: Gerçek güç dışa karşı sertlikte değil, iç dünyadaki öfke ve nefis kontrolündedir. Öfke anında susmak, abdest almak veya mekân değiştirmek nebevi bir tedbirdir.',
      },
    ],
  },
  {
    id: 'dogruluk',
    babNo: 4,
    title: 'Doğruluk (Sıdk) ve Güvenilirlik',
    verseRef: 'Tevbe Suresi, 119',
    verseText: '“Ey iman edenler! Allah’tan korkun ve doğrularla beraber olun.”',
    hadiths: [
      {
        hadithNo: 55,
        arabic:
          'عَلَيْكُمْ بِالصِّدْقِ، فَإِنَّ الصِّدْقَ يَهْدِي إِلَى الْبِرِّ، وَإِنَّ الْبِرَّ يَهْدِي إِلَى الْجَنَّةِ، وَمَا يَزَالُ الرَّجُلُ يَصْدُقُ وَيَتَحَرَّى الصِّدْقَ حَتَّى يُكْتَبَ عِنْدَ اللهِ صِدِّيقًا',
        turkish:
          'Doğruluktan ayrılmayın. Çünkü doğruluk iyiliğe, iyilik de cennete götürür. Kişi doğru söyleye söyleye ve doğruyu araştıra araştıra Allah katında sıddîk (dosdoğru) olarak yazılır.',
        narrator: 'Abdullah b. Mes’ûd (r.a.)',
        source: 'Buhârî, Edeb, 69; Müslim, Birr, 103',
        explanation:
          'Hayat Ölçüsü: Doğruluk yalnızca sözde yalan söylememek değil; ticarette, sözleşmede, niyette ve davranışta tutarlı ve dürüst olmaktır.',
      },
    ],
  },
  {
    id: 'takva-murakabe',
    babNo: 5,
    title: 'Murâkabe ve Takvâ',
    verseRef: 'Hadîd Suresi, 4',
    verseText: '“Nerede olursanız olun, O sizinle beraberdir.”',
    hadiths: [
      {
        hadithNo: 62,
        arabic:
          'اِتَّقِ اللهَ حَيْثُمَا كُنْتَ، وَأَتْبِعِ السَّيِّئَةَ الْحَسَنَةَ تَمْحُهَا، وَخَالِقِ النَّاسَ بِخُلُقٍ حَسَنٍ',
        turkish:
          'Nerede olursan ol Allah’tan sakın (takva üzere ol). Kötülüğün hemen ardından bir iyilik yap ki onu silsin. İnsanlara da güzel ahlâk ile muamele et.',
        narrator: 'Ebû Zer ve Muâz b. Cebel (r.a.)',
        source: 'Tirmizî, Birr, 55',
        explanation:
          'Hayat Ölçüsü: Bu hadis üç temel hayat prensibini özetler: Yalnızken de toplum içindeyken de Allah bilinci; hata sonrası hemen salih amel ile telafi; ve insanlarla güzel geçim.',
      },
    ],
  },
  {
    id: 'guzel-ahlak',
    babNo: 6,
    title: 'Güzel Ahlâk, Merhamet ve Komşuluk Hakları',
    verseRef: 'Kalem Suresi, 4',
    verseText: '“Şüphesiz sen yüce bir ahlâk üzeresin.”',
    hadiths: [
      {
        hadithNo: 224,
        arabic:
          'الرَّاحِمُونَ يَرْحَمُهُمُ الرَّحْمَنُ، ارْحَمُوا مَنْ فِي الْأَرْضِ يَرْحَمْكُمْ مَنْ فِي السَّمَاءِ',
        turkish:
          'Merhamet edenlere Rahmân olan Allah da merhamet eder. Siz yeryüzündekilere merhamet edin ki gökyüzündekiler de size merhamet etsin.',
        narrator: 'Abdullah b. Amr (r.a.)',
        source: 'Ebû Dâvûd, Edeb, 58; Tirmizî, Birr, 16',
        explanation:
          'Hayat Ölçüsü: İslam’da merhamet bütün insanları ve hatta hayvanları, tabiatı kuşatır. Kalbinde şefkat taşımayan kimse ilahi rahmetten uzaklaşır.',
      },
      {
        hadithNo: 304,
        arabic:
          'مَنْ كَانَ يُؤْمِنُ بِاللهِ وَالْيَوْمِ الْآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ',
        turkish:
          'Kim Allah’a ve ahiret gününe iman ediyorsa ya hayır söylesin ya da sussun. Komşusuna ve misafirine ikram etsin.',
        narrator: 'Ebû Hüreyre (r.a.)',
        source: 'Buhârî, Edeb, 31; Müslim, Îmân, 74',
        explanation:
          'Hayat Ölçüsü: İman sadece kalpte saklı bir kabul değil; dile hâkimiyet, komşuya iyilik ve misafire cömertlik olarak sosyal hayata yansıyan bir sorumluluktur.',
      },
      {
        hadithNo: 626,
        arabic:
          'إِنَّ مِنْ أَحَبِّكُمْ إِلَيَّ وَأَقْرَبِكُمْ مِنِّي مَجْلِسًا يَوْمَ الْقِيَامَةِ أَحَاسِنَكُمْ أَخْلَاقًا',
        turkish:
          'Şüphesiz kıyamet gününde bana en sevimli olanınız ve meclisime en yakın bulunacak olanınız, ahlâkı en güzel olanınızdır.',
        narrator: 'Câbir b. Abdullah (r.a.)',
        source: 'Tirmizî, Birr, 71',
        explanation:
          'Hayat Ölçüsü: Nafile ibadetlerin yanında güler yüz, yumuşak söz, alçakgönüllülük ve hakkaniyet insanı Resûlullah’a (s.a.v.) komşu kılar.',
      },
    ],
  },
  {
    id: 'namaz-kurani-kerim',
    babNo: 7,
    title: 'Namazın Fazileti ve Kur’an-ı Kerim Okuma Adabı',
    verseRef: 'Ankebût Suresi, 45',
    verseText: '“Muhakkak ki namaz, hayâsızlıktan ve kötülükten alıkoyar.”',
    hadiths: [
      {
        hadithNo: 993,
        arabic: 'خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ',
        turkish: 'Sizin en hayırlınız, Kur’an’ı öğrenen ve öğreteninizdir.',
        narrator: 'Hz. Osman b. Affân (r.a.)',
        source: 'Buhârî, Fedâilü’l-Kur’ân, 21',
        explanation:
          'Hayat Ölçüsü: Kur’an’ı yalnızca yüzünden okumakla kalmayıp manasını anlamak, yaşamak ve gelecek nesillere aktarmak müminin en şerefli meşguliyetidir.',
      },
      {
        hadithNo: 1041,
        arabic:
          'أَرَأَيْتُمْ لَوْ أَنَّ نَهْرًا بِبَابِ أَحَدِكُمْ يَغْتَسِلُ فِيهِ كُلَّ يَوْمٍ خَمْسَ مَرَّاتٍ',
        turkish:
          'Birinizin kapısının önünden bir nehir aksa da her gün beş defa yıkansa kirden bir şey kalır mı? İşte beş vakit namaz da böyledir; Allah o namazlarla günahları siler.',
        narrator: 'Ebû Hüreyre (r.a.)',
        source: 'Buhârî, Mevâkît, 6; Müslim, Mesâcid, 283',
        explanation:
          'Hayat Ölçüsü: Vakitlerinde ve huşu ile kılınan beş vakit namaz, günlük hayatın manevi kirlerini temizleyen ilahi bir arınma kaynağıdır.',
      },
    ],
  },
  {
    id: 'zikir-dua',
    babNo: 8,
    title: 'Zikir, Dua ve Salavat-ı Şerife',
    verseRef: 'Bakara Suresi, 152',
    verseText: '“Öyleyse siz beni anın ki ben de sizi anayım.”',
    hadiths: [
      {
        hadithNo: 1411,
        arabic:
          'كَلِمَتَانِ خَفِيفَتَانِ عَلَى اللِّسَانِ، ثَقِيلَتَانِ فِي الْمِيزَانِ، حَبِيبَتَانِ إِلَى الرَّحْمَنِ: سُبْحَانَ اللهِ وَبِحَمْدِهِ، سُبْحَانَ اللهِ الْعَظِيمِ',
        turkish:
          'Dile hafif, terazide ağır, Rahmân’a çok sevgili iki cümle vardır: “Sübhânallâhi ve bi-hamdihî, Sübhânallâhi’l-azîm.”',
        narrator: 'Ebû Hüreyre (r.a.)',
        source: 'Buhârî, Daavât, 65; Müslim, Zikir, 31',
        explanation:
          'Hayat Ölçüsü: Mümin yürürken, beklerken veya çalışırken dilini bu kısa ama manası derin tesbihlerle meşgul ederek kalbini diri tutabilir.',
      },
      {
        hadithNo: 1400,
        arabic: 'مَنْ صَلَّى عَلَيَّ صَلَاةً صَلَّى اللهُ عَلَيْهِ بِهَا عَشْرًا',
        turkish:
          'Kim bana bir defa salât-u selâm getirirse, Allah o kimseye bunun karşılığında on rahmet ihsan eder.',
        narrator: 'Ebû Hüreyre (r.a.)',
        source: 'Müslim, Salât, 70',
        explanation:
          'Hayat Ölçüsü: Özellikle Cuma günleri ve duaların başında-sonunda Efendimiz’e (s.a.v.) salavat getirmek, duaların kabulüne vesile olan en bereketli zikirdir.',
      },
    ],
  },
];

export const RIYAZ_COMMENTARY_BY_HADITH: Record<number, string> = (() => {
  const map: Record<number, string> = {};
  for (const ch of RIYAZ_CHAPTERS) {
    for (const h of ch.hadiths) {
      map[h.hadithNo] = h.explanation;
    }
  }
  return map;
})();

let cachedDataset: RiyazFullDataset | null = null;

export async function fetchFullRiyazusSalihin(
  signal?: AbortSignal
): Promise<RiyazFullDataset> {
  if (cachedDataset) {
    return cachedDataset;
  }

  const response = await fetch(
    `${import.meta.env.BASE_URL}data/riyazus-salihin-full.json`,
    { signal }
  );
  if (!response.ok) {
    throw new Error('Riyâzu’s-Sâlihîn tam metin verisi yüklenemedi.');
  }

  const parsed = (await response.json()) as RiyazFullDataset;
  if (!parsed || !Array.isArray(parsed.hadiths) || !Array.isArray(parsed.books)) {
    throw new Error('Veri biçimi geçersiz.');
  }

  cachedDataset = parsed;
  return parsed;
}
