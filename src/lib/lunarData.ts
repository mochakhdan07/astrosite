// Lunar landing-site reference data (English + Bahasa Indonesia).
// Values are taken from official NASA sources (NSSDC mission pages, LRO/LOLA,
// LRO Diviner, LCROSS, Moon Mineralogy Mapper and the Artemis III landing
// region announcements). Temperature ranges are rounded estimates intended
// for education, not for mission design.

import type { Bilingual } from '@/i18n/locale';

export type Lighting = 'cycle' | 'near-constant' | 'permanent-shadow';

/** 0–5 rating per navigation criterion (5 = best for a long-term base). */
export type SiteScores = {
  sunlight: number;
  water: number;
  temperature: number;
  terrain: number;
  comms: number;
};

export type Criterion = keyof SiteScores;

export type LandingSite = {
  id: string;
  /** Short label used on chips, the globe and charts. */
  short: string;
  name: Bilingual;
  mission: Bilingual;
  status: 'historic' | 'candidate';
  year: Bilingual;
  region: Bilingual;
  /** Decimal degrees: north/east positive. */
  lat: number;
  lon: number;
  coordText: Bilingual;
  lighting: Lighting;
  /** Approximate share of the year in direct sunlight (%). */
  sunlitPercent: number;
  lightingText: Bilingual;
  tempMin: number;
  tempMax: number;
  tempText: Bilingual;
  waterIce: boolean;
  resources: Bilingual;
  /** Highest Sun elevation above the local horizon during a lunar day (degrees). */
  sunMaxElevation: number;
  /** Panel orientation / solar power evaluation. */
  powerText: Bilingual;
  /** Earth elevation range above the local horizon (degrees, libration included). */
  earthElevMin: number;
  earthElevMax: number;
  /** Estimated share of the time Earth is in direct line of sight (%), as [min, max]. */
  earthVisible: [number, number];
  commsText: Bilingual;
  keyFacts: Bilingual[];
  scores: SiteScores;
  verdict: Bilingual;
  source: { label: Bilingual; url: string };
};

export const LIGHTING_LABEL: Record<Lighting, Bilingual> = {
  cycle: { en: '~14-day day / ~14-day night cycle', id: 'Siklus siang–malam ±14 hari' },
  'near-constant': { en: 'Near-constant sunlight', id: 'Sinar Matahari hampir terus-menerus' },
  'permanent-shadow': { en: 'Permanent shadow (PSR)', id: 'Bayangan abadi (PSR)' },
};

export const CRITERIA: { key: Criterion; label: Bilingual; hint: Bilingual }[] = [
  {
    key: 'sunlight',
    label: { en: 'Solar energy', id: 'Energi surya' },
    hint: { en: 'How much of the time solar panels get sunlight', id: 'Seberapa sering panel surya terkena sinar Matahari' },
  },
  {
    key: 'water',
    label: { en: 'Water ice access', id: 'Akses es air' },
    hint: { en: 'How close the site is to confirmed water ice', id: 'Seberapa dekat lokasi dengan es air yang terkonfirmasi' },
  },
  {
    key: 'temperature',
    label: { en: 'Mild temperature', id: 'Suhu bersahabat' },
    hint: { en: 'Small temperature swings that equipment can survive', id: 'Perubahan suhu kecil yang mampu ditahan peralatan' },
  },
  {
    key: 'terrain',
    label: { en: 'Safe terrain', id: 'Medan aman' },
    hint: { en: 'Flat, open ground with few slopes and boulders', id: 'Permukaan datar dan terbuka, sedikit lereng dan batu besar' },
  },
  {
    key: 'comms',
    label: { en: 'Earth contact', id: 'Kontak ke Bumi' },
    hint: { en: 'Direct line of sight to Earth for radio links', id: 'Garis pandang langsung ke Bumi untuk komunikasi radio' },
  },
];

