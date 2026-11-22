import { LocationInfo } from '../types/prayer';

const TR_TIMEZONE = 'Europe/Istanbul';

const makeTurkeyCity = (
  id: string,
  name: string,
  latitude: number,
  longitude: number,
  region = 'Türkiye'
): LocationInfo => ({
  id: `tr-${id}`,
  name,
  region,
  country: 'Türkiye',
  latitude,
  longitude,
  timezone: TR_TIMEZONE,
  source: 'preset',
});

export const TURKEY_PROVINCES: LocationInfo[] = [
  makeTurkeyCity('istanbul', 'İstanbul', 41.0082, 28.9784, 'Marmara'),
  makeTurkeyCity('ankara', 'Ankara', 39.9334, 32.8597, 'İç Anadolu'),
  makeTurkeyCity('izmir', 'İzmir', 38.4237, 27.1428, 'Ege'),
  makeTurkeyCity('bursa', 'Bursa', 40.1885, 29.0610, 'Marmara'),
  makeTurkeyCity('antalya', 'Antalya', 36.8969, 30.7133, 'Akdeniz'),
  makeTurkeyCity('konya', 'Konya', 37.8746, 32.4932, 'İç Anadolu'),
  makeTurkeyCity('adana', 'Adana', 37.0000, 35.3213, 'Akdeniz'),
  makeTurkeyCity('gaziantep', 'Gaziantep', 37.0662, 37.3833, 'Güneydoğu Anadolu'),
  makeTurkeyCity('sanliurfa', 'Şanlıurfa', 37.1674, 38.7955, 'Güneydoğu Anadolu'),
  makeTurkeyCity('kocaeli', 'Kocaeli', 40.7654, 29.9408, 'Marmara'),
  makeTurkeyCity('mersin', 'Mersin', 36.8121, 34.6415, 'Akdeniz'),
  makeTurkeyCity('diyarbakir', 'Diyarbakır', 37.9144, 40.2306, 'Güneydoğu Anadolu'),
  makeTurkeyCity('hatay', 'Hatay', 36.2023, 36.1613, 'Akdeniz'),
  makeTurkeyCity('manisa', 'Manisa', 38.6191, 27.4289, 'Ege'),
  makeTurkeyCity('kayseri', 'Kayseri', 38.7312, 35.4787, 'İç Anadolu'),
  makeTurkeyCity('samsun', 'Samsun', 41.2867, 36.3300, 'Karadeniz'),
  makeTurkeyCity('balikesir', 'Balıkesir', 39.6484, 27.8826, 'Marmara'),
  makeTurkeyCity('kahramanmaras', 'Kahramanmaraş', 37.5858, 36.9371, 'Akdeniz'),
  makeTurkeyCity('van', 'Van', 38.5012, 43.3730, 'Doğu Anadolu'),
  makeTurkeyCity('aydin', 'Aydın', 37.8560, 27.8416, 'Ege'),
  makeTurkeyCity('tekirdag', 'Tekirdağ', 40.9781, 27.5117, 'Marmara'),
  makeTurkeyCity('sakarya', 'Sakarya', 40.7569, 30.3783, 'Marmara'),
  makeTurkeyCity('denizli', 'Denizli', 37.7765, 29.0864, 'Ege'),
  makeTurkeyCity('mugla', 'Muğla', 37.2153, 28.3636, 'Ege'),
  makeTurkeyCity('eskisehir', 'Eskişehir', 39.7767, 30.5206, 'İç Anadolu'),
  makeTurkeyCity('mardin', 'Mardin', 37.3212, 40.7245, 'Güneydoğu Anadolu'),
  makeTurkeyCity('trabzon', 'Trabzon', 41.0027, 39.7168, 'Karadeniz'),
  makeTurkeyCity('malatya', 'Malatya', 38.3552, 38.3095, 'Doğu Anadolu'),
  makeTurkeyCity('ordu', 'Ordu', 40.9839, 37.8764, 'Karadeniz'),
  makeTurkeyCity('erzurum', 'Erzurum', 39.9000, 41.2700, 'Doğu Anadolu'),
  makeTurkeyCity('afyonkarahisar', 'Afyonkarahisar', 38.7507, 30.5567, 'Ege'),
  makeTurkeyCity('sivas', 'Sivas', 39.7477, 37.0179, 'İç Anadolu'),
  makeTurkeyCity('adiyaman', 'Adıyaman', 37.7648, 38.2786, 'Güneydoğu Anadolu'),
  makeTurkeyCity('tokat', 'Tokat', 40.3167, 36.5500, 'Karadeniz'),
  makeTurkeyCity('elazig', 'Elazığ', 38.6810, 39.2264, 'Doğu Anadolu'),
  makeTurkeyCity('zonguldak', 'Zonguldak', 41.4564, 31.7987, 'Karadeniz'),
  makeTurkeyCity('batman', 'Batman', 37.8812, 41.1351, 'Güneydoğu Anadolu'),
  makeTurkeyCity('kutahya', 'Kütahya', 39.4167, 29.9833, 'Ege'),
  makeTurkeyCity('canakkale', 'Çanakkale', 40.1553, 26.4142, 'Marmara'),
  makeTurkeyCity('osmaniye', 'Osmaniye', 37.0742, 36.2478, 'Akdeniz'),
  makeTurkeyCity('corum', 'Çorum', 40.5506, 34.9556, 'Karadeniz'),
  makeTurkeyCity('sirnak', 'Şırnak', 37.5164, 42.4611, 'Güneydoğu Anadolu'),
  makeTurkeyCity('giresun', 'Giresun', 40.9128, 38.3895, 'Karadeniz'),
  makeTurkeyCity('isparta', 'Isparta', 37.7648, 30.5566, 'Akdeniz'),
  makeTurkeyCity('agri', 'Ağrı', 39.7191, 43.0503, 'Doğu Anadolu'),
  makeTurkeyCity('yozgat', 'Yozgat', 39.8181, 34.8147, 'İç Anadolu'),
  makeTurkeyCity('edirne', 'Edirne', 41.6771, 26.5557, 'Marmara'),
  makeTurkeyCity('aksaray', 'Aksaray', 38.3687, 34.0370, 'İç Anadolu'),
  makeTurkeyCity('duzce', 'Düzce', 40.8438, 31.1565, 'Karadeniz'),
  makeTurkeyCity('kastamonu', 'Kastamonu', 41.3887, 33.7827, 'Karadeniz'),
  makeTurkeyCity('usak', 'Uşak', 38.6823, 29.4082, 'Ege'),
  makeTurkeyCity('kirklareli', 'Kırklareli', 41.7333, 27.2167, 'Marmara'),
  makeTurkeyCity('nigde', 'Niğde', 37.9667, 34.6833, 'İç Anadolu'),
  makeTurkeyCity('bitlis', 'Bitlis', 38.4006, 42.1095, 'Doğu Anadolu'),
  makeTurkeyCity('rize', 'Rize', 41.0201, 40.5234, 'Karadeniz'),
  makeTurkeyCity('amasya', 'Amasya', 40.6499, 35.8353, 'Karadeniz'),
  makeTurkeyCity('siirt', 'Siirt', 37.9333, 41.9500, 'Güneydoğu Anadolu'),
  makeTurkeyCity('bolu', 'Bolu', 40.7350, 31.6061, 'Karadeniz'),
  makeTurkeyCity('nevsehir', 'Nevşehir', 38.6244, 34.7239, 'İç Anadolu'),
  makeTurkeyCity('mus', 'Muş', 38.7432, 41.5064, 'Doğu Anadolu'),
  makeTurkeyCity('yalova', 'Yalova', 40.6500, 29.2667, 'Marmara'),
  makeTurkeyCity('bingol', 'Bingöl', 38.8854, 40.4966, 'Doğu Anadolu'),
  makeTurkeyCity('kirikkale', 'Kırıkkale', 39.8468, 33.5153, 'İç Anadolu'),
  makeTurkeyCity('hakkari', 'Hakkari', 37.5833, 43.7333, 'Doğu Anadolu'),
  makeTurkeyCity('kars', 'Kars', 40.6167, 43.1000, 'Doğu Anadolu'),
  makeTurkeyCity('burdur', 'Burdur', 37.7203, 30.2908, 'Akdeniz'),
  makeTurkeyCity('karaman', 'Karaman', 37.1759, 33.2287, 'İç Anadolu'),
  makeTurkeyCity('karabuk', 'Karabük', 41.2061, 32.6204, 'Karadeniz'),
  makeTurkeyCity('kirsehir', 'Kırşehir', 39.1425, 34.1709, 'İç Anadolu'),
  makeTurkeyCity('erzincan', 'Erzincan', 39.7500, 39.5000, 'Doğu Anadolu'),
  makeTurkeyCity('bilecik', 'Bilecik', 40.1451, 29.9799, 'Marmara'),
  makeTurkeyCity('sinop', 'Sinop', 42.0231, 35.1531, 'Karadeniz'),
  makeTurkeyCity('igdir', 'Iğdır', 39.9167, 44.0333, 'Doğu Anadolu'),
  makeTurkeyCity('bartin', 'Bartın', 41.6344, 32.3375, 'Karadeniz'),
  makeTurkeyCity('cankiri', 'Çankırı', 40.6013, 33.6134, 'İç Anadolu'),
  makeTurkeyCity('artvin', 'Artvin', 41.1828, 41.8183, 'Karadeniz'),
  makeTurkeyCity('kilis', 'Kilis', 36.7184, 37.1212, 'Güneydoğu Anadolu'),
  makeTurkeyCity('gumushane', 'Gümüşhane', 40.4600, 39.4814, 'Karadeniz'),
  makeTurkeyCity('ardahan', 'Ardahan', 41.1105, 42.7022, 'Doğu Anadolu'),
  makeTurkeyCity('tunceli', 'Tunceli', 39.1079, 39.5401, 'Doğu Anadolu'),
  makeTurkeyCity('bayburt', 'Bayburt', 40.2552, 40.2249, 'Karadeniz'),
];

