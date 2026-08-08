/* ================================================================
   KVKSN & Co. — PRACTICE MANAGEMENT CONSOLE (staff / partner)
   ================================================================ */
(function () {
  'use strict';

  var E = UI.esc, app = document.getElementById('app');
  var me = null;                          // logged-in staff record
  var isPartner = function () { return me && me.role === 'partner'; };

  Store.load();

  function boot() {
    var sid = Store.session();
    if (sid && sid.charAt(0) === 'S' && Store.staff(sid)) {
      me = Store.staff(sid);
      renderShell(); route();
    } else {
      renderLogin();
    }
  }
  window.addEventListener('hashchange', function () { if (me) route(); });

  /* ---- jobs visible to the logged-in user ---- */
  function visibleJobs() {
    return isPartner() ? Store.db.jobs
                       : Store.db.jobs.filter(function (j) { return j.assignedTo === me.id || j.reviewer === me.id; });
  }

  /* ================= LOGIN ================= */
  function renderLogin() {
    app.innerHTML =
    '<div class="login-wrap">' +
      '<div class="login-art">' +
        '<div>' +
          '<div class="login-brand">' +
            '<img data-logo="light" src="assets/img/ca-india-light.png" alt="CA India">' +
            '<span><b>KVKSN <span class="amp">&amp;</span> CO.</b><span class="sub-line">Practice Console</span></span>' +
          '</div>' +
          '<h1>Every job, every client, every due date — on one board</h1>' +
          '<p>Assign work, track document pendency, review before release and watch the whole firm\'s compliance position in real time.</p>' +
          '<ul class="login-feats">' +
            '<li><span class="tick">&#10003;</span> Job board with automatic assignment and maker-checker review</li>' +
            '<li><span class="tick">&#10003;</span> Firm-wide GST and income tax filing status tracker</li>' +
            '<li><span class="tick">&#10003;</span> Government portal sync — GSTIN lookup, 26AS, AIS, MCA</li>' +
            '<li><span class="tick">&#10003;</span> Billing, staff workload and partner reports</li>' +
          '</ul>' +
        '</div>' +
        '<div class="login-foot">Restricted access. Staff members see only the work assigned to them.</div>' +
      '</div>' +
      '<div class="login-panel"><div class="login-box">' +
        '<h2 class="display">Staff Login</h2>' +
        '<div class="sub">Practice management console for KVKSN &amp; Co.</div>' +
        '<div class="field"><label for="lgEmail">Email</label><input id="lgEmail" type="text" placeholder="ramesh@kvksn.in"></div>' +
        '<div class="field"><label for="lgPass">Password</label><input id="lgPass" type="password" placeholder="demo"></div>' +
        '<button class="btn btn-primary btn-block" id="lgGo" style="margin-top:6px">Sign In</button>' +
        '<div id="lgErr" style="display:none;margin-top:12px" class="alert alert-red"><span class="ic">&#9888;</span><span>Invalid credentials. Use a demo account below.</span></div>' +
        '<div class="demo-accounts"><h4>Demo accounts — click to sign in</h4>' +
          Store.db.staff.map(function (s) {
            return '<button class="acct" data-id="' + s.id + '">' + UI.avatar(s.name, s.id, 34) +
              '<span style="flex:1"><b>' + E(s.name) + '</b><span>' + E(s.desig) + ' · ' + E(s.email) + ' / demo</span></span>' +
              '<span class="tag" style="background:' + (s.role === 'partner' ? 'var(--brass-soft)' : 'var(--line-2)') + '">' +
              (s.role === 'partner' ? 'Full access' : 'Staff') + '</span></button>';
          }).join('') +
        '</div>' +
        '<div class="row" style="margin-top:20px;justify-content:space-between">' +
          '<a href="index.html" class="btn btn-ghost btn-sm">&larr; Back to website</a>' +
          '<a href="portal.html" class="btn btn-ghost btn-sm">Client login &rarr;</a>' +
        '</div>' +
      '</div></div>' +
    '</div>';

    if (window.Media) Media.applyLogo(app);
    Array.prototype.forEach.call(app.querySelectorAll('.acct'), function (b) {
      b.onclick = function () { doLogin(b.dataset.id); };
    });
    function tryLogin() {
      var u = document.getElementById('lgEmail').value.trim().toLowerCase();
      var p = document.getElementById('lgPass').value;
      var f = Store.db.staff.filter(function (s) { return s.email.toLowerCase() === u && p === 'demo'; })[0];
      if (f) doLogin(f.id); else document.getElementById('lgErr').style.display = 'flex';
    }
    document.getElementById('lgGo').onclick = tryLogin;
    document.getElementById('lgPass').addEventListener('keydown', function (e) { if (e.key === 'Enter') tryLogin(); });
  }

  function doLogin(id) {
    Store.login(id); me = Store.staff(id);
    location.hash = '#/dashboard'; renderShell(); route();
    UI.toast('Signed in as ' + me.name, 'ok');
  }

  /* ================= SHELL ================= */
  function navItems() {
    var n = [
      { sec: 'Work' },
      { id: 'dashboard',   label: 'Dashboard',          ic: '&#9632;' },
      { id: 'jobs',        label: 'Job Board',          ic: '&#9776;' },
      { id: 'review',      label: 'Review & Release',   ic: '&#10003;', partner: true },
      { sec: 'Clients' },
      { id: 'clients',     label: 'Client Master',      ic: '&#128100;' },
      { id: 'compliance',  label: 'Compliance Tracker', ic: '&#9989;' },
      { id: 'integrations',label: 'Portal Sync',        ic: '&#8645;' },
      { sec: 'Firm' },
      { id: 'billing',     label: 'Billing',            ic: '&#8377;', partner: true },
      { id: 'staff',       label: 'Team & Workload',    ic: '&#128101;', partner: true },
      { id: 'leads',       label: 'Enquiries',          ic: '&#9993;', partner: true },
      { id: 'reports',     label: 'Reports',            ic: '&#128202;', partner: true },
      { id: 'calendar',    label: 'Due Date Calendar',  ic: '&#128197;' },
      { sec: 'Website' },
      { id: 'media',       label: 'Website Media',      ic: '&#128247;', partner: true }
    ];
    return n.filter(function (x) { return !x.partner || isPartner(); });
  }

  function renderShell() {
    app.innerHTML =
    '<div class="app">' +
      '<aside class="sidebar" id="sb">' +
        '<div class="sb-brand"><img data-logo="light" src="assets/img/ca-india-light.png" alt="CA India">' +
          '<span><b>KVKSN <span class="amp">&amp;</span> CO.</b><span class="sub-line">Practice Console</span></span></div>' +
        '<div class="sb-user">' + UI.avatar(me.name, me.id, 38) +
          '<span style="min-width:0"><b>' + E(me.name) + '</b><span>' + E(me.desig) + '</span></span></div>' +
        '<nav class="sb-nav" id="sbnav"></nav>' +
        '<div class="sb-foot">' +
          '<button id="btnReset">Reset demo data</button>' +
          '<button id="btnOut">Sign out</button>' +
        '</div>' +
      '</aside>' +
      '<div class="sb-scrim" id="sbScrim"></div>' +
      '<div class="main">' +
        '<header class="topbar">' +
          '<div class="row"><button class="mobile-toggle" id="mt">&#9776;</button>' +
            '<div><div class="crumb" id="crumb">Practice Console</div><h1 id="ptitle">Dashboard</h1></div></div>' +
          '<div class="topbar-actions" id="tact"></div>' +
        '</header>' +
        '<div class="content" id="view"></div>' +
      '</div>' +
    '</div>';

    document.getElementById('btnOut').onclick = function () { Store.logout(); me = null; location.hash = ''; renderLogin(); };
    document.getElementById('mt').onclick = function () { document.getElementById('sb').classList.toggle('on'); };
    document.getElementById('sbScrim').onclick = function () { document.getElementById('sb').classList.remove('on'); };
    if (window.Media) Media.applyLogo(app);
    document.getElementById('btnReset').onclick = function () {
      UI.confirm('Reset demo data?',
        'This restores the original demo clients, jobs, documents and invoices. Anything you changed in this session will be lost.',
        'Reset', function () { Store.reset(); UI.toast('Demo data reset', 'ok'); route(); }, 'btn-red');
    };
    renderNav();
  }

  function renderNav() {
    var jobs = visibleJobs();
    var cur = (location.hash.replace('#/', '') || 'dashboard').split('/')[0];
    var counts = {
      jobs: jobs.filter(function (j) { return j.status !== 'completed'; }).length,
      review: Store.db.jobs.filter(function (j) { return j.status === 'under_review' || j.status === 'ready'; }).length,
      leads: Store.db.leads.filter(function (l) { return l.status === 'New'; }).length
    };
    document.getElementById('sbnav').innerHTML = navItems().map(function (n) {
      if (n.sec) return '<div class="sb-sec">' + E(n.sec) + '</div>';
      var c = '';
      if (n.id === 'jobs' && counts.jobs) c = '<span class="cnt">' + counts.jobs + '</span>';
      if (n.id === 'review' && counts.review) c = '<span class="cnt alert">' + counts.review + '</span>';
      if (n.id === 'leads' && counts.leads) c = '<span class="cnt alert">' + counts.leads + '</span>';
      return '<a href="#/' + n.id + '" class="' + (cur === n.id ? 'on' : '') + '">' +
        '<span class="ic">' + n.ic + '</span>' + E(n.label) + c + '</a>';
    }).join('');
  }

  /* ================= ROUTER ================= */
  var TITLES = {
    dashboard: 'Dashboard', jobs: 'Job Board', review: 'Review & Release', clients: 'Client Master',
    compliance: 'Compliance Tracker', integrations: 'Government Portal Sync', billing: 'Billing',
    staff: 'Team & Workload', leads: 'Enquiries', reports: 'Reports', calendar: 'Due Date Calendar',
    media: 'Website Media'
  };

  function route() {
    var parts = (location.hash.replace('#/', '') || 'dashboard').split('/');
    var v = parts[0];
    var map = {
      dashboard: vDashboard, jobs: vJobs, review: vReview, clients: vClients, compliance: vCompliance,
      integrations: vIntegrations, billing: vBilling, staff: vStaff, leads: vLeads,
      reports: vReports, calendar: vCalendar, media: vMedia
    };
    var fn = map[v];
    if (!fn || (navItems().filter(function (n) { return n.id === v; }).length === 0)) { fn = vDashboard; v = 'dashboard'; }
    document.getElementById('ptitle').textContent = TITLES[v] || 'Dashboard';
    document.getElementById('crumb').textContent = 'KVKSN & Co. · ' + (isPartner() ? 'Partner' : 'Staff') + ' view';
    document.getElementById('tact').innerHTML = '';
    document.getElementById('sb').classList.remove('on');
    fn(document.getElementById('view'), parts.slice(1));
    renderNav(); window.scrollTo(0, 0);
    if (parts[1] && (v === 'jobs' || v === 'review')) openJob(parts[1]);
    if (parts[1] && v === 'clients') openClient(parts[1]);
  }

  function kpi(label, val, foot, cls) {
    return '<div class="kpi ' + (cls || '') + '"><div class="lbl">' + E(label) + '</div>' +
           '<div class="val">' + E(val) + '</div><div class="foot">' + E(foot) + '</div></div>';
  }

  /* ================= DASHBOARD ================= */
  function vDashboard(v) {
    var jobs = visibleJobs();
    var open = jobs.filter(function (j) { return j.status !== 'completed'; });
    var late = open.filter(Store.overdue);
    var review = Store.db.jobs.filter(function (j) { return j.status === 'under_review' || j.status === 'ready'; });
    var waiting = open.filter(function (j) { return j.status === 'docs_pending' || j.status === 'query_raised'; });
    var billed = Store.db.invoices.filter(function (i) { return i.status !== 'Paid'; })
                      .reduce(function (s, i) { return s + i.total; }, 0);

    var html = '';

    if (late.length) {
      html += '<div class="alert alert-red"><span class="ic">&#9888;</span><span><b>' + late.length +
        ' job' + (late.length > 1 ? 's are' : ' is') + ' past the target date.</b> ' +
        late.slice(0, 3).map(function (j) { return E(j.id) + ' — ' + E(Store.client(j.clientId).name); }).join('; ') +
        (late.length > 3 ? ' and ' + (late.length - 3) + ' more.' : '') + '</span></div>';
    }

    html += '<div class="grid g-4 mb">' +
      kpi('Open Jobs', open.length, jobs.length + ' total in the system', '') +
      kpi('Past Due Date', late.length, late.length ? 'Needs immediate attention' : 'Everything on schedule', late.length ? 'k-red' : 'k-green') +
      kpi('Awaiting Client', waiting.length, 'Documents or query responses', waiting.length ? 'k-brass' : 'k-green') +
      (isPartner()
        ? kpi('Outstanding Fees', UI.shortMoney(billed), Store.db.invoices.filter(function (i) { return i.status !== 'Paid'; }).length + ' unpaid invoices', 'k-violet')
        : kpi('Assigned To Me', Store.jobsOf(me.id).filter(function (j) { return j.status !== 'completed'; }).length, 'Active jobs on your desk', 'k-violet')) +
    '</div>';

    html += '<div class="grid g-side">';

    /* left */
    html += '<div>';

    /* status distribution */
    var dist = {};
    Store.STATUS_ORDER.forEach(function (s) { dist[s] = 0; });
    jobs.forEach(function (j) { dist[j.status]++; });
    var maxD = Math.max.apply(null, Store.STATUS_ORDER.map(function (s) { return dist[s]; })) || 1;
    html += '<div class="card mb"><div class="card-h"><h3>Jobs by Stage</h3>' +
      '<span class="sub">' + jobs.length + ' jobs</span></div><div class="card-b">' +
      '<div class="chart">' + Store.STATUS_ORDER.map(function (s) {
        var st = Store.STATUS[s];
        return '<div class="col"><span class="cv">' + dist[s] + '</span>' +
          '<div class="bar2" style="height:' + Math.round(dist[s] / maxD * 100) + '%;background:' + st.color + '" ' +
          'title="' + E(st.label) + ': ' + dist[s] + '"></div>' +
          '<span class="cl">' + E(st.short) + '</span></div>';
      }).join('') + '</div></div></div>';

    /* priority queue */
    var queue = open.slice().sort(function (a, b) {
      if ((a.priority === 'High') !== (b.priority === 'High')) return a.priority === 'High' ? -1 : 1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    }).slice(0, 10);

    html += '<div class="card"><div class="card-h"><h3>Priority Queue</h3>' +
      '<a class="btn btn-ghost btn-sm" href="#/jobs">Open job board</a></div>' +
      (queue.length ? '<div class="tbl-wrap"><table class="tbl"><thead><tr>' +
        '<th>Job</th><th>Client</th><th>Status</th><th>Assigned</th><th>Due</th></tr></thead><tbody>' +
        queue.map(jobRow).join('') + '</tbody></table></div>'
        : '<div class="empty"><div class="ic">&#10003;</div><h4>Nothing open</h4><p>All jobs are complete.</p></div>') +
      '</div>';
    html += '</div>';

    /* right */
    html += '<div>';
    if (isPartner()) {
      html += '<div class="card mb"><div class="card-h"><h3>Awaiting Your Review</h3>' +
        (review.length ? '<span class="badge" style="background:var(--violet-soft);color:var(--violet)">' + review.length + '</span>' : '') +
        '</div><div class="card-b tight">' +
        (review.length ? review.map(function (j) {
          return '<div style="padding:13px 20px;border-bottom:1px solid var(--line-2)">' +
            '<div class="row between"><b style="font-size:13px">' + E(j.title) + '</b>' + UI.statusBadge(j.status) + '</div>' +
            '<div class="muted" style="font-size:12px;margin:3px 0 8px">' + E(Store.client(j.clientId).name) +
            ' · prepared by ' + E(Store.actorName(j.assignedTo)) + '</div>' +
            '<button class="btn btn-teal btn-sm" data-job="' + j.id + '">Review now</button></div>';
        }).join('') : '<p class="muted" style="padding:16px 20px;font-size:13px">Nothing waiting for review.</p>') +
        '</div></div>';
    }

    html += '<div class="card mb"><div class="card-h"><h3>Firm Due Dates</h3>' +
      '<a class="btn btn-ghost btn-sm" href="#/calendar">All</a></div><div class="card-b tight">' +
      DueDates.upcoming(6).map(function (e) {
        var d = DueDates.daysUntil(e.date);
        return '<div style="display:flex;gap:12px;padding:11px 20px;border-bottom:1px solid var(--line-2);align-items:center">' +
          '<div style="width:44px;text-align:center;border:1px solid ' + e.color + ';border-radius:3px;padding:3px 0;flex-shrink:0">' +
          '<b class="display" style="display:block;font-size:1.05rem;line-height:1">' + parseInt(e.date.split('-')[2], 10) + '</b>' +
          '<span class="mono" style="font-size:9px;text-transform:uppercase;color:var(--ink-mute)">' +
          UI.MON[parseInt(e.date.split('-')[1], 10) - 1] + '</span></div>' +
          '<div style="flex:1;min-width:0"><b style="font-size:12.5px">' + E(e.form) + '</b>' +
          '<div class="muted" style="font-size:11.5px">' + E(e.title) + '</div></div>' +
          '<span class="mono" style="font-size:11px;color:' + (d <= 3 ? 'var(--red)' : 'var(--ink-mute)') + '">' +
          (d === 0 ? 'TODAY' : d + 'd') + '</span></div>';
      }).join('') + '</div></div>';

    var acts = [];
    jobs.forEach(function (j) { j.timeline.forEach(function (t) { acts.push({ t: t, j: j }); }); });
    acts.sort(function (a, b) { return new Date(b.t.at) - new Date(a.t.at); });
    html += '<div class="card"><div class="card-h"><h3>Activity Feed</h3></div><div class="card-b"><div class="tline">' +
      acts.slice(0, 10).map(function (a) {
        var isSys = a.t.by === 'system', isCli = a.t.by.charAt(0) === 'C';
        return '<div class="tline-i ' + (isSys ? 'sys' : isCli ? 'cli' : '') + '">' +
          '<div class="a">' + E(a.t.action) + '</div>' +
          '<div class="m">' + E(Store.actorName(a.t.by)) + ' · ' + UI.fmtDateTime(a.t.at) + '</div>' +
          '<div class="n">' + E(a.j.id) + ' · ' + E(Store.client(a.j.clientId).name) + '</div></div>';
      }).join('') + '</div></div></div>';
    html += '</div></div>';

    v.innerHTML = html;
    wireJobs(v);
  }

  function jobRow(j) {
    var c = Store.client(j.clientId), st = Store.staff(j.assignedTo);
    return '<tr class="clickable" data-job="' + j.id + '">' +
      '<td><b>' + E(j.title) + '</b><div class="muted mono" style="font-size:11px">' + E(j.id) +
        (j.priority === 'High' ? ' <span class="tag prio-High">High</span>' : '') + '</div></td>' +
      '<td>' + E(c.name) + '<div class="muted" style="font-size:11px">' + E(c.code) + '</div></td>' +
      '<td>' + UI.statusBadge(j.status) + '</td>' +
      '<td>' + (st ? '<div class="row" style="gap:7px;flex-wrap:nowrap">' + UI.avatar(st.name, st.id, 24) +
        '<span style="font-size:12.5px">' + E(st.name.replace('CA ', '')) + '</span></div>' : '<span class="muted">—</span>') + '</td>' +
      '<td>' + UI.fmtDate(j.dueDate) + '<div style="margin-top:3px">' + UI.dueBadge(j) + '</div></td></tr>';
  }

  function wireJobs(root) {
    Array.prototype.forEach.call(root.querySelectorAll('[data-job]'), function (n) {
      n.onclick = function (e) { e.stopPropagation(); openJob(n.dataset.job); };
    });
    Array.prototype.forEach.call(root.querySelectorAll('[data-client]'), function (n) {
      n.onclick = function (e) { e.stopPropagation(); openClient(n.dataset.client); };
    });
  }

  /* ================= JOB BOARD ================= */
  function vJobs(v) {
    var mode = sessionStorage.getItem('kvksn.jobview') || 'board';
    document.getElementById('tact').innerHTML =
      '<div class="seg" id="segm"><button data-m="board"' + (mode === 'board' ? ' class="on"' : '') + '>Board</button>' +
      '<button data-m="table"' + (mode === 'table' ? ' class="on"' : '') + '>Table</button></div>' +
      '<button class="btn btn-brass btn-sm" id="newJob">+ New Job</button>';

    v.innerHTML =
      '<div class="filters">' +
        '<input type="search" id="q" placeholder="Search job, client or category…">' +
        '<select id="fc"><option value="">All clients</option>' +
          Store.db.clients.map(function (c) { return '<option value="' + c.id + '">' + E(c.name) + '</option>'; }).join('') +
        '</select>' +
        '<select id="fa"><option value="">All staff</option>' +
          Store.db.staff.map(function (s) { return '<option value="' + s.id + '">' + E(s.name) + '</option>'; }).join('') +
        '</select>' +
        '<select id="fp"><option value="">Any priority</option><option>High</option><option>Normal</option></select>' +
        '<label class="row" style="gap:6px;font-size:13px"><input type="checkbox" id="flate"> Overdue only</label>' +
      '</div><div id="board"></div>';

    var f = { q: '', c: '', a: '', p: '', late: false };
    function list() {
      return visibleJobs().filter(function (j) {
        if (f.c && j.clientId !== f.c) return false;
        if (f.a && j.assignedTo !== f.a) return false;
        if (f.p && j.priority !== f.p) return false;
        if (f.late && !Store.overdue(j)) return false;
        if (f.q) {
          var hay = (j.title + j.id + j.cat + Store.client(j.clientId).name).toLowerCase();
          if (hay.indexOf(f.q) === -1) return false;
        }
        return true;
      });
    }

    function draw() {
      var jobs = list(), host = document.getElementById('board');
      if (mode === 'board') {
        host.innerHTML = '<div class="kanban">' + Store.STATUS_ORDER.map(function (s) {
          var col = jobs.filter(function (j) { return j.status === s; });
          var st = Store.STATUS[s];
          return '<div class="kcol"><div class="kcol-h" style="color:' + st.color + '">' +
            '<span>' + E(st.label) + '</span><span class="n">' + col.length + '</span></div>' +
            '<div class="kcol-b">' + (col.length ? col.map(function (j) {
              var c = Store.client(j.clientId), stf = Store.staff(j.assignedTo);
              var cl = Store.checklistDone(j);
              return '<div class="kcard' + (Store.overdue(j) ? ' late' : '') + '" data-job="' + j.id + '" ' +
                'style="border-left-color:' + st.color + '">' +
                '<div class="id">' + E(j.id) + (j.priority === 'High' ? ' &#9873;' : '') + '</div>' +
                '<div class="t">' + E(j.title) + '</div>' +
                '<div class="c">' + E(c.name) + '</div>' +
                '<div class="m"><span>' + (stf ? E(stf.name.replace('CA ', '')) : 'Unassigned') + '</span>' +
                '<span>' + (j.status === 'completed' ? '&#10003;' : cl.done + '/' + cl.total + ' · ' + UI.fmtDate(j.dueDate)) + '</span></div>' +
              '</div>';
            }).join('') : '<div style="padding:16px;text-align:center;color:var(--ink-mute);font-size:12px">—</div>') +
            '</div></div>';
        }).join('') + '</div>';
      } else {
        host.innerHTML = '<div class="card"><div class="tbl-wrap"><table class="tbl"><thead><tr>' +
          '<th>Job</th><th>Client</th><th>Status</th><th>Assigned</th><th>Due</th></tr></thead><tbody>' +
          (jobs.length ? jobs.slice().sort(function (a, b) { return new Date(a.dueDate) - new Date(b.dueDate); })
            .map(jobRow).join('')
            : '<tr><td colspan="5"><div class="empty"><div class="ic">&#128269;</div><h4>No jobs match</h4></div></td></tr>') +
          '</tbody></table></div></div>';
      }
      wireJobs(host);
    }

    document.getElementById('q').oninput = function () { f.q = this.value.toLowerCase(); draw(); };
    document.getElementById('fc').onchange = function () { f.c = this.value; draw(); };
    document.getElementById('fa').onchange = function () { f.a = this.value; draw(); };
    document.getElementById('fp').onchange = function () { f.p = this.value; draw(); };
    document.getElementById('flate').onchange = function () { f.late = this.checked; draw(); };
    Array.prototype.forEach.call(document.querySelectorAll('#segm button'), function (b) {
      b.onclick = function () {
        Array.prototype.forEach.call(document.querySelectorAll('#segm button'), function (x) { x.classList.remove('on'); });
        b.classList.add('on'); mode = b.dataset.m; sessionStorage.setItem('kvksn.jobview', mode); draw();
      };
    });
    document.getElementById('newJob').onclick = newJobModal;
    draw();
  }

  function newJobModal() {
    UI.modal({
      title: 'Create a Job',
      sub: 'The job is assigned automatically to the least-loaded staff member with the right skill.',
      body:
        '<div class="field"><label>Client</label><select id="njC">' +
          Store.db.clients.map(function (c) { return '<option value="' + c.id + '">' + E(c.name) + ' (' + E(c.code) + ')</option>'; }).join('') +
        '</select></div>' +
        '<div class="field"><label>Service</label><select id="njS">' +
          Store.db.services.map(function (s) { return '<option value="' + s.id + '">' + E(s.name) + ' — ' + UI.money(s.fee) + '</option>'; }).join('') +
        '</select></div>' +
        '<div class="field"><label>Period / reference</label><input id="njP" placeholder="e.g. ' + E(Store.periodOf(0)) + '"></div>' +
        '<div class="field"><label>Priority</label><select id="njPr"><option>Normal</option><option>High</option></select></div>',
      footer: '<button class="btn btn-ghost" data-close>Cancel</button><button class="btn btn-brass" id="njGo">Create Job</button>',
      onOpen: function (h) {
        h.querySelector('#njGo').onclick = function () {
          var j = Store.createJob(h.querySelector('#njC').value, h.querySelector('#njS').value,
                                  h.querySelector('#njP').value.trim(), me.id);
          j.priority = h.querySelector('#njPr').value;
          Store.save(); UI.closeModal();
          UI.toast('Job ' + j.id + ' created — assigned to ' + Store.actorName(j.assignedTo), 'ok');
          route(); setTimeout(function () { openJob(j.id); }, 200);
        };
      }
    });
  }

  /* ================= REVIEW QUEUE ================= */
  function vReview(v) {
    var q = Store.db.jobs.filter(function (j) { return j.status === 'under_review' || j.status === 'ready'; });
    v.innerHTML =
      '<div class="alert alert-teal"><span class="ic">&#8505;</span><span>Nothing reaches the client until it is ' +
      'approved and released here. This is the maker-checker gate.</span></div>' +
      (q.length ? '<div class="grid g-2">' + q.map(function (j) {
        var c = Store.client(j.clientId);
        return '<div class="card"><div class="card-h"><div><h3>' + E(j.title) + '</h3>' +
          '<div class="sub">' + E(j.id) + ' · ' + E(c.name) + '</div></div>' + UI.statusBadge(j.status) + '</div>' +
          '<div class="card-b">' +
            '<div class="dl mb"><dt>Prepared by</dt><dd>' + E(Store.actorName(j.assignedTo)) + '</dd>' +
            '<dt>Due</dt><dd>' + UI.fmtDate(j.dueDate) + ' ' + UI.dueBadge(j) + '</dd>' +
            '<dt>Deliverables</dt><dd>' + (j.deliverables.length || 'none prepared yet') + '</dd></div>' +
            '<button class="btn btn-primary btn-block" data-job="' + j.id + '">Open &amp; review</button>' +
          '</div></div>';
      }).join('') + '</div>'
      : '<div class="card"><div class="empty"><div class="ic">&#10003;</div><h4>Review queue is clear</h4>' +
        '<p>Nothing is waiting for partner approval right now.</p></div></div>');
    wireJobs(v);
  }

  /* ================= JOB DRAWER (staff view) ================= */
  function openJob(id) {
    var j = Store.job(id);
    if (!j) { UI.toast('Job not found', 'err'); return; }
    if (!isPartner() && j.assignedTo !== me.id && j.reviewer !== me.id) {
      UI.toast('You do not have access to this job', 'err'); return;
    }
    var c = Store.client(j.clientId), cl = Store.checklistDone(j), s = Store.service(j.serviceId);

    UI.drawer({
      title: j.title,
      meta: E(j.id) + ' &nbsp;·&nbsp; <a href="#" data-client="' + c.id + '" style="color:var(--teal)">' + E(c.name) + '</a>' +
            ' &nbsp;·&nbsp; ' + E(c.code) + ' &nbsp;·&nbsp; raised ' + UI.fmtDate(j.createdAt),
      body: adminJobBody(j, c, cl, s),
      onOpen: function () { wireAdminJob(j); }
    });
  }

  function adminJobBody(j, c, cl, s) {
    var h = '';

    /* action bar */
    h += '<div class="card mb"><div class="card-b">' +
      '<div class="row between mb-s"><div>' + UI.statusBadge(j.status) + ' ' + UI.dueBadge(j) +
      (j.priority === 'High' ? ' <span class="tag prio-High">High priority</span>' : '') + '</div></div>' +
      '<div class="row">' +
        (j.status !== 'completed' ? '<button class="btn btn-ghost btn-sm" id="aReassign">Reassign</button>' : '') +
        (j.status !== 'completed' ? '<button class="btn btn-ghost btn-sm" id="aQuery">Raise Query</button>' : '') +
        (j.status !== 'completed' ? '<button class="btn btn-ghost btn-sm" id="aStatus">Change Status</button>' : '') +
        (j.status !== 'completed' ? '<button class="btn btn-ghost btn-sm" id="aDeliv">Add Deliverable</button>' : '') +
        ((j.status === 'assigned' || j.status === 'in_progress')
          ? '<button class="btn btn-teal btn-sm" id="aSubmit">Submit for Review</button>' : '') +
        ((isPartner() && (j.status === 'under_review' || j.status === 'ready'))
          ? '<button class="btn btn-green btn-sm" id="aRelease">Approve &amp; Release</button>' +
            '<button class="btn btn-ghost btn-sm" id="aReject">Send Back</button>' : '') +
        ((isPartner() && !j.invoiceId)
          ? '<button class="btn btn-brass btn-sm" id="aInvoice">Raise Invoice</button>' : '') +
      '</div></div></div>';

    /* facts */
    h += '<div class="grid g-2 mb">' +
      '<div class="card"><div class="card-h"><h3>Job Details</h3></div><div class="card-b"><div class="dl">' +
        '<dt>Service</dt><dd>' + E(s.name) + '</dd>' +
        '<dt>Category</dt><dd>' + E(j.cat) + '</dd>' +
        '<dt>Period</dt><dd>' + (j.period || '—') + '</dd>' +
        '<dt>Assigned to</dt><dd>' + E(Store.actorName(j.assignedTo)) + '</dd>' +
        '<dt>Reviewer</dt><dd>' + E(Store.actorName(j.reviewer)) + '</dd>' +
        '<dt>Due date</dt><dd>' + UI.fmtDate(j.dueDate) + '</dd>' +
        '<dt>Fee</dt><dd>' + UI.money(j.fee) + ' + GST</dd>' +
        '<dt>Invoice</dt><dd>' + (j.invoiceId ? E(j.invoiceId) : '<span class="muted">not raised</span>') + '</dd>' +
      '</div></div></div>' +
      '<div class="card"><div class="card-h"><h3>Client</h3></div><div class="card-b"><div class="dl">' +
        '<dt>Name</dt><dd>' + E(c.name) + '</dd>' +
        '<dt>Contact</dt><dd>' + E(c.contact) + '</dd>' +
        '<dt>PAN</dt><dd class="mono">' + E(c.pan) + '</dd>' +
        '<dt>GSTIN</dt><dd class="mono">' + (c.gstin || '—') + '</dd>' +
        '<dt>Phone</dt><dd>' + E(c.phone) + '</dd>' +
        '<dt>Turnover</dt><dd>' + E(c.turnover) + '</dd>' +
      '</div></div></div></div>';

    /* checklist */
    h += '<div class="card mb"><div class="card-h"><h3>Document Checklist</h3>' +
      '<span class="sub">' + cl.done + '/' + cl.total + ' received · ' + cl.pct + '%</span></div><div class="card-b">' +
      j.checklist.map(function (x, i) {
        return '<div class="chk ' + (x.done ? 'on' : '') + '">' +
          '<span class="box">' + (x.done ? '&#10003;' : '') + '</span>' +
          '<span class="txt">' + E(x.item) + '</span>' +
          (x.done ? '<span class="badge" style="background:var(--green-soft);color:var(--green)">Received</span>'
                  : '<button class="btn btn-ghost btn-sm" data-chase="' + i + '">Chase client</button>') +
        '</div>';
      }).join('') + '</div></div>';

    /* queries */
    h += '<div class="card mb"><div class="card-h"><h3>Queries</h3>' +
      '<span class="sub">' + j.queries.length + ' raised</span></div><div class="card-b">' +
      (j.queries.length ? j.queries.map(function (q) {
        return '<div class="q"><div class="qh"><b>' + E(Store.actorName(q.by)) + '</b><span>' + UI.fmtDateTime(q.at) + '</span></div>' +
          '<div class="qt">' + E(q.text) + '</div>' +
          (q.replies.length ? q.replies.map(function (r) {
            return '<div class="reply"><div class="rh">' + E(Store.actorName(r.by)) + ' · ' + UI.fmtDateTime(r.at) + '</div>' + E(r.text) + '</div>';
          }).join('') : '<div class="muted mt-s" style="font-size:12px">Awaiting client response…</div>') +
        '</div>';
      }).join('') : '<p class="muted" style="font-size:13px">No queries raised.</p>') + '</div></div>';

    /* documents */
    h += '<div class="card mb"><div class="card-h"><h3>Documents</h3>' +
      '<span class="sub">' + j.docs.length + ' file(s)</span></div><div class="card-b">' +
      (j.docs.length ? j.docs.map(function (d) {
        return '<div class="file"><span class="ic ' + (d.kind === 'upload' ? '' : 'doc') + '">' + E(UI.fileIcon(d.name)) + '</span>' +
          '<span style="flex:1;min-width:0"><b>' + E(d.name) + '</b><span>' + E(d.size) + ' · ' +
          E(Store.actorName(d.by)) + ' · ' + UI.fmtDate(d.at) + ' · ' + E(d.kind) + '</span></span>' +
          '<button class="btn btn-ghost btn-sm" data-dl="' + E(d.name) + '">Download</button></div>';
      }).join('') : '<p class="muted" style="font-size:13px">No documents yet.</p>') +
      '<div class="drop mt" id="dz"><div class="ic">&#8686;</div><b>Upload a working paper or deliverable</b>' +
      '<span>Files added here stay internal until you release them</span>' +
      '<input type="file" id="fi" multiple style="display:none"></div>' +
      '</div></div>';

    /* deliverables */
    h += '<div class="card mb"><div class="card-h"><h3>Deliverables</h3>' +
      '<span class="sub">' + j.deliverables.filter(function (d) { return d.released; }).length + ' of ' +
      j.deliverables.length + ' released</span></div><div class="card-b">' +
      (j.deliverables.length ? j.deliverables.map(function (d) {
        return '<div class="file"><span class="ic ' + (d.released ? 'out' : 'doc') + '">' + (d.released ? '&#10003;' : '&#8226;') + '</span>' +
          '<span style="flex:1;min-width:0"><b>' + E(d.name) + '</b><span>' +
          (d.released ? 'Released to client ' + UI.fmtDate(d.at) : 'Held internally — not visible to the client') + '</span></span>' +
          '<button class="btn btn-ghost btn-sm" data-dl="' + E(d.name) + '">Download</button></div>';
      }).join('') : '<p class="muted" style="font-size:13px">None added. Expected outputs for this service:</p>' +
        '<ul style="font-size:13px;color:var(--ink-soft);margin:10px 0 0 18px">' +
        s.deliverables.map(function (x) { return '<li>' + E(x) + '</li>'; }).join('') + '</ul>') +
      '</div></div>';

    /* timeline */
    h += '<div class="card"><div class="card-h"><h3>Audit Trail</h3></div><div class="card-b"><div class="tline">' +
      j.timeline.slice().reverse().map(function (t) {
        var isSys = t.by === 'system', isCli = t.by.charAt(0) === 'C';
        return '<div class="tline-i ' + (isSys ? 'sys' : isCli ? 'cli' : '') + '">' +
          '<div class="a">' + E(t.action) + '</div>' +
          '<div class="m">' + E(Store.actorName(t.by)) + ' · ' + UI.fmtDateTime(t.at) + '</div>' +
          (t.note ? '<div class="n">' + E(t.note) + '</div>' : '') + '</div>';
      }).join('') + '</div></div></div>';

    return h;
  }

  function refreshJob(j) {
    UI.closeDrawer(); route(); setTimeout(function () { openJob(j.id); }, 260);
  }

  function wireAdminJob(j) {
    var body = UI.drawerBody(); if (!body) return;
    var c = Store.client(j.clientId);

    Array.prototype.forEach.call(body.querySelectorAll('[data-dl]'), function (b) {
      b.onclick = function () {
        UI.downloadStub(b.dataset.dl, ['Client : ' + c.name, 'Job    : ' + j.id, 'Service: ' + j.title]);
        UI.toast('Downloading ' + b.dataset.dl, 'ok');
      };
    });
    Array.prototype.forEach.call(body.querySelectorAll('[data-client]'), function (b) {
      b.onclick = function (e) { e.preventDefault(); UI.closeDrawer(); setTimeout(function () { openClient(c.id); }, 260); };
    });
    Array.prototype.forEach.call(body.querySelectorAll('[data-chase]'), function (b) {
      b.onclick = function () {
        var item = j.checklist[parseInt(b.dataset.chase, 10)].item;
        Store.notify(j.clientId, 'Reminder: please upload "' + item + '" for ' + j.title, j.id);
        Store.addTimeline(j, me.id, 'Document reminder sent', item);
        Store.save();
        UI.toast('Reminder sent to ' + c.name, 'ok');
      };
    });

    /* reassign */
    var rb = body.querySelector('#aReassign');
    if (rb) rb.onclick = function () {
      UI.modal({
        title: 'Reassign ' + j.id,
        body: '<div class="field"><label>Assign to</label><select id="raTo">' +
            Store.db.staff.map(function (s) {
              return '<option value="' + s.id + '"' + (s.id === j.assignedTo ? ' selected' : '') + '>' +
                E(s.name) + ' — ' + E(s.desig) + ' (' +
                Store.jobsOf(s.id).filter(function (x) { return x.status !== 'completed'; }).length + ' open)</option>';
            }).join('') + '</select></div>' +
          '<div class="field"><label>Reason</label><input id="raWhy" placeholder="e.g. workload balancing"></div>',
        footer: '<button class="btn btn-ghost" data-close>Cancel</button><button class="btn btn-primary" id="raGo">Reassign</button>',
        onOpen: function (h) {
          h.querySelector('#raGo').onclick = function () {
            var to = h.querySelector('#raTo').value;
            j.assignedTo = to;
            Store.addTimeline(j, me.id, 'Reassigned to ' + Store.actorName(to), h.querySelector('#raWhy').value.trim());
            Store.notify(to, 'Job ' + j.id + ' has been assigned to you.', j.id);
            Store.save(); UI.closeModal();
            UI.toast('Reassigned to ' + Store.actorName(to), 'ok');
            refreshJob(j);
          };
        }
      });
    };

    /* raise query */
    var qb = body.querySelector('#aQuery');
    if (qb) qb.onclick = function () {
      UI.modal({
        title: 'Raise a Query',
        sub: 'The client is notified and the job moves to “Query Raised”.',
        body: '<div class="field"><label>Query to ' + E(c.contact) + '</label>' +
              '<textarea id="qTxt" rows="5" placeholder="Describe exactly what you need and why…"></textarea></div>',
        footer: '<button class="btn btn-ghost" data-close>Cancel</button><button class="btn btn-brass" id="qGo">Send Query</button>',
        onOpen: function (h) {
          h.querySelector('#qGo').onclick = function () {
            var t = h.querySelector('#qTxt').value.trim();
            if (!t) { UI.toast('Please type the query', 'err'); return; }
            j.queries.push({ id: 'Q' + Date.now(), by: me.id, at: new Date().toISOString(), text: t, replies: [] });
            Store.setStatus(j, 'query_raised', me.id, 'Query raised with the client');
            Store.notify(j.clientId, 'A query has been raised on ' + j.title + '. Please respond in the portal.', j.id);
            Store.save(); UI.closeModal();
            UI.toast('Query sent to ' + c.name, 'ok');
            refreshJob(j);
          };
        }
      });
    };

    /* change status */
    var sb = body.querySelector('#aStatus');
    if (sb) sb.onclick = function () {
      UI.modal({
        title: 'Change Status',
        body: '<div class="field"><label>New status</label><select id="stTo">' +
          Store.STATUS_ORDER.map(function (s) {
            return '<option value="' + s + '"' + (s === j.status ? ' selected' : '') + '>' + E(Store.STATUS[s].label) + '</option>';
          }).join('') + '</select></div>' +
          '<div class="field"><label>Note</label><input id="stWhy" placeholder="Optional note for the audit trail"></div>',
        footer: '<button class="btn btn-ghost" data-close>Cancel</button><button class="btn btn-primary" id="stGo">Update</button>',
        onOpen: function (h) {
          h.querySelector('#stGo').onclick = function () {
            Store.setStatus(j, h.querySelector('#stTo').value, me.id, h.querySelector('#stWhy').value.trim());
            Store.save(); UI.closeModal(); UI.toast('Status updated', 'ok'); refreshJob(j);
          };
        }
      });
    };

    /* add deliverable */
    var db2 = body.querySelector('#aDeliv');
    if (db2) db2.onclick = function () {
      var s = Store.service(j.serviceId);
      UI.modal({
        title: 'Add a Deliverable',
        sub: 'Held internally until the partner releases it.',
        body: '<div class="field"><label>Document</label><select id="dvPick">' +
            s.deliverables.map(function (x) { return '<option>' + E(x) + '</option>'; }).join('') +
            '<option value="__other">Other — type below</option></select></div>' +
          '<div class="field"><label>Or enter a file name</label><input id="dvName" placeholder="e.g. Filed_GSTR-3B_Acknowledgement.pdf"></div>',
        footer: '<button class="btn btn-ghost" data-close>Cancel</button><button class="btn btn-teal" id="dvGo">Add</button>',
        onOpen: function (h) {
          h.querySelector('#dvGo').onclick = function () {
            var pick = h.querySelector('#dvPick').value, typed = h.querySelector('#dvName').value.trim();
            var name = typed || (pick === '__other' ? '' : pick);
            if (!name) { UI.toast('Please choose or type a name', 'err'); return; }
            if (!/\.\w{2,5}$/.test(name)) name = name.replace(/[^\w\-]+/g, '_') + '.pdf';
            j.deliverables.push({ id: 'V' + Date.now(), name: name, released: false, at: new Date().toISOString() });
            Store.addTimeline(j, me.id, 'Deliverable prepared', name);
            Store.save(); UI.closeModal(); UI.toast('Deliverable added (held internally)', 'ok'); refreshJob(j);
          };
        }
      });
    };

    /* submit for review */
    var subb = body.querySelector('#aSubmit');
    if (subb) subb.onclick = function () {
      UI.confirm('Submit for review?',
        'The job moves to the partner\'s review queue. The client sees the status change but no documents are released yet.',
        'Submit', function () {
          Store.setStatus(j, 'under_review', me.id, 'Submitted for partner review');
          Store.notify(j.reviewer, j.id + ' submitted for your review by ' + me.name, j.id);
          Store.save(); UI.toast('Sent to ' + Store.actorName(j.reviewer) + ' for review', 'ok'); refreshJob(j);
        }, 'btn-teal');
    };

    /* release */
    var relb = body.querySelector('#aRelease');
    if (relb) relb.onclick = function () {
      if (!j.deliverables.length) {
        UI.toast('Add at least one deliverable before releasing', 'err'); return;
      }
      UI.confirm('Approve and release to client?',
        'All ' + j.deliverables.length + ' deliverable(s) become visible to ' + c.name +
        ' and the job is marked complete. This action is recorded in the audit trail.',
        'Approve & Release', function () {
          Store.releaseDeliverables(j, me.id);
          UI.toast('Released to ' + c.name, 'ok'); refreshJob(j);
        }, 'btn-green');
    };

    /* send back */
    var rejb = body.querySelector('#aReject');
    if (rejb) rejb.onclick = function () {
      UI.modal({
        title: 'Send back to preparer',
        body: '<div class="field"><label>Review comments</label>' +
              '<textarea id="rjTxt" rows="4" placeholder="What needs to be corrected?"></textarea></div>',
        footer: '<button class="btn btn-ghost" data-close>Cancel</button><button class="btn btn-red" id="rjGo">Send Back</button>',
        onOpen: function (h) {
          h.querySelector('#rjGo').onclick = function () {
            var t = h.querySelector('#rjTxt').value.trim() || 'Requires correction';
            Store.setStatus(j, 'in_progress', me.id, 'Review comments: ' + t);
            Store.notify(j.assignedTo, j.id + ' sent back by ' + me.name + ': ' + t, j.id);
            Store.save(); UI.closeModal(); UI.toast('Sent back to ' + Store.actorName(j.assignedTo), 'ok'); refreshJob(j);
          };
        }
      });
    };

    /* invoice */
    var ib = body.querySelector('#aInvoice');
    if (ib) ib.onclick = function () {
      UI.confirm('Raise invoice?',
        'An invoice for ' + UI.money(j.fee) + ' + 18% GST = ' + UI.money(Math.round(j.fee * 1.18)) +
        ' will be raised on ' + c.name + ' and shown in their portal.',
        'Raise Invoice', function () {
          var inv = Store.raiseInvoice(j, me.id);
          UI.toast(inv.id + ' raised for ' + UI.money(inv.total), 'ok'); refreshJob(j);
        }, 'btn-brass');
    };

    /* upload */
    var fi = body.querySelector('#fi'), dz = body.querySelector('#dz');
    if (dz) {
      dz.onclick = function () { fi.click(); };
      dz.addEventListener('dragover', function (e) { e.preventDefault(); dz.classList.add('over'); });
      dz.addEventListener('dragleave', function () { dz.classList.remove('over'); });
      dz.addEventListener('drop', function (e) { e.preventDefault(); dz.classList.remove('over'); take(e.dataTransfer.files); });
      fi.onchange = function () { take(fi.files); fi.value = ''; };
    }
    function take(files) {
      if (!files || !files.length) return;
      Array.prototype.forEach.call(files, function (f) {
        Store.uploadDoc(j, f.name, UI.humanSize(f.size), me.id, 'workpaper');
      });
      Store.addTimeline(j, me.id, 'Working paper uploaded', files.length + ' file(s)');
      Store.save(); UI.toast(files.length + ' file(s) added', 'ok'); refreshJob(j);
    }
  }

  /* ================= CLIENT MASTER ================= */
  function vClients(v) {
    document.getElementById('tact').innerHTML =
      '<button class="btn btn-brass btn-sm" id="addC">+ Add Client via GSTIN</button>';

    var cs = Store.db.clients;
    v.innerHTML =
      '<div class="filters"><input type="search" id="q" placeholder="Search name, PAN, GSTIN…"></div>' +
      '<div class="card"><div class="tbl-wrap"><table class="tbl"><thead><tr>' +
      '<th>Client</th><th>Type</th><th>PAN</th><th>GSTIN</th><th>Turnover</th><th>Open Jobs</th><th>Outstanding</th><th></th>' +
      '</tr></thead><tbody id="crows"></tbody></table></div></div>';

    function draw(q) {
      document.getElementById('crows').innerHTML = cs.filter(function (c) {
        if (!q) return true;
        return (c.name + c.pan + c.gstin + c.code + c.contact).toLowerCase().indexOf(q) !== -1;
      }).map(function (c) {
        var open = Store.jobsFor(c.id).filter(function (j) { return j.status !== 'completed'; }).length;
        var out = Store.db.invoices.filter(function (i) { return i.clientId === c.id && i.status !== 'Paid'; })
                    .reduce(function (s, i) { return s + i.total; }, 0);
        return '<tr class="clickable" data-client="' + c.id + '">' +
          '<td><div class="row" style="gap:10px;flex-wrap:nowrap">' + UI.avatar(c.name, c.id, 30) +
            '<span><b>' + E(c.name) + '</b><div class="muted" style="font-size:11px">' + E(c.code) + ' · ' + E(c.contact) + '</div></span></div></td>' +
          '<td><span class="tag">' + E(c.type) + '</span></td>' +
          '<td class="mono" style="font-size:12px">' + E(c.pan) + '</td>' +
          '<td class="mono" style="font-size:12px">' + (c.gstin || '<span class="muted">—</span>') + '</td>' +
          '<td style="font-size:12px">' + E(c.turnover) + '</td>' +
          '<td class="num">' + open + '</td>' +
          '<td class="num">' + (out ? '<span style="color:var(--red)">' + UI.money(out) + '</span>' : '—') + '</td>' +
          '<td class="right"><button class="btn btn-ghost btn-sm" data-client="' + c.id + '">Open</button></td></tr>';
      }).join('');
      wireJobs(document.getElementById('crows'));
    }
    document.getElementById('q').oninput = function () { draw(this.value.toLowerCase()); };
    document.getElementById('addC').onclick = addClientModal;
    draw('');
  }

  function addClientModal() {
    UI.modal({
      title: 'Add Client from GSTIN',
      sub: 'Pulls legal name, constitution, turnover slab and jurisdiction from the GST common portal.',
      body:
        '<div class="field"><label>GSTIN</label>' +
        '<input id="gsIn" placeholder="29AABCU9603R1ZM" style="text-transform:uppercase;font-family:var(--mono)"></div>' +
        '<div class="muted" style="font-size:12px;margin-bottom:14px">Demo GSTINs that resolve: ' +
        '<b>29AABCU9603R1ZM</b> (new), or any existing client\'s GSTIN.</div>' +
        '<button class="btn btn-teal btn-block" id="gsGo">Fetch Details</button>' +
        '<div id="gsOut" class="mt"></div>',
      footer: '<button class="btn btn-ghost" data-close>Close</button>' +
              '<button class="btn btn-brass" id="gsSave" disabled>Create Client</button>',
      onOpen: function (h) {
        var fetched = null;
        h.querySelector('#gsGo').onclick = function () {
          var g = h.querySelector('#gsIn').value.toUpperCase().trim();
          var b = h.querySelector('#gsGo');
          b.innerHTML = '<span class="spinner"></span> Contacting GST portal…'; b.disabled = true;
          h.querySelector('#gsOut').innerHTML =
            '<div class="api-log"><div class="dim">POST /gsp/v1/taxpayer/search</div>' +
            '<div class="dim">gstin=' + E(g) + '</div><div class="dim">awaiting response…</div></div>';
          Store.gstSearch(g).then(function (r) {
            fetched = { g: g, r: r };
            h.querySelector('#gsOut').innerHTML =
              '<div class="api-log"><div class="dim">POST /gsp/v1/taxpayer/search</div>' +
              '<div class="ok">200 OK — record found</div></div>' +
              '<div class="alert alert-green mt"><span class="ic">&#10003;</span><span>Details fetched from the GST common portal</span></div>' +
              '<div class="dl">' +
                '<dt>Legal name</dt><dd>' + E(r.lgnm) + '</dd>' +
                '<dt>Trade name</dt><dd>' + E(r.tradeNam) + '</dd>' +
                '<dt>Constitution</dt><dd>' + E(r.ctb) + '</dd>' +
                '<dt>Registered</dt><dd>' + E(r.rgdt) + '</dd>' +
                '<dt>Status</dt><dd>' + E(r.sts) + '</dd>' +
                '<dt>Turnover</dt><dd>' + E(r.aggreTurnOver) + '</dd>' +
                '<dt>Taxpayer type</dt><dd>' + E(r.dty) + '</dd>' +
                '<dt>e-Invoicing</dt><dd>' + E(r.einv) + '</dd>' +
                '<dt>Address</dt><dd>' + E(r.pradr) + '</dd>' +
                '<dt>Jurisdiction</dt><dd>' + E(r.stj) + ' / ' + E(r.ctj) + '</dd>' +
                '<dt>Activity</dt><dd>' + E(r.nba.join(', ')) + '</dd>' +
              '</div>';
            h.querySelector('#gsSave').disabled = false;
            b.textContent = 'Fetch Details'; b.disabled = false;
          }).catch(function (err) {
            h.querySelector('#gsOut').innerHTML =
              '<div class="api-log"><div class="dim">POST /gsp/v1/taxpayer/search</div>' +
              '<div class="er">404 — ' + E(err.message) + '</div></div>';
            b.textContent = 'Fetch Details'; b.disabled = false;
          });
        };
        h.querySelector('#gsSave').onclick = function () {
          if (!fetched) return;
          var r = fetched.r;
          var exists = Store.db.clients.filter(function (c) { return c.gstin === fetched.g; })[0];
          if (exists) { UI.toast('That GSTIN is already on the client master', 'err'); return; }
          var n = Store.db.clients.length + 1;
          var slab = r.aggreTurnOver;
          var tv = slab.indexOf('5 Cr to 25') > -1 ? 90000000
                 : slab.indexOf('1.5 Cr to 5') > -1 ? 35000000
                 : slab.indexOf('40 lakh') > -1 ? 9000000 : 5000000;
          var c = {
            id: 'C' + (100 + n), code: 'KVK-' + ('000' + n).slice(-4),
            name: r.tradeNam || r.lgnm, contact: r.lgnm, type: r.ctb,
            pan: fetched.g.slice(2, 12), gstin: fetched.g,
            email: (r.tradeNam || 'client').toLowerCase().replace(/[^a-z]/g, '').slice(0, 10) + '@demo.in',
            phone: '+91 90000 00000', address: r.pradr, regDate: r.rgdt,
            turnover: slab, turnoverValue: tv, filingFreq: r.dty.indexOf('QRMP') > -1 ? 'Quarterly (QRMP)' : 'Monthly',
            gstStatus: r.sts, constitution: r.ctb, services: ['gstr-1', 'gstr-3b'],
            eInvoice: r.einv, taxAudit: tv > 10000000, password: 'demo'
          };
          Store.db.clients.push(c);
          Store.logSync('GSTN', c.id, 'Taxpayer search — client onboarded', 'Success — ' + r.lgnm, me.id);
          Store.save(); UI.closeModal();
          UI.toast(c.name + ' added to the client master', 'ok');
          route(); setTimeout(function () { openClient(c.id); }, 200);
        };
      }
    });
  }

  /* ---- client drawer ---- */
  function openClient(id) {
    var c = Store.client(id); if (!c) { UI.toast('Client not found', 'err'); return; }
    var jobs = Store.jobsFor(id);
    var invs = Store.db.invoices.filter(function (i) { return i.clientId === id; });
    var out = invs.filter(function (i) { return i.status !== 'Paid'; }).reduce(function (s, i) { return s + i.total; }, 0);
    var appl = Store.applicability(c);

    var h = '';
    h += '<div class="grid g-2 mb">' +
      kpi('Open Jobs', jobs.filter(function (j) { return j.status !== 'completed'; }).length, jobs.length + ' total', '') +
      kpi('Outstanding', UI.shortMoney(out), invs.length + ' invoices', out ? 'k-red' : 'k-green') +
    '</div>';

    h += '<div class="card mb"><div class="card-h"><h3>Registration Master</h3>' +
      '<div class="row">' + (c.gstin ? '<button class="btn btn-teal btn-sm" id="cGst">Sync GST</button>' : '') +
      '<button class="btn btn-ghost btn-sm" id="cIt">Fetch 26AS / AIS</button></div></div><div class="card-b">' +
      '<div class="dl">' +
        '<dt>Client code</dt><dd>' + E(c.code) + '</dd>' +
        '<dt>Contact</dt><dd>' + E(c.contact) + '</dd>' +
        '<dt>Constitution</dt><dd>' + E(c.constitution) + '</dd>' +
        '<dt>PAN</dt><dd class="mono">' + E(c.pan) + '</dd>' +
        '<dt>GSTIN</dt><dd class="mono">' + (c.gstin || '—') + '</dd>' +
        (c.cin ? '<dt>CIN / LLPIN</dt><dd class="mono">' + E(c.cin) + '</dd>' : '') +
        '<dt>Email</dt><dd>' + E(c.email) + '</dd>' +
        '<dt>Phone</dt><dd>' + E(c.phone) + '</dd>' +
        '<dt>Address</dt><dd>' + E(c.address) + '</dd>' +
        '<dt>Turnover</dt><dd id="cTov">' + E(c.turnover) + '</dd>' +
        '<dt>Filing frequency</dt><dd>' + E(c.filingFreq) + '</dd>' +
        '<dt>e-Invoicing</dt><dd>' + E(c.eInvoice) + '</dd>' +
      '</div><div id="cSync" class="mt"></div></div></div>';

    h += '<div class="card mb"><div class="card-h"><h3>Statutory Applicability</h3>' +
      '<span class="sub">derived from turnover</span></div><div class="card-b">' +
      appl.map(function (a) {
        return '<div class="chk ' + (a.ok ? 'on' : '') + '"><span class="box" style="' +
          (a.ok ? '' : 'background:var(--line-2);border-color:var(--line)') + '">' + (a.ok ? '&#10003;' : '&ndash;') + '</span>' +
          '<span class="txt"><b>' + E(a.text) + '</b><div class="muted" style="font-size:11.5px">' + E(a.note) + '</div></span></div>';
      }).join('') + '</div></div>';

    h += '<div class="card mb"><div class="card-h"><h3>Jobs</h3>' +
      '<span class="sub">' + jobs.length + '</span></div>' +
      (jobs.length ? '<div class="tbl-wrap"><table class="tbl"><thead><tr>' +
        '<th>Job</th><th>Status</th><th>Assigned</th><th>Due</th></tr></thead><tbody>' +
        jobs.map(function (j) {
          return '<tr class="clickable" data-jjob="' + j.id + '"><td><b>' + E(j.title) + '</b>' +
            '<div class="muted mono" style="font-size:11px">' + E(j.id) + '</div></td>' +
            '<td>' + UI.statusBadge(j.status) + '</td>' +
            '<td style="font-size:12.5px">' + E(Store.actorName(j.assignedTo)) + '</td>' +
            '<td>' + UI.fmtDate(j.dueDate) + '</td></tr>';
        }).join('') + '</tbody></table></div>'
        : '<div class="empty"><p>No jobs yet.</p></div>') + '</div>';

    h += '<div class="card"><div class="card-h"><h3>Invoices</h3></div>' +
      (invs.length ? '<div class="tbl-wrap"><table class="tbl"><thead><tr>' +
        '<th>Invoice</th><th>Date</th><th class="num">Total</th><th>Status</th></tr></thead><tbody>' +
        invs.map(function (i) {
          return '<tr><td class="mono">' + E(i.id) + '</td><td>' + UI.fmtDate(i.date) + '</td>' +
            '<td class="num">' + UI.money(i.total) + '</td><td>' +
            '<span class="badge" style="background:' + (i.status === 'Paid' ? 'var(--green-soft)' : 'var(--red-soft)') +
            ';color:' + (i.status === 'Paid' ? 'var(--green)' : 'var(--red)') + '">' + E(i.status) + '</span></td></tr>';
        }).join('') + '</tbody></table></div>' : '<div class="empty"><p>No invoices raised.</p></div>') + '</div>';

    UI.drawer({
      title: c.name,
      meta: E(c.code) + ' &nbsp;·&nbsp; ' + E(c.type) + ' &nbsp;·&nbsp; ' + E(c.pan),
      body: h,
      onOpen: function () {
        var body = UI.drawerBody();
        Array.prototype.forEach.call(body.querySelectorAll('[data-jjob]'), function (n) {
          n.onclick = function () { var id = n.dataset.jjob; UI.closeDrawer(); setTimeout(function () { openJob(id); }, 260); };
        });
        var g = body.querySelector('#cGst');
        if (g) g.onclick = function () {
          g.disabled = true; g.innerHTML = '<span class="spinner"></span> Syncing…';
          Store.gstSearch(c.gstin).then(function (r) {
            c.turnover = r.aggreTurnOver; c.gstStatus = r.sts; c.eInvoice = r.einv;
            Store.logSync('GSTN', c.id, 'Taxpayer search refresh', 'Success — ' + r.sts, me.id);
            Store.save();
            body.querySelector('#cTov').textContent = r.aggreTurnOver;
            body.querySelector('#cSync').innerHTML =
              '<div class="api-log"><div class="dim">GET /gsp/v1/taxpayer/' + E(c.gstin) + '</div>' +
              '<div class="ok">200 OK</div><div>legal_name : ' + E(r.lgnm) + '</div>' +
              '<div>status     : ' + E(r.sts) + '</div><div>turnover   : ' + E(r.aggreTurnOver) + '</div>' +
              '<div>e_invoice  : ' + E(r.einv) + '</div></div>';
            UI.toast('GST master refreshed', 'ok');
            g.disabled = false; g.textContent = 'Sync GST';
          }).catch(function (e) {
            body.querySelector('#cSync').innerHTML = '<div class="api-log"><div class="er">' + E(e.message) + '</div></div>';
            g.disabled = false; g.textContent = 'Sync GST';
          });
        };
        body.querySelector('#cIt').onclick = function () {
          var b = body.querySelector('#cIt');
          b.disabled = true; b.innerHTML = '<span class="spinner dark"></span> Fetching…';
          Store.itFetch(c.id, true).then(function (r) {
            Store.logSync('Income Tax (ERI)', c.id, 'Form 26AS + AIS fetch', 'Success — ' + r.ay, me.id);
            Store.save();
            body.querySelector('#cSync').innerHTML =
              '<div class="api-log"><div class="dim">POST /eri/v1/taxpayer/26as</div><div class="ok">200 OK — consent on file</div></div>' +
              '<div class="dl mt"><dt>Return filed</dt><dd>' + E(r.returnFiled) + '</dd>' +
              '<dt>TDS credits</dt><dd>' + UI.money(r.tdsCredits) + '</dd>' +
              '<dt>Advance tax</dt><dd>' + UI.money(r.advanceTax) + '</dd>' +
              '<dt>Refund</dt><dd>' + E(r.refundStatus) + '</dd>' +
              '<dt>Demand</dt><dd>' + E(r.outstandingDemand) + '</dd></div>' +
              '<table class="tbl mt"><thead><tr><th>Year</th><th class="num">Income</th><th class="num">Tax</th></tr></thead><tbody>' +
              r.incomeHistory.map(function (x) {
                return '<tr><td>' + E(x.ay) + '</td><td class="num">' + UI.money(x.income) + '</td>' +
                  '<td class="num">' + UI.money(x.tax) + '</td></tr>';
              }).join('') + '</tbody></table>';
            UI.toast('Income tax record fetched', 'ok');
            b.disabled = false; b.textContent = 'Fetch 26AS / AIS';
          });
        };
      }
    });
  }

  /* ================= COMPLIANCE TRACKER ================= */
  function vCompliance(v) {
    var gstClients = Store.db.clients.filter(function (c) { return c.gstin; });
    v.innerHTML =
      '<div class="alert alert-teal"><span class="ic">&#8505;</span><span>Return filing status pulled from the GST ' +
      'common portal. This is public data — no client consent or password is needed. In production this runs nightly ' +
      'across the whole client base.</span></div>' +
      '<div class="row between mb">' +
        '<div class="sec-title" style="margin:0">GST Filing Status — last 6 periods</div>' +
        '<button class="btn btn-teal btn-sm" id="syncAll">Sync All Clients</button>' +
      '</div>' +
      '<div class="card"><div class="tbl-wrap"><table class="tbl" id="ctbl"><thead><tr>' +
        '<th>Client</th><th>GSTIN</th><th>Frequency</th>' +
        [5,4,3,2,1,0].map(function (i) { return '<th>' + E(Store.periodOf(-i)) + '</th>'; }).join('') +
      '</tr></thead><tbody id="crows2">' +
        gstClients.map(function (c) {
          return '<tr data-c="' + c.id + '"><td><b>' + E(c.name) + '</b><div class="muted" style="font-size:11px">' + E(c.code) + '</div></td>' +
            '<td class="mono" style="font-size:11.5px">' + E(c.gstin) + '</td>' +
            '<td style="font-size:12px">' + E(c.filingFreq) + '</td>' +
            [5,4,3,2,1,0].map(function () { return '<td class="muted" style="font-size:11.5px">not synced</td>'; }).join('') + '</tr>';
        }).join('') +
      '</tbody></table></div></div>' +
      '<div class="card mt"><div class="card-h"><h3>Firm Compliance Position</h3></div>' +
      '<div class="card-b" id="cSummary"><p class="muted" style="font-size:13px">Run a sync to see the firm-wide position.</p></div></div>';

    document.getElementById('syncAll').onclick = function () {
      var b = document.getElementById('syncAll');
      b.disabled = true; b.innerHTML = '<span class="spinner"></span> Syncing…';
      var done = 0, filedCount = 0, missCount = 0, defaulters = [];
      gstClients.forEach(function (c) {
        Store.gstFilingStatus(c.id).then(function (res) {
          var tr = document.querySelector('#crows2 tr[data-c="' + c.id + '"]');
          var tds = tr.querySelectorAll('td');
          res.rows.forEach(function (r, i) {
            var td = tds[3 + i];
            var ok1 = r.gstr1 === 'Filed', ok3 = r.gstr3b === 'Filed';
            if (ok3) filedCount++; else { missCount++; if (defaulters.indexOf(c.name) === -1) defaulters.push(c.name); }
            td.innerHTML =
              '<div style="display:flex;gap:4px;flex-direction:column;font-size:10.5px;font-weight:700">' +
              '<span style="padding:1px 5px;border-radius:2px;background:' + (ok1 ? 'var(--green-soft)' : 'var(--red-soft)') +
              ';color:' + (ok1 ? 'var(--green)' : 'var(--red)') + '">R1 ' + (ok1 ? '&#10003;' : '&#10007;') + '</span>' +
              '<span style="padding:1px 5px;border-radius:2px;background:' + (ok3 ? 'var(--green-soft)' : 'var(--red-soft)') +
              ';color:' + (ok3 ? 'var(--green)' : 'var(--red)') + '">3B ' + (ok3 ? '&#10003;' : '&#10007;') + '</span></div>';
          });
          done++;
          if (done === gstClients.length) {
            Store.logSync('GSTN', 'ALL', 'Bulk return filing status sync',
              'Success — ' + filedCount + ' filed, ' + missCount + ' pending across ' + gstClients.length + ' clients', me.id);
            Store.save();
            var total = filedCount + missCount;
            document.getElementById('cSummary').innerHTML =
              '<div class="grid g-3 mb">' +
                kpi('GSTR-3B Filed', filedCount + ' / ' + total, 'across ' + gstClients.length + ' GST clients', 'k-green') +
                kpi('Not Filed', missCount, missCount ? 'needs follow-up' : 'nothing pending', missCount ? 'k-red' : 'k-green') +
                kpi('Compliance Rate', Math.round(filedCount / total * 100) + '%', 'last 6 periods', '') +
              '</div>' +
              (defaulters.length
                ? '<div class="alert alert-red" style="margin:0"><span class="ic">&#9888;</span><span><b>Follow-up needed:</b> ' +
                  E(defaulters.join(', ')) + ' have periods that are not yet filed on the portal.</span></div>'
                : '<div class="alert alert-green" style="margin:0"><span class="ic">&#10003;</span><span>All clients are up to date.</span></div>');
            b.disabled = false; b.textContent = 'Sync All Clients';
            UI.toast('Filing status synced for ' + gstClients.length + ' clients', 'ok');
          }
        });
      });
    };
  }

  /* ================= INTEGRATIONS ================= */
  function vIntegrations(v) {
    v.innerHTML =
      '<div class="alert alert-brass"><span class="ic">&#128274;</span><span>In production these calls run through a ' +
      'licensed GSP (for GST) and an ERI registration (for income tax). Client passwords are never stored — ' +
      'consent-based pulls are gated by an OTP sent to the client\'s own registered mobile.</span></div>' +

      '<div class="grid g-3 mb">' +
        '<div class="card"><div class="card-h"><h3>GST Portal</h3>' +
          '<span class="badge" style="background:var(--green-soft);color:var(--green)">Connected</span></div>' +
          '<div class="card-b"><p class="muted" style="font-size:12.5px;margin-bottom:12px">Taxpayer search, return filing ' +
          'status, GSTR-2B download, e-way bill data.</p>' +
          '<div class="field"><label>GSTIN</label><input id="ig" placeholder="37AXOPV4521K1Z8" ' +
          'style="font-family:var(--mono);text-transform:uppercase"></div>' +
          '<button class="btn btn-teal btn-block" id="igGo">Search Taxpayer</button></div></div>' +

        '<div class="card"><div class="card-h"><h3>Income Tax (ERI)</h3>' +
          '<span class="badge" style="background:var(--green-soft);color:var(--green)">Connected</span></div>' +
          '<div class="card-b"><p class="muted" style="font-size:12.5px;margin-bottom:12px">Form 26AS, AIS / TIS, ' +
          'prefill data, filing status, demands and refunds. Requires client OTP.</p>' +
          '<div class="field"><label>Client</label><select id="ic">' +
            Store.db.clients.map(function (c) { return '<option value="' + c.id + '">' + E(c.name) + '</option>'; }).join('') +
          '</select></div>' +
          '<button class="btn btn-ghost btn-block" id="icGo">Fetch with Consent</button></div></div>' +

        '<div class="card"><div class="card-h"><h3>MCA21</h3>' +
          '<span class="badge" style="background:var(--brass-soft);color:var(--brass-d)">Public data</span></div>' +
          '<div class="card-b"><p class="muted" style="font-size:12.5px;margin-bottom:12px">Company master data, ' +
          'directors, charges and filing history.</p>' +
          '<div class="field"><label>CIN / LLPIN</label><input id="im" placeholder="U01100AP2018PTC012345" ' +
          'style="font-family:var(--mono)"></div>' +
          '<button class="btn btn-ghost btn-block" id="imGo">Look Up Company</button></div></div>' +
      '</div>' +

      '<div class="card mb"><div class="card-h"><h3>API Console</h3>' +
        '<span class="sub">simulated responses</span></div><div class="card-b">' +
        '<div class="api-log" id="console"><div class="dim">Ready. Run a call above to see the request and response.</div></div>' +
      '</div></div>' +

      '<div class="card"><div class="card-h"><h3>Sync Log</h3><span class="sub">' +
        Store.db.syncLog.length + ' entries</span></div><div class="tbl-wrap">' +
        '<table class="tbl"><thead><tr><th>When</th><th>Source</th><th>Client</th><th>Action</th><th>Result</th><th>By</th></tr></thead><tbody>' +
        Store.db.syncLog.slice(0, 25).map(function (l) {
          return '<tr><td class="nowrap" style="font-size:12px">' + UI.fmtDateTime(l.at) + '</td>' +
            '<td><span class="tag">' + E(l.source) + '</span></td>' +
            '<td style="font-size:12.5px">' + (l.clientId === 'ALL' ? 'All clients' : E((Store.client(l.clientId) || {}).name || l.clientId)) + '</td>' +
            '<td style="font-size:12.5px">' + E(l.action) + '</td>' +
            '<td style="font-size:12px;color:' + (l.result.indexOf('Success') === 0 ? 'var(--green)' : 'var(--red)') + '">' + E(l.result) + '</td>' +
            '<td style="font-size:12px">' + E(Store.actorName(l.by)) + '</td></tr>';
        }).join('') + '</tbody></table></div></div>';

    var con = document.getElementById('console');
    function log(lines) { con.innerHTML = lines.join(''); }

    document.getElementById('igGo').onclick = function () {
      var g = document.getElementById('ig').value.toUpperCase().trim();
      var b = document.getElementById('igGo');
      b.disabled = true; b.innerHTML = '<span class="spinner"></span> Calling…';
      log(['<div class="dim">POST https://api.gsp-provider.in/v1/taxpayer/search</div>',
           '<div class="dim">Authorization: Bearer &lt;gsp-token&gt;</div>',
           '<div class="dim">{ "gstin": "' + E(g) + '" }</div>',
           '<div class="dim">…</div>']);
      Store.gstSearch(g).then(function (r) {
        log(['<div class="dim">POST /v1/taxpayer/search</div>', '<div class="ok">200 OK (' + Math.round(600 + Math.random() * 700) + ' ms)</div>',
             '<div>{</div>',
             '<div>  "lgnm"          : "' + E(r.lgnm) + '",</div>',
             '<div>  "tradeNam"      : "' + E(r.tradeNam) + '",</div>',
             '<div>  "ctb"           : "' + E(r.ctb) + '",</div>',
             '<div>  "rgdt"          : "' + E(r.rgdt) + '",</div>',
             '<div>  "sts"           : "' + E(r.sts) + '",</div>',
             '<div>  "aggreTurnOver" : "' + E(r.aggreTurnOver) + '",</div>',
             '<div>  "dty"           : "' + E(r.dty) + '",</div>',
             '<div>  "einvoiceStatus": "' + E(r.einv) + '",</div>',
             '<div>  "pradr"         : "' + E(r.pradr) + '",</div>',
             '<div>  "stj"           : "' + E(r.stj) + '"</div>',
             '<div>}</div>']);
        Store.logSync('GSTN', 'ALL', 'Taxpayer search (console)', 'Success — ' + r.lgnm, me.id); Store.save();
        b.disabled = false; b.textContent = 'Search Taxpayer';
      }).catch(function (e) {
        log(['<div class="dim">POST /v1/taxpayer/search</div>', '<div class="er">404 NOT FOUND</div>',
             '<div class="er">' + E(e.message) + '</div>']);
        b.disabled = false; b.textContent = 'Search Taxpayer';
      });
    };

    document.getElementById('icGo').onclick = function () {
      var cid = document.getElementById('ic').value, c = Store.client(cid);
      var b = document.getElementById('icGo');
      b.disabled = true; b.innerHTML = '<span class="spinner dark"></span> Requesting consent…';
      log(['<div class="dim">POST https://eri.incometax.gov.in/v1/consent/otp</div>',
           '<div class="dim">{ "pan": "' + E(c.pan) + '", "mobile": "' + E(c.phone.replace(/\d(?=\d{4})/g, 'X')) + '" }</div>',
           '<div class="ok">200 OK — OTP dispatched to the client\'s registered mobile</div>',
           '<div class="dim">waiting for client to share the OTP…</div>',
           '<div class="ok">consent verified</div>',
           '<div class="dim">POST /v1/taxpayer/26as</div>']);
      Store.itFetch(cid, true).then(function (r) {
        log(['<div class="dim">POST /v1/taxpayer/26as + /ais</div>',
             '<div class="ok">200 OK — consent token valid</div>',
             '<div>{</div>',
             '<div>  "pan"               : "' + E(r.pan) + '",</div>',
             '<div>  "panStatus"         : "' + E(r.panStatus) + '",</div>',
             '<div>  "aadhaarLink"       : "' + E(r.aadhaarLinked) + '",</div>',
             '<div>  "assessmentYear"    : "' + E(r.ay) + '",</div>',
             '<div>  "returnFiled"       : "' + E(r.returnFiled) + '",</div>',
             '<div>  "tdsCredits"        : ' + r.tdsCredits + ',</div>',
             '<div>  "advanceTaxPaid"    : ' + r.advanceTax + ',</div>',
             '<div>  "refundStatus"      : "' + E(r.refundStatus) + '",</div>',
             '<div class="' + (r.outstandingDemand === 'Nil' ? '' : 'er') + '">  "outstandingDemand" : "' + E(r.outstandingDemand) + '",</div>',
             '<div>  "sftTransactions"   : ' + r.highValue.length + '</div>',
             '<div>}</div>']);
        Store.logSync('Income Tax (ERI)', cid, '26AS + AIS fetch (console)', 'Success — consent verified', me.id); Store.save();
        b.disabled = false; b.textContent = 'Fetch with Consent';
        if (r.outstandingDemand !== 'Nil') {
          UI.toast('Outstanding demand detected for ' + c.name, 'err');
        } else UI.toast('Income tax record fetched', 'ok');
      });
    };

    document.getElementById('imGo').onclick = function () {
      var cin = document.getElementById('im').value.trim();
      var c = Store.db.clients.filter(function (x) { return x.cin === cin; })[0];
      var b = document.getElementById('imGo');
      b.disabled = true; b.innerHTML = '<span class="spinner dark"></span> Looking up…';
      setTimeout(function () {
        if (!c) {
          log(['<div class="dim">GET https://mca.gov.in/api/company/' + E(cin) + '</div>',
               '<div class="er">404 — CIN not found. Try U01100AP2018PTC012345</div>']);
        } else {
          log(['<div class="dim">GET /api/company/' + E(cin) + '</div>', '<div class="ok">200 OK</div>',
               '<div>{</div>',
               '<div>  "cin"            : "' + E(c.cin) + '",</div>',
               '<div>  "companyName"    : "' + E(c.name) + '",</div>',
               '<div>  "class"          : "Private",</div>',
               '<div>  "status"         : "Active",</div>',
               '<div>  "dateOfIncorp"   : "' + E(c.regDate) + '",</div>',
               '<div>  "registeredOffice": "' + E(c.address) + '",</div>',
               '<div>  "directors"      : 3,</div>',
               '<div>  "lastAOC4"       : "' + E(Store.prevFY()) + '",</div>',
               '<div>  "lastMGT7"       : "' + E(Store.prevFY()) + '",</div>',
               '<div>  "openCharges"    : 1</div>',
               '<div>}</div>']);
          Store.logSync('MCA21', c.id, 'Company master data', 'Success — status Active', me.id); Store.save();
        }
        b.disabled = false; b.textContent = 'Look Up Company';
      }, 1000);
    };
  }

  /* ================= BILLING ================= */
  function vBilling(v) {
    var invs = Store.db.invoices;
    var out = invs.filter(function (i) { return i.status !== 'Paid'; }).reduce(function (s, i) { return s + i.total; }, 0);
    var paid = invs.filter(function (i) { return i.status === 'Paid'; }).reduce(function (s, i) { return s + i.total; }, 0);
    var overdue = invs.filter(function (i) { return i.status === 'Overdue'; });
    var unbilled = Store.db.jobs.filter(function (j) { return j.status === 'completed' && !j.invoiceId; });

    v.innerHTML =
      '<div class="grid g-4 mb">' +
        kpi('Collected', UI.shortMoney(paid), invs.filter(function (i) { return i.status === 'Paid'; }).length + ' invoices', 'k-green') +
        kpi('Outstanding', UI.shortMoney(out), invs.filter(function (i) { return i.status !== 'Paid'; }).length + ' invoices', 'k-brass') +
        kpi('Overdue', UI.shortMoney(overdue.reduce(function (s, i) { return s + i.total; }, 0)), overdue.length + ' invoices', overdue.length ? 'k-red' : 'k-green') +
        kpi('Unbilled Work', unbilled.length, 'completed jobs not yet invoiced', unbilled.length ? 'k-violet' : 'k-green') +
      '</div>' +
      (unbilled.length ? '<div class="card mb"><div class="card-h"><h3>Completed Work Not Yet Invoiced</h3></div>' +
        '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Job</th><th>Client</th><th class="num">Fee</th><th></th></tr></thead><tbody>' +
        unbilled.map(function (j) {
          return '<tr><td><b>' + E(j.title) + '</b><div class="muted mono" style="font-size:11px">' + E(j.id) + '</div></td>' +
            '<td>' + E(Store.client(j.clientId).name) + '</td><td class="num">' + UI.money(j.fee) + '</td>' +
            '<td class="right"><button class="btn btn-brass btn-sm" data-inv="' + j.id + '">Raise Invoice</button></td></tr>';
        }).join('') + '</tbody></table></div></div>' : '') +
      '<div class="card"><div class="card-h"><h3>All Invoices</h3></div><div class="tbl-wrap">' +
        '<table class="tbl"><thead><tr><th>Invoice</th><th>Client</th><th>Date</th><th class="num">Fee</th>' +
        '<th class="num">GST</th><th class="num">Total</th><th>Status</th><th></th></tr></thead><tbody>' +
        invs.map(function (i) {
          var col = i.status === 'Paid' ? 'var(--green)' : i.status === 'Overdue' ? 'var(--red)' : 'var(--brass-d)';
          var bg = i.status === 'Paid' ? 'var(--green-soft)' : i.status === 'Overdue' ? 'var(--red-soft)' : 'var(--brass-soft)';
          return '<tr><td class="mono"><b>' + E(i.id) + '</b></td>' +
            '<td>' + E((Store.client(i.clientId) || {}).name || '—') + '</td>' +
            '<td>' + UI.fmtDate(i.date) + '</td>' +
            '<td class="num">' + UI.money(i.amount) + '</td><td class="num">' + UI.money(i.gst) + '</td>' +
            '<td class="num"><b>' + UI.money(i.total) + '</b></td>' +
            '<td><span class="badge" style="background:' + bg + ';color:' + col + '">' + E(i.status) + '</span></td>' +
            '<td class="right">' + (i.status !== 'Paid'
              ? '<button class="btn btn-ghost btn-sm" data-remind="' + E(i.id) + '">Remind</button>' +
                ' <button class="btn btn-green btn-sm" data-mark="' + E(i.id) + '">Mark Paid</button>' : '') + '</td></tr>';
        }).join('') + '</tbody></table></div></div>';

    Array.prototype.forEach.call(v.querySelectorAll('[data-inv]'), function (b) {
      b.onclick = function () {
        var j = Store.job(b.dataset.inv);
        var inv = Store.raiseInvoice(j, me.id);
        UI.toast(inv.id + ' raised for ' + UI.money(inv.total), 'ok'); route();
      };
    });
    Array.prototype.forEach.call(v.querySelectorAll('[data-mark]'), function (b) {
      b.onclick = function () {
        var i = Store.db.invoices.filter(function (x) { return x.id === b.dataset.mark; })[0];
        i.status = 'Paid'; i.paidOn = Store.isoOf(Store.today()); i.mode = 'Recorded manually';
        Store.save(); UI.toast(i.id + ' marked as paid', 'ok'); route();
      };
    });
    Array.prototype.forEach.call(v.querySelectorAll('[data-remind]'), function (b) {
      b.onclick = function () {
        var i = Store.db.invoices.filter(function (x) { return x.id === b.dataset.remind; })[0];
        Store.notify(i.clientId, 'Reminder: invoice ' + i.id + ' for ' + UI.money(i.total) + ' is outstanding.');
        Store.save(); UI.toast('Reminder sent for ' + i.id, 'ok');
      };
    });
  }

  /* ================= TEAM & WORKLOAD ================= */
  function vStaff(v) {
    var rows = Store.db.staff.map(function (s) {
      var all = Store.jobsOf(s.id);
      var open = all.filter(function (j) { return j.status !== 'completed'; });
      var late = open.filter(Store.overdue);
      return { s: s, all: all, open: open, late: late, load: Math.round(open.length / s.capacity * 100) };
    });
    var maxOpen = Math.max.apply(null, rows.map(function (r) { return r.open.length; })) || 1;

    v.innerHTML =
      '<div class="grid g-2 mb">' +
        '<div class="card"><div class="card-h"><h3>Open Jobs per Team Member</h3></div><div class="card-b">' +
          '<div class="chart">' + rows.map(function (r) {
            return '<div class="col"><span class="cv">' + r.open.length + '</span>' +
              '<div class="bar2" style="height:' + Math.round(r.open.length / maxOpen * 100) + '%;background:' +
              UI.avColor(r.s.id) + '"></div>' +
              '<span class="cl">' + E(r.s.name.replace('CA ', '').split(' ')[0]) + '</span></div>';
          }).join('') + '</div></div></div>' +
        '<div class="card"><div class="card-h"><h3>Capacity Utilisation</h3><span class="sub">open jobs vs capacity</span></div>' +
          '<div class="card-b">' + rows.map(function (r) {
            var col = r.load > 90 ? 'var(--red)' : r.load > 65 ? 'var(--brass)' : 'var(--green)';
            return '<div class="hbar"><div class="hl"><span>' + E(r.s.name) + '</span>' +
              '<span class="mono">' + r.open.length + ' / ' + r.s.capacity + ' · ' + r.load + '%</span></div>' +
              '<div class="ht"><i style="width:' + Math.min(100, r.load) + '%;background:' + col + '"></i></div></div>';
          }).join('') + '</div></div>' +
      '</div>' +
      '<div class="card"><div class="card-h"><h3>Team</h3></div><div class="tbl-wrap"><table class="tbl"><thead><tr>' +
      '<th>Member</th><th>Role</th><th>Skills</th><th class="num">Open</th><th class="num">Overdue</th>' +
      '<th class="num">Completed</th><th>Contact</th></tr></thead><tbody>' +
      rows.map(function (r) {
        return '<tr><td><div class="row" style="gap:10px;flex-wrap:nowrap">' + UI.avatar(r.s.name, r.s.id, 30) +
          '<span><b>' + E(r.s.name) + '</b><div class="muted" style="font-size:11px">' + E(r.s.desig) + '</div></span></div></td>' +
          '<td><span class="tag" style="background:' + (r.s.role === 'partner' ? 'var(--brass-soft)' : 'var(--line-2)') + '">' +
            (r.s.role === 'partner' ? 'Partner' : 'Staff') + '</span></td>' +
          '<td>' + r.s.skills.map(function (k) { return '<span class="tag" style="margin-right:3px">' + E(k) + '</span>'; }).join('') + '</td>' +
          '<td class="num">' + r.open.length + '</td>' +
          '<td class="num">' + (r.late.length ? '<span style="color:var(--red);font-weight:700">' + r.late.length + '</span>' : '0') + '</td>' +
          '<td class="num">' + (r.all.length - r.open.length) + '</td>' +
          '<td style="font-size:12px">' + E(r.s.email) + '<div class="muted">' + E(r.s.phone) + '</div></td></tr>';
      }).join('') + '</tbody></table></div></div>';
  }

  /* ================= LEADS ================= */
  function vLeads(v) {
    var leads = Store.db.leads;
    v.innerHTML =
      '<div class="alert alert-teal"><span class="ic">&#8505;</span><span>Enquiries submitted through the contact form ' +
      'on the public website land here automatically.</span></div>' +
      '<div class="card"><div class="card-h"><h3>Enquiries</h3><span class="sub">' + leads.length + '</span></div>' +
      (leads.length ? '<div class="tbl-wrap"><table class="tbl"><thead><tr>' +
        '<th>Received</th><th>Name</th><th>Contact</th><th>Service</th><th>Message</th><th>Status</th><th></th>' +
        '</tr></thead><tbody>' + leads.map(function (l) {
          return '<tr><td class="nowrap" style="font-size:12px">' + UI.fmtDateTime(l.at) + '</td>' +
            '<td><b>' + E(l.name) + '</b></td>' +
            '<td style="font-size:12px">' + E(l.email) + '<div class="muted">' + E(l.phone || '—') + '</div></td>' +
            '<td><span class="tag">' + E(l.service || '—') + '</span></td>' +
            '<td style="max-width:280px;font-size:12.5px">' + E(l.message) + '</td>' +
            '<td><span class="badge" style="background:' + (l.status === 'New' ? 'var(--brass-soft)' : 'var(--green-soft)') +
              ';color:' + (l.status === 'New' ? 'var(--brass-d)' : 'var(--green)') + '">' + E(l.status) + '</span></td>' +
            '<td class="right">' + (l.status === 'New'
              ? '<button class="btn btn-ghost btn-sm" data-lead="' + E(l.id) + '">Mark contacted</button>' : '') + '</td></tr>';
        }).join('') + '</tbody></table></div>'
        : '<div class="empty"><div class="ic">&#9993;</div><h4>No enquiries yet</h4>' +
          '<p>Submit the contact form on the public website and it will appear here.</p></div>') + '</div>';

    Array.prototype.forEach.call(v.querySelectorAll('[data-lead]'), function (b) {
      b.onclick = function () {
        var l = Store.db.leads.filter(function (x) { return x.id === b.dataset.lead; })[0];
        l.status = 'Contacted'; Store.save(); UI.toast('Marked as contacted', 'ok'); route();
      };
    });
  }

  /* ================= REPORTS ================= */
  function vReports(v) {
    var jobs = Store.db.jobs;
    var byCat = {}, bySvc = {}, byClient = {};
    jobs.forEach(function (j) {
      byCat[j.cat] = (byCat[j.cat] || 0) + 1;
      bySvc[j.serviceId] = (bySvc[j.serviceId] || 0) + j.fee;
      byClient[j.clientId] = (byClient[j.clientId] || 0) + j.fee;
    });
    var maxCat = Math.max.apply(null, Object.keys(byCat).map(function (k) { return byCat[k]; })) || 1;
    var svcRows = Object.keys(bySvc).map(function (k) { return { k: k, v: bySvc[k] }; })
                    .sort(function (a, b) { return b.v - a.v; }).slice(0, 8);
    var maxSvc = svcRows.length ? svcRows[0].v : 1;
    var cliRows = Object.keys(byClient).map(function (k) { return { k: k, v: byClient[k] }; })
                    .sort(function (a, b) { return b.v - a.v; });
    var maxCli = cliRows.length ? cliRows[0].v : 1;

    var completed = jobs.filter(function (j) { return j.status === 'completed'; });
    var avgTat = completed.length ? Math.round(completed.reduce(function (s, j) {
      return s + Math.max(0, (new Date(j.closedAt || j.dueDate) - new Date(j.createdAt)) / 86400000);
    }, 0) / completed.length) : 0;
    var onTime = completed.filter(function (j) {
      return new Date(j.closedAt || j.dueDate) <= new Date(j.dueDate);
    }).length;

    v.innerHTML =
      '<div class="grid g-4 mb">' +
        kpi('Total Jobs', jobs.length, 'across ' + Store.db.clients.length + ' clients', '') +
        kpi('Completed', completed.length, Math.round(completed.length / jobs.length * 100) + '% of all jobs', 'k-green') +
        kpi('Avg Turnaround', avgTat + ' days', 'from creation to release', 'k-violet') +
        kpi('On-time Delivery', completed.length ? Math.round(onTime / completed.length * 100) + '%' : '—',
            onTime + ' of ' + completed.length + ' within target', onTime === completed.length ? 'k-green' : 'k-brass') +
      '</div>' +
      '<div class="grid g-2 mb">' +
        '<div class="card"><div class="card-h"><h3>Jobs by Service Line</h3></div><div class="card-b">' +
          '<div class="chart">' + Object.keys(byCat).map(function (k) {
            return '<div class="col"><span class="cv">' + byCat[k] + '</span>' +
              '<div class="bar2" style="height:' + Math.round(byCat[k] / maxCat * 100) + '%"></div>' +
              '<span class="cl">' + E(k) + '</span></div>';
          }).join('') + '</div></div></div>' +
        '<div class="card"><div class="card-h"><h3>Fee Value by Service</h3><span class="sub">gross of GST</span></div>' +
          '<div class="card-b">' + svcRows.map(function (r) {
            var s = Store.service(r.k);
            return '<div class="hbar"><div class="hl"><span>' + E(s ? s.name : r.k) + '</span>' +
              '<span class="mono">' + UI.money(r.v) + '</span></div>' +
              '<div class="ht"><i style="width:' + Math.round(r.v / maxSvc * 100) + '%;background:var(--teal)"></i></div></div>';
          }).join('') + '</div></div>' +
      '</div>' +
      '<div class="grid g-2">' +
        '<div class="card"><div class="card-h"><h3>Fee Value by Client</h3></div><div class="card-b">' +
          cliRows.map(function (r) {
            var c = Store.client(r.k);
            return '<div class="hbar"><div class="hl"><span>' + E(c ? c.name : r.k) + '</span>' +
              '<span class="mono">' + UI.money(r.v) + '</span></div>' +
              '<div class="ht"><i style="width:' + Math.round(r.v / maxCli * 100) + '%;background:' +
              UI.avColor(r.k) + '"></i></div></div>';
          }).join('') + '</div></div>' +
        '<div class="card"><div class="card-h"><h3>Document Pendency</h3>' +
          '<span class="sub">clients holding up work</span></div><div class="card-b">' +
          (function () {
            var pend = jobs.filter(function (j) { return j.status === 'docs_pending' || j.status === 'query_raised'; });
            if (!pend.length) return '<div class="alert alert-green" style="margin:0"><span class="ic">&#10003;</span>' +
              '<span>No jobs are blocked on client documents.</span></div>';
            return '<table class="tbl"><thead><tr><th>Client</th><th>Job</th><th class="num">Pending</th></tr></thead><tbody>' +
              pend.map(function (j) {
                var cl = Store.checklistDone(j);
                return '<tr class="clickable" data-job="' + j.id + '"><td>' + E(Store.client(j.clientId).name) + '</td>' +
                  '<td style="font-size:12.5px">' + E(j.title) + '</td>' +
                  '<td class="num">' + (j.status === 'query_raised' ? 'query' : (cl.total - cl.done) + ' docs') + '</td></tr>';
              }).join('') + '</tbody></table>';
          })() +
        '</div></div>' +
      '</div>';
    wireJobs(v);
  }

  /* ================= WEBSITE MEDIA ================= */
  /* Upload the banners that scroll on the home page, and the firm's
     logo. Everything is stored in the browser, so the site stays
     offline. Changes show on the public page after a reload. */
  function vMedia(v) {
    var list = Media.banners();
    var kb = Math.round(Media.usageBytes() / 1024);

    document.getElementById('tact').innerHTML =
      '<a class="btn btn-ghost btn-sm" href="index.html" target="_blank">Open website &#8599;</a>' +
      '<button class="btn btn-brass btn-sm" id="addBanner">+ Upload Banner</button>';

    v.innerHTML =
      '<div class="alert alert-teal"><span class="ic">&#8505;</span><span>Banners uploaded here scroll ' +
      'automatically at the top of the home page. Reorder them, write a caption, point them at a page, or switch ' +
      'one off without deleting it. <b>Reload the website after saving to see the change.</b></span></div>' +

      '<div class="grid g-side">' +

        /* ---- banners ---- */
        '<div><div class="card mb"><div class="card-h"><h3>Home Page Banners</h3>' +
          '<span class="sub">' + list.length + ' image(s) &middot; ' + kb + ' KB stored</span></div>' +
          '<div class="card-b" id="bList"></div></div>' +

          '<div class="card"><div class="card-h"><h3>Rotation Speed</h3>' +
            '<span class="sub">how long each banner stays on screen</span></div><div class="card-b">' +
            '<div class="row"><input type="range" id="spd" min="2000" max="12000" step="500" ' +
              'value="' + Media.interval() + '" style="flex:1">' +
            '<b class="mono" id="spdVal" style="width:70px;text-align:right">' +
              (Media.interval() / 1000).toFixed(1) + ' s</b></div>' +
          '</div></div>' +
        '</div>' +

        /* ---- logo + drop-in help ---- */
        '<div>' +
          '<div class="card mb"><div class="card-h"><h3>Firm Logo</h3>' +
            '<span class="sub">two variants</span></div><div class="card-b">' +

            '<div class="sec-title">Main &mdash; for light backgrounds</div>' +
            '<div style="background:var(--paper);border:1px solid var(--line);border-radius:var(--rad);' +
              'padding:20px;display:grid;place-items:center;margin-bottom:10px">' +
              '<img id="logoPrev" src="' + (Media.logo() || 'assets/img/ca-india.png') + '" ' +
                'alt="Logo" style="max-height:80px;max-width:100%;object-fit:contain">' +
            '</div>' +
            '<button class="btn btn-teal btn-block mb-s" id="logoUp">Upload Main Logo</button>' +
            (Media.logo() ? '<button class="btn btn-ghost btn-block mb" id="logoClr">Remove &amp; use the file on disk</button>' : '<div class="mb"></div>') +

            '<div class="sec-title">Light &mdash; for the dark footer, portal &amp; console</div>' +
            '<div style="background:var(--ink);border:1px solid var(--line);border-radius:var(--rad);' +
              'padding:20px;display:grid;place-items:center;margin-bottom:10px">' +
              '<img id="logoPrevL" src="' + (Media.logo('light') || 'assets/img/ca-india-light.png') + '" ' +
                'alt="Logo, light" style="max-height:80px;max-width:100%;object-fit:contain">' +
            '</div>' +
            '<button class="btn btn-ghost btn-block mb-s" id="logoUpL">Upload Light Logo</button>' +
            (Media.logo('light') ? '<button class="btn btn-ghost btn-block" id="logoClrL">Remove &amp; use the file on disk</button>' : '') +

            '<p class="muted" style="font-size:12px;margin-top:14px">Use a PNG with a <b>transparent</b> ' +
            'background. The main logo appears in the website header; the light one is used wherever the ' +
            'background is dark navy &mdash; a dark-blue logo would disappear there.</p>' +
          '</div></div>' +

          '<div class="card"><div class="card-h"><h3>Drop-in Files</h3>' +
            '<span class="sub">no upload needed</span></div><div class="card-b">' +
            '<p class="muted" style="font-size:12.5px;margin-bottom:12px">Prefer to copy files straight into the ' +
            'folder? Save them into <b class="mono">assets\\img\\</b> with these exact names and the site picks ' +
            'them up on the next reload:</p>' +
            '<div class="api-log" style="max-height:none">' +
              '<div>banner-1.png</div><div>banner-2.png</div><div>banner-3.png</div>' +
              '<div class="dim">… up to banner-6.png (.jpg also works)</div>' +
              '<div style="margin-top:8px">ca-india.png <span class="dim">&larr; logo, light backgrounds</span></div>' +
              '<div>ca-india-light.png <span class="dim">&larr; logo, dark backgrounds</span></div>' +
            '</div>' +
            '<p class="muted" style="font-size:12px;margin-top:12px">Drop-in banners take priority over the ' +
            'built-in placeholder images.</p>' +
            '<button class="btn btn-ghost btn-block mt-s" id="restoreB">Restore built-in banners</button>' +
          '</div></div>' +
        '</div>' +
      '</div>' +
      '<input type="file" id="mFile" accept="image/*" style="display:none">' +
      '<input type="file" id="lFile" accept="image/png,image/svg+xml,image/*" style="display:none">';

    drawBanners();

    function drawBanners() {
      var bl = Media.banners();
      var host = document.getElementById('bList');
      if (!bl.length) {
        host.innerHTML = '<div class="empty"><div class="ic">&#128247;</div><h4>No banners</h4>' +
          '<p>Upload an image to start the scrolling strip on the home page.</p></div>';
        return;
      }
      host.innerHTML = bl.map(function (b, i) {
        return '<div class="media-row' + (b.active ? '' : ' off') + '">' +
          '<img class="media-thumb" src="' + E(b.src) + '" alt="">' +
          '<div class="media-meta">' +
            '<b>' + E(b.name) + '</b>' +
            (b.builtin ? ' <span class="tag">built-in</span>' : '') +
            (b.active ? '' : ' <span class="tag" style="background:var(--red-soft);color:var(--red)">hidden</span>') +
            '<div class="media-fields">' +
              '<input data-cap="' + b.id + '" placeholder="Caption shown over the image" value="' + E(b.caption || '') + '">' +
              '<select data-link="' + b.id + '">' +
                [['', 'No link'], ['#calendar', 'Compliance calendar'], ['#services', 'Services'],
                 ['#contact', 'Contact'], ['portal.html', 'Client portal']].map(function (o) {
                  return '<option value="' + o[0] + '"' + (b.link === o[0] ? ' selected' : '') + '>' + E(o[1]) + '</option>';
                }).join('') +
              '</select>' +
            '</div>' +
            (b.w ? '<div class="muted" style="font-size:11px;margin-top:5px">' + b.w + '&times;' + b.h +
                   ' &middot; ' + Math.round((b.bytes || 0) / 1024) + ' KB</div>' : '') +
          '</div>' +
          '<div class="media-actions">' +
            '<button class="btn btn-ghost btn-sm" data-up2="' + b.id + '"' + (i === 0 ? ' disabled' : '') + '>&#8593;</button>' +
            '<button class="btn btn-ghost btn-sm" data-dn="' + b.id + '"' + (i === bl.length - 1 ? ' disabled' : '') + '>&#8595;</button>' +
            '<button class="btn btn-ghost btn-sm" data-tog="' + b.id + '">' + (b.active ? 'Hide' : 'Show') + '</button>' +
            '<button class="btn btn-red btn-sm" data-del="' + b.id + '">Delete</button>' +
          '</div></div>';
      }).join('');

      each('[data-up2]', function (n) { n.onclick = function () { Media.move(n.dataset.up2, -1); drawBanners(); }; });
      each('[data-dn]',  function (n) { n.onclick = function () { Media.move(n.dataset.dn, 1); drawBanners(); }; });
      each('[data-tog]', function (n) {
        n.onclick = function () {
          var b = Media.banners().filter(function (x) { return x.id === n.dataset.tog; })[0];
          Media.updateBanner(n.dataset.tog, { active: !b.active }); drawBanners();
        };
      });
      each('[data-del]', function (n) {
        n.onclick = function () {
          UI.confirm('Delete this banner?', 'It will be removed from the home page immediately.',
            'Delete', function () { Media.removeBanner(n.dataset.del); drawBanners(); UI.toast('Banner deleted', 'ok'); }, 'btn-red');
        };
      });
      each('[data-cap]', function (n) {
        n.onchange = function () { Media.updateBanner(n.dataset.cap, { caption: n.value }); UI.toast('Caption saved', 'ok'); };
      });
      each('[data-link]', function (n) {
        n.onchange = function () { Media.updateBanner(n.dataset.link, { link: n.value }); UI.toast('Link saved', 'ok'); };
      });
    }

    function each(sel, fn) { Array.prototype.forEach.call(v.querySelectorAll(sel), fn); }

    /* upload a banner */
    var mFile = document.getElementById('mFile');
    document.getElementById('addBanner').onclick = function () { mFile.click(); };
    mFile.onchange = function () {
      var f = mFile.files[0]; mFile.value = '';
      if (!f) return;
      UI.toast('Processing ' + f.name + '…');
      Media.addBanner(f).then(function (b) {
        UI.toast('Banner added — reload the website to see it', 'ok');
        route();
      }).catch(function (e) { UI.toast(e.message, 'err'); });
    };

    /* logo — one file input, reused for both variants */
    var lFile = document.getElementById('lFile');
    var wantVariant = 'main';
    document.getElementById('logoUp').onclick = function () { wantVariant = 'main'; lFile.click(); };
    document.getElementById('logoUpL').onclick = function () { wantVariant = 'light'; lFile.click(); };
    lFile.onchange = function () {
      var f = lFile.files[0]; lFile.value = '';
      if (!f) return;
      Media.setLogo(f, wantVariant).then(function () {
        UI.toast((wantVariant === 'light' ? 'Light logo' : 'Logo') + ' updated across the whole site', 'ok');
        Media.applyLogo(document);
        route();
      }).catch(function (e) { UI.toast(e.message, 'err'); });
    };
    [['logoClr', 'main'], ['logoClrL', 'light']].forEach(function (p) {
      var b = document.getElementById(p[0]);
      if (b) b.onclick = function () {
        Media.clearLogo(p[1]); Media.applyLogo(document);
        UI.toast('Reverted to the file on disk', 'ok'); route();
      };
    });

    document.getElementById('restoreB').onclick = function () {
      UI.confirm('Restore built-in banners?',
        'The three placeholder banners come back. Banners you uploaded are removed.',
        'Restore', function () { Media.restoreDefaults(); UI.toast('Built-in banners restored', 'ok'); route(); });
    };

    var spd = document.getElementById('spd');
    spd.oninput = function () { document.getElementById('spdVal').textContent = (spd.value / 1000).toFixed(1) + ' s'; };
    spd.onchange = function () { Media.setInterval(+spd.value); UI.toast('Rotation speed saved', 'ok'); };
  }

  /* ================= CALENDAR ================= */
  function vCalendar(v) {
    var now = new Date(), view = { y: now.getFullYear(), m: now.getMonth() + 1 };
    var active = { gst: true, it: true, tds: true, roc: true, labour: true };

    v.innerHTML =
      '<div class="grid g-side">' +
        '<div class="card"><div class="card-h">' +
          '<div><h3 id="mLbl"></h3><div class="sub" id="mSub"></div></div>' +
          '<div class="row"><button class="btn btn-ghost btn-sm" id="pv">&#8249;</button>' +
          '<button class="btn btn-ghost btn-sm" id="td">Today</button>' +
          '<button class="btn btn-ghost btn-sm" id="nx">&#8250;</button></div></div>' +
          '<div class="card-b" style="padding:12px 20px"><div class="row" id="chips"></div></div>' +
          '<div class="card-b tight"><div class="mini-cal" id="mc"></div></div></div>' +
        '<div class="card"><div class="card-h"><h3>Next 60 Days</h3></div>' +
          '<div class="card-b tight" id="up"></div></div>' +
      '</div>';

    function chips() {
      document.getElementById('chips').innerHTML = Object.keys(DueDates.CATS).map(function (k) {
        var c = DueDates.CATS[k];
        return '<button class="tag" data-cat="' + k + '" style="cursor:pointer;padding:5px 11px;background:' +
          (active[k] ? c.soft : 'var(--line-2)') + ';color:' + (active[k] ? c.color : 'var(--ink-mute)') + '">' +
          E(c.label) + '</button>';
      }).join('');
      Array.prototype.forEach.call(document.querySelectorAll('#chips [data-cat]'), function (b) {
        b.onclick = function () { active[b.dataset.cat] = !active[b.dataset.cat]; chips(); draw(); };
      });
    }

    function draw() {
      var evs = DueDates.eventsForMonth(view.y, view.m).filter(function (e) { return active[e.cat]; });
      var byDay = {}; evs.forEach(function (e) { (byDay[e.day] = byDay[e.day] || []).push(e); });
      document.getElementById('mLbl').textContent = DueDates.MONTHS[view.m - 1] + ' ' + view.y;
      document.getElementById('mSub').textContent = evs.length + ' statutory due date(s)';

      var lead = new Date(view.y, view.m - 1, 1).getDay(), days = new Date(view.y, view.m, 0).getDate();
      var h = ['S','M','T','W','T','F','S'].map(function (d) { return '<div class="dow">' + d + '</div>'; }).join('');
      for (var i = 0; i < lead; i++) h += '<div class="d pad"></div>';
      for (var d = 1; d <= days; d++) {
        var list = byDay[d] || [];
        var isT = (view.y === now.getFullYear() && view.m === now.getMonth() + 1 && d === now.getDate());
        h += '<div class="d' + (isT ? ' today' : '') + '"><span class="n">' + d + '</span>' +
          list.slice(0, 4).map(function (e) {
            return '<div class="ev" style="background:' + e.soft + ';color:' + e.color + '" title="' +
              E(e.form + ' — ' + e.title + ' (' + e.who + ')') + '">' + E(e.form) + '</div>';
          }).join('') +
          (list.length > 4 ? '<div class="ev" style="color:var(--ink-mute)">+' + (list.length - 4) + '</div>' : '') + '</div>';
      }
      var tail = (7 - ((lead + days) % 7)) % 7;
      for (var t = 0; t < tail; t++) h += '<div class="d pad"></div>';
      document.getElementById('mc').innerHTML = h;

      document.getElementById('up').innerHTML = DueDates.upcoming(60)
        .filter(function (e) { return active[e.cat]; }).slice(0, 16).map(function (e) {
          var n = DueDates.daysUntil(e.date);
          return '<div style="display:flex;gap:12px;padding:11px 20px;border-bottom:1px solid var(--line-2);align-items:center">' +
            '<div style="width:44px;text-align:center;border:1px solid ' + e.color + ';border-radius:3px;padding:3px 0;flex-shrink:0">' +
            '<b class="display" style="display:block;font-size:1.05rem;line-height:1">' + parseInt(e.date.split('-')[2], 10) + '</b>' +
            '<span class="mono" style="font-size:9px;text-transform:uppercase;color:var(--ink-mute)">' +
            UI.MON[parseInt(e.date.split('-')[1], 10) - 1] + '</span></div>' +
            '<div style="flex:1;min-width:0"><b style="font-size:12.5px">' + E(e.form) + '</b>' +
            '<div class="muted" style="font-size:11.5px">' + E(e.title) + (e.period ? ' · ' + E(e.period) : '') + '</div></div>' +
            '<span class="mono" style="font-size:11px;color:' + (n <= 3 ? 'var(--red)' : 'var(--ink-mute)') + '">' +
            (n === 0 ? 'TODAY' : n + 'd') + '</span></div>';
        }).join('');
    }

    document.getElementById('pv').onclick = function () { view.m--; if (view.m < 1) { view.m = 12; view.y--; } draw(); };
    document.getElementById('nx').onclick = function () { view.m++; if (view.m > 12) { view.m = 1; view.y++; } draw(); };
    document.getElementById('td').onclick = function () { view = { y: now.getFullYear(), m: now.getMonth() + 1 }; draw(); };
    chips(); draw();
  }

  boot();
})();
