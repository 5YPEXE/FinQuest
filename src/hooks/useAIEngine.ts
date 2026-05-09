import { Transaction } from './useFinanceData';

export type LessonContext = {
  id: string;
  title: string;
  description: string;
  alertMessage: string;
  question: string;
  options: string[];
  correctAnswerIdx: number;
};

const GENERAL_LESSONS: LessonContext[] = [
  {
    id: 'compound_interest',
    alertMessage: "Finansal zekanı geliştirmeye devam ediyorsun. Bugün senin için \"Bileşik Faiz\" mucizesini hazırladım. İncelemek ister misin?",
    title: "❄️ Bileşik Faiz (Kar Topu Etkisi)",
    description: "Bileşik faiz, kazandığın faizin de faiz kazanmasıdır. Bir kar topunun dağdan aşağı yuvarlandıkça büyümesi gibi, paran katlanarak artar. Erken başlamak, büyük meblağlar yatırmaktan daha etkilidir.",
    question: "Aylık 1000 TL yatırım yaparak bileşik faizden en verimli şekilde yararlanmak isteyen birinin yapması gereken en önemli hamle nedir?",
    options: [
      "Piyasanın düşmesini bekleyip sadece o zaman alım yapmak.",
      "Yatırıma mümkün olan en erken yaşta başlayıp elde edilen karı çekmeden tekrar yatırmak.",
      "Kısa vadeli, günlük al-sat işlemleriyle anaparayı hızlıca katlamaya çalışmak."
    ],
    correctAnswerIdx: 1
  },
  {
    id: 'emergency_fund',
    alertMessage: "Beklenmedik durumlara karşı ne kadar hazırlıklısın? Haydi \"Acil Durum Fonu\" kavramını konuşalım.",
    title: "🚑 Acil Durum Fonu",
    description: "Acil durum fonu, beklenmedik giderler (sağlık, işsizlik, tamir) için kenarda tutulan, kolay erişilebilir nakit paraktır. İdeal olarak 3-6 aylık giderleri karşılamalıdır.",
    question: "Acil durum fonunun tutulacağı yerin sahip olması gereken en temel özellik aşağıdakilerden hangisidir?",
    options: [
      "Değerinin asla düşmemesi ve anında nakde çevrilebilir (likiditesi yüksek) olması.",
      "Uzun vadede en yüksek getiriyi vaat eden teknoloji hisseleri olması.",
      "Sadece altın olarak fiziksel kasada saklanması."
    ],
    correctAnswerIdx: 0
  },
  {
    id: 'diversification',
    alertMessage: "Tüm yumurtaları aynı sepete koymak sence ne kadar mantıklı? Bugün \"Çeşitlendirme\" üzerine konuşalım.",
    title: "🧺 Sepeti Çeşitlendirmek",
    description: "Yatırımda çeşitlendirme (Diversifikasyon), riski azaltmak için parayı birbirleriyle zıt hareket edebilen farklı varlık sınıflarına (hisse, altın, tahvil vb.) bölmektir.",
    question: "Bir yatırımcı tüm parasını sadece teknoloji sektöründeki 5 farklı şirkete bölerse, bu durum \"doğru çeşitlendirme\" sayılır mı?",
    options: [
      "Evet, farklı şirketler olduğu için risk tamamen sıfırlanmıştır.",
      "Evet, piyasa düşse bile teknoloji şirketleri her zaman kazandırır.",
      "Hayır, şirketler farklı olsa da aynı sektöre ait oldukları için sektörel krizde tüm portföy çökebilir."
    ],
    correctAnswerIdx: 2
  },
  {
    id: 'opportunity_cost',
    alertMessage: "Bir şeyi seçerken neleri kaybettiğini hiç düşündün mü? \"Fırsat Maliyeti\" konseptine göz atalım.",
    title: "⚖️ Fırsat Maliyeti",
    description: "Fırsat maliyeti, bir kararı verirken vazgeçtiğin bir sonraki en iyi alternatifin değeridir. Para harcarken sadece ödediğin tutarı değil, o parayla yapabileceğin yatırımların potansiyel getirisini de kaybedersin.",
    question: "Krediyle 500.000 TL'ye araba almak yerine o parayı faizde değerlendirip aylık 20.000 TL getiri sağlamaktan vazgeçen birinin ödediği 'fırsat maliyeti' hangisidir?",
    options: [
      "Arabanın yakıt ve bakım masrafları.",
      "Vazgeçilen aylık 20.000 TL'lik faiz getirisi.",
      "Çekilen kredinin faiz tutarı."
    ],
    correctAnswerIdx: 1
  },
  {
    id: 'sunk_cost',
    alertMessage: "Zarar eden bir yatırımdan neden vazgeçemeyiz? Psikolojik bir tuzak olan \"Batık Maliyet Yanılgısı\"nı öğrenelim.",
    title: "⚓ Batık Maliyet Yanılgısı",
    description: "Geçmişte harcanan ve geri alınamayacak para veya zamana takılıp, sırf 'o kadar masraf yaptım' diyerek mantıksız bir projeye veya düşen bir hisseye para akıtmaya devam etme hatasıdır.",
    question: "Hangi davranış 'Batık Maliyet Yanılgısı'na (Sunk Cost Fallacy) örnektir?",
    options: [
      "Sürekli değer kaybeden bir kripto parayı sırf %50 zarardayım diye satmayıp, daha da yükselecek umuduyla para eklemeye devam etmek.",
      "Zarar eden bir hisseyi belirlediği %10 zarar-kes (stop-loss) noktasında satıp kurtulmak.",
      "Geçmiş performanslara bakmadan geleceği parlak olan yeni bir yatırım aracına geçiş yapmak."
    ],
    correctAnswerIdx: 0
  },
  {
    id: 'fomo',
    alertMessage: "Herkesin kazandığını görüp panikle yatırım yaptığın oldu mu? Gel \"FOMO\" tuzağını inceleyelim.",
    title: "🚀 FOMO (Fırsatı Kaçırma Korkusu)",
    description: "Fear Of Missing Out (FOMO), piyasada fiyatlar hızla yükselirken 'fırsatı kaçırıyorum' paniğiyle, araştırma yapmadan en tepeden alım yapma dürtüsüdür. Çoğu acemi yatırımcının en büyük kaybıdır.",
    question: "Bir hissenin 1 haftada %300 arttığını gören yatırımcının FOMO etkisinden kurtulmak için ne yapması en sağlıklıdır?",
    options: [
      "Tüm nakdiyle hemen alım yapıp, yükseleceği zirveyi beklemek.",
      "Kısa vadeli kredi çekip daha büyük bir hacimle piyasaya girmek.",
      "Projenin değerini temel analize dayandırarak inceleyip, duygusal değil mantıksal bir giriş noktası aramak."
    ],
    correctAnswerIdx: 2
  },
  {
    id: 'bull_bear_market',
    alertMessage: "Piyasalarda sıkça duyulan 'Boğa' ve 'Ayı' ne anlama geliyor? Gel bu terimleri öğrenelim.",
    title: "🐂 Boğa ve 🐻 Ayı Piyasası",
    description: "Boğa piyasası (Bull Market) fiyatların sürekli arttığı, herkesin kâr ettiği coşkulu dönemi temsil eder. Ayı piyasası (Bear Market) ise fiyatların %20'den fazla düştüğü, karamsarlığın hakim olduğu fırsat dönemidir.",
    question: "Ayı piyasasında usta yatırımcılar genellikle nasıl bir strateji izler?",
    options: [
      "Piyasadan tamamen çıkıp nakitte bekleyerek bir daha asla yatırım yapmamak.",
      "Düşük fiyatları uzun vadeli bir indirim fırsatı olarak görüp, kademeli olarak kaliteli varlıkları toplamak.",
      "Panikle ellerindeki tüm hisseleri en düşük fiyattan satarak borç kapatmak."
    ],
    correctAnswerIdx: 1
  }
];

