export interface TefsirTopicSection {
  id: string;
  surahNumber: number;
  title: string;
  volumeHint: string;
  ayahRange: string;
  nuzulContext: string;
  keyConcepts: { term: string; explanation: string }[];
  tefsirSummary: string[];
}

export const HAK_DINI_MUKADDIME = {
  title: 'Hak Dini Kur’an Dili — Mukaddime Özeti',
  author: 'Elmalılı Muhammed Hamdi Yazır (1878–1942)',
  subtitle: 'Yeni Mealli Türkçe Tefsir · Kur’an’ı Anlama ve Tefsir Usulü',
  points: [
    {
      heading: 'Tefsir ile Te’vil Arasındaki Fark',
      text: 'Elmalılı merhum mukaddimesinde, tefsirin lafızların açık delaletini, lügavi ve şer’i manalarını ortaya koymak; te’vilin ise birden çok muhtemel manadan ayetin siyâkına ve şer’i usule en uygun olanını ilmi bir dirayetle tercih etmek olduğunu belirtir.',
    },
    {
      heading: 'Tercüme ve Meal Kavramı',
      text: 'Kur’an-ı Kerim’in nazmı, belâgatı ve lafızlarındaki derinlik başka bir dile birebir aktarılamaz. Bu sebeple yapılan Türkçe aktarım “Kur’an’ın aynısı” değil, manasına yaklaşmaya çalışan bir “meal” ve “tefsir”dir.',
    },
    {
      heading: 'Besmele’nin Sırrı',
      text: '“Rahmân ve Rahîm olan Allah’ın ismiyle”: Elmalılı’ya göre Rahmân, dünyada mümin-kâfir ayrımı yapmaksızın bütün mahlûkata rızık ve hayat veren sonsuz rahmet; Rahîm ise özellikle iman edip salih amel işleyen kullara ahirette de tecelli edecek hususi merhamettir.',
    },
  ],
};

