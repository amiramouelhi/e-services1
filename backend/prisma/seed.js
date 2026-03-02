const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient()

async function main() {
  await prisma.categorie.createMany({
    data: [
      {
        code: 1,
        nom_fr: "Oeuvres écrites ou imprimées (livres, brochures...)",
        nom_ar: "المصنفات الكتابية والمطبوعة ومن بينها الكتب والنشريات وغيرها"
      },
      {
        code: 2,
        nom_fr: "Oeuvres créées pour la scène ou la radiodiffusion (sonore ou visuelle)",
        nom_ar: "المصنفات المبتكرة للمسرح أو للإذاعة السمعية أو البصرية"
      },
      {
        code: 3,
        nom_fr: "Compositions musicales avec ou sans paroles",
        nom_ar: "القطع الموسيقية الناطقة أو غير الناطقة"
      },
      {
        code: 4,
        nom_fr: "Oeuvres photographiques et procédés analogues",
        nom_ar: "مصنفات التصوير الشمسي وما شابهها"
      },
      {
        code: 5,
        nom_fr: "Oeuvres cinématographiques et effets visuels analogues",
        nom_ar: "المصنفات السينمائية وما شابهها في التعبير البصري"
      },
      {
        code: 6,
        nom_fr: "Peinture, dessin, lithographie, gravure et oeuvres similaires",
        nom_ar: "الصور الزيتية والرسوم والمطبوعات الحجرية والنقوش المعدنية والمنتوجات الفنية الأخرى"
      },
      {
        code: 7,
        nom_fr: "Sculptures de toutes sortes",
        nom_ar: "النحت في مختلف أنواعه"
      },
      {
        code: 8,
        nom_fr: "Oeuvres d'architecture (dessins, modèles, maquettes)",
        nom_ar: "المصنفات المعمارية التي تشمل الرسوم والنماذج والأمثلة وكيفية الإنجاز"
      },
      {
        code: 9,
        nom_fr: "Tapisseries et objets des métiers artistiques et arts appliqués",
        nom_ar: "المدبجات والموشيات التي تخرجها الأنوال الفنية والفنون التطبيقية"
      },
      {
        code: 10,
        nom_fr: "Cartes, dessins et reproductions graphiques scientifiques ou artistiques",
        nom_ar: "الخرائط والرسوم والمنقولات الخطية والصور ذات الصبغة العلمية أو الفنية"
      },
      {
        code: 11,
        nom_fr: "Oeuvres exprimées oralement (conférences, allocutions...)",
        nom_ar: "المصنفات الشفوية مثل المحاضرات والخطب والمصنفات التي تماثلها"
      },
      {
        code: 12,
        nom_fr: "Oeuvres inspirées du folklore",
        nom_ar: "المصنفات المستوحاة من الفنون الشعبية"
      },
      {
        code: 13,
        nom_fr: "Logiciels",
        nom_ar: "البرامج المعلوماتية"
      },
      {
        code: 14,
        nom_fr: "Créations de l'habillement, de la mode et de la parure",
        nom_ar: "مبتكرات الألبسة للأزياء والوشاح"
      },
      {
        code: 15,
        nom_fr: "Oeuvres numériques",
        nom_ar: "المصنفات الرقمية"
      },
      {
        code: 16,
        nom_fr: "Traductions, arrangements, transformations et adaptations",
        nom_ar: "الترجمات والتحويرات أو الاقتباسات التابعة للمصنفات الأنف ذكرها"
      },
    ]
  })

  console.log('✅ Categories seeded successfully')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())