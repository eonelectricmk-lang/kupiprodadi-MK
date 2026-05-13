import getDb from '@/lib/db';

export const SYSTEM_EMAIL = 'kupiprodadi@system.mk';

export const CATEGORY_MAP: Record<string, string> = {
  'автомобили': 'Моторни Возила',
  'автомобил': 'Моторни Возила',
  'возење': 'Моторни Возила',
  'мотоцикли': 'Моторни Возила',
  'велосипеди': 'Моторни Возила',
  'резервни делови': 'Моторни Возила',
  'станови': 'Недвижности',
  'куќи': 'Недвижности',
  'куки': 'Недвижности',
  'земја': 'Недвижности',
  'zemja': 'Недвижности',
  'недвижности': 'Недвижности',
  'намештај': 'Дом и Градина',
  'nametej': 'Дом и Градина',
  'мебел': 'Дом и Градина',
  'дом': 'Дом и Градина',
  'градина': 'Дом и Градина',
  'бела техника': 'Дом и Градина',
  'мода': 'Мода и Облека и Обувки',
  'облека': 'Мода и Облека и Обувки',
  'обувки': 'Мода и Облека и Обувки',
  'мобилни': 'Мобилни телефони и додатоци',
  'телефон': 'Мобилни телефони и додатоци',
  'iphone': 'Мобилни телефони и додатоци',
  'самсунг': 'Мобилни телефони и додатоци',
  'samsung': 'Мобилни телефони и додатоци',
  'таблет': 'Мобилни телефони и додатоци',
  'компјутер': 'Компјутери',
  'kompjuter': 'Компјутери',
  'лаптоп': 'Компјутери',
  'laptop': 'Компјутери',
  'десктоп': 'Компјутери',
  'монитор': 'Компјутери',
  'телевизор': 'ТВ, Видео, Фото и Мултимедија',
  'тв': 'ТВ, Видео, Фото и Мултимедија',
  'tv': 'ТВ, Видео, Фото и Мултимедија',
  'фото': 'ТВ, Видео, Фото и Мултимедија',
  'видео': 'ТВ, Видео, Фото и Мултимедија',
  'музички': 'Музички инструменти и опрема',
  'гитара': 'Музички инструменти и опрема',
  'часовник': 'Часовници и Накит',
  'часовници': 'Часовници и Накит',
  'накит': 'Часовници и Накит',
  'беби': 'Беби и Детски производи',
  'бeби': 'Беби и Детски производи',
  'детски': 'Беби и Детски производи',
  'играчки': 'Беби и Детски производи',
  'здравје': 'Здравје, Убавина додатоци и опрема',
  'ubavina': 'Здравје, Убавина додатоци и опрема',
  'козметика': 'Здравје, Убавина додатоци и опрема',
  'книги': 'Книги и литература',
  'knigi': 'Книги и литература',
  'литература': 'Книги и литература',
  'спорт': 'Спортска опрема и активности',
  'sport': 'Спортска опрема и активности',
  'фитнес': 'Спортска опрема и активности',
  'fitnes': 'Спортска опрема и активности',
  'хоби': 'Слободно време и хоби, Животни',
  'hobi': 'Слободно време и хоби, Животни',
  'животни': 'Слободно време и хоби, Животни',
  'храна': 'Храна и готвење',
  'hrana': 'Храна и готвење',
  'бизнис': 'Бизнис и дејности, Машини алати',
  'biznis': 'Бизнис и дејности, Машини алати',
  'услуги': 'Услуги, Сервисери',
  'uslugi': 'Услуги, Сервисери',
  'сервис': 'Услуги, Сервисери',
  'вработување': 'Вработување',
  'vrabotuvanje': 'Вработување',
  'настани': 'Настани, Ноќен живот, Изложби',
  'nastani': 'Настани, Ноќен живот, Изложби',
  'туризам': 'Одмор, Туризам, Билети, Патувања',
  'turizam': 'Одмор, Туризам, Билети, Патувања',
  'патување': 'Одмор, Туризам, Билети, Патувања',
  'одмор': 'Одмор, Туризам, Билети, Патувања',
};

export interface CrmAdData {
  title: string;
  description?: string;
  price?: number | string;
  city?: string;
  category?: string;
  sellerName?: string;
  phone?: string;
  images?: string[];
  link?: string;
  rawText?: string;
}

export interface ImportResult {
  id: number;
  url: string;
  message: string;
}

export function mapCategory(raw: string): string {
  if (!raw) return 'Останато';
  const key = raw.toLowerCase().trim();
  if (CATEGORY_MAP[key]) return CATEGORY_MAP[key];
  for (const [pattern, mapped] of Object.entries(CATEGORY_MAP)) {
    if (key.includes(pattern)) return mapped;
  }
  return 'Останато';
}

export function parsePrice(raw: string | number | undefined | null): { price: number; currency: string } {
  if (raw == null || raw === '') return { price: 0, currency: 'ден' };

  let s = String(raw).trim();

  let currency = 'ден';
  if (/€/i.test(s)) currency = '€';
  else if (/\$/i.test(s)) currency = '$';
  else if (/(ден|дин|mkd)\b/i.test(s)) currency = 'ден';

  s = s.replace(/[€$€]/g, ' ')
    .replace(/\b(eur|usd|mkd|ден|дин)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!s) return { price: 0, currency };

  if (s.includes(',')) {
    s = s.replace(/\./g, '').replace(',', '.');
    return { price: parseFloat(s) || 0, currency };
  }

  const dotCount = (s.match(/\./g) || []).length;
  if (dotCount >= 2) {
    s = s.replace(/\./g, '');
    return { price: parseInt(s, 10) || 0, currency };
  }

  if (dotCount === 1) {
    const parts = s.split('.');
    if (parts[1] && parts[1].length === 3) {
      s = parts.join('');
      return { price: parseInt(s, 10) || 0, currency };
    }
  }

  return { price: parseFloat(s) || 0, currency };
}

export function getSystemUser(): { id: number } | null {
  const db = getDb();
  const user = db.prepare('SELECT id FROM users WHERE email = ?').get(SYSTEM_EMAIL) as { id: number } | undefined;
  return user || null;
}
