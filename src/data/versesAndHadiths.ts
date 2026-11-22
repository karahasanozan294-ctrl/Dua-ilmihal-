export interface AyetItem {
  id: number;
  arabic: string;
  turkish: string;
  reference: string;
  topic: string;
}

export interface HadisItem {
  id: number;
  textTr: string;
  source: string;
  topic: string;
}

export const AYET_COLLECTION: AyetItem[] = [
  {
    id: 1,
    arabic: 'فَٱذْكُرُونِىٓ أَذْكُرْكُمْ وَٱشْكُرُوا۟ لِى وَلَا تَكْفُرُونِ',
    turkish: 'Öyleyse siz beni (ibadetle) anın ki ben de sizi anayım. Bana şükredin; sakın bana nankörlük etmeyin!',
    reference: 'Bakara Suresi, 152. Ayet',
    topic: 'Zikir ve Şükür',
  },
  {
    id: 2,
    arabic: 'إِنَّ ٱلصَّلَوٰةَ تَنْهَىٰ عَنِ ٱلْفَحْشَآءِ وَٱلْمُنكَرِ',
    turkish: 'Muhakkak ki namaz, hayâsızlıktan ve kötülükten alıkoyar.',
    reference: 'Ankebût Suresi, 45. Ayet',
    topic: 'Namaz',
  },
  {
    id: 3,
    arabic: 'فَإِنَّ مَعَ ٱلْعُسْرِ يُسْرًا ۝ إِنَّ مَعَ ٱلْعُسْرِ يُسْرًا',
    turkish: 'Şüphesiz güçlükle beraber bir kolaylık vardır. Gerçekten, güçlükle beraber bir kolaylık vardır.',
    reference: 'İnşirâh Suresi, 5-6. Ayetler',
    topic: 'Sabır ve Ümit',
  },
  {
    id: 4,
    arabic: 'وَهُوَ مَعَكُمْ أَيْنَ مَا كُنتُمْ ۚ وَٱللَّهُ بِمَا تَعْمَلُونَ بَصِيرٌ',
    turkish: 'Nerede olursanız olun, O sizinle beraberdir. Allah, yaptıklarınızı hakkıyla görendir.',
    reference: 'Hadîd Suresi, 4. Ayet',
    topic: 'Tevekkül',
  },
  {
    id: 5,
    arabic: 'أَلَا بِذِكْرِ ٱللَّهِ تَطْمَئِنُّ ٱلْقُلُوبُ',
    turkish: 'Bilesiniz ki kalpler ancak Allah’ı anmakla huzur bulur.',
    reference: 'Ra’d Suresi, 28. Ayet',
    topic: 'Kalp Huzuru',
  },
  {
    id: 6,
    arabic: 'لَا يُكَلِّفُ ٱللَّهُ نَفْسًا إِلَّا وُسْعَهَا',
    turkish: 'Allah hiç kimseye gücünün yeteceğinden fazlasını yüklemez.',
    reference: 'Bakara Suresi, 286. Ayet',
    topic: 'Rahmet',
  },
  {
    id: 7,
    arabic: 'رَبَّنَآ ءَاتِنَا فِى ٱلدُّنْيَا حَسَنَةً وَفِى ٱلْءَاخِرَةِ حَسَنَةً وَقِنَا عَذَابَ ٱلنَّارِ',
    turkish: 'Rabbimiz! Bize dünyada da iyilik ver, ahirette de iyilik ver ve bizi ateş azabından koru.',
    reference: 'Bakara Suresi, 201. Ayet',
    topic: 'Dua',
  },
  {
    id: 8,
    arabic: 'وَقُولُوا۟ لِلنَّاسِ حُسْنًا وَأَقِيمُوا۟ ٱلصَّلَوٰةَ وَءَاتُوا۟ ٱلزَّكَوٰةَ',
    turkish: 'İnsanlara güzel söz söyleyin, namazı dosdoğru kılın, zekâtı verin.',
    reference: 'Bakara Suresi, 83. Ayet',
    topic: 'Güzel Ahlak',
  },
  {
    id: 9,
    arabic: 'إِنَّ ٱللَّهَ يَأْمُرُ بِٱلْعَدْلِ وَٱلْإِحْسَٰنِ وَإِيتَآئِ ذِى ٱلْقُرْبَىٰ',
    turkish: 'Şüphesiz Allah adaleti, iyilik yapmayı ve yakınlara yardım etmeyi emreder.',
    reference: 'Nahl Suresi, 90. Ayet',
    topic: 'Adalet ve İhsan',
  },
  {
    id: 10,
    arabic: 'وَٱسْتَعِينُوا۟ بِٱلصَّبْرِ وَٱلصَّلَوٰةِ ۚ إِنَّ ٱللَّهَ مَعَ ٱلصَّٰبِرِينَ',
    turkish: 'Sabır ve namazla yardım dileyin. Şüphesiz Allah sabredenlerle beraberdir.',
    reference: 'Bakara Suresi, 153. Ayet',
    topic: 'Namaz ve Sabır',
  },
  {
    id: 11,
    arabic: 'لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ',
    turkish: 'Eğer şükrederseniz, elbette size (nimetimi) artırırım.',
    reference: 'İbrâhîm Suresi, 7. Ayet',
    topic: 'Şükür',
  },
  {
    id: 12,
    arabic: 'وَمَن يَتَوَكَّلْ عَلَى ٱللَّهِ فَهُوَ حَسْبُهُۥ',
    turkish: 'Kim Allah’a tevekkül ederse, O kendisine yeter.',
    reference: 'Talâk Suresi, 3. Ayet',
    topic: 'Tevekkül',
  },
  {
    id: 13,
    arabic: 'إِنَّ أَكْرَمَكُمْ عِندَ ٱللَّهِ أَتْقَىٰكُمْ',
    turkish: 'Şüphesiz Allah katında en değerli olanınız, O’na karşı gelmekten en çok sakınanızdır.',
    reference: 'Hucurât Suresi, 13. Ayet',
    topic: 'Takva',
  },
  {
    id: 14,
    arabic: 'وَقُل رَّبِّ زِدْنِى عِلْمًا',
    turkish: 'Ve de ki: Rabbim, ilmimi artır!',
    reference: 'Tâhâ Suresi, 114. Ayet',
    topic: 'İlim',
  },
];

