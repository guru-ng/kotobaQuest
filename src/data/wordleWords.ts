import { WordleWord } from '../types';

export const WORDLE_WORDS: WordleWord[] = [
  // ================= N5 (3 Kana) =================
  {
    id: 'n5_3_sakura',
    kana: 'さくら',
    kanji: '桜',
    romaji: 'sakura',
    english: 'Cherry Blossom',
    category: 'Nature',
    hint: 'Iconic pink spring flowers that bloom across Japan.',
    jlpt: 'N5',
    imageUrl: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'n5_3_kimono',
    kana: 'きもの',
    kanji: '着物',
    romaji: 'kimono',
    english: 'Traditional Kimono',
    category: 'Culture',
    hint: 'Elegant silk garment worn during festivals and ceremonies.',
    jlpt: 'N5',
    imageUrl: 'https://images.unsplash.com/photo-1528164344705-475426879c0d?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'n5_3_kitsune',
    kana: 'きつね',
    kanji: '狐',
    romaji: 'kitsune',
    english: 'Red Fox',
    category: 'Animals',
    hint: 'Clever orange forest animal and messenger of Inari shrines.',
    jlpt: 'N5',
    imageUrl: 'https://images.unsplash.com/photo-1474511320723-9a56873867b5?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'n5_3_kuruma',
    kana: 'くるま',
    kanji: '車',
    romaji: 'kuruma',
    english: 'Car / Automobile',
    category: 'Transport',
    hint: 'Four-wheeled motor vehicle driven on city streets.',
    jlpt: 'N5',
    imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'n5_3_sakana',
    kana: 'さかな',
    kanji: '魚',
    romaji: 'sakana',
    english: 'Fish',
    category: 'Animals & Food',
    hint: 'Swims in rivers and oceans; a staple of Japanese cuisine.',
    jlpt: 'N5',
    imageUrl: 'https://images.unsplash.com/photo-1524704654690-b56c05c78a00?auto=format&fit=crop&w=900&q=80'
  },

  // ================= N5 (4 Kana) =================
  {
    id: 'n5_4_hikouki',
    kana: 'ひこうき',
    kanji: '飛行機',
    romaji: 'hikouki',
    english: 'Airplane',
    category: 'Travel',
    hint: 'Winged aircraft flying high above the clouds.',
    jlpt: 'N5',
    imageUrl: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'n5_4_taiyou',
    kana: 'たいよう',
    kanji: '太陽',
    romaji: 'taiyou',
    english: 'The Sun',
    category: 'Nature',
    hint: 'Blazing star at the center of our sky, symbol of Japan.',
    jlpt: 'N5',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'n5_4_kaminari',
    kana: 'かみなり',
    kanji: '雷',
    romaji: 'kaminari',
    english: 'Lightning / Thunder',
    category: 'Weather',
    hint: 'Electric bolt flashing across a stormy night sky.',
    jlpt: 'N5',
    imageUrl: 'https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?auto=format&fit=crop&w=900&q=80'
  },

  // ================= N4 (3 Kana) =================
  {
    id: 'n4_3_minato',
    kana: 'みなと',
    kanji: '港',
    romaji: 'minato',
    english: 'Harbor / Port',
    category: 'Places',
    hint: 'Coastal bay where ships and fishing boats dock.',
    jlpt: 'N4',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'n4_3_matsuri',
    kana: 'まつり',
    kanji: '祭り',
    romaji: 'matsuri',
    english: 'Japanese Festival',
    category: 'Culture',
    hint: 'Lively celebration with glowing lanterns, drums, and food stalls.',
    jlpt: 'N4',
    imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'n4_3_keshiki',
    kana: 'けしき',
    kanji: '景色',
    romaji: 'keshiki',
    english: 'Scenery / Landscape',
    category: 'Nature',
    hint: 'Breathtaking panoramic view of mountains and lakes.',
    jlpt: 'N4',
    imageUrl: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?auto=format&fit=crop&w=900&q=80'
  },

  // ================= N4 (4 Kana) =================
  {
    id: 'n4_4_yakitori',
    kana: 'やきとり',
    kanji: '焼き鳥',
    romaji: 'yakitori',
    english: 'Grilled Chicken Skewers',
    category: 'Food & Dining',
    hint: 'Charcoal-grilled poultry skewers served at izakayas.',
    jlpt: 'N4',
    imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'n4_4_takenoko',
    kana: 'たけのこ',
    kanji: '竹の子',
    romaji: 'takenoko',
    english: 'Bamboo Shoot',
    category: 'Nature & Food',
    hint: 'Young sprout growing in a green bamboo grove.',
    jlpt: 'N4',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=900&q=80'
  },

  // ================= N3 (3 Kana) =================
  {
    id: 'n3_3_koori',
    kana: 'こおり',
    kanji: '氷',
    romaji: 'koori',
    english: 'Ice / Frozen Glacier',
    category: 'Nature',
    hint: 'Solid frozen ice and snow glistening in winter cold.',
    jlpt: 'N3',
    imageUrl: 'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'n3_3_arashi',
    kana: 'あらし',
    kanji: '嵐',
    romaji: 'arashi',
    english: 'Storm / Tempest',
    category: 'Weather',
    hint: 'Fierce ocean wind and dramatic dark storm clouds.',
    jlpt: 'N3',
    imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'n3_3_inochi',
    kana: 'いのち',
    kanji: '命',
    romaji: 'inochi',
    english: 'Life / New Sprout',
    category: 'Nature',
    hint: 'A young green seedling emerging from rich soil.',
    jlpt: 'N3',
    imageUrl: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=900&q=80'
  },

  // ================= N3 (4 Kana) =================
  {
    id: 'n3_4_akatsuki',
    kana: 'あかつき',
    kanji: '暁',
    romaji: 'akatsuki',
    english: 'Daybreak / Crimson Dawn',
    category: 'Nature',
    hint: 'First golden-red light breaking over the horizon at dawn.',
    jlpt: 'N3',
    imageUrl: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'n3_4_kurayami',
    kana: 'くらやみ',
    kanji: '暗闇',
    romaji: 'kurayami',
    english: 'Darkness of Night',
    category: 'Nature',
    hint: 'Deep midnight shadows illuminated only by distant stars.',
    jlpt: 'N3',
    imageUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=900&q=80'
  },

  // ================= N2 (3 Kana) =================
  {
    id: 'n2_3_iseki',
    kana: 'いせき',
    kanji: '遺跡',
    romaji: 'iseki',
    english: 'Ancient Ruins',
    category: 'History',
    hint: 'Historic stone monuments and archaeological remains.',
    jlpt: 'N2',
    imageUrl: 'https://images.unsplash.com/photo-1518638150340-f706e86654de?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'n2_3_shiori',
    kana: 'しおり',
    kanji: '栞',
    romaji: 'shiori',
    english: 'Bookmark',
    category: 'Literature',
    hint: 'Ribbon or card placed between the pages of an open book.',
    jlpt: 'N2',
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=900&q=80'
  },

  // ================= N2 (4 Kana) =================
  {
    id: 'n2_4_ikimono',
    kana: 'いきもの',
    kanji: '生き物',
    romaji: 'ikimono',
    english: 'Living Creature',
    category: 'Wildlife',
    hint: 'Wild animals and living beings thriving in nature.',
    jlpt: 'N2',
    imageUrl: 'https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'n2_4_katamari',
    kana: 'かたまり',
    kanji: '塊',
    romaji: 'katamari',
    english: 'Crystal Cluster / Mass',
    category: 'Minerals',
    hint: 'A solid natural cluster of quartz and mineral rock.',
    jlpt: 'N2',
    imageUrl: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=900&q=80'
  },

  // ================= N1 (3 Kana) =================
  {
    id: 'n1_3_kohaku',
    kana: 'こはく',
    kanji: '琥珀',
    romaji: 'kohaku',
    english: 'Amber Gemstone',
    category: 'Gemstones',
    hint: 'Golden fossilized tree resin glowing like warm honey.',
    jlpt: 'N1',
    imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'n1_3_yashiro',
    kana: 'やしろ',
    kanji: '社',
    romaji: 'yashiro',
    english: 'Sacred Shinto Shrine',
    category: 'Culture',
    hint: 'Ancient vermilion torii sanctuary nestled in a cedar forest.',
    jlpt: 'N1',
    imageUrl: 'https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?auto=format&fit=crop&w=900&q=80'
  },

  // ================= N1 (4 Kana) =================
  {
    id: 'n1_4_minamoto',
    kana: 'みなもと',
    kanji: '源',
    romaji: 'minamoto',
    english: 'Mountain River Source',
    category: 'Nature',
    hint: 'Pure spring waterfall where a mountain stream originates.',
    jlpt: 'N1',
    imageUrl: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'n1_4_tamashii',
    kana: 'たましい',
    kanji: '魂',
    romaji: 'tamashii',
    english: 'Soul / Spirit Flame',
    category: 'Philosophy',
    hint: 'Radiant inner flame symbolizing spirit and vitality.',
    jlpt: 'N1',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=900&q=80'
  }
];
