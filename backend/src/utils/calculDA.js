const fs = require('fs')
const path = require('path')
const puppeteer = require('puppeteer')
const prisma = require('../config/prisma')

// 8 calculation categories (columns 2..9 in the invoice, right-to-left)
const CATEGORIES = [
  { key: 'cirque',            label: 'عروض الفرجة: السرك، ...',               rate: 4    },
  { key: 'theatre',           label: 'المسرحيات',                              rate: 12   },
  { key: 'lyrique',           label: 'المسرح الغنائي',                         rate: 15   },
  { key: 'Concerts',          label: 'الحفلات الموسيقية',                      rate: 0.1  },
  { key: 'enregistrements',   label: 'بواسطة المسجلات',  group: 'الحفلات الراقصة',   rate: 10   },
  { key: 'orchestres',        label: 'بواسطة الفرق',     group: 'الحفلات الراقصة',   rate: 8.8  },
  { key: 'piece_mus__films_', label: 'القطع الموسيقية المصاحبة للأشرطة', group: 'العروض السينمائية', rate: 1.7  },
  { key: 'piece_mus_diff',    label: 'القطع الموسيقية المذاعة في الفواصل', group: 'العروض السينمائية', rate: 0.11 },
]

// Festival/advance column (column 1, right-most) — priced on budget, not on expenses
const FESTIVAL_COL = { key: 'mahrajanat', label: 'المهرجانات (التسبقة)', rate: 4 }

// Expense rows — matches ARTIST_EXPENSE_KEYS in SpectaclesPage.tsx
const SECTION_1_ROWS = [
  { key: 'remunerationArtistes',     label: 'أجرة الفنانين' },
  { key: 'remunerationGroupes',      label: 'أجرة الفرق المصاحبة' },
  { key: 'remunerationOrganisateur', label: 'أجرة متعهد الحفلات' },
  { key: 'deplacements',             label: 'التنقلات' },
  { key: 'hebergement',              label: 'الإقامة' },
  { key: 'avantagesNature',          label: 'الامتيازات العينية' },
]
const SECTION_2_ROWS = [
  { key: 'prestation1', label: 'أداء 1' },
  { key: 'prestation2', label: 'أداء 2' },
  { key: 'prestation3', label: 'أداء 3' },
]
const SECTION_3_ROWS = [
  { key: 'locationSalle', label: 'معلوم كراء القاعة أو الفضاء' },
  { key: 'son',           label: 'الصوت',     sub: true },
  { key: 'eclairage',     label: 'الإضاءة',   sub: true },
  { key: 'decor',         label: 'الديكور',   sub: true },
]

const fmtDate = (d) => {
  if (!d) return ''
  const dt = new Date(d)
  return `${String(dt.getDate()).padStart(2, '0')}/${String(dt.getMonth() + 1).padStart(2, '0')}/${dt.getFullYear()}`
}

const fmtNum = (n) => {
  const num = Number(n)
  if (!isFinite(num) || num === 0) return '0.000'
  return num.toLocaleString('fr-FR', { minimumFractionDigits: 3, maximumFractionDigits: 3 })
}

// Returns the HTML class list + content for a numeric cell.
// Zero/empty values get the "empty" class so they render grayed-out.
const numCell = (n, extraClass = '') => {
  const num = Number(n)
  const isEmpty = !isFinite(num) || num === 0
  const cls = `cell-num${isEmpty ? ' cell-empty' : ''}${extraClass ? ' ' + extraClass : ''}`
  return `<td class="${cls}">${fmtNum(num)}</td>`
}

