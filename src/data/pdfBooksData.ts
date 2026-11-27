export interface PdfChapterJump {
  label: string;
  page: number;
}

export interface BuiltInPdfBook {
  id: string;
  title: string;
  authorOrPublisher: string;
  subtitle: string;
  url: string;
  pageCount: number;
  sizeLabel: string;
  chapters: PdfChapterJump[];
}

export const BUILTIN_PDF_BOOKS: BuiltInPdfBook[] = [
  {
    id: 'fazilet-muhtasar-ilmihal-pdf',
    title: 'Resimli Muhtasar İlmihal (Orijinal Baskı)',
    authorOrPublisher: 'Fazilet Neşriyat',
    subtitle: 'Hanefî Mezhebi Üzere Zarurî Dinî Bilgiler',
    url: '/books/muhtasar-ilmihal-fazilet.pdf',
    pageCount: 240,
    sizeLabel: '15.0 MB',
    chapters: [
      { label: 'Kapak ve Künye', page: 1 },
      { label: 'İçindekiler', page: 3 },
      { label: 'Önsöz ve Mühim Hatırlatma', page: 9 },
      { label: 'İman Bahsi ve İmanın Şartları', page: 13 },
      { label: 'Peygamberimiz (s.a.v.) ve Ashab-ı Kiram', page: 26 },
      { label: 'Kader, Kaza, Rızık ve Tevekkül', page: 37 },
      { label: 'Edille-i Şer’iyye, Mezhepler ve İslam’ın Şartları', page: 45 },
      { label: 'Hadesten Tahâret ve Abdest', page: 54 },
      { label: 'Resimli Abdest Alınışı', page: 62 },
      { label: 'Gusül ve Teyemmüm (Resimli)', page: 74 },
      { label: 'Mestler Üzerine Mesh ve Özür Halleri', page: 85 },
      { label: 'Kerâhet Vakitleri, Ezan ve Kamet', page: 92 },
      { label: 'Namazda Okunan Sure ve Dualar', page: 97 },
      { label: 'Namazın Vacipleri, Sünnetleri ve Mekruhları', page: 114 },
      { label: 'Namazın Kılınışı ve Namaz Resimleri', page: 123 },
      { label: 'Beş Vakit, Vitir, Sehiv, Cuma ve Bayram', page: 146 },
      { label: 'Kaza ve Nafile Namazlar (Tesbih Namazı)', page: 154 },
      { label: 'Cenaze Bahsi, Seferîlik ve Mübarek Geceler', page: 160 },
      { label: 'Oruç, Teravih, İtikâf, Fitre ve Zekât', page: 179 },
      { label: 'Hac, Kurban, Büyük Günahlar ve Tövbe', page: 189 },
      { label: 'Bazı Dualar (Ahzab, Hatim, Yemek Duası)', page: 202 },
      { label: 'Otuz İki Farz ve Elli Dört Farz', page: 219 },
      { label: 'Müslüman Çocuğuna Dinî Sualler (Soru–Cevap)', page: 224 },
    ],
  },
  {
    id: 'ramuz-el-hadis-cilt-1',
    title: 'Râmûzü’l-Ehâdîs ve Dersleri — Cilt 1',
    authorOrPublisher: 'Ahmed Ziyâeddin Gümüşhânevî · Mehmed Zâhid Kotku',
    subtitle: 'Arapça Harekeli Metin, Kaynak Remizleri, Meal ve Şerhler (s. 1–647)',
    url: '/books/ramuzul-ehadis-cilt-1.pdf',
    pageCount: 647,
    sizeLabel: '9.7 MB',
    chapters: [
      { label: 'Kapak ve İçindekiler', page: 3 },
      { label: 'Önsöz (Eser ve Tertip Hakkında)', page: 15 },
      { label: 'Kısaltmalar ve Kaynak Remizleri', page: 17 },
      { label: '01. Hadis-i Şeriflerin Gayesi', page: 29 },
      { label: '02. Takvâ Ehli Olmanın Önemi', page: 60 },
      { label: '03. Şirk’ten Uzak Durun!', page: 87 },
      { label: '04. Müjdeler Olsun...', page: 120 },
      { label: '05. Allah’ın Sevmediği Kimseler', page: 157 },
      { label: '06. Ramazan Ayı Bereket Ayı', page: 192 },
      { label: '07. Allah’ın Rahmeti Sonsuz', page: 228 },
      { label: '08. Âlimlere Tâbi Olun!', page: 268 },
      { label: '09. Nerede Olsan Allah’tan Kork!', page: 306 },
      { label: '10. Namazı Dosdoğru Kıl!', page: 344 },
      { label: '11. Fakirleri Seviniz!', page: 373 },
      { label: '12. Zayıflar ve Miskinler', page: 415 },
      { label: '13. Haramlardan Sakın!', page: 453 },
      { label: '14. Yatarken Okunacak Sûreler', page: 490 },
      { label: '15. Allah Bir Kavmin İyiliğini İsterse', page: 536 },
      { label: '16. Ümmetin Helâk Olması', page: 566 },
      { label: '17. Hastalıklar ve Dualar', page: 599 },
      { label: '18. Kıyamet Alâmetleri', page: 620 },
    ],
  },
  {
    id: 'ramuz-el-hadis-cilt-2',
    title: 'Râmûzü’l-Ehâdîs ve Dersleri — Cilt 2',
    authorOrPublisher: 'Ahmed Ziyâeddin Gümüşhânevî · Mehmed Zâhid Kotku',
    subtitle: 'Arapça Harekeli Metin, Kaynak Remizleri, Meal ve Şerhler (s. 1–636)',
    url: '/books/ramuzul-ehadis-cilt-2.pdf',
    pageCount: 636,
    sizeLabel: '10.4 MB',
    chapters: [
      { label: 'Kapak ve İçindekiler', page: 3 },
      { label: 'Önsöz ve Kısaltmalar', page: 19 },
      { label: '01. Aranızda Selâmı Çoğaltın!', page: 33 },
      { label: '02. Yemekte Besmele ve Dua', page: 54 },
      { label: '03. Namazın Kılınışı', page: 95 },
      { label: '04. Abdest Almanın Mükâfâtı', page: 142 },
      { label: '05. İlim Öğrenin!', page: 188 },
      { label: '06. Camide Yapılacak Şeyler', page: 239 },
      { label: '07. Rasûlüllah’a Salât ü Selâmı Çok Eylemek', page: 266 },
      { label: '08. Peygamber (s.a.v.)’in Bazı Halleri', page: 307 },
      { label: '09. Sefere Çıkma Âdâbı', page: 346 },
      { label: '10. Besmeleyle Başlamak', page: 383 },
      { label: '11. Mü’min Kardeşin İçin Dua', page: 428 },
      { label: '12. Duanın İncelikleri', page: 475 },
      { label: '13. Mescidin Âdâbı', page: 514 },
      { label: '14. Fakirlik ve Hastalık', page: 542 },
      { label: '15. Bismillâh Her Hayrın Başı', page: 560 },
      { label: '16. Muhammed İsmi Mübarektir', page: 598 },
    ],
  },
];