export const HADIS_COLLECTION: HadisItem[] = [
  {
    id: 1,
    textTr: 'Ameller niyetlere göredir. Herkese ancak niyet ettiği şey vardır.',
    source: 'Buhârî, Bed’ü’l-Vahy, 1; Müslim, İmâre, 155',
    topic: 'Niyet ve İhlas',
  },
  {
    id: 2,
    textTr: 'Sizin en hayırlınız, Kur’an’ı öğrenen ve öğreteninizdir.',
    source: 'Buhârî, Fedâilü’l-Kur’ân, 21',
    topic: 'Kur’an-ı Kerim',
  },
  {
    id: 3,
    textTr: 'Kulun Rabbine en yakın olduğu an secde halidir; o hâlde iken çokça dua edin.',
    source: 'Müslim, Salât, 215',
    topic: 'Namaz ve Dua',
  },
  {
    id: 4,
    textTr: 'Kolaylaştırınız, zorlaştırmayınız; müjdeleyiniz, nefret ettirmeyiniz.',
    source: 'Buhârî, İlim, 11; Müslim, Cihâd, 6',
    topic: 'Rahmet ve Kolaylık',
  },
  {
    id: 5,
    textTr: 'İnsanlara merhamet etmeyene Allah da merhamet etmez.',
    source: 'Buhârî, Tevhîd, 2; Müslim, Fedâil, 66',
    topic: 'Merhamet',
  },
  {
    id: 6,
    textTr: 'Mümin, kendisiyle ülfet edilen (iyi geçinilen) kimsedir. İnsanlarla iyi geçinmeyen ve kendisiyle geçinilmeyen kimsede hayır yoktur.',
    source: 'Ahmed b. Hanbel, Müsned, II, 400',
    topic: 'Güzel Ahlak',
  },
  {
    id: 7,
    textTr: 'Müslüman, elinden ve dilinden diğer Müslümanların güven içinde olduğu kimsedir.',
    source: 'Buhârî, Îmân, 4; Müslim, Îmân, 64',
    topic: 'Kardeşlik',
  },
  {
    id: 8,
    textTr: 'Güzel söz sadakadır.',
    source: 'Buhârî, Edeb, 34; Müslim, Zekât, 56',
    topic: 'Sadaka ve Ahlak',
  },
  {
    id: 9,
    textTr: 'Beş vakit namaz, birinizin kapısının önünden akıp giden ve her gün içinde beş defa yıkandığı bol sulu bir ırmağa benzer.',
    source: 'Buhârî, Mevâkît, 6; Müslim, Mesâcid, 283',
    topic: 'Namaz',
  },
  {
    id: 10,
    textTr: 'Müminin durumu ne hoştur! Her hâli kendisi için hayırlıdır: Sevinecek bir şeyle karşılaşırsa şükreder, bu onun için hayır olur; başına bir sıkıntı gelirse sabreder, bu da onun için hayır olur.',
    source: 'Müslim, Zühd, 64',
    topic: 'Şükür ve Sabır',
  },
  {
    id: 11,
    textTr: 'Kim Allah’a ve ahiret gününe iman ediyorsa ya hayır söylesin ya da sussun.',
    source: 'Buhârî, Edeb, 31; Müslim, Îmân, 74',
    topic: 'Söz Ahlakı',
  },
  {
    id: 12,
    textTr: 'Temizlik imanın yarısıdır.',
    source: 'Müslim, Tahâret, 1',
    topic: 'Temizlik',
  },
  {
    id: 13,
    textTr: 'Kişi sevdiği ile beraberdir.',
    source: 'Buhârî, Edeb, 96; Müslim, Birr, 165',
    topic: 'Muhabbet',
  },
  {
    id: 14,
    textTr: 'Veren el, alan elden hayırlıdır.',
    source: 'Buhârî, Zekât, 18; Müslim, Zekât, 94',
    topic: 'Cömertlik',
  },
];

export function getDayOfYearIndex(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / (24 * 60 * 60 * 1000));
}
