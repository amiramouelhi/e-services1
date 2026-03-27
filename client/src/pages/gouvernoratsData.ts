export interface Delegation {
  fr: { nom: string} | string;
  ar: { nom: string} | string;
}

export interface GouvernoratData {
  fr: string;
  ar: string;
  delegations: Delegation[];
}

export const GOUVERNORATS_DATA: GouvernoratData[] = [
  {
    fr: "Tunis",
    ar: "تونس",
    delegations: [
      { fr: {"nom":"Carthage"}, ar: {"nom":"قرطاج"} },
      { fr: {"nom":"La Médina"}, ar: {"nom":"المدينة"} },
      { fr: {"nom":"Bab Bhar"}, ar: {"nom":"باب بحر"} },
      { fr: {"nom":"Bab Souika"}, ar: {"nom":"باب سويقة"} },
      { fr: {"nom":"El Omrane"}, ar: {"nom":"العمران"} },
      { fr: {"nom":"Omrane Supérieur"}, ar: {"nom":"العمران الأعلى"} },
      { fr: {"nom":"Ettahrir"}, ar: {"nom":"التحرير"} },
      { fr: {"nom":"El Menzah"}, ar: {"nom":"المنزه"} },
      { fr: {"nom":"Cité Alkhadhra"}, ar: {"nom":"حي الخضراء"} },
      { fr: {"nom":"Séjoumi"}, ar: {"nom":"السيجومي"} },
      { fr: {"nom":"Azzouhour"}, ar: {"nom":"الزهور"} },
      { fr: {"nom":"Alhrairia"}, ar: {"nom":"الحرايرية"} },
      { fr: {"nom":"Sidi Hsine"}, ar: {"nom":"سيدي حسين"} },
      { fr: {"nom":"Ouardia"}, ar: {"nom":"الوردية"} },
      { fr: {"nom":"Sidi Elbéchir"}, ar: {"nom":"سيدي البشير"} },
      { fr: {"nom":"Jebel Jelloud"}, ar: {"nom":"جبل جلود"} },
      { fr: {"nom":"La Goulette"}, ar: {"nom":"حلق الوادي"} },
      { fr: {"nom":"Le Kram"}, ar: {"nom":"الكرم"} },
      { fr: {"nom":"El Kabbaria"}, ar: {"nom":"الكبارية"} },
      { fr: {"nom":"La Marsa"}, ar: {"nom":"المرسى"} }
    ],
  },
  {
    fr: "Ariana",
    ar: "أريانة",
    delegations: [
      { fr: {"nom":"Ariana Ville"}, ar: {"nom":"أريانة المدينة"} },
      { fr: {"nom":"Ettadhamen"}, ar: {"nom":"التضامن"} },
      { fr: {"nom":"M’nihla"}, ar: {"nom":"المنيهلة"} },
      { fr: {"nom":"Kalâat el-Andalous"}, ar: {"nom":"قلعة الأندلس"} },
      { fr: {"nom":"La Soukra"}, ar: {"nom":"سكرة"} },
      { fr: {"nom":"Raoued"}, ar: {"nom":"رواد"} },
      { fr: {"nom":"Sidi Thabet"}, ar: {"nom":"سيدي ثابت"} }
    ],
  },
 {
  fr: "Manouba",
  ar: "منوبة",
  delegations: [
    { fr: "Manouba",      ar: "منوبة" },
    { fr: "Oued Ellil",   ar: "وادي الليل" },
    { fr: "Tebourba",     ar: "تبرسق" },
    { fr: "Battan",       ar: "البطان" },
    { fr: "Jedaida",      ar: "الجديدة" },
    { fr: "Mornaguia",    ar: "مرناقية" },
    { fr: "Borj Amri",    ar: "برج العامري" },
    { fr: "Douar Hicher", ar: "دوار هيشر" }
  ]
},
{
  fr: "Ben Arous",
  ar: "بن عروس",
  delegations: [
    { fr: "Ben Arous",          ar: "بن عروس" },
    { fr: "Nouvelle Médina",    ar: "المدينة الجديدة" },
    { fr: "Mourouj",            ar: "المروج" },
    { fr: "Hammam Lif",         ar: "حمام الأنف" },
    { fr: "Hammam Chatt",       ar: "حمام الشط" },
    { fr: "Boumhel Bassatine",  ar: "بومهل البساتين" },
    { fr: "Ezzahra",            ar: "الزهراء" },
    { fr: "Radès",              ar: "رادس" },
    { fr: "Mégrine",            ar: "مقرين" },
    { fr: "M'hamdia",           ar: "المحمدية" },
    { fr: "Fouchana",           ar: "فوشانة" },
    { fr: "Mornag",             ar: "مرناق" }
  ]
},
{
  fr: "Nabeul",
  ar: "نابل",
  delegations: [
    { fr: "Nabeul",               ar: "نابل" },
    { fr: "Dar Chaâbane Elfehri", ar: "دار شعبان الفهري" },
    { fr: "Béni Khiar",           ar: "بني خيار" },
    { fr: "Korba",                ar: "قربة" },
    { fr: "Menzel Temime",        ar: "منزل تميم" },
    { fr: "Mida",                 ar: "الميدة" },
    { fr: "Kelibia",              ar: "قليبية" },
    { fr: "Hammam Ghezaz",        ar: "حمام الغزاز" },
    { fr: "Haouaria",             ar: "الهوارية" },
    { fr: "Takelsa",              ar: "تاكلسة" },
    { fr: "Slimane",              ar: "سليمان" },
    { fr: "Menzel Bouzelfa",      ar: "منزل بوزلفة" },
    { fr: "Béni Khalled",         ar: "بني خلاد" },
    { fr: "Grombalia",            ar: "قرمبالية" },
    { fr: "Bouârgoub",            ar: "بوعرقوب" },
    { fr: "Hammamet",             ar: "الحمامات" }
  ]
},
{
  fr: "Bizerte",
  ar: "بنزرت",
  delegations: [
    { fr: { nom: "Bizerte Nord" }, ar: { nom: "بنزرت الشمالية" } },
    { fr: { nom: "Jarzouna" }, ar: { nom: "جرزونة" } },
    { fr: { nom: "Bizerte Sud" }, ar: { nom: "بنزرت الجنوبية" } },
    { fr: { nom: "Sejnane" }, ar: { nom: "سجنان" } },
    { fr: { nom: "Joumine" }, ar: { nom: "جومين" } },
    { fr: { nom: "Mateur" }, ar: { nom: "ماطر" } },
    { fr: { nom: "Ghezala" }, ar: { nom: "غزالة" } },
    { fr: { nom: "Menzel Bourguiba" }, ar: { nom: "منزل بورقيبة" } },
    { fr: { nom: "Tinja" }, ar: { nom: "تينجة" } },
    { fr: { nom: "Utique" }, ar: { nom: "أوتيك" } },
    { fr: { nom: "Ghar El Melh" }, ar: { nom: "غار الملح" } },
    { fr: { nom: "Menzel Jemil" }, ar: { nom: "منزل جميل" } },
    { fr: { nom: "El Alia" }, ar: { nom: "العالية" } },
    { fr: { nom: "Ras Jebel" }, ar: { nom: "رأس الجبل" } }
  ],
},
  {
    fr: "Zaghouan",
    ar: "زغوان",
    delegations: [
      { fr: {"nom":"Zaghouan"}, ar: {"nom":"زغوان"} },
      { fr: {"nom":"Zériba"}, ar: {"nom":"زريبة"} },
      { fr: {"nom":"Bir Mecharga"}, ar: {"nom":"بئر مشارقة"} },
      { fr: {"nom":"Fahs"}, ar: {"nom":"الفحص"} },
      { fr: {"nom":"Nadhour"}, ar: {"nom":"الناظور"} },
      { fr: {"nom":"Saouaf"}, ar: {"nom":"الصواف"} }
    ],
  },
  {
    fr: "Sousse",
    ar: "سوسة",
    delegations: [
      { fr: {"nom":"Sousse"}, ar: {"nom":"سوسة"} },
      { fr: {"nom":"Sousse Ville"}, ar: {"nom":"سوسة المدينة"} },
      { fr: {"nom":"Sousse Ryadh"}, ar: {"nom":"سوسة الرياض"} },
      { fr: {"nom":"Sousse Jawhara"}, ar: {"nom":"سوسة جوهرة"} },
      { fr: {"nom":"Hammam sousse"}, ar: {"nom":"حمام سوسة"} },
      { fr: {"nom":"Akouda"}, ar: {"nom":"أكودة"} },
      { fr: {"nom":"Kalâa Elkébira"}, ar: {"nom":"القلعة الكبرى"} },
      { fr: {"nom":"Sidi Bouali"}, ar: {"nom":"سيدي بوعلي"} },
      { fr: {"nom":"Hergla"}, ar: {"nom":"هرقلة"} },
      { fr: {"nom":"Enfidha"}, ar: {"nom":"النفيضة"} },
      { fr: {"nom":"Bouficha"}, ar: {"nom":"بوفيشة"} },
      { fr: {"nom":"Koundar"}, ar: {"nom":"كندار"} },
      { fr: {"nom":"Sidi Elheni"}, ar: {"nom":"سيدي الهاني"} },
      { fr: {"nom":"Msaken"}, ar: {"nom":"مساكن"} },
      { fr: {"nom":"Kalâa Ességhira"}, ar: {"nom":"القلعة الصغرى"} }
    ],
  },
  {
    fr: "Mounastir",
    ar: "المنستير",
    delegations: [
      { fr: {"nom":"Monastir"}, ar: {"nom":"المنستير"} },
      { fr: {"nom":"Ouerdanine"}, ar: {"nom":"وردانين"} },
      { fr: {"nom":"Sahline"}, ar: {"nom":"الساحلين"} },
      { fr: {"nom":"Zéramdine"}, ar: {"nom":"زرمدين"} },
      { fr: {"nom":"Béni Hassan"}, ar: {"nom":"بني حسان"} },
      { fr: {"nom":"Jemmel"}, ar: {"nom":"جمال"} },
      { fr: {"nom":"Benbla"}, ar: {"nom":"بمبلة"} },
      { fr: {"nom":"Moknine"}, ar: {"nom":"المكنين"} },
      { fr: {"nom":"Bekalta"}, ar: {"nom":"بكالتة"} },
      { fr: {"nom":"Teboulba"}, ar: {"nom":"طبلبة"} },
      { fr: {"nom":"Ksar Helal"}, ar: {"nom":"قصر هلال"} },
      { fr: {"nom":"Ksibet Medyouni"}, ar: {"nom":"قصيبة المديوني"} },
      { fr: {"nom":"Sayada Lamta Bouhjar"}, ar: {"nom":"صيادة لمطة بوحجر"} }
    ],
  },
  {
    fr: "Mahdia",
    ar: "المهدية",
    delegations: [
      { fr: {"nom":"Mahdia"}, ar: {"nom":"المهدية"} },
      { fr: {"nom":"Boumerdes"}, ar: {"nom":"بومرداس"} },
      { fr: {"nom":"Ouled Chamekh"}, ar: {"nom":"أولاد شامخ"} },
      { fr: {"nom":"Chorbane"}, ar: {"nom":"شربان"} },
      { fr: {"nom":"Hbira"}, ar: {"nom":"هبيرة"} },
      { fr: {"nom":"Souassi"}, ar: {"nom":"السواسي"} },
      { fr: {"nom":"Eljem"}, ar: {"nom":"الجم"} },
      { fr: {"nom":"Chebba"}, ar: {"nom":"الشابة"} },
      { fr: {"nom":"Malloulech"}, ar: {"nom":"ملولش"} },
      { fr: {"nom":"Sidi Alouane"}, ar: {"nom":"سيدي علوان"} },
      { fr: {"nom":"Ksour Essef"}, ar: {"nom":"قصور الساف"} }
    ],
  },
  {
    fr: "Sfax",
    ar: "صفاقس",
    delegations: [
      { fr: {"nom":"Sfax Ville"}, ar: {"nom":"صفاقس المدينة"} },
      { fr: {"nom":"Sakiet Ezzit"}, ar: {"nom":"ساقية الزيت"} },
      { fr: {"nom":"Sakiet Eddaier"}, ar: {"nom":"ساقية الداير"} },
      { fr: {"nom":"Sfax sud"}, ar: {"nom":"صفاقس الجنوبية"} },
      { fr: {"nom":"Tina"}, ar: {"nom":"تينة"} },
      { fr: {"nom":"Agareb"}, ar: {"nom":"عقارب"} },
      { fr: {"nom":"Jebeniana"}, ar: {"nom":"جبنيانة"} },
      { fr: {"nom":"El Amra"}, ar: {"nom":"العامرة"} },
      { fr: {"nom":"El Hencha"}, ar: {"nom":"الحنشة"} },
      { fr: {"nom":"Menzel chaker"}, ar: {"nom":"منزل شاكر"} },
      { fr: {"nom":"Ghraiba"}, ar: {"nom":"غريبة"} },
      { fr: {"nom":"Bir Ali Ben Khelifa"}, ar: {"nom":"بئر علي بن خليفة"} },
      { fr: {"nom":"Sekhira"}, ar: {"nom":"الصخيرة"} },
      { fr: {"nom":"Mahrès"}, ar: {"nom":"محرس"} },
      { fr: {"nom":"Kerkennah"}, ar: {"nom":"قرقنة"} }
    ],
  },
  {
    fr: "Béja",
    ar: "باجة",
    delegations: [
      { fr: {"nom":"Béja Nord"}, ar: {"nom":"باجة الشمالية"} },
      { fr: {"nom":"Béja Sud"}, ar: {"nom":"باجة الجنوبية"} },
      { fr: {"nom":"Amdoun"}, ar: {"nom":"عمدون"} },
      { fr: {"nom":"Goubellat"}, ar: {"nom":"قبلاط"} },
      { fr: {"nom":"Medjez el-Bab"}, ar: {"nom":"مجاز الباب"} },
      { fr: {"nom":"Nefza"}, ar: {"nom":"نفزة"} },
      { fr: {"nom":"Téboursouk"}, ar: {"nom":"تبرسق"} },
      { fr: {"nom":"Testour"}, ar: {"nom":"تستور"} },
      { fr: {"nom":"Tibar"}, ar: {"nom":"ثيبار"} }
    ],
  },
  {
    fr: "Jendouba",
    ar: "جندوبة",
    delegations: [
      { fr: {"nom":"Jendouba"}, ar: {"nom":"جندوبة"} },
      { fr: {"nom":"Jendouba Nord"}, ar: {"nom":"جندوبة الشمالية"} },
      { fr: {"nom":"Boussalem"}, ar: {"nom":"بوسالم"} },
      { fr: {"nom":"Tabarka"}, ar: {"nom":"طبرقة"} },
      { fr: {"nom":"Ain Drahem"}, ar: {"nom":"عين دراهم"} },
      { fr: {"nom":"Fernana"}, ar: {"nom":"فرنانة"} },
      { fr: {"nom":"Ghardimaou"}, ar: {"nom":"غارديماو"} },
      { fr: {"nom":"Oued Mliz"}, ar: {"nom":"وادي مليز"} },
      { fr: {"nom":"Balta Bouaouene"}, ar: {"nom":"بلطة بوعوان"} }
    ],
  },
  {
    fr: "Siliana",
    ar: "سليانة",
    delegations: [
      { fr: {"nom":"Siliana nord"}, ar: {"nom":"سليانة الشمالية"} },
      { fr: {"nom":"Siliana sud"}, ar: {"nom":"سليانة الجنوبية"} },
      { fr: {"nom":"Bouarada"}, ar: {"nom":"بوعرادة"} },
      { fr: {"nom":"Gâafour"}, ar: {"nom":"قعفور"} },
      { fr: {"nom":"El Aroussa"}, ar: {"nom":"العروسة"} },
      { fr: {"nom":"Le Krib"}, ar: {"nom":"الكريب"} },
      { fr: {"nom":"Bourouis"}, ar: {"nom":"بورويس"} },
      { fr: {"nom":"Makther"}, ar: {"nom":"مكثر"} },
      { fr: {"nom":"Rouhia"}, ar: {"nom":"الروحية"} },
      { fr: {"nom":"Kesra"}, ar: {"nom":"كسرى"} },
      { fr: {"nom":"Bargou"}, ar: {"nom":"برقو"} }
    ],
  },
  {
    fr: "Kef",
    ar: "الكاف",
    delegations: [
      { fr: {"nom":"Kef Ouest"}, ar: {"nom":"الكاف الغربية"} },
      { fr: {"nom":"Kef Est"}, ar: {"nom":"الكاف الشرقية"} },
      { fr: {"nom":"Nebeur"}, ar: {"nom":"نبر"} },
      { fr: {"nom":"Sakiet Sidi Youssef"}, ar: {"nom":"ساقية سيدي يوسف"} },
      { fr: {"nom":"Tejerouine"}, ar: {"nom":"تاجروين"} },
      { fr: {"nom":"Kalâat sinane"}, ar: {"nom":"قلعة سنان"} },
      { fr: {"nom":"Kalâa El khasba"}, ar: {"nom":"القلعة الخصبة"} },
      { fr: {"nom":"Jerissa"}, ar: {"nom":"الجريصة"} },
      { fr: {"nom":"Ksour"}, ar: {"nom":"القصور"} },
      { fr: {"nom":"Dahmani"}, ar: {"nom":"الدهماني"} },
      { fr: {"nom":"Le Sers"}, ar: {"nom":"السرس"} }
    ],
  },
  {
    fr: "Kairouan",
    ar: "القيروان",
    delegations: [
      { fr: {"nom":"Kairouan Nord"}, ar: {"nom":"القيروان الشمالية"} },
      { fr: {"nom":"Kairouan Sud"}, ar: {"nom":"القيروان الجنوبية"} },
      { fr: {"nom":"Chebika"}, ar: {"nom":"الشبيكة"} },
      { fr: {"nom":"Sebikha"}, ar: {"nom":"السبيخة"} },
      { fr: {"nom":"Oueslatia"}, ar: {"nom":"الوسلاتية"} },
      { fr: {"nom":"Haffouz"}, ar: {"nom":"حفوز"} },
      { fr: {"nom":"El Ala"}, ar: {"nom":"العلا"} },
      { fr: {"nom":"Hajeb El Ayoun"}, ar: {"nom":"حاجب العيون"} },
      { fr: {"nom":"Nasrallah"}, ar: {"nom":"نصرالله"} },
      { fr: {"nom":"Cherarda"}, ar: {"nom":"الشراردة"} },
      { fr: {"nom":"Bouhajla"}, ar: {"nom":"بوحجلة"} }
    ],
  },
  {
    fr: "Sidi Bouzid",
    ar: "سيدي بوزيد",
    delegations: [
      { fr: {"nom":"Sidi Bouzid Ouest"}, ar: {"nom":"سيدي بوزيد الغربية"} },
      { fr: {"nom":"Sidi Bouzid Est"}, ar: {"nom":"سيدي بوزيد الشرقية"} },
      { fr: {"nom":"Jelma"}, ar: {"nom":"جلمة"} },
      { fr: {"nom":"Sabbalet Ouled Askar"}, ar: {"nom":"الصبالة أولاد عسكر"} },
      { fr: {"nom":"Bir Hfay"}, ar: {"nom":"بئر الحفي"} },
      { fr: {"nom":"Sidi Ali Benôun"}, ar: {"nom":"سيدي علي بن عون"} },
      { fr: {"nom":"Menzel Bouzayane"}, ar: {"nom":"منزل بوزيان"} },
      { fr: {"nom":"Meknassi"}, ar: {"nom":"المكناسي"} },
      { fr: {"nom":"Souk Jedid"}, ar: {"nom":"سوق الجديد"} },
      { fr: {"nom":"Mezouna"}, ar: {"nom":"مزونة"} },
      { fr: {"nom":"Regueb"}, ar: {"nom":"الرقاب"} },
      { fr: {"nom":"Ouled Haffouz"}, ar: {"nom":"أولاد حفوز"} }
    ],
  },
  {
    fr: "Kasserine",
    ar: "القصرين",
    delegations: [
      { fr: {"nom":"Kasserine Nord"}, ar: {"nom":"القصرين الشمالية"} },
      { fr: {"nom":"Kasserine Sud"}, ar: {"nom":"القصرين الجنوبية"} },
      { fr: {"nom":"Azzouhour"}, ar: {"nom":"الزهور"} },
      { fr: {"nom":"Hassi ferid"}, ar: {"nom":"حاسي الفريد"} },
      { fr: {"nom":"Sbitla"}, ar: {"nom":"سبيطلة"} },
      { fr: {"nom":"Sbiba"}, ar: {"nom":"سبيبة"} },
      { fr: {"nom":"Jedliane"}, ar: {"nom":"جدليان"} },
      { fr: {"nom":"El Ayoun"}, ar: {"nom":"العيون"} },
      { fr: {"nom":"Tela"}, ar: {"nom":"ثالة"} },
      { fr: {"nom":"Hidra"}, ar: {"nom":"هيدرة"} },
      { fr: {"nom":"Foussana"}, ar: {"nom":"فوسانة"} },
      { fr: {"nom":"Feriana"}, ar: {"nom":"فريانة"} },
      { fr: {"nom":"Mejel Bel Abbes"}, ar: {"nom":"ماجل بلعباس"} }
    ],
  },
  {
    fr: "Gabès",
    ar: "قابس",
    delegations: [
      { fr: {"nom":"Gabès MEDINA"}, ar: {"nom":"قابس المدينة"} },
      { fr: {"nom":"Gabès Ouest"}, ar: {"nom":"قابس الغربية"} },
      { fr: {"nom":"Gabès sud"}, ar: {"nom":"قابس الجنوبية"} },
      { fr: {"nom":"Ghannouch"}, ar: {"nom":"غنوش"} },
      { fr: {"nom":"Metouia"}, ar: {"nom":"المطوية"} },
      { fr: {"nom":"Menzel habib"}, ar: {"nom":"منزل الحبيب"} },
      { fr: {"nom":"Hamma"}, ar: {"nom":"الحامة"} },
      { fr: {"nom":"Matmata"}, ar: {"nom":"مطماطة"} },
      { fr: {"nom":"Matmata nouvelle"}, ar: {"nom":"مطماطة الجديدة"} },
      { fr: {"nom":"Mareth"}, ar: {"nom":"مارث"} }
    ],
  },
  {
    fr: "Medenine",
    ar: "مدنين",
    delegations: [
      { fr: {"nom":"Mednine Nord"}, ar: {"nom":"مدنين الشمالية"} },
      { fr: {"nom":"Mednine Sud"}, ar: {"nom":"مدنين الجنوبية"} },
      { fr: {"nom":"Béni khedach"}, ar: {"nom":"بني خداش"} },
      { fr: {"nom":"Ben Guerdene"}, ar: {"nom":"بن قردان"} },
      { fr: {"nom":"Zazis"}, ar: {"nom":"جرجيس"} },
      { fr: {"nom":"Jerba Houmet Souk"}, ar: {"nom":"جربة حومة السوق"} },
      { fr: {"nom":"Jerba Midoun"}, ar: {"nom":"جربة ميدون"} },
      { fr: {"nom":"Jerba Ajim"}, ar: {"nom":"جربة أجيم"} },
      { fr: {"nom":"Sidi Makhlouf"}, ar: {"nom":"سيدي مخلوف"} }
    ],
  },
  {
    fr: "Gafsa",
    ar: "قفصة",
    delegations: [
      { fr: {"nom":"Gafsa Nord"}, ar: {"nom":"قفصة الشمالية"} },
      { fr: {"nom":"Sidi Aich"}, ar: {"nom":"سيدي عيش"} },
      { fr: {"nom":"El Ksar"}, ar: {"nom":"القصر"} },
      { fr: {"nom":"Gafsa Sud"}, ar: {"nom":"قفصة الجنوبية"} },
      { fr: {"nom":"Moulares"}, ar: {"nom":"أم العرائس"} },
      { fr: {"nom":"Redyef"}, ar: {"nom":"الرديف"} },
      { fr: {"nom":"Métlaoui"}, ar: {"nom":"المتلوي"} },
      { fr: {"nom":"El Mdhilla"}, ar: {"nom":"المضيلة"} },
      { fr: {"nom":"El Guettar"}, ar: {"nom":"القطار"} },
      { fr: {"nom":"Belkhir"}, ar: {"nom":"بلخير"} },
      { fr: {"nom":"Sned"}, ar: {"nom":"سند"} }
    ],
  },
  {
    fr: "Tozeur",
    ar: "توزر",
    delegations: [
      { fr: {"nom":"Tozeur"}, ar: {"nom":"توزر"} },
      { fr: {"nom":"Degueche"}, ar: {"nom":"دقاش"} },
      { fr: {"nom":"Tameghza"}, ar: {"nom":"تمغزة"} },
      { fr: {"nom":"Nefta"}, ar: {"nom":"نفطة"} },
      { fr: {"nom":"Hezoua"}, ar: {"nom":"حزوة"} }
    ],
  },
  {
    fr: "Tataouine",
    ar: "تطاوين",
    delegations: [
      { fr: {"nom":"Tataouine Nord"}, ar: {"nom":"تطاوين الشمالية"} },
      { fr: {"nom":"Tataouine Sud"}, ar: {"nom":"تطاوين الجنوبية"} },
      { fr: {"nom":"Smar"}, ar: {"nom":"الصمار"} },
      { fr: {"nom":"Bir Lahmer"}, ar: {"nom":"بئر لحمر"} },
      { fr: {"nom":"Ghomrassen"}, ar: {"nom":"غمراسن"} },
      { fr: {"nom":"Dhehiba"}, ar: {"nom":"ذهيبة"} },
      { fr: {"nom":"Remada"}, ar: {"nom":"رمادة"} }
    ],
  },
  {
    fr: "Kébili",
    ar: "قبلي",
    delegations: [
      { fr: {"nom":"Kébili Sud"}, ar: {"nom":"قبلي الجنوبية"} },
      { fr: {"nom":"Kébili Nord"}, ar: {"nom":"قبلي الشمالية"} },
      { fr: {"nom":"Souk El Ahad"}, ar: {"nom":"سوق الأحد"} },
      { fr: {"nom":"Douz"}, ar: {"nom":"دوز"} },
      { fr: {"nom":"El Faouar"}, ar: {"nom":"الفوار"} }
    ],
  },
];