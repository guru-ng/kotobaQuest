export interface SurvivalCategory {
  id: string;
  title: string;
  titleJa: string;
  icon: string;
  description: string;
  descriptionJa: string;
  phrases: Array<{
    id: string;
    japanese: string;
    kana: string;
    romaji: string;
    english: string;
    register?: string;
    tip: string;
  }>;
}

export const SURVIVAL_CATEGORIES: SurvivalCategory[] = [
  {
    id: 'business',
    title: 'Business & Workplace',
    titleJa: 'ビジネス・職場',
    icon: 'Briefcase',
    description: 'Essential workplace greetings, meetings, emails, and formal Keigo etiquette',
    descriptionJa: '職場の挨拶、会議、メール、名刺交換で必須のビジネス表現',
    phrases: [
      {
        id: 'b1',
        japanese: 'お疲れ様です。',
        kana: 'おつかれさま です。',
        romaji: 'Otsukaresama desu.',
        english: 'Thank you for your hard work. (Standard workplace greeting)',
        register: 'Business Teineigo',
        tip: 'Used all day in Japanese offices instead of "Konnichiwa" when greeting coworkers.'
      },
      {
        id: 'b2',
        japanese: 'いつもお世話になっております。',
        kana: 'いつも おせわ に なって おります。',
        romaji: 'Itsumo osewa ni natte orimasu.',
        english: 'Thank you for your continued support and partnership.',
        register: 'Keigo (Humble)',
        tip: 'The mandatory opening line for business emails and phone calls with clients or partners.'
      },
      {
        id: 'b3',
        japanese: 'よろしくお願いいたします。',
        kana: 'よろしく おねがい いたします。',
        romaji: 'Yoroshiku onegai itashimasu.',
        english: 'I look forward to working with you / Please regard this favorably.',
        register: 'Keigo (Humble)',
        tip: 'More formal than "onegaishimasu". Used to close meetings, introductions, and business requests.'
      },
      {
        id: 'b4',
        japanese: 'かしこまりました。',
        kana: 'かしこまりました。',
        romaji: 'Kashikomarimashita.',
        english: 'Certainly / Understood.',
        register: 'Keigo (Formal)',
        tip: 'Use this instead of "Wakarimashita" when speaking to superiors, clients, or customers.'
      },
      {
        id: 'b5',
        japanese: '恐れ入りますが、ご確認いただけますでしょうか。',
        kana: 'おそれいります が、ごかくにん いただけます でしょうか。',
        romaji: 'Osoreirimasu ga, go-kakunin itadakemasu deshou ka.',
        english: 'Pardon the trouble, but could you please review/confirm this?',
        register: 'Keigo (Cushion + Respectful)',
        tip: '"Osoreirimasu ga" is a classic cushion phrase that softens any business request.'
      },
      {
        id: 'b6',
        japanese: 'お先に失礼いたします。',
        kana: 'おさき に しつれい いたします。',
        romaji: 'Osaki ni shitsurei itashimasu.',
        english: 'Excuse me for leaving before you.',
        register: 'Business Keigo',
        tip: 'Always say this to your team when leaving the office at the end of the workday.'
      }
    ]
  },
  {
    id: 'teinei',
    title: 'Teineigo (Polite)',
    titleJa: '丁寧語・礼儀',
    icon: 'Sparkles',
    description: 'Refined everyday polite speech (Desu/Masu) and graceful social manners',
    descriptionJa: '日常やフォーマルな場面で好印象を与える丁寧語・クッション言葉',
    phrases: [
      {
        id: 'tn1',
        japanese: '少々お待ちください。',
        kana: 'しょうしょう おまち ください。',
        romaji: 'Shoushou omachi kudasai.',
        english: 'Please wait a moment.',
        register: 'Teineigo (Polite)',
        tip: 'Much more refined than "Chotto matte kudasai" in polite conversation.'
      },
      {
        id: 'tn2',
        japanese: 'ありがとうございます。とても助かりました。',
        kana: 'ありがとう ございます。とても たすかりました。',
        romaji: 'Arigatou gozaimasu. Totemo tasukarimashita.',
        english: 'Thank you very much. You were a great help.',
        register: 'Teineigo (Polite)',
        tip: 'Adding "tasukarimashita" (you saved/helped me) expresses warm, genuine appreciation.'
      },
      {
        id: 'tn3',
        japanese: 'お邪魔します。',
        kana: 'おじゃま します。',
        romaji: 'Ojama shimasu.',
        english: 'Excuse me for intruding.',
        register: 'Teineigo (Etiquette)',
        tip: 'Say this when stepping into someone’s home, office room, or private space.'
      },
      {
        id: 'tn4',
        japanese: '差し支えなければ、教えていただけますか？',
        kana: 'さしつかえ なければ、おしえて いただけますか？',
        romaji: 'Sashitsukae nakereba, oshiete itadakemasu ka?',
        english: 'If it is not inconvenient, could you please tell me?',
        register: 'Teineigo + Cushion',
        tip: '"Sashitsukae nakereba" shows respect for the other person’s time and privacy.'
      },
      {
        id: 'tn5',
        japanese: 'ご迷惑をおかけして申し訳ありません。',
        kana: 'ごめいわく を おかけ して もうしわけ ありません。',
        romaji: 'Go-meiwaku o okake shite moushiwake arimasen.',
        english: 'I sincerely apologize for causing you inconvenience.',
        register: 'Teineigo (Formal Apology)',
        tip: 'More sincere and mature than a casual "Sumimasen" when making a mistake.'
      },
      {
        id: 'tn6',
        japanese: 'どうぞお気をつけください。',
        kana: 'どうぞ おき を つけ ください。',
        romaji: 'Douzo o-ki o tsuke kudasai.',
        english: 'Please take care / Have a safe trip home.',
        register: 'Teineigo (Polite)',
        tip: 'A warm, polite parting phrase when seeing off guests, friends, or colleagues.'
      }
    ]
  },
  {
    id: 'dining',
    title: 'Izakaya & Dining',
    titleJa: '居酒屋・食事',
    icon: 'Utensils',
    description: 'Ordering food, drinks, and asking for the bill like a local',
    descriptionJa: '注文やおすすめ、お会計など飲食店で使える表現',
    phrases: [
      {
        id: 'd1',
        japanese: 'これをください。',
        kana: 'これ を ください。',
        romaji: 'Kore o kudasai.',
        english: 'This one, please. (Point at menu)',
        register: 'Teineigo',
        tip: 'Universal phrase! Point at any menu picture or item and say this.'
      },
      {
        id: 'd2',
        japanese: 'おすすめは何ですか？',
        kana: 'おすすめ は なん ですか？',
        romaji: 'Osusume wa nan desu ka?',
        english: 'What do you recommend?',
        register: 'Teineigo',
        tip: 'Great way to get the chef’s seasonal specialty.'
      },
      {
        id: 'd3',
        japanese: 'お会計をお願いします。',
        kana: 'おかいけい を おねがいします。',
        romaji: 'O-kaikei o onegaishimasu.',
        english: 'The bill / check, please.',
        register: 'Teineigo',
        tip: 'You can also make an "X" sign with your index fingers.'
      },
      {
        id: 'd4',
        japanese: 'お水を一杯もらえますか？',
        kana: 'おみず を いっぱい もらえますか？',
        romaji: 'O-mizu o ippai moraemasu ka?',
        english: 'Could I have a glass of water?',
        register: 'Teineigo',
        tip: 'Water is complimentary in Japanese restaurants.'
      },
      {
        id: 'd5',
        japanese: 'ごちそうさまでした！',
        kana: 'ごちそうさま でした！',
        romaji: 'Gochisousama deshita!',
        english: 'Thank you for the delicious meal!',
        register: 'Polite Set Phrase',
        tip: 'Say this to the restaurant staff as you leave.'
      }
    ]
  },
  {
    id: 'transit',
    title: 'Trains & Transit',
    titleJa: '電車・移動',
    icon: 'Train',
    description: 'Navigating train stations, platforms, and asking for directions',
    descriptionJa: '駅やホーム、乗り換え、ICカードのチャージで役立つ表現',
    phrases: [
      {
        id: 't1',
        japanese: 'すみません、駅はどこですか？',
        kana: 'すみません、えき は どこ ですか？',
        romaji: 'Sumimasen, eki wa doko desu ka?',
        english: 'Excuse me, where is the station?',
        register: 'Teineigo',
        tip: 'Replace "eki" with any place (e.g., "toire" for bathroom).'
      },
      {
        id: 't2',
        japanese: 'この電車は新宿に行きますか？',
        kana: 'この でんしゃ は しんじゅく に いきますか？',
        romaji: 'Kono densha wa Shinjuku ni ikimasu ka?',
        english: 'Does this train go to Shinjuku?',
        register: 'Teineigo',
        tip: 'Swap Shinjuku for your destination station.'
      },
      {
        id: 't3',
        japanese: '切符の買い方を教えてください。',
        kana: 'きっぷ の かいかた を おしえて ください。',
        romaji: 'Kippu no kaikata o oshiete kudasai.',
        english: 'Please teach me how to buy a ticket.',
        register: 'Teineigo',
        tip: 'Station attendants are friendly and eager to help.'
      },
      {
        id: 't4',
        japanese: 'Suicaにチャージしたいです。',
        kana: 'すいか に ちゃーじ したい です。',
        romaji: 'Suica ni chaaji shitai desu.',
        english: 'I want to top up / charge my IC card.',
        register: 'Teineigo',
        tip: 'Ticket machines accept cash for IC card top-ups.'
      }
    ]
  },
  {
    id: 'konbini',
    title: 'Konbini & Shopping',
    titleJa: 'コンビニ・買い物',
    icon: 'ShoppingBag',
    description: 'Bags, warming up bento, tax-free and payment',
    descriptionJa: 'レジ袋、お弁当の温め、免税、キャッシュレス決済の表現',
    phrases: [
      {
        id: 's1',
        japanese: '袋は大丈夫です。',
        kana: 'ふくろ は だいじょうぶ です。',
        romaji: 'Fukuro wa daijoubu desu.',
        english: 'No plastic bag needed, thank you.',
        register: 'Teineigo',
        tip: 'Saves 3-5 yen and reduces plastic waste.'
      },
      {
        id: 's2',
        japanese: '温めてください。',
        kana: 'あたためて ください。',
        romaji: 'Atatamete kudasai.',
        english: 'Please heat this up for me.',
        register: 'Teineigo',
        tip: 'Use when buying onigiri, bento, or fried chicken.'
      },
      {
        id: 's3',
        japanese: '免税できますか？',
        kana: 'めんぜい できますか？',
        romaji: 'Menzei dekimasu ka?',
        english: 'Can I do tax-free shopping here?',
        register: 'Teineigo',
        tip: 'Keep your passport with you to save 10% consumption tax!'
      },
      {
        id: 's4',
        japanese: 'クレジットカードは使えますか？',
        kana: 'くれじっと かーど は つかえますか？',
        romaji: 'Kurejitto kaado wa tsukaemasu ka?',
        english: 'Can I use a credit card?',
        register: 'Teineigo',
        tip: 'While contactless cards are growing, small shops still prefer cash.'
      }
    ]
  },
  {
    id: 'polite',
    title: 'Emergency & Help',
    titleJa: '緊急・ヘルプ',
    icon: 'HeartHandshake',
    description: 'Essential phrases for getting assistance in a pinch',
    descriptionJa: '困った時や緊急時に助けを求める表現',
    phrases: [
      {
        id: 'p1',
        japanese: '英語が話せますか？',
        kana: 'えいご が はなせますか？',
        romaji: 'Eigo ga hanasemasu ka?',
        english: 'Can you speak English?',
        register: 'Teineigo',
        tip: 'Polite way to inquire before speaking English.'
      },
      {
        id: 'p2',
        japanese: 'もう一度ゆっくり言ってください。',
        kana: 'もう いちど ゆっくり いって ください。',
        romaji: 'Mou ichido yukkuri itte kudasai.',
        english: 'Please say that once more slowly.',
        register: 'Teineigo',
        tip: 'Locals will happily slow down their speech.'
      },
      {
        id: 'p3',
        japanese: '写真を撮ってもらえますか？',
        kana: 'しゃしん を とって もらえますか？',
        romaji: 'Shashin o totte moraemasu ka?',
        english: 'Could you take a photo for me?',
        register: 'Teineigo',
        tip: 'Great when visiting shrines, landmarks, and temples.'
      },
      {
        id: 'p4',
        japanese: '助けてください！',
        kana: 'たすけて ください！',
        romaji: 'Tasukete kudasai!',
        english: 'Please help me! (Emergency)',
        register: 'Urgent Polite',
        tip: 'Only for serious emergency situations.'
      }
    ]
  }
];
