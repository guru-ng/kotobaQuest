export interface NepaliEntry {
  meaningNe: string;       // Devanagari meaning + Romanized Nepali
  exampleNe: string;       // Full Nepali example sentence in Devanagari
  exampleNeRomaji?: string;// Romanized Nepali for easy reading
  grammarNote?: string;    // SOV / particle parallel between Japanese and Nepali
}

export const NEPALI_WORDLE_MAP: Record<string, NepaliEntry> = {
  n5_3_sakura: {
    meaningNe: 'साकुरा / पैयुँको फूल (Sakura phool)',
    exampleNe: 'वसन्त ऋतुमा सुन्दर साकुरा फुल्छ। (Vasanta rituma sundar sakura phulchha.)',
    grammarNote: 'SOV Parallel: 春に (वसन्तमा) + 桜が (साकुरा) + 咲く (फुल्छ)'
  },
  n5_3_kimono: {
    meaningNe: 'किमोनो / परम्परागत जापानी पोशाक (Kimono)',
    exampleNe: 'उहाँले चाडपर्वमा सुन्दर किमोनो लगाउनुभयो।',
    grammarNote: 'を (o) in 着物を着る maps directly to नेपाली "-लाई" or direct object + लगाउनु (lagaunu).'
  },
  n5_3_kitsune: {
    meaningNe: 'फ्याउरो (Phyaauro)',
    exampleNe: 'जंगलमा रातो फ्याउरो दौडिरहेको छ।',
    grammarNote: '森で (जंगलमा) + 狐が (फ्याउरो) + 走る (दौडन्छ)'
  },
  n5_3_kuruma: {
    meaningNe: 'गाडी / कार (Gaadi / Car)',
    exampleNe: 'म गाडीमा काममा जान्छु। (Ma gaadima kaamma janchhu.)',
    grammarNote: '車で (गाडीमा / गाडीबाट) — Japanese で (de) = Nepali "-मा / -बाट"'
  },
  n5_3_sakana: {
    meaningNe: 'माछा (Maachha)',
    exampleNe: 'मलाई ताजा माछा मन पर्छ। (Malai taaja maachha man parchha.)',
    grammarNote: '魚が好き (माछा मन पर्छ) — exact same word order!'
  },
  n5_4_hikouki: {
    meaningNe: 'हवाईजहाज (Hawaijahaj)',
    exampleNe: 'हवाईजहाजबाट जापान जान्छु। (Hawaijahajbata Japan janchhu.)',
    grammarNote: '飛行機で日本へ行く = हवाईजहाजबाट जापान जान्छु (100% identical SOV order)'
  },
  n5_4_taiyou: {
    meaningNe: 'सूर्य / घाम (Surya / Ghaam)',
    exampleNe: 'आज घाम न्यानो छ। (Aaja ghaam nyaano chha.)',
    grammarNote: '太陽は暖かい = घाम न्यानो छ (Subject + Adjective + Copula)'
  },
  n5_4_kaminari: {
    meaningNe: 'चट्याङ / मेघगर्जन (Chatyang)',
    exampleNe: 'राती ठूलो चट्याङ पर्यो।',
    grammarNote: '雷が鳴る = चट्याङ पर्नु / गड्कनु'
  },
  n4_3_minato: {
    meaningNe: 'बन्दरगाह (Bandargaaha)',
    exampleNe: 'बन्दरगाहमा ठूलो पानीजहाज रोकिएको छ।',
    grammarNote: '港に (बन्दरगाहमा) — Japanese に = Nepali "-मा"'
  },
  n4_3_matsuri: {
    meaningNe: 'चाडपर्व / जात्रा / महोत्सव (Chaadaparva / Jatra)',
    exampleNe: 'जापानको जात्रा निकै रमाइलो हुन्छ।',
    grammarNote: '日本の祭り = जापानको जात्रा (の = को)'
  },
  n4_3_keshiki: {
    meaningNe: 'दृश्य / मनोरम दृश्य (Drishya)',
    exampleNe: 'हिमालको दृश्य अति सुन्दर छ।',
    grammarNote: '山の景色 = हिमालको दृश्य (Exact possessive particle match: の = को)'
  },
  n4_4_yakitori: {
    meaningNe: 'याकितोरी / पोलेको कुखुराको मासु (Yakitori)',
    exampleNe: 'साथीसँग याकितोरी खाएँ।',
    grammarNote: '友達と (साथीसँग) — Japanese と = Nepali "-सँग"'
  },
  n4_4_takenoko: {
    meaningNe: 'तामा / बाँसको टुसा (Taama / Baansko tusa)',
    exampleNe: 'नेपाल र जापान दुवैमा बाँसको तामा खाइन्छ।',
    grammarNote: '竹の子 = बाँसको टुसा (तामा)'
  },
  n3_3_koori: {
    meaningNe: 'बरफ / हिउँ (Baraph)',
    exampleNe: 'चिसो पानीमा बरफ हाल्नुहोस्।',
    grammarNote: '水に氷を入れる = पानीमा बरफ हाल्नु'
  },
  n3_3_arashi: {
    meaningNe: 'आँधीबेहरी / हुरीबतास (Aandhibehari)',
    exampleNe: 'आँधीबेहरी पछि आकाश सफा भयो।',
    grammarNote: '嵐の後で = आँधीबेहरी पछि (Postposition order matches)'
  },
  n3_3_inochi: {
    meaningNe: 'जीवन / प्राण (Jeevan / Praan)',
    exampleNe: 'सबैको जीवन अमूल्य हुन्छ।',
    grammarNote: '命は大切だ = जीवन अमूल्य छ'
  },
  n3_4_akatsuki: {
    meaningNe: 'उषाकाल / मिर्मिरे बिहानी (Mirmire bihani)',
    exampleNe: 'मिर्मिरे बिहानीमा पूर्वी आकाश रातो भयो।',
    grammarNote: '暁の空 = मिर्मिरे बिहानीको आकाश'
  },
  n3_4_kurayami: {
    meaningNe: 'अन्धकार / अँध्यारो (Andhakaar / Andhyaaro)',
    exampleNe: 'अँध्यारोमा ताराहरू चम्किन्छन्।',
    grammarNote: '暗闇で星が輝く = अँध्यारोमा ताराहरू चम्किन्छन्'
  },
  n2_3_iseki: {
    meaningNe: 'प्राचीन भग्नावशेष / पुरातात्विक स्थल (Praachin bhagnawashesh)',
    exampleNe: 'हामीले ऐतिहासिक भग्नावशेषको भ्रमण गर्यौं।',
    grammarNote: '遺跡を見学する = पुरातात्विक स्थलको अवलोकन गर्नु'
  },
  n2_3_shiori: {
    meaningNe: 'पुस्तक चिन्ह / बुकमार्क (Pustak chinha)',
    exampleNe: 'किताबको पानामा बुकमार्क राखें।',
    grammarNote: '本に栞を挟む = किताबमा चिन्ह राख्नु'
  },
  n2_4_ikimono: {
    meaningNe: 'जीवजन्तु / प्राणी (Jeevjantu / Praani)',
    exampleNe: 'समुद्रमा धेरै प्रकारका जीवजन्तु बस्छन्।',
    grammarNote: '生き物 = जीवित प्राणी'
  },
  n2_4_katamari: {
    meaningNe: 'ढिक्का / डल्लो / समूह (Dhikka / Dallo)',
    exampleNe: 'криस्टलको सुन्दर ढिक्का भेटियो।',
    grammarNote: '塊 (かたまり) = ढिक्का वा समूह'
  },
  n1_3_kohaku: {
    meaningNe: 'एम्बर रत्न / पहेंलो रत्न (Amber ratna)',
    exampleNe: 'यो औंठीमा पुरानो एम्बर रत्न जडान गरिएको छ।',
    grammarNote: '琥珀の指輪 = एम्बर रत्नको औंठी'
  },
  n1_3_yashiro: {
    meaningNe: 'मन्दिर / देवस्थल (Mandir / Devasthal)',
    exampleNe: 'देवदारको जंगलभित्र पुरानो मन्दिर छ।',
    grammarNote: '森の中に社がある = जंगलभित्र मन्दिर छ'
  },
  n1_4_minamoto: {
    meaningNe: 'मुहान / स्रोत (Muhaan / Srot)',
    exampleNe: 'हिमाल नदीहरूको मुहान हो।',
    grammarNote: '川の源 = नदीको मुहान'
  },
  n1_4_tamashii: {
    meaningNe: 'आत्मा / चेतना (Aatma)',
    exampleNe: 'कलाकारले आफ्नो आत्मा र मेहनतले चित्र बनाए।',
    grammarNote: '魂を込める = आत्मादेखि मन लगाएर गर्नु'
  }
};

