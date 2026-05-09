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
    description: "Bileşik faiz, kazandığın faizin de faiz kazanmasıdır. Bir kar topunun dağdan aşağı yuvarlandıkça büyümesi gibi, paran katlanarak artar.",
    question: "Bileşik faizin en büyük avantajı nedir?",
    options: [
      "Sadece anaparanın değer kazanması.",
      "Sadece ilk yıl yüksek getiri sağlaması.",
      "Zaman geçtikçe kazancın katlanarak, kar topu gibi büyümesi."
    ],
    correctAnswerIdx: 2
  },
  {
    id: 'emergency_fund',
    alertMessage: "Beklenmedik durumlara karşı ne kadar hazırlıklısın? Haydi \"Acil Durum Fonu\" kavramını konuşalım.",
    title: "🚑 Acil Durum Fonu",
    description: "Acil durum fonu, beklenmedik giderler (sağlık, işsizlik, tamir) için kenarda tutulan, kolay erişilebilir nakit paraktır. İdeal olarak 3-6 aylık giderleri karşılamalıdır.",
    question: "Acil durum fonu nerede tutulmalıdır?",
    options: [
      "Uzun vadeli, kitli hisse senedi yatırımlarında.",
      "İstenildiği an anında çekilebilecek vadeli/vadesiz hesaplarda.",
      "Riskli kripto paralarda."
    ],
    correctAnswerIdx: 1
  },
  {
    id: 'diversification',
    alertMessage: "Tüm yumurtaları aynı sepete koymak sence ne kadar mantıklı? Bugün \"Çeşitlendirme\" üzerine konuşalım.",
    title: "🧺 Sepeti Çeşitlendirmek",
    description: "Yatırımda çeşitlendirme (Diversifikasyon), riski azaltmak için parayı farklı varlık sınıflarına (hisse, altın, kripto, nakit) bölmektir.",
    question: "Çeşitlendirmenin asıl amacı nedir?",
    options: [
      "Kısa sürede en yüksek karı elde etmek.",
      "Tek bir yatırım aracı çökerse bile toplam portföyü büyük zarardan korumak.",
      "Piyasadaki tüm varlıkları satın almak."
    ],
    correctAnswerIdx: 1
  },
  {
    id: 'opportunity_cost',
    alertMessage: "Bir şeyi seçerken neleri kaybettiğini hiç düşündün mü? \"Fırsat Maliyeti\" konseptine göz atalım.",
    title: "⚖️ Fırsat Maliyeti",
    description: "Fırsat maliyeti, bir kararı verirken vazgeçtiğin bir sonraki en iyi alternatifin değeridir. O pahalı telefonu almak yerine o parayla yatırım yapsaydın, kaçırılan kâr fırsat maliyetindir.",
    question: "Bir konsola 20.000 TL vermek yerine o parayla hisse almayı düşünmek hangi kavramdır?",
    options: [
      "Bileşik Faiz",
      "Fırsat Maliyeti",
      "Enflasyon"
    ],
    correctAnswerIdx: 1
  },
  {
    id: 'bull_bear_market',
    alertMessage: "Piyasalarda sıkça duyulan 'Boğa' ve 'Ayı' ne anlama geliyor? Gel bu terimleri öğrenelim.",
    title: "🐂 Boğa ve 🐻 Ayı Piyasası",
    description: "Boğa piyasası (Bull Market) fiyatların sürekli arttığı, iyimser dönemi temsil eder. Ayı piyasası (Bear Market) ise fiyatların düştüğü, karamsar dönemi ifade eder.",
    question: "Piyasaların genel olarak düşüş trendinde olduğu ve korkunun hakim olduğu döneme ne denir?",
    options: [
      "Boğa Piyasası",
      "Ayı Piyasası",
      "Ralli"
    ],
    correctAnswerIdx: 1
  }
];

export function useAIEngine(transactions: Transaction[], totalBalance: number, completedLessonIds: string[]) {
  // Analyze behavior
  const foodExpenses = transactions.filter(t => (t.category === 'Yeme İçme' || t.category === 'Gıda & Market') && t.amount < 0).reduce((acc, t) => acc + Math.abs(t.amount), 0);
  const totalExpenses = transactions.filter(t => t.amount < 0 && t.type !== 'investment').reduce((acc, t) => acc + Math.abs(t.amount), 0);
  
  const hasInvestments = transactions.some(t => t.type === 'investment');
  const entertainmentExpenses = transactions.filter(t => (t.category === 'Eğlence' || t.category === 'Alışveriş' || t.category === 'Diğer') && t.amount < 0).reduce((acc, t) => acc + Math.abs(t.amount), 0);

  // 1. Try Contextual Lessons
  if (totalExpenses > 0 && (foodExpenses / totalExpenses) > 0.25 && !completedLessonIds.includes('latte')) {
    return {
      id: 'latte',
      alertMessage: "Dışarıda veya gıdaya oldukça sık harcama yaptığını fark ettim. \"Latte Faktörü\" hakkında kısa bir eğitim almak ister misin?",
      title: "☕ Latte Faktörü Nedir?",
      description: "Küçük ve masum görünen günlük harcamaların, uzun vadede nasıl devasa bir servete dönüşebileceğini gösteren finansal bir kavramdır.",
      question: "Latte Faktörü'nün temel amacı aşağıdakilerden hangisidir?",
      options: [
        "Kahve içmeyi tamamen yasaklamak.",
        "Küçük düzenli masrafları yatırıma çevirerek uzun vadede zenginlik yaratmak.",
        "En ucuz kahveciyi bulup oradan alışveriş yapmak."
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
      question: "Enflasyondan korunmanın en mantıklı yolu nedir?",
      options: [
        "Parayı yastık altında veya bankada nakit saklamak.",
        "Paranın değerini koruyacak veya artıracak yatırımlar (hisse, altın, fon vb.) yapmak.",
        "Tüm parayı hemen harcamak."
      ],
      correctAnswerIdx: 1
    };
  } 
  
  if (totalExpenses > 0 && (entertainmentExpenses / totalExpenses) > 0.35 && !completedLessonIds.includes('rule_50_30_20')) {
    return {
      id: 'rule_50_30_20',
      alertMessage: "Son zamanlarda eğlence ve alışveriş harcamaların epey artmış. Bütçeni daha iyi yönetmek için 50/30/20 kuralını öğrenmek ister misin?",
      title: "📊 50/30/20 Kuralı",
      description: "Maaşının %50'sini ihtiyaçlara (kira, fatura), %30'unu isteklere (eğlence, alışveriş) ve %20'sini yatırıma veya tasarrufa ayırmanı söyleyen altın bir kuraldır.",
      question: "50/30/20 kuralına göre bütçenin %20'si nereye ayrılmalıdır?",
      options: [
        "Lüks tüketim ve tatillere.",
        "Acil durum fonu, borç ödeme veya yatırıma.",
        "Gıda ve barınma ihtiyaçlarına."
      ],
      correctAnswerIdx: 1
    };
  }

  // 2. Fallback to General Lessons that are not completed
  const nextGeneralLesson = GENERAL_LESSONS.find(lesson => !completedLessonIds.includes(lesson.id));
  
  if (nextGeneralLesson) {
    return nextGeneralLesson;
  }

  // 3. No more lessons available
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
