export interface IlmihalTopic {
  id: string;
  title: string;
  summary: string;
  details: string[];
  listTitle?: string;
  listItems?: string[];
  arabicText?: string;
  transliteration?: string;
  meaning?: string;
}

export interface IlmihalChapter {
  id: string;
  chapterNo: number;
  title: string;
  subtitle: string;
  intro: string;
  topics: IlmihalTopic[];
}

export const ILMIHAL_BOOK_META = {
  title: 'Muhtasar İlmihal',
  publisher: 'Fazilet Neşriyat',
  madhab: 'Hanefî Mezhebi Üzere Zarurî Dinî Bilgiler',
  subtitle:
    'İtikad, İbadet, Taharet, Namaz, Oruç, Zekât, Hac, Kurban, Ahlâk, Namaz Sure ve Duaları ile Dinî Sualler',
};

export const ILMIHAL_CHAPTERS: IlmihalChapter[] = [
  {
    id: 'onsoz-ve-iman-esaslari',
    chapterNo: 1,
    title: 'Önsöz, Dinimiz İslam ve İman Esasları',
    subtitle: 'Ehl-i Sünnet İtikadı · İmanın Altı Şartı · İmanı Koruma',
    intro:
      'Peygamber Efendimiz (s.a.v.) “İlim öğrenmek her Müslüman erkek ve kadın üzerine farzdır” buyurmuştur. Her Müslümanın dünya ve ahiret saadetini kazanabilmesi için önce doğru itikad ve iman esaslarını (Zarûrât-ı Dîniyye) öğrenmesi gerekir.',
    topics: [
      {
        id: 'onsoz-muhim-hatirlatma',
        title: 'Önsöz ve Mühim Hatırlatma',
        summary:
          'İlmihal; Müslümanların inanç, ibadet ve ahlâk ile ilgili öğrenmeleri gereken zaruri bilgileri bildiren ilimdir.',
        details: [
          'Bir Müslümanın temel dinî meseleleri kolayca belleyip hatırında tutabilmesine yardımcı olmak amacıyla Hanefî Mezhebi üzere tertip edilmiştir.',
          'Sure, ayet ve duaların Latin harfleriyle okunuşları yalnızca Kur’an harflerini henüz bilmeyenlerin ezberlemelerine yardımcı olmak içindir. Asıl doğru kıraat için mutlaka bir ehil hocadan veya tecvidli okuyuşla dinleyerek tashih edilmesi tavsiye edilir.',
          'Kitap ve metinlerde ayet-i kerime, hadis-i şerif ve mübarek isimler yer aldığı için hürmet ve edep üzere muhafaza edilmelidir.',
        ],
      },
      {
        id: 'din-ve-iman',
        title: 'Dinimiz İslam ve İmanın Altı Şartı (Âmentü)',
        summary:
          'Din; akıl sahiplerini kendi irade ve istekleriyle dünya ve ahirette saadet ve selamete kavuşturan ilahi kanundur. İman ise Allah’ın Resûlü’nün (s.a.v.) getirdiği hükümleri kalp ile tasdik edip dil ile ikrar etmektir.',
        arabicText:
          'آمَنْتُ بِاللَّهِ وَمَلَائِكَتِهِ وَكُتُبِهِ وَرُسُلِهِ وَالْيَوْمِ الْآخِرِ وَبِالْقَدَرِ خَيْرِهِ وَشَرِّهِ مِنَ اللَّهِ تَعَالَى وَالْبَعْثُ بَعْدَ الْمَوْتِ حَقٌّ',
        transliteration:
          'Âmentü billâhi ve melâiketihî ve kütübihî ve rusülihî ve’l-yevmi’l-âhiri ve bi’l-kaderi hayrihî ve şerrihî minellâhi teâlâ ve’l-ba’sü ba’de’l-mevti hakkun.',
        meaning:
          'Allah’a, meleklerine, kitaplarına, peygamberlerine, ahiret gününe, kadere; hayrın ve şerrin Allah Teâlâ’dan olduğuna inandım. Öldükten sonra dirilmek de haktır.',
        details: [
          'Allah Teâlâ ilk insan ve ilk peygamber Hz. Âdem (a.s.)’den itibaren insanlara peygamberler vasıtasıyla dini bildirmiş; son din İslam’ı Peygamberimiz Muhammed Mustafa (s.a.v.) ile tamamlamıştır.',
        ],
        listTitle: 'İmanın Altı Şartı',
        listItems: [
          '1. Allah Teâlâ’ya iman etmek',
          '2. Meleklerine iman etmek',
          '3. Kitaplarına iman etmek',
          '4. Peygamberlerine iman etmek',
          '5. Âhiret gününe iman etmek',
          '6. Kadere; hayır ve şerrin Allah’tan olduğuna iman etmek',
        ],
      },
      {
        id: 'allahin-sifatlari',
        title: 'Allâhu Teâlâ’ya İman ve Sıfatları',
        summary:
          'Allah Teâlâ vardır, birdir; zâtı bütün kemal sıfatlarla muttasıf, bütün noksan sıfatlardan münezzehtir. Sıfatları Sıfât-ı Zâtiyye ve Sıfât-ı Sübûtiyye olmak üzere iki kısımdır.',
        details: [
          'Zâtî sıfatlar yalnız Allah Teâlâ’ya mahsustur; başka hiçbir varlıkta bulunmaz.',
          'Sübûtî sıfatlar Allah’ta ezelî ve sonsuz kemalde bulunur.',
        ],
        listTitle: 'Sıfât-ı Zâtiyye (6) ve Sıfât-ı Sübûtiyye (8)',
        listItems: [
          'Zâtî Sıfatlar: Vücûd (Var olmak), Kıdem (Başlangıcı olmamak), Bekâ (Sonu olmamak), Vahdâniyet (Tek olmak), Muhâlefetün li’l-havâdis (Yaratılmışlara benzememek), Kıyâm bi-nefsihî (Varlığı kendinden olup hiçbir şeye muhtaç olmamak).',
          'Sübûtî Sıfatlar: Hayât (Diri olmak), İlim (Her şeyi bilmek), Sem’ (Her şeyi işitmek), Basar (Her şeyi görmek), İrâde (Dilemek), Kudret (Her şeye gücü yetmek), Kelâm (Harfsiz ve sessiz konuşmak), Tekvîn (Yoktan var etmek).',
        ],
      },
      {
        id: 'melekler-kitaplar-peygamberler',
        title: 'Meleklere, Kitaplara ve Peygamberlere İman',
        summary:
          'Melekler nurdan yaratılmış günahsız kullardır; kitaplar vahiy mahsulüdür; peygamberler ise insanlara hidayet rehberi olarak seçilmiş elçilerdir.',
        details: [
          'Dört Büyük Melek: Cebrâil (a.s.) vahiy getirir; Mikâil (a.s.) rızık ve tabiat olaylarıyla vazifelidir; İsrâfil (a.s.) kıyamette Sûr’a üfürür; Azrâil (a.s.) eceli gelenlerin ruhunu kabzeder. Bunlardan başka Kirâmen Kâtibîn, Münker ve Nekir gibi melekler de vardır.',
          'İlahi Kitaplar (4 Büyük Kitap ve 100 Suhuf): Tevrat (Hz. Mûsâ), Zebur (Hz. Dâvûd), İncil (Hz. Îsâ), Kur’an-ı Kerim (Hz. Muhammed Mustafa s.a.v.). Ayrıca 10 suhuf Hz. Âdem’e, 50 suhuf Hz. Şît’e, 30 suhuf Hz. İdrîs’e, 10 suhuf Hz. İbrâhim’e gönderilmiştir. Kur’an-ı Kerim kıyamete kadar korunmuştur ve önceki şeriatların hükmünü kaldırmıştır.',
          'Peygamberimizin (s.a.v.) Ashabı iki kısımdır: Mekkeli Muhâcirîn ve Medineli Ensâr. Ehl-i Beyt ise Peygamber Efendimiz’in mübarek aile efradı ve neslidir.',
        ],
        listTitle: 'Peygamberlerin 5 Vacip Sıfatı',
        listItems: [
          '1. Sıdk: Doğru sözlü olmak (asla yalan söylemezler).',
          '2. Emânet: Güvenilir olmak (emanete asla hıyanet etmezler).',
          '3. Tebliğ: Allah’tan aldıkları emirleri eksiksiz bildirmek.',
          '4. Fetânet: Üstün akıl ve zekâ sahibi olmak.',
          '5. İsmet: Büyük ve küçük günahlardan korunmuş olmak.',
        ],
      },
      {
        id: 'ahiret-ve-kader',
        title: 'Âhiret Günü, Kader, İrade-i Cüziyye, Ecel, Rızık ve Tevekkül',
        summary:
          'Öldükten sonra dirilmek, hesap vermek, cennet ve cehennem haktır; her şey Allah’ın ilmi ve takdiri dahilinde meydana gelir.',
        details: [
          'Âhiret safhaları: Kabir suali, Kıyamet, Ba’s (diriliş), Haşir (toplanma), Amel defterlerinin verilmesi, Mizan (tartı), Sırat köprüsü, Şefaat, Cennet ve Cehennem.',
          'Kader ve Kaza: Allah’ın ezelden ebede kadar olacak şeyleri bilip takdir etmesine Kader; zamanı gelince bu takdirin gerçekleşmesine Kaza denir.',
          'İrade-i Cüziyye: Kul iyiyi veya kötüyü kendi iradesiyle seçer, Allah da kulun seçtiği şeyi yaratır. Bu yüzden insan işlediği fiillerden sorumludur.',
          'Ecel ve Rızık: Her canlının ömrü (eceli) ve rızkı Allah katında bellidir; helal veya haram yoldan rızık aramak kulun tercihidir.',
          'Tevekkül: Üzerine düşen bütün meşru sebeplere sarıldıktan sonra neticeyi Allah’tan bekleyip O’na güvenmektir. Çalışmadan beklemek tevekkül değil tembelliktir.',
        ],
      },
      {
        id: 'imanin-koruyucu-kaleleri',
        title: 'İmanın Devamının Şartları, Koruyucu Kaleleri ve Sakınılacak Hususlar',
        summary:
          'İmanı elde etmek kadar onu ömür boyu muhafaza etmek de önemlidir; imanı bozan söz ve davranışlardan (elfâz-ı küfür) titizlikle kaçınılmalıdır.',
        details: [
          'İmanın devamı için Allah ve Resûlü’nün emirlerini küçümsememek, haramı helal veya helali haram saymamak, Allah’ın rahmetinden ümit kesmemek ve azabından da emin olmamak gerekir.',
          'İmanın Koruyucu Kaleleri: Beş vakit namazı vaktinde kılmak, salihlerle ve hak dostlarıyla beraber olmak, helal lokma yemek, ilim meclislerine devam etmek, zikir ve istiğfarı bırakmamak.',
          'Kaçınılacak Hususlar: Dinî hükümlerle alay etmek, kadere itiraz etmek, sihir/falcılık gibi batıl şeylere inanmak, kâfirlerin dinî alametlerini benimsemek imana zarar verir; böyle bir hata olursa hemen tövbe edip tecdid-i iman (imanı yenileme) yapılmalıdır.',
        ],
      },
    ],
  },
  {
    id: 'edille-mezhepler-farzlar',
    chapterNo: 2,
    title: 'Edille-i Şer’iyye, Mezhepler, İslam’ın Şartları ve 32–54 Farz',
    subtitle: 'Şer’î Deliller · Hak Mezhepler · Ef’âl-i Mükellefîn · 54 Farz',
    intro:
      'İslam fıkhının dayandığı dört temel delil (Edille-i Şer’iyye), Ehl-i Sünnet mezhepleri, dinî hükümler ve her mükellefin bilmesi gereken 32 ve 54 farz.',
    topics: [
      {
        id: 'edille-i-seriyye-ve-mezhepler',
        title: 'Edille-i Şer’iyye ve Hak Mezhepler',
        summary:
          'İslam dininin hükümleri dört temel kaynağa dayanır. Ehl-i Sünnet Müslümanları itikatta iki, amelde dört hak mezhep üzere birleşmiştir.',
        details: [
          'Edille-i Şer’iyye (4 Delil): 1. Kitap (Kur’an-ı Kerim), 2. Sünnet (Peygamber Efendimiz’in s.a.v. söz, fiil ve takrirleri), 3. İcmâ-ı Ümmet (Müctehid alimlerin bir asırda bir meselede görüş birliği), 4. Kıyas-ı Fukahâ (Hükmü nassta bulunmayan meseleyi ortak illete binaen hükmü bilinen meseleye kıyas etmek).',
          'İtikatta Mezhep İmamlarımız: İmam Ebû Mansûr Muhammed Mâtürîdî (v. 333 H., Semerkand) ve İmam Ebü’l-Hasen el-Eş’arî (v. 324 H., Basra).',
          'Amelde 4 Hak Mezhep: Hanefî (İmam-ı Âzam Ebû Hanîfe), Mâlikî (İmam Mâlik), Şâfiî (İmam Şâfiî), Hanbelî (İmam Ahmed b. Hanbel).',
        ],
      },
      {
        id: 'islamin-sartlari-efali-mukellefin',
        title: 'İslam’ın Beş Şartı, Kelime-i Şehadet ve Ef’âl-i Mükellefîn',
        summary:
          'İslam’ın temeli beş esas üzerinedir. Akıl baliğ olan her Müslümanın fiilleri ise sekiz şer’î hükme ayrılır.',
        arabicText:
          'أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ',
        transliteration:
          'Eşhedü en lâ ilâhe illallâh ve eşhedü enne Muhammeden abdühû ve rasûlüh.',
        meaning:
          'Ben şahitlik ederim ki Allah’tan başka ilah yoktur ve yine şahitlik ederim ki Muhammed (a.s.) O’nun kulu ve resûlüdür.',
        details: [
          'İslam’ın Beş Şartı: Kelime-i Şehadet getirmek, Namaz kılmak, Zekât vermek, Oruç tutmak, Gücü yetenin Hacca gitmesi.',
        ],
        listTitle: 'Ef’âl-i Mükellefîn (8 Hüküm)',
        listItems: [
          '1. Farz: Kesin delille sabit emir (Farz-ı ayn her mükellefe, farz-ı kifâye bir kısmının yapmasıyla diğerlerinden düşen emirdir).',
          '2. Vâcip: Zannî delille sabit kuvvetli emir (Vitir, Bayram, Kurban, Fitre).',
          '3. Sünnet: Peygamberimizin devam ettiği işler (Müekked ve Gayr-i Müekked sünnet).',
          '4. Müstehab (Mendub): Yapılması güzel ve sevap olan işler.',
          '5. Mübâh: Yapılması ve terki günah olmayan, niyete göre değer kazanan işler.',
          '6. Haram: Kesin delille yasaklanan büyük günahlar.',
          '7. Mekruh: Şeriatın hoş görmediği fiiller (Tahrîmen harama yakın, Tenzîhen helale yakın).',
          '8. Müfsid: Başlanmış olan ibadeti bozan söz ve hareketler.',
        ],
      },
      {
        id: 'otuz-iki-ve-elli-dort-farz',
        title: '32 Farz ve 54 Farzın Tam Listesi',
        summary:
          'İslam âlimlerinin derlediği 32 farz ibadet esaslarını; 54 farz ise her Müslümanın günlük hayatında riayet etmesi gereken itikadi, ameli ve ahlâki farzları özetler.',
        details: [
          '32 Farz: İmanın şartı (6) + İslam’ın şartı (5) + Abdestin farzı (4) + Guslün farzı (3) + Teyemmümün farzı (2) + Namazın farzı (12) = 32 farz.',
        ],
        listTitle: 'İslam Âlimlerinin Derlediği 54 Farz',
        listItems: [
          '1. Allah’ı bir bilip daima O’nu zikretmek · 2. Helalinden yemek ve giymek · 3. Abdest almak · 4. Beş vakit namazı vaktinde kılmak · 5. Cünüplükten gusletmek.',
          '6. Rızka Allah’ın kefil olduğuna inanmak · 7. Helal kazanıp kanaat etmek · 8. Allah’a tevekkül etmek · 9. Kaza ve kadere razı olmak · 10. Nimetlere şükretmek.',
          '11. Belâ ve musibetlere sabretmek · 12. Günahlara tövbe etmek · 13. İbadetleri ihlas ile yapmak · 14. Şeytanı düşman bilmek · 15. Kur’an-ı Kerim’in hükmüne razı olmak.',
          '16. Ölüme hazırlanmak · 17. İyiliği emredip kötülükten sakındırmak · 18. Allah’ın sevdiğini sevip buğzettiğine buğzetmek · 19. Anne-babaya iyilik ve itaat etmek · 20. Sıla-i rahimde bulunmak (akrabayı gözetmek).',
          '21. Emanete hıyanet etmemek · 22. Şaka ile bile olsa yalan söylememek · 23. Allah korkusundan ağlamak ve huşu duymak · 24. Haramlardan ve şüpheli şeylerden sakınmak · 25. Allah’tan hayâ etmek.',
          '26. Dünyaya hırsla bağlanmamak · 27. Kibirden ve kendini beğenmekten kaçınmak · 28. Haset (kıskançlık) etmemek · 29. Gıybet etmemek · 30. İftira atmamak.',
          '31. Kovuculuk (laf taşımak) yapmamak · 32. Yetim malı yememek · 33. Zina ve fuhşiyattan kaçınmak · 34. İçki ve uyuşturucudan uzak durmak · 35. Yalandan yemin etmemek.',
          '36. Faiz alıp vermemek · 37. Kumar oynamamak · 38. Zulüm ve haksızlık yapmamak · 39. Ölçü ve tartıda hile yapmamak · 40. Haksız yere cana kıymamak.',
          '41. Kul hakkına riayet etmek · 42. Misafire ve komşuya ikramda bulunmak · 43. Muhtaçlara zekât ve sadaka vermek · 44. Ramazan orucunu tutmak · 45. Gücü yetince hacca gitmek.',
          '46. Peygamber Efendimiz’e (s.a.v.) salavat getirmek ve sünnetine uymak · 47. Ehl-i Beyt’i ve Ashâb-ı Kirâm’ı sevmek · 48. Müslümanlarla dargın durmamak · 49. Haya ve edebe riayet etmek · 50. Riya (gösteriş) yapmamak.',
          '51. İlim öğrenmek ve öğretmek · 52. Kalbi nifaktan, kinden ve nefretten temiz tutmak · 53. Günahlarda ısrar etmemek · 54. Hayırlı işlere besmele ile başlayıp hamd ile bitirmek.',
        ],
      },
    ],
  },
  {
    id: 'taharet-abdest-gusul-mesh',
    chapterNo: 3,
    title: 'Tahâret: Abdest, Gusül, Teyemmüm, Mesh ve Mahsus Haller',
    subtitle: 'Sular · Abdest Duaları · Diş Dolgusu · Hayız & Nifas · Özür Sahibi',
    intro:
      'Namaza hazırlık temizlikten başlar. Abdest, gusül, teyemmüm, mestler üzerine mesh, necasetin çeşitleri ve kadınlara mahsus hallerin fıkhî hükümleri eksiksiz bilinmelidir.',
    topics: [
      {
        id: 'taharet-ve-sular',
        title: 'Hadesten ve Necasetten Tahâret, İstincâ ve Sular',
        summary:
          'Temizlik ikiye ayrılır: Hadesten tahâret (abdest/gusül/teyemmüm) ve Necâsetten tahâret (beden, elbise ve namaz yerindeki maddî pisliklerin giderilmesi).',
        details: [
          'İstincâ, İstinkâ ve İstibrâ: Tuvalet ihtiyacından sonra pislik mahallini temizlemeye İstincâ; tam temizlik yapmaya İstinkâ; erkeklerin küçük abdestten sonra damla kalmayacak şekilde temizlenmesine İstibrâ denir. Tuvalete sol ayakla girilir, sağ ayakla çıkılır; kıbleye ön veya arka dönülmez.',
          'Ağır Necâset (Necâset-i Galîza): Kan, idrar, büyük abdest, şarap, ölmüş hayvan eti, domuz artığı gibi necasetler. Katı ise 1 dirhem (yaklaşık 3,2 gr) miktarından, sıvı ise el ayasından (yaklaşık avuç içi) fazla olursa namaza manidir.',
          'Hafif Necâset (Necâset-i Hafîfe): Eti yenen hayvanların idrarı ve eti yenmeyen kuşların pisliği. Bulaştığı uzuv veya elbisenin dörtte birinden az ise namaza mani değildir; ancak her iki necaseti de az bile olsa yıkamak gerekir.',
          'Suların Kısımları: Temiz ve temizleyici olan Mutlak sular (yağmur, kar, dolu, kaynak, kuyu, nehir, deniz suları) ile abdest ve gusül alınır. Gül suyu, meyve suyu, et suyu veya başka bir maddeyle rengi/tadı/kokusu değişmiş Mukayyed sularla abdest ve gusül alınmaz.',
        ],
      },
      {
        id: 'abdest-ve-duaları',
        title: 'Abdestin Farzları, Sünnetleri, Mekruhları, Bozanlar ve Alınışı',
        summary:
          'Abdestsiz namaz kılınmaz, Kâbe tavaf edilmez, tilavet secdesi yapılmaz ve Mushaf-ı Şerif’e el sürülmez.',
        details: [
          'Abdestin Alınışı: Kıbleye dönülüp niyet ve Eûzü-Besmele çekilir. Eller bileklere kadar 3 kez yıkanır. Sağ elle ağza 3 kez su verilip çalkalanır (oruçlu değilse mazmaza/gargara). Sağ elle buruna 3 kez su çekilip sol elle sümkürülür. Yüz 3 kez yıkanır. Önce sağ sonra sol kol dirseklerle beraber 3’er kez yıkanır. Başın tamamı meshedilir, serçe parmaklarla kulak içi, başparmaklarla kulak dışı, üç parmağın dışıyla boyun meshedilir. Önce sağ sonra sol ayak topuklarla beraber 3’er kez yıkanıp parmak araları hilallenir.',
          'Abdestten Sonra: Ayakta kıbleye karşı biraz su içilip Kelime-i Şehadet ve Kadir Suresi okunması müstehaptır.',
        ],
        listTitle: 'Abdestin Farzları (4), Sünnetleri, Mekruhları ve Bozan Şeyler',
        listItems: [
          '4 Farz: Yüzü yıkamak, iki kolu dirseklerle beraber yıkamak, başın dörtte birini meshetmek, iki ayağı topuklarla beraber yıkamak.',
          'Başlıca Sünnetler: Niyet, Eûzü-Besmele, elleri bileklere kadar yıkamak, misvak kullanmak, ağız ve burna 3’er kez su vermek, azaları 3’er kez yıkamak, sağdan başlamak, parmak aralarını ve sakalı hilallemek, başın tamamını, kulakları ve boynu meshetmek, ara vermeden (muvâlât) abdest almak.',
          'Abdestin Mekruhları: Suyu israf etmek, suyu yüzüne çarpmak, zaruretsiz dünya kelamı konuşmak, başkasından yardım istemek, sol elle ağza-buruna su vermek, güneşlenmiş aşırı sıcak suyla abdest almak.',
          'Abdesti Bozan Şeyler: Ön ve arkadan çıkan idrar, dışkı, yel; vücuttan kan, irin veya sarı su çıkıp etrafına yayılması; ağız dolusu kusmak; yatıp veya bir şeye yaslanıp uyumak; bayılmak/sarhoşluk; rükû ve secdeli namazda yanındakilerin işiteceği kadar gülmek (kahkaha hem namazı hem abdesti bozar).',
        ],
      },
      {
        id: 'gusul-ve-dis-dolgusu',
        title: 'Gusül (Boy Abdesti), Sünnetleri ve Diş Dolgusu Meselesi',
        summary:
          'Cünüp olan kimseye, hayız ve nifası sona eren hanımlara gusül farzdır. Cuma ve bayram günleri gusletmek ise sünnettir.',
        details: [
          'Guslün 3 Farzı: 1. Ağza bol su verip boğaza kadar çalkalamak, 2. Burna genize kadar su çekmek, 3. İğne ucu kadar kuru yer kalmamak üzere bütün bedeni yıkamak.',
          'Guslün Alınışı: Besmele ve niyetle eller ve avret mahalli yıkanır. Namaz abdesti gibi abdest alınır (ayak altında su birikiyorsa ayaklar sonda yıkanır). Sonra üç defa başa, üç defa sağ omuza, üç defa sol omuza su dökülür; göbek çukuru, küpe delikleri ve tırnak içleri dahil bütün beden ovularak yıkanır.',
          'Diş Dolgusu ve Kanayan Diş Meselesi: Hanefî mezhebine göre diş dolgusu veya kaplaması tedavi zarureti ile yaptırılmışsa üzerine suyun temas etmesiyle gusül geçerli olur; ancak dolgu/kaplama yaptırırken veya sonrasında güç yetiyorsa diğer hak mezheplerden (Maliki/Şâfiî) birinin hükmüyle amel edilmesinde kolaylık vardır. Kanayan dişten çıkan kan tükürükten az ise abdesti bozmaz; eşit veya fazla ise abdesti bozar.',
        ],
      },
      {
        id: 'teyemmum-ve-mesh',
        title: 'Teyemmüm, Mestler Üzerine Mesh ve Sargı Meselesi',
        summary:
          'Su bulunamadığında veya suyun kullanılması hastalığı artıracağı durumda temiz toprak, kum, taş veya kireç gibi toprak cinsinden bir şeyle teyemmüm yapılır.',
        details: [
          'Teyemmümün 2 Farzı: 1. Niyet etmek, 2. İki eli temiz toprağa vurup yüzü meshetmek; elleri ikinci kez vurup önce sağ, sonra sol kolu dirseklerle beraber meshetmek.',
          'Teyemmümü Bozan Şeyler: Abdesti bozan her şey teyemmümü de bozar; ayrıca suyu görüp kullanmaya imkân bulmak teyemmümü bozar. Cünüplükten teyemmüm eden kişi su bulunca gusleder.',
          'Mestler Üzerine Mesh: Abdestli olarak giyilen, topukları örten, yırtıksız ve su geçirmeyen mestler üzerine mesh edilebilir. Müddeti mukim için 24 saat (1 gün), seferi (yolcu) için 72 saat (3 gün) tir. Süre, mest giyildikten sonraki ilk abdest bozulmasından itibaren başlar. El parmakları ıslatılıp ayak uçlarından yukarıya doğru en az üç parmak eninde çizgi çekilerek mesh edilir.',
          'Sargı ve Yara Üzerine Mesh: Yara üzerindeki sargıyı çözmek zarar veriyorsa, abdest ve gusülde sargının üzerine ıslak elle bir kere meshetmek kâfidir. Sargının abdestli iken sarılmış olması şart değildir.',
        ],
      },
      {
        id: 'kadinlara-mahsus-haller-ozur',
        title: 'Kadınlara Mahsus Haller (Hayız, Nifas, İstihâze) ve Özür Sahibi',
        summary:
          'Kadınların ay hali (hayız) en az 3, en çok 10 gündür; iki hayız arası temizlik müddeti en az 15 gündür. Doğum sonrası lohusalık (nifas) en çok 40 gündür.',
        details: [
          'Hayız ve Nifas Hallerinde Haram Olanlar: Namaz kılmak (kaza da edilmez), oruç tutmak (sonra kaza edilir), Kur’an-ı Kerim okumak ve Mushaf’a el sürmek, camiye girmek, Kâbe’yi tavaf etmek ve cinsi münasebette bulunmak haramdır. Tesbih, zikir, salavat ve dua caizdir.',
          'İstihâze (Özür Kanı): 3 günden az veya 10 günden fazla süren hayız kanı yahut 40 günden fazla devam eden nifas kanıdır. Bu durumda kadın özür sahibi hükmündedir.',
          'Özür Sahibi: Burun kanaması, idrar damlaması veya istihâze gibi bir özrü tam bir namaz vakti boyunca kesintisiz devam eden kimse özür sahibi sayılır. Özür sahibi her namaz vakti için yeni abdest alır ve o vakit içinde dilediği kadar farz ve nafile namaz kılabilir; vakit çıkınca abdesti bozulur.',
        ],
      },
    ],
  },
  {
    id: 'ezan-namaz-farz-mekruh-kilinis',
    chapterNo: 4,
    title: 'Ezan, Kamet, Namazın Şartları, Mekruhları ve Kılınışı',
    subtitle: 'Namazın 12 Farzı · Vacipleri · 49 Mekruh · Bozan Şeyler',
    intro:
      'Namaz müminin miracı ve dinin direğidir. Namaza hazırlık şartları, ezan ve kametin lafızları, namazın farz, vâcip, sünnet, mekruh ve müfsidleri ile erkek-kadın kılınış farkları bu bölümde yer alır.',
    topics: [
      {
        id: 'ezan-kamet-ve-kerahat-vakitleri',
        title: 'Namaz Vakitleri, Kerâhet Vakitleri, Ezan ve Kamet',
        summary:
          'Beş vakit namaz kendi vakti içinde kılınır. Ezan ve kamet cemaatle ve münferid erkekler için müekked sünnettir.',
        arabicText:
          'اللَّهُمَّ رَبَّ هَذِهِ الدَّعْوَةِ التَّامَّةِ وَالصَّلَاةِ الْقَائِمَةِ آتِ مُحَمَّدًا الْوَسِيلَةَ وَالْفَضِيلَةَ وَابْعَثْهُ مَقَامًا مَحْمُودًا الَّذِي وَعَدْتَهُ',
        transliteration:
          'Allâhümme rabbe hâzihi’d-da’veti’t-tâmmeti ve’s-salâti’l-kâimeh, âti Muhammeden el-vesîlete ve’l-fazîlete veb’ashü makâmen mahmûden ellezî veadteh.',
        meaning:
          'Ey bu eksiksiz davetin ve kılınacak namazın Rabbi olan Allah’ım! Peygamberimiz Muhammed’e (s.a.v.) Vesîle’yi ve Fazîlet’i ver ve O’nu kendisine vaad ettiğin Makâm-ı Mahmûd’a ulaştır.',
        details: [
          'Sabah ezanında “Hayye ale’l-felâh”tan sonra iki kez “Es-salâtü hayrun mine’n-nevm” (Namaz uykudan hayırlıdır) ilave edilir.',
          'Kamet: Farz namaza kalkılırken okunur; ezandan farkı “Hayye ale’l-felâh”tan sonra iki kez “Kad kâmeti’s-salâh” denmesidir.',
        ],
        listTitle: 'Üç Kerâhet Vakti (Namaz Kılınması Tahrîmen Mekruh Olan Vakitler)',
        listItems: [
          '1. Güneşin doğmasından yükselip bir-iki mızrak boyu geçinceye kadar (yaklaşık 40–50 dakika — İşrak vaktine kadar).',
          '2. Güneşin tam tepe noktasında bulunduğu zeval (istivâ) vakti (öğle ezanından yaklaşık 30–40 dakika önceden öğleye kadar).',
          '3. Güneşin sararıp batmaya yüz tuttuğu vakitten tamamen batıncaya kadar (akşam vaktinden önceki yaklaşık 40–45 dakika). Bu üç vakitte kaza namazı da kılınmaz; yalnız o günün ikindi namazının farzı kerâhetle eda edilebilir.',
        ],
      },
      {
        id: 'namazin-farzlari-vacipleri-sunnetleri',
        title: 'Namazın 12 Farzı, Vacipleri, Sünnetleri ve Âdâbı',
        summary:
          'Namazın dışındaki 6 şarta “Şartları”, içindeki 6 farza “Rükünleri” denir; eksiksiz yerine getirilmeleri namazın sahih olmasının temelidir.',
        details: [
          'Ta’dîl-i Erkân: Kıyamda, rükûda, kavmede (rükûdan doğrulurken), secdede ve celsede (iki secde arası oturuşta) en az bir “Sübhânallâhi’l-azîm” diyecek kadar durup azaların sakinleşmesidir.',
        ],
        listTitle: '12 Farz, Başlıca Vacipler ve Sünnetler',
        listItems: [
          'Dışındaki 6 Farz: 1. Hadesten tahâret, 2. Necâsetten tahâret, 3. Setr-i avret, 4. İstikbâl-i kıble, 5. Vakit, 6. Niyet.',
          'İçindeki 6 Farz: 1. İftitah tekbiri, 2. Kıyâm, 3. Kırâat, 4. Rükû, 5. Sücûd, 6. Ka’de-i ahîre (son oturuşta Ettehıyyâtü okuyacak kadar oturmak).',
          'Namazın Başlıca Vâcipleri: Namaza “Allâhu Ekber” lafzıyla başlamak, Fâtiha’yı okumak, farzların ilk iki rekâtında ve vitir/nafilelerin her rekâtında Fâtiha’dan sonra zamm-ı sûre (en az 3 kısa ayet veya 1 uzun ayet) okumak, Fâtiha’yı sûreden önce okumak, rükû ve secdede ta’dîl-i erkâna uymak, ilk oturuşu yapmak, iki oturuşta da Ettehıyyâtü okumak, Vitirde Kunut dualarını okumak, selâm lafızlarını söylemek, bayram namazlarında zevâid tekbirleri almak.',
          'Başlıca Sünnetler: İftitah tekbirinde elleri kaldırmak (erkekler kulak hizasına, kadınlar omuz hizasına), erkeklerin sağ eli sol el üzerine göbek altında, kadınların göğüs üstünde bağlaması, Sübhâneke, Eûzü-Besmele ve Âmîn’i gizli okumak, rükûda 3 kez “Sübhâne Rabbiye’l-azîm”, secdede 3 kez “Sübhâne Rabbiye’l-a’lâ” demek, son oturuşta Salli-Bârik ve Rabbenâ dualarını okumak, önce sağa sonra sola selâm vermek.',
        ],
      },
      {
        id: 'namazin-mekruhlari-ve-bozanlar',
        title: 'Namazın Mekruhları ve Namazı Bozan Şeyler',
        summary:
          'Namazın sevabını azaltan veya iadesini gerektiren mekruhlardan ve namazı tamamen geçersiz kılan müfsidlerden sakınmak şarttır.',
        details: [
          'Namazda huşu içinde olmaya engel olan el, elbise, sakal ile oynamak, etrafa bakmak, esnemek ve parmak çıtlatmak mekruhtur.',
        ],
        listTitle: 'Başlıca Mekruhlar ve Namazı Bozan Haller',
        listItems: [
          'Namazın Başlıca Mekruhları: Elbise ve vücutla oynamak, parmak çıtlatmak, elini böğrüne koymak, başı veya gözleriyle sağa-sola dönmek, ayaklarını özürsüz yerden kaldırmak, kolları veya etekleri sıvalı namaz kılmak, ön safta yer varken arka safta durmak, ayet veya tesbihleri parmakla saymak, farzda ikinci rekâtta birinci rekâtta okunan sureden daha yukarısından (önceki sureden) okumak veya arada tek sure atlamak, rükû veya secde tesbihini başını kaldırdıktan sonra söylemek, canlı resmi bulunan yere veya ateşe doğru namaz kılmak.',
          'Namazı Bozan Şeyler: Dünya kelamı konuşmak (yanlışlıkla dahi olsa), bir kimseye selam vermek veya selam almak, inlemek/ah etmek/dünya işi için ağlamak, bir şey yemek veya içmek (diş arasındaki nohut tanesi kadar artığı yutmak dahil), göğsü kıbleden çevirmek, amel-i kesîr (namaz dışı çok hareket yapmak), namazda yanındakinin duyacağı şekilde gülmek (abdesti de bozar), Kur’an okurken manayı bozacak derecede hata yapmak, abdestin bozulması, avret yerinin bir rükün miktarı açılması.',
        ],
      },
      {
        id: 'namaz-nasil-kilinir',
        title: 'Namaz Nasıl Kılınır? (Erkek ve Kadın Arasındaki Farklar)',
        summary:
          'Namazın temel rükünleri aynı olmakla birlikte örtünme ve vücut duruşu bakımından erkekler ile hanımlar arasında bazı sünnet farkları vardır.',
        details: [
          'Erkekler: İftitah tekbirinde başparmaklar kulak yumuşağına değecek şekilde elleri kaldırır; sağ elin baş ve küçük parmağıyla sol bileği kavrayıp göbek altında bağlar. Rükûda sırt düz tutulup dizler kavranır. Secdede dirsekler yanlardan ve yerden açık tutulur, karın uyluklardan ayrılır. Oturuşta sol ayak yere yayılır, sağ ayak dikilip parmaklar kıbleye çevrilir.',
          'Kadınlar: Tekbirde eller omuz hizasına kaldırılır, eller göğüs üzerinde sol el üstüne sağ el konarak bağlanır. Rükûda fazla eğilmez, dizleri hafif büker ve parmakları diz üstüne koyar. Secdede dirsekler yere ve yanlara yapıştırılır, karın uyluklara yaklaştırılarak topluca secde edilir. Oturuşta her iki ayak sağ tarafa çıkarılıp sol kalça üzerine oturulur (teverrük).',
        ],
      },
    ],
  },
  {
    id: 'vakit-cuma-bayram-nafile-cenaze',
    chapterNo: 5,
    title: 'Beş Vakit, Cuma, Bayram, Nafile Namazlar, Cenaze ve Kandiller',
    subtitle: '40 Rekât · Sehiv & Tilâvet Secdesi · Cenaze Bahsi · Mübarek Geceler',
    intro:
      'Günün beş vakti, Cuma, Bayram, Teravih, kaza, seferî, hasta ve cenaze namazlarının hükümleri ile mübarek kandil geceleri.',
    topics: [
      {
        id: 'bes-vakit-ve-vitir',
        title: 'Beş Vakit Namazın Rekâtları ve Kılınış Sırası (40 Rekât)',
        summary:
          'Günde kılınan 5 vakit namaz ve Vitir namazı toplam 40 rekâttır: 17 farz, 3 vâcip, 12 müekked sünnet ve 8 gayr-i müekked sünnet.',
        details: [
          'Sabah (4 rekât): 2 sünnet + 2 farz. Her iki rekâtta da Fâtiha ve zamm-ı sûre okunur.',
          'Öğle (10 rekât): 4 ilk sünnet + 4 farz + 2 son sünnet. Farzın 3. ve 4. rekâtlarında yalnız Fâtiha okunur; ilk sünnetin her 4 rekâtında zamm-ı sûre okunur.',
          'İkindi (8 rekât): 4 gayr-i müekked sünnet + 4 farz. Gayr-i müekked sünnetin 2. rekât oturuşunda Ettehıyyâtü’den sonra Salli-Bârik okunur, 3. rekâta kalkınca Sübhâneke ile başlanır.',
          'Akşam (5 rekât): 3 farz + 2 sünnet. Farzın 3. rekâtında yalnız Fâtiha okunur.',
          'Yatsı (10 rekât) + Vitir (3 rekât): 4 gayr-i müekked ilk sünnet + 4 farz + 2 son sünnet + 3 rekât Vitir vâcip. Vitir namazının 3. rekâtında Fâtiha ve zamm-ı sûreden sonra “Allâhu Ekber” diye eller kulak hizasına kaldırılıp tekrar bağlanır ve Kunut duaları okunur.',
        ],
      },
      {
        id: 'cemaat-sehiv-tilavet',
        title: 'Cemaatle Namaz, Sehiv Secdesi ve Tilâvet Secdesi',
        summary:
          'Cemaatle kılınan namaz tek başına kılınandan 27 derece daha faziletlidir. Namazda vâcip terki veya farz gecikmesi olursa Sehiv Secdesi yapılır.',
        details: [
          'İmama Uyma (Mesbuk): İmama sonradan yetişen kimse (mesbuk) imamla selam vermez; imam ikinci tarafa selam verdikten sonra kalkıp kılamadığı rekâtları tamamlar.',
          'Sehiv Secdesinin Yapılışı: Son oturuşta yalnız Ettehıyyâtü okunup sağ tarafa selâm verildikten sonra “Allâhu Ekber” denilerek iki defa secdeye gidilir; sonra oturulup Ettehıyyâtü, Salli-Bârik ve Rabbenâ duaları okunarak iki tarafa selâm verilir.',
          'Sehiv Secdesi Gerektiren Haller: Zamm-ı sûreyi veya Fâtiha’yı unutmak, ilk oturuşu terk etmek veya ilk oturuşta Salli okuyacak kadar gecikmek, Vitirde Kunut tekbiri veya Kunut dualarını unutmak, sesli okunacak yerde gizli veya gizli yerde sesli okumak.',
          'Tilâvet Secdesi: Kur’an-ı Kerim’deki 14 secde ayetinden biri okunduğunda veya dinlendiğinde kıbleye dönüp niyet edilerek eller kaldırılmadan “Allâhu Ekber” deyip bir secde yapılır, ardından “Allâhu Ekber” diyerek kalkılır ve “Semi’nâ ve eta’nâ gufrâneke rabbenâ ve ileyke’l-masîr” denir.',
        ],
      },
      {
        id: 'cuma-bayram-kaza-seferi',
        title: 'Cuma, Bayram, Kaza, Seferî ve Hastanın Namazı',
        summary:
          'Cuma ve Bayram namazları İslam şiarından olan toplu ibadetlerdir. Kazaya kalan namazlar ise en kısa sürede ödenmelidir.',
        details: [
          'Cuma Namazı: 4 rekât ilk sünnet + 2 rekât farz + 4 rekât son sünnet (ve gereğinde 4 rekât zuhr-i âhir + 2 rekât vaktin son sünneti). Vücub şartları: Erkek, hür, mukim, sağlıklı ve görecek gözlü/yürüyecek ayaklı olmak. Sıhhat şartları (6): Şehir/kasaba, devlet izni, öğle vakti, hutbe, cemaat (imam hariç en az 3 kişi), umuma açık olmak.',
          'Bayram Namazı: 2 rekât vâciptir. 1. rekâtta Sübhâneke’den sonra 3 kez zevâid tekbiri alınır (ilk ikide eller yana salınır, üçüncüde bağlanır). 2. rekâtta Fâtiha ve sûreden sonra 3 kez zevâid tekbiri alınıp eller yana salınır, 4. tekbirle rükûa eğilinir.',
          'Kaza Namazları: Namazın kazaya kalmasına meşru sebep 3’tür: Uyku, unutmak ve düşmanla çarpışma esnasında hiç fırsat bulamamak. Yalnız beş vakit farzlar ve Vitir vâcip kaza edilir.',
          'Seferî (Yolcu) Namazı: En az 90 km (18 saatlik yürüyüş) uzaklıktaki bir yere gitmek niyetiyle şehrin/kasabanın meskûn sınırından çıkan yolcu, vardığı yerde 15 günden az kalacaksa seferî olur ve 4 rekâtlı farz namazları 2 rekât kılar. Akşam, sabah ve vitir kısaltılmaz.',
          'Hastanın Namazı: Ayakta duramayan oturarak; rükû ve secdeye gücü yetmeyen başıyla îmâ ederek namazını kılar (secde îmâsında başını rükûdan daha fazla eğer).',
        ],
      },
      {
        id: 'nafile-namazlar-ve-tesbih',
        title: 'Teravih, Teheccüd, Duhâ, İstihâre ve Tesbih Namazı',
        summary:
          'Farz ve vâcipler dışındaki nafile namazlar kulun Allah’a yakınlaşmasını ve derecesinin yükselmesini sağlar.',
        details: [
          'Teravih Namazı: Ramazan ayında yatsı namazından sonra vitirden önce kılınan 20 rekât müekked sünnettir. Her 2 veya 4 rekâtta selam verilebilir.',
          'Teheccüd (Gece) Namazı: Yatsıdan sonra bir miktar uyuyup kalkarak kılınan 2 ila 8 rekât çok faziletli gece namazıdır.',
          'İşrak ve Duhâ (Kuşluk): Güneş doğup kerâhet vakti çıktıktan sonra 2–4 rekât İşrak; kuşluk vaktinde 2–12 rekât Duhâ namazı kılınır.',
          'Evvâbîn ve Hâcet / İstihâre: Akşamdan sonra 6 rekât Evvâbîn; bir dilek için 2–4 rekât Hâcet; hayırlı olanı istemek için yatmadan 2 rekât İstihâre namazı kılınır.',
          'Tesbih Namazı: 4 rekâttır ve içinde 300 kez “Sübhânallâhi ve’l-hamdülillâhi ve lâ ilâhe illallâhü vallâhü ekber” tesbihi okunur (her rekâtta Sübhâneke’den sonra 15, kırâatten sonra 10, rükûda 10, rükûdan kalkınca kavmede 10, birinci secdede 10, iki secde arası celsede 10, ikinci secdede 10 kez; her rekâtta 75 tesbih = toplam 300).',
        ],
      },
      {
        id: 'cenaze-bahsi-ve-kabir-ziyareti',
        title: 'Cenaze Bahsi, Kefenleme, Cenaze Namazı ve Kabir Ziyareti',
        summary:
          'Vefat eden Müslümana karşı son vazifemiz; onu yıkamak, kefenlemek, cenaze namazını kılmak ve sünnete uygun defnetmektir.',
        details: [
          'Ölüm Döşeğindeki Hasta: Yanında Yâsîn-i Şerif okunur ve zorlamadan tatlılıkla Kelime-i Şehadet telkin edilir.',
          'Kefenleme: Erkek için 3 parça kefen (Lifâfe, İzâr, Kamîs); kadın için 5 parça kefen (Lifâfe, İzâr, Kamîs, Başörtüsü/Hımâr ve Göğüs bağı/Hırka) sünnettir.',
          'Cenaze Namazının Kılınışı (Farz-ı Kifâye): Rükû ve secdesi yoktur, ayakta 4 tekbirle kılınır. 1. Tekbirden sonra “Sübhâneke” (ve celle senâük ilavesiyle), 2. Tekbirden sonra “Allâhümme Salli ve Bârik”, 3. Tekbirden sonra bilenler “Cenaze Duası” (bilmeyenler Rabbenâ Âtinâ veya Fâtiha’yı dua niyetiyle) okur; 4. Tekbirden sonra eller yana salınır, sağa ve sola selâm verilir.',
          'Kabirde Sual ve Ziyaret Âdâbı: Münker ve Nekir melekleri kabirde “Rabbin kim? Dinin nedir? Peygamberin kim?” diye sorarlar. Kabirleri ziyaret etmek ölümü hatırlatır; kabir başında Kur’an okuyup dua edilir, kabir üzerine basılmaz ve oturulmaz.',
        ],
      },
      {
        id: 'mubarek-geceler',
        title: 'Beş Mübarek Kandil Gecesi ve İhyâsı',
        summary:
          'İslam takviminde rahmet ve mağfiretin coştuğu beş mübarek kandil gecesi kaza/nafile namaz, Kur’an tilaveti, tövbe ve dua ile değerlendirilir.',
        details: [
          'Kandil gecelerinde mümkünse cemaatle yatsı ve sabah namazlarını kılmak, geçmiş kaza namazlarını eda etmek, Kur’an-ı Kerim okuyup salavat getirmek ve ailece dua etmek büyük sevaptır.',
        ],
        listTitle: 'Beş Mübarek Gece',
        listItems: [
          '1. Mevlid Kandili (12 Rebiülevvel): Peygamber Efendimiz’in (s.a.v.) dünyayı teşrif ettiği gece.',
          '2. Regaib Kandili (Recep ayının ilk Cuma gecesi): Üç ayların müjdecisi, rahmet ve rağbet gecesi.',
          '3. Miraç Kandili (27 Recep): İsra ve Miraç mucizesinin gerçekleştiği, beş vakit namazın farz kılındığı gece.',
          '4. Berat Kandili (15 Şaban): Kur’an-ı Kerim’in Levh-i Mahfuz’dan dünya semasına indirildiği, af ve mağfiret gecesi.',
          '5. Kadir Gecesi (27 Ramazan gecesi): Kur’an’ın indirilmeye başlandığı, bin aydan hayırlı olan mübarek gece.',
        ],
      },
    ],
  },
  {
    id: 'oruc-zekat-hac-kurban',
    chapterNo: 6,
    title: 'Oruç, Zekât, Fitre, Hac, Umre ve Kurban',
    subtitle: 'Mali ve Bedeni İbadetlerin Bütün Fıkhî Hükümleri',
    intro:
      'Ramazan orucunu bozan ve bozmayan haller, zekât nisabı ve verileceği sınıflar, fıtır sadakası, hac/umre esasları ve kurban ibadeti.',
    topics: [
      {
        id: 'oruc-bozan-bozmayan-kefaret',
        title: 'Orucun Çeşitleri, Bozanlar, Kaza/Keffaret ve Bozmayan Haller',
        summary:
          'Oruç; imsak vaktinden güneş batıncaya kadar niyet ederek yemek, içmek ve cinsi münasebetten sakınmaktır.',
        details: [
          'Oruç Çeşitleri: Farz (Ramazan orucu ve kazası, keffaret oruçları), Vâcip (Adak ve bozulan nafile orucun kazası), Sünnet/Müstehab (Âşûrâ 9-10 veya 10-11 Muharrem, Pazartesi-Perşembe, Şevval’in 6 günü, Zilhicce ilk 9 günü, Arefe). İki bayramın ilk günü ile Kurban Bayramı’nın 2., 3. ve 4. günleri (teşrik günleri) oruç tutmak tahrîmen mekruhtur.',
          'İtikâf: Ramazan ayının son on gününde mescitte ibadet niyetiyle kalmak sünnet-i müekkede-i kifâyedir.',
        ],
        listTitle: 'Kaza, Keffaret, Mekruhlar ve Orucu Bozmayanlar',
        listItems: [
          'Yalnız Kaza Gerektirenler: Hata ile (abdestte/gusülde) boğaza su kaçması, kar/yağmurun isteyerek yutulması, gıda ve deva olmayan bir şeyi (kağıt, çiğ pirinç vb.) yutmak, zorla orucu bozdurulmak, imsak girdiğini bilmeden sahur yemek veya güneş battı sanarak iftar etmek.',
          'Kaza ve Keffaret Gerektirenler: Ramazan orucunu geçerli özür olmadan bilerek ve isteyerek yiyip içerek (gıda/deva) veya cinsi münasebetle bozmak (1 gün kaza + aralıksız 60 gün oruç keffareti).',
          'Oruçluya Mekruh Olanlar: Özürsüz bir şeyi tatmak veya çiğnemek, ağzını çalkaladıktan sonra kalan ıslaklığı tükürmeyip yutmak, kendini güçsüz düşürecekse kan aldırmak, cünüp olarak imsak vaktini geçirmek mekruh değilse de erken gusletmek evlâdır.',
          'Orucu Bozmayan Haller: Unutarak yiyip içmek, kendi tükürüğünü yutmak, göze ilaç veya sürme sürmek, ağza ve burna su kaçırmadan yıkanmak, misvak kullanmak, elinde olmadan boğazına toz/duman girmesi, istemeden kusmak veya ağız dolusundan az kusmak.',
        ],
      },
      {
        id: 'zekat-ve-fitir-sadakasi',
        title: 'Zekât, Öşür ve Fıtır Sadakası (Fitre)',
        summary:
          'Temel ihtiyaçlarından ve borcundan başka nisap miktarı (80,18 gr altın veya 561,2 gr gümüş değerinde) artıcı mala sahip olup üzerinden bir kamerî yıl geçen Müslümana zekât farzdır.',
        details: [
          'Zekât Oranı: Altın, gümüş, nakit para ve ticaret mallarının kırkta biri (%2,5) zekât olarak verilir.',
          'Öşür (Toprak Mahsulleri): Yağmur suyu veya tabii akarsu ile sulanan araziden onda bir (%10), masraf ve emekle sulanan araziden yirmide bir (%5) zekât (öşür) verilir.',
          'Fıtır Sadakası (Fitre): Ramazan bayramına kavuşan ve temel ihtiyaçları dışında nisap miktarı mala sahip olan her Müslümanın kendisi ve velayeti altındaki küçük çocukları adına vermesi vâciptir.',
        ],
        listTitle: 'Zekâtın Verileceği 8 Sınıf ve Verilemeyecek Kimseler',
        listItems: [
          'Zekât Verilecekler (Tevbe, 60): Fakirler (nisap altı malı olanlar), Miskinler (hiçbir şeyi olmayanlar), Zekât memurları, Kalbi İslam’a ısındırılacaklar (müellefe-i kulûb), Kölelikten kurtulacaklar, Borçlular, Allah yolundakiler, Yolda kalmış yolcular.',
          'Zekât Verilemeyecek Kimseler: Anne, baba, dede, nine (usûl); evlatlar ve torunlar (fürû); eşler birbirine; nisap miktarı malı olan zenginlere ve gayrimüslimlere zekât verilmez. Cami ve okul gibi kurum inşaatlarına doğrudan zekât değil nafile sadaka verilir.',
        ],
      },
      {
        id: 'hac-umre-ve-kurban',
        title: 'Hac, Umre ve Kurban İbadeti',
        summary:
          'Sağlığı, maddi imkânı ve yol güvenliği olan Müslümana ömründe bir kez hac farzdır; nisap miktarı mala sahip olana kurban kesmek vâciptir.',
        details: [
          'Haccın 3 Farzı: 1. İhrama girmek, 2. Arafat’ta vakfe yapmak, 3. Ziyaret (ifâza) tavafı yapmak. Başlıca vâcipleri: Safâ ile Merve arasında sa’y, Müzdelife vakfesi, Şeytan taşlama (remy-i cimâr), tıraş olup ihramdan çıkmak ve Vedâ tavafı.',
          'Hac Çeşitleri: İfrad (yalnız hac), Temettu (önce umre yapıp ihramdan çıkmak, sonra hac için ihrama girmek), Kıran (tek ihramda umre ve haccı birlikte yapmak).',
          'Kurban Kesmenin Şartları ve Vakti: Müslüman, akıl baliğ, mukim ve nisaba malik olan kimseye Kurban Bayramı’nın 1., 2. veya 3. günü akşamına kadar (bayram namazı kılınan yerlerde namazdan sonra) kurban kesmek vâciptir.',
          'Kurban Hayvanları: Koyun (1 yaş; 6 ayı doldurup annesi kadar gösterişli ise caiz) ve keçi (1 yaş) 1 kişi; sığır ve manda (2 yaş) ile deve (5 yaş) 1 ila 7 kişi ortaklığıyla kesilebilir. Kurbanlık hayvanda iki gözün körlüğü, yürüyemeyecek topallık veya kulağın/boynuzun/kuyruğun çoğunun eksikliği gibi büyük kusurlar bulunmamalıdır.',
          'Akika ve Adak Kurbanı: Yeni doğan çocuk için şükür niyetiyle kesilen sünnet kurbana Akika denir (etinden sahibi de yiyebilir). Adak kurbanının etinden ise adak sahibi, usûl ve fürûu ve eşi yiyemez; tamamı fakirlere dağıtılır.',
        ],
      },
    ],
  },
  {
    id: 'gunahlar-tovbe-cemiyet-vazifeleri',
    chapterNo: 7,
    title: 'Büyük Günahlar, Tövbe-İstiğfar ve Cemiyet Vazifeleri',
    subtitle: 'Kebâir · Seyyidü’l-İstiğfar · Anne-Baba, Komşu ve Misafir Hakkı',
    intro:
      'İbadetlerin kemali günahlardan sakınmak, samimi tövbe ile Allah’a yönelmek ve toplum içindeki kul haklarına titizlikle riayet etmekle sağlanır.',
    topics: [
      {
        id: 'gunahlar-ve-buyuk-gunahlar',
        title: 'Günah Nedir ve Başlıca Büyük Günahlar (Kebâir)',
        summary:
          'Allah ve Resûlü’nün yasakladığı söz ve fiillere günah denir; dünyada had/azap yahut ahirette şiddetli tehdit bildirilenler büyük günahtır.',
        details: [
          'Hiçbir küçük günah küçümsenmemelidir; ısrar edilen küçük günah büyür, tövbe edilen büyük günah ise Allah’ın lütfuyla affedilir.',
        ],
        listTitle: 'Başlıca Büyük Günahlar',
        listItems: [
          'Allah’a ortak koşmak (Şirk — en büyük günahtır ve tövbesiz affedilmez)',
          'Haksız yere adam öldürmek ve intihar etmek',
          'Sihir (büyü) yapmak ve falcılığa itibar etmek',
          'Beş vakit namazı veya Ramazan orucunu kasten terk etmek, zekâtı vermemek',
          'Anne ve babaya karşı gelmek (ukûk-ı vâlideyn)',
          'Yetim malı yemek, faiz yiyip yedirmek, hırsızlık ve gasp yapmak',
          'Zina, livata, yalancı şahitlik, iffetli kimseye iftira atmak',
          'İçki ve uyuşturucu kullanmak, kumar oynamak, gıybet ve koğuculuk yapmak',
        ],
      },
      {
        id: 'tovbe-istigfar-seyyidul-istigfar',
        title: 'Tövbe, İstiğfar, Kabul Şartları ve Büyük İstiğfar (Seyyidü’l-İstiğfar)',
        summary:
          'Müslüman Allah’ın rahmetinden asla ümit kesmemeli; her günahtan sonra samimi (nasûh) tövbe etmelidir.',
        arabicText:
          'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ',
        transliteration:
          'Allâhümme ente rabbî lâ ilâhe illâ ente, halaktenî ve ene abdüke, ve ene alâ ahdike ve va’dike me’steta’tü, eûzü bike min şerri mâ sana’tü, ebûu leke bi-ni’metike aleyye ve ebûu bi-zenbî fağfir lî feinnehû lâ yağfiru’z-zünûbe illâ ent.',
        meaning:
          'Allah’ım! Sen benim Rabbimsin, senden başka ilah yoktur. Beni sen yarattın, ben senin kulunum; gücüm yettiğince senin ahdin ve vaadin üzereyim. Yaptıklarımın şerrinden sana sığınırım. Üzerimdeki nimetlerini itiraf ediyorum, günahlarımı da itiraf ediyorum; beni bağışla, çünkü günahları ancak sen bağışlarsın.',
        details: [
          'Tövbenin Kabul Olmasının 3 Şartı (Kul hakkı varsa 4): 1. Günahı derhal terk etmek, 2. İşlediğine kalpten pişmanlık duymak, 3. Bir daha o günaha dönmemeye kesin karar vermek. 4. Kul hakkı varsa hak sahibiyle helalleşmek veya hakkını iade etmek; kaçırılmış namaz/oruç/zekât varsa onları da kaza edip ödemek.',
          'Ümitsizlik Doğru Değildir: Allah Teâlâ “Ey nefisleri aleyhine haddi aşan kullarım! Allah’ın rahmetinden ümit kesmeyin” (Zümer, 53) buyurmuştur.',
        ],
      },
      {
        id: 'cemiyet-vazifeleri',
        title: 'Müslümanların Cemiyet İçindeki Vazifeleri',
        summary:
          'Komşu hakkı, misafire ikram, anne-babaya hürmet ve insanlara güzel muamele İslam ahlâkının temel taşlarıdır.',
        details: [
          'Komşu Hakkına Riayet: Komşuya eziyet etmemek, sevinç ve kederine ortak olmak, hastalandığında ziyaret etmek, muhtaç olduğunda yardımına koşmaktır.',
          'Misafire Karşı Vazifeler: Güler yüzle karşılamak, imkân ölçüsünde ikramda bulunmak ve uğurlamaktır.',
          'Diğer Cemiyet Vazifeleri: Anne-babaya hürmet ve itaat, sıla-i rahim (akrabaları ziyaret), büyükleri saymak ve küçükleri sevmek, ticarette ve sözleşmelerde dürüstlük, verilen sözü tutmak, yoldaki eziyet verici şeyleri kaldırmak ve selamı yaymak.',
        ],
      },
    ],
  },
  {
    id: 'namaz-dualari-sureler-dini-sualler',
    chapterNo: 8,
    title: 'Namaz Duaları, Namaz Sureleri ve Dinî Sualler (Soru–Cevap)',
    subtitle: 'Tam Namaz Duaları · Fâtiha–Nâs & Âyete’l-Kürsî · Müslüman Çocuğuna Dinî Sualler',
    intro:
      'Her Müslümanın namaz içinde ve sonrasında okuduğu bütün dualar, kısa namaz sureleri (Arapça, okunuş ve meal) ve Fazilet Neşriyat Muhtasar İlmihal’in sonundaki eksiksiz Soru–Cevap özeti.',
    topics: [
      {
        id: 'namaz-dualari-tamami',
        title: 'Namaz Dualarının Tamamı (Sübhâneke, Tahiyyât, Salli-Bârik, Rabbenâ, Kunut)',
        summary:
          'Beş vakit namaz ve Vitir namazında okunan bütün duaların okunuşları ve anlamları.',
        details: [
          'Sübhâneke: “Sübhânekellâhümme ve bi-hamdik ve tebârekesmük ve teâlâ ceddük (ve celle senâük) ve lâ ilâhe gayruk.” — Anlamı: Allah’ım! Sen bütün noksan sıfatlardan münezzehsin, seni hamdinle tesbih ederim. İsmin mübarektir, şanın yücedir, senden başka ilah yoktur.',
          'Ettehıyyâtü: “Ettehıyyâtü lillâhi ve’s-salevâtü ve’t-tayyibât. Es-selâmü aleyke eyyühe’n-nebiyyü ve rahmetullâhi ve berekâtüh. Es-selâmü aleynâ ve alâ ibâdillâhi’s-sâlihîn. Eşhedü en lâ ilâhe illallâh ve eşhedü enne Muhammeden abdühû ve rasûlüh.”',
          'Allâhümme Salli: “Allâhümme salli alâ Muhammedin ve alâ âli Muhammed. Kemâ salleyte alâ İbrâhîme ve alâ âli İbrâhîm. İnneke hamîdün mecîd.”',
          'Allâhümme Bârik: “Allâhümme bârik alâ Muhammedin ve alâ âli Muhammed. Kemâ bârekte alâ İbrâhîme ve alâ âli İbrâhîm. İnneke hamîdün mecîd.”',
          'Rabbenâ Âtinâ & Rabbenağfirlî: “Rabbenâ âtinâ fi’d-dünyâ haseneten ve fi’l-âhireti haseneten ve kınâ azâbe’n-nâr. Rabbena’ğfir lî ve li-vâlideyye ve li’l-mü’minîne yevme yekûmü’l-hisâb.”',
          'Kunut Duaları (Vitir 3. Rekât): (1) “Allâhümme innâ nesteînüke ve nestağfirüke ve nestehdîke ve nü’minü bike ve netûbü ileyke ve netevekkelü aleyke ve nüsnî aleyke’l-hayra küllehû neşküruke ve lâ nekfüruke ve nahleu ve netrükü men yefcüruk.” (2) “Allâhümme iyyâke na’büdü ve leke nüsallî ve nescüdü ve ileyke nes’â ve nahfidü nercû rahmeteke ve nahşâ azâbeke inne azâbeke bi’l-küffâri mülhik.”',
        ],
      },
      {
        id: 'fatiha-ayetel-kursi-amenerrasulu',
        title: 'Fâtiha Suresi, Âyete’l-Kürsî ve Âmenerrasûlü',
        summary:
          'Namazların her rekâtında okunan Fâtiha Suresi ile her namaz sonrası ve yatarken okunan Âyete’l-Kürsî ve Âmenerrasûlü.',
        arabicText:
          'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ۝ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ۝ الرَّحْمَٰنِ الرَّحِيمِ ۝ مَالِكِ يَوْمِ الدِّينِ ۝ إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ۝ اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ ۝ صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ',
        transliteration:
          'Elhamdü lillâhi rabbi’l-âlemîn. Er-rahmâni’r-rahîm. Mâliki yevmi’d-dîn. İyyâke na’büdü ve iyyâke nesteîn. İhdine’s-sırâta’l-müstakîm. Sırâtallezîne en’amte aleyhim, gayri’l-mağdûbi aleyhim ve le’d-dâllîn.',
        meaning:
          'Hamd, âlemlerin Rabbi, Rahmân ve Rahîm, hesap gününün maliki Allah’a mahsustur. Yalnız sana ibadet eder ve yalnız senden yardım dileriz. Bizi doğru yola; kendilerine nimet verdiklerinin yoluna ilet; gazaba uğrayanların ve sapkınların yoluna değil.',
        details: [
          'Âyete’l-Kürsî (Bakara, 255): Allâhü lâ ilâhe illâ hüve’l-hayyü’l-kayyûm, lâ te’huzühû sinetün ve lâ nevm... Farz namazların arkasından okunması büyük fazilet taşır.',
          'Âmenerrasûlü (Bakara, 285–286): Yatsı namazından sonra okunması sünnettir; “Lâ yükellifullâhü nefsen illâ vüs’ahâ...” duasıyla sona erer.',
        ],
      },
      {
        id: 'namaz-sureleri-fil-nas',
        title: 'Kısa Namaz Sureleri (Fîl’den Nâs’a Kadar 10 Sure)',
        summary:
          'Namazlarda Fâtiha’dan sonra okunan zamm-ı sûrelerin okunuşları ve kısa anlamları.',
        details: [
          'Zamm-ı sûre okumak farz namazların ilk iki rekâtında, vitir ve sünnet/nafile namazların ise her rekâtında vâciptir. Kur’an tertibine uygun sıra gözeterek okumak sünnettir.',
        ],
        listTitle: 'Fîl – Nâs Arası 10 Sure',
        listItems: [
          '1. Fîl Suresi (Elem tera keyfe...): Ebrehe’nin Kâbe’yi yıkmaya gelen fil ordusunun Ebâbil kuşlarıyla helak edilişini anlatır.',
          '2. Kureyş Suresi (Li-îlâfi Kureyşin...): Kureyş’e verilen yaz-kış yolculuğu güvenliği ve rızık nimetlerine karşı Kâbe’nin Rabbine kulluk emredilir.',
          '3. Mâûn Suresi (Eraeytellezî yükezzibü...): Yetimi itip kakanlar, yoksulu doyurmaya teşvik etmeyenler ve namazını gösterişle kılıp zekâtı engelleyenler kınanır.',
          '4. Kevser Suresi (İnnâ a’taynâke’l-kevser...): Peygamberimize Kevser nimetinin verildiği bildirilerek namaz kılıp kurban kesmesi emredilir.',
          '5. Kâfirûn Suresi (Kul yâ eyyühe’l-kâfirûn...): İnançta tevhid duruşu ilan edilir: “Sizin dininiz size, benim dinim banadır.”',
          '6. Nasr Suresi (İzâ câe nasrullâhi ve’l-feth...): Fetih ve insanların bölük bölük İslam’a girişi üzerine hamd ve istiğfar emredilir.',
          '7. Tebbet Suresi (Tebbet yedâ ebî lehebin...): İslam’a düşmanlık eden Ebû Leheb ve karısının akıbeti haber verilir.',
          '8. İhlâs Suresi (Kul hüvallâhü ehad...): Allah’ın birliği, Samed oluşu, doğurmamış ve doğurulmamış olduğu bildirilir (Kur’an’ın üçte birine denktir).',
          '9. Felâk Suresi (Kul eûzü bi-rabbi’l-felâk...): Yaratılanların, karanlığın, düğümlere üfleyen büyücülerin ve hasetçinin şerrinden sabahın Rabbine sığınılır.',
          '10. Nâs Suresi (Kul eûzü bi-rabbi’n-nâs...): İnsanların kalbine vesvese veren sinsi şeytanların ve kötü insanların şerrinden insanların Rabbine sığınılır.',
        ],
      },
      {
        id: 'musluman-cocuguna-dini-sualler',
        title: 'Müslüman Çocuğuna Bazı Dinî Sualler (Tam Soru–Cevap)',
        summary:
          'Kitabın sonundaki klasik soru-cevap bölümü: Gençlerin ve her Müslümanın kolayca ezberleyebileceği temel soru ve cevaplar.',
        details: [
          'Müslüman anne-babaların çocuklarına erken yaşta iman, ibadet ve peygamber sevgisini öğretmesi en önemli vazifelerdendir.',
        ],
        listTitle: 'Temel Dinî Sualler ve Cevapları',
        listItems: [
          'Sual: Sen kimin kulusun? — Cevap: Allah Teâlâ’nın kuluyum. Kimin ümmetindensin? Peygamberimiz Muhammed Mustafa (s.a.v.)’in ümmetindenim.',
          'Sual: Dinin nedir? İmanın kaç şartı vardır? — Cevap: Dinim İslam’dır. İmanın şartı altıdır.',
          'Sual: İtikatta ve amelde mezhebin nedir? — Cevap: İtikatta mezhebim Ehl-i Sünnet ve’l-Cemaat (imamı Ebû Mansûr Muhammed Mâtürîdî), amelde mezhebim Hanefî mezhebidir (imamı İmâm-ı Âzam Ebû Hanîfe).',
          'Sual: Kur’an’da adı geçen peygamberler kimlerdir? — Cevap: Âdem, İdrîs, Nûh, Hûd, Sâlih, İbrâhim, Lût, İsmâil, İshâk, Ya’kûb, Yûsuf, Eyyûb, Şuayb, Mûsâ, Hârûn, Dâvûd, Süleyman, Yûnus, İlyâs, Elyesa, Zülkifl, Zekeriyyâ, Yahyâ, Îsâ ve son peygamber Muhammed Mustafa (s.a.v.); ayrıca Üzeyr, Lokmân ve Zülkarneyn (a.s.).',
          'Sual: Peygamberimiz (s.a.v.) ne zaman doğdu, hicret etti ve vefat etti? — Cevap: Rebiülevvel ayının 12. Pazartesi günü miladi 571’de Mekke’de doğdu; 622’de Medine’ye hicret etti; miladi 632’de Medine’de vefat etti.',
          'Sual: Otuz iki farz nedir? — Cevap: 6 İmanın şartı, 5 İslam’ın şartı, 4 Abdestin farzı, 3 Guslün farzı, 2 Teyemmümün farzı, 12 Namazın farzı; tamamı 32 farz eder.',
          'Sual: Namazda zamm-ı sûre unutulursa ne lazım gelir? — Cevap: Vâcip terk edildiği için namazın sonunda Sehiv Secdesi yapılır.',
          'Sual: Kaç kandil gecesi vardır? — Cevap: Beş kandil gecesi vardır: Mevlid, Regaib, Miraç, Berat ve Kadir Gecesi.',
        ],
      },
    ],
  },
];
