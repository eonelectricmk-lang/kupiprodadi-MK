export type Subcategory = {
  name: string;
  slug: string;
  count?: number;
};

export type Category = {
  name: string;
  slug: string;
  icon: string;
  subcategories: Subcategory[];
};

export const CATEGORIES: Category[] = [
  {
    name: 'Моторни Возила',
    slug: 'motorni-vozila',
    icon: 'car',
    subcategories: [
      { name: 'Автомобили', slug: 'avtomobili' },
      { name: 'Мотоцикли', slug: 'motocikli' },
      { name: 'Велосипеди', slug: 'velosipedi' },
      { name: 'Резервни делови', slug: 'rezervni-delovi' },
    ],
  },
  {
    name: 'Недвижности',
    slug: 'nedvoznosti',
    icon: 'house',
    subcategories: [
      { name: 'Куќи', slug: 'kuki' },
      { name: 'Станови', slug: 'stanovi' },
      { name: 'Земја', slug: 'zemja' },
      { name: 'Гаражи', slug: 'garazi' },
    ],
  },
  {
    name: 'Дом и Градина',
    slug: 'dom-gradina',
    icon: 'sofa',
    subcategories: [
      { name: 'Намештај', slug: 'nametej' },
      { name: 'Кујнски прибор', slug: 'kujnski' },
      { name: 'Бела техника', slug: 'bela-tehnika' },
      { name: 'Градински алати', slug: 'gradinski' },
    ],
  },
  {
    name: 'Мода и Облека и Обувки',
    slug: 'moda-obleka',
    icon: 'shirt',
    subcategories: [
      { name: 'Машни за мажи', slug: 'masni-mazи' },
      { name: 'Машни за жени', slug: 'masni-zeni' },
      { name: 'Обувки', slug: 'obuvki' },
      { name: 'Аксесории', slug: 'aksesorii' },
    ],
  },
  {
    name: 'Мобилни телефони и додатоци',
    slug: 'mobilni-telefoni',
    icon: 'smartphone',
    subcategories: [
      { name: 'Мобилни телефони', slug: 'telefoni' },
      { name: 'Таблети', slug: 'tableti' },
      { name: 'Слушалки', slug: 'slusalki' },
      { name: 'Полначи и кабли', slug: 'polnaci' },
    ],
  },
  {
    name: 'Компјутери',
    slug: 'kompjuteri',
    icon: 'monitor',
    subcategories: [
      { name: 'Лаптопи', slug: 'laptopi' },
      { name: 'Десктоп компјутери', slug: 'desktop' },
      { name: 'Монитори', slug: 'monitori' },
      { name: 'Периферни уреди', slug: 'periferija' },
    ],
  },
  {
    name: 'ТВ, Видео, Фото и Мултимедија',
    slug: 'tv-video-foto',
    icon: 'tv',
    subcategories: [
      { name: 'Телевизори', slug: 'televizori' },
      { name: 'Видео камери', slug: 'video-kameri' },
      { name: 'Фотоапарати', slug: 'fotoaparati' },
      { name: 'Проектори', slug: 'projektori' },
    ],
  },
  {
    name: 'Музички инструменти и опрема',
    slug: 'muzicki-instrumenti',
    icon: 'guitar',
    subcategories: [
      { name: 'Гитари', slug: 'gitari' },
      { name: 'Клавијатури', slug: 'klavijature' },
      { name: 'Барабани', slug: 'barabani' },
      { name: 'Звучна опрема', slug: 'zvucna-oprema' },
    ],
  },
  {
    name: 'Часовници и Накит',
    slug: 'casovnici-nakij',
    icon: 'watch',
    subcategories: [
      { name: 'Часовници', slug: 'casovnici' },
      { name: 'Прстени', slug: 'prsteni' },
      { name: 'Огрлици', slug: 'ogrlici' },
      { name: 'Наушници', slug: 'naushnici' },
    ],
  },
  {
    name: 'Беби и Детски производи',
    slug: 'bebi-detski',
    icon: 'baby',
    subcategories: [
      { name: 'Беби опрема', slug: 'bebi-oprema' },
      { name: 'Детски облека', slug: 'detski-obleka' },
      { name: 'Играчки', slug: 'igracki' },
      { name: 'Детски мебел', slug: 'detski-mebel' },
    ],
  },
  {
    name: 'Здравје, Убавина додатоци и опрема',
    slug: 'zdravje-ubavina',
    icon: 'heart',
    subcategories: [
      { name: 'Козметика', slug: 'kozmetika' },
      { name: 'Здравствена опрема', slug: 'zdravstvena-oprema' },
      { name: 'Фитнес опрема', slug: 'fitnes' },
      { name: 'Парфеми и масла', slug: 'parfemi' },
    ],
  },
  {
    name: 'CD, DVD, VHS Музика, Филмови',
    slug: 'cd-dvd-vhs',
    icon: 'disc',
    subcategories: [
      { name: 'CD музика', slug: 'cd-muzika' },
      { name: 'DVD филмови', slug: 'dvd-filmovi' },
      { name: 'Винилни плочи', slug: 'vinilni' },
      { name: 'VHS касети', slug: 'vhs' },
    ],
  },
  {
    name: 'Книги и литература',
    slug: 'knigi-literatura',
    icon: 'book',
    subcategories: [
      { name: 'Романи', slug: 'romani' },
      { name: 'Образовни книги', slug: 'obrazovni' },
      { name: 'Научна фантастика', slug: 'naucna-fantastika' },
      { name: 'Поезија', slug: 'poezija' },
    ],
  },
  {
    name: 'Канцелариски и Школски прибор',
    slug: 'kancelarijski-skolski',
    icon: 'paperclip',
    subcategories: [
      { name: 'Налеви и пенкала', slug: 'nalevi-penkala' },
      { name: 'Тетратки', slug: 'tetratki' },
      { name: 'Папир', slug: 'papir' },
      { name: 'Школски торби', slug: 'skolski-torbi' },
    ],
  },
  {
    name: 'Слободно време и хоби, Животни',
    slug: 'slobodno-vreme-hobi',
    icon: 'gamepad',
    subcategories: [
      { name: 'Видеоигри', slug: 'videoigri' },
      { name: 'Колекционерски предмети', slug: 'kolekcionerski' },
      { name: 'Хоби материјали', slug: 'hobi-materijali' },
      { name: 'Домашни животни', slug: 'domashni-zivotni' },
    ],
  },
  {
    name: 'Спортска опрема и активности',
    slug: 'sportska-oprema',
    icon: 'dumbbell',
    subcategories: [
      { name: 'Спортска облека', slug: 'sportska-obleka' },
      { name: 'Фитнес опрема', slug: 'fitnes-oprema' },
      { name: 'Наутичка опрема', slug: 'nauticka' },
      { name: 'Планински опрема', slug: 'planinski' },
    ],
  },
  {
    name: 'Антиквитети, Уметност, Колекционерство',
    slug: 'antikvar-umetnost',
    icon: 'palette',
    subcategories: [
      { name: 'Антички предмети', slug: 'anticki' },
      { name: 'Уметнички слики', slug: 'umetni-sliki' },
      { name: 'Колекционерски монети', slug: 'moneti' },
      { name: 'Статуи', slug: 'statui' },
    ],
  },
  {
    name: 'Бизнис и дејности, Машини алати',
    slug: 'biznis-masini',
    icon: 'wrench',
    subcategories: [
      { name: 'Машини', slug: 'masini' },
      { name: 'Алати', slug: 'alati' },
      { name: 'Опрема за работа', slug: 'work-equipment' },
      { name: 'Бизнис услуги', slug: 'biznis-uslugi' },
    ],
  },
  {
    name: 'Храна и готвење',
    slug: 'hrana-gotvenj',
    icon: 'cooking',
    subcategories: [
      { name: 'Кујнски прибор', slug: 'kujnski-pribor' },
      { name: 'Хранилни суплементи', slug: 'suplementi' },
      { name: 'Готови јадења', slug: 'gotovi-jadenja' },
      { name: 'Готварски рецепти', slug: 'recepti' },
    ],
  },
  {
    name: 'Продавници, Трговија',
    slug: 'prodavnici-trgovija',
    icon: 'cart',
    subcategories: [
      { name: 'Локација продавница', slug: 'lokacija' },
      { name: 'Търговски производи', slug: 'proizvodi' },
      { name: 'Комерцијална опрема', slug: 'komercialna' },
      { name: 'Франшиза', slug: 'franshiza' },
    ],
  },
  {
    name: 'Услуги, Сервисери',
    slug: 'uslugi-serzeri',
    icon: 'wrench',
    subcategories: [
      { name: 'Поправка електроника', slug: 'popraska-elektronika' },
      { name: 'Одржување дом', slug: 'odrzhavanje-dom' },
      { name: 'Услуги за транспорт', slug: 'voz-uslugi' },
      { name: 'Компјутерски услуги', slug: 'kompjuterski' },
    ],
  },
  {
    name: 'Вработување',
    slug: 'vrabotuvanje',
    icon: 'briefcase',
    subcategories: [
      { name: 'Полни работи', slug: 'polni-raboti' },
      { name: 'Делумни работи', slug: 'delumni-raboti' },
      { name: 'Практикантура', slug: 'praktikantski' },
      { name: 'Волонтерство', slug: 'volontiranje' },
    ],
  },
  {
    name: 'Настани, Ноќен живот, Изложби',
    slug: 'nastani-nocen-zivot',
    icon: 'calendar',
    subcategories: [
      { name: 'Концерти', slug: 'koncerti' },
      { name: 'Театар', slug: 'teatari' },
      { name: 'Ноќни клубови', slug: 'nochni-klubovi' },
      { name: 'Изложби', slug: 'izlozbi' },
    ],
  },
  {
    name: 'Одмор, Туризам, Билети, Патувања',
    slug: 'odmor-turizm',
    icon: 'plane',
    subcategories: [
      { name: 'Авионски билети', slug: 'avionski-bileti' },
      { name: 'Хотелски резервирани', slug: 'hoteli' },
      { name: 'Туристички пакети', slug: 'paketi' },
      { name: 'Ренти автомобили', slug: 'renti-auta' },
    ],
  },
  {
    name: 'Лични контакти',
    slug: 'lichni-kontakti',
    icon: 'message',
    subcategories: [
      { name: 'Пријатели', slug: 'prijateli' },
      { name: 'Познанство', slug: 'poznanstvo' },
      { name: 'Врски', slug: 'vrski' },
      { name: 'Удомување', slug: 'udoumuvanje' },
    ],
  },
  {
    name: 'Останато',
    slug: 'ostatno',
    icon: 'package',
    subcategories: [
      { name: 'Разни производи', slug: 'razni' },
      { name: 'Нерангирани', slug: 'neklassificirano' },
      { name: 'Други услуги', slug: 'drugi' },
      { name: 'Издавање', slug: 'izdavanje' },
    ],
  },
];