export const HAK_DINI_TEFSIR_SECTIONS: TefsirTopicSection[] = [
  {
    id: 'fatiha',
    surahNumber: 1,
    title: 'Fâtiha Suresi Tefsiri (Ümmü’l-Kur’ân)',
    volumeHint: '1. Cilt',
    ayahRange: '1–7. Ayetler',
    nuzulContext:
      'Mekke döneminde nazil olan ilk tam suredir. Kur’an’ın özeti ve namazın her rekâtında okunan temel duası olduğu için “Kitabın Anası” (Ümmü’l-Kitâb) diye anılır.',
    keyConcepts: [
      {
        term: 'Elhamdülillâh',
        explanation:
          'Övgünün her çeşidi ezeli ve ebedi olarak yalnız Allah’a aittir; şükür nimet karşılığında, hamd ise hem nimet hem de Zât-ı Ulûhiyet’in kemal sıfatları için yapılır.',
      },
      {
        term: 'İyyâke na’büdü ve iyyâke nestaîn',
        explanation:
          'Kul ile Rabbi arasındaki tevhid sözleşmesidir: Önce kulluk (“Yalnız sana ibadet ederiz”), ardından bütün güç ve başarının O’ndan istendiği tevekkül (“Yalnız senden yardım dileriz”).',
      },
      {
        term: 'Sırât-ı Müstakîm',
        explanation:
          'İfrat ve tefritten uzak, peygamberlerin, sıddıkların, şehitlerin ve salihlerin yürüdüğü dosdoğru hakikat yolu.',
      },
    ],
    tefsirSummary: [
      'Sure, kulun Rabbini hamd ve sena ile tanımasıyla başlar; ardından Mâlik-i Yevmiddîn bilinciyle hesap sorumluluğunu hatırlatır.',
      'Orta ayet olan “İyyâke na’büdü”, gaibden (O’ndan) hitaba (Sana) geçiş yaparak kulun Rabbine doğrudan yönelişini ve ihlasını ifade eder.',
      'Son ayetlerde hidayet duası yapılırken örnek alınacak nimet ehli ile sakınılacak iki sapma biçimi (hakikati bildiği hâlde kibirle gazaba uğrayanlar ve cehaletle yoldan çıkanlar) dengeli biçimde açıklanır.',
    ],
  },
  {
    id: 'ayetel-kursi',
    surahNumber: 2,
    title: 'Bakara Suresi: Âyete’l-Kürsî Tefsiri',
    volumeHint: '2. Cilt',
    ayahRange: '255. Ayet',
    nuzulContext:
      'Medine’de nazil olan Bakara Suresi’nin 255. ayeti, tevhid akidesini ve Allah’ın kâinat üzerindeki mutlak hâkimiyetini en veciz şekilde beyan eden “Ayetlerin Efendisi”dir.',
    keyConcepts: [
      {
        term: 'El-Hayy ve El-Kayyûm',
        explanation:
          'Ezeli ve ebedi hayat sahibi olan Allah (Hayy), bütün varlıkları ayakta tutan, varlıklarını ve düzenlerini her an sürdüren yegâne kudrettir (Kayyûm).',
      },
      {
        term: 'Kürsî',
        explanation:
          'Elmalılı tefsirinde Kürsî’nin, Allah’ın ilmini, kudretini ve bütün gökler ile yeri kuşatan saltanat ve hükümranlığını temsil ettiği vurgulanır.',
      },
    ],
    tefsirSummary: [
      'Ayet, Allah’ın Zât’ını her türlü acizlikten (uyuklama ve uyku gibi beşerî hallerden) tenzih ederek başlar.',
      'Göklerde ve yerde ne varsa O’nun mülkü olduğu, izni olmadan kimsenin şefaat edemeyeceği belirtilerek bütün batıl aracı ve şefaat kuruntuları reddedilir.',
      'Kâinatı koruyup gözetmenin (hıfz) Allah’a hiçbir ağırlık vermediği vurgulanarak müminin kalbine sarsılmaz bir emniyet duygusu verilir.',
    ],
  },
  {
    id: 'amenerrasulu',
    surahNumber: 2,
    title: 'Bakara Suresi: Âmenerrasûlü (Son İki Ayet)',
    volumeHint: '2. Cilt',
    ayahRange: '285–286. Ayetler',
    nuzulContext:
      'Miraç gecesinde hediye edildiği rivayet edilen bu iki ayet, İslam iman esaslarını ve kulun gücünün sınırları içinde sorumlu tutulduğunu beyan eder.',
    keyConcepts: [
      {
        term: 'Semi’nâ ve ata’nâ',
        explanation:
          '“İşittik ve itaat ettik”: Müminin vahiy karşısındaki teslimiyet ve samimi amel tavrıdır.',
      },
      {
        term: 'Lâ yükellifullâhu nefsen illâ vüs’ahâ',
        explanation:
          'İlahi adalet ve rahmet ilkesi: Allah hiçbir nefse taşıyamayacağı yükü yüklemez; herkes kazandığı iyiliğin mükâfatını ve işlediği kötülüğün karşılığını görür.',
      },
    ],
    tefsirSummary: [
      'Peygamber ve müminlerin Allah’a, meleklerine, kitaplarına ve peygamberlerinin hiçbirini ayırt etmeksizin iman ettikleri bildirilir.',
      'Son ayet, müminlere hem kulluk bilinci hem de ilahi rahmete sığınma adabını öğreten yedi maddelik kapsamlı bir dua ile son bulur.',
    ],
  },
  {
    id: 'yasin',
    surahNumber: 36,
    title: 'Yâsîn Suresi Tefsiri (Kur’an’ın Kalbi)',
    volumeHint: '6. Cilt',
    ayahRange: '1–83. Ayetler',
    nuzulContext:
      'Mekke döneminde nazil olmuştur. Risalet, tevhid, kâinat ayetleri ve ahiret dirilişi (ba’s) konularını etkileyici bir üslupla işler.',
    keyConcepts: [
      {
        term: 'Kur’ân-ı Hakîm',
        explanation:
          'Hikmetlerle dolu, hükümleri sağlam ve insanı hakikate ulaştıran Kur’an.',
      },
      {
        term: 'Kün fe-yekûn',
        explanation:
          '“Ol der ve hemen olur”: Allah’ın yaratma iradesinin hiçbir vasıta veya zorluğa bağlı olmadığını ifade eden mutlak kudret beyanı.',
      },
    ],
    tefsirSummary: [
      'Sure, Hz. Peygamber’in (s.a.v.) risaletini tasdik ederek başlar ve Habîb-i Neccâr kıssasıyla hakikati savunmanın ve şehadetin örneğini sunar.',
      'Ölü toprağın diriltilmesi, gece ve gündüzün dönüşümü, güneş ve ayın yörüngeleri üzerinden tevhid ve yeniden diriliş delilleri akla ve vicdana sunulur.',
    ],
  },
  {
    id: 'mulk',
    surahNumber: 67,
    title: 'Mülk (Tebâreke) Suresi Tefsiri',
    volumeHint: '7. Cilt',
    ayahRange: '1–30. Ayetler',
    nuzulContext:
      'Mekke’de inmiştir. Kâinattaki kusursuz düzeni, ölüm ve hayatın imtihan hikmetini anlatır.',
    keyConcepts: [
      {
        term: 'Eyyüküm ahsenü amelâ',
        explanation:
          'Ölüm ve hayatın yaratılış gayesi “en çok amel eden” değil, “en güzel ve en ihlaslı amel edenin” ortaya çıkmasıdır.',
      },
    ],
    tefsirSummary: [
      'Yedi göğün birbiriyle tam bir ahenk içinde yaratıldığına dikkat çekilerek insan tefekküre davet edilir.',
      'Nimetlerin kaynağının Allah olduğu ve her türlü zorlukta gerçek sığınağın yalnızca Rahmân olduğu vurgulanır.',
    ],
  },
  {
    id: 'insirah',
    surahNumber: 94,
    title: 'İnşirâh Suresi Tefsiri',
    volumeHint: '8. Cilt',
    ayahRange: '1–8. Ayetler',
    nuzulContext:
      'Mekke döneminde, tebliğ sürecindeki ağır sıkıntılar sırasında Resûlullah’ı (s.a.v.) teselli etmek ve ümit vermek için indirilmiştir.',
    keyConcepts: [
      {
        term: 'İnne me’al-usri yüsrâ',
        explanation:
          '“Şüphesiz güçlükle beraber bir kolaylık vardır”: Elmalılı, buradaki “el-usr” kelimesinin marife (tek bir zorluk), “yüsr” kelimesinin ise nekre (iki ayrı kolaylık) gelmesine dikkat çekerek “bir zorluğun iki kolaylığa galip gelemeyeceğini” açıklar.',
      },
    ],
    tefsirSummary: [
      'Göğsün açılıp ferahlatılması (şerh-i sadr), iman ve hikmetle kalbin genişletilmesi demektir.',
      'Son ayet (“Bir işi bitirince hemen diğerine koyul ve yalnız Rabbine yönel”), müminin hayatında tembelliğe yer olmadığını ve her emeğin Allah rızasına bağlanması gerektiğini öğretir.',
    ],
  },
  {
    id: 'asr',
    surahNumber: 103,
    title: 'Asr Suresi Tefsiri',
    volumeHint: '9. Cilt',
    ayahRange: '1–3. Ayetler',
    nuzulContext:
      'Mekke döneminde nazil olmuştur. İmam Şâfiî’nin “Kur’an’da sadece bu sure inmiş olsaydı insanlara yeterdi” dediği özlü kurtuluş reçetesidir.',
    keyConcepts: [
      {
        term: 'Hüsran',
        explanation:
          'Zaman sermayesini boş yere tüketip ebedi saadeti kaybetmek. Zaman akıp giderken insanın ziyandan kurtulması ancak dört şartla mümkündür: İman, Salih Amel, Hakkı Tavsiye ve Sabrı Tavsiye.',
      },
    ],
    tefsirSummary: [
      'Elmalılı tefsirinde ilk iki şartın (iman ve salih amel) bireysel olgunluğu, son iki şartın (hakkı ve sabrı tavsiye) ise toplumsal sorumluluk ve dayanışmayı tamamladığı belirtilir.',
    ],
  },
  {
    id: 'ihlas',
    surahNumber: 112,
    title: 'İhlâs Suresi Tefsiri',
    volumeHint: '9. Cilt',
    ayahRange: '1–4. Ayetler',
    nuzulContext:
      'Mekke’de müşriklerin “Rabbini bize tarif et” sorusu üzerine inmiştir. Tevhid inancının saf ve özlü beyanı olduğu için Kur’an’ın üçte birine denk tutulmuştur.',
    keyConcepts: [
      {
        term: 'Ehad ve Samed',
        explanation:
          'Ehad: Bölünmeyen, eşi ve benzeri olmayan mutlak bir. Samed: Her şeyin kendisine muhtaç olduğu, kendisi ise hiçbir şeye muhtaç olmayan yegâne merci.',
      },
    ],
    tefsirSummary: [
      'Sure, Allah’ın birliğini ispatladıktan sonra doğurma, doğurulma ve denkliğe sahip olma gibi yaratılmışlara ait bütün noksanlıkları kesin biçimde nefyeder.',
    ],
  },
];
