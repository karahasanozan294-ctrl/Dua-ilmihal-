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
];
