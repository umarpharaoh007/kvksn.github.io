/* ================================================================
   KVKSN & Co. — shared UI helpers for the portal and admin console
   ================================================================ */
(function (global) {
  'use strict';

  function esc(s) {
    return String(s === null || s === undefined ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function money(n) {
    if (n === null || n === undefined || isNaN(n)) return '—';
    return 'Rs. ' + Number(n).toLocaleString('en-IN');
  }

  /** 1,23,45,678 -> "1.23 Cr" / "45.6 L" — for KPI tiles */
  function shortMoney(n) {
    if (!n) return 'Rs. 0';
    if (n >= 10000000) return 'Rs. ' + (n / 10000000).toFixed(2) + ' Cr';
    if (n >= 100000) return 'Rs. ' + (n / 100000).toFixed(2) + ' L';
    return 'Rs. ' + Number(n).toLocaleString('en-IN');
  }

  var MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  function fmtDate(d) {
    if (!d) return '—';
    var x = new Date(d);
    if (isNaN(x)) return '—';
    return x.getDate() + ' ' + MON[x.getMonth()] + ' ' + x.getFullYear();
  }

  function fmtDateTime(d) {
    if (!d) return '—';
    var x = new Date(d);
    if (isNaN(x)) return '—';
    var h = x.getHours(), ap = h >= 12 ? 'PM' : 'AM';
    h = h % 12; if (h === 0) h = 12;
    return fmtDate(d) + ', ' + h + ':' + (x.getMinutes() < 10 ? '0' : '') + x.getMinutes() + ' ' + ap;
  }

  /** "3 days ago" / "in 5 days" */
  function ago(d) {
    var diff = Math.round((new Date(d) - new Date()) / 86400000);
    if (diff === 0) return 'today';
    if (diff === -1) return 'yesterday';
    if (diff === 1) return 'tomorrow';
    return diff < 0 ? Math.abs(diff) + ' days ago' : 'in ' + diff + ' days';
  }

  function initials(name) {
    var p = String(name || '').replace(/^CA\s+/i, '').trim().split(/\s+/);
    if (p.length === 1) return p[0].slice(0, 2).toUpperCase();
    return (p[0][0] + p[p.length - 1][0]).toUpperCase();
  }

  var AV = ['#2E8C87', '#C8922E', '#1E6B45', '#5A4FCF', '#C2571B', '#B4342B', '#17324B'];
  function avColor(id) {
    var h = 0; String(id).split('').forEach(function (c) { h = (h * 31 + c.charCodeAt(0)) % 9973; });
    return AV[h % AV.length];
  }

  function avatar(name, id, size) {
    var s = size || 30;
    return '<span style="width:' + s + 'px;height:' + s + 'px;border-radius:50%;background:' + avColor(id || name) +
      ';color:#fff;display:inline-grid;place-items:center;font-weight:700;font-size:' + Math.round(s * 0.38) +
      'px;flex-shrink:0">' + esc(initials(name)) + '</span>';
  }

  function statusBadge(status) {
    var s = Store.STATUS[status];
    if (!s) return '';
    return '<span class="badge" style="background:' + s.soft + ';color:' + s.color + '">' + esc(s.label) + '</span>';
  }

  function dueBadge(job) {
    if (job.status === 'completed') {
      return '<span class="badge" style="background:var(--green-soft);color:var(--green)">Completed</span>';
    }
    var n = Store.daysLeft(job.dueDate);
    if (n < 0)  return '<span class="badge" style="background:var(--red-soft);color:var(--red)">' + Math.abs(n) + 'd overdue</span>';
    if (n === 0) return '<span class="badge" style="background:var(--red-soft);color:var(--red)">Due today</span>';
    if (n <= 3) return '<span class="badge" style="background:var(--orange-soft);color:var(--orange)">' + n + 'd left</span>';
    if (n <= 10) return '<span class="badge" style="background:var(--brass-soft);color:var(--brass-d)">' + n + 'd left</span>';
    return '<span class="badge" style="background:var(--line-2);color:var(--ink-soft)">' + n + 'd left</span>';
  }

  function bar(pct, cls) {
    return '<span class="bar ' + (cls || (pct === 100 ? 'done' : pct >= 50 ? '' : 'warn')) +
      '"><i style="width:' + pct + '%"></i></span>';
  }

  /* ---------------- Toast ---------------- */
  function toast(msg, kind) {
    var host = document.querySelector('.toasts');
    if (!host) { host = document.createElement('div'); host.className = 'toasts'; document.body.appendChild(host); }
    var t = document.createElement('div');
    t.className = 'toast ' + (kind || '');
    t.innerHTML = '<span>' + (kind === 'ok' ? '&#10003;' : kind === 'err' ? '&#9888;' : '&#8505;') + '</span><span>' + esc(msg) + '</span>';
    host.appendChild(t);
    setTimeout(function () {
      t.style.transition = 'opacity .3s, transform .3s';
      t.style.opacity = '0'; t.style.transform = 'translateX(24px)';
      setTimeout(function () { t.remove(); }, 320);
    }, 3600);
  }

  /* ---------------- Modal ---------------- */
  var modalHost = null;
  function modal(opts) {
    closeModal();
    modalHost = document.createElement('div');
    modalHost.className = 'overlay on';
    modalHost.innerHTML =
      '<div class="modal' + (opts.wide ? ' wide' : '') + '">' +
        '<div class="modal-h"><div><h3>' + esc(opts.title) + '</h3>' +
          (opts.sub ? '<div class="sub">' + esc(opts.sub) + '</div>' : '') +
        '</div><button class="x" data-close>&times;</button></div>' +
        '<div class="modal-b">' + (opts.body || '') + '</div>' +
        (opts.footer ? '<div class="modal-f">' + opts.footer + '</div>' : '') +
      '</div>';
    document.body.appendChild(modalHost);
    modalHost.addEventListener('click', function (e) {
      if (e.target === modalHost || e.target.hasAttribute('data-close')) closeModal();
    });
    if (opts.onOpen) opts.onOpen(modalHost);
    return modalHost;
  }
  function closeModal() { if (modalHost) { modalHost.remove(); modalHost = null; } }

  /* ---------------- Drawer ---------------- */
  var drawerEl = null, drawerOv = null;
  function drawer(opts) {
    closeDrawer(true);
    drawerOv = document.createElement('div');
    drawerOv.className = 'drawer-o on';
    drawerEl = document.createElement('div');
    drawerEl.className = 'drawer';
    drawerEl.innerHTML =
      '<div class="drawer-h"><div><h2>' + esc(opts.title) + '</h2>' +
        (opts.meta ? '<div class="meta">' + opts.meta + '</div>' : '') +
      '</div><button class="x" data-dclose>&times;</button></div>' +
      '<div class="drawer-b">' + (opts.body || '') + '</div>';
    document.body.appendChild(drawerOv);
    document.body.appendChild(drawerEl);
    requestAnimationFrame(function () { drawerEl.classList.add('on'); });
    drawerOv.onclick = function () { closeDrawer(); };
    drawerEl.addEventListener('click', function (e) {
      if (e.target.hasAttribute('data-dclose')) closeDrawer();
    });
    if (opts.onOpen) opts.onOpen(drawerEl);
    return drawerEl;
  }
  function closeDrawer(instant) {
    if (!drawerEl) return;
    var d = drawerEl, o = drawerOv;
    drawerEl = null; drawerOv = null;
    if (instant) { d.remove(); if (o) o.remove(); return; }
    d.classList.remove('on');
    if (o) o.remove();
    setTimeout(function () { d.remove(); }, 250);
  }
  function drawerBody() { return drawerEl ? drawerEl.querySelector('.drawer-b') : null; }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeModal(); closeDrawer(); }
  });

  /* ---------------- Confirm ---------------- */
  function confirmBox(title, text, okLabel, onOk, kind) {
    modal({
      title: title,
      body: '<p style="font-size:14px;color:var(--ink-soft)">' + esc(text) + '</p>',
      footer: '<button class="btn btn-ghost" data-close>Cancel</button>' +
              '<button class="btn ' + (kind || 'btn-primary') + '" id="cfmOk">' + esc(okLabel || 'Confirm') + '</button>',
      onOpen: function (host) {
        host.querySelector('#cfmOk').onclick = function () { closeModal(); onOk(); };
      }
    });
  }

  /* ---------------- Misc ---------------- */
  function fileIcon(name) {
    var ext = (name.split('.').pop() || '').toUpperCase().slice(0, 4);
    return ext || 'FILE';
  }

  function humanSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return Math.round(bytes / 1024) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  }

  /** Generates a downloadable stand-in document for demo deliverables. */
  function downloadStub(name, lines) {
    var body = [
      'KVKSN & CO., CHARTERED ACCOUNTANTS',
      '# 5/356, 2nd Floor, Anjaneya Swamy Temple Street, Kadapa - 516 001',
      'Phone: +91 98495 06910  |  +91 90590 43910  |  kkhca1975@yahoo.co.in',
      ''.padEnd(78, '='),
      '',
      name,
      ''.padEnd(78, '-'),
      ''
    ].concat(lines || []).concat([
      '',
      ''.padEnd(78, '-'),
      'This is a demonstration document generated by the KVKSN & Co. client portal.',
      'Generated on ' + fmtDateTime(new Date())
    ]).join('\r\n');

    var blob = new Blob([body], { type: 'text/plain;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name.replace(/\.(pdf|xlsx|json|zip|docx)$/i, '') + '.txt';
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  global.UI = {
    esc: esc, money: money, shortMoney: shortMoney,
    fmtDate: fmtDate, fmtDateTime: fmtDateTime, ago: ago,
    initials: initials, avColor: avColor, avatar: avatar,
    statusBadge: statusBadge, dueBadge: dueBadge, bar: bar,
    toast: toast, modal: modal, closeModal: closeModal,
    drawer: drawer, closeDrawer: closeDrawer, drawerBody: drawerBody,
    confirm: confirmBox, fileIcon: fileIcon, humanSize: humanSize,
    downloadStub: downloadStub, MON: MON
  };
})(window);