const buildHtml = (autorisation) => {
  // Initialize grid: grid[categoryKey][expenseKey] = amount
  const grid = {}
  for (const cat of CATEGORIES) {
    grid[cat.key] = {}
    for (const row of [...SECTION_1_ROWS, ...SECTION_2_ROWS, ...SECTION_3_ROWS]) {
      grid[cat.key][row.key] = 0
    }
  }

  // Aggregate spectacle expenses into their respective category columns
  for (const sp of autorisation.spectacles || []) {
    const catKey = sp.categorieSpectacle || sp.typeSpectacle
    if (!grid[catKey]) continue
    for (const art of sp.artistes || []) {
      for (const dep of art.depenses || []) {
        if (grid[catKey][dep.type] !== undefined) {
          grid[catKey][dep.type] += Number(dep.montant || 0)
        }
      }
    }
  }

  // Festivals budget total (sum of budgets across manifestation-type spectacles)
  const festivalBudget = (autorisation.spectacles || [])
    .filter((s) => s.typeSpectacle === 'manifestation' || s.natureManif)
    .reduce((s, sp) => s + Number(sp.budget || 0), 0)

  // Totals per section, per category column
  const total1 = {}, total2 = {}, total3 = {}, grandTotal = {}
  for (const cat of CATEGORIES) {
    total1[cat.key] = SECTION_1_ROWS.reduce((s, r) => s + grid[cat.key][r.key], 0)
    total2[cat.key] = SECTION_2_ROWS.reduce((s, r) => s + grid[cat.key][r.key], 0)
    total3[cat.key] = SECTION_3_ROWS.reduce((s, r) => s + grid[cat.key][r.key], 0)
    grandTotal[cat.key] = total1[cat.key] + total2[cat.key] + total3[cat.key]
  }

  // Advance / settlement row = assiette * rate%
  const advance = {}
  for (const cat of CATEGORIES) advance[cat.key] = grandTotal[cat.key] * (cat.rate / 100)
  const festivalAdvance = festivalBudget * (FESTIVAL_COL.rate / 100)
  const grandAdvance = Object.values(advance).reduce((a, b) => a + b, 0) + festivalAdvance

  // Header / meta
  const org = autorisation.organisateur || {}
  const sp0 = (autorisation.spectacles || [])[0] || {}
  const eventName = (autorisation.spectacles || [])
    .map((s) => s.titreSpectacle || s.nomManifestation)
    .filter(Boolean)
    .join(' / ')
  const lieu = [...new Set((autorisation.spectacles || []).map((s) => s.lieuSpectacle).filter(Boolean))].join(' / ')
  const dates = (autorisation.spectacles || []).map((s) => fmtDate(s.dateSpectacle)).filter(Boolean)
  const dateShow = dates.join(' - ')
  const dateAuth = fmtDate(autorisation.dateDemande || autorisation.dateCreation)
  const hasEtrangers = autorisation.hasArtistesEtrangers ? 'نعم' : 'لا'
  const budgetStr = fmtNum(festivalBudget)

  // === TABLE MARKUP ===

  // Top header row: base columns with group spans
  // We need nested headers. Columns that belong to a group ("الحفلات الراقصة" spans 2 cols,
  // "العروض السينمائية" spans 2 cols); others rowspan 2.
  const groups = []
  let i = 0
  while (i < CATEGORIES.length) {
    const cat = CATEGORIES[i]
    if (cat.group) {
      let j = i
      while (j < CATEGORIES.length && CATEGORIES[j].group === cat.group) j++
      groups.push({ type: 'group', name: cat.group, span: j - i, cats: CATEGORIES.slice(i, j) })
      i = j
    } else {
      groups.push({ type: 'single', cat })
      i++
    }
  }

  const topHeaderCells = groups.map((g) => {
    if (g.type === 'single') {
      return `<th class="cat-header" rowspan="2">${g.cat.label}</th>`
    }
    return `<th class="cat-header" colspan="${g.span}">${g.name}</th>`
  }).join('')

  const subHeaderCells = groups
    .filter((g) => g.type === 'group')
    .flatMap((g) => g.cats.map((c) => `<th class="cat-header sub-header">${c.label}</th>`))
    .join('')

  // Festival cell for a given row: show value only on subtotal/grand rows; else empty.
  const festCell = (val, isSubtotal = false) => {
    if (!isSubtotal) return `<td class="festival-cell cell-empty"></td>`
    return numCell(val, 'festival-cell')
  }

  // Summary box value: gray out when zero/empty
  const summaryVal = (n) => {
    const num = Number(n)
    const isEmpty = !isFinite(num) || num === 0
    return `<span class="val${isEmpty ? ' val-empty' : ''}">${fmtNum(num)}</span>`
  }

  const section1Rows = SECTION_1_ROWS.map((row, idx) => `
    <tr class="${idx % 2 === 0 ? 'row-alt' : ''}">
      ${festCell(0, false)}
      <th class="row-label">${row.label}</th>
      ${CATEGORIES.map((c) => numCell(grid[c.key][row.key])).join('')}
    </tr>`).join('')

  const total1Row = `<tr class="subtotal-row">
    ${festCell(0, false)}
    <th class="row-label">المجموع عدد 1</th>
    ${CATEGORIES.map((c) => numCell(total1[c.key])).join('')}
  </tr>`

  const section2Rows = SECTION_2_ROWS.map((row, idx) => `
    <tr class="${idx % 2 === 0 ? 'row-alt' : ''}">
      ${festCell(0, false)}
      <th class="row-label">${row.label}</th>
      ${CATEGORIES.map((c) => numCell(grid[c.key][row.key])).join('')}
    </tr>`).join('')

  const total2Row = `<tr class="subtotal-row">
    ${festCell(0, false)}
    <th class="row-label">المجموع عدد 2</th>
    ${CATEGORIES.map((c) => numCell(total2[c.key])).join('')}
  </tr>`

  const locationRow = (() => {
    const row = SECTION_3_ROWS[0]
    return `<tr>
      ${festCell(0, false)}
      <th class="row-label">${row.label}</th>
      ${CATEGORIES.map((c) => numCell(grid[c.key][row.key])).join('')}
    </tr>`
  })()

  const equipmentHeaderRow = `<tr>
    ${festCell(0, false)}
    <th class="row-label equipment-header">كلفة التجهيزات المستعملة :</th>
    ${CATEGORIES.map(() => `<td class="cell-num cell-empty"></td>`).join('')}
  </tr>`

  const equipmentRows = SECTION_3_ROWS.slice(1).map((row, idx) => `
    <tr class="${idx % 2 === 0 ? 'row-alt' : ''}">
      ${festCell(0, false)}
      <th class="row-label row-sub">${row.label}</th>
      ${CATEGORIES.map((c) => numCell(grid[c.key][row.key])).join('')}
    </tr>`).join('')

  const total3Row = `<tr class="subtotal-row">
    ${festCell(0, false)}
    <th class="row-label">المجموع عدد 3</th>
    ${CATEGORIES.map((c) => numCell(total3[c.key])).join('')}
  </tr>`

  const grandTotalRow = `<tr class="grand-total-row">
    ${numCell(festivalBudget, 'festival-cell')}
    <th class="row-label">المجمـــوع</th>
    ${CATEGORIES.map((c) => numCell(grandTotal[c.key])).join('')}
  </tr>`

  const rateRow = `<tr class="rate-row">
    <td class="cell-rate festival-cell">${FESTIVAL_COL.rate}%</td>
    <th class="row-label">نسبة الإستخلاص</th>
    ${CATEGORIES.map((c) => `<td class="cell-rate">${c.rate}%</td>`).join('')}
  </tr>`

  const advanceRow = `<tr class="advance-row">
    ${numCell(festivalAdvance, 'festival-cell')}
    <th class="row-label">مبلغ التسبقة (حد أدنى)</th>
    ${CATEGORIES.map((c) => numCell(advance[c.key])).join('')}
  </tr>`

  const sumFormulaRow = `<tr class="sum-formula-row">
    <td class="cell-num" colspan="${CATEGORIES.length + 2}">المجموع : 8+7+6+5+4+3+2+1 = ${fmtNum(grandAdvance)}</td>
  </tr>`

  // Bottom summary blocks — institution share (0.25), social fund (10%), distributable
  const institutionShareFestival = festivalAdvance * 0.25
  const socialFundFestival = (festivalAdvance - institutionShareFestival) * 0.10
  const distributableFestival = festivalAdvance - institutionShareFestival - socialFundFestival

  const institutionShareTickets = grandAdvance * 0.25
  const socialFundTickets = (grandAdvance - institutionShareTickets) * 0.10
  const distributableTickets = grandAdvance - institutionShareTickets - socialFundTickets

  // === FULL HTML ===
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<title>إحتساب معلوم حق المؤلف</title>
<style>
  * { box-sizing: border-box; }
  body {
    margin: 0;
    padding: 10px;
    font-family: "Traditional Arabic", "Simplified Arabic", "Arial", sans-serif;
    color: #111;
    background: #fff;
  }
  .page { width: 100%; padding: 4px 12px; }
  .doc-title {
    text-align: center;
    font-size: 15px;
    font-weight: 700;
    color: #0f2546;
    margin: 0 0 10px;
    padding: 8px;
    border: 2px solid #1a3c6e;
  }
  .header-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0;
    border: 1.5px solid #1a3c6e;
    margin-bottom: 8px;
  }
  .header-col {
    padding: 6px 10px;
    border-left: 1px solid #1a3c6e;
  }
  .header-col:first-child { border-left: none; }
  .header-col .row {
    display: flex;
    border-bottom: 1px dotted #94a3b8;
    padding: 3px 0;
    font-size: 11px;
  }
  .header-col .row:last-child { border-bottom: none; }
  .header-col .label {
    font-weight: 700;
    color: #1a3c6e;
    min-width: 170px;
    white-space: nowrap;
  }
  .header-col .value { color: #1f2937; flex: 1; }
  table.calcul {
    width: 100%;
    border-collapse: collapse;
    font-size: 9.5px;
    direction: rtl;
    margin-top: 4px;
  }
  table.calcul th,
  table.calcul td {
    border: 1px solid #64748b;
    padding: 3px 2px;
    text-align: center;
    vertical-align: middle;
  }
  table.calcul thead th {
    background: #e2e8f0;
    color: #0f2546;
    font-weight: 700;
    font-size: 10px;
  }
  table.calcul thead th.first-header {
    background: #cbd5e1;
    width: 200px;
  }
  .cat-header { line-height: 1.25; }
  .sub-header { background: #eef2f7 !important; }
  .row-label {
    background: #f1f5f9;
    text-align: right;
    font-weight: 700;
    padding-right: 6px;
    width: 210px;
    color: #0f172a;
    font-size: 10px;
  }
  .row-sub { padding-right: 16px; font-weight: 500; background: #f8fafc; }
  .equipment-header { background: #e2e8f0 !important; color: #1a3c6e; }
  .festival-col-header { background: #1a3c6e !important; color: #fff !important; }
  .festival-cell { background: #f8fafc; width: 80px; font-variant-numeric: tabular-nums; direction: ltr; font-size: 10px; }
  .cell-num {
    font-variant-numeric: tabular-nums;
    font-family: "Arial", sans-serif;
    direction: ltr;
    font-size: 10px;
    color: #1f2937;
  }
  .cell-empty {
    color: #cbd5e1 !important;
    background: repeating-linear-gradient(
      -45deg,
      #f8fafc,
      #f8fafc 4px,
      #eef2f7 4px,
      #eef2f7 7px
    ) !important;
    font-weight: 400 !important;
  }
  .cell-rate { font-weight: 700; color: #1a3c6e; direction: ltr; }
  .row-alt td, .row-alt th.row-label { background: #f8fafc; }
  .subtotal-row td, .subtotal-row th.row-label { background: #dbe3ef !important; font-weight: 700; color: #0f172a; }
  .grand-total-row td, .grand-total-row th.row-label { background: #cbd5e1 !important; font-weight: 700; color: #0f172a; }
  .rate-row td, .rate-row th.row-label { background: #fde68a !important; font-weight: 700; color: #78350f; }
  .advance-row td, .advance-row th.row-label { background: #bbf7d0 !important; font-weight: 700; color: #14532d; }
  .sum-formula-row td { background: #1a3c6e !important; color: #fff !important; font-weight: 700; font-size: 11px; padding: 6px; }
  .summary-wrap { margin-top: 12px; display: flex; gap: 6px; }
  .summary-box {
    flex: 1;
    border: 1px solid #64748b;
    padding: 0;
    font-size: 10px;
  }
  .summary-box .box-title {
    background: #cbd5e1;
    padding: 4px 6px;
    font-weight: 700;
    color: #0f2546;
    text-align: center;
    border-bottom: 1px solid #64748b;
  }
  .summary-box .row {
    display: flex;
    justify-content: space-between;
    padding: 3px 6px;
    border-bottom: 1px dotted #94a3b8;
  }
  .summary-box .row:last-child { border-bottom: none; background: #1a3c6e; color: #fff; font-weight: 700; }
  .summary-box .row .val {
    font-variant-numeric: tabular-nums;
    direction: ltr;
    font-family: "Arial", sans-serif;
  }
  .summary-box .row .val-empty {
    color: #cbd5e1;
    font-weight: 400;
  }
  .summary-box .row:last-child .val-empty {
    color: rgba(255, 255, 255, 0.45);
  }
  .footer {
    margin-top: 10px;
    font-size: 9px;
    color: #64748b;
    text-align: center;
    border-top: 1px solid #e2e8f0;
    padding-top: 6px;
  }
</style>
</head>
<body>
  <div class="page">
    <div class="doc-title">إحتساب معلوم حقّ المؤلف المتصلة بالعروض واستعمال المصنفات الأدبية والفنية خلال تنظيم التظاهرات أو المهرجانات</div>

    <div class="header-grid">
      <div class="header-col">
        <div class="row"><span class="label">العرض أو التظاهرة :</span><span class="value">${eventName || ''}</span></div>
        <div class="row"><span class="label">(الإدارة أو المؤسسة أو الجهة) :</span><span class="value">${org.nom || ''}</span></div>
        <div class="row"><span class="label">إسم ولقب المسؤول :</span><span class="value">${org.nomResponsable || ''}</span></div>
        <div class="row"><span class="label">السجل الوطني للمؤسسات :</span><span class="value">${org.rne || ''}</span></div>
        <div class="row"><span class="label">العنوان :</span><span class="value">${org.adresse || ''}</span></div>
        <div class="row"><span class="label">الهاتف :</span><span class="value">${org.telephone || ''}</span></div>
        <div class="row"><span class="label">الفاكس :</span><span class="value">${org.fax || ''}</span></div>
        <div class="row"><span class="label">البريد الإلكتروني :</span><span class="value">${org.email || ''}</span></div>
      </div>
      <div class="header-col">
        <div class="row"><span class="label">متعهد الحفلات :</span><span class="value">${org.nom || ''}</span></div>
        <div class="row"><span class="label">تاريخ العرض أو التظاهرة :</span><span class="value">${dateShow}</span></div>
        <div class="row"><span class="label">تاريخ الترخيص :</span><span class="value">${dateAuth}</span></div>
        <div class="row"><span class="label">مكان أو فضاء العرض :</span><span class="value">${lieu}</span></div>
        <div class="row"><span class="label">الميزانية التقديرية :</span><span class="value">${budgetStr} د.ت</span></div>
        <div class="row"><span class="label">عرض ينشطه أو يشارك فيه فنانون أجانب :</span><span class="value">${hasEtrangers}</span></div>
      </div>
    </div>

    <table class="calcul">
      <thead>
        <tr>
          <th class="festival-col-header" rowspan="2">${FESTIVAL_COL.label}</th>
          <th class="first-header" rowspan="2">التكاليف (*)</th>
          ${topHeaderCells}
        </tr>
        <tr>
          ${subHeaderCells}
        </tr>
      </thead>
      <tbody>
        ${section1Rows}
        ${total1Row}
        ${section2Rows}
        ${total2Row}
        ${locationRow}
        ${equipmentHeaderRow}
        ${equipmentRows}
        ${total3Row}
        ${grandTotalRow}
        ${rateRow}
        ${advanceRow}
        ${sumFormulaRow}
      </tbody>
    </table>

    <div class="summary-wrap">
      <div class="summary-box">
        <div class="box-title">محصول بيع التذاكر / قيمة التسوية</div>
        <div class="row"><span>مناب المؤسسة (تذاكر) 0.25</span>${summaryVal(institutionShareTickets)}</div>
        <div class="row"><span>المجموع عدد 1</span>${summaryVal(grandAdvance - institutionShareTickets)}</div>
        <div class="row"><span>مناب الصندوق الاجتماعي 10%</span>${summaryVal(socialFundTickets)}</div>
        <div class="row"><span>المبلغ القابل للتوزيع</span>${summaryVal(distributableTickets)}</div>
      </div>
      <div class="summary-box">
        <div class="box-title">قيمة التسبقة</div>
        <div class="row"><span>المبلغ الإجمالي</span>${summaryVal(grandAdvance)}</div>
        <div class="row"><span>الميزانية (مهرجانات)</span>${summaryVal(festivalBudget)}</div>
        <div class="row"><span>التسبقة (مهرجانات)</span>${summaryVal(festivalAdvance)}</div>
        <div class="row"><span>النسبة</span><span class="val">${FESTIVAL_COL.rate}%</span></div>
      </div>
      <div class="summary-box">
        <div class="box-title">مناب المؤسسة (قيمة التسبقة)</div>
        <div class="row"><span>مناب المؤسسة 0.25</span>${summaryVal(institutionShareFestival)}</div>
        <div class="row"><span>المجموع عدد 1</span>${summaryVal(festivalAdvance - institutionShareFestival)}</div>
        <div class="row"><span>مناب الصندوق الاجتماعي 10%</span>${summaryVal(socialFundFestival)}</div>
        <div class="row"><span>المبلغ القابل للتوزيع</span>${summaryVal(distributableFestival)}</div>
      </div>
    </div>

    <div class="footer">
      OTDAV — المؤسسة التونسية لحقوق المؤلف والحقوق المجاورة · تم الإنشاء ${fmtDate(new Date())}
    </div>
  </div>
</body>
</html>`
}

const generateCalculDA = async (autorisationId) => {
  const id = parseInt(autorisationId)
  if (isNaN(id)) throw new Error('autorisationId invalide')

  const autorisation = await prisma.autorisationSpectacle.findUnique({
    where: { id },
    include: {
      organisateur: true,
      spectacles: {
        include: {
          artistes: { include: { depenses: true } },
        },
      },
    },
  })
  if (!autorisation) throw new Error('Autorisation non trouvée')

  const outDir = path.join(__dirname, '..', '..', 'uploads', 'calcul')
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })
  const outPath = path.join(outDir, `calcul_DA_${id}.pdf`)

  const html = buildHtml(autorisation)

const browser = await puppeteer.launch({
  headless: true,
  executablePath: 'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe',
  args: ['--no-sandbox', '--disable-setuid-sandbox']
})
  try {
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0' })
    await page.pdf({
      path: outPath,
      format: 'A4',
      landscape: true,
      printBackground: true,
      margin: { top: '8mm', right: '8mm', bottom: '8mm', left: '8mm' },
    })
  } finally {
    await browser.close()
  }

  return outPath
}

module.exports = { generateCalculDA }
