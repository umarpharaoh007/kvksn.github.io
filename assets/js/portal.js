/* ================================================================
   KVKSN & Co. — CLIENT PORTAL
   Hash-routed single page app. All state is in localStorage via Store.
   ================================================================ */
(function () {
  'use strict';

  var E = UI.esc, app = document.getElementById('app');
  var me = null;                       // the logged-in client record

  Store.load();

  /* ================= BOOT ================= */
  function boot() {
    var sid = Store.session();
    if (sid && sid.charAt(0) === 'C' && Store.client(sid)) {
      me = Store.client(sid);
      renderShell();
      route();
    } else {
      renderLogin();
    }
  }

  window.addEventListener('hashchange', function () { if (me) route(); });

  /* ================= LOGIN ================= */
  function renderLogin() {
    app.innerHTML =
    '<div class="login-wrap">' +
      '<div class="login-art">' +
        '<div>' +
          '<div class="login-brand">' +
            '<img data-logo="light" src="assets/img/ca-india-light.png" alt="CA India">' +
            '<span><b>KVKSN <span class="amp">&amp;</span> CO.</b><span class="sub-line">Chartered Accountants</span></span>' +
          '</div>' +
          '<h1>Your compliance file, open around the clock</h1>' +
          '<p>Upload documents once. Track every filing from preparation to acknowledgement — without chasing anyone for an update.</p>' +
          '<ul class="login-feats">' +
            '<li><span class="tick">&#10003;</span> Live status on every job, with the assigned team member named</li>' +
            '<li><span class="tick">&#10003;</span> Document checklists per service — you always know what is pending</li>' +
            '<li><span class="tick">&#10003;</span> Permanent vault of filed returns and certificates</li>' +
            '<li><span class="tick">&#10003;</span> Your own compliance calendar and invoice history</li>' +
          '</ul>' +
        '</div>' +
        '<div class="login-foot">' +
          '# 5/356, 2nd Floor, Anjaneya Swamy Temple Street, Kadapa &ndash; 516 001<br>' +
          '+91 98495 06910 &nbsp;·&nbsp; +91 90590 43910 &nbsp;·&nbsp; kkhca1975@yahoo.co.in' +
        '</div>' +
      '</div>' +
      '<div class="login-panel"><div class="login-box">' +
        '<h2 class="display">Client Login</h2>' +
        '<div class="sub">Sign in to upload documents and track your work.</div>' +
        '<div class="field"><label for="lgEmail">Email or Client Code</label>' +
          '<input id="lgEmail" type="text" placeholder="client@demo.in" autocomplete="username"></div>' +
        '<div class="field"><label for="lgPass">Password</label>' +
          '<input id="lgPass" type="password" placeholder="demo" autocomplete="current-password"></div>' +
        '<button class="btn btn-primary btn-block" id="lgGo" style="margin-top:6px">Sign In</button>' +
        '<div id="lgErr" style="display:none;margin-top:12px" class="alert alert-red"><span class="ic">&#9888;</span><span>Invalid credentials. Use one of the demo accounts below.</span></div>' +
        '<div class="demo-accounts">' +
          '<h4>Demo accounts — click to sign in</h4>' +
          Store.db.clients.map(function (c) {
            return '<button class="acct" data-id="' + c.id + '">' +
              UI.avatar(c.name, c.id, 34) +
              '<span style="flex:1"><b>' + E(c.name) + '</b>' +
              '<span>' + E(c.type) + ' · ' + E(c.email) + ' / demo</span></span>' +
              '<span class="tag">' + E(c.code) + '</span></button>';
          }).join('') +
        '</div>' +
        '<div class="row" style="margin-top:20px;justify-content:space-between">' +
          '<a href="index.html" class="btn btn-ghost btn-sm">&larr; Back to website</a>' +
          '<a href="admin.html" class="btn btn-ghost btn-sm">Staff / Admin login &rarr;</a>' +
        '</div>' +
      '</div></div>' +
    '</div>';

    if (window.Media) Media.applyLogo(app);
    Array.prototype.forEach.call(app.querySelectorAll('.acct'), function (b) {
      b.onclick = function () { doLogin(b.dataset.id); };
    });
    document.getElementById('lgGo').onclick = tryLogin;
    document.getElementById('lgPass').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') tryLogin();
    });

    function tryLogin() {
      var u = document.getElementById('lgEmail').value.trim().toLowerCase();
      var p = document.getElementById('lgPass').value;
      var found = Store.db.clients.filter(function (c) {
        return (c.email.toLowerCase() === u || c.code.toLowerCase() === u) && c.password === p;
      })[0];
      if (found) doLogin(found.id);
      else document.getElementById('lgErr').style.display = 'flex';
    }
  }

  function doLogin(id) {
    Store.login(id);
    me = Store.client(id);
    location.hash = '#/dashboard';
    renderShell();
    route();
    UI.toast('Signed in as ' + me.name, 'ok');
  }

  /* ================= SHELL ================= */
  var NAV = [
    { sec: 'My Account' },
    { id: 'dashboard', label: 'Dashboard',            ic: '&#9632;' },
    { id: 'jobs',      label: 'My Jobs',              ic: '&#9776;' },
    { id: 'request',   label: 'Request a Service',    ic: '&#43;' },
    { sec: 'Records' },
    { id: 'documents', label: 'Documents',            ic: '&#128196;' },
    { id: 'vault',     label: 'Completed Work',       ic: '&#10003;' },
    { id: 'invoices',  label: 'Invoices',             ic: '&#8377;' },
    { sec: 'Reference' },
    { id: 'calendar',  label: 'My Due Dates',         ic: '&#128197;' },
    { id: 'profile',   label: 'My Profile',           ic: '&#9679;' }
  ];

  function renderShell() {
    app.innerHTML =
    '<div class="app">' +
      '<aside class="sidebar" id="sb">' +
        '<div class="sb-brand">' +
          '<img data-logo="light" src="assets/img/ca-india-light.png" alt="CA India">' +
          '<span><b>KVKSN <span class="amp">&amp;</span> CO.</b><span class="sub-line">Client Portal</span></span>' +
        '</div>' +
        '<div class="sb-user">' + UI.avatar(me.name, me.id, 38) +
          '<span style="min-width:0"><b>' + E(me.name) + '</b><span>' + E(me.code) + ' · ' + E(me.type) + '</span></span>' +
        '</div>' +
        '<nav class="sb-nav" id="sbnav"></nav>' +
        '<div class="sb-foot">' +
          '<button id="btnSite">&larr; Firm website</button>' +
          '<button id="btnOut">Sign out</button>' +
        '</div>' +
      '</aside>' +
      '<div class="sb-scrim" id="sbScrim"></div>' +
      '<div class="main">' +
        '<header class="topbar">' +
          '<div class="row">' +
            '<button class="mobile-toggle" id="mt">&#9776;</button>' +
            '<div><div class="crumb" id="crumb">Client Portal</div><h1 id="ptitle">Dashboard</h1></div>' +
          '</div>' +
          '<div class="topbar-actions" id="tact"></div>' +
        '</header>' +
        '<div class="content" id="view"></div>' +
      '</div>' +
    '</div>';

    document.getElementById('btnOut').onclick = function () {
      Store.logout(); me = null; location.hash = ''; renderLogin();
    };
    document.getElementById('btnSite').onclick = function () { location.href = 'index.html'; };
    document.getElementById('mt').onclick = function () {
      document.getElementById('sb').classList.toggle('on');
    };
    document.getElementById('sbScrim').onclick = function () {
      document.getElementById('sb').classList.remove('on');
    };
    if (window.Media) Media.applyLogo(app);
    renderNav();
  }

  function renderNav() {
    var jobs = Store.jobsFor(me.id);
    var counts = {
      jobs: jobs.filter(function (j) { return j.status !== 'completed'; }).length,
      vault: jobs.reduce(function (n, j) { return n + j.deliverables.filter(function (d) { return d.released; }).length; }, 0),
      invoices: Store.db.invoices.filter(function (i) { return i.clientId === me.id && i.status !== 'Paid'; }).length
    };
    var actionCount = jobs.filter(function (j) {
      return j.status === 'docs_pending' || j.status === 'query_raised';
    }).length;

    var cur = (location.hash.replace('#/', '') || 'dashboard').split('/')[0];
    document.getElementById('sbnav').innerHTML = NAV.map(function (n) {
      if (n.sec) return '<div class="sb-sec">' + E(n.sec) + '</div>';
      var c = '';
      if (n.id === 'jobs' && counts.jobs) c = '<span class="cnt' + (actionCount ? ' alert' : '') + '">' + counts.jobs + '</span>';
      if (n.id === 'vault' && counts.vault) c = '<span class="cnt">' + counts.vault + '</span>';
      if (n.id === 'invoices' && counts.invoices) c = '<span class="cnt alert">' + counts.invoices + '</span>';
      return '<a href="#/' + n.id + '" class="' + (cur === n.id ? 'on' : '') + '">' +
             '<span class="ic">' + n.ic + '</span>' + E(n.label) + c + '</a>';
    }).join('');
  }

  /* ================= ROUTER ================= */
  function route() {
    var h = (location.hash.replace('#/', '') || 'dashboard');
    var parts = h.split('/');
    var view = parts[0];
    var map = {
      dashboard: vDashboard, jobs: vJobs, request: vRequest, documents: vDocuments,
      vault: vVault, invoices: vInvoices, calendar: vCalendar, profile: vProfile
    };
    var fn = map[view] || vDashboard;
    var titles = {
      dashboard: 'Dashboard', jobs: 'My Jobs', request: 'Request a Service', documents: 'Documents',
      vault: 'Completed Work', invoices: 'Invoices', calendar: 'My Due Dates', profile: 'My Profile'
    };
    document.getElementById('ptitle').textContent = titles[view] || 'Dashboard';
    document.getElementById('crumb').textContent = 'Client Portal · ' + me.code;
    document.getElementById('tact').innerHTML = '';
    document.getElementById('sb').classList.remove('on');
    fn(document.getElementById('view'), parts.slice(1));
    renderNav();
    window.scrollTo(0, 0);
    if (parts[1]) openJob(parts[1]);
  }

  /* ================= DASHBOARD ================= */
  function vDashboard(v) {
    var jobs = Store.jobsFor(me.id);
    var open = jobs.filter(function (j) { return j.status !== 'completed'; });
    var actions = jobs.filter(function (j) { return j.status === 'docs_pending' || j.status === 'query_raised'; });
    var invs = Store.db.invoices.filter(function (i) { return i.clientId === me.id; });
    var due = invs.filter(function (i) { return i.status !== 'Paid'; })
                  .reduce(function (s, i) { return s + i.total; }, 0);
    var released = jobs.reduce(function (n, j) { return n + j.deliverables.filter(function (d) { return d.released; }).length; }, 0);
    var overdue = open.filter(Store.overdue).length;

    document.getElementById('tact').innerHTML =
      '<a class="btn btn-brass btn-sm" href="#/request">+ Request a Service</a>';

    var html = '';

    if (actions.length) {
      html += '<div class="alert alert-red"><span class="ic">&#9888;</span><span><b>' + actions.length +
        ' item' + (actions.length > 1 ? 's need' : ' needs') + ' your attention.</b> ' +
        'Work cannot proceed until you upload the pending documents or answer the open queries below.</span></div>';
    }

    html += '<div class="grid g-4 mb">' +
      kpi('Active Jobs', open.length, (overdue ? overdue + ' past due date' : 'All within target date'), overdue ? 'k-red' : '') +
      kpi('Needs My Action', actions.length, actions.length ? 'Documents or queries pending' : 'Nothing pending from you', actions.length ? 'k-brass' : 'k-green') +
      kpi('Completed Work', released, 'Documents in your vault', 'k-green') +
      kpi('Outstanding', UI.shortMoney(due), invs.filter(function (i) { return i.status !== 'Paid'; }).length + ' unpaid invoice(s)', due ? 'k-brass' : 'k-green') +
    '</div>';

    html += '<div class="grid g-side">';

    /* --- left: action items + active jobs --- */
    html += '<div>';
    if (actions.length) {
      html += '<div class="card mb"><div class="card-h"><h3>Action Required From You</h3>' +
        '<span class="sub">' + actions.length + ' open</span></div><div class="card-b tight">' +
        actions.map(function (j) {
          var cl = Store.checklistDone(j);
          var what = j.status === 'query_raised'
            ? 'Our team has raised a query — please respond'
            : 'Upload ' + (cl.total - cl.done) + ' more document' + ((cl.total - cl.done) > 1 ? 's' : '');
          return '<div style="padding:14px 20px;border-bottom:1px solid var(--line-2);display:flex;gap:14px;align-items:center;flex-wrap:wrap">' +
            '<div style="flex:1;min-width:200px"><b style="font-size:13.5px">' + E(j.title) + '</b>' +
            '<div class="muted" style="font-size:12px;margin-top:2px">' + E(what) + '</div></div>' +
            UI.dueBadge(j) +
            '<button class="btn btn-brass btn-sm" data-job="' + j.id + '">Open</button></div>';
        }).join('') + '</div></div>';
    }

    html += '<div class="card"><div class="card-h"><h3>Active Jobs</h3><a class="btn btn-ghost btn-sm" href="#/jobs">View all</a></div>';
    if (!open.length) {
      html += '<div class="empty"><div class="ic">&#128196;</div><h4>No active jobs</h4>' +
              '<p>Request a service and we will pick it up right away.</p></div>';
    } else {
      html += '<div class="tbl-wrap"><table class="tbl"><thead><tr>' +
        '<th>Job</th><th>Status</th><th>Assigned To</th><th>Progress</th><th>Due</th></tr></thead><tbody>' +
        open.slice(0, 8).map(function (j) {
          var cl = Store.checklistDone(j);
          var st = Store.staff(j.assignedTo);
          return '<tr class="clickable" data-job="' + j.id + '">' +
            '<td><b>' + E(j.title) + '</b><div class="muted mono" style="font-size:11px">' + E(j.id) + '</div></td>' +
            '<td>' + UI.statusBadge(j.status) + '</td>' +
            '<td>' + (st ? '<div class="row" style="gap:8px;flex-wrap:nowrap">' + UI.avatar(st.name, st.id, 26) +
                     '<span style="font-size:12.5px">' + E(st.name) + '</span></div>' : '<span class="muted">Unassigned</span>') + '</td>' +
            '<td>' + UI.bar(cl.pct) + '<div class="muted" style="font-size:11px;margin-top:3px">' + cl.done + '/' + cl.total + ' docs</div></td>' +
            '<td>' + UI.dueBadge(j) + '<div class="muted" style="font-size:11px;margin-top:3px">' + UI.fmtDate(j.dueDate) + '</div></td>' +
          '</tr>';
        }).join('') + '</tbody></table></div>';
    }
    html += '</div></div>';

    /* --- right: due dates + activity --- */
    html += '<div>';
    html += '<div class="card mb"><div class="card-h"><h3>Your Upcoming Due Dates</h3>' +
      '<a class="btn btn-ghost btn-sm" href="#/calendar">Calendar</a></div><div class="card-b tight">' +
      myDueList(6) + '</div></div>';

    var acts = [];
    jobs.forEach(function (j) {
      j.timeline.forEach(function (t) { acts.push({ t: t, j: j }); });
    });
    acts.sort(function (a, b) { return new Date(b.t.at) - new Date(a.t.at); });
    html += '<div class="card"><div class="card-h"><h3>Recent Activity</h3></div><div class="card-b">' +
      '<div class="tline">' + acts.slice(0, 8).map(function (a) {
        var isC = a.t.by === me.id, isSys = a.t.by === 'system';
        return '<div class="tline-i ' + (isSys ? 'sys' : isC ? 'cli' : '') + '">' +
          '<div class="a">' + E(a.t.action) + '</div>' +
          '<div class="m">' + E(Store.actorName(a.t.by)) + ' · ' + UI.fmtDateTime(a.t.at) + '</div>' +
          '<div class="n">' + E(a.j.title) + (a.t.note ? ' — ' + E(a.t.note) : '') + '</div></div>';
      }).join('') + '</div></div></div>';
    html += '</div>';

    html += '</div>';
    v.innerHTML = html;
    wireJobLinks(v);
  }

  function kpi(label, val, foot, cls) {
    return '<div class="kpi ' + (cls || '') + '"><div class="lbl">' + E(label) + '</div>' +
           '<div class="val">' + E(val) + '</div><div class="foot">' + E(foot) + '</div></div>';
  }

  /* ================= MY JOBS ================= */
  function vJobs(v) {
    var jobs = Store.jobsFor(me.id).slice().sort(function (a, b) {
      if ((a.status === 'completed') !== (b.status === 'completed')) return a.status === 'completed' ? 1 : -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    });

    document.getElementById('tact').innerHTML = '<a class="btn btn-brass btn-sm" href="#/request">+ Request a Service</a>';

    v.innerHTML =
      '<div class="filters">' +
        '<input type="search" id="q" placeholder="Search jobs…">' +
        '<select id="fst"><option value="">All statuses</option>' +
          Store.STATUS_ORDER.map(function (s) {
            return '<option value="' + s + '">' + E(Store.STATUS[s].label) + '</option>';
          }).join('') + '</select>' +
        '<div class="seg" id="segv"><button class="on" data-v="all">All</button>' +
          '<button data-v="open">Open</button><button data-v="mine">Needs me</button>' +
          '<button data-v="done">Completed</button></div>' +
      '</div>' +
      '<div class="card"><div class="tbl-wrap"><table class="tbl"><thead><tr>' +
      '<th>Job</th><th>Category</th><th>Status</th><th>Assigned To</th><th>Documents</th><th>Due Date</th><th></th>' +
      '</tr></thead><tbody id="rows"></tbody></table></div></div>';

    var filter = { q: '', st: '', v: 'all' };
    function draw() {
      var list = jobs.filter(function (j) {
        if (filter.st && j.status !== filter.st) return false;
        if (filter.v === 'open' && j.status === 'completed') return false;
        if (filter.v === 'done' && j.status !== 'completed') return false;
        if (filter.v === 'mine' && j.status !== 'docs_pending' && j.status !== 'query_raised') return false;
        if (filter.q && (j.title + j.id + j.cat).toLowerCase().indexOf(filter.q) === -1) return false;
        return true;
      });
      var tb = document.getElementById('rows');
      if (!list.length) {
        tb.innerHTML = '<tr><td colspan="7"><div class="empty"><div class="ic">&#128269;</div>' +
          '<h4>No jobs match</h4><p>Try a different filter.</p></div></td></tr>';
        return;
      }
      tb.innerHTML = list.map(function (j) {
        var cl = Store.checklistDone(j), st = Store.staff(j.assignedTo);
        return '<tr class="clickable" data-job="' + j.id + '">' +
          '<td><b>' + E(j.title) + '</b><div class="muted mono" style="font-size:11px">' + E(j.id) +
            (j.priority === 'High' ? ' <span class="tag prio-High">High</span>' : '') + '</div></td>' +
          '<td><span class="tag">' + E(j.cat) + '</span></td>' +
          '<td>' + UI.statusBadge(j.status) + '</td>' +
          '<td>' + (st ? '<div class="row" style="gap:8px;flex-wrap:nowrap">' + UI.avatar(st.name, st.id, 26) +
            '<span style="font-size:12.5px">' + E(st.name) + '<div class="muted" style="font-size:11px">' + E(st.desig) + '</div></span></div>'
            : '<span class="muted">Unassigned</span>') + '</td>' +
          '<td>' + UI.bar(cl.pct) + '<div class="muted" style="font-size:11px;margin-top:3px">' + cl.done + '/' + cl.total + '</div></td>' +
          '<td>' + UI.fmtDate(j.dueDate) + '<div style="margin-top:3px">' + UI.dueBadge(j) + '</div></td>' +
          '<td class="right"><button class="btn btn-ghost btn-sm" data-job="' + j.id + '">Open</button></td>' +
        '</tr>';
      }).join('');
      wireJobLinks(tb);
    }
    document.getElementById('q').oninput = function () { filter.q = this.value.toLowerCase(); draw(); };
    document.getElementById('fst').onchange = function () { filter.st = this.value; draw(); };
    Array.prototype.forEach.call(v.querySelectorAll('#segv button'), function (b) {
      b.onclick = function () {
        Array.prototype.forEach.call(v.querySelectorAll('#segv button'), function (x) { x.classList.remove('on'); });
        b.classList.add('on'); filter.v = b.dataset.v; draw();
      };
    });
    draw();
  }

  function wireJobLinks(root) {
    Array.prototype.forEach.call(root.querySelectorAll('[data-job]'), function (n) {
      n.onclick = function (e) { e.stopPropagation(); openJob(n.dataset.job); };
    });
  }

  /* ================= JOB DRAWER ================= */
  function openJob(id) {
    var j = Store.job(id);
    if (!j || j.clientId !== me.id) { UI.toast('Job not found', 'err'); return; }
    var st = Store.staff(j.assignedTo), rv = Store.staff(j.reviewer);
    var cl = Store.checklistDone(j);
    var s = Store.service(j.serviceId);

    UI.drawer({
      title: j.title,
      meta: E(j.id) + ' &nbsp;·&nbsp; ' + E(j.cat) + ' &nbsp;·&nbsp; Raised ' + UI.fmtDate(j.createdAt),
      body: jobBody(j, st, rv, cl, s),
      onOpen: function () { wireJobDrawer(j); }
    });
  }

  function jobBody(j, st, rv, cl, s) {
    var openQ = j.queries.filter(function (q) { return !q.replies.length; });
    var released = j.deliverables.filter(function (d) { return d.released; });

    var h = '';

    /* status strip */
    h += '<div class="card mb"><div class="card-b">' +
      '<div class="row between mb-s">' +
        '<div>' + UI.statusBadge(j.status) + ' ' + UI.dueBadge(j) + '</div>' +
        '<div class="muted" style="font-size:12px">Target: <b>' + UI.fmtDate(j.dueDate) + '</b></div>' +
      '</div>' +
      '<div class="dl mt-s">' +
        '<dt>Assigned to</dt><dd>' + (st ? E(st.name) + ' <span class="muted">— ' + E(st.desig) + '</span>' : 'Unassigned') + '</dd>' +
        '<dt>Reviewed by</dt><dd>' + (rv ? E(rv.name) + ' <span class="muted">— ' + E(rv.desig) + '</span>' : '—') + '</dd>' +
        '<dt>Period</dt><dd>' + (j.period ? E(j.period) : '—') + '</dd>' +
        '<dt>Professional fee</dt><dd>' + UI.money(j.fee) + ' <span class="muted">+ GST</span></dd>' +
      '</div></div></div>';

    /* progress steps */
    h += '<div class="card mb"><div class="card-h"><h3>Progress</h3><span class="sub">Stage ' +
      Store.STATUS[j.status].order + ' of 7</span></div><div class="card-b">' +
      '<div style="display:flex;gap:4px">' + Store.STATUS_ORDER.map(function (k) {
        var on = Store.STATUS[k].order <= Store.STATUS[j.status].order;
        return '<div title="' + E(Store.STATUS[k].label) + '" style="flex:1;height:7px;border-radius:4px;background:' +
          (on ? Store.STATUS[j.status].color : 'var(--line-2)') + '"></div>';
      }).join('') + '</div>' +
      '<div class="muted mt-s" style="font-size:12px">Current stage: <b>' + E(Store.STATUS[j.status].label) + '</b>' +
      (Store.STATUS[j.status].actor === 'client' ? ' — waiting on you' :
       j.status === 'completed' ? '' : ' — with our team') + '</div>' +
      '</div></div>';

    /* open queries */
    if (openQ.length) {
      h += '<div class="card mb"><div class="card-h"><h3>Open Queries</h3>' +
        '<span class="badge" style="background:var(--orange-soft);color:var(--orange)">' + openQ.length + ' awaiting reply</span></div>' +
        '<div class="card-b">' + j.queries.map(function (q) {
          return '<div class="q"><div class="qh"><b>' + E(Store.actorName(q.by)) + '</b><span>' + UI.fmtDateTime(q.at) + '</span></div>' +
            '<div class="qt">' + E(q.text) + '</div>' +
            (q.replies.length ? q.replies.map(function (r) {
              return '<div class="reply"><div class="rh">' + E(Store.actorName(r.by)) + ' · ' + UI.fmtDateTime(r.at) + '</div>' + E(r.text) + '</div>';
            }).join('') :
              '<div style="margin-top:11px"><textarea id="qr-' + q.id + '" rows="3" placeholder="Type your reply…" ' +
              'style="width:100%;padding:10px;border:1px solid var(--line);border-radius:4px"></textarea>' +
              '<button class="btn btn-teal btn-sm mt-s" data-reply="' + q.id + '">Send Reply</button></div>') +
          '</div>';
        }).join('') + '</div></div>';
    }

    /* checklist + upload */
    h += '<div class="card mb"><div class="card-h"><h3>Document Checklist</h3>' +
      '<span class="sub">' + cl.done + ' of ' + cl.total + ' received</span></div><div class="card-b">' +
      j.checklist.map(function (c, i) {
        return '<div class="chk ' + (c.done ? 'on' : '') + '">' +
          '<span class="box">' + (c.done ? '&#10003;' : '') + '</span>' +
          '<span class="txt">' + E(c.item) + '</span>' +
          (c.done ? '<span class="badge" style="background:var(--green-soft);color:var(--green)">Received</span>'
                  : '<button class="btn btn-ghost btn-sm" data-up="' + i + '">Upload</button>') +
        '</div>';
      }).join('') +
      (j.status === 'completed' ? '' :
        '<div class="drop mt" id="dz"><div class="ic">&#8686;</div>' +
        '<b>Drop files here, or click to browse</b>' +
        '<span>PDF, JPG, PNG, XLSX, ZIP — up to 10 MB each</span>' +
        '<input type="file" id="fi" multiple style="display:none"></div>') +
    '</div></div>';

    /* documents */
    h += '<div class="card mb"><div class="card-h"><h3>Documents on File</h3>' +
      '<span class="sub">' + j.docs.length + ' file(s)</span></div><div class="card-b">' +
      (j.docs.length ? j.docs.map(function (d) {
        return '<div class="file"><span class="ic ' + (d.kind === 'upload' ? '' : 'doc') + '">' + E(UI.fileIcon(d.name)) + '</span>' +
          '<span style="flex:1;min-width:0"><b>' + E(d.name) + '</b>' +
          '<span>' + E(d.size) + ' · uploaded by ' + E(Store.actorName(d.by)) + ' · ' + UI.fmtDate(d.at) +
          (d.kind === 'fetched' ? ' · <span style="color:var(--teal)">fetched from government portal</span>' : '') +
          (d.kind === 'workpaper' ? ' · <span style="color:var(--violet)">firm working paper</span>' : '') + '</span></span>' +
          '<button class="btn btn-ghost btn-sm" data-dl="' + E(d.name) + '">Download</button></div>';
      }).join('') : '<p class="muted" style="font-size:13px">No documents uploaded yet.</p>') +
    '</div></div>';

    /* deliverables */
    h += '<div class="card mb"><div class="card-h"><h3>Deliverables</h3>' +
      (released.length ? '<span class="badge" style="background:var(--green-soft);color:var(--green)">' + released.length + ' released</span>' : '') +
      '</div><div class="card-b">' +
      (released.length ? released.map(function (d) {
        return '<div class="file"><span class="ic out">&#10003;</span>' +
          '<span style="flex:1;min-width:0"><b>' + E(d.name) + '</b><span>Released ' + UI.fmtDate(d.at) + '</span></span>' +
          '<button class="btn btn-green btn-sm" data-dl="' + E(d.name) + '">Download</button></div>';
      }).join('')
      : '<p class="muted" style="font-size:13px">Nothing released yet. On completion you will receive:</p><ul style="font-size:13px;color:var(--ink-soft);margin:10px 0 0 18px">' +
        s.deliverables.map(function (x) { return '<li>' + E(x) + '</li>'; }).join('') + '</ul>') +
    '</div></div>';

    /* timeline */
    h += '<div class="card"><div class="card-h"><h3>Full History</h3></div><div class="card-b"><div class="tline">' +
      j.timeline.slice().reverse().map(function (t) {
        var isC = t.by === me.id, isSys = t.by === 'system';
        return '<div class="tline-i ' + (isSys ? 'sys' : isC ? 'cli' : '') + '">' +
          '<div class="a">' + E(t.action) + '</div>' +
          '<div class="m">' + E(Store.actorName(t.by)) + ' · ' + UI.fmtDateTime(t.at) + '</div>' +
          (t.note ? '<div class="n">' + E(t.note) + '</div>' : '') + '</div>';
      }).join('') + '</div></div></div>';

    return h;
  }

  function wireJobDrawer(j) {
    var body = UI.drawerBody();
    if (!body) return;

    /* downloads */
    Array.prototype.forEach.call(body.querySelectorAll('[data-dl]'), function (b) {
      b.onclick = function () {
        UI.downloadStub(b.dataset.dl, [
          'Client        : ' + me.name + ' (' + me.code + ')',
          'PAN           : ' + (me.pan || '—'),
          'GSTIN         : ' + (me.gstin || 'Not registered'),
          'Job reference : ' + j.id,
          'Service       : ' + j.title,
          'Period        : ' + (j.period || '—'),
          'Status        : ' + Store.STATUS[j.status].label,
          'Prepared by   : ' + Store.actorName(j.assignedTo),
          'Reviewed by   : ' + Store.actorName(j.reviewer)
        ]);
        UI.toast('Downloading ' + b.dataset.dl, 'ok');
      };
    });

    /* query replies */
    Array.prototype.forEach.call(body.querySelectorAll('[data-reply]'), function (b) {
      b.onclick = function () {
        var qid = b.dataset.reply;
        var ta = body.querySelector('#qr-' + qid);
        var txt = ta.value.trim();
        if (!txt) { UI.toast('Please type a reply first', 'err'); return; }
        var q = j.queries.filter(function (x) { return x.id === qid; })[0];
        q.replies.push({ by: me.id, at: new Date().toISOString(), text: txt });
        Store.addTimeline(j, me.id, 'Query answered', txt.slice(0, 90));
        Store.setStatus(j, 'in_progress', me.id, 'Client responded to the query');
        Store.notify(j.assignedTo, me.name + ' replied to your query on ' + j.id, j.id);
        Store.save();
        UI.toast('Reply sent to ' + Store.actorName(j.assignedTo), 'ok');
        UI.closeDrawer(); route(); setTimeout(function () { openJob(j.id); }, 260);
      };
    });

    /* uploads */
    var fi = body.querySelector('#fi'), dz = body.querySelector('#dz');
    var targetIdx = null;
    if (dz) {
      dz.onclick = function () { targetIdx = null; fi.click(); };
      dz.addEventListener('dragover', function (e) { e.preventDefault(); dz.classList.add('over'); });
      dz.addEventListener('dragleave', function () { dz.classList.remove('over'); });
      dz.addEventListener('drop', function (e) {
        e.preventDefault(); dz.classList.remove('over');
        targetIdx = null; handleFiles(e.dataTransfer.files);
      });
      fi.onchange = function () { handleFiles(fi.files); fi.value = ''; };
    }
    Array.prototype.forEach.call(body.querySelectorAll('[data-up]'), function (b) {
      b.onclick = function () { targetIdx = parseInt(b.dataset.up, 10); if (fi) fi.click(); };
    });

    function handleFiles(files) {
      if (!files || !files.length) return;
      var added = 0;
      Array.prototype.forEach.call(files, function (f) {
        Store.uploadDoc(j, f.name, UI.humanSize(f.size), me.id, 'upload');
        added++;
        var idx = targetIdx;
        if (idx === null || idx === undefined || j.checklist[idx].done) {
          idx = -1;
          for (var i = 0; i < j.checklist.length; i++) { if (!j.checklist[i].done) { idx = i; break; } }
        }
        if (idx >= 0) { j.checklist[idx].done = true; j.checklist[idx].doc = f.name; }
        targetIdx = null;
      });
      Store.addTimeline(j, me.id, 'Documents uploaded', added + ' file(s) received');
      var cl = Store.checklistDone(j);
      if (cl.done === cl.total && j.status === 'docs_pending') {
        Store.setStatus(j, 'assigned', 'system', 'All checklist documents received — released to the assigned team member');
        Store.notify(j.assignedTo, 'All documents received for ' + j.id + ' — ready to start.', j.id);
        UI.toast('All documents received. Your job has moved to our team.', 'ok');
      } else {
        UI.toast(added + ' file(s) uploaded', 'ok');
      }
      Store.save();
      UI.closeDrawer(); route(); setTimeout(function () { openJob(j.id); }, 260);
    }
  }

  /* ================= REQUEST A SERVICE ================= */
  function vRequest(v) {
    var cats = {};
    Store.db.services.forEach(function (s) { (cats[s.cat] = cats[s.cat] || []).push(s); });

    v.innerHTML =
      '<div class="alert alert-teal"><span class="ic">&#8505;</span><span>Choose a service below. We will create the job, ' +
      'assign it to a team member automatically and show you exactly which documents to upload.</span></div>' +
      Object.keys(cats).map(function (c) {
        return '<div class="card mb"><div class="card-h"><h3>' + E(c) + '</h3></div><div class="card-b">' +
          '<div class="grid g-3">' + cats[c].map(function (s) {
            return '<div class="card" style="box-shadow:none">' +
              '<div class="card-b">' +
                '<b style="font-size:13.5px;display:block;margin-bottom:6px">' + E(s.name) + '</b>' +
                '<div class="muted" style="font-size:12px;margin-bottom:10px">' + s.checklist.length +
                  ' documents required · usually ' + s.tat + ' working days</div>' +
                '<div class="row between">' +
                  '<span class="tag">' + UI.money(s.fee) + ' + GST</span>' +
                  '<button class="btn btn-teal btn-sm" data-svc="' + s.id + '">Request</button>' +
                '</div>' +
              '</div></div>';
          }).join('') + '</div></div></div>';
      }).join('');

    Array.prototype.forEach.call(v.querySelectorAll('[data-svc]'), function (b) {
      b.onclick = function () { askPeriod(b.dataset.svc); };
    });
  }

  function askPeriod(serviceId) {
    var s = Store.service(serviceId);
    var opts = [];
    if (s.recurring === 'monthly') {
      for (var i = 0; i < 4; i++) opts.push(Store.periodOf(-i));
    } else if (s.recurring === 'quarterly') {
      opts = ['Q1 (Apr–Jun) · ' + Store.currentFY(), 'Q2 (Jul–Sep) · ' + Store.currentFY(),
              'Q3 (Oct–Dec) · ' + Store.currentFY(), 'Q4 (Jan–Mar) · ' + Store.currentFY()];
    } else if (s.recurring === 'annual') {
      opts = [Store.currentAY(), 'AY ' + (parseInt(Store.currentAY().slice(3, 7), 10) - 1) + '-' + Store.currentAY().slice(8)];
    }

    UI.modal({
      title: 'Request: ' + s.name,
      sub: UI.money(s.fee) + ' + GST · usually completed in ' + s.tat + ' working days',
      body:
        (opts.length
          ? '<div class="field"><label>Period</label><select id="rqPeriod">' +
            opts.map(function (o) { return '<option>' + E(o) + '</option>'; }).join('') + '</select></div>'
          : '<div class="field"><label>Reference / description (optional)</label>' +
            '<input id="rqPeriod" placeholder="e.g. Notice dated 12 July 2026"></div>') +
        '<div class="field"><label>Anything we should know?</label>' +
        '<textarea id="rqNote" rows="3" placeholder="Optional note to the team"></textarea></div>' +
        '<div class="sec-title mt">Documents you will need to upload</div>' +
        '<ul style="font-size:13px;color:var(--ink-soft);margin-left:18px">' +
          s.checklist.map(function (c) { return '<li>' + E(c) + '</li>'; }).join('') + '</ul>',
      footer: '<button class="btn btn-ghost" data-close>Cancel</button>' +
              '<button class="btn btn-brass" id="rqGo">Create Job</button>',
      onOpen: function (host) {
        host.querySelector('#rqGo').onclick = function () {
          var per = host.querySelector('#rqPeriod').value;
          var note = host.querySelector('#rqNote').value.trim();
          var j = Store.createJob(me.id, serviceId, per, me.id);
          if (note) Store.addTimeline(j, me.id, 'Client note', note);
          Store.save();
          UI.closeModal();
          UI.toast('Job ' + j.id + ' created and assigned to ' + Store.actorName(j.assignedTo), 'ok');
          location.hash = '#/jobs';
          setTimeout(function () { openJob(j.id); }, 200);
        };
      }
    });
  }

  /* ================= DOCUMENTS ================= */
  function vDocuments(v) {
    var rows = [];
    Store.jobsFor(me.id).forEach(function (j) {
      j.docs.forEach(function (d) { rows.push({ d: d, j: j, kind: 'in' }); });
    });
    rows.sort(function (a, b) { return new Date(b.d.at) - new Date(a.d.at); });

    v.innerHTML =
      '<div class="alert alert-teal"><span class="ic">&#8505;</span><span>Every document you have shared with us, ' +
      'plus the records our team pulled from the government portals on your behalf. Nothing is ever deleted.</span></div>' +
      '<div class="card"><div class="card-h"><h3>All Documents</h3><span class="sub">' + rows.length + ' file(s)</span></div>' +
      (rows.length ? '<div class="tbl-wrap"><table class="tbl"><thead><tr>' +
        '<th>File</th><th>Job</th><th>Source</th><th>Size</th><th>Date</th><th></th></tr></thead><tbody>' +
        rows.map(function (r) {
          var src = r.d.kind === 'upload' ? 'Uploaded by you'
                  : r.d.kind === 'fetched' ? 'Fetched from government portal'
                  : 'Firm working paper';
          return '<tr><td><b>' + E(r.d.name) + '</b></td>' +
            '<td><a href="#" data-job="' + r.j.id + '" style="color:var(--teal)">' + E(r.j.title) + '</a></td>' +
            '<td><span class="tag">' + E(src) + '</span></td>' +
            '<td class="num">' + E(r.d.size) + '</td>' +
            '<td>' + UI.fmtDate(r.d.at) + '</td>' +
            '<td class="right"><button class="btn btn-ghost btn-sm" data-dlx="' + E(r.d.name) + '">Download</button></td></tr>';
        }).join('') + '</tbody></table></div>'
      : '<div class="empty"><div class="ic">&#128193;</div><h4>No documents yet</h4>' +
        '<p>Documents you upload against a job will appear here.</p></div>') + '</div>';

    wireJobLinks(v);
    wireDownloads(v);
  }

  function wireDownloads(root) {
    Array.prototype.forEach.call(root.querySelectorAll('[data-dlx]'), function (b) {
      b.onclick = function () {
        UI.downloadStub(b.dataset.dlx, ['Client : ' + me.name + ' (' + me.code + ')']);
        UI.toast('Downloading ' + b.dataset.dlx, 'ok');
      };
    });
  }

  /* ================= COMPLETED WORK VAULT ================= */
  function vVault(v) {
    var items = [];
    Store.jobsFor(me.id).forEach(function (j) {
      j.deliverables.filter(function (d) { return d.released; })
        .forEach(function (d) { items.push({ d: d, j: j }); });
    });
    items.sort(function (a, b) { return new Date(b.d.at) - new Date(a.d.at); });

    var byJob = {};
    items.forEach(function (i) { (byJob[i.j.id] = byJob[i.j.id] || { j: i.j, docs: [] }).docs.push(i.d); });

    v.innerHTML =
      '<div class="alert alert-green"><span class="ic">&#10003;</span><span>Your permanent record. Filed returns, ' +
      'acknowledgements and certificates stay available here for as long as you are a client of the firm.</span></div>' +
      (items.length ? Object.keys(byJob).map(function (k) {
        var g = byJob[k];
        return '<div class="card mb"><div class="card-h">' +
          '<div><h3>' + E(g.j.title) + '</h3><div class="sub">' + E(g.j.id) + ' · completed ' +
          UI.fmtDate(g.j.closedAt || g.j.dueDate) + ' · prepared by ' + E(Store.actorName(g.j.assignedTo)) + '</div></div>' +
          '<button class="btn btn-ghost btn-sm" data-job="' + g.j.id + '">View job</button></div>' +
          '<div class="card-b">' + g.docs.map(function (d) {
            return '<div class="file"><span class="ic out">&#10003;</span>' +
              '<span style="flex:1;min-width:0"><b>' + E(d.name) + '</b><span>Released ' + UI.fmtDate(d.at) + '</span></span>' +
              '<button class="btn btn-green btn-sm" data-dlx="' + E(d.name) + '">Download</button></div>';
          }).join('') + '</div></div>';
      }).join('')
      : '<div class="card"><div class="empty"><div class="ic">&#128230;</div><h4>Nothing here yet</h4>' +
        '<p>Completed filings and certificates will be released into this vault.</p></div></div>');

    wireJobLinks(v);
    wireDownloads(v);
  }

  /* ================= INVOICES ================= */
  function vInvoices(v) {
    var invs = Store.db.invoices.filter(function (i) { return i.clientId === me.id; });
    var due = invs.filter(function (i) { return i.status !== 'Paid'; }).reduce(function (s, i) { return s + i.total; }, 0);
    var paid = invs.filter(function (i) { return i.status === 'Paid'; }).reduce(function (s, i) { return s + i.total; }, 0);

    v.innerHTML =
      '<div class="grid g-3 mb">' +
        kpi('Outstanding', UI.money(due), invs.filter(function (i) { return i.status !== 'Paid'; }).length + ' invoice(s)', due ? 'k-brass' : 'k-green') +
        kpi('Paid this year', UI.money(paid), invs.filter(function (i) { return i.status === 'Paid'; }).length + ' invoice(s)', 'k-green') +
        kpi('Total billed', UI.money(due + paid), invs.length + ' invoice(s) issued', '') +
      '</div>' +
      '<div class="card"><div class="card-h"><h3>Invoices</h3></div>' +
      (invs.length ? '<div class="tbl-wrap"><table class="tbl"><thead><tr>' +
        '<th>Invoice</th><th>Date</th><th>Against</th><th class="num">Fee</th><th class="num">GST 18%</th>' +
        '<th class="num">Total</th><th>Status</th><th></th></tr></thead><tbody>' +
        invs.map(function (i) {
          var col = i.status === 'Paid' ? 'var(--green)' : i.status === 'Overdue' ? 'var(--red)' : 'var(--brass-d)';
          var bg = i.status === 'Paid' ? 'var(--green-soft)' : i.status === 'Overdue' ? 'var(--red-soft)' : 'var(--brass-soft)';
          var against = i.jobIds.map(function (x) { var j = Store.job(x); return j ? j.title : x; }).join(', ') || 'Professional services';
          return '<tr><td><b class="mono">' + E(i.id) + '</b></td>' +
            '<td>' + UI.fmtDate(i.date) + '</td>' +
            '<td style="max-width:230px">' + E(against) + '</td>' +
            '<td class="num">' + UI.money(i.amount) + '</td>' +
            '<td class="num">' + UI.money(i.gst) + '</td>' +
            '<td class="num"><b>' + UI.money(i.total) + '</b></td>' +
            '<td><span class="badge" style="background:' + bg + ';color:' + col + '">' + E(i.status) + '</span>' +
              (i.paidOn ? '<div class="muted" style="font-size:11px;margin-top:3px">' + E(i.mode) + ' · ' + UI.fmtDate(i.paidOn) + '</div>' : '') + '</td>' +
            '<td class="right nowrap">' +
              '<button class="btn btn-ghost btn-sm" data-dlx="Invoice_' + E(i.id) + '.pdf">PDF</button> ' +
              (i.status !== 'Paid' ? '<button class="btn btn-green btn-sm" data-pay="' + E(i.id) + '">Pay Now</button>' : '') +
            '</td></tr>';
        }).join('') + '</tbody></table></div>'
      : '<div class="empty"><div class="ic">&#8377;</div><h4>No invoices yet</h4><p>Invoices raised by the firm will appear here.</p></div>') +
      '</div>';

    wireDownloads(v);
    Array.prototype.forEach.call(v.querySelectorAll('[data-pay]'), function (b) {
      b.onclick = function () { payModal(b.dataset.pay); };
    });
  }

  function payModal(invId) {
    var inv = Store.db.invoices.filter(function (i) { return i.id === invId; })[0];
    UI.modal({
      title: 'Pay ' + inv.id,
      sub: 'Amount payable ' + UI.money(inv.total),
      body:
        '<div class="dl mb">' +
          '<dt>Invoice</dt><dd>' + E(inv.id) + '</dd>' +
          '<dt>Date</dt><dd>' + UI.fmtDate(inv.date) + '</dd>' +
          '<dt>Professional fee</dt><dd>' + UI.money(inv.amount) + '</dd>' +
          '<dt>GST @ 18%</dt><dd>' + UI.money(inv.gst) + '</dd>' +
          '<dt>Total</dt><dd><b>' + UI.money(inv.total) + '</b></dd>' +
        '</div>' +
        '<div class="field"><label>Payment mode</label><select id="pmode">' +
          '<option>UPI</option><option>Net Banking</option><option>NEFT / RTGS</option>' +
          '<option>Debit / Credit Card</option><option>Cheque</option></select></div>' +
        '<div class="alert alert-teal" style="margin:0"><span class="ic">&#8505;</span>' +
        '<span>This is a demonstration. No payment gateway is connected and no money will move.</span></div>',
      footer: '<button class="btn btn-ghost" data-close>Cancel</button>' +
              '<button class="btn btn-green" id="payGo">Pay ' + UI.money(inv.total) + '</button>',
      onOpen: function (host) {
        host.querySelector('#payGo').onclick = function () {
          var btn = host.querySelector('#payGo');
          btn.innerHTML = '<span class="spinner"></span> Processing…';
          btn.disabled = true;
          setTimeout(function () {
            inv.status = 'Paid';
            inv.paidOn = Store.isoOf(Store.today());
            inv.mode = host.querySelector('#pmode').value;
            Store.notify('S01', me.name + ' paid ' + inv.id + ' (' + UI.money(inv.total) + ')');
            Store.save();
            UI.closeModal();
            UI.toast('Payment recorded for ' + inv.id, 'ok');
            route();
          }, 1400);
        };
      }
    });
  }

  /* ================= MY DUE DATES ================= */
  function myCats() {
    var c = { it: true };
    if (me.gstin) c.gst = true;
    if (me.type !== 'Individual') { c.tds = true; c.labour = true; }
    if (me.type === 'Private Limited' || me.type === 'LLP') c.roc = true;
    return c;
  }

  function myDueList(n) {
    var cats = myCats();
    var list = DueDates.upcoming(60).filter(function (e) { return cats[e.cat]; }).slice(0, n || 8);
    if (!list.length) return '<p class="muted" style="padding:16px 20px;font-size:13px">No due dates in the next 60 days.</p>';
    return list.map(function (e) {
      var d = DueDates.daysUntil(e.date);
      var col = d <= 3 ? 'var(--red)' : d <= 10 ? 'var(--brass-d)' : 'var(--ink-mute)';
      return '<div style="display:flex;gap:13px;padding:12px 20px;border-bottom:1px solid var(--line-2);align-items:center">' +
        '<div style="width:46px;text-align:center;border:1px solid ' + e.color + ';border-radius:3px;padding:4px 0;flex-shrink:0">' +
          '<b class="display" style="display:block;font-size:1.1rem;line-height:1">' + parseInt(e.date.split('-')[2], 10) + '</b>' +
          '<span class="mono" style="font-size:9px;text-transform:uppercase;color:var(--ink-mute)">' +
          UI.MON[parseInt(e.date.split('-')[1], 10) - 1] + '</span></div>' +
        '<div style="flex:1;min-width:0"><b style="font-size:13px">' + E(e.form) + '</b>' +
          '<div class="muted" style="font-size:11.5px">' + E(e.title) + (e.period ? ' · ' + E(e.period) : '') + '</div></div>' +
        '<span class="mono" style="font-size:11px;color:' + col + ';font-weight:700;white-space:nowrap">' +
          (d === 0 ? 'TODAY' : 'in ' + d + 'd') + '</span></div>';
    }).join('');
  }

  function vCalendar(v) {
    var cats = myCats();
    var now = new Date(), view = { y: now.getFullYear(), m: now.getMonth() + 1 };

    v.innerHTML =
      '<div class="alert alert-teal"><span class="ic">&#8505;</span><span>Due dates filtered to your registrations: ' +
      Object.keys(cats).map(function (k) { return DueDates.CATS[k].label; }).join(', ') +
      '. Anything the firm is already handling for you appears as a job under <b>My Jobs</b>.</span></div>' +
      '<div class="grid g-side">' +
        '<div class="card"><div class="card-h">' +
          '<div><h3 id="mLbl"></h3><div class="sub" id="mSub"></div></div>' +
          '<div class="row"><button class="btn btn-ghost btn-sm" id="pv">&#8249;</button>' +
          '<button class="btn btn-ghost btn-sm" id="td">Today</button>' +
          '<button class="btn btn-ghost btn-sm" id="nx">&#8250;</button></div>' +
        '</div><div class="card-b tight"><div class="mini-cal" id="mc"></div></div></div>' +
        '<div class="card"><div class="card-h"><h3>Next 60 Days</h3></div>' +
        '<div class="card-b tight">' + myDueList(14) + '</div></div>' +
      '</div>';

    function draw() {
      var evs = DueDates.eventsForMonth(view.y, view.m).filter(function (e) { return cats[e.cat]; });
      var byDay = {};
      evs.forEach(function (e) { (byDay[e.day] = byDay[e.day] || []).push(e); });
      document.getElementById('mLbl').textContent = DueDates.MONTHS[view.m - 1] + ' ' + view.y;
      document.getElementById('mSub').textContent = evs.length + ' due date(s) relevant to you';

      var lead = new Date(view.y, view.m - 1, 1).getDay();
      var days = new Date(view.y, view.m, 0).getDate();
      var h = ['S','M','T','W','T','F','S'].map(function (d) { return '<div class="dow">' + d + '</div>'; }).join('');
      for (var i = 0; i < lead; i++) h += '<div class="d pad"></div>';
      for (var d = 1; d <= days; d++) {
        var list = byDay[d] || [];
        var isT = (view.y === now.getFullYear() && view.m === now.getMonth() + 1 && d === now.getDate());
        h += '<div class="d' + (isT ? ' today' : '') + '"><span class="n">' + d + '</span>' +
          list.slice(0, 3).map(function (e) {
            return '<div class="ev" style="background:' + e.soft + ';color:' + e.color + '" title="' +
              E(e.form + ' — ' + e.title) + '">' + E(e.form) + '</div>';
          }).join('') +
          (list.length > 3 ? '<div class="ev" style="color:var(--ink-mute)">+' + (list.length - 3) + '</div>' : '') +
        '</div>';
      }
      var tail = (7 - ((lead + days) % 7)) % 7;
      for (var t = 0; t < tail; t++) h += '<div class="d pad"></div>';
      document.getElementById('mc').innerHTML = h;
    }
    document.getElementById('pv').onclick = function () { view.m--; if (view.m < 1) { view.m = 12; view.y--; } draw(); };
    document.getElementById('nx').onclick = function () { view.m++; if (view.m > 12) { view.m = 1; view.y++; } draw(); };
    document.getElementById('td').onclick = function () { view = { y: now.getFullYear(), m: now.getMonth() + 1 }; draw(); };
    draw();
  }

  /* ================= PROFILE ================= */
  function vProfile(v) {
    var appl = Store.applicability(me);

    v.innerHTML =
      '<div class="grid g-side">' +
        '<div>' +
          '<div class="card mb"><div class="card-h"><h3>Registration Details</h3>' +
            '<span class="tag">' + E(me.code) + '</span></div><div class="card-b">' +
            '<div class="dl">' +
              '<dt>Name</dt><dd>' + E(me.name) + '</dd>' +
              '<dt>Contact person</dt><dd>' + E(me.contact) + '</dd>' +
              '<dt>Constitution</dt><dd>' + E(me.constitution) + '</dd>' +
              '<dt>PAN</dt><dd class="mono">' + E(me.pan) + '</dd>' +
              '<dt>GSTIN</dt><dd class="mono">' + (me.gstin ? E(me.gstin) : '<span class="muted">Not registered</span>') + '</dd>' +
              (me.cin ? '<dt>CIN / LLPIN</dt><dd class="mono">' + E(me.cin) + '</dd>' : '') +
              '<dt>Email</dt><dd>' + E(me.email) + '</dd>' +
              '<dt>Phone</dt><dd>' + E(me.phone) + '</dd>' +
              '<dt>Address</dt><dd>' + E(me.address) + '</dd>' +
              '<dt>GST status</dt><dd>' + (me.gstStatus === 'Active'
                 ? '<span class="badge" style="background:var(--green-soft);color:var(--green)">Active</span>' : E(me.gstStatus)) + '</dd>' +
              '<dt>Filing frequency</dt><dd>' + E(me.filingFreq) + '</dd>' +
              '<dt>Aggregate turnover</dt><dd id="tovVal">' + E(me.turnover) + '</dd>' +
              '<dt>e-Invoicing</dt><dd>' + E(me.eInvoice) + '</dd>' +
            '</div></div></div>' +

          '<div class="card"><div class="card-h"><h3>Services You Are Registered For</h3></div>' +
            '<div class="card-b"><div class="row">' +
            me.services.map(function (s) {
              var sv = Store.service(s);
              return sv ? '<span class="tag" style="padding:6px 12px">' + E(sv.name) + '</span>' : '';
            }).join('') + '</div>' +
            '<p class="muted mt-s" style="font-size:12.5px">Recurring services generate a job automatically every ' +
            'period, so nothing is missed. To add a service, use <a href="#/request" style="color:var(--teal)">Request a Service</a>.</p>' +
            '</div></div>' +
        '</div>' +

        '<div>' +
          '<div class="card mb"><div class="card-h"><h3>Government Portal Sync</h3>' +
            '<span class="sub">Live data</span></div><div class="card-b">' +
            '<p class="muted" style="font-size:12.5px;margin-bottom:14px">Refresh your registration details and turnover ' +
            'directly from the GST portal, or pull your income tax record with an OTP sent to your registered mobile.</p>' +
            (me.gstin ? '<button class="btn btn-teal btn-block mb-s" id="syncGst">Refresh from GST Portal</button>' : '') +
            '<button class="btn btn-ghost btn-block" id="syncIt">Fetch Income Tax Record</button>' +
            '<div id="syncOut" class="mt"></div>' +
          '</div></div>' +

          '<div class="card"><div class="card-h"><h3>What Applies To You</h3>' +
            '<span class="sub">from turnover</span></div><div class="card-b">' +
            appl.map(function (a) {
              return '<div class="chk ' + (a.ok ? 'on' : '') + '">' +
                '<span class="box" style="' + (a.ok ? '' : 'background:var(--line-2);border-color:var(--line)') + '">' +
                  (a.ok ? '&#10003;' : '&ndash;') + '</span>' +
                '<span class="txt"><b>' + E(a.text) + '</b>' +
                '<div class="muted" style="font-size:11.5px">' + E(a.note) + '</div></span></div>';
            }).join('') +
          '</div></div>' +
        '</div>' +
      '</div>';

    var gstBtn = document.getElementById('syncGst');
    if (gstBtn) gstBtn.onclick = function () {
      gstBtn.disabled = true;
      gstBtn.innerHTML = '<span class="spinner"></span> Contacting GST portal…';
      Store.gstSearch(me.gstin).then(function (r) {
        me.turnover = r.aggreTurnOver;
        me.gstStatus = r.sts;
        me.eInvoice = r.einv;
        Store.logSync('GSTN', me.id, 'Taxpayer search (public API)', 'Success — ' + r.lgnm, me.id);
        Store.save();
        document.getElementById('tovVal').textContent = r.aggreTurnOver;
        document.getElementById('syncOut').innerHTML =
          '<div class="alert alert-green" style="margin:0"><span class="ic">&#10003;</span><span>' +
          '<b>Fetched from the GST common portal</b><div class="mt-s" style="font-size:12.5px">' +
          'Legal name: ' + E(r.lgnm) + '<br>Registered: ' + E(r.rgdt) + '<br>Status: ' + E(r.sts) +
          '<br>Turnover: ' + E(r.aggreTurnOver) + '<br>Jurisdiction: ' + E(r.stj) + '</div></span></div>';
        UI.toast('GST details refreshed', 'ok');
        gstBtn.disabled = false;
        gstBtn.textContent = 'Refresh from GST Portal';
      }).catch(function (err) {
        document.getElementById('syncOut').innerHTML =
          '<div class="alert alert-red" style="margin:0"><span class="ic">&#9888;</span><span>' + E(err.message) + '</span></div>';
        gstBtn.disabled = false;
        gstBtn.textContent = 'Refresh from GST Portal';
      });
    };

    document.getElementById('syncIt').onclick = function () { otpFlow(); };
  }

  /* OTP-gated income tax fetch — mirrors the real ERI consent flow */
  function otpFlow() {
    UI.modal({
      title: 'Income Tax Portal — Consent Required',
      sub: 'An OTP will be sent to your registered mobile number',
      body:
        '<div class="alert alert-brass"><span class="ic">&#128274;</span><span>Your income tax record can only be ' +
        'fetched with your consent. We never store your income tax portal password.</span></div>' +
        '<div class="dl mb"><dt>PAN</dt><dd class="mono">' + E(me.pan) + '</dd>' +
        '<dt>Mobile</dt><dd>' + E(me.phone.replace(/\d(?=\d{4})/g, 'X')) + '</dd></div>' +
        '<div id="otpStage"><button class="btn btn-primary btn-block" id="sendOtp">Send OTP</button></div>',
      onOpen: function (host) {
        host.querySelector('#sendOtp').onclick = function () {
          var b = host.querySelector('#sendOtp');
          b.innerHTML = '<span class="spinner"></span> Sending…'; b.disabled = true;
          Store.sendOtp().then(function () {
            host.querySelector('#otpStage').innerHTML =
              '<div class="alert alert-teal"><span class="ic">&#128241;</span><span>OTP sent. For this demo, enter <b>1 2 3 4 5 6</b>.</span></div>' +
              '<div class="otp-boxes">' + [0,1,2,3,4,5].map(function (i) {
                return '<input maxlength="1" inputmode="numeric" id="o' + i + '">';
              }).join('') + '</div>' +
              '<button class="btn btn-green btn-block" id="verify">Verify &amp; Fetch</button>';
            var ins = [0,1,2,3,4,5].map(function (i) { return host.querySelector('#o' + i); });
            ins.forEach(function (inp, i) {
              inp.oninput = function () { if (inp.value && ins[i + 1]) ins[i + 1].focus(); };
              inp.onkeydown = function (e) { if (e.key === 'Backspace' && !inp.value && ins[i - 1]) ins[i - 1].focus(); };
            });
            ins[0].focus();
            host.querySelector('#verify').onclick = function () {
              var code = ins.map(function (x) { return x.value; }).join('');
              var vb = host.querySelector('#verify');
              if (code !== '123456') { UI.toast('Incorrect OTP. Use 123456 for the demo.', 'err'); return; }
              vb.innerHTML = '<span class="spinner"></span> Fetching from Income Tax portal…'; vb.disabled = true;
              Store.itFetch(me.id, true).then(function (r) {
                Store.logSync('Income Tax (ERI)', me.id, 'Form 26AS + AIS fetch', 'Success — consent verified', me.id);
                Store.save();
                UI.closeModal();
                showItResult(r);
              });
            };
          });
        };
      }
    });
  }

  function showItResult(r) {
    document.getElementById('syncOut').innerHTML =
      '<div class="alert alert-green" style="margin:0 0 12px"><span class="ic">&#10003;</span>' +
      '<span><b>Fetched from the Income Tax portal</b> — ' + E(r.ay) + '</span></div>' +
      '<div class="dl">' +
        '<dt>PAN status</dt><dd>' + E(r.panStatus) + '</dd>' +
        '<dt>Aadhaar</dt><dd>' + E(r.aadhaarLinked) + '</dd>' +
        '<dt>Return filed</dt><dd>' + E(r.returnFiled) + (r.ackNo ? ' <span class="mono muted">(' + E(r.ackNo) + ')</span>' : '') + '</dd>' +
        '<dt>TDS credits</dt><dd>' + UI.money(r.tdsCredits) + '</dd>' +
        '<dt>Advance tax</dt><dd>' + UI.money(r.advanceTax) + '</dd>' +
        '<dt>Refund</dt><dd>' + E(r.refundStatus) + '</dd>' +
        '<dt>Demand</dt><dd>' + (r.outstandingDemand === 'Nil'
          ? '<span class="badge" style="background:var(--green-soft);color:var(--green)">Nil</span>'
          : '<span class="badge" style="background:var(--red-soft);color:var(--red)">' + E(r.outstandingDemand) + '</span>') + '</dd>' +
      '</div>' +
      '<div class="sec-title mt">Declared income history</div>' +
      '<table class="tbl"><thead><tr><th>Year</th><th class="num">Income</th><th class="num">Tax</th></tr></thead><tbody>' +
      r.incomeHistory.map(function (h) {
        return '<tr><td>' + E(h.ay) + '</td><td class="num">' + UI.money(h.income) + '</td>' +
               '<td class="num">' + UI.money(h.tax) + '</td></tr>';
      }).join('') + '</tbody></table>';
    UI.toast('Income tax record fetched', 'ok');
  }

  boot();
})();