export const NEPALI_VOCAB_MAP: Record<string, NepaliEntry> = {
  n5_1: {
    meaningNe: 'सुशी (जापानी परिकार - भात र माछा)',
    exampleNe: 'मैले मीठो सुशी खाएँ। (Maile mitho sushi khaye.)',
    grammarNote: '美味しい(मीठो) + 寿司を(सुशी) + 食べました(खाएँ) — Exact same word order!'
  },
  n5_2: {
    meaningNe: 'पानी (Paani)',
    exampleNe: 'कृपया मलाई एक गिलास पानी दिनुहोस्। (Kripaya malai ek gilas paani dinuhos.)',
    grammarNote: 'お水を一杯 (एक गिलास पानी) + ください (दिनुहोस्)'
  },
  n5_3: {
    meaningNe: 'हरियो चिया / जापानी चिया (Chiya)',
    exampleNe: 'म तातो हरियो चिया पिउँछु। (Ma taato hariyo chiya piunchhu.)',
    grammarNote: '温かい(तातो) + お茶を(चिया) + 飲みます(पिउँछु)'
  },
  n5_4: {
    meaningNe: 'खानु (Khaanu)',
    exampleNe: 'म बिहानको खाजा खान्छु। (Ma bihanako khaja khanchhu.)',
    grammarNote: '朝ごはんを (बिहानको खाना) + 食べます (खान्छु)'
  },
  n5_5: {
    meaningNe: 'पिउनु (Piunu)',
    exampleNe: 'म कफी पिउँछु। (Ma kaphi piunchhu.)',
    grammarNote: 'コーヒーを (कफी) + 飲みます (पिउँछु)'
  },
  n5_6: {
    meaningNe: 'रेल स्टेशन (Rail Station)',
    exampleNe: 'टोकियो स्टेशन कहाँ छ? (Tokyo station kaha chha?)',
    grammarNote: '東京駅は (टोकियो स्टेशन) + どこ (कहाँ) + ですか (छ?)'
  },
  n5_7: {
    meaningNe: 'रेल / ट्रेन (Rail / Train)',
    exampleNe: 'म ट्रेनबाट अकिहाबारा जान्छु। (Ma train-bata Akihabara janchhu.)',
    grammarNote: '電車で (ट्रेनबाट) + 秋葉原に (अकिहाबारातिर) + 行きます (जान्छु)'
  },
  n5_8: {
    meaningNe: 'धन्यवाद (Dhanyabad)',
    exampleNe: 'मद्दत गर्नुभएकोमा धेरै धन्यवाद। (Maddat garnubhayekoma dherai dhanyabad.)',
    grammarNote: '手伝ってくれて (मद्दत गरिदिनुभएकोमा) + ありがとうございます (धेरै धन्यवाद)'
  },
  n5_9: {
    meaningNe: 'माफ गर्नुहोस् / सुन्नुहोस् त (Maaph garnuhos / Sunnuhos ta)',
    exampleNe: 'सुन्नुहोस् त, म अर्डर गर्न चाहन्छु।',
    grammarNote: 'Used just like नेपाली "सुन्नुहोस् त" (calling staff) or "माफ गर्नुहोस्" (apology).'
  },
  n5_10: {
    meaningNe: 'जानु (Jaanu)',
    exampleNe: 'म क्योटो जान्छु। (Ma Kyoto janchhu.)',
    grammarNote: '京都へ (क्योटोतिर) + 行きます (जान्छु)'
  },
  n4_1: {
    meaningNe: 'जानकारी / मार्गदर्शन (Jaankari / Margadarshan)',
    exampleNe: 'मैले स्टेशनमा सहरको जानकारी पाएँ।',
    grammarNote: '街の案内 = सहरको जानकारी (の = को)'
  },
  n4_2: {
    meaningNe: 'तयारी (Tayaari)',
    exampleNe: 'म यात्राको तयारी गर्दैछु। (Ma yatrako tayaari gardaichhu.)',
    grammarNote: '旅行の (यात्राको) + 準備を (तयारी) + しています (गर्दैछु)'
  },
  n4_3: {
    meaningNe: 'सम्पर्क / खबर (Samparka / Khabar)',
    exampleNe: 'म पछि फोनबाट सम्पर्क गर्नेछु। (Ma pachhi phone-bata samparka garnechhu.)',
    grammarNote: '後で (पछि) + 電話で (फोनबाट) + 連絡します (सम्पर्क गर्छु)'
  },
  n4_4: {
    meaningNe: 'अनुभव (Anubhav)',
    exampleNe: 'मैले जापानमा निकै राम्रो अनुभव गरें।',
    grammarNote: '日本で (जापानमा) + 素晴らしい経験 (राम्रो अनुभव) + しました (गरें)'
  },
  n4_5: {
    meaningNe: 'बाचा / भेट्ने समय (Baacha / Bhetne samaya)',
    exampleNe: 'मेरो साथीसँग भेट्ने बाचा छ।',
    grammarNote: '友達と (साथीसँग) + 会う約束 (भेट्ने बाचा) + があります (छ)'
  },
  n4_6: {
    meaningNe: 'विमानस्थल / एयरपोर्ट (Bimaansthal / Airport)',
    exampleNe: 'म हानेदा एयरपोर्ट जाने ट्रेन चढ्छु।',
    grammarNote: '羽田空港行きの電車 = हानेदा एयरपोर्ट जाने ट्रेन'
  },
  n4_7: {
    meaningNe: 'इजाकाया / जापानी रेस्टुरेन्ट-बार (Izakaya)',
    exampleNe: 'आज राती इजाकायामा रमाइलो गरौं!',
    grammarNote: '今夜は (आज राती) + 居酒屋で (इजाकायामा) + 飲みましょう (पिऔं!)'
  },
  n3_1: {
    meaningNe: 'समाधान (Samaadhan)',
    exampleNe: 'हामीले कठिन समस्या सफलतापूर्वक समाधान गर्यौं।',
    grammarNote: '問題を解決する = समस्या समाधान गर्नु'
  },
  n3_2: {
    meaningNe: 'प्रभाव / असर (Prabhaav / Asar)',
    exampleNe: 'मौसमले हाम्रो मनस्थितिमा प्रभाव पार्छ।',
    grammarNote: '気分に影響を与える = मनस्थितिमा प्रभाव पार्नु'
  },
  n3_3: {
    meaningNe: 'अर्थतन्त्र / आर्थिक अवस्था (Arthatantra)',
    exampleNe: 'म विश्व अर्थतन्त्रको अवस्था अध्ययन गर्दैछु।',
    grammarNote: '世界経済 = विश्व अर्थतन्त्र'
  },
  n3_4: {
    meaningNe: 'बानी / संस्कार (Baani / Sanskar)',
    exampleNe: 'मेरो हरेक बिहान हिँड्ने बानी छ।',
    grammarNote: '毎朝散歩する習慣 = हरेक बिहान हिँड्ने बानी'
  },
  n3_5: {
    meaningNe: 'मेहनत / प्रयास (Mehanat / Prayaas)',
    exampleNe: 'दैनिक मेहनतको मीठो फल मिल्यो।',
    grammarNote: '毎日の努力 = दैनिक मेहनत'
  },
  n3_6: {
    meaningNe: 'परिस्थिति / अवस्था (Paristhiti / Awastha)',
    exampleNe: 'कृपया त्यहाँको अवस्था जाँच गर्नुहोस्।',
    grammarNote: '現地の状況を確認してください = त्यहाँको अवस्था जाँच गर्नुहोस्'
  },
  n2_1: {
    meaningNe: 'नीति / सरकारी योजना (Niti)',
    exampleNe: 'सरकारले नयाँ वातावरणीय नीति घोषणा गर्यो।',
    grammarNote: '環境政策を発表した = वातावरणीय नीति घोषणा गर्यो'
  },
  n2_2: {
    meaningNe: 'प्रवृत्ति / झुकाव (Pravritti)',
    exampleNe: 'युवाहरूमा किताब पढ्ने बानी घट्दै गएको प्रवृत्ति देखिन्छ।',
    grammarNote: '〜の傾向が見られる = ...को प्रवृत्ति देखिन्छ'
  },
  n2_3: {
    meaningNe: 'प्रतीक / चिन्ह (Prateek)',
    exampleNe: 'साकुरा जापानको वसन्त ऋतुको प्रतीक हो।',
    grammarNote: '日本の春の象徴です = जापानको वसन्तको प्रतीक हो'
  },
  n2_4: {
    meaningNe: 'विजय प्राप्त गर्नु / कठिनाइ पार गर्नु (Kathinai paar garnu)',
    exampleNe: 'धेरै कठिनाइहरू पार गरेर हामी लक्ष्यमा पुग्यौं।',
    grammarNote: '困難を克服して = कठिनाइहरू पार गरेर (〜て = -एर)'
  },
  n2_5: {
    meaningNe: 'विस्तार / व्यापक प्रयोग (Vistaar / Byapak prayog)',
    exampleNe: 'स्मार्टफोनको प्रयोग तीव्र गतिमा फैलिँदैछ।',
    grammarNote: '急速な普及 = तीव्र विस्तार'
  },
  n2_6: {
    meaningNe: 'सुधार (Sudhaar)',
    exampleNe: 'हामीले काम गर्ने प्रक्रियामा सुधार गर्यौं।',
    grammarNote: '作業プロセスの改善 = काम गर्ने प्रक्रियाको सुधार'
  },
  n1_1: {
    meaningNe: 'सम्झौता / सहमति (Samjhauta)',
    exampleNe: 'दुवै पक्षले लचिलो भएर सम्झौताको बिन्दु फेला पारे।',
    grammarNote: '妥協点を見出す = सम्झौताको बिन्दु पत्ता लगाउनु'
  },
  n1_2: {
    meaningNe: 'विरोधाभास / असंगति (Birodhabhas)',
    exampleNe: 'उहाँको भनाइमा स्पष्ट विरोधाभास छ।',
    grammarNote: '彼の発言には矛盾がある = उहाँको भनाइमा विरोधाभास छ'
  },
  n1_3: {
    meaningNe: 'प्रवर्द्धन / प्रोत्साहन (Prabarddhan)',
    exampleNe: 'यो अन्तर्राष्ट्रिय सांस्कृतिक आदानप्रदान प्रवर्द्धन गर्ने योजना हो।',
    grammarNote: '文化交流を促進する = सांस्कृतिक आदानप्रदान प्रवर्द्धन गर्नु'
  },
  n1_4: {
    meaningNe: 'विनम्र / नम्रता (Binamra / Namrata)',
    exampleNe: 'सफल भए पनि सधैं विनम्र स्वभाव कायम राख्नुपर्छ।',
    grammarNote: '成功しても (सफल भए पनि) + 謙虚な姿勢を保つべきだ (विनम्र स्वभाव राख्नुपर्छ)'
  },
  n1_5: {
    meaningNe: 'सूक्ष्म र विस्तृत (Sukshma ra bistrit)',
    exampleNe: 'सूक्ष्म योजनाका आधारमा परीक्षण अघि बढाइयो।',
    grammarNote: '緻密な計画のもとで = सूक्ष्म योजनाको आधारमा'
  },
  n1_6: {
    meaningNe: 'चिन्ता / चासो (Chinta / Chaaso)',
    exampleNe: 'भविष्यको जलवायु परिवर्तनप्रति चिन्ता बढ्दै गएको छ।',
    grammarNote: '気候変動に対する懸念 = जलवायु परिवर्तनप्रतिको चिन्ता'
  }
};

export const NEPALI_SURVIVAL_MAP: Record<string, string> = {
  b1: 'तपाईंको मेहनतको लागि धन्यवाद / नमस्ते (अफिसमा सहकर्मीलाई दिनभरि भनिने अभिवादन)।',
  b2: 'तपाईंको निरन्तर सहयोगको लागि धेरै धन्यवाद (बिजनेस इमेल र फोनको सुरुमा भनिने आदरार्थी वाक्य)।',
  b3: 'तपाईंको सहयोगको अपेक्षा गर्दछु / सँगै मिलेर काम गरौं (बैठक वा परिचयको अन्त्यमा)।',
  b4: 'हवस्, मैले बुझें (ग्राहक वा सिनियरसँग कुरा गर्दा "वाकारिमासिता" को सट्टा प्रयोग गरिने उच्च आदरार्थी शब्द)।',
  b5: 'दुःख दिएकोमा क्षमाप्रार्थी छु, कृपया यो एकपटक जाँच गरिदिनुहुन्छ कि?',
  b6: 'म आज पहिला बिदा हुन्छु है (काम सकेर अफिसबाट निस्कँदा सहकर्मीहरूलाई भनिने वाक्य)।',
  tn1: 'कृपया एकैछिन पर्खनुहोस् (नम्र भाषामा कसैलाई पर्खन अनुरोध गर्दा)।',
  tn2: 'धेरै-धेरै धन्यवाद। तपाईंको ठूलो मद्दत मिल्यो।',
  tn3: 'आज्ञा पाऊँ / डिस्टर्ब गरें है (अरूको घर वा कोठाभित्र पस्दा भनिने शिष्टाचार)।',
  tn4: 'यदि तपाईंलाई अप्ठ्यारो पर्दैन भने, कृपया मलाई बताइदिनुहुन्छ कि?',
  tn5: 'तपाईंलाई दुःख वा असुविधा पुर्याएकोमा हृदयदेखि माफी चाहन्छु।',
  tn6: 'कृपया बाटोमा ख्याल राख्नुहोला / सुरक्षित यात्रा गर्नुहोला।',
  d1: 'कृपया मलाई यो दिनुहोस् (मेनुमा औंलाले देखाउँदै अर्डर गर्दा)।',
  d2: 'तपाईंको सिफारिस (सबैभन्दा मीठो परिकार) के हो?',
  d3: 'कृपया बिल दिनुहोस् (खाना खाइसकेपछि पैसा तिर्न माग्दा)।',
  d4: 'के म एक गिलास पानी पाउन सक्छु?',
  d5: 'मीठो खानाको लागि धेरै धन्यवाद! (खाना खाएर रेस्टुरेन्टबाट निस्कँदा भनिने)।',
  t1: 'सुन्नुहोस् त, रेल स्टेशन कहाँ छ?',
  t2: 'के यो ट्रेन शिन्जुकु जान्छ?',
  t3: 'कृपया मलाई टिकट किन्ने तरिका सिकाइदिनुहोस्।',
  t4: 'म मेरो सुइका (IC) कार्डमा पैसा रिचार्ज गर्न चाहन्छु।',
  s1: 'प्लास्टिकको झोला चाहिँदैन, धन्यवाद।',
  s2: 'कृपया यो खाना तताइदिनुहोस्।',
  s3: 'के यहाँ ट्याक्स-फ्री (कर छुट) सुविधा छ?',
  s4: 'के यहाँ क्रेडिट कार्ड चल्छ?',
  p1: 'के तपाईं अंग्रेजी बोल्नुहुन्छ?',
  p2: 'कृपया फेरि एकपटक बिस्तारै भनिदिनुहोस्।',
  p3: 'के तपाईं मेरो फोटो खिचिदिन सक्नुहुन्छ?',
  p4: 'कृपया मलाई बचाउनुहोस् / मद्दत गर्नुहोस्! (आपतकालीन अवस्थामा)'
};
