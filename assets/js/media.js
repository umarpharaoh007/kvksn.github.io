/* ================================================================
   KVKSN & Co. — Website media store

   Holds the banner images shown in the scrolling strip on the home
   page, plus an optional custom logo. Images are downscaled in the
   browser and kept as data URLs in localStorage, so the site stays
   completely offline.

   Kept in its OWN storage key so "Reset demo data" in the admin
   console does not wipe images the firm has uploaded.
   ================================================================ */
(function (global) {
  'use strict';

  var KEY = 'kvksn.media.v2';

  /* ----------------------------------------------------------------
     DROP-IN IMAGE SLOTS

     Save your own artwork into assets/img/ with any of these names
     and the site picks it up automatically on the next reload —
     no upload, no code change:

         banner-1.png   banner-2.png   banner-3.png   ... up to 6
         ca-india.png   (the logo)

     .jpg works too. Any slot whose file is missing is skipped
     silently. If at least one drop-in banner is found, the built-in
     placeholder banners below step aside.

     The alternative is Practice Console → Website Media, which
     uploads through the browser and stores the image locally.
  ---------------------------------------------------------------- */
  var DROPIN_SLOTS = 6;
  function dropinCandidates() {
    var out = [];
    for (var i = 1; i <= DROPIN_SLOTS; i++) {
      out.push('assets/img/banner-' + i + '.png');
      out.push('assets/img/banner-' + i + '.jpg');
    }
    return out;
  }

  /* Built-in placeholder banners, used until you supply your own. */
  var DEFAULTS = [
    { id: 'b1', name: 'ITR due date', src: 'assets/img/banner-itr.svg',
      caption: '', link: '#calendar', active: true, builtin: true },
    { id: 'b2', name: 'e-Verification', src: 'assets/img/banner-verify.svg',
      caption: '', link: '#services', active: true, builtin: true },
    { id: 'b3', name: 'GST compliance', src: 'assets/img/banner-gst.svg',
      caption: '', link: '#calendar', active: true, builtin: true }
  ];

  /** Resolves true if an image URL actually loads. */
  function probe(src) {
    return new Promise(function (resolve) {
      var img = new Image();
      img.onload = function () { resolve(img.naturalWidth > 0); };
      img.onerror = function () { resolve(false); };
      img.src = src;
    });
  }

  /**
   * Returns the banner list to display: any drop-in files found on
   * disk, plus uploaded banners. Falls back to the built-in set when
   * the firm has supplied nothing of its own.
   */
  function resolveBanners() {
    load();
    var uploaded = state.banners.filter(function (b) { return !b.builtin && b.active; });
    return Promise.all(dropinCandidates().map(probe)).then(function (found) {
      var cands = dropinCandidates();
      var drops = [];
      var seen = {};
      cands.forEach(function (src, i) {
        if (!found[i]) return;
        var slot = src.replace(/\.(png|jpg)$/, '');
        if (seen[slot]) return;            // prefer .png over .jpg for a slot
        seen[slot] = true;
        drops.push({ id: 'drop-' + slot, name: slot.split('/').pop(), src: src,
                     caption: '', link: '', active: true, dropin: true });
      });
      var own = drops.concat(uploaded);
      if (own.length) return own;
      return state.banners.filter(function (b) { return b.active; });
    });
  }

  var state = null;

  function load() {
    if (state) return state;
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) state = JSON.parse(raw);
    } catch (e) { state = null; }
    if (!state || !state.banners) {
      state = { banners: DEFAULTS.map(function (b) { return copy(b); }), logo: null, interval: 5000 };
      save();
    }
    if (!state.interval) state.interval = 5000;
    return state;
  }

  function copy(o) { return JSON.parse(JSON.stringify(o)); }

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
      return { ok: true };
    } catch (e) {
      return { ok: false, error: 'Browser storage is full. Delete an existing banner, or upload a smaller image.' };
    }
  }

  /* ---------- image handling ---------- */

  /** Read a File, downscale it to maxW, return a data URL. */
  function fileToDataUrl(file, maxW, asPng) {
    return new Promise(function (resolve, reject) {
      if (!/^image\//.test(file.type)) {
        reject(new Error('That is not an image file. Please choose a PNG, JPG, WEBP or SVG.'));
        return;
      }
      // SVGs are already small and scale perfectly — keep them as-is.
      if (file.type === 'image/svg+xml') {
        var rs = new FileReader();
        rs.onload = function () { resolve({ url: rs.result, w: 0, h: 0 }); };
        rs.onerror = function () { reject(new Error('Could not read that file.')); };
        rs.readAsDataURL(file);
        return;
      }
      var reader = new FileReader();
      reader.onload = function () {
        var img = new Image();
        img.onload = function () {
          var w = img.naturalWidth, h = img.naturalHeight;
          var scale = Math.min(1, maxW / w);
          var cw = Math.round(w * scale), ch = Math.round(h * scale);
          var cv = document.createElement('canvas');
          cv.width = cw; cv.height = ch;
          var ctx = cv.getContext('2d');
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, cw, ch);
          // PNG preserves transparency (needed for logos); JPEG is far
          // smaller for photographic banners.
          var keepAlpha = asPng || file.type === 'image/png' && hasAlpha(ctx, cw, ch);
          var url = keepAlpha ? cv.toDataURL('image/png') : cv.toDataURL('image/jpeg', 0.85);
          resolve({ url: url, w: cw, h: ch, bytes: Math.round(url.length * 0.75) });
        };
        img.onerror = function () { reject(new Error('That image could not be decoded.')); };
        img.src = reader.result;
      };
      reader.onerror = function () { reject(new Error('Could not read that file.')); };
      reader.readAsDataURL(file);
    });
  }

  function hasAlpha(ctx, w, h) {
    try {
      var d = ctx.getImageData(0, 0, Math.min(w, 200), Math.min(h, 200)).data;
      for (var i = 3; i < d.length; i += 4) if (d[i] < 250) return true;
    } catch (e) { /* tainted canvas — assume opaque */ }
    return false;
  }

  /* ---------- banners ---------- */

  function banners(activeOnly) {
    load();
    return state.banners.filter(function (b) { return !activeOnly || b.active; });
  }

  function addBanner(file, meta) {
    return fileToDataUrl(file, 1600, false).then(function (r) {
      load();
      state.banners.push({
        id: 'b' + Date.now() + Math.floor(Math.random() * 99),
        name: (meta && meta.name) || file.name.replace(/\.[^.]+$/, ''),
        src: r.url,
        caption: (meta && meta.caption) || '',
        link: (meta && meta.link) || '',
        active: true, builtin: false,
        w: r.w, h: r.h, bytes: r.bytes,
        at: new Date().toISOString()
      });
      var res = save();
      if (!res.ok) { state.banners.pop(); throw new Error(res.error); }
      return state.banners[state.banners.length - 1];
    });
  }

  function updateBanner(id, patch) {
    load();
    var b = state.banners.filter(function (x) { return x.id === id; })[0];
    if (!b) return false;
    Object.keys(patch).forEach(function (k) { b[k] = patch[k]; });
    save(); return true;
  }

  function removeBanner(id) {
    load();
    state.banners = state.banners.filter(function (b) { return b.id !== id; });
    save();
  }

  function move(id, dir) {
    load();
    var i = -1;
    state.banners.forEach(function (b, k) { if (b.id === id) i = k; });
    var j = i + dir;
    if (i < 0 || j < 0 || j >= state.banners.length) return;
    var t = state.banners[i]; state.banners[i] = state.banners[j]; state.banners[j] = t;
    save();
  }

  function setInterval_(ms) { load(); state.interval = ms; save(); }
  function interval() { load(); return state.interval; }

  function restoreDefaults() {
    load();
    state.banners = DEFAULTS.map(function (b) { return copy(b); });
    save();
  }

  /* ---------- logo ----------
     Two variants are kept, because one image cannot work on both a
     cream header and a dark navy footer:

       'main'  — the normal logo, used on light backgrounds
       'light' — a pale version for dark backgrounds (footer, sidebar,
                 login panel)

     Each falls back to a file on disk if nothing has been uploaded:
       assets/img/ca-india.png  /  assets/img/ca-india-light.png
  --------------------------------------------------------------- */
  var FILE_MAIN = 'assets/img/ca-india.png';
  var FILE_LIGHT = 'assets/img/ca-india-light.png';

  function setLogo(file, variant) {
    var key = variant === 'light' ? 'logoLight' : 'logo';
    return fileToDataUrl(file, 480, true).then(function (r) {
      load();
      var prev = state[key];
      state[key] = r.url;
      var res = save();
      if (!res.ok) { state[key] = prev; throw new Error(res.error); }
      return r;
    });
  }

  function clearLogo(variant) {
    load();
    state[variant === 'light' ? 'logoLight' : 'logo'] = null;
    save();
  }

  function logo(variant) {
    load();
    return variant === 'light' ? state.logoLight : state.logo;
  }

  /**
   * Point every [data-logo] image at the right artwork:
   * uploaded variant → file on disk → the other variant as a last resort.
   */
  function applyLogo(root) {
    load();
    var marks = (root || document).querySelectorAll('[data-logo]');
    Array.prototype.forEach.call(marks, function (img) {
      var wantLight = img.getAttribute('data-logo') === 'light';
      var uploaded = wantLight ? state.logoLight : state.logo;
      if (uploaded) { img.src = uploaded; return; }

      var first = wantLight ? FILE_LIGHT : FILE_MAIN;
      var second = wantLight ? FILE_MAIN : FILE_LIGHT;
      probe(first).then(function (ok) {
        if (ok) { img.src = first; return; }
        // Nothing for this variant — fall back to whatever exists.
        var other = wantLight ? state.logo : state.logoLight;
        if (other) { img.src = other; return; }
        probe(second).then(function (ok2) { if (ok2) img.src = second; });
      });
    });
  }

  function usageBytes() {
    load();
    try { return JSON.stringify(state).length; } catch (e) { return 0; }
  }

  global.Media = {
    KEY: KEY,
    load: load, save: save,
    banners: banners, resolveBanners: resolveBanners, probe: probe,
    addBanner: addBanner, updateBanner: updateBanner,
    removeBanner: removeBanner, move: move, restoreDefaults: restoreDefaults,
    setInterval: setInterval_, interval: interval,
    setLogo: setLogo, clearLogo: clearLogo, logo: logo, applyLogo: applyLogo,
    fileToDataUrl: fileToDataUrl, usageBytes: usageBytes
  };
})(window);
