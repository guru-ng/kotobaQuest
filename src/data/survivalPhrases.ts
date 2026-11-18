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
  },
  {
    id: 'restaurant',
    title: 'Restaurant Work',
    titleJa: '飲食店の接客',
    icon: 'UtensilsCrossed',
    description: 'Serving customers on the floor: seating, taking orders, clearing plates and the register',
    descriptionJa: 'ホールでの接客 — 席案内、注文取り、料理提供、会計までの定型表現',
    phrases: [
      {
        id: 'r1',
        japanese: 'いらっしゃいませ。',
        kana: 'いらっしゃいませ。',
        romaji: 'Irasshaimase.',
        english: 'Welcome. (said to every customer entering)',
        register: 'Service Greeting',
        tip: 'No reply is expected. Customers do not answer it, and you do not wait for one.'
      },
      {
        id: 'r2',
        japanese: '何名様でしょうか。',
        kana: 'なんめいさま でしょうか。',
        romaji: 'Nanmeisama deshou ka.',
        english: 'How many people?',
        register: 'Service Keigo',
        tip: '様 (sama) is what makes it polite. 何名ですか alone sounds blunt to a customer.'
      },
      {
        id: 'r3',
        japanese: 'お好きな席へどうぞ。',
        kana: 'おすきな せき へ どうぞ。',
        romaji: 'Osuki na seki e douzo.',
        english: 'Please sit anywhere you like.',
        register: 'Service Keigo',
        tip: 'Use when the restaurant is not full. Say it and then stop following them — hovering reads as if you are about to seat them after all. 空いているお席へどうぞ works too.'
      },
      {
        id: 'r4',
        japanese: 'こちらへどうぞ。',
        kana: 'こちら へ どうぞ。',
        romaji: 'Kochira e douzo.',
        english: 'This way, please.',
        register: 'Service Keigo',
        tip: 'The other fork after asking the party size: you walk them to a table instead of letting them choose.'
      },
      {
        id: 'r5',
        japanese: 'ただいま満席でございます。',
        kana: 'ただいま まんせき で ございます。',
        romaji: 'Tadaima manseki de gozaimasu.',
        english: 'We are full at the moment.',
        register: 'Service Keigo',
        tip: 'Follow it with how long the wait is if you know, or offer the waiting list.'
      },
      {
        id: 'r6',
        japanese: '少々お待ちくださいませ。',
        kana: 'しょうしょう おまち くださいませ。',
        romaji: 'Shoushou omachi kudasaimase.',
        english: 'One moment, please.',
        register: 'Service Keigo',
        tip: 'くださいませ is softer than ください and is standard on the floor.'
      },
      {
        id: 'r7',
        japanese: 'ご注文はお決まりでしょうか。',
        kana: 'ごちゅうもん は おきまり でしょうか。',
        romaji: 'Go-chuumon wa okimari deshou ka.',
        english: 'Are you ready to order?',
        register: 'Service Keigo',
        tip: 'Ask once, then give them space. Asking again too soon pressures the table.'
      },
      {
        id: 'r8',
        japanese: '辛さはいかがなさいますか。',
        kana: 'からさ は いかが なさいますか。',
        romaji: 'Karasa wa ikaga nasaimasu ka.',
        english: 'How spicy would you like it?',
        register: 'Service Keigo',
        tip: 'Comes up constantly in Nepali and Indian restaurants. Have the levels ready: 甘口 (amakuchi, mild), 中辛 (chuukara, medium), 辛口 (karakuchi, hot).'
      },
      {
        id: 'r9',
        japanese: 'ナンとライス、どちらになさいますか。',
        kana: 'ナン と ライス、どちら に なさいますか。',
        romaji: 'Nan to raisu, dochira ni nasaimasu ka.',
        english: 'Naan or rice?',
        register: 'Service Keigo',
        tip: 'なさいますか is the respectful form of します — use it when asking a customer to choose.'
      },
      {
        id: 'r10',
        japanese: 'お飲み物はいかがなさいますか。',
        kana: 'おのみもの は いかが なさいますか。',
        romaji: 'O-nomimono wa ikaga nasaimasu ka.',
        english: 'Anything to drink?',
        register: 'Service Keigo',
        tip: 'Ask while taking the food order, not after. A second trip for drinks slows the whole table.'
      },
      {
        id: 'r11',
        japanese: '復唱させていただきます。',
        kana: 'ふくしょう させて いただきます。',
        romaji: 'Fukushou sasete itadakimasu.',
        english: 'Let me repeat your order back to you.',
        register: 'Service Keigo (Humble)',
        tip: 'Read the order back before leaving the table. It catches mistakes while they are still free to fix.'
      },
      {
        id: 'r12',
        japanese: 'ご注文は以上でよろしいでしょうか。',
        kana: 'ごちゅうもん は いじょう で よろしい でしょうか。',
        romaji: 'Go-chuumon wa ijou de yoroshii deshou ka.',
        english: 'Is that everything?',
        register: 'Service Keigo',
        tip: 'Say よろしいでしょうか, never よろしかったでしょうか. The past tense is wrong and extremely common among new staff.'
      },
      {
        id: 'r13',
        japanese: '申し訳ございません、ただいま品切れでございます。',
        kana: 'もうしわけ ございません、ただいま しなぎれ で ございます。',
        romaji: 'Moushiwake gozaimasen, tadaima shinagire de gozaimasu.',
        english: 'I am sorry, that is sold out.',
        register: 'Service Keigo (Apology)',
        tip: 'Offer an alternative in the same breath, or the customer has to start choosing over again.'
      },
      {
        id: 'r14',
        japanese: 'お待たせいたしました。',
        kana: 'おまたせ いたしました。',
        romaji: 'Omatase itashimashita.',
        english: 'Thank you for waiting.',
        register: 'Service Keigo (Humble)',
        tip: 'Said as you put the food down, every time. お待たせいたしました outranks お待たせしました — use the first with customers.'
      },
      {
        id: 'r15',
        japanese: '熱いのでお気をつけください。',
        kana: 'あつい ので おきをつけ ください。',
        romaji: 'Atsui node oki o tsuke kudasai.',
        english: 'Careful, it is hot.',
        register: 'Service Keigo',
        tip: 'For sizzling plates and clay pots. Say it before you let go of the dish, not after.'
      },
      {
        id: 'r16',
        japanese: '以上でお揃いでしょうか。',
        kana: 'いじょう で おそろい でしょうか。',
        romaji: 'Ijou de osoroi deshou ka.',
        english: 'Is everything here?',
        register: 'Service Keigo',
        tip: 'Ask once the last dish lands. Catches a missing order before the table has to flag you down.'
      },
      {
        id: 'r17',
        japanese: 'ごゆっくりどうぞ。',
        kana: 'ごゆっくり どうぞ。',
        romaji: 'Goyukkuri douzo.',
        english: 'Please take your time.',
        register: 'Service Keigo',
        tip: 'Your exit line from the table once the food is served.'
      },
      {
        id: 'r18',
        japanese: 'お下げしてもよろしいでしょうか。',
        kana: 'おさげ しても よろしい でしょうか。',
        romaji: 'Osage shite mo yoroshii deshou ka.',
        english: 'May I clear this?',
        register: 'Service Keigo',
        tip: 'Ask when a plate looks finished — empty, or chopsticks laid across it — and never while reaching for it. Hands at your side, ask, then take it once they answer. If they say まだです, step back with 失礼いたしました and leave it. At an izakaya, clear in batches rather than hovering after each dish.'
      },
      {
        id: 'r19',
        japanese: 'ただいま確認いたします。',
        kana: 'ただいま かくにん いたします。',
        romaji: 'Tadaima kakunin itashimasu.',
        english: 'I will check right away.',
        register: 'Service Keigo (Humble)',
        tip: 'Better than guessing. Go and find out, then come back with an answer.'
      },
      {
        id: 'r20',
        japanese: 'すぐにお作り直しいたします。',
        kana: 'すぐに おつくりなおし いたします。',
        romaji: 'Sugu ni otsukurinaoshi itashimasu.',
        english: 'I will have it remade immediately.',
        register: 'Service Keigo (Humble)',
        tip: 'For a wrong or cold dish. Say it before the customer has to ask for it.'
      },
      {
        id: 'r21',
        japanese: 'お会計は一緒でよろしいでしょうか。',
        kana: 'おかいけい は いっしょ で よろしい でしょうか。',
        romaji: 'O-kaikei wa issho de yoroshii deshou ka.',
        english: 'One bill for the table?',
        register: 'Service Keigo',
        tip: 'Ask before you start ringing anything up.'
      },
      {
        id: 'r22',
        japanese: 'お会計は別々でよろしいでしょうか。',
        kana: 'おかいけい は べつべつ で よろしい でしょうか。',
        romaji: 'O-kaikei wa betsubetsu de yoroshii deshou ka.',
        english: 'Separate bills, is that right?',
        register: 'Service Keigo',
        tip: '別々 means each pays for their own items; 割り勘 (warikan) means the total split evenly. Customers use both loosely, so confirm which they mean before adding anything up.'
      },
      {
        id: 'r23',
        japanese: '千円お預かりいたします。',
        kana: 'せんえん おあずかり いたします。',
        romaji: 'Sen-en oazukari itashimasu.',
        english: 'Taking one thousand yen.',
        register: 'Service Keigo (Humble)',
        tip: 'Say the amount back as you take it. And say 千円でございます for the price — 千円になります is the classic beginner error, since nothing is becoming a thousand yen.'
      },
      {
        id: 'r24',
        japanese: 'お釣りとレシートでございます。',
        kana: 'おつり と レシート で ございます。',
        romaji: 'Otsuri to reshiito de gozaimasu.',
        english: 'Your change and receipt.',
        register: 'Service Keigo',
        tip: 'Hand change with both hands. Also drop 〜の方 (hou) — お釣りの方 is filler, お釣りでございます is correct.'
      },
      {
        id: 'r25',
        japanese: '現金のみとなっております。',
        kana: 'げんきん のみ と なって おります。',
        romaji: 'Genkin nomi to natte orimasu.',
        english: 'We take cash only.',
        register: 'Service Keigo',
        tip: 'Say it when they are seated, not at the register. Finding out at the end is what upsets people.'
      },
      {
        id: 'r26',
        japanese: 'またお越しくださいませ。',
        kana: 'また おこし くださいませ。',
        romaji: 'Mata okoshi kudasaimase.',
        english: 'Please come again.',
        register: 'Service Keigo',
        tip: 'Pair it with ありがとうございました as they leave.'
      }
    ]
  }
];