export const SITES: LandingSite[] = [
  {
    id: 'apollo-11',
    short: 'Apollo 11',
    name: { en: 'Tranquility Base', id: 'Tranquility Base' },
    mission: { en: 'Apollo 11', id: 'Apollo 11' },
    status: 'historic',
    year: { en: 'July 20, 1969', id: '20 Juli 1969' },
    region: { en: 'Mare Tranquillitatis (Sea of Tranquility)', id: 'Mare Tranquillitatis (Laut Ketenangan)' },
    lat: 0.67408,
    lon: 23.47297,
    coordText: { en: '0.67408° N, 23.47297° E', id: '0,67408° LU, 23,47297° BT' },
    lighting: 'cycle',
    sunlitPercent: 50,
    lightingText: {
      en: 'Near the equator: about 14 Earth days of daylight, then about 14 days of darkness (one lunar day = 29.5 Earth days). The landing was timed for local morning with the Sun low (~10°) so boulder shadows were easy to see.',
      id: 'Dekat khatulistiwa: ±14 hari Bumi terang lalu ±14 hari gelap (satu hari Bulan = 29,5 hari Bumi). Pendaratan dijadwalkan pada pagi hari setempat saat Matahari rendah (±10°) agar bayangan batu terlihat jelas.',
    },
    tempMin: -130,
    tempMax: 120,
    tempText: {
      en: 'About 120 °C at midday, dropping to about −130 °C at night',
      id: '±120 °C siang hari, turun hingga ±−130 °C malam hari',
    },
    waterIce: false,
    resources: {
      en: 'No water ice. Titanium-rich basalt regolith (the mineral ilmenite) that could in theory be processed to make oxygen.',
      id: 'Tidak ada es air. Regolit basal kaya titanium (mineral ilmenit) yang secara teori dapat diolah untuk menghasilkan oksigen.',
    },
    sunMaxElevation: 89,
    powerText: {
      en: 'At local noon the Sun stands almost overhead (~89°), so flat, upward-facing panels work well – but only for ~14 days. During the ~14-day night, power must come from batteries or a nuclear source.',
      id: 'Pada siang lokal Matahari hampir tepat di atas kepala (±89°), sehingga panel datar menghadap ke atas bekerja baik – tetapi hanya ±14 hari. Selama malam ±14 hari, daya harus dari baterai atau sumber nuklir.',
    },
    earthElevMin: 59,
    earthElevMax: 74,
    earthVisible: [100, 100],
    commsText: {
      en: 'On the near side, close to the centre of the Earth-facing disc: Earth hangs ~66° high and never sets (it only wobbles a few degrees through libration). Direct radio contact is available 100% of the time.',
      id: 'Berada di sisi dekat, dekat pusat piringan yang menghadap Bumi: Bumi menggantung ±66° di langit dan tidak pernah terbenam (hanya bergoyang beberapa derajat karena librasi). Kontak radio langsung tersedia 100% waktu.',
    },
    keyFacts: [
      { en: '21.55 kg of rock samples returned to Earth', id: '21,55 kg sampel batuan dibawa ke Bumi' },
      { en: 'Surface activity (EVA): 2 h 31 min', id: 'Aktivitas di permukaan (EVA): 2 jam 31 menit' },
      { en: 'Smooth, relatively flat mare plain', id: 'Permukaan dataran mare relatif datar dan rata' },
    ],
    scores: { sunlight: 2, water: 0, temperature: 1, terrain: 5, comms: 5 },
    verdict: {
      en: 'Safe for a short visit, but extreme temperature swings and the 14-day night make a long-term base difficult.',
      id: 'Aman untuk kunjungan singkat, tetapi perbedaan suhu ekstrem dan malam 14 hari menyulitkan pangkalan jangka panjang.',
    },
    source: {
      label: { en: 'NASA NSSDC – Apollo 11', id: 'NASA NSSDC – Apollo 11' },
      url: 'https://nssdc.gsfc.nasa.gov/planetary/lunar/apollo11info.html',
    },
  },
  {
    id: 'apollo-17',
    short: 'Apollo 17',
    name: { en: 'Taurus-Littrow Valley', id: 'Lembah Taurus-Littrow' },
    mission: { en: 'Apollo 17', id: 'Apollo 17' },
    status: 'historic',
    year: { en: 'December 11, 1972', id: '11 Desember 1972' },
    region: { en: 'Southeastern edge of Mare Serenitatis', id: 'Tepi tenggara Mare Serenitatis' },
    lat: 20.1908,
    lon: 30.77168,
    coordText: { en: '20.19080° N, 30.77168° E', id: '20,19080° LU, 30,77168° BT' },
    lighting: 'cycle',
    sunlitPercent: 50,
    lightingText: {
      en: 'Mid-latitude: the same ~14-day day/night cycle as the equator. The valley is flanked by ~2 km-high mountains that cast shadows in the morning and evening.',
      id: 'Lintang tengah: siklus siang–malam ±14 hari Bumi seperti di khatulistiwa. Lembah diapit pegunungan setinggi ±2 km yang memberi bayangan pada pagi dan sore.',
    },
    tempMin: -130,
    tempMax: 120,
    tempText: {
      en: 'About 120 °C at midday, dropping to about −130 °C at night',
      id: '±120 °C siang hari, turun hingga ±−130 °C malam hari',
    },
    waterIce: false,
    resources: {
      en: 'No water ice. Ilmenite-rich basalt and the famous "orange soil" of volcanic glass beads at Shorty crater.',
      id: 'Tidak ada es air. Basal kaya ilmenit dan "tanah oranye" berupa butiran kaca vulkanik di kawah Shorty.',
    },
    sunMaxElevation: 70,
    powerText: {
      en: 'The Sun climbs to ~70° at noon – strong sunlight for ~14 days, then a ~14-day night with no solar power. Mountain shadows shorten the useful morning and evening hours on the valley floor.',
      id: 'Matahari naik hingga ±70° saat siang – sinar kuat selama ±14 hari, lalu malam ±14 hari tanpa daya surya. Bayangan pegunungan memperpendek jam pagi dan sore yang berguna di dasar lembah.',
    },
    earthElevMin: 46,
    earthElevMax: 62,
    earthVisible: [100, 100],
    commsText: {
      en: 'Earth stays ~54° above the horizon at all times, well above the surrounding mountains. Direct line-of-sight communication is continuous.',
      id: 'Bumi selalu berada ±54° di atas cakrawala, jauh di atas pegunungan sekitar. Komunikasi garis pandang langsung tersedia terus-menerus.',
    },
    keyFacts: [
      { en: '110.52 kg of samples – the most of any Apollo mission', id: '110,52 kg sampel – terbanyak dari semua misi Apollo' },
      { en: '~22 hours of EVA using the Lunar Roving Vehicle', id: 'Total EVA ±22 jam dengan Lunar Roving Vehicle' },
      { en: 'The last crewed Moon landing to date', id: 'Misi berawak terakhir ke Bulan hingga saat ini' },
    ],
    scores: { sunlight: 2, water: 0, temperature: 1, terrain: 3, comms: 5 },
    verdict: {
      en: 'Rich in geology, but has no water ice and still endures a long, freezing night.',
      id: 'Kaya data geologi, tetapi tidak memiliki es air dan tetap mengalami malam panjang yang sangat dingin.',
    },
    source: {
      label: { en: 'NASA NSSDC – Apollo 17', id: 'NASA NSSDC – Apollo 17' },
      url: 'https://nssdc.gsfc.nasa.gov/planetary/lunar/apollo17info.html',
    },
  },
  {
    id: 'artemis-ridge',
    short: 'Artemis III',
    name: { en: 'Sunlit South Pole Ridges & Peaks', id: 'Punggungan & Puncak Tersinari Kutub Selatan' },
    mission: { en: 'Artemis III (candidate)', id: 'Artemis III (kandidat)' },
    status: 'candidate',
    year: { en: 'NASA candidate regions (Oct 2024 update)', id: 'Wilayah kandidat NASA (pembaruan Okt 2024)' },
    region: {
      en: 'e.g. Shackleton crater rim, Mons Mouton, Malapert Massif, Haworth, Nobile Rim',
      id: 'Contoh: tepi Kawah Shackleton, Mons Mouton, Malapert Massif, Haworth, Nobile Rim',
    },
    lat: -89.67,
    lon: 129.78,
    coordText: {
      en: 'Within 6° of the south pole (~84°–90° S); Shackleton crater centre ~89.67° S, 129.78° E',
      id: 'Dalam 6° dari kutub selatan (±84°–90° LS); pusat Kawah Shackleton ±89,67° LS, 129,78° BT',
    },
    lighting: 'near-constant',
    sunlitPercent: 80,
    lightingText: {
      en: "The Moon's axis is tilted only 1.54°, so the Sun always skims the polar horizon. LRO/LOLA data show some peaks and ridges are lit more than 80% of the year – ideal for solar panels.",
      id: 'Sumbu Bulan hanya miring 1,54°, sehingga Matahari selalu rendah di cakrawala kutub. Data LOLA/LRO menunjukkan beberapa puncak dan punggungan tersinari lebih dari 80% waktu dalam setahun – ideal untuk panel surya.',
    },
    tempMin: -100,
    tempMax: 0,
    tempText: {
      en: 'Fairly stable: estimated −100 °C to 0 °C, without the equatorial midday heat spike',
      id: 'Relatif stabil: perkiraan −100 °C hingga 0 °C, tanpa lonjakan panas siang khatulistiwa',
    },
    waterIce: true,
    resources: {
      en: 'Next to permanently shadowed craters that hold water ice. Near-constant solar power plus a short trip to a water source.',
      id: 'Berdekatan dengan kawah bayangan abadi yang menyimpan es air. Akses energi surya hampir terus-menerus plus jarak dekat ke sumber air.',
    },
    sunMaxElevation: 1.5,
    powerText: {
      en: 'The Sun never rises more than ~1.5° above the horizon; instead it circles all 360° around the sky once every 29.5 days. Panels must stand vertically and rotate to track it. On high ridges the low Sun is rarely blocked, giving near-continuous power.',
      id: 'Matahari tidak pernah naik lebih dari ±1,5° di atas cakrawala; Matahari justru berputar 360° mengelilingi langit setiap 29,5 hari. Panel harus berdiri tegak dan berputar mengikutinya. Di punggungan tinggi, Matahari rendah jarang terhalang sehingga daya hampir terus-menerus.',
    },
    earthElevMin: -7,
    earthElevMax: 7,
    earthVisible: [50, 100],
    commsText: {
      en: 'Earth sits on the horizon and rises and sets with the Moon’s ~27-day libration (about ±7°). Flat ground sees Earth roughly half the time; high, Earth-facing peaks (e.g. Malapert Massif) see it far longer. Gaps must be covered by relay satellites.',
      id: 'Bumi berada di cakrawala dan terbit–terbenam mengikuti librasi Bulan ±27 hari (sekitar ±7°). Permukaan datar melihat Bumi kira-kira separuh waktu; puncak tinggi yang menghadap Bumi (mis. Malapert Massif) jauh lebih lama. Celah komunikasi harus ditutup satelit relai.',
    },
    keyFacts: [
      { en: 'NASA selected 9 candidate Artemis III landing regions (2024)', id: 'NASA memilih 9 wilayah kandidat pendaratan Artemis III (2024)' },
      { en: 'Earth-facing slopes can be chosen for direct radio contact', id: 'Komunikasi langsung ke Bumi dapat dipilih dari lereng yang menghadap Bumi' },
      { en: 'Slopes and terrain are rougher than the mare plains', id: 'Lereng & medan lebih kasar dibanding dataran mare' },
    ],
    scores: { sunlight: 5, water: 4, temperature: 4, terrain: 3, comms: 3 },
    verdict: {
      en: 'The best zone for a long-term base: stable temperatures, almost constant solar power and close to water ice.',
      id: 'Zona terbaik untuk pangkalan jangka panjang: suhu stabil, energi surya hampir konstan, dan dekat dengan es air.',
    },
    source: {
      label: { en: 'NASA – Artemis III landing region update', id: 'NASA – Pembaruan wilayah pendaratan Artemis III' },
      url: 'https://www.nasa.gov/news-release/nasa-provides-update-on-artemis-iii-moon-landing-regions/',
    },
  },
  {
    id: 'psr-cabeus',
    short: 'Cabeus · PSR',
    name: { en: 'Permanently Shadowed Crater (e.g. Cabeus)', id: 'Kawah Bayangan Abadi (contoh: Cabeus)' },
    mission: { en: 'LCROSS & LRO (2009)', id: 'LCROSS & LRO (2009)' },
    status: 'candidate',
    year: { en: 'LCROSS impact: October 9, 2009', id: 'Tumbukan LCROSS: 9 Oktober 2009' },
    region: {
      en: 'Crater floors around the south pole (Cabeus, Shackleton, Haworth, Faustini)',
      id: 'Dasar kawah di sekitar kutub selatan (Cabeus, Shackleton, Haworth, Faustini)',
    },
    lat: -84.7,
    lon: -48.7,
    coordText: {
      en: 'LCROSS impact point ~84.7° S, 48.7° W (Cabeus crater)',
      id: 'Titik tumbukan LCROSS ±84,7° LS, 48,7° BB (Kawah Cabeus)',
    },
    lighting: 'permanent-shadow',
    sunlitPercent: 0,
    lightingText: {
      en: 'The crater floor has not seen direct sunlight for billions of years (a Permanently Shadowed Region, PSR). No direct solar power is available.',
      id: 'Dasar kawah tidak pernah terkena sinar Matahari langsung selama miliaran tahun (Permanently Shadowed Region / PSR). Tidak ada energi surya langsung.',
    },
    tempMin: -238,
    tempMax: -200,
    tempText: {
      en: 'Among the coldest places ever measured: down to −238 °C (LRO Diviner)',
      id: 'Termasuk tempat terdingin yang pernah diukur: hingga −238 °C (Diviner LRO)',
    },
    waterIce: true,
    resources: {
      en: 'Confirmed water ice. The LCROSS impact detected ~5.6% water by mass in the ejected material; NASA’s M3 instrument (2018) confirmed surface ice in PSRs.',
      id: 'Es air terkonfirmasi. Tumbukan LCROSS mendeteksi ±5,6% massa air di material yang terlempar; instrumen NASA M3 (2018) memastikan es air di permukaan PSR.',
    },
    sunMaxElevation: 0,
    powerText: {
      en: 'The crater rim always stands higher than the Sun (which stays within ~1.5° of the horizon), so the floor gets zero direct sunlight. Power must be beamed in, cabled from a sunlit ridge, or carried in batteries.',
      id: 'Tepi kawah selalu lebih tinggi daripada Matahari (yang hanya ±1,5° dari cakrawala), sehingga dasar kawah tidak mendapat sinar langsung sama sekali. Daya harus dipancarkan, dialirkan lewat kabel dari punggungan tersinari, atau dibawa dalam baterai.',
    },
    earthElevMin: -3,
    earthElevMax: 10,
    earthVisible: [0, 0],
    commsText: {
      en: 'Earth is only a few degrees above the horizon here, so the crater walls block it. There is no direct line of sight to Earth from the floor – a rover must relay through a station on the rim or an orbiter.',
      id: 'Bumi hanya beberapa derajat di atas cakrawala, sehingga dinding kawah menghalanginya. Tidak ada garis pandang langsung ke Bumi dari dasar kawah – rover harus merelai sinyal lewat stasiun di tepi kawah atau satelit pengorbit.',
    },
    keyFacts: [
      { en: 'Ice can become drinking water, oxygen and rocket fuel', id: 'Es air dapat diolah menjadi air minum, oksigen, dan bahan bakar roket' },
      { en: 'Extreme cold is hard on equipment and batteries', id: 'Suhu sangat rendah menyulitkan peralatan dan baterai' },
      { en: 'No direct line of sight to Earth from the crater floor', id: 'Tidak bisa berkomunikasi langsung dengan Bumi dari dasar kawah' },
    ],
    scores: { sunlight: 0, water: 5, temperature: 0, terrain: 2, comms: 0 },
    verdict: {
      en: 'The most valuable resource, but far too cold and dark for a base – better suited as an ice mining site.',
      id: 'Sumber daya paling berharga, tetapi terlalu dingin dan gelap untuk lokasi pangkalan – lebih cocok sebagai lokasi tambang es.',
    },
    source: {
      label: { en: 'NASA JPL – Ice confirmed at the Moon’s poles', id: 'NASA JPL – Es terkonfirmasi di kutub Bulan' },
      url: 'https://www.jpl.nasa.gov/news/ice-confirmed-at-the-moons-poles',
    },
  },
];