export const WORLD_CITIES: LocationInfo[] = [
  { id: 'sa-makkah', name: 'Mekke', region: 'Hicaz', country: 'Suudi Arabistan', latitude: 21.3891, longitude: 39.8579, timezone: 'Asia/Riyadh', source: 'preset' },
  { id: 'sa-madinah', name: 'Medine', region: 'Hicaz', country: 'Suudi Arabistan', latitude: 24.5247, longitude: 39.5692, timezone: 'Asia/Riyadh', source: 'preset' },
  { id: 'ps-jerusalem', name: 'Kudüs', region: 'Filistin', country: 'Filistin', latitude: 31.7683, longitude: 35.2137, timezone: 'Asia/Jerusalem', source: 'preset' },
  { id: 'cy-nicosia', name: 'Lefkoşa', region: 'KKTC', country: 'Kıbrıs', latitude: 35.1856, longitude: 33.3823, timezone: 'Asia/Nicosia', source: 'preset' },
  { id: 'az-baku', name: 'Bakü', region: 'Abşeron', country: 'Azerbaycan', latitude: 40.4093, longitude: 49.8671, timezone: 'Asia/Baku', source: 'preset' },
  { id: 'ba-sarajevo', name: 'Saraybosna', region: 'Bosna', country: 'Bosna-Hersek', latitude: 43.8563, longitude: 18.4131, timezone: 'Europe/Sarajevo', source: 'preset' },
  { id: 'mk-skopje', name: 'Üsküp', region: 'Vardar', country: 'Kuzey Makedonya', latitude: 41.9981, longitude: 21.4254, timezone: 'Europe/Skopje', source: 'preset' },
  { id: 'de-berlin', name: 'Berlin', region: 'Berlin', country: 'Almanya', latitude: 52.5200, longitude: 13.4050, timezone: 'Europe/Berlin', source: 'preset' },
  { id: 'de-munich', name: 'Münih', region: 'Bavyera', country: 'Almanya', latitude: 48.1351, longitude: 11.5820, timezone: 'Europe/Berlin', source: 'preset' },
  { id: 'de-cologne', name: 'Köln', region: 'Kuzey Ren-Vestfalya', country: 'Almanya', latitude: 50.9375, longitude: 6.9603, timezone: 'Europe/Berlin', source: 'preset' },
  { id: 'gb-london', name: 'Londra', region: 'İngiltere', country: 'Birleşik Krallık', latitude: 51.5072, longitude: -0.1276, timezone: 'Europe/London', source: 'preset' },
  { id: 'fr-paris', name: 'Paris', region: 'Île-de-France', country: 'Fransa', latitude: 48.8566, longitude: 2.3522, timezone: 'Europe/Paris', source: 'preset' },
  { id: 'nl-amsterdam', name: 'Amsterdam', region: 'Kuzey Hollanda', country: 'Hollanda', latitude: 52.3676, longitude: 4.9041, timezone: 'Europe/Amsterdam', source: 'preset' },
  { id: 'at-vienna', name: 'Viyana', region: 'Viyana', country: 'Avusturya', latitude: 48.2082, longitude: 16.3738, timezone: 'Europe/Vienna', source: 'preset' },
  { id: 'be-brussels', name: 'Brüksel', region: 'Brüksel', country: 'Belçika', latitude: 50.8503, longitude: 4.3517, timezone: 'Europe/Brussels', source: 'preset' },
  { id: 'ch-zurich', name: 'Zürih', region: 'Zürih', country: 'İsviçre', latitude: 47.3769, longitude: 8.5417, timezone: 'Europe/Zurich', source: 'preset' },
  { id: 'us-nyc', name: 'New York', region: 'New York', country: 'ABD', latitude: 40.7128, longitude: -74.0060, timezone: 'America/New_York', source: 'preset' },
  { id: 'us-chicago', name: 'Chicago', region: 'Illinois', country: 'ABD', latitude: 41.8781, longitude: -87.6298, timezone: 'America/Chicago', source: 'preset' },
  { id: 'ca-toronto', name: 'Toronto', region: 'Ontario', country: 'Kanada', latitude: 43.6532, longitude: -79.3832, timezone: 'America/Toronto', source: 'preset' },
  { id: 'ae-dubai', name: 'Dubai', region: 'Dubai', country: 'Birleşik Arap Emirlikleri', latitude: 25.2048, longitude: 55.2708, timezone: 'Asia/Dubai', source: 'preset' },
  { id: 'eg-cairo', name: 'Kahire', region: 'Kahire', country: 'Mısır', latitude: 30.0444, longitude: 31.2357, timezone: 'Africa/Cairo', source: 'preset' },
  { id: 'my-kualalumpur', name: 'Kuala Lumpur', region: 'Selangor', country: 'Malezya', latitude: 3.1390, longitude: 101.6869, timezone: 'Asia/Kuala_Lumpur', source: 'preset' },
  { id: 'jp-tokyo', name: 'Tokyo', region: 'Kanto', country: 'Japonya', latitude: 35.6762, longitude: 139.6503, timezone: 'Asia/Tokyo', source: 'preset' },
  { id: 'au-sydney', name: 'Sidney', region: 'Yeni Güney Galler', country: 'Avustralya', latitude: -33.8688, longitude: 151.2093, timezone: 'Australia/Sydney', source: 'preset' },
];

