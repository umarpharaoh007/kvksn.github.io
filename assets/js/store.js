/* ================================================================
   KVKSN & Co. — Practice Management demo store
   Everything lives in localStorage so the demo works completely
   offline and survives a page reload. Use App.reset() to reseed.
   ================================================================ */
(function (global) {
  'use strict';

  var KEY = 'kvksn.db.v4';

  /* ---------------- Reference data ---------------- */

  var STATUS = {
    docs_pending: { label: 'Documents Pending', short: 'Docs Pending', color: '#B4342B', soft: '#FBE4E1', actor: 'client', order: 1 },
    assigned:     { label: 'Assigned',          short: 'Assigned',     color: '#54697C', soft: '#E7ECEF', actor: 'staff',  order: 2 },
    in_progress:  { label: 'In Progress',       short: 'In Progress',  color: '#C8922E', soft: '#FBEBC9', actor: 'staff',  order: 3 },
    query_raised: { label: 'Query Raised',      short: 'Query',        color: '#C2571B', soft: '#FBE7D6', actor: 'client', order: 4 },
    under_review: { label: 'Under Review',      short: 'Review',       color: '#5A4FCF', soft: '#E5E3FA', actor: 'partner',order: 5 },
    ready:        { label: 'Ready for Release', short: 'Ready',        color: '#2E8C87', soft: '#DCF1EF', actor: 'partner',order: 6 },
    completed:    { label: 'Completed',         short: 'Completed',    color: '#1E6B45', soft: '#DCF0E3', actor: '-',      order: 7 }
  };

  var STATUS_ORDER = ['docs_pending', 'assigned', 'in_progress', 'query_raised', 'under_review', 'ready', 'completed'];

  /* Service catalogue — each entry drives the document checklist,
     the fee, the turnaround time and which deliverables are produced. */
  var SERVICES = [
    { id:'gst-reg', name:'GST Registration', cat:'GST', fee:3500, tat:7,
      checklist:['PAN card of applicant','Aadhaar card','Photograph','Proof of business address (rent deed / EC)','Electricity bill','Bank statement or cancelled cheque','Partnership deed / COI (if applicable)'],
      deliverables:['GST Registration Certificate (REG-06)','GSTIN allotment intimation'] },
    { id:'gstr-3b', name:'GSTR-3B Monthly Return', cat:'GST', fee:1500, tat:4, recurring:'monthly',
      checklist:['Sales register for the month','Purchase register for the month','GSTR-2B download','Details of RCM liability','Bank statement (if cash payment required)'],
      deliverables:['Filed GSTR-3B acknowledgement','ARN receipt','Tax payment challan'] },
    { id:'gstr-1', name:'GSTR-1 Outward Supplies', cat:'GST', fee:1200, tat:3, recurring:'monthly',
      checklist:['Sales invoices for the period','Credit / debit notes','Export invoices with shipping bill details','HSN summary'],
      deliverables:['Filed GSTR-1 acknowledgement','ARN receipt'] },
    { id:'gstr-9', name:'GST Annual Return (GSTR-9 / 9C)', cat:'GST', fee:12000, tat:20,
      checklist:['Audited financial statements','All GSTR-1 and GSTR-3B filed for the year','GSTR-2A / 2B annual download','ITC reconciliation working','Details of amendments made'],
      deliverables:['Filed GSTR-9','Reconciliation statement GSTR-9C','ARN receipt'] },
    { id:'gst-notice', name:'GST Notice / DRC-01 Reply', cat:'GST', fee:15000, tat:12,
      checklist:['Copy of the notice / DRC-01','Relevant invoices and ledgers','Returns filed for the period','Supporting agreements or contracts','Authorisation letter'],
      deliverables:['Drafted reply with annexures','Filing acknowledgement','DRC-03 challan (if applicable)'] },
    { id:'itr-1', name:'ITR-1 / ITR-2 Filing (Salaried)', cat:'Income Tax', fee:2500, tat:5, recurring:'annual',
      checklist:['Form 16 from employer','Form 26AS and AIS download','Bank interest certificates','Capital gains statement (if any)','Deduction proofs — 80C, 80D, home loan','Aadhaar and PAN'],
      deliverables:['Filed ITR acknowledgement','ITR-V','Computation of income'] },
    { id:'itr-3', name:'ITR-3 / ITR-5 Filing (Business)', cat:'Income Tax', fee:6500, tat:8, recurring:'annual',
      checklist:['Profit & loss account and balance sheet','Trial balance','Bank statements for the full year','Form 26AS and AIS','GST returns summary','Fixed asset additions with invoices','Deduction proofs'],
      deliverables:['Filed ITR acknowledgement','ITR-V','Computation of income','Balance sheet & P/L'] },
    { id:'tax-audit', name:'Tax Audit under Sec 44AB (3CD)', cat:'Income Tax', fee:25000, tat:18, recurring:'annual',
      checklist:['Audited books of account','Trial balance and ledgers','Stock statement as at year end','TDS returns filed and challans','Loan confirmations','Related party transaction details','Previous year audit report'],
      deliverables:['Form 3CB-3CD','Audited financial statements','Audit report acceptance receipt'] },
    { id:'it-notice', name:'Income Tax Notice / Reassessment', cat:'Income Tax', fee:35000, tat:15,
      checklist:['Copy of notice under Sec 148 / 148A / 143(2)','Return filed for the relevant AY','Form 26AS and AIS for the AY','Bank statements for the AY','Supporting documents for the transaction in question','Authorisation / vakalatnama'],
      deliverables:['Drafted written submission','Filing acknowledgement','Annexure paper book'] },
    { id:'tds-return', name:'Quarterly TDS Return (24Q / 26Q)', cat:'TDS', fee:2500, tat:5, recurring:'quarterly',
      checklist:['Deductee-wise payment details','TDS challans (CIN details)','PAN of all deductees','Previous quarter acknowledgement','Salary details for 24Q'],
      deliverables:['Filed TDS return acknowledgement','Token number receipt','Form 16 / 16A'] },
    { id:'proj-report', name:'Project Report for Bank Loan', cat:'Advisory', fee:18000, tat:12,
      checklist:['Promoter KYC and net worth statement','Quotations for plant and machinery','Land documents or lease deed','Last 3 years financials (if existing unit)','Bank statements for 12 months','Details of proposed loan and margin money'],
      deliverables:['Project report with DSCR working','CMA data statement','Cash flow projections'] },
    { id:'roc-annual', name:'ROC Annual Filing (AOC-4 / MGT-7)', cat:'ROC', fee:9000, tat:10, recurring:'annual',
      checklist:['Audited financial statements','Board report and notice of AGM','Auditor report and ADT-1','List of shareholders and directors','Digital signature of director'],
      deliverables:['Filed AOC-4 challan','Filed MGT-7 challan','SRN receipts'] },
    { id:'bookkeeping', name:'Books Maintenance in Tally', cat:'Advisory', fee:5000, tat:7, recurring:'monthly',
      checklist:['Sales and purchase invoices','Bank statements','Cash book / expense vouchers','Payroll register','Previous month Tally backup (if any)'],
      deliverables:['Tally data backup (.tcp / .900)','Monthly trial balance','P&L and balance sheet','MIS summary'] },
    { id:'scrutiny', name:'Income Tax Scrutiny / Assessment', cat:'Income Tax', fee:28000, tat:15,
      checklist:['Notice under Sec 143(2) / 142(1)','Return filed for the relevant AY','Computation of income','Books of account and bank statements','Supporting evidence for items under scrutiny','Authorisation letter'],
      deliverables:['Written submission with annexures','e-Proceedings filing acknowledgement','Assessment order (on receipt)'] },
    { id:'appeal', name:'Appeal before CIT(A) / NFAC', cat:'Income Tax', fee:40000, tat:20,
      checklist:['Assessment order appealed against','Demand notice and computation','Return and computation for the AY','Grounds of appeal inputs','Proof of appeal fee payment','Form 35 authorisation'],
      deliverables:['Form 35 with grounds of appeal','Statement of facts','Paper book of evidence','Filing acknowledgement'] },
    { id:'udyam', name:'Udyam / MSME Registration', cat:'Registration', fee:2000, tat:3,
      checklist:['Aadhaar of proprietor / partner / director','PAN of the enterprise','GSTIN (if registered)','Bank account details','Details of investment in plant and machinery','NIC activity code / nature of business'],
      deliverables:['Udyam Registration Certificate','Udyam Registration Number intimation'] },
    { id:'company-inc', name:'Company / LLP Incorporation (ROC)', cat:'ROC', fee:16000, tat:14,
      checklist:['PAN and Aadhaar of all directors / partners','Passport-size photographs','Address proof of directors','Registered office proof — rent deed / EB bill / NOC','Proposed names in order of preference','DSC of directors','Capital contribution details'],
      deliverables:['Certificate of Incorporation','PAN and TAN of the company','MOA and AOA / LLP agreement','DIN allotment letter'] },
    { id:'concurrent-audit', name:'Bank Concurrent Audit', cat:'Audit', fee:22000, tat:15, recurring:'monthly',
      checklist:['Branch advances register','KYC compliance sample','Revenue leakage checklist','Previous month audit report compliance'],
      deliverables:['Concurrent audit report','Revenue leakage annexure','Compliance certificate'] }
  ];

  var STAFF = [
    { id:'S01', name:'CA K. Khaja Hussain', role:'partner', desig:'Partner — F.C.A.', email:'kkhca1975@yahoo.co.in', phone:'+91 98495 06910', skills:['Income Tax','GST','Audit','ROC','Advisory'], capacity:12 },
    { id:'S02', name:'S. Ramesh',          role:'staff',   desig:'Audit Manager',     email:'ramesh@kvksn.in',       phone:'+91 90590 43910', skills:['GST','Audit','Advisory'],        capacity:18 },
    { id:'S03', name:'P. Anitha',          role:'staff',   desig:'Senior Accountant', email:'anitha@kvksn.in',       phone:'+91 93910 22841', skills:['GST','TDS','Income Tax'],        capacity:20 },
    { id:'S04', name:'T. Naveen',          role:'staff',   desig:'Article Assistant', email:'naveen@kvksn.in',       phone:'+91 96665 71203', skills:['GST','TDS'],                     capacity:14 },
    { id:'S05', name:'B. Sridevi',         role:'staff',   desig:'Accounts Executive',email:'sridevi@kvksn.in',      phone:'+91 91778 30456', skills:['Advisory','ROC','TDS','Registration'], capacity:16 }
  ];

  var CLIENTS = [
    { id:'C001', code:'KVK-0001', name:'Sri Lakshmi Traders', contact:'R. Venkatesh', type:'Proprietorship',
      pan:'AXOPV4521K', gstin:'37AXOPV4521K1Z8', email:'client@demo.in', phone:'+91 98480 11223',
      address:'12-4-88, Nagarajupeta, Kadapa - 516001', regDate:'2019-07-01', turnover:'Rs. 1.5 Cr to 5 Cr',
      turnoverValue:32000000, filingFreq:'Monthly', gstStatus:'Active', constitution:'Proprietorship',
      services:['gstr-1','gstr-3b','itr-3','tds-return','bookkeeping'], eInvoice:'Not applicable',
      taxAudit:true, password:'demo' },
    { id:'C002', code:'KVK-0002', name:'Kadapa Dairy Farms Pvt Ltd', contact:'M. Subba Reddy', type:'Private Limited',
      pan:'AAGCK9087M', gstin:'37AAGCK9087M1ZQ', cin:'U01100AP2018PTC012345', email:'dairy@demo.in', phone:'+91 94408 55221',
      address:'Survey No. 214, Chennur Road, Proddatur - 516360', regDate:'2018-04-12', turnover:'Rs. 5 Cr to 25 Cr',
      turnoverValue:88000000, filingFreq:'Monthly', gstStatus:'Active', constitution:'Private Limited Company',
      services:['gstr-1','gstr-3b','gstr-9','itr-3','tax-audit','roc-annual','tds-return'], eInvoice:'Enabled',
      taxAudit:true, password:'demo' },
    { id:'C003', code:'KVK-0003', name:'M. Sudhakar Reddy', contact:'M. Sudhakar Reddy', type:'Individual',
      pan:'BQXPS7734L', gstin:'', email:'sudhakar@demo.in', phone:'+91 99590 77412',
      address:'Flat 302, Sai Residency, Kadapa - 516002', regDate:'', turnover:'Not registered under GST',
      turnoverValue:1850000, filingFreq:'—', gstStatus:'—', constitution:'Individual — Salaried',
      services:['itr-1'], eInvoice:'—', taxAudit:false, password:'demo' },
    { id:'C004', code:'KVK-0004', name:'Rayalaseema Poultry LLP', contact:'K. Prasad', type:'LLP',
      pan:'ABJFR5512P', gstin:'37ABJFR5512P1ZM', cin:'AAK-8821', email:'poultry@demo.in', phone:'+91 90005 66331',
      address:'NH-716, Yerraguntla Mandal, YSR Kadapa - 516309', regDate:'2020-09-18', turnover:'Rs. 1.5 Cr to 5 Cr',
      turnoverValue:41000000, filingFreq:'Quarterly (QRMP)', gstStatus:'Active', constitution:'Limited Liability Partnership',
      services:['gstr-1','gstr-3b','itr-3','proj-report','tds-return'], eInvoice:'Not applicable',
      taxAudit:true, password:'demo' },
    { id:'C005', code:'KVK-0005', name:'Sri Venkateswara Charitable Trust', contact:'G. Ramanaiah', type:'Trust',
      pan:'AAATS1129F', gstin:'', email:'trust@demo.in', phone:'+91 87126 90044',
      address:'Temple Street, Pulivendula, YSR Kadapa - 516390', regDate:'', turnover:'Not registered under GST',
      turnoverValue:6400000, filingFreq:'—', gstStatus:'—', constitution:'Public Charitable Trust',
      services:['itr-3','tax-audit','bookkeeping'], eInvoice:'—', taxAudit:true, password:'demo' },
    { id:'C006', code:'KVK-0006', name:'Anjaneya Steel Traders', contact:'D. Nagaraju', type:'Partnership',
      pan:'AAKFA2201N', gstin:'37AAKFA2201N1Z5', email:'steel@demo.in', phone:'+91 93478 12006',
      address:'Industrial Estate, Kadapa - 516004', regDate:'2017-08-22', turnover:'Rs. 5 Cr to 25 Cr',
      turnoverValue:67000000, filingFreq:'Monthly', gstStatus:'Active', constitution:'Partnership Firm',
      services:['gstr-1','gstr-3b','gstr-9','itr-3','tax-audit','tds-return'], eInvoice:'Enabled',
      taxAudit:true, password:'demo' }
  ];

  /* ---------------- Date helpers ---------------- */
  function today() { var d = new Date(); return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
  function addDays(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; }
  function isoOf(d) {
    return d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate());
  }
  function p2(n) { return n < 10 ? '0' + n : '' + n; }
  function rel(n) { return isoOf(addDays(today(), n)); }
  function stamp(n, h) {
    var d = addDays(today(), n); d.setHours(h || 11, (n * 7) % 60, 0, 0); return d.toISOString();
  }

  var MON_S = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  function periodOf(offsetMonths) {
    var d = new Date(); d.setDate(1); d.setMonth(d.getMonth() + offsetMonths);
    return MON_S[d.getMonth()] + ' ' + d.getFullYear();
  }
  function fyStartYear() {
    var d = new Date();
    return d.getMonth() + 1 >= 4 ? d.getFullYear() : d.getFullYear() - 1;
  }
  /** The financial year currently in progress, e.g. "FY 2026-27". */
  function currentFY() { var y = fyStartYear(); return 'FY ' + y + '-' + p2((y + 1) % 100); }
  /** The financial year just closed — the one being filed and audited now. */
  function prevFY() { var y = fyStartYear() - 1; return 'FY ' + y + '-' + p2((y + 1) % 100); }
  /** The assessment year for which returns are being filed now. */
  function currentAY() { var y = fyStartYear(); return 'AY ' + y + '-' + p2((y + 1) % 100); }

  /* ---------------- Seed ---------------- */
  function svc(id) { for (var i = 0; i < SERVICES.length; i++) if (SERVICES[i].id === id) return SERVICES[i]; return null; }

  function mkChecklist(serviceId, filledCount) {
    var s = svc(serviceId);
    return s.checklist.map(function (item, i) {
      return { item: item, done: i < filledCount, doc: i < filledCount ? null : null };
    });
  }

  var jobSeq = 1040;
  function nextJobId() { return 'JOB-' + (++jobSeq); }

  function mkJob(o) {
    var s = svc(o.serviceId);
    var filled = o.filled === undefined ? s.checklist.length : o.filled;
    return {
      id: o.id || nextJobId(),
      clientId: o.clientId,
      serviceId: o.serviceId,
      title: s.name + (o.period ? ' — ' + o.period : ''),
      period: o.period || '',
      cat: s.cat,
      status: o.status,
      assignedTo: o.assignedTo || null,
      reviewer: o.reviewer || 'S01',
      priority: o.priority || 'Normal',
      createdAt: o.createdAt,
      dueDate: o.dueDate,
      targetDate: o.targetDate || o.dueDate,
      fee: o.fee || s.fee,
      checklist: mkChecklist(o.serviceId, filled),
      docs: o.docs || [],
      timeline: o.timeline || [],
      queries: o.queries || [],
      deliverables: o.deliverables || [],
      invoiceId: o.invoiceId || null,
      closedAt: o.closedAt || null
    };
  }

  function tl(at, by, action, note) { return { at: at, by: by, action: action, note: note || '' }; }

  function seed() {
    var jobs = [];

    /* --- C001 Sri Lakshmi Traders --- */
    jobs.push(mkJob({
      clientId:'C001', serviceId:'gstr-3b', period: periodOf(-1), status:'completed',
      assignedTo:'S03', createdAt: stamp(-22, 10), dueDate: rel(-7), fee:1500, invoiceId:'INV-2041',
      closedAt: stamp(-9, 16),
      docs:[
        { id:'D9001', name:'Sales_Register_' + periodOf(-1).replace(' ', '_') + '.xlsx', size:'184 KB', by:'C001', at: stamp(-21, 10), kind:'upload' },
        { id:'D9002', name:'Purchase_Register_' + periodOf(-1).replace(' ', '_') + '.xlsx', size:'156 KB', by:'C001', at: stamp(-21, 10), kind:'upload' },
        { id:'D9003', name:'GSTR-2B_' + periodOf(-1).replace(' ', '_') + '.json', size:'92 KB', by:'S03', at: stamp(-18, 12), kind:'fetched' }
      ],
      deliverables:[
        { id:'V9001', name:'GSTR-3B_Filed_Acknowledgement.pdf', released:true, at: stamp(-9, 16) },
        { id:'V9002', name:'ARN_AA370725004521X.pdf', released:true, at: stamp(-9, 16) },
        { id:'V9003', name:'Tax_Payment_Challan.pdf', released:true, at: stamp(-9, 16) }
      ],
      timeline:[
        tl(stamp(-22, 10), 'C001', 'Job created', 'Requested through client portal'),
        tl(stamp(-22, 11), 'S02', 'Assigned to P. Anitha', 'Routed on GST skill match'),
        tl(stamp(-21, 10), 'C001', 'Documents uploaded', '2 files against checklist'),
        tl(stamp(-18, 12), 'S03', 'GSTR-2B fetched from GSTN', 'ITC reconciliation completed — no mismatch'),
        tl(stamp(-12, 15), 'S03', 'Prepared and submitted for review', 'Net liability Rs. 1,84,220'),
        tl(stamp(-10, 11), 'S01', 'Reviewed and approved', 'Figures tallied with books'),
        tl(stamp(-9, 16), 'S01', 'Filed on GST portal & released', 'ARN AA370725004521X')
      ]
    }));

    jobs.push(mkJob({
      clientId:'C001', serviceId:'gstr-3b', period: periodOf(0), status:'docs_pending',
      assignedTo:'S03', createdAt: stamp(-3, 10), dueDate: rel(13), filled:1,
      docs:[{ id:'D9010', name:'Sales_Register_' + periodOf(0).replace(' ', '_') + '.xlsx', size:'171 KB', by:'C001', at: stamp(-3, 11), kind:'upload' }],
      timeline:[
        tl(stamp(-3, 10), 'system', 'Recurring job auto-created', 'Generated from the client’s monthly GST registration'),
        tl(stamp(-3, 10), 'S02', 'Assigned to P. Anitha', ''),
        tl(stamp(-3, 11), 'C001', 'Documents uploaded', 'Sales register received')
      ]
    }));

    jobs.push(mkJob({
      clientId:'C001', serviceId:'itr-3', period: currentAY(), status:'query_raised',
      assignedTo:'S02', createdAt: stamp(-14, 10), dueDate: rel(24), filled:5, fee:6500,
      docs:[
        { id:'D9020', name:'Trial_Balance_FY2025-26.pdf', size:'220 KB', by:'C001', at: stamp(-13, 10), kind:'upload' },
        { id:'D9021', name:'Bank_Statement_SBI_FY2025-26.pdf', size:'1.2 MB', by:'C001', at: stamp(-13, 10), kind:'upload' },
        { id:'D9022', name:'Form_26AS_AY2026-27.pdf', size:'88 KB', by:'S02', at: stamp(-11, 15), kind:'fetched' }
      ],
      queries:[{
        id:'Q9001', by:'S02', at: stamp(-4, 12),
        text:'The bank statement shows a credit of Rs. 8,50,000 on 14 January from "RTGS-ANJANEYA". This is not reflected in the sales register. Please confirm whether this is a business receipt, a loan, or a capital introduction, and share the supporting document.',
        replies:[]
      }],
      timeline:[
        tl(stamp(-14, 10), 'C001', 'Job created', 'Requested through client portal'),
        tl(stamp(-14, 11), 'S01', 'Assigned to S. Ramesh', ''),
        tl(stamp(-13, 10), 'C001', 'Documents uploaded', '2 files'),
        tl(stamp(-11, 15), 'S02', 'Form 26AS & AIS fetched', 'TDS credits Rs. 47,180 matched'),
        tl(stamp(-4, 12), 'S02', 'Query raised to client', 'Unexplained bank credit of Rs. 8,50,000')
      ]
    }));

    /* --- C002 Kadapa Dairy Farms --- */
    jobs.push(mkJob({
      clientId:'C002', serviceId:'tax-audit', period: currentAY(), status:'under_review',
      assignedTo:'S02', createdAt: stamp(-30, 10), dueDate: rel(54), fee:25000,
      docs:[
        { id:'D9030', name:'Audited_Financials_FY2025-26.pdf', size:'2.4 MB', by:'C002', at: stamp(-28, 10), kind:'upload' },
        { id:'D9031', name:'Trial_Balance_and_Ledgers.xlsx', size:'980 KB', by:'C002', at: stamp(-28, 10), kind:'upload' },
        { id:'D9032', name:'Stock_Statement_31032026.pdf', size:'145 KB', by:'C002', at: stamp(-27, 12), kind:'upload' },
        { id:'D9033', name:'TDS_Challans_FY2025-26.zip', size:'640 KB', by:'C002', at: stamp(-26, 9), kind:'upload' },
        { id:'D9034', name:'Draft_Form_3CD.pdf', size:'310 KB', by:'S02', at: stamp(-5, 17), kind:'workpaper' }
      ],
      timeline:[
        tl(stamp(-30, 10), 'S01', 'Job created', 'Annual engagement — tax audit'),
        tl(stamp(-30, 10), 'S01', 'Assigned to S. Ramesh', ''),
        tl(stamp(-28, 10), 'C002', 'Documents uploaded', '2 files'),
        tl(stamp(-26, 9), 'C002', 'Documents uploaded', 'TDS challans received'),
        tl(stamp(-5, 17), 'S02', 'Prepared and submitted for review', 'Clause 44 reporting completed'),
        tl(stamp(-2, 10), 'S01', 'Review in progress', 'Verifying clause 21 disallowances')
      ]
    }));

    jobs.push(mkJob({
      clientId:'C002', serviceId:'gstr-3b', period: periodOf(0), status:'in_progress',
      assignedTo:'S04', createdAt: stamp(-4, 10), dueDate: rel(13), fee:1500,
      docs:[
        { id:'D9040', name:'Sales_Register_' + periodOf(0).replace(' ', '_') + '.xlsx', size:'410 KB', by:'C002', at: stamp(-4, 11), kind:'upload' },
        { id:'D9041', name:'Purchase_Register_' + periodOf(0).replace(' ', '_') + '.xlsx', size:'365 KB', by:'C002', at: stamp(-4, 11), kind:'upload' },
        { id:'D9042', name:'GSTR-2B_' + periodOf(0).replace(' ', '_') + '.json', size:'118 KB', by:'S04', at: stamp(-2, 14), kind:'fetched' }
      ],
      timeline:[
        tl(stamp(-4, 10), 'system', 'Recurring job auto-created', ''),
        tl(stamp(-4, 10), 'S02', 'Assigned to T. Naveen', ''),
        tl(stamp(-4, 11), 'C002', 'Documents uploaded', '2 files'),
        tl(stamp(-2, 14), 'S04', 'GSTR-2B fetched from GSTN', '3 invoices missing in 2B — supplier follow-up initiated'),
        tl(stamp(-1, 11), 'S04', 'Preparation in progress', '')
      ]
    }));

    jobs.push(mkJob({
      clientId:'C002', serviceId:'roc-annual', period: prevFY(), status:'assigned',
      assignedTo:'S05', createdAt: stamp(-6, 10), dueDate: rel(84), filled:2, fee:9000,
      docs:[{ id:'D9050', name:'Board_Report_Draft.docx', size:'76 KB', by:'C002', at: stamp(-5, 15), kind:'upload' }],
      timeline:[
        tl(stamp(-6, 10), 'S01', 'Job created', 'Annual ROC filing'),
        tl(stamp(-6, 10), 'S01', 'Assigned to B. Sridevi', ''),
        tl(stamp(-5, 15), 'C002', 'Documents uploaded', '')
      ]
    }));

    /* --- C003 Salaried individual --- */
    jobs.push(mkJob({
      clientId:'C003', serviceId:'itr-1', period: currentAY(), status:'ready',
      assignedTo:'S03', createdAt: stamp(-11, 10), dueDate: rel(6), fee:2500,
      docs:[
        { id:'D9060', name:'Form_16_FY2025-26.pdf', size:'210 KB', by:'C003', at: stamp(-10, 9), kind:'upload' },
        { id:'D9061', name:'Form_26AS_AY2026-27.pdf', size:'74 KB', by:'S03', at: stamp(-9, 11), kind:'fetched' },
        { id:'D9062', name:'AIS_AY2026-27.pdf', size:'96 KB', by:'S03', at: stamp(-9, 11), kind:'fetched' },
        { id:'D9063', name:'80C_Investment_Proofs.pdf', size:'340 KB', by:'C003', at: stamp(-10, 9), kind:'upload' }
      ],
      deliverables:[
        { id:'V9010', name:'Computation_of_Income_AY2026-27.pdf', released:false, at: stamp(-2, 16) },
        { id:'V9011', name:'Draft_ITR-1_AY2026-27.pdf', released:false, at: stamp(-2, 16) }
      ],
      timeline:[
        tl(stamp(-11, 10), 'C003', 'Job created', 'Requested through client portal'),
        tl(stamp(-11, 10), 'S02', 'Assigned to P. Anitha', ''),
        tl(stamp(-10, 9), 'C003', 'Documents uploaded', '2 files'),
        tl(stamp(-9, 11), 'S03', 'Form 26AS & AIS fetched', 'Salary and TDS figures matched with Form 16'),
        tl(stamp(-2, 16), 'S03', 'Prepared and submitted for review', 'Refund of Rs. 12,340 computed'),
        tl(stamp(-1, 10), 'S01', 'Reviewed and approved', 'Awaiting release to client for confirmation')
      ]
    }));

    /* --- C004 Rayalaseema Poultry --- */
    jobs.push(mkJob({
      clientId:'C004', serviceId:'proj-report', period:'Dairy & Poultry Expansion', status:'in_progress',
      assignedTo:'S02', createdAt: stamp(-9, 10), dueDate: rel(3), fee:18000, priority:'High',
      docs:[
        { id:'D9070', name:'Promoter_KYC_and_Networth.pdf', size:'520 KB', by:'C004', at: stamp(-8, 10), kind:'upload' },
        { id:'D9071', name:'Machinery_Quotations.pdf', size:'1.1 MB', by:'C004', at: stamp(-8, 10), kind:'upload' },
        { id:'D9072', name:'Lease_Deed_Yerraguntla.pdf', size:'880 KB', by:'C004', at: stamp(-7, 14), kind:'upload' },
        { id:'D9073', name:'Financials_Last_3_Years.pdf', size:'760 KB', by:'C004', at: stamp(-7, 14), kind:'upload' },
        { id:'D9074', name:'Bank_Statement_12M.pdf', size:'2.1 MB', by:'C004', at: stamp(-6, 11), kind:'upload' },
        { id:'D9075', name:'DSCR_Working_v2.xlsx', size:'96 KB', by:'S02', at: stamp(-2, 18), kind:'workpaper' }
      ],
      timeline:[
        tl(stamp(-9, 10), 'C004', 'Job created', 'Term loan of Rs. 1.20 Cr proposed with Canara Bank'),
        tl(stamp(-9, 11), 'S01', 'Assigned to S. Ramesh', 'Marked High priority — bank sanction meeting scheduled'),
        tl(stamp(-8, 10), 'C004', 'Documents uploaded', '2 files'),
        tl(stamp(-6, 11), 'C004', 'Documents uploaded', 'All checklist items complete'),
        tl(stamp(-2, 18), 'S02', 'DSCR working prepared', 'Average DSCR 1.84 over 7 years')
      ]
    }));

    jobs.push(mkJob({
      clientId:'C004', serviceId:'gstr-1', period: periodOf(-1), status:'completed',
      assignedTo:'S04', createdAt: stamp(-26, 10), dueDate: rel(-12), fee:1200, invoiceId:'INV-2042',
      closedAt: stamp(-14, 12),
      deliverables:[
        { id:'V9020', name:'GSTR-1_Filed_Acknowledgement.pdf', released:true, at: stamp(-14, 12) },
        { id:'V9021', name:'ARN_AA370725006712B.pdf', released:true, at: stamp(-14, 12) }
      ],
      timeline:[
        tl(stamp(-26, 10), 'system', 'Recurring job auto-created', ''),
        tl(stamp(-24, 10), 'C004', 'Documents uploaded', ''),
        tl(stamp(-16, 15), 'S04', 'Prepared and submitted for review', ''),
        tl(stamp(-15, 11), 'S01', 'Reviewed and approved', ''),
        tl(stamp(-14, 12), 'S01', 'Filed on GST portal & released', 'ARN AA370725006712B')
      ]
    }));

    /* --- C005 Trust --- */
    jobs.push(mkJob({
      clientId:'C005', serviceId:'bookkeeping', period: periodOf(-1), status:'completed',
      assignedTo:'S05', createdAt: stamp(-32, 10), dueDate: rel(-18), fee:5000, invoiceId:'INV-2043',
      closedAt: stamp(-20, 15),
      deliverables:[
        { id:'V9030', name:'Trial_Balance_' + periodOf(-1).replace(' ', '_') + '.pdf', released:true, at: stamp(-20, 15) },
        { id:'V9031', name:'Receipts_and_Payments_Account.pdf', released:true, at: stamp(-20, 15) }
      ],
      timeline:[
        tl(stamp(-32, 10), 'system', 'Recurring job auto-created', ''),
        tl(stamp(-30, 10), 'C005', 'Documents uploaded', ''),
        tl(stamp(-22, 14), 'S05', 'Prepared and submitted for review', ''),
        tl(stamp(-20, 15), 'S01', 'Reviewed, approved & released', '')
      ]
    }));

    jobs.push(mkJob({
      clientId:'C005', serviceId:'tax-audit', period: currentAY(), status:'docs_pending',
      assignedTo:'S05', createdAt: stamp(-8, 10), dueDate: rel(54), filled:1, fee:25000,
      timeline:[
        tl(stamp(-8, 10), 'S01', 'Job created', 'Form 10B audit for the trust'),
        tl(stamp(-8, 10), 'S01', 'Assigned to B. Sridevi', ''),
        tl(stamp(-8, 11), 'S05', 'Document request sent', 'Checklist shared with the trustee')
      ]
    }));

    /* --- C006 Anjaneya Steel --- */
    jobs.push(mkJob({
      clientId:'C006', serviceId:'gst-notice', period:'DRC-01 dated ' + isoOf(addDays(today(), -20)), status:'in_progress',
      assignedTo:'S01', createdAt: stamp(-18, 10), dueDate: rel(9), fee:15000, priority:'High',
      docs:[
        { id:'D9080', name:'DRC-01_Notice.pdf', size:'420 KB', by:'C006', at: stamp(-17, 10), kind:'upload' },
        { id:'D9081', name:'ITC_Ledger_FY2024-25.xlsx', size:'290 KB', by:'C006', at: stamp(-17, 10), kind:'upload' },
        { id:'D9082', name:'Purchase_Invoices_Disputed.pdf', size:'3.4 MB', by:'C006', at: stamp(-15, 16), kind:'upload' },
        { id:'D9083', name:'Draft_Reply_v1.docx', size:'88 KB', by:'S01', at: stamp(-3, 19), kind:'workpaper' }
      ],
      timeline:[
        tl(stamp(-18, 10), 'C006', 'Job created', 'ITC mismatch demand of Rs. 6,42,880 raised'),
        tl(stamp(-18, 10), 'S01', 'Self-assigned', 'Partner handling directly'),
        tl(stamp(-17, 10), 'C006', 'Documents uploaded', '2 files'),
        tl(stamp(-15, 16), 'C006', 'Documents uploaded', 'Disputed purchase invoices'),
        tl(stamp(-3, 19), 'S01', 'Draft reply prepared', 'Relying on Sec 16(2)(c) and supplier filing evidence')
      ]
    }));

    jobs.push(mkJob({
      clientId:'C006', serviceId:'gstr-3b', period: periodOf(0), status:'assigned',
      assignedTo:'S04', createdAt: stamp(-3, 10), dueDate: rel(13), filled:0, fee:1500,
      timeline:[
        tl(stamp(-3, 10), 'system', 'Recurring job auto-created', ''),
        tl(stamp(-3, 10), 'S02', 'Assigned to T. Naveen', '')
      ]
    }));

    jobs.push(mkJob({
      clientId:'C006', serviceId:'tds-return', period:'Q1 (Apr–Jun) · ' + currentFY(), status:'completed',
      assignedTo:'S03', createdAt: stamp(-40, 10), dueDate: rel(-8), fee:2500, invoiceId:'INV-2044',
      closedAt: stamp(-10, 14),
      deliverables:[
        { id:'V9040', name:'TDS_Return_Acknowledgement_Q1.pdf', released:true, at: stamp(-10, 14) },
        { id:'V9041', name:'Token_Number_Receipt.pdf', released:true, at: stamp(-10, 14) }
      ],
      timeline:[
        tl(stamp(-40, 10), 'system', 'Recurring job auto-created', ''),
        tl(stamp(-30, 10), 'C006', 'Documents uploaded', ''),
        tl(stamp(-14, 15), 'S03', 'Prepared and submitted for review', ''),
        tl(stamp(-10, 14), 'S01', 'Filed & released', 'Token 040420260012345')
      ]
    }));

    var invoices = [
      { id:'INV-2041', clientId:'C001', jobIds:['JOB-1041'], date: rel(-9),  amount:1500,  gst:270,   total:1770,  status:'Paid',        paidOn: rel(-5), mode:'UPI' },
      { id:'INV-2042', clientId:'C004', jobIds:['JOB-1048'], date: rel(-14), amount:1200,  gst:216,   total:1416,  status:'Paid',        paidOn: rel(-11), mode:'NEFT' },
      { id:'INV-2043', clientId:'C005', jobIds:['JOB-1049'], date: rel(-20), amount:5000,  gst:900,   total:5900,  status:'Paid',        paidOn: rel(-16), mode:'Cheque' },
      { id:'INV-2044', clientId:'C006', jobIds:['JOB-1052'], date: rel(-10), amount:2500,  gst:450,   total:2950,  status:'Outstanding', paidOn:null, mode:null },
      { id:'INV-2045', clientId:'C002', jobIds:[],           date: rel(-6),  amount:25000, gst:4500,  total:29500, status:'Outstanding', paidOn:null, mode:null },
      { id:'INV-2046', clientId:'C001', jobIds:[],           date: rel(-34), amount:6500,  gst:1170,  total:7670,  status:'Overdue',     paidOn:null, mode:null }
    ];

    var notifications = [
      { id:'N1', to:'C001', at: stamp(-4, 12), text:'A query has been raised on your ITR-3 filing. Please respond.', jobId:null, read:false },
      { id:'N2', to:'C001', at: stamp(-9, 16), text:'GSTR-3B for ' + periodOf(-1) + ' has been filed. Acknowledgement is available for download.', read:true },
      { id:'N3', to:'C003', at: stamp(-1, 10), text:'Your ITR-1 computation is ready for your confirmation.', read:false },
      { id:'N4', to:'C002', at: stamp(-2, 10), text:'Tax audit is under partner review. Target completion in 5 days.', read:false },
      { id:'N5', to:'S02', at: stamp(-1, 9),  text:'Project report for Rayalaseema Poultry LLP is due in 3 days.', read:false },
      { id:'N6', to:'S01', at: stamp(0, 9),   text:'2 jobs are awaiting your review and release.', read:false }
    ];

    var syncLog = [
      { id:'SY1', at: stamp(-2, 14), source:'GSTN', clientId:'C002', action:'GSTR-2B download', result:'Success — 148 invoices, 3 mismatches', by:'S04' },
      { id:'SY2', at: stamp(-9, 11), source:'Income Tax (ERI)', clientId:'C003', action:'Form 26AS + AIS fetch', result:'Success — TDS credits Rs. 47,180', by:'S03' },
      { id:'SY3', at: stamp(-1, 8),  source:'GSTN', clientId:'ALL', action:'Nightly return filing status sync', result:'Success — 4 of 5 GST clients filed for ' + periodOf(-1), by:'system' },
      { id:'SY4', at: stamp(-11, 15),source:'Income Tax (ERI)', clientId:'C001', action:'Form 26AS fetch', result:'Success', by:'S02' },
      { id:'SY5', at: stamp(-5, 16), source:'MCA21', clientId:'C002', action:'Company master data', result:'Success — status Active, 3 directors', by:'S05' }
    ];

    return {
      version: 4,
      seededAt: new Date().toISOString(),
      clients: JSON.parse(JSON.stringify(CLIENTS)),
      staff: JSON.parse(JSON.stringify(STAFF)),
      services: JSON.parse(JSON.stringify(SERVICES)),
      jobs: jobs,
      invoices: invoices,
      notifications: notifications,
      syncLog: syncLog,
      leads: JSON.parse(localStorage.getItem('kvksn.leads') || '[]')
    };
  }

  /* ---------------- Store API ---------------- */
  var db = null;

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) { db = JSON.parse(raw); }
    } catch (e) { db = null; }
    if (!db || db.version !== 4) { db = seed(); save(); }
    // keep public-site leads in sync
    try {
      var leads = JSON.parse(localStorage.getItem('kvksn.leads') || '[]');
      var known = {}; db.leads.forEach(function (l) { known[l.id] = 1; });
      leads.forEach(function (l) { if (!known[l.id]) db.leads.unshift(l); });
    } catch (e) { /* ignore */ }
    return db;
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(db)); }
    catch (e) { console.warn('Storage full or unavailable', e); }
  }

  function reset() { localStorage.removeItem(KEY); localStorage.removeItem('kvksn.leads'); db = seed(); save(); return db; }

  /* ---------------- Lookups ---------------- */
  function client(id) { return db.clients.filter(function (c) { return c.id === id; })[0]; }
  function staff(id) { return db.staff.filter(function (s) { return s.id === id; })[0]; }
  function service(id) { return db.services.filter(function (s) { return s.id === id; })[0]; }
  function job(id) { return db.jobs.filter(function (j) { return j.id === id; })[0]; }
  function actorName(id) {
    if (!id) return 'Unassigned';
    if (id === 'system') return 'System';
    var s = staff(id); if (s) return s.name;
    var c = client(id); if (c) return c.name;
    return id;
  }

  function jobsFor(clientId) { return db.jobs.filter(function (j) { return j.clientId === clientId; }); }
  function jobsOf(staffId) { return db.jobs.filter(function (j) { return j.assignedTo === staffId; }); }
  function openJobs() { return db.jobs.filter(function (j) { return j.status !== 'completed'; }); }

  function checklistDone(j) {
    var d = j.checklist.filter(function (c) { return c.done; }).length;
    return { done: d, total: j.checklist.length, pct: j.checklist.length ? Math.round(d * 100 / j.checklist.length) : 0 };
  }

  function overdue(j) {
    return j.status !== 'completed' && j.dueDate && new Date(j.dueDate) < today();
  }

  function daysLeft(isoDate) {
    return Math.round((new Date(isoDate) - today()) / 86400000);
  }

  /* ---------------- Mutations ---------------- */
  function addTimeline(j, by, action, note) {
    j.timeline.push({ at: new Date().toISOString(), by: by, action: action, note: note || '' });
  }

  function notify(to, text, jobId) {
    db.notifications.unshift({ id: 'N' + Date.now() + Math.floor(Math.random() * 99),
      to: to, at: new Date().toISOString(), text: text, jobId: jobId || null, read: false });
  }

  /** Round-robin-ish assignment: least loaded staff who has the skill. */
  function autoAssign(serviceCat) {
    var pool = db.staff.filter(function (s) {
      return s.role === 'staff' && s.skills.indexOf(serviceCat) !== -1;
    });
    if (!pool.length) pool = db.staff.filter(function (s) { return s.role === 'staff'; });
    pool.sort(function (a, b) { return jobsOf(a.id).length - jobsOf(b.id).length; });
    return pool[0] ? pool[0].id : 'S02';
  }

  function createJob(clientId, serviceId, period, by) {
    var s = service(serviceId);
    var id = 'JOB-' + (1000 + db.jobs.length + Math.floor(Math.random() * 900) + 60);
    var assignee = autoAssign(s.cat);
    var due = isoOf(addDays(today(), s.tat + 3));
    var j = {
      id: id, clientId: clientId, serviceId: serviceId,
      title: s.name + (period ? ' — ' + period : ''), period: period || '',
      cat: s.cat, status: 'docs_pending', assignedTo: assignee, reviewer: 'S01',
      priority: 'Normal', createdAt: new Date().toISOString(),
      dueDate: due, targetDate: due, fee: s.fee,
      checklist: s.checklist.map(function (c) { return { item: c, done: false, doc: null }; }),
      docs: [], timeline: [], queries: [], deliverables: [], invoiceId: null, closedAt: null
    };
    addTimeline(j, by, 'Job created', 'Raised through the portal');
    addTimeline(j, 'system', 'Auto-assigned to ' + actorName(assignee), 'Least-loaded staff with ' + s.cat + ' skill');
    db.jobs.unshift(j);
    notify(assignee, 'New job ' + id + ' assigned: ' + j.title + ' (' + client(clientId).name + ')', id);
    save();
    return j;
  }

  function setStatus(j, status, by, note) {
    var from = STATUS[j.status].label;
    j.status = status;
    addTimeline(j, by, 'Status changed: ' + from + ' → ' + STATUS[status].label, note);
    if (status === 'completed') j.closedAt = new Date().toISOString();
    save();
  }

  function uploadDoc(j, name, size, by, kind) {
    var d = { id: 'D' + Date.now() + Math.floor(Math.random() * 99), name: name,
              size: size || '—', by: by, at: new Date().toISOString(), kind: kind || 'upload' };
    j.docs.push(d);
    save();
    return d;
  }

  function releaseDeliverables(j, by) {
    j.deliverables.forEach(function (d) { if (!d.released) { d.released = true; d.at = new Date().toISOString(); } });
    setStatus(j, 'completed', by, 'Deliverables released to the client');
    notify(j.clientId, j.title + ' is complete. Your documents are available in the portal.', j.id);
    save();
  }

  function nextInvoiceNo() {
    var max = 2046;
    db.invoices.forEach(function (i) { var n = parseInt(i.id.replace('INV-', ''), 10); if (n > max) max = n; });
    return 'INV-' + (max + 1);
  }

  function raiseInvoice(j, by) {
    var amt = j.fee, gst = Math.round(amt * 0.18);
    var inv = { id: nextInvoiceNo(), clientId: j.clientId, jobIds: [j.id], date: isoOf(today()),
                amount: amt, gst: gst, total: amt + gst, status: 'Outstanding', paidOn: null, mode: null };
    db.invoices.unshift(inv);
    j.invoiceId = inv.id;
    addTimeline(j, by, 'Invoice raised', inv.id + ' for Rs. ' + (amt + gst).toLocaleString('en-IN'));
    notify(j.clientId, 'Invoice ' + inv.id + ' for Rs. ' + (amt + gst).toLocaleString('en-IN') + ' has been raised.', j.id);
    save();
    return inv;
  }

  /* ---------------- Simulated government portal APIs ---------------- */
  /* These mimic what a GSP / ERI integration would return. Latency and
     an OTP step are simulated so the demo shows the real-world flow. */

  var GST_DB = {
    '37AXOPV4521K1Z8': { lgnm:'SRI LAKSHMI TRADERS', tradeNam:'Sri Lakshmi Traders', ctb:'Proprietorship',
      rgdt:'01/07/2019', sts:'Active', aggreTurnOver:'Slab: Rs. 1.5 Cr to 5 Cr', dty:'Regular',
      pradr:'12-4-88, Nagarajupeta, Kadapa, Andhra Pradesh - 516001', stj:'Kadapa-I Circle', ctj:'Kadapa Range',
      nba:['Retail Business','Wholesale Business'], einv:'Not applicable' },
    '37AAGCK9087M1ZQ': { lgnm:'KADAPA DAIRY FARMS PRIVATE LIMITED', tradeNam:'Kadapa Dairy Farms', ctb:'Private Limited Company',
      rgdt:'12/04/2018', sts:'Active', aggreTurnOver:'Slab: Rs. 5 Cr to 25 Cr', dty:'Regular',
      pradr:'Survey No. 214, Chennur Road, Proddatur, Andhra Pradesh - 516360', stj:'Proddatur Circle', ctj:'Kadapa Range',
      nba:['Manufacturing','Wholesale Business'], einv:'Enabled' },
    '37ABJFR5512P1ZM': { lgnm:'RAYALASEEMA POULTRY LLP', tradeNam:'Rayalaseema Poultry', ctb:'Limited Liability Partnership',
      rgdt:'18/09/2020', sts:'Active', aggreTurnOver:'Slab: Rs. 1.5 Cr to 5 Cr', dty:'Regular (QRMP)',
      pradr:'NH-716, Yerraguntla Mandal, YSR Kadapa, Andhra Pradesh - 516309', stj:'Yerraguntla Circle', ctj:'Kadapa Range',
      nba:['Manufacturing','Warehouse / Depot'], einv:'Not applicable' },
    '37AAKFA2201N1Z5': { lgnm:'ANJANEYA STEEL TRADERS', tradeNam:'Anjaneya Steel Traders', ctb:'Partnership',
      rgdt:'22/08/2017', sts:'Active', aggreTurnOver:'Slab: Rs. 5 Cr to 25 Cr', dty:'Regular',
      pradr:'Industrial Estate, Kadapa, Andhra Pradesh - 516004', stj:'Kadapa-II Circle', ctj:'Kadapa Range',
      nba:['Wholesale Business','Retail Business'], einv:'Enabled' },
    '29AABCU9603R1ZM': { lgnm:'DEMO ENTERPRISES PRIVATE LIMITED', tradeNam:'Demo Enterprises', ctb:'Private Limited Company',
      rgdt:'03/03/2021', sts:'Active', aggreTurnOver:'Slab: Rs. 40 lakh to 1.5 Cr', dty:'Regular',
      pradr:'No. 40, MG Road, Bengaluru, Karnataka - 560001', stj:'Bengaluru East', ctj:'Bengaluru Range-3',
      nba:['Service Provision'], einv:'Not applicable' }
  };

  /** Public GST "search taxpayer" style lookup — no consent required. */
  function gstSearch(gstin) {
    return new Promise(function (resolve, reject) {
      setTimeout(function () {
        var rec = GST_DB[(gstin || '').toUpperCase().trim()];
        if (!rec) { reject(new Error('GSTIN not found on the GST common portal. Please verify the number.')); return; }
        resolve(rec);
      }, 900 + Math.random() * 700);
    });
  }

  /** Return-filing status table — public data, used by the compliance tracker. */
  function gstFilingStatus(clientId) {
    return new Promise(function (resolve) {
      setTimeout(function () {
        var c = client(clientId);
        var rows = [];
        for (var i = 5; i >= 0; i--) {
          var per = periodOf(-i);
          // current month generally not yet filed; older months filed
          var filed1 = i > 0, filed3b = i > 0;
          if (clientId === 'C006' && i === 1) filed3b = false;   // one deliberate defaulter
          rows.push({ period: per, gstr1: filed1 ? 'Filed' : 'Not filed', gstr1Date: filed1 ? rel(-(i * 30) + 9) : null,
                      gstr3b: filed3b ? 'Filed' : 'Not filed', gstr3bDate: filed3b ? rel(-(i * 30) + 18) : null });
        }
        resolve({ gstin: c.gstin, rows: rows });
      }, 700 + Math.random() * 600);
    });
  }

  /** Consent-based Income Tax (ERI) pull — requires an OTP step. */
  function itFetch(clientId, otpVerified) {
    return new Promise(function (resolve, reject) {
      setTimeout(function () {
        if (!otpVerified) { reject(new Error('Client OTP verification required before data can be fetched.')); return; }
        var c = client(clientId);
        var base = c.turnoverValue || 1000000;
        resolve({
          pan: c.pan,
          panStatus: 'Active',
          aadhaarLinked: 'Linked',
          ay: currentAY(),
          returnFiled: c.id === 'C003' ? 'Not filed' : 'Filed',
          ackNo: c.id === 'C003' ? null : '3742' + Math.floor(Math.random() * 90000000 + 10000000),
          tdsCredits: Math.round(base * 0.014),
          advanceTax: Math.round(base * 0.006),
          refundStatus: c.id === 'C003' ? '—' : 'Processed — credited',
          outstandingDemand: c.id === 'C006' ? 'Rs. 6,42,880 (AY 2024-25)' : 'Nil',
          incomeHistory: [
            { ay: 'AY 2023-24', income: Math.round(base * 0.72), tax: Math.round(base * 0.72 * 0.14) },
            { ay: 'AY 2024-25', income: Math.round(base * 0.85), tax: Math.round(base * 0.85 * 0.15) },
            { ay: 'AY 2025-26', income: Math.round(base * 0.94), tax: Math.round(base * 0.94 * 0.15) },
            { ay: currentAY(), income: base, tax: Math.round(base * 0.16) }
          ],
          highValue: [
            { type: 'Cash deposit in savings account', amount: Math.round(base * 0.04) },
            { type: 'Interest from banks', amount: Math.round(base * 0.011) },
            { type: 'Purchase of immovable property', amount: c.id === 'C002' ? 4500000 : 0 }
          ].filter(function (h) { return h.amount > 0; })
        });
      }, 1100 + Math.random() * 800);
    });
  }

  function sendOtp() {
    return new Promise(function (resolve) {
      setTimeout(function () { resolve({ sent: true, hint: 'OTP sent to the client’s registered mobile' }); }, 800);
    });
  }

  function logSync(source, clientId, action, result, by) {
    db.syncLog.unshift({ id: 'SY' + Date.now(), at: new Date().toISOString(),
      source: source, clientId: clientId, action: action, result: result, by: by });
    save();
  }

  /* ---------------- Applicability engine ---------------- */
  /* Derives statutory obligations from the turnover fetched above —
     the payoff of integrating with the government portals. */
  function applicability(c) {
    var t = c.turnoverValue || 0, out = [];
    if (c.gstin) {
      out.push({ ok: t > 50000000, text: 'e-Invoicing (turnover above Rs. 5 crore)',
                 note: t > 50000000 ? 'Applicable — mandatory' : 'Not applicable at current turnover' });
      out.push({ ok: t > 20000000, text: 'GSTR-9 annual return (above Rs. 2 crore)',
                 note: t > 20000000 ? 'Applicable' : 'Optional' });
      out.push({ ok: t > 50000000, text: 'GSTR-9C reconciliation (above Rs. 5 crore)',
                 note: t > 50000000 ? 'Applicable — self-certified' : 'Not applicable' });
      out.push({ ok: t <= 50000000, text: 'QRMP scheme eligibility (up to Rs. 5 crore)',
                 note: t <= 50000000 ? 'Eligible' : 'Not eligible — monthly filing mandatory' });
    }
    out.push({ ok: t > 10000000, text: 'Tax audit under Sec 44AB (business above Rs. 1 crore)',
               note: t > 10000000 ? 'Applicable — subject to cash-transaction relaxation' : 'Not applicable' });
    out.push({ ok: t > 100000000, text: 'TDS under Sec 194Q on purchases (above Rs. 10 crore)',
               note: t > 100000000 ? 'Applicable' : 'Not applicable' });
    if (c.type === 'Private Limited' || c.type === 'LLP') {
      out.push({ ok: true, text: 'ROC annual filings (AOC-4 / MGT-7 or Form 8 / 11)', note: 'Applicable' });
    }
    return out;
  }

  /* ---------------- Session ---------------- */
  var SKEY = 'kvksn.session';
  function login(userId) { localStorage.setItem(SKEY, userId); }
  function logout() { localStorage.removeItem(SKEY); }
  function session() { return localStorage.getItem(SKEY); }

  /* ---------------- Export ---------------- */
  global.Store = {
    KEY: KEY, STATUS: STATUS, STATUS_ORDER: STATUS_ORDER,
    load: load, save: save, reset: reset,
    get db() { return db; },
    client: client, staff: staff, service: service, job: job, actorName: actorName,
    jobsFor: jobsFor, jobsOf: jobsOf, openJobs: openJobs,
    checklistDone: checklistDone, overdue: overdue, daysLeft: daysLeft,
    addTimeline: addTimeline, notify: notify, autoAssign: autoAssign,
    createJob: createJob, setStatus: setStatus, uploadDoc: uploadDoc,
    releaseDeliverables: releaseDeliverables, raiseInvoice: raiseInvoice,
    gstSearch: gstSearch, gstFilingStatus: gstFilingStatus, itFetch: itFetch,
    sendOtp: sendOtp, logSync: logSync, applicability: applicability,
    login: login, logout: logout, session: session,
    periodOf: periodOf, currentFY: currentFY, prevFY: prevFY, currentAY: currentAY,
    today: today, isoOf: isoOf, addDays: addDays, rel: rel
  };
})(window);
