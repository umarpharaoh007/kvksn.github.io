/* ============================================================
   KVKSN & Co. — Statutory Due Date Engine
   Generates GST / Income Tax / TDS / ROC / Labour due dates
   for any month or year from a rule set. Works fully offline.

   NOTE: Dates are the standard statutory dates. Government
   extensions are notified from time to time — the firm should
   verify against the latest CBIC / CBDT / MCA notification.
   ============================================================ */
(function (global) {
  'use strict';

  var CATS = {
    gst:    { label: 'GST',          color: '#2E8C87', soft: '#DCF1EF' },
    it:     { label: 'Income Tax',   color: '#1E6B45', soft: '#DCF0E3' },
    tds:    { label: 'TDS / TCS',    color: '#C8922E', soft: '#FBEBC9' },
    roc:    { label: 'ROC / MCA',    color: '#5A4FCF', soft: '#E5E3FA' },
    labour: { label: 'PF / ESI / PT', color: '#8A5A44', soft: '#F3E5DE' }
  };

  var MON = ['January','February','March','April','May','June',
             'July','August','September','October','November','December'];
  var MON_S = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  /* --- Rule set -------------------------------------------------
     freq.type:
       'monthly'   -> day, optional override {monthIndex: day}
       'months'    -> months:[1..12], day
       'annual'    -> month, day
     period(): human label for the tax period the filing relates to
  ---------------------------------------------------------------- */
  var RULES = [
    /* ---------------- GST ---------------- */
    { id:'gstr7',  cat:'gst', form:'GSTR-7',  title:'GST TDS return',
      who:'Deductors under Sec 51', freq:{type:'monthly', day:10}, back:1,
      desc:'Return of tax deducted at source under GST.' },
    { id:'gstr8',  cat:'gst', form:'GSTR-8',  title:'GST TCS return',
      who:'E-commerce operators', freq:{type:'monthly', day:10}, back:1,
      desc:'Statement of tax collected at source by e-commerce operators.' },
    { id:'gstr1m', cat:'gst', form:'GSTR-1',  title:'Outward supplies (monthly)',
      who:'Turnover above Rs. 5 crore / monthly filers', freq:{type:'monthly', day:11}, back:1,
      desc:'Invoice-wise details of outward supplies for the month.' },
    { id:'iff',    cat:'gst', form:'IFF',     title:'Invoice Furnishing Facility',
      who:'QRMP taxpayers (optional, months 1 & 2)', freq:{type:'months', months:[2,3,5,6,8,9,11,12], day:13}, back:1,
      desc:'Optional upload of B2B invoices for the first two months of a quarter.' },
    { id:'gstr6',  cat:'gst', form:'GSTR-6',  title:'Input Service Distributor return',
      who:'ISD registrations', freq:{type:'monthly', day:13}, back:1,
      desc:'Distribution of input tax credit by an Input Service Distributor.' },
    { id:'gstr1q', cat:'gst', form:'GSTR-1',  title:'Outward supplies (quarterly)',
      who:'QRMP taxpayers', freq:{type:'months', months:[1,4,7,10], day:13}, back:'quarter',
      desc:'Quarterly statement of outward supplies under the QRMP scheme.' },
    { id:'cmp08',  cat:'gst', form:'CMP-08',  title:'Composition tax payment',
      who:'Composition dealers', freq:{type:'months', months:[1,4,7,10], day:18}, back:'quarter',
      desc:'Quarterly statement-cum-challan of self-assessed tax.' },
    { id:'gstr3bm',cat:'gst', form:'GSTR-3B', title:'Summary return & tax payment (monthly)',
      who:'Monthly filers', freq:{type:'monthly', day:20}, back:1,
      desc:'Summary return with payment of net GST liability.' },
    { id:'gstr5a', cat:'gst', form:'GSTR-5A', title:'OIDAR return',
      who:'Non-resident OIDAR service providers', freq:{type:'monthly', day:20}, back:1,
      desc:'Return for online information and database access services.' },
    { id:'gstr3bq',cat:'gst', form:'GSTR-3B', title:'Summary return (quarterly, QRMP)',
      who:'QRMP filers — Andhra Pradesh & other Category X states', freq:{type:'months', months:[1,4,7,10], day:22}, back:'quarter',
      desc:'Quarterly summary return. Due 22nd for AP; 24th for Category Y states.' },
    { id:'pmt06',  cat:'gst', form:'PMT-06',  title:'QRMP monthly tax payment',
      who:'QRMP taxpayers (months 1 & 2 of quarter)', freq:{type:'months', months:[2,3,5,6,8,9,11,12], day:25}, back:1,
      desc:'Monthly deposit of tax under the QRMP scheme.' },
    { id:'itc04',  cat:'gst', form:'ITC-04',  title:'Job work declaration',
      who:'Principals sending goods for job work', freq:{type:'months', months:[4,10], day:25}, back:'half',
      desc:'Details of goods sent to and received from a job worker.' },
    { id:'gstr4',  cat:'gst', form:'GSTR-4',  title:'Composition annual return',
      who:'Composition dealers', freq:{type:'annual', month:6, day:30}, back:'fyprev',
      desc:'Annual return for taxpayers under the composition scheme.' },
    { id:'lut',    cat:'gst', form:'LUT',     title:'Letter of Undertaking renewal',
      who:'Exporters supplying without payment of IGST', freq:{type:'annual', month:3, day:31}, back:'fynext',
      desc:'Fresh LUT must be filed for every financial year.' },
    { id:'gstr9',  cat:'gst', form:'GSTR-9 / 9C', title:'GST annual return & reconciliation',
      who:'Turnover above Rs. 2 crore (9C above Rs. 5 crore)', freq:{type:'annual', month:12, day:31}, back:'fyprev',
      desc:'Annual return and the reconciliation statement certified where applicable.' },

    /* ---------------- TDS / TCS ---------------- */
    { id:'tdspay', cat:'tds', form:'Challan ITNS-281', title:'TDS / TCS deposit',
      who:'All deductors and collectors', freq:{type:'monthly', day:7, override:{4:30}}, back:1,
      desc:'Deposit of tax deducted or collected. For March, the due date is 30 April.' },
    { id:'f26qb',  cat:'tds', form:'26QB / 26QC / 26QD', title:'TDS on property, rent & contracts',
      who:'Individuals deducting under 194-IA / 194-IB / 194M', freq:{type:'monthly', day:30}, back:1,
      desc:'Challan-cum-statement for one-off TDS deductions.' },
    { id:'tcsret', cat:'tds', form:'27EQ', title:'Quarterly TCS return',
      who:'Tax collectors', freq:{type:'months', months:[1,5,7,10], day:15}, back:'quarterFY',
      desc:'Quarterly statement of tax collected at source.' },
    { id:'f16a',   cat:'tds', form:'Form 16A', title:'TDS certificate (non-salary)',
      who:'All deductors', freq:{type:'months', months:[2,6,8,11], day:15}, back:'quarterFY',
      desc:'Issue of quarterly TDS certificates to deductees.' },
    { id:'f16',    cat:'tds', form:'Form 16', title:'Salary TDS certificate',
      who:'Employers', freq:{type:'annual', month:6, day:15}, back:'fyprev',
      desc:'Annual salary TDS certificate to be issued to every employee.' },
    { id:'tdsret', cat:'tds', form:'24Q / 26Q / 27Q', title:'Quarterly TDS return',
      who:'All deductors', freq:{type:'months', months:[1,5,7,10], day:31, dayByMonth:{1:31,5:31,7:31,10:31}}, back:'quarterFY',
      desc:'Quarterly statement of tax deducted at source.' },

    /* ---------------- Income Tax ---------------- */
    { id:'adv1',   cat:'it', form:'Advance Tax', title:'First instalment — 15%',
      who:'All assessees with tax liability above Rs. 10,000', freq:{type:'annual', month:6, day:15}, back:'fy',
      desc:'15% of the estimated annual tax liability.' },
    { id:'adv2',   cat:'it', form:'Advance Tax', title:'Second instalment — 45%',
      who:'All assessees', freq:{type:'annual', month:9, day:15}, back:'fy',
      desc:'Cumulative 45% of estimated tax liability.' },
    { id:'adv3',   cat:'it', form:'Advance Tax', title:'Third instalment — 75%',
      who:'All assessees', freq:{type:'annual', month:12, day:15}, back:'fy',
      desc:'Cumulative 75% of estimated tax liability.' },
    { id:'adv4',   cat:'it', form:'Advance Tax', title:'Fourth instalment — 100%',
      who:'All assessees (presumptive: single instalment)', freq:{type:'annual', month:3, day:15}, back:'fy',
      desc:'Full estimated tax liability to be paid by this date.' },
    { id:'sft',    cat:'it', form:'Form 61A', title:'Statement of Financial Transactions',
      who:'Banks, sub-registrars, companies & other reporting entities', freq:{type:'annual', month:5, day:31}, back:'fyprev',
      desc:'Annual SFT reporting of specified high-value transactions.' },
    { id:'itr',    cat:'it', form:'ITR-1 / ITR-2', title:'Income tax return — salaried & no business income',
      who:'Individuals and HUFs without business or professional income', freq:{type:'annual', month:7, day:31}, back:'ay',
      desc:'Statutory due date. Watch for CBDT extension notifications.' },
    { id:'itrbiz', cat:'it', form:'ITR-3 / 4 / 5 / 7', title:'Income tax return — business, non-audit',
      who:'Assessees with business or professional income, not subject to audit', freq:{type:'annual', month:7, day:31}, back:'ay',
      desc:'Return of income where accounts are not required to be audited under the Income-tax Act, 1961.' },
    { id:'f10b',   cat:'it', form:'Form 10B / 10BB', title:'Trust audit report',
      who:'Charitable trusts and institutions', freq:{type:'annual', month:9, day:30}, back:'ay',
      desc:'Audit report of a trust claiming exemption under Sec 11/12.' },
    { id:'3cd',    cat:'it', form:'3CA / 3CB-3CD', title:'Tax audit report',
      who:'Assessees covered by Sec 44AB', freq:{type:'annual', month:9, day:30}, back:'ay',
      desc:'Tax audit report to be uploaded and accepted by the assessee.' },
    { id:'itraud', cat:'it', form:'ITR — audit cases', title:'Income tax return — audit cases',
      who:'Companies and assessees liable to tax audit', freq:{type:'annual', month:10, day:31}, back:'ay',
      desc:'Return of income where accounts are required to be audited.' },
    { id:'3ceb',   cat:'it', form:'Form 3CEB', title:'Transfer pricing report',
      who:'Assessees with international / specified domestic transactions', freq:{type:'annual', month:10, day:31}, back:'ay',
      desc:'Accountant’s report on transfer pricing under Sec 92E.' },
    { id:'itrtp',  cat:'it', form:'ITR — TP cases', title:'Income tax return — transfer pricing',
      who:'Assessees filing Form 3CEB', freq:{type:'annual', month:11, day:30}, back:'ay',
      desc:'Return of income for assessees covered by Sec 92E.' },
    { id:'belated',cat:'it', form:'Belated / Revised ITR', title:'Belated & revised return',
      who:'Anyone who missed or needs to revise a return', freq:{type:'annual', month:12, day:31}, back:'ay',
      desc:'Last date to file a belated return or revise a filed return.' },
    { id:'itru',   cat:'it', form:'ITR-U', title:'Updated return window',
      who:'Assessees updating an earlier year', freq:{type:'annual', month:3, day:31}, back:'ayu',
      desc:'Updated return with additional tax under Sec 139(8A).' },

    /* ---------------- ROC / MCA ---------------- */
    { id:'msme1a', cat:'roc', form:'MSME-1', title:'Half-yearly MSME return',
      who:'Companies with dues to MSME vendors beyond 45 days', freq:{type:'months', months:[4,10], day:30, dayByMonth:{4:30,10:31}}, back:'half',
      desc:'Return of outstanding payments to micro and small enterprises.' },
    { id:'llp11',  cat:'roc', form:'LLP Form 11', title:'LLP annual return',
      who:'All LLPs', freq:{type:'annual', month:5, day:30}, back:'fyprev',
      desc:'Annual return of the LLP for the preceding financial year.' },
    { id:'pas6',   cat:'roc', form:'PAS-6', title:'Reconciliation of share capital',
      who:'Unlisted public companies', freq:{type:'months', months:[5,11], day:30, dayByMonth:{5:30,11:29}}, back:'half',
      desc:'Half-yearly audit report on reconciliation of share capital.' },
    { id:'dpt3',   cat:'roc', form:'DPT-3', title:'Return of deposits',
      who:'All companies (except government companies)', freq:{type:'annual', month:6, day:30}, back:'fyprev',
      desc:'Return of deposits and outstanding receipt of money.' },
    { id:'dir3',   cat:'roc', form:'DIR-3 KYC', title:'Director KYC',
      who:'Every person holding a DIN', freq:{type:'annual', month:9, day:30}, back:'fyprev',
      desc:'Annual KYC of directors. Late filing attracts a Rs. 5,000 fee.' },
    { id:'adt1',   cat:'roc', form:'ADT-1', title:'Auditor appointment intimation',
      who:'Companies appointing / reappointing auditors', freq:{type:'annual', month:10, day:14}, back:'fy',
      desc:'Intimation of auditor appointment within 15 days of the AGM.' },
    { id:'aoc4',   cat:'roc', form:'AOC-4', title:'Filing of financial statements',
      who:'All companies', freq:{type:'annual', month:10, day:30}, back:'fyprev',
      desc:'Within 30 days of the AGM. XBRL where applicable.' },
    { id:'llp8',   cat:'roc', form:'LLP Form 8', title:'Statement of Account & Solvency',
      who:'All LLPs', freq:{type:'annual', month:10, day:30}, back:'fyprev',
      desc:'Annual statement of account and solvency of the LLP.' },
    { id:'mgt7',   cat:'roc', form:'MGT-7 / 7A', title:'Annual return',
      who:'All companies (7A for OPC & small companies)', freq:{type:'annual', month:11, day:29}, back:'fyprev',
      desc:'Within 60 days of the AGM.' },
    { id:'agm',    cat:'roc', form:'AGM', title:'Annual General Meeting',
      who:'All companies (other than OPC)', freq:{type:'annual', month:9, day:30}, back:'fyprev',
      desc:'Last date to hold the AGM for the financial year just closed. AOC-4 and MGT-7 deadlines run from this date.' },
    { id:'csr2',   cat:'roc', form:'CSR-2', title:'CSR reporting',
      who:'Companies covered by Sec 135', freq:{type:'annual', month:3, day:31}, back:'fyprev',
      desc:'Report on corporate social responsibility for the preceding financial year.' },

    /* ---------------- Income Tax — trusts & donations ---------------- */
    { id:'f10bd',  cat:'it', form:'Form 10BD', title:'Statement of donations',
      who:'Trusts and institutions approved under Sec 80G / 35', freq:{type:'annual', month:5, day:31}, back:'fyprev',
      desc:'Statement of donations received, followed by Form 10BE certificates to donors.' },

    /* ---------------- Labour ---------------- */
    { id:'pfesi',  cat:'labour', form:'ECR / ESIC', title:'PF & ESI contribution',
      who:'All covered employers', freq:{type:'monthly', day:15}, back:1,
      desc:'Deposit of provident fund and employee state insurance contributions.' },
    { id:'pt',     cat:'labour', form:'Professional Tax', title:'PT payment & return (AP)',
      who:'Employers registered in Andhra Pradesh', freq:{type:'monthly', day:10}, back:1,
      desc:'Monthly professional tax payment and return in Andhra Pradesh.' }
  ];

  /* ---------------------------------------------------------------
     NOTIFIED EXTENSIONS
     The government moves due dates from time to time. Each entry
     re-points one rule's occurrence to the date actually notified.

     Key    : '<ruleId>@<year>-<month it would normally fall in>'
     Value  : the date it was moved to, plus a short note.

     Add a line here whenever CBDT / CBIC / MCA notifies a change —
     the calendar picks it up everywhere with no other edits.
  --------------------------------------------------------------- */
  var EXTENSIONS = {
    'itrbiz@2026-7': { year: 2026, month: 8, day: 31,
      note: 'Extended from 31 July 2026 to 31 August 2026 for AY 2026-27.' }
  };

  /* ---------- helpers ---------- */
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function iso(y, m, d) { return y + '-' + pad(m) + '-' + pad(d); }

  function fyLabel(y) { return 'FY ' + y + '-' + pad((y + 1) % 100); }
  function ayLabel(y) { return 'AY ' + y + '-' + pad((y + 1) % 100); }

  // financial year in which a calendar date falls (Apr–Mar)
  function fyOf(y, m) { return m >= 4 ? y : y - 1; }

  // Calendar quarter that just closed, for filings due in Jan/Apr/Jul/Oct
  var QMAP = { 1: ['Oct–Dec', -1], 4: ['Jan–Mar', 0], 7: ['Apr–Jun', 0], 10: ['Jul–Sep', 0] };
  // TDS/TCS quarters keyed by the month the filing falls due in
  var TDSQ = { 5: 'Q4 (Jan–Mar)', 6: 'Q4 (Jan–Mar)', 7: 'Q1 (Apr–Jun)', 8: 'Q1 (Apr–Jun)',
               10: 'Q2 (Jul–Sep)', 11: 'Q2 (Jul–Sep)', 1: 'Q3 (Oct–Dec)', 2: 'Q3 (Oct–Dec)' };

  function periodLabel(rule, y, m) {
    var b = rule.back;
    switch (b) {
      case 1: {                                   // the month just ended
        var pm = m === 1 ? 12 : m - 1, py = m === 1 ? y - 1 : y;
        return MON_S[pm - 1] + ' ' + py;
      }
      case 'quarter': {                           // GST quarter just ended
        var q = QMAP[m]; if (!q) return '';
        return q[0] + ' ' + (y + q[1]);
      }
      case 'quarterFY': {                         // TDS / TCS quarter
        var fy = (m <= 6) ? y - 1 : y;            // Jan, Feb, May, Jun close the prior FY
        return (TDSQ[m] || '') + ' · ' + fyLabel(fy);
      }
      case 'half':
        return (m <= 6 ? 'Oct–Mar' : 'Apr–Sep') + ' · ' + fyLabel(m <= 6 ? y - 1 : y);
      case 'fy':     return fyLabel(fyOf(y, m));            // the FY in progress
      case 'fynext': return fyLabel(y);                     // the FY about to begin
      case 'fyprev': return fyLabel(fyOf(y, m) - 1);        // the FY just closed
      case 'ay':     return ayLabel(m <= 3 ? y - 1 : y);
      case 'ayu':    return 'Earlier assessment years (up to 4 years)';
      default:       return '';
    }
  }

  function dayFor(rule, m) {
    var f = rule.freq;
    if (f.override && f.override[m]) return f.override[m];
    if (f.dayByMonth && f.dayByMonth[m]) return f.dayByMonth[m];
    return f.day;
  }

  function fires(rule, m) {
    var f = rule.freq;
    if (f.type === 'monthly') return true;
    if (f.type === 'months')  return f.months.indexOf(m) !== -1;
    if (f.type === 'annual')  return f.month === m;
    return false;
  }

  /** Events a rule set produces in one month, before extensions are applied. */
  function rawEvents(year, month) {
    var out = [];
    RULES.forEach(function (r) {
      if (!fires(r, month)) return;
      var d = dayFor(r, month);
      var maxD = new Date(year, month, 0).getDate();
      if (d > maxD) d = maxD;

      var y = year, m = month, extended = null;
      var ext = EXTENSIONS[r.id + '@' + year + '-' + month];
      if (ext) {
        extended = { from: iso(year, month, d), note: ext.note };
        y = ext.year; m = ext.month; d = ext.day;
      }

      out.push({
        key: r.id + '-' + year + '-' + month,
        ruleId: r.id,
        date: iso(y, m, d),
        day: d, month: m, year: y,
        cat: r.cat, catLabel: CATS[r.cat].label, color: CATS[r.cat].color, soft: CATS[r.cat].soft,
        form: r.form, title: r.title, who: r.who, desc: r.desc,
        period: periodLabel(r, year, month),
        extended: extended
      });
    });
    return out;
  }

  /** All due-date events falling in a given calendar month, extensions applied. */
  function eventsForMonth(year, month) {
    var out = [];
    // Scan a window either side, because an extension can move a date
    // into this month from a neighbouring one (or out of it).
    for (var off = -3; off <= 3; off++) {
      var y = year, m = month + off;
      while (m < 1) { m += 12; y--; }
      while (m > 12) { m -= 12; y++; }
      rawEvents(y, m).forEach(function (e) {
        if (e.year === year && e.month === month) out.push(e);
      });
    }
    return out.sort(function (a, b) { return a.day - b.day || a.cat.localeCompare(b.cat); });
  }

  /** Every due date in a financial year (1 April yStart – 31 March yStart+1),
      grouped by category. Powers the "year view" list. */
  function eventsForFY(fyStart) {
    var groups = {};
    Object.keys(CATS).forEach(function (k) { groups[k] = []; });
    for (var i = 0; i < 12; i++) {
      var m = ((3 + i) % 12) + 1;             // Apr .. Mar
      var y = (3 + i) < 12 ? fyStart : fyStart + 1;
      eventsForMonth(y, m).forEach(function (e) { groups[e.cat].push(e); });
    }
    Object.keys(groups).forEach(function (k) {
      groups[k].sort(function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : 0; });
    });
    return groups;
  }

  /** Events between two Date objects (inclusive). */
  function eventsBetween(from, to) {
    var out = [], y = from.getFullYear(), m = from.getMonth() + 1;
    var endKey = to.getFullYear() * 12 + to.getMonth();
    while (y * 12 + (m - 1) <= endKey) {
      eventsForMonth(y, m).forEach(function (e) {
        var d = new Date(e.year, e.month - 1, e.day);
        if (d >= stripTime(from) && d <= stripTime(to)) out.push(e);
      });
      m++; if (m > 12) { m = 1; y++; }
    }
    return out.sort(function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : 0; });
  }

  function stripTime(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }

  /** Next N upcoming events from today (or a given date). */
  function upcoming(n, fromDate) {
    var from = stripTime(fromDate || new Date());
    var to = new Date(from.getFullYear(), from.getMonth() + 4, from.getDate());
    return eventsBetween(from, to).slice(0, n || 8);
  }

  function daysUntil(isoDate, fromDate) {
    var p = isoDate.split('-');
    var d = new Date(+p[0], +p[1] - 1, +p[2]);
    var f = stripTime(fromDate || new Date());
    return Math.round((d - f) / 86400000);
  }

  global.DueDates = {
    CATS: CATS, MONTHS: MON, MONTHS_SHORT: MON_S, RULES: RULES, EXTENSIONS: EXTENSIONS,
    eventsForMonth: eventsForMonth,
    eventsForFY: eventsForFY,
    eventsBetween: eventsBetween,
    upcoming: upcoming,
    daysUntil: daysUntil,
    fyLabel: fyLabel, ayLabel: ayLabel,
    fmt: function (isoDate) {
      var p = isoDate.split('-');
      return (+p[2]) + ' ' + MON_S[+p[1] - 1] + ' ' + p[0];
    }
  };
})(window);
