/* ================================================================
   KVKSN & Co. — public site behaviour
   Compliance calendar widget + enquiry form (writes a lead into
   the shared demo store so it appears in the admin console).
   ================================================================ */
(function () {
  'use strict';

  document.getElementById('year').textContent = new Date().getFullYear();

  /* ================================================================
     ANNOUNCEMENT CAROUSEL
     Images come from the admin console (Website Media) or from
     drop-in files in assets/img/. Auto-advances, pauses on hover.
     ================================================================ */
  if (window.Media) {
    Media.applyLogo(document);

    Media.resolveBanners().then(function (list) {
      if (!list.length) return;
      var strip = document.getElementById('bannerStrip');
      var track = document.getElementById('carTrack');
      var dots = document.getElementById('carDots');
      var pauseBtn = document.getElementById('carPause');
      if (!strip || !track) return;

      strip.hidden = false;

      track.innerHTML = list.map(function (b) {
        var inner =
          '<img src="' + b.src + '" alt="' + esc(b.name || 'Announcement') + '" loading="lazy">' +
          (b.caption ? '<div class="car-cap">' + esc(b.caption) + '</div>' : '');
        return b.link
          ? '<a class="car-slide" href="' + esc(b.link) + '">' + inner + '</a>'
          : '<div class="car-slide">' + inner + '</div>';
      }).join('');

      var i = 0, timer = null, paused = false;
      var delay = Media.interval() || 5000;
      var single = list.length < 2;

      if (single) {
        dots.style.display = 'none';
        document.getElementById('carPrev').style.display = 'none';
        document.getElementById('carNext').style.display = 'none';
        pauseBtn.style.display = 'none';
      } else {
        dots.innerHTML = list.map(function (_, k) {
          return '<button data-i="' + k + '" aria-label="Slide ' + (k + 1) + '"></button>';
        }).join('');
        Array.prototype.forEach.call(dots.children, function (d) {
          d.onclick = function () { go(+d.dataset.i); restart(); };
        });
      }

      function go(n) {
        i = (n + list.length) % list.length;
        track.style.transform = 'translateX(-' + (i * 100) + '%)';
        Array.prototype.forEach.call(dots.children, function (d, k) {
          d.classList.toggle('on', k === i);
        });
      }
      function tick() { if (!paused) go(i + 1); }
      function restart() { clearInterval(timer); if (!single && !paused) timer = setInterval(tick, delay); }

      document.getElementById('carPrev').onclick = function () { go(i - 1); restart(); };
      document.getElementById('carNext').onclick = function () { go(i + 1); restart(); };
      pauseBtn.onclick = function () {
        paused = !paused;
        pauseBtn.innerHTML = paused ? '&#9658;' : '&#10073;&#10073;';
        pauseBtn.setAttribute('aria-label', paused ? 'Play' : 'Pause');
        restart();
      };

      var car = document.getElementById('carousel');
      car.addEventListener('mouseenter', function () { clearInterval(timer); });
      car.addEventListener('mouseleave', restart);

      // Swipe on touch devices
      var x0 = null;
      car.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
      car.addEventListener('touchend', function (e) {
        if (x0 === null) return;
        var dx = e.changedTouches[0].clientX - x0;
        if (Math.abs(dx) > 45) { go(i + (dx < 0 ? 1 : -1)); restart(); }
        x0 = null;
      });

      go(0); restart();
    });
  }

  /* ---------------- Calendar state ---------------- */
  var today = new Date();
  var view = { y: today.getFullYear(), m: today.getMonth() + 1 };
  var active = { gst: true, it: true, tds: true, roc: true, labour: true };
  var selected = null;   // 'YYYY-MM-DD' when a day is clicked

  var elGrid = document.getElementById('calGrid');
  var elFilters = document.getElementById('calFilters');
  var elMonth = document.getElementById('calMonthLabel');
  var elFy = document.getElementById('calFyLabel');
  var elCount = document.getElementById('calCount');
  var elList = document.getElementById('dueList');
  var elSideTitle = document.getElementById('sideTitle');
  var elSideSub = document.getElementById('sideSub');

  if (!elGrid) return;

  /* ---------------- Filters ---------------- */
  function buildFilters() {
    elFilters.innerHTML = '';
    Object.keys(DueDates.CATS).forEach(function (k) {
      var c = DueDates.CATS[k];
      var b = document.createElement('button');
      b.className = 'chip' + (active[k] ? ' on' : '');
      b.innerHTML = '<span class="sw" style="background:' + c.color + '"></span>' + c.label;
      b.onclick = function () { active[k] = !active[k]; buildFilters(); render(); };
      elFilters.appendChild(b);
    });
    var all = document.createElement('button');
    all.className = 'chip';
    all.textContent = 'Show all';
    all.onclick = function () {
      Object.keys(active).forEach(function (k) { active[k] = true; });
      buildFilters(); render();
    };
    elFilters.appendChild(all);
  }

  function visible(list) {
    return list.filter(function (e) { return active[e.cat]; });
  }

  /* ---------------- Month grid ---------------- */
  function render() {
    var events = visible(DueDates.eventsForMonth(view.y, view.m));
    var byDay = {};
    events.forEach(function (e) { (byDay[e.day] = byDay[e.day] || []).push(e); });

    elMonth.textContent = DueDates.MONTHS[view.m - 1] + ' ' + view.y;
    var fyStart = view.m >= 4 ? view.y : view.y - 1;
    elFy.textContent = 'Financial Year ' + DueDates.fyLabel(fyStart).replace('FY ', '');
    elCount.textContent = events.length + ' due date' + (events.length === 1 ? '' : 's') + ' this month';

    var first = new Date(view.y, view.m - 1, 1);
    var lead = first.getDay();                       // 0 = Sunday
    var days = new Date(view.y, view.m, 0).getDate();
    var prevDays = new Date(view.y, view.m - 1, 0).getDate();

    var html = '';
    ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach(function (d) {
      html += '<div class="cal-dow">' + d + '</div>';
    });

    for (var i = lead; i > 0; i--) {
      html += '<div class="cal-day pad"><span class="dn">' + (prevDays - i + 1) + '</span></div>';
    }

    for (var d = 1; d <= days; d++) {
      var list = byDay[d] || [];
      var isToday = (view.y === today.getFullYear() && view.m === today.getMonth() + 1 && d === today.getDate());
      var iso = view.y + '-' + pad(view.m) + '-' + pad(d);
      var cls = 'cal-day' + (list.length ? ' has' : '') + (isToday ? ' today' : '') + (selected === iso ? ' sel' : '');
      html += '<div class="' + cls + '" data-date="' + iso + '"><span class="dn">' + d + '</span>';
      list.slice(0, 3).forEach(function (e) {
        html += '<span class="pill" style="background:' + e.soft + ';border-left:3px solid ' + e.color + '" title="' +
                esc(e.form + ' — ' + e.title) + '">' + esc(e.form) + '</span>';
      });
      if (list.length > 3) html += '<span class="pill more">+' + (list.length - 3) + ' more</span>';
      html += '</div>';
    }

    var tail = (7 - ((lead + days) % 7)) % 7;
    for (var t = 1; t <= tail; t++) {
      html += '<div class="cal-day pad"><span class="dn">' + t + '</span></div>';
    }

    elGrid.innerHTML = html;

    Array.prototype.forEach.call(elGrid.querySelectorAll('.cal-day.has'), function (n) {
      n.onclick = function () {
        selected = (selected === n.dataset.date) ? null : n.dataset.date;
        render(); renderSide();
      };
    });

    renderSide();
  }

  /* ---------------- Side list ---------------- */
  function renderSide() {
    var list, title, sub;
    if (selected) {
      var p = selected.split('-');
      list = visible(DueDates.eventsForMonth(+p[0], +p[1])).filter(function (e) { return e.date === selected; });
      title = 'Due on ' + DueDates.fmt(selected);
      sub = list.length + ' item' + (list.length === 1 ? '' : 's');
    } else {
      list = visible(DueDates.upcoming(40)).slice(0, 12);
      title = 'Upcoming Due Dates';
      sub = 'next 60 days';
    }

    elSideTitle.textContent = title;
    elSideSub.textContent = sub;

    if (!list.length) {
      elList.innerHTML = '<div class="day-detail"><p class="empty">No due dates in the selected categories.</p></div>';
      return;
    }

    elList.innerHTML = list.map(function (e) {
      var n = DueDates.daysUntil(e.date);
      var cd = n < 0 ? '<span class="countdown cd-far">passed</span>'
             : n === 0 ? '<span class="countdown cd-soon">TODAY</span>'
             : n <= 7 ? '<span class="countdown cd-soon">in ' + n + 'd</span>'
             : n <= 21 ? '<span class="countdown cd-near">in ' + n + 'd</span>'
             : '<span class="countdown cd-far">in ' + n + 'd</span>';
      var dp = e.date.split('-');
      return '' +
        '<div class="due-item">' +
          '<div class="due-date" style="border-color:' + e.color + '">' +
            '<b>' + (+dp[2]) + '</b><span>' + DueDates.MONTHS_SHORT[+dp[1] - 1] + '</span>' +
          '</div>' +
          '<div class="due-body">' +
            '<div class="f">' + esc(e.form) +
              '<span class="tagx" style="background:' + e.soft + ';color:' + e.color + '">' + esc(e.catLabel) + '</span>' +
              cd +
            '</div>' +
            '<div class="t">' + esc(e.title) + (e.period ? ' &middot; <b>' + esc(e.period) + '</b>' : '') + '</div>' +
            '<div class="w">' + esc(e.who) + '</div>' +
          '</div>' +
        '</div>';
    }).join('');
  }

  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  document.getElementById('calPrev').onclick = function () {
    view.m--; if (view.m < 1) { view.m = 12; view.y--; } selected = null; render();
  };
  document.getElementById('calNext').onclick = function () {
    view.m++; if (view.m > 12) { view.m = 1; view.y++; } selected = null; render();
  };
  document.getElementById('calToday').onclick = function () {
    view = { y: today.getFullYear(), m: today.getMonth() + 1 }; selected = null; render();
  };

  buildFilters();
  render();

  /* ================================================================
     YEAR VIEW — every due date in a financial year, by category
     ================================================================ */
  (function () {
    var modes = document.getElementById('calModes');
    var monthView = document.getElementById('monthView');
    var yearView = document.getElementById('yearView');
    var grid = document.getElementById('yearGrid');
    var lbl = document.getElementById('fyLabel');
    if (!modes || !grid) return;

    var m = today.getMonth() + 1;
    var fy = m >= 4 ? today.getFullYear() : today.getFullYear() - 1;

    Array.prototype.forEach.call(modes.querySelectorAll('button'), function (b) {
      b.onclick = function () {
        Array.prototype.forEach.call(modes.querySelectorAll('button'), function (x) { x.classList.remove('on'); });
        b.classList.add('on');
        var isYear = b.dataset.mode === 'year';
        yearView.hidden = !isYear;
        monthView.hidden = isYear;
        if (isYear) drawYear();
      };
    });

    document.getElementById('fyPrev').onclick = function () { fy--; drawYear(); };
    document.getElementById('fyNext').onclick = function () { fy++; drawYear(); };

    function drawYear() {
      var groups = DueDates.eventsForFY(fy);
      lbl.textContent = '1 April ' + fy + '  to  31 March ' + (fy + 1) +
                        '   (' + DueDates.fyLabel(fy) + ')';

      grid.innerHTML = Object.keys(DueDates.CATS).map(function (k) {
        var c = DueDates.CATS[k], list = groups[k] || [];
        if (!list.length) return '';
        return '<div class="year-col">' +
          '<h4 style="background:' + c.color + '">' + esc(c.label) +
            '<span>' + list.length + ' dates</span></h4>' +
          list.map(function (e) {
            var n = DueDates.daysUntil(e.date);
            var past = n < 0;
            return '<div class="year-row' + (past ? ' past' : '') + '">' +
              '<span class="yd">' + esc(DueDates.fmt(e.date)) + '</span>' +
              '<span class="yf">' + esc(e.form) +
                (e.extended ? '<span class="ext" title="' + esc(e.extended.note) + '">EXTENDED</span>' : '') +
                (!past && n <= 14 ? '<span class="soon">' + (n === 0 ? 'TODAY' : n + 'd') + '</span>' : '') +
              '</span>' +
              '<span class="yt">' + esc(e.title) + (e.period ? ' &middot; ' + esc(e.period) : '') + '</span>' +
            '</div>';
          }).join('') +
        '</div>';
      }).join('');
    }
  })();

  /* ---------------- Enquiry form -> demo store as a lead ---------------- */
  var form = document.getElementById('inquiryForm');
  if (form) {
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var lead = {
        id: 'LEAD-' + Date.now(),
        name: form.name.value.trim(),
        email: form.email.value.trim(),
        phone: form.phone.value.trim(),
        service: form.service.value,
        message: form.message.value.trim(),
        at: new Date().toISOString(),
        status: 'New'
      };
      try {
        var key = 'kvksn.leads';
        var arr = JSON.parse(localStorage.getItem(key) || '[]');
        arr.unshift(lead);
        localStorage.setItem(key, JSON.stringify(arr));
      } catch (e) { /* storage unavailable — demo still shows the confirmation */ }
      document.getElementById('formOk').style.display = 'block';
      form.reset();
      document.getElementById('formOk').scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  /* ---------------- Nav active state ---------------- */
  var links = Array.prototype.slice.call(document.querySelectorAll('.navlinks a[href^="#"]'));
  var secs = links.map(function (a) { return document.querySelector(a.getAttribute('href')); });
  window.addEventListener('scroll', function () {
    var y = window.scrollY + 140, best = -1;
    secs.forEach(function (s, i) { if (s && s.offsetTop <= y) best = i; });
    links.forEach(function (a, i) { a.classList.toggle('active', i === best); });
  }, { passive: true });
})();