export function useAIEngine(transactions: Transaction[], totalBalance: number, completedLessonIds: string[]) {
  const foodExpenses = transactions.filter(t => (t.category === 'Yeme İçme' || t.category === 'Gıda & Market') && t.amount < 0).reduce((acc, t) => acc + Math.abs(t.amount), 0);
  const totalExpenses = transactions.filter(t => t.amount < 0 && t.type !== 'investment').reduce((acc, t) => acc + Math.abs(t.amount), 0);
  
  const hasInvestments = transactions.some(t => t.type === 'investment');
  const entertainmentExpenses = transactions.filter(t => (t.category === 'Eğlence' || t.category === 'Alışveriş' || t.category === 'Diğer') && t.amount < 0).reduce((acc, t) => acc + Math.abs(t.amount), 0);

  // 1. Contextual Lessons
  if (totalExpenses > 0 && (foodExpenses / totalExpenses) > 0.25 && !completedLessonIds.includes('latte')) {
    return {
      id: 'latte',
      alertMessage: "Dışarıda veya gıdaya oldukça sık harcama yaptığını fark ettim. \"Latte Faktörü\" hakkında kısa bir eğitim almak ister misin?",
      title: "☕ Latte Faktörü Nedir?",
      description: "Küçük ve masum görünen günlük harcamaların, uzun vadede nasıl devasa bir servete dönüşebileceğini gösteren finansal bir kavramdır.",
      question: "Latte Faktörü kavramının temel felsefesi aşağıdakilerden hangisini savunur?",
      options: [
        "Para harcamanın insan psikolojisini bozduğu için tamamen sıfırlanması gerektiğini.",
        "Damlaya damlaya göl olur misali, önemsiz görünen küçük harcamaların yatırıma yönlendirilirse büyük zenginlik yaratabileceğini.",
        "Kahve dükkanlarının aslında birer yatırım şirketi olduğunu."
      ],
      correctAnswerIdx: 1
    };
  } 
  
  if (!hasInvestments && totalBalance > 3000 && !completedLessonIds.includes('inflation')) {
    return {
      id: 'inflation',
      alertMessage: "Cüzdanında hatırı sayılır bir nakit birikmiş ancak hiç yatırım yapmamışsın. \"Enflasyon\" riski hakkında konuşalım mı?",
      title: "📉 Enflasyon Canavarı",
      description: "Enflasyon, paranın alım gücünün zamanla düşmesidir. Bugün 100 TL'ye alabildiğin ürünleri seneye alamıyorsan, cüzdanındaki nakit durduğu yerde eriyor demektir.",
      question: "Bir yatırımcının enflasyona karşı parasının alım gücünü koruduğunu söyleyebilmesi için yatırım getirisinin minimum yüzde kaç olması gerekir?",
      options: [
        "Her zaman %0, çünkü anaparayı korumak yeterlidir.",
        "Yüzde 50 civarında yüksek riskli bir kâr hedefi yakalamalıdır.",
        "Ülkedeki güncel enflasyon oranına eşit veya ondan daha yüksek bir getiri olmalıdır."
      ],
      correctAnswerIdx: 2
    };
  } 
  
  if (totalExpenses > 0 && (entertainmentExpenses / totalExpenses) > 0.35 && !completedLessonIds.includes('rule_50_30_20')) {
    return {
      id: 'rule_50_30_20',
      alertMessage: "Son zamanlarda eğlence ve alışveriş harcamaların epey artmış. Bütçeni daha iyi yönetmek için 50/30/20 kuralını öğrenmek ister misin?",
      title: "📊 50/30/20 Kuralı",
      description: "Maaşının %50'sini ihtiyaçlara (kira, fatura), %30'unu isteklere (eğlence, alışveriş) ve %20'sini yatırıma veya tasarrufa ayırmanı söyleyen altın bir kuraldır.",
      question: "Bir kişinin maaşı 30.000 TL ise, 50/30/20 kuralına göre 'istekler ve keyfi harcamalar' için maksimum bütçesi ne kadar olmalıdır?",
      options: [
        "9.000 TL (%30)",
        "15.000 TL (%50)",
        "6.000 TL (%20)"
      ],
      correctAnswerIdx: 0
    };
  }

  // 2. Fallback to General Lessons
  const nextGeneralLesson = GENERAL_LESSONS.find(lesson => !completedLessonIds.includes(lesson.id));
  
  if (nextGeneralLesson) {
    return nextGeneralLesson;
  }

  return null;
}

export function generateMonthlyReport(
  transactions: Transaction[], 
  portfolio: { amount: number, averageBuyPrice?: number }[], 
  totalBalance: number, 
  totalDebts: number
): string {
  const totalExpenses = transactions.filter(t => t.amount < 0 && t.type !== 'investment').reduce((acc, t) => acc + Math.abs(t.amount), 0);
  const totalIncome = transactions.filter(t => t.amount > 0 && t.type !== 'investment').reduce((acc, t) => acc + Math.abs(t.amount), 0);
  
  const categories: Record<string, number> = {};
  transactions.filter(t => t.amount < 0 && t.type !== 'investment').forEach(t => {
    categories[t.category] = (categories[t.category] || 0) + Math.abs(t.amount);
  });

  const topCategory = Object.keys(categories).sort((a, b) => categories[b] - categories[a])[0];
  const topCatAmount = topCategory ? categories[topCategory] : 0;
  const topCatPercent = totalExpenses > 0 ? Math.round((topCatAmount / totalExpenses) * 100) : 0;

  let report = "🎯 Aylık Finansal Karne:\n\n";
  
  if (totalExpenses > totalIncome) {
    report += "⚠️ Bu ay gelirinden daha fazla harcama yapmışsın. Açığın var, bütçeni acilen gözden geçirmelisin.\n";
  } else if (totalIncome > 0 && totalExpenses > 0) {
    report += `✅ Tebrikler! Bu ay harcamaların gelirinin altında kaldı. Yaklaşık ${(totalIncome - totalExpenses).toLocaleString('tr-TR')} ₺ tasarruf ettin.\n`;
  }

  if (topCategory) {
    report += `\n📊 En büyük gider kalemin: ${topCategory} (${topCatAmount.toLocaleString('tr-TR')} ₺ - Toplam giderin %${topCatPercent}'i).\n`;
    if (topCatPercent > 40) {
      report += `💡 Sadece bu kategoriye olan harcamalarını %10 kıssan bile uzun vadede harika bir yatırım sermayesi oluşturabilirsin.\n`;
    }
  }

  if (portfolio.length > 0) {
    report += `\n📈 Yatırım portföyün gayet çeşitli ve şu an ${portfolio.length} farklı varlığın bulunuyor. Paran çalışmaya devam ediyor.\n`;
  } else {
    report += `\n📉 Cüzdanında para olmasına rağmen henüz yatırıma başlamamışsın. Paran enflasyon karşısında değer kaybediyor olabilir!\n`;
  }

  if (totalDebts > 0) {
    report += `\n💳 Üzerindeki toplam borç yükü ${totalDebts.toLocaleString('tr-TR')} ₺. Öncelikle yüksek faizli kredi kartı borçlarını eritmeye odaklan.\n`;
  }

  report += "\n🚀 FinQuest Tavsiyesi: 50/30/20 bütçe kuralını hatırla ve maaşının en az %20'sini her ay düzenli yatırıma (kumbara veya varlık) ayırmayı hedefle!";
  
  return report;
}