export const EXTRA_SOURCES: { label: Bilingual; url: string }[] = [
  { label: { en: 'NASA Science – Moon facts (temperature & rotation)', id: 'NASA Science – Fakta Bulan (suhu & rotasi)' }, url: 'https://science.nasa.gov/moon/facts/' },
  { label: { en: 'NASA LRO – Lunar Reconnaissance Orbiter', id: 'NASA LRO – Lunar Reconnaissance Orbiter' }, url: 'https://science.nasa.gov/mission/lro/' },
  { label: { en: 'NASA – LCROSS mission', id: 'NASA – Misi LCROSS' }, url: 'https://science.nasa.gov/mission/lcross/' },
  { label: { en: 'NASA SVS – CGI Moon Kit (3D Moon textures)', id: 'NASA SVS – CGI Moon Kit (tekstur Bulan 3D)' }, url: 'https://svs.gsfc.nasa.gov/4720/' },
];

export const GLOSSARY: { term: string; text: Bilingual }[] = [
  {
    term: 'PSR',
    text: {
      en: 'Permanently Shadowed Region – a crater floor near the poles that never receives direct sunlight.',
      id: 'Permanently Shadowed Region – dasar kawah di dekat kutub yang tidak pernah terkena sinar Matahari langsung.',
    },
  },
  {
    term: 'Regolith',
    text: {
      en: 'The loose layer of dust and broken rock that covers the lunar surface.',
      id: 'Regolit – lapisan debu dan pecahan batuan lepas yang menutupi permukaan Bulan.',
    },
  },
  {
    term: 'Mare',
    text: {
      en: 'Dark, flat plains of ancient volcanic basalt ("seas"). Apollo 11 landed on one.',
      id: 'Dataran gelap dan datar dari basal vulkanik purba ("lautan"). Apollo 11 mendarat di salah satunya.',
    },
  },
  {
    term: 'ISRU',
    text: {
      en: 'In-Situ Resource Utilization – using local resources (like ice) instead of bringing everything from Earth.',
      id: 'In-Situ Resource Utilization – memakai sumber daya setempat (misalnya es) alih-alih membawa semuanya dari Bumi.',
    },
  },
  {
    term: 'Lunar day',
    text: {
      en: 'One full day–night cycle on the Moon: 29.5 Earth days.',
      id: 'Hari Bulan – satu siklus siang–malam penuh di Bulan: 29,5 hari Bumi.',
    },
  },
  {
    term: 'Libration',
    text: {
      en: 'A slow apparent wobble of the Moon (about ±7°) seen from Earth. At the poles it makes Earth rise and set over a ~27-day cycle.',
      id: 'Librasi – goyangan semu Bulan (sekitar ±7°) dilihat dari Bumi. Di kutub, librasi membuat Bumi terbit dan terbenam dalam siklus ±27 hari.',
    },
  },
  {
    term: 'Line of sight',
    text: {
      en: 'An unblocked straight path between two antennas. Direct-to-Earth radio needs Earth to be above the local horizon and terrain.',
      id: 'Garis pandang – jalur lurus tanpa halangan antara dua antena. Radio langsung ke Bumi membutuhkan Bumi berada di atas cakrawala dan medan setempat.',
    },
  },
  {
    term: 'Sun elevation',
    text: {
      en: 'The angle of the Sun above the horizon. Near 90° at the equator at noon, but only ~0–1.5° at the lunar poles.',
      id: 'Sudut elevasi Matahari – sudut Matahari di atas cakrawala. Mendekati 90° di khatulistiwa saat siang, tetapi hanya ±0–1,5° di kutub Bulan.',
    },
  },
  {
    term: 'LRO',
    text: {
      en: 'Lunar Reconnaissance Orbiter – NASA spacecraft mapping the Moon since 2009 (LOLA laser altimeter, Diviner thermometer, LROC camera).',
      id: 'Lunar Reconnaissance Orbiter – wahana NASA yang memetakan Bulan sejak 2009 (altimeter laser LOLA, termometer Diviner, kamera LROC).',
    },
  },
];