export const ALL_PRESET_CITIES: LocationInfo[] = [
  ...TURKEY_PROVINCES,
  ...WORLD_CITIES,
];

export const normalizeTurkish = (value: string): string =>
  value
    .toLocaleLowerCase('tr-TR')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/â/g, 'a')
    .replace(/î/g, 'i')
    .replace(/û/g, 'u')
    .trim();

export function searchPresetCities(query: string): LocationInfo[] {
  const normalized = normalizeTurkish(query);
  if (!normalized) return ALL_PRESET_CITIES.slice(0, 12);

  return ALL_PRESET_CITIES.filter((city) => {
    const haystack = normalizeTurkish(
      `${city.name} ${city.region ?? ''} ${city.country}`
    );
    return haystack.includes(normalized);
  }).slice(0, 12);
}

interface OpenMeteoGeoResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
  timezone?: string;
}

export async function searchGlobalCities(
  query: string,
  signal?: AbortSignal
): Promise<LocationInfo[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    trimmed
  )}&count=8&language=tr&format=json`;

  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error('Küresel konum araması yanıt vermedi');
  }
  const data = (await response.json()) as { results?: OpenMeteoGeoResult[] };
  if (!data.results || !Array.isArray(data.results)) return [];

  return data.results.map((item) => ({
    id: `geo-${item.id}`,
    name: item.name,
    region: item.admin1,
    country: item.country || 'Dünya',
    latitude: Number(item.latitude.toFixed(4)),
    longitude: Number(item.longitude.toFixed(4)),
    timezone: item.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    source: 'search',
  }));
}

export async function reverseGeocodeLocation(
  latitude: number,
  longitude: number
): Promise<LocationInfo> {
  const fallbackTimezone =
    Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Istanbul';

  let name = 'Mevcut Konum';
  let region = '';
  let country = '';

  try {
    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&accept-language=tr`;
    const res = await fetch(nominatimUrl, {
      headers: { Accept: 'application/json' },
    });
    if (res.ok) {
      const json = (await res.json()) as {
        address?: {
          city?: string;
          town?: string;
          district?: string;
          county?: string;
          state?: string;
          province?: string;
          country?: string;
        };
      };
      const addr = json.address;
      if (addr) {
        name =
          addr.district ||
          addr.town ||
          addr.city ||
          addr.county ||
          addr.province ||
          'Mevcut Konum';
        region = addr.province || addr.state || '';
        country = addr.country || '';
      }
    }
  } catch {
    // Fallback gracefully to nearest preset city name if offline
    const nearest = findNearestPresetCity(latitude, longitude);
    if (nearest) {
      name = `${nearest.name} Çevresi`;
      region = nearest.region || '';
      country = nearest.country;
    }
  }

  return {
    id: `gps-${latitude.toFixed(3)}-${longitude.toFixed(3)}`,
    name,
    region: region && region !== name ? region : undefined,
    country: country || 'GPS Konumu',
    latitude: Number(latitude.toFixed(4)),
    longitude: Number(longitude.toFixed(4)),
    timezone: fallbackTimezone,
    source: 'gps',
  };
}

export function findNearestPresetCity(
  lat: number,
  lon: number
): LocationInfo | null {
  let best: LocationInfo | null = null;
  let minDistance = Infinity;
  for (const city of ALL_PRESET_CITIES) {
    const dLat = city.latitude - lat;
    const dLon = city.longitude - lon;
    const dist = dLat * dLat + dLon * dLon;
    if (dist < minDistance) {
      minDistance = dist;
      best = city;
    }
  }
  return best;
}