export type QuizQuestion = {
  question: Bilingual;
  options: Bilingual[];
  answerIndex: number;
  explanation: Bilingual;
};

export const QUIZ: QuizQuestion[] = [
  {
    question: {
      en: 'At the lunar south pole the Sun never rises more than about 1.5° above the horizon. What causes this extreme lighting?',
      id: 'Di kutub selatan Bulan, Matahari tidak pernah naik lebih dari ±1,5° di atas cakrawala. Apa penyebab pencahayaan ekstrem ini?',
    },
    options: [
      { en: 'The Moon does not rotate at all', id: 'Bulan sama sekali tidak berotasi' },
      {
        en: "The Moon's spin axis is tilted only ~1.54°, so polar sunlight always arrives almost sideways",
        id: 'Sumbu rotasi Bulan hanya miring ±1,54°, sehingga sinar Matahari di kutub selalu datang hampir menyamping',
      },
      { en: 'Earth always blocks the Sun over the poles', id: 'Bumi selalu menghalangi Matahari di atas kutub' },
      { en: 'Thick lunar clouds cover the poles', id: 'Awan tebal Bulan menutupi kutub' },
    ],
    answerIndex: 1,
    explanation: {
      en: 'With such a small tilt the Sun skims the polar horizon all year. High ridges catch this low light most of the time, while deep crater floors never see it – they become Permanently Shadowed Regions (PSRs).',
      id: 'Karena kemiringannya sangat kecil, Matahari selalu menyusur cakrawala kutub sepanjang tahun. Punggungan tinggi menangkap cahaya rendah ini hampir sepanjang waktu, sedangkan dasar kawah yang dalam tidak pernah tersinari – menjadi Permanently Shadowed Region (PSR).',
    },
  },
  {
    question: {
      en: 'Because the polar Sun stays low and circles the whole horizon, how should solar panels at a south pole base be set up?',
      id: 'Karena Matahari kutub selalu rendah dan berputar mengelilingi cakrawala, bagaimana panel surya pangkalan kutub selatan sebaiknya dipasang?',
    },
    options: [
      { en: 'Lying flat on the ground, facing straight up', id: 'Mendatar di tanah, menghadap lurus ke atas' },
      { en: 'Fixed, facing only toward Earth', id: 'Dipasang tetap, hanya menghadap ke arah Bumi' },
      {
        en: 'Standing vertically on a high ridge and rotating to follow the Sun',
        id: 'Berdiri tegak di punggungan tinggi dan berputar mengikuti Matahari',
      },
      { en: 'Inside a permanently shadowed crater to keep them cool', id: 'Di dalam kawah bayangan abadi agar tetap dingin' },
    ],
    answerIndex: 2,
    explanation: {
      en: 'Sunlight arrives at ~0–1.5° elevation and its direction turns 360° every 29.5 days. Vertical panels that track the Sun – mounted high so hills do not shadow them – collect the most power. Flat panels would catch almost nothing.',
      id: 'Sinar Matahari datang pada sudut ±0–1,5° dan arahnya berputar 360° setiap 29,5 hari. Panel tegak yang mengikuti Matahari – dipasang tinggi agar tidak terbayangi bukit – mengumpulkan daya terbanyak. Panel datar hampir tidak menangkap apa pun.',
    },
  },
  {
    question: {
      en: 'At Apollo 11’s Tranquility Base Earth stays ~66° high in the sky, but at the south pole it hovers near the horizon. What does this mean for direct-to-Earth communication at the pole?',
      id: 'Di Tranquility Base (Apollo 11) Bumi selalu ±66° di langit, tetapi di kutub selatan Bumi berada dekat cakrawala. Apa artinya bagi komunikasi langsung ke Bumi di kutub?',
    },
    options: [
      {
        en: 'Earth rises and sets with libration, so contact comes in windows – Earth-facing high ground or relay satellites are needed',
        id: 'Bumi terbit dan terbenam mengikuti librasi, sehingga kontak hanya tersedia dalam jendela waktu – perlu dataran tinggi menghadap Bumi atau satelit relai',
      },
      { en: 'Earth is always overhead, so contact is continuous everywhere', id: 'Bumi selalu di atas kepala, sehingga kontak selalu tersedia di mana pun' },
      { en: 'Radio signals cannot travel through the Moon’s thin atmosphere', id: 'Sinyal radio tidak dapat menembus atmosfer tipis Bulan' },
      { en: 'Earth can never be seen from anywhere near the pole', id: 'Bumi tidak pernah terlihat dari mana pun di dekat kutub' },
    ],
    answerIndex: 0,
    explanation: {
      en: 'The Moon always shows the same face to Earth, but libration makes Earth wobble about ±7° in the polar sky. On flat ground Earth is visible only about half the time; high, Earth-facing peaks see it far longer, and relay orbiters fill the gaps.',
      id: 'Bulan selalu menghadapkan sisi yang sama ke Bumi, tetapi librasi membuat Bumi bergoyang sekitar ±7° di langit kutub. Di permukaan datar Bumi hanya terlihat sekitar separuh waktu; puncak tinggi yang menghadap Bumi melihatnya jauh lebih lama, dan satelit relai menutup celahnya.',
    },
  },
  {
    question: {
      en: 'A rover is working on the floor of Cabeus, a permanently shadowed crater. Which statement matches the navigation data?',
      id: 'Sebuah rover bekerja di dasar Kawah Cabeus yang berada dalam bayangan abadi. Pernyataan mana yang sesuai dengan data navigasi?',
    },
    options: [
      { en: 'It has full solar power and constant contact with Earth', id: 'Rover mendapat daya surya penuh dan kontak konstan dengan Bumi' },
      { en: 'It gets sunlight for 14 days, then 14 days of night', id: 'Rover mendapat sinar Matahari 14 hari, lalu malam 14 hari' },
      {
        en: 'It has no direct sunlight and no direct line of sight to Earth, at temperatures down to about −238 °C',
        id: 'Rover tidak mendapat sinar Matahari langsung dan tidak punya garis pandang langsung ke Bumi, dengan suhu hingga sekitar −238 °C',
      },
      { en: 'It can see Earth directly overhead the whole time', id: 'Rover dapat melihat Bumi tepat di atas kepala sepanjang waktu' },
    ],
    answerIndex: 2,
    explanation: {
      en: 'The crater rim is always higher than both the Sun and Earth in the polar sky. The floor holds water ice (confirmed by LCROSS and M3) but needs power and a communication relay from a station on the sunlit rim.',
      id: 'Tepi kawah selalu lebih tinggi daripada Matahari maupun Bumi di langit kutub. Dasar kawah menyimpan es air (dikonfirmasi LCROSS dan M3), tetapi membutuhkan pasokan daya dan relai komunikasi dari stasiun di tepi yang tersinari.',
    },
  },
  {
    question: {
      en: 'Using all the data (lighting, Sun angle for power, Earth line of sight, water access), which is the SAFEST landing zone for a long-term base?',
      id: 'Dengan seluruh data (pencahayaan, sudut Matahari untuk daya, garis pandang ke Bumi, akses air), zona pendaratan mana yang PALING aman untuk pangkalan jangka panjang?',
    },
    options: [
      { en: 'Taurus-Littrow Valley (Apollo 17), between tall mountains', id: 'Lembah Taurus-Littrow (Apollo 17), di antara pegunungan tinggi' },
      { en: 'The floor of a permanently shadowed crater, right on top of the ice', id: 'Dasar kawah bayangan abadi, tepat di atas es' },
      { en: 'Tranquility Base (Apollo 11) on the equator', id: 'Tranquility Base (Apollo 11) di khatulistiwa' },
      {
        en: 'A sunlit, Earth-facing ridge near the south pole (e.g. a Shackleton rim or Malapert site), next to icy craters',
        id: 'Punggungan tersinari yang menghadap Bumi di dekat kutub selatan (mis. tepi Shackleton atau Malapert), di samping kawah berisi es',
      },
    ],
    answerIndex: 3,
    explanation: {
      en: 'Sunlit polar ridges are lit more than 80% of the time, have milder, stable temperatures, can be chosen for long Earth-visibility windows and sit close to water ice in nearby PSRs – the strategy NASA uses for its Artemis III candidate regions.',
      id: 'Punggungan kutub yang tersinari mendapat cahaya lebih dari 80% waktu, suhunya lebih stabil, dapat dipilih yang memiliki jendela visibilitas Bumi panjang, dan dekat dengan es air di PSR sekitar – strategi yang dipakai NASA untuk wilayah kandidat Artemis III.',
    },
  },
  {
    question: {
      en: 'How long is one full lunar day (one complete day–night cycle on the Moon)?',
      id: 'Berapa lama satu hari Bulan (satu siklus siang–malam penuh di Bulan)?',
    },
    options: [
      { en: '24 hours', id: '24 jam' },
      { en: 'About 7 Earth days', id: 'Sekitar 7 hari Bumi' },
      { en: '29.5 Earth days', id: '29,5 hari Bumi' },
      { en: '365 Earth days', id: '365 hari Bumi' },
    ],
    answerIndex: 2,
    explanation: {
      en: 'One lunar day lasts 29.5 Earth days. Near the equator this means about 14 days of daylight followed by about 14 days of darkness.',
      id: 'Satu hari Bulan berlangsung 29,5 hari Bumi. Di dekat khatulistiwa artinya sekitar 14 hari terang lalu sekitar 14 hari gelap.',
    },
  },
  {
    question: {
      en: 'What does the abbreviation PSR stand for in lunar navigation data?',
      id: 'Apa kepanjangan singkatan PSR dalam data navigasi Bulan?',
    },
    options: [
      { en: 'Polar Solar Ridge', id: 'Polar Solar Ridge' },
      { en: 'Permanently Shadowed Region', id: 'Permanently Shadowed Region' },
      { en: 'Primary Surface Relay', id: 'Primary Surface Relay' },
      { en: 'Planetary Sample Return', id: 'Planetary Sample Return' },
    ],
    answerIndex: 1,
    explanation: {
      en: 'A PSR is a crater floor near the poles that never receives direct sunlight – such as the floor of Cabeus crater.',
      id: 'PSR adalah dasar kawah di dekat kutub yang tidak pernah terkena sinar Matahari langsung – misalnya dasar Kawah Cabeus.',
    },
  },
  {
    question: {
      en: 'What is "regolith"?',
      id: 'Apa yang dimaksud dengan "regolit"?',
    },
    options: [
      { en: 'Frozen water hidden under the poles', id: 'Air beku yang tersembunyi di bawah kutub' },
      { en: 'A type of lunar rover wheel', id: 'Salah satu jenis roda rover Bulan' },
      { en: 'The loose layer of dust and broken rock covering the lunar surface', id: 'Lapisan debu dan pecahan batuan lepas yang menutupi permukaan Bulan' },
      { en: 'The thin atmosphere above the Moon', id: 'Atmosfer tipis di atas Bulan' },
    ],
    answerIndex: 2,
    explanation: {
      en: 'Regolith is the loose dust and rock fragments on the surface. At Tranquility Base it is titanium-rich basalt that could, in theory, be processed into oxygen.',
      id: 'Regolit adalah debu dan pecahan batuan lepas di permukaan. Di Tranquility Base regolitnya berupa basal kaya titanium yang secara teori dapat diolah menjadi oksigen.',
    },
  },
  {
    question: {
      en: 'Apollo 11 landed on a "mare". What is a lunar mare?',
      id: 'Apollo 11 mendarat di sebuah "mare". Apa itu mare di Bulan?',
    },
    options: [
      { en: 'A dark, flat plain of ancient volcanic basalt', id: 'Dataran gelap dan datar dari basal vulkanik purba' },
      { en: 'A real sea of liquid water', id: 'Lautan air cair sungguhan' },
      { en: 'A tall mountain range near the pole', id: 'Pegunungan tinggi di dekat kutub' },
      { en: 'A crater that is always in shadow', id: 'Kawah yang selalu berada dalam bayangan' },
    ],
    answerIndex: 0,
    explanation: {
      en: 'Maria ("seas") are dark volcanic basalt plains. Their smooth, flat surface is why Tranquility Base scores 5/5 for safe terrain.',
      id: 'Mare ("lautan") adalah dataran basal vulkanik yang gelap. Permukaannya yang rata membuat Tranquility Base mendapat nilai 5/5 untuk medan aman.',
    },
  },
  {
    question: {
      en: 'What does ISRU (In-Situ Resource Utilization) mean for a lunar base?',
      id: 'Apa arti ISRU (In-Situ Resource Utilization) bagi pangkalan di Bulan?',
    },
    options: [
      { en: 'Bringing every supply from Earth on each mission', id: 'Membawa semua perbekalan dari Bumi pada setiap misi' },
      { en: 'Using local resources, such as ice, instead of bringing everything from Earth', id: 'Memakai sumber daya setempat, misalnya es, alih-alih membawa semuanya dari Bumi' },
      { en: 'Sending signals to Earth through relay satellites', id: 'Mengirim sinyal ke Bumi melalui satelit relai' },
      { en: 'Measuring crater depth with a laser', id: 'Mengukur kedalaman kawah dengan laser' },
    ],
    answerIndex: 1,
    explanation: {
      en: 'ISRU means living off the land. Polar water ice, for example, can become drinking water, oxygen and rocket fuel.',
      id: 'ISRU berarti memanfaatkan sumber daya di lokasi. Es air di kutub, misalnya, dapat diolah menjadi air minum, oksigen, dan bahan bakar roket.',
    },
  },
  {
    question: {
      en: 'How cold can the floor of a permanently shadowed crater such as Cabeus get, according to LRO Diviner?',
      id: 'Seberapa dingin dasar kawah bayangan abadi seperti Cabeus menurut LRO Diviner?',
    },
    options: [
      { en: 'About 0 °C', id: 'Sekitar 0 °C' },
      { en: 'About −50 °C', id: 'Sekitar −50 °C' },
      { en: 'About −130 °C', id: 'Sekitar −130 °C' },
      { en: 'Down to about −238 °C', id: 'Hingga sekitar −238 °C' },
    ],
    answerIndex: 3,
    explanation: {
      en: 'PSR floors are among the coldest places ever measured, down to about −238 °C. Such extreme cold is hard on equipment and batteries.',
      id: 'Dasar PSR termasuk tempat terdingin yang pernah diukur, hingga sekitar −238 °C. Suhu ekstrem ini menyulitkan peralatan dan baterai.',
    },
  },
  {
    question: {
      en: 'Which missions confirmed water ice in the Moon’s permanently shadowed craters?',
      id: 'Misi mana yang mengonfirmasi keberadaan es air di kawah bayangan abadi Bulan?',
    },
    options: [
      { en: 'Apollo 11 and Apollo 17', id: 'Apollo 11 dan Apollo 17' },
      { en: 'LCROSS and NASA’s Moon Mineralogy Mapper (M3)', id: 'LCROSS dan Moon Mineralogy Mapper (M3) NASA' },
      { en: 'Artemis III', id: 'Artemis III' },
      { en: 'The Lunar Roving Vehicle', id: 'Lunar Roving Vehicle' },
    ],
    answerIndex: 1,
    explanation: {
      en: 'The 2009 LCROSS impact into Cabeus detected about 5.6% water by mass in the ejected material, and M3 data (2018) confirmed surface ice in PSRs.',
      id: 'Tumbukan LCROSS ke Cabeus pada 2009 mendeteksi sekitar 5,6% air (berdasarkan massa) pada material yang terlontar, dan data M3 (2018) mengonfirmasi es di permukaan PSR.',
    },
  },
  {
    question: {
      en: 'What is the typical temperature range at Tranquility Base (Apollo 11) between midday and night?',
      id: 'Berapa kisaran suhu di Tranquility Base (Apollo 11) antara siang dan malam hari?',
    },
    options: [
      { en: 'About 120 °C at midday to about −130 °C at night', id: 'Sekitar 120 °C siang hari hingga sekitar −130 °C malam hari' },
      { en: 'A steady 20 °C all the time', id: 'Stabil 20 °C sepanjang waktu' },
      { en: 'About −100 °C to 0 °C', id: 'Sekitar −100 °C hingga 0 °C' },
      { en: 'Always below −200 °C', id: 'Selalu di bawah −200 °C' },
    ],
    answerIndex: 0,
    explanation: {
      en: 'Near the equator the surface swings from about 120 °C to about −130 °C. That huge range is one reason a long-term equatorial base is difficult.',
      id: 'Di dekat khatulistiwa permukaan berubah dari sekitar 120 °C hingga sekitar −130 °C. Rentang besar ini salah satu alasan pangkalan jangka panjang di khatulistiwa sulit dibangun.',
    },
  },
  {
    question: {
      en: 'According to LRO/LOLA data, roughly how much of the year are the best sunlit ridges near the south pole illuminated?',
      id: 'Menurut data LRO/LOLA, kira-kira berapa lama punggungan tersinari terbaik di dekat kutub selatan terkena cahaya dalam setahun?',
    },
    options: [
      { en: 'About 10%', id: 'Sekitar 10%' },
      { en: 'Exactly 50%, like the equator', id: 'Tepat 50%, seperti khatulistiwa' },
      { en: 'More than 80%', id: 'Lebih dari 80%' },
      { en: '0% – they are always dark', id: '0% – selalu gelap' },
    ],
    answerIndex: 2,
    explanation: {
      en: 'Because the Sun skims the polar horizon, some high peaks and ridges are lit more than 80% of the year – ideal for near-continuous solar power.',
      id: 'Karena Matahari selalu menyusur cakrawala kutub, beberapa puncak dan punggungan tinggi tersinari lebih dari 80% waktu dalam setahun – ideal untuk daya surya yang hampir terus-menerus.',
    },
  },
  {
    question: {
      en: 'Which Apollo mission returned the largest amount of lunar samples (110.52 kg)?',
      id: 'Misi Apollo mana yang membawa pulang sampel Bulan terbanyak (110,52 kg)?',
    },
    options: [
      { en: 'Apollo 11', id: 'Apollo 11' },
      { en: 'Apollo 17', id: 'Apollo 17' },
      { en: 'Artemis III', id: 'Artemis III' },
      { en: 'LCROSS', id: 'LCROSS' },
    ],
    answerIndex: 1,
    explanation: {
      en: 'Apollo 17 at Taurus-Littrow returned 110.52 kg of samples using about 22 hours of EVA with the Lunar Roving Vehicle. Apollo 11 returned 21.55 kg.',
      id: 'Apollo 17 di Taurus-Littrow membawa pulang 110,52 kg sampel dengan total EVA sekitar 22 jam menggunakan Lunar Roving Vehicle. Apollo 11 membawa 21,55 kg.',
    },
  },
  {
    question: {
      en: 'What is libration?',
      id: 'Apa yang dimaksud dengan librasi?',
    },
    options: [
      { en: 'A slow apparent wobble of the Moon (about ±7°) seen from Earth', id: 'Goyangan semu Bulan yang lambat (sekitar ±7°) dilihat dari Bumi' },
      { en: 'The process of turning ice into rocket fuel', id: 'Proses mengubah es menjadi bahan bakar roket' },
      { en: 'A moonquake caused by meteorite impacts', id: 'Gempa Bulan akibat tumbukan meteorit' },
      { en: 'The time a radio signal takes to reach Earth', id: 'Waktu tempuh sinyal radio menuju Bumi' },
    ],
    answerIndex: 0,
    explanation: {
      en: 'Libration is an apparent wobble of about ±7°. At the poles it makes Earth rise and set over a ~27-day cycle, so direct radio contact comes in windows.',
      id: 'Librasi adalah goyangan semu sekitar ±7°. Di kutub, librasi membuat Bumi terbit dan terbenam dalam siklus ±27 hari, sehingga kontak radio langsung hanya tersedia dalam jendela waktu.',
    },
  },
  {
    question: {
      en: 'How high does the Sun climb at local noon at Tranquility Base, near the lunar equator?',
      id: 'Seberapa tinggi Matahari naik pada siang lokal di Tranquility Base, dekat khatulistiwa Bulan?',
    },
    options: [
      { en: 'Only about 1.5°', id: 'Hanya sekitar 1,5°' },
      { en: 'About 30°', id: 'Sekitar 30°' },
      { en: 'Almost overhead, about 89°', id: 'Hampir tepat di atas kepala, sekitar 89°' },
      { en: 'It never rises above the horizon', id: 'Tidak pernah naik di atas cakrawala' },
    ],
    answerIndex: 2,
    explanation: {
      en: 'At noon the equatorial Sun stands at about 89°, so flat, upward-facing panels work well – but only for ~14 days before the long lunar night.',
      id: 'Pada siang hari Matahari khatulistiwa berada sekitar 89°, sehingga panel datar menghadap ke atas bekerja baik – tetapi hanya ±14 hari sebelum malam Bulan yang panjang.',
    },
  },
  {
    question: {
      en: 'Which NASA spacecraft has mapped the Moon since 2009 using the LOLA laser altimeter, the Diviner thermometer and the LROC camera?',
      id: 'Wahana NASA mana yang memetakan Bulan sejak 2009 menggunakan altimeter laser LOLA, termometer Diviner, dan kamera LROC?',
    },
    options: [
      { en: 'Lunar Reconnaissance Orbiter (LRO)', id: 'Lunar Reconnaissance Orbiter (LRO)' },
      { en: 'Lunar Roving Vehicle (LRV)', id: 'Lunar Roving Vehicle (LRV)' },
      { en: 'Hubble Space Telescope', id: 'Teleskop Luar Angkasa Hubble' },
      { en: 'Apollo 17 Command Module', id: 'Modul Komando Apollo 17' },
    ],
    answerIndex: 0,
    explanation: {
      en: 'LRO’s instruments provide much of the data on this site: LOLA for terrain and lighting, Diviner for temperatures and LROC for imagery.',
      id: 'Instrumen LRO menyediakan sebagian besar data di situs ini: LOLA untuk medan dan pencahayaan, Diviner untuk suhu, dan LROC untuk citra.',
    },
  },
  {
    question: {
      en: 'Why is a permanently shadowed crater better suited as an ice mining site than as the location of the main base?',
      id: 'Mengapa kawah bayangan abadi lebih cocok sebagai lokasi tambang es daripada lokasi pangkalan utama?',
    },
    options: [
      { en: 'It has no water ice at all', id: 'Kawah itu sama sekali tidak memiliki es air' },
      { en: 'It is too hot during the day', id: 'Suhunya terlalu panas pada siang hari' },
      { en: 'It is extremely cold and dark, with no direct solar power or Earth contact', id: 'Sangat dingin dan gelap, tanpa daya surya langsung maupun kontak ke Bumi' },
      { en: 'Its terrain is the flattest on the Moon', id: 'Medannya paling datar di Bulan' },
    ],
    answerIndex: 2,
    explanation: {
      en: 'PSRs hold the most valuable resource – water ice – but score 0 for sunlight, temperature and Earth contact. A base on a nearby sunlit ridge can supply power and relay communications.',
      id: 'PSR menyimpan sumber daya paling berharga – es air – tetapi bernilai 0 untuk sinar Matahari, suhu, dan kontak ke Bumi. Pangkalan di punggungan tersinari terdekat dapat memasok daya dan merelai komunikasi.',
    },
  },
  {
    question: {
      en: 'How many candidate landing regions near the lunar south pole did NASA select for Artemis III (2024 update)?',
      id: 'Berapa wilayah kandidat pendaratan di dekat kutub selatan Bulan yang dipilih NASA untuk Artemis III (pembaruan 2024)?',
    },
    options: [
      { en: '3', id: '3' },
      { en: '5', id: '5' },
      { en: '9', id: '9' },
      { en: '20', id: '20' },
    ],
    answerIndex: 2,
    explanation: {
      en: 'NASA narrowed its Artemis III options to 9 candidate regions within 6° of the south pole, including sites such as Mons Mouton, Malapert Massif, Haworth and Nobile Rim.',
      id: 'NASA mempersempit pilihan Artemis III menjadi 9 wilayah kandidat dalam radius 6° dari kutub selatan, termasuk Mons Mouton, Malapert Massif, Haworth, dan Nobile Rim.',
    },
  },
];

/** Number of questions drawn from the bank for each quiz attempt. */
export const QUIZ_LENGTH = 5;

/** Returns a shuffled copy of an array (Fisher–Yates). */
function shuffle<T>(items: readonly T[]): T[] {
  const copy = items.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Draws a random set of questions from the bank and shuffles the answer
 * options of each one, so every page load (and every retake) is different.
 */
export function pickQuizQuestions(count = QUIZ_LENGTH): QuizQuestion[] {
  return shuffle(QUIZ)
    .slice(0, Math.min(count, QUIZ.length))
    .map((q) => {
      const order = shuffle(q.options.map((_, i) => i));
      return {
        ...q,
        options: order.map((i) => q.options[i]),
        answerIndex: order.indexOf(q.answerIndex),
      };
    });
}

/** Minimum correct answers needed for the certificate (4 of 5 = 80%). */
export const PASS_SCORE = 4;
