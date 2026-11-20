/* AI Patio Visualizer (iCreate Your Site).
   The AI Remodel Visualizer (McManus kitchen and bath tool), turned into a concrete patio and enclosure designer.
   The page only needs:  <div id="patio-visualizer"></div>  plus the RV_CONFIG block (see README / embed-snippet.html).
   Photos go to generate.php in this same folder, which calls Google's image model with our key. */
(function () {
  'use strict';

  /* ---------- per-site settings (RV_CONFIG on the page overrides these) ---------- */
  var DEFAULTS = {
    business: 'our',                  /* "Your <business> designer will guide you..." */
    eyebrow: 'Patio Design AI',
    title: 'See your backyard, <em>reimagined.</em>',
    lead: 'Upload a photo of your yard or old patio, choose your concrete and cover, and see your new outdoor space. Then book a consult to make it real.',
    headingTag: 'h1',                 /* use 'h2' when the page already has its own h1 */
    showIntro: true,
    ctaText: 'Ready to Build? Schedule a Consult',
    ctaUrl: '/contact/',              /* where the button goes after the result */
    ctaNewTab: false,
    onCta: null,                      /* optional function(picksText) for sites with their own booking popup */
    colors: {},                       /* primary, primaryDeep, accent, note, eyebrow, ink, inkSoft, surface, field, muted, card */
    fonts: {},                        /* heading, body (CSS font-family values); default: the site's own fonts */
    radius: null,                     /* card corner radius, e.g. '8px' for a squarer brand */
    buttonRadius: null,               /* e.g. '6px' for square buttons; default pill */
    stickyTop: null,                  /* e.g. '120px' if the site's sticky header is tall */
    endpoint: null                    /* default: generate.php next to this script */
  };

  var SCRIPT = document.currentScript;
  var BASE = SCRIPT && SCRIPT.src ? SCRIPT.src.replace(/[^\/]*([?#].*)?$/, '') : '';

  function boot() {
    var root = document.getElementById('patio-visualizer') || document.querySelector('[data-patio-visualizer]');
    if (!root || root.dataset.rvReady) return;
    root.dataset.rvReady = '1';
    var C = Object.assign({}, DEFAULTS, window.RV_CONFIG || {});
    var endpoint = C.endpoint || (BASE + 'generate.php');
    root.classList.add('rv');
    applyBrand(root, C);
    root.innerHTML = markup(C);
    run(root, C, endpoint);
  }

  var VARMAP = { primary: '--rv-primary', primaryDeep: '--rv-primary-deep', accent: '--rv-accent', note: '--rv-note', eyebrow: '--rv-eyebrow',
    ink: '--rv-ink', inkSoft: '--rv-ink-soft', surface: '--rv-surface', field: '--rv-field', muted: '--rv-muted', card: '--rv-card' };
  function applyBrand(root, C) {
    var c = C.colors || {};
    Object.keys(VARMAP).forEach(function (k) { if (c[k]) root.style.setProperty(VARMAP[k], c[k]); });
    if (c.primary && !c.primaryDeep) root.style.setProperty('--rv-primary-deep', 'color-mix(in srgb,' + c.primary + ' 70%,#000)');
    if (C.fonts && C.fonts.heading) root.style.setProperty('--rv-serif', C.fonts.heading);
    if (C.fonts && C.fonts.body) root.style.setProperty('--rv-sans', C.fonts.body);
    if (C.radius) { root.style.setProperty('--rv-radius', C.radius); root.style.setProperty('--rv-radius-sm', C.radius); }
    if (C.buttonRadius) root.style.setProperty('--rv-btn-radius', C.buttonRadius);
    if (C.stickyTop) root.style.setProperty('--rv-sticky-top', C.stickyTop);
  }

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

  var ICON_INFO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>';

  function markup(C) {
    var who = C.business && C.business !== 'our' ? esc(C.business) + ' team' : 'patio team';
    var note = '<div class="rv-note-ic">' + ICON_INFO + '</div><div><b>Just for inspiration</b><p>These AI visuals are a starting point to spark ideas, not a final design or quote. Your ' + who + ' will guide you on what is truly possible for your yard, slope, local codes and budget.</p></div>';
    var h = C.headingTag === 'h2' ? 'h2' : (C.headingTag === 'div' ? 'div' : 'h1');
    return ''
      + (C.showIntro ? '<div class="rv-intro"><div class="rv-eyebrow">' + esc(C.eyebrow) + '</div><' + h + ' class="rv-title">' + C.title + '</' + h + '><p class="rv-lead">' + esc(C.lead) + '</p></div>' : '')
      + '<div class="rv-grid">'
      +   '<div class="rv-card">'
      +     '<div class="rv-stepper">'
      +       '<div class="rv-step active" data-step="1"><div class="rv-dot">1</div><div class="rv-lbl">Your Yard</div></div><div class="rv-step-line" data-line="1"></div>'
      +       '<div class="rv-step" data-step="2"><div class="rv-dot">2</div><div class="rv-lbl">Your Style</div></div><div class="rv-step-line" data-line="2"></div>'
      +       '<div class="rv-step" data-step="3"><div class="rv-dot">3</div><div class="rv-lbl">Your Vision</div></div>'
      +     '</div>'
      +     '<div class="rv-panel show" data-panel="1">'
      +       '<div class="rv-drop" data-rv="drop" role="button" tabindex="0" aria-label="Upload a photo of your yard or patio">'
      +         '<div class="rv-drop-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg></div>'
      +         '<h3>Upload your yard or patio</h3><p>Drag &amp; drop or click to browse</p><span class="rv-choose">Choose Photo</span>'
      +         '<input type="file" data-rv="file" accept="image/*" hidden>'
      +       '</div>'
      +       '<div class="rv-preview" data-rv="preview"><img data-rv="previewImg" alt="Your yard"><button type="button" class="rv-change" data-rv="change">Change photo</button></div>'
      +       '<div class="rv-actions"><button type="button" class="rv-btn rv-btn-primary" data-rv="toStyle" disabled>Continue to Style &rarr;</button></div>'
      +     '</div>'
      +     '<div class="rv-panel" data-panel="2">'
      +       '<div class="rv-panel-head">'
      +         '<div class="rv-progress"><div class="rv-progress-row"><span data-rv="answered">0 of 6 answered</span><b data-rv="pct">0%</b></div><div class="rv-bar"><i data-rv="barFill"></i></div></div>'
      +         '<label class="rv-adv" title="Type your own answers instead of choosing from lists"><input type="checkbox" data-rv="adv"><span class="rv-track"><span class="rv-thumb"></span></span><span class="rv-adv-txt">Advanced <em>(type your own)</em></span></label>'
      +       '</div>'
      +       '<div class="rv-fields" data-rv="fields"></div>'
      +       '<div class="rv-notes" data-rv="notesField" hidden><label>Design Notes</label><textarea data-rv="notes" placeholder="Anything extra: size, steps, a hot tub pad, a grill area, ceiling fans, must-keep trees, a look you are after..."></textarea></div>'
      +       '<div class="rv-actions"><button type="button" class="rv-btn rv-btn-ghost" data-rv="back">&larr; Back</button><button type="button" class="rv-btn rv-btn-primary" data-rv="generate" disabled>Answer 6 questions</button></div>'
      +     '</div>'
      +     '<div class="rv-panel" data-panel="3">'
      +       '<div class="rv-loading" data-rv="loading"><div class="rv-spinner"></div><h3>Designing your patio...</h3><p>Our AI is reimagining your backyard. This usually takes about 10 seconds.</p><div class="rv-err" data-rv="err" role="alert"></div></div>'
      +       '<div class="rv-result" data-rv="result" style="display:none">'
      +         '<h2>Your patio, reimagined</h2><p class="rv-sub">Drag the slider to compare before &amp; after.</p>'
      +         '<div class="rv-ba" data-rv="ba">'
      +           '<img class="rv-ba-img" data-rv="after" alt="After">'
      +           '<div class="rv-ba-before"><img class="rv-ba-img" data-rv="before" alt="Before"></div>'
      +           '<span class="rv-ba-tag l">&#9664; Before</span><span class="rv-ba-tag r">After &#9654;</span>'
      +           '<div class="rv-ba-div" data-rv="baDiv"><div class="rv-ba-handle"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="9.5 7 4.5 12 9.5 17"/><polyline points="14.5 7 19.5 12 14.5 17"/></svg></div></div>'
      +           '<a class="rv-open" data-rv="open" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg> Open image</a>'
      +         '</div>'
      +         '<a class="rv-btn rv-btn-primary rv-cta" data-rv="cta" href="' + esc(C.ctaUrl || '#') + '"' + (C.ctaNewTab ? ' target="_blank" rel="noopener"' : '') + '><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> ' + esc(C.ctaText) + '</a>'
      +         '<button type="button" class="rv-restart" data-rv="restart">Start over with a new photo</button>'
      +       '</div>'
      +     '</div>'
      +   '</div>'
      +   '<div class="rv-note rv-note-under">' + note + '</div>'
      +   '<aside class="rv-aside">'
      +     '<div class="rv-aside-card rv-howto-card" data-rv="howtoCard">'
      +       '<h2><button type="button" class="rv-howto-toggle" data-rv="howtoToggle" aria-expanded="false">How it works<i class="rv-chev" aria-hidden="true"></i></button></h2>'
      +       '<div class="rv-howto-body"><div><ol class="rv-howto">'
      +         '<li><span class="rv-n">1</span><div><b>Upload a photo</b><p>Snap your backyard, old slab or bare patch of lawn, just as it looks today. Stand back so the back of the house shows.</p></div></li>'
      +         '<li><span class="rv-n">2</span><div><b>Choose your style</b><p>Pick the project, concrete finish, pattern, color and cover, or switch on Advanced to type your own.</p></div></li>'
      +         '<li><span class="rv-n">3</span><div><b>See it reimagined</b><p>Our AI shows your new patio on your own home in seconds.</p></div></li>'
      +         '<li><span class="rv-n">4</span><div><b>Book a consult</b><p>Love a direction? Schedule a consult and we will pour it.</p></div></li>'
      +       '</ol></div></div>'
      +     '</div>'
      +     '<div class="rv-note">' + note + '</div>'
      +   '</aside>'
      + '</div>';
  }

  /* ---------- the tool (same behavior as the McManus remodel tool, patio questions and prompt) ---------- */
  function run(root, C, endpoint) {
    var $ = function (k) { return root.querySelector('[data-rv="' + k + '"]'); };
    var $$ = function (s) { return [].slice.call(root.querySelectorAll(s)); };

    var OPTIONS = {
      'Project': ['New Concrete Patio', 'Patio + Pergola', 'Patio + Solid Roof Cover', 'Screened Porch Enclosure', 'Glass Sunroom Enclosure', 'Patio + Fire Pit Area'],
      'Concrete Finish': ['Broom Finish', 'Stamped Concrete', 'Exposed Aggregate', 'Smooth Trowel', 'Salt Finish', 'Acid-Stained'],
      'Pattern': ['Plain with Saw-Cut Joints', 'Large Square Score Lines', 'Ashlar Slate', 'Flagstone', 'Wood Plank', 'Contrasting Border Band'],
      'Concrete Color': ['Natural Gray', 'Warm Sandstone', 'Charcoal', 'Desert Tan', 'Terracotta', 'Two-Tone with Darker Border'],
      'Design Style': ['Modern', 'Traditional', 'Rustic', 'Coastal', 'Mediterranean', 'Resort Luxury'],
      'Budget Range': ['Under $10k', '$10k–$25k', '$25k–$50k', '$50k–$100k', '$100k+', 'Not Sure Yet']
    };
    var FIELD_ORDER = ['Project', 'Concrete Finish', 'Pattern', 'Concrete Color', 'Design Style', 'Budget Range'];
    var TEXT_FIELDS = ['Project', 'Concrete Finish', 'Pattern', 'Concrete Color', 'Design Style'];   /* Budget stays a dropdown */
    var PLACEHOLDER = { 'Project': 'e.g. covered patio with a screened section', 'Concrete Finish': 'e.g. stamped, with a smooth border', 'Pattern': 'e.g. large flagstone stamp', 'Concrete Color': 'e.g. light tan with a charcoal border', 'Design Style': 'e.g. modern farmhouse' };
    var answers = {}, advanced = false, upB64 = null, upMime = null, upURL = null, afterURL = null;

    function goStep(n) {
      $$('.rv-panel').forEach(function (p) { p.classList.toggle('show', +p.dataset.panel === n); });
      $$('.rv-step').forEach(function (s) { var i = +s.dataset.step; s.classList.toggle('active', i === n); s.classList.toggle('done', i < n); });
      $$('.rv-step-line').forEach(function (l) { l.classList.toggle('fill', +l.dataset.line < n); });
    }

    /* upload */
    var drop = $('drop'), file = $('file');
    drop.addEventListener('click', function () { file.click(); });
    drop.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); file.click(); } });
    $('change').addEventListener('click', function (e) { e.stopPropagation(); file.click(); });
    ['dragenter', 'dragover'].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add('drag'); }); });
    ['dragleave', 'drop'].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove('drag'); }); });
    drop.addEventListener('drop', function (e) { if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); });
    file.addEventListener('change', function (e) { if (e.target.files[0]) handleFile(e.target.files[0]); file.value = ''; });
    function handleFile(f) {
      if (!/^image\//.test(f.type)) return;
      if (upURL) URL.revokeObjectURL(upURL);
      upB64 = null; upMime = f.type; upURL = URL.createObjectURL(f);
      $('previewImg').src = upURL; $('preview').classList.add('show'); drop.style.display = 'none'; $('toStyle').disabled = false;
      shrink(f).then(function (d) { upB64 = d.b64; upMime = d.mime; });
    }
    /* the AI only needs ~1600px: a 3-6 MB phone photo becomes a ~400 KB JPEG before upload (faster upload and faster AI).
       The slider still shows the customer's original file. */
    function shrink(f) {
      var raw = function () { return new Promise(function (res) { var r = new FileReader(); r.onload = function () { res({ b64: r.result.split(',')[1], mime: f.type || 'image/jpeg' }); }; r.readAsDataURL(f); }); };
      if (!window.createImageBitmap) return raw();
      return createImageBitmap(f, { imageOrientation: 'from-image' }).then(function (bmp) {
        var MAX = 1600, k = Math.min(1, MAX / Math.max(bmp.width, bmp.height));
        var c = document.createElement('canvas'); c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
        c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
        return { b64: c.toDataURL('image/jpeg', 0.86).split(',')[1], mime: 'image/jpeg' };
      }).catch(raw);
    }
    $('toStyle').addEventListener('click', function () { goStep(2); });
    $('back').addEventListener('click', function () { goStep(1); });

    /* fields: dropdowns, or free text in Advanced */
    var grid = $('fields');
    function renderFields() {
      grid.innerHTML = '';
      FIELD_ORDER.forEach(function (key) {
        var asText = advanced && TEXT_FIELDS.indexOf(key) > -1;
        var field = document.createElement('div');
        field.className = 'rv-field' + (answers[key] ? ' answered' : '');
        if (asText) {
          field.innerHTML = '<label>' + key + '</label><input class="rv-txt" type="text" placeholder="' + esc(PLACEHOLDER[key] || '') + '">';
          var inp = field.querySelector('.rv-txt');
          inp.value = answers[key] || '';
          inp.addEventListener('input', function () { var v = inp.value.trim(); if (v) { answers[key] = v; field.classList.add('answered'); } else { delete answers[key]; field.classList.remove('answered'); } updateProgress(); });
        } else {
          field.innerHTML = '<label>' + key + '</label><button class="rv-dd" type="button" aria-haspopup="listbox"><span class="rv-dd-val">' + (answers[key] ? esc(answers[key]) : 'Select&hellip;') + '</span><i class="rv-caret"></i></button><div class="rv-list" role="listbox"></div>';
          var list = field.querySelector('.rv-list'), val = field.querySelector('.rv-dd-val');
          OPTIONS[key].forEach(function (opt) {
            var b = document.createElement('button'); b.type = 'button'; b.className = 'rv-opt' + (answers[key] === opt ? ' sel' : ''); b.setAttribute('role', 'option');
            b.innerHTML = '<span>' + esc(opt) + '</span><svg class="rv-ck" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
            b.addEventListener('click', function () { answers[key] = opt; val.textContent = opt; field.classList.add('answered'); [].forEach.call(list.querySelectorAll('.rv-opt'), function (o) { o.classList.remove('sel'); }); b.classList.add('sel'); field.classList.remove('open'); updateProgress(); });
            list.appendChild(b);
          });
          field.querySelector('.rv-dd').addEventListener('click', function (e) { e.stopPropagation(); var w = field.classList.contains('open'); $$('.rv-field').forEach(function (f) { f.classList.remove('open'); }); if (!w) field.classList.add('open'); });
        }
        grid.appendChild(field);
      });
    }
    document.addEventListener('click', function () { $$('.rv-field').forEach(function (f) { f.classList.remove('open'); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') $$('.rv-field').forEach(function (f) { f.classList.remove('open'); }); });

    $('adv').addEventListener('change', function (e) { advanced = e.target.checked; $('notesField').hidden = !advanced; renderFields(); updateProgress(); });

    function updateProgress() {
      var n = FIELD_ORDER.filter(function (k) { return answers[k] && String(answers[k]).trim(); }).length;
      $('answered').textContent = n + ' of 6 answered'; $('pct').textContent = Math.round(n / 6 * 100) + '%'; $('barFill').style.width = (n / 6 * 100) + '%';
      var g = $('generate'); g.disabled = n < 6; g.textContent = n < 6 ? 'Answer ' + (6 - n) + ' more' : 'Generate My Patio →';
    }

    /*PROMPT:START  what each choice means to the AI: real new concrete work and a real built structure, never a repaint of the old slab */
    var DETAIL = {
      'Project': {
        'New Concrete Patio': 'a brand new poured concrete patio off the back of the house, open to the sky, generously sized for a dining table and a lounge seating area',
        'Patio + Pergola': 'a brand new poured concrete patio with a freestanding or house-attached pergola over part of it: substantial posts, beams and evenly spaced rafters, with dappled shade below',
        'Patio + Solid Roof Cover': 'a brand new poured concrete patio with a solid roof patio cover attached to the house: a roof that ties neatly into the existing roofline or fascia, a finished ceiling with recessed lights and a ceiling fan, gutters, and sturdy posts on proper footings',
        'Screened Porch Enclosure': 'a brand new concrete slab with a screened porch enclosure attached to the house: a solid roof that ties into the existing roofline, framed walls with large full-height screen panels, a short knee wall or kick plate, a screen door with steps, a finished ceiling with a fan and lights',
        'Glass Sunroom Enclosure': 'a brand new concrete slab with a four-season glass sunroom attached to the house: a solid insulated roof that ties into the existing roofline, large floor-to-ceiling windows on slim frames, a glass door, and a bright, comfortable furnished room inside',
        'Patio + Fire Pit Area': 'a brand new poured concrete patio by the house that flows into a round concrete fire pit area with built-in seat walls, connected by a matching concrete path'
      },
      'Concrete Finish': {
        'Broom Finish': 'a clean, even light broom finish with crisp smooth-troweled edges',
        'Stamped Concrete': 'decorative stamped concrete with realistic texture and depth, sealed with a soft satin sheen',
        'Exposed Aggregate': 'exposed aggregate concrete showing small rounded pebbles across the whole surface',
        'Smooth Trowel': 'a smooth, dense hand-troweled finish with a light non-slip seal',
        'Salt Finish': 'a salt finish with a soft, subtle pitted texture',
        'Acid-Stained': 'acid-stained concrete with rich, variegated mottled color and a satin sealer'
      },
      'Pattern': {
        'Plain with Saw-Cut Joints': 'plain slab with clean, straight saw-cut control joints in a neat grid',
        'Large Square Score Lines': 'large square panels scored in a tidy grid, like big pavers',
        'Ashlar Slate': 'an ashlar slate stamp pattern of mixed rectangles and squares with slate texture',
        'Flagstone': 'a random flagstone stamp pattern with natural stone texture and grout-like joints',
        'Wood Plank': 'a wood plank stamp pattern with realistic grain and plank ends',
        'Contrasting Border Band': 'a field of concrete framed by a wide contrasting border band around the whole edge'
      },
      'Concrete Color': {
        'Natural Gray': 'natural light gray concrete',
        'Warm Sandstone': 'warm sandstone beige integral color',
        'Charcoal': 'deep charcoal gray integral color',
        'Desert Tan': 'desert tan integral color with a soft darker release-agent antiquing',
        'Terracotta': 'warm terracotta red-brown integral color',
        'Two-Tone with Darker Border': 'a light field color with a darker contrasting border'
      },
      'Design Style': {
        'Modern': 'modern: clean lines, black metal or smooth painted posts, slim modern furniture, linear lighting and simple planting',
        'Traditional': 'classic traditional: white painted columns or posts, trim that matches the house, classic outdoor furniture and lantern lighting',
        'Rustic': 'rustic: rough-sawn cedar or stained wood beams and posts, stone accents, chunky wood furniture and warm string lights',
        'Coastal': 'coastal: crisp white posts and trim, light airy colors, weathered teak and woven furniture and a breezy feel',
        'Mediterranean': 'Mediterranean: warm stucco-white and terracotta tones, potted olive trees, wrought iron details and lantern lighting',
        'Resort Luxury': 'resort luxury: substantial posts and beams, plush deep seating, an outdoor rug, layered lighting, lush planting and a high-end hospitality feel'
      },
      'Budget Range': {
        'Under $10k': 'a simple, clean, well-built result in good durable materials',
        '$10k–$25k': 'good-quality materials, neat edges and a tidy finished look',
        '$25k–$50k': 'upgraded materials, decorative concrete work and built-in lighting',
        '$50k–$100k': 'premium materials, a substantial structure and built-in lighting and features',
        '$100k+': 'top-tier custom construction, premium finishes and resort-level features',
        'Not Sure Yet': 'tasteful upper-mid-range materials'
      }
    };
    function said(f) { return (DETAIL[f] && DETAIL[f][answers[f]]) || answers[f]; }
    function buildPrompt() {
      var p = 'You are a senior designer at a high-end concrete and outdoor living contractor. Show this backyard, patio or side of the house after a complete professional outdoor project: real new concrete work and real new construction, NOT a repaint, NOT a pressure-wash and NOT a light refresh of what is there.' +
        ' KEEP the house exactly as it is: the same walls, siding, brick, roofline, windows, doors, camera angle, lens and perspective. Keep the property the same: the same fences, neighbouring houses, large trees, the slope of the ground and the sky. Do not move, add or remove any windows or doors on the house.' +
        ' REMOVE any old, cracked, stained or uneven slab, worn pavers, an old deck, patchy lawn or bare dirt where the new patio goes, and REPLACE it with brand new work. Place the new patio where it naturally belongs: against the back of the house, with any doors opening onto it at a sensible level and with proper steps if needed.' +
        ' Show real craftsmanship: a level, flat slab with crisp straight or gently curved edges, a neat finished edge where it meets the lawn or planting beds, sensible control joints, consistent color and texture across the whole surface, and a clean transition to the house. Any roof, pergola or enclosure must look structurally real: posts on proper footings, beams sized to their span, a roof pitched and tied neatly into the existing house, matching trim and gutters.' +
        ' Furnish it with tasteful outdoor furniture to scale, add fresh planting beds and tidy lawn edges around it, and keep it uncluttered.' +
        ' Project: ' + said('Project') + '. Concrete finish: ' + said('Concrete Finish') + '. Pattern: ' + said('Pattern') + '. Concrete color: ' + said('Concrete Color') + '. Design direction: ' + said('Design Style') + '. Materials level: ' + said('Budget Range') + '.';
      var notes = $('notes').value.trim();
      if (advanced && notes) p += ' Additional client notes to honor: ' + notes + '.';
      p += ' Make it photorealistic and magazine quality with natural daylight. Do not add any text, labels, people or watermarks.';
      return p;
    }
    /*PROMPT:END*/

    var tick = null;
    $('generate').addEventListener('click', generate);
    function generate() {
      goStep(3); $('loading').style.display = 'block'; $('result').style.display = 'none'; $('err').classList.remove('show', 'rv-err--info');
      var sp0 = root.querySelector('.rv-loading .rv-spinner'); if (sp0) sp0.style.display = '';
      var lead0 = root.querySelector('.rv-loading > p'); if (lead0) lead0.textContent = 'Our AI is reimagining your backyard. This usually takes about 10 seconds.';
      var MSGS = ['Breaking out the old slab...', 'Setting the forms...', 'Pouring your new concrete...', 'Stamping and finishing the surface...', 'Raising the posts and roof...', 'Adding furniture and finishing touches...'];
      var mi = 0, h = root.querySelector('.rv-loading h3'); h.textContent = 'Designing your patio...';
      clearInterval(tick);
      tick = setInterval(function () { h.classList.add('swap'); setTimeout(function () { h.textContent = MSGS[mi++ % MSGS.length]; h.classList.remove('swap'); }, 250); }, 2200);
      var ready = upB64 ? Promise.resolve() : new Promise(function (r) { var t = setInterval(function () { if (upB64) { clearInterval(t); r(); } }, 50); });
      ready.then(function () {
        return fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: buildPrompt(), image: upB64, mimeType: upMime || 'image/jpeg' }) });
      }).then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (data) {
          /* 404 / 405 / 501 = generate.php is not on this host (a static preview such as GitHub Pages) */
          if (!res.ok && [404, 405, 501].indexOf(res.status) > -1) { var e = new Error('no-server'); e.noServer = true; throw e; }
          if (!res.ok) throw new Error((data.error && (data.error.message || data.error)) || ('HTTP ' + res.status));
          var parts = (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) || [];
          var img = parts.filter(function (p) { return p.inlineData; })[0];
          if (!img) throw new Error('No image was returned. Please try again.');
          clearInterval(tick);
          showResult(img.inlineData.data, img.inlineData.mimeType || 'image/png');
        });
      }).catch(function (err) {
        clearInterval(tick);
        /* no AI server here (static preview, or a file opened from disk): explain kindly instead of showing an error */
        if (err.noServer || err instanceof TypeError) {
          var sp = root.querySelector('.rv-loading .rv-spinner'); if (sp) sp.style.display = 'none';
          h.textContent = 'Your design will appear here on the live site';
          var lead = root.querySelector('.rv-loading > p');
          if (lead) lead.textContent = 'This is a preview of the website, so the AI designer is switched off. On the live ' + (C.business || 'website') + ' site, your new patio appears right here in about 10 seconds.';
          $('err').classList.add('show', 'rv-err--info');
          $('err').innerHTML = '<a class="rv-btn rv-btn-primary" data-rv="previewCta" href="' + esc(C.ctaUrl || '#') + '" style="display:inline-flex;flex:none;padding:13px 24px">' + 'Book a Consultation</a>';
          $('previewCta').addEventListener('click', function (e) { if (typeof C.onCta === 'function') { e.preventDefault(); C.onCta(''); } });
          return;
        }
        var sp2 = root.querySelector('.rv-loading .rv-spinner'); if (sp2) sp2.style.display = '';
        h.textContent = 'Something went wrong';
        $('err').innerHTML = esc('Sorry, ' + err.message) + ' <button type="button" class="rv-btn rv-btn-ghost" data-rv="retry" style="margin-top:12px;padding:10px 18px;font-size:.9rem">Try again</button>';
        $('err').classList.add('show');
        $('retry').addEventListener('click', generate);
      });
    }
    function showResult(b64, mime) {
      /* a blob link: browsers refuse to open a data: image in a new tab */
      var bin = atob(b64), arr = new Uint8Array(bin.length);
      for (var i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
      if (afterURL) URL.revokeObjectURL(afterURL);
      afterURL = URL.createObjectURL(new Blob([arr], { type: mime }));
      $('loading').style.display = 'none'; $('result').style.display = 'block';
      $('after').src = afterURL; $('before').src = upURL; $('open').href = afterURL;
      requestAnimationFrame(initSlider);
    }
    var sliderBound = false, setPct = function () {};
    function initSlider() {
      var ba = $('ba'), before = ba.querySelector('.rv-ba-before'), div = $('baDiv'), after = $('after');
      /* the frame takes the AI image's own shape, so nothing is cropped and both photos line up */
      var fit = function () { if (!after.naturalWidth) return; var r = after.naturalWidth / after.naturalHeight; ba.style.aspectRatio = r + ''; ba.style.maxWidth = 'min(100%, calc(72vh * ' + r + '))'; ba.style.marginInline = 'auto'; };
      if (after.complete && after.naturalWidth) fit(); else after.addEventListener('load', fit, { once: true });
      setPct = function (p) { p = Math.max(0, Math.min(100, p)); before.style.clipPath = 'inset(0 ' + (100 - p) + '% 0 0)'; div.style.left = p + '%'; };
      setPct(50);
      if (sliderBound) return; sliderBound = true;
      var drag = false, move = function (x) { var r = ba.getBoundingClientRect(); setPct((x - r.left) / r.width * 100); };
      ba.addEventListener('pointerdown', function (e) { if (e.target.closest('.rv-open')) return; drag = true; move(e.clientX); });
      window.addEventListener('pointermove', function (e) { if (drag) move(e.clientX); });
      window.addEventListener('pointerup', function () { drag = false; });
      window.addEventListener('pointercancel', function () { drag = false; });
    }
    $('restart').addEventListener('click', function () {
      upB64 = null; if (upURL) URL.revokeObjectURL(upURL); upURL = null;
      drop.style.display = 'block'; $('preview').classList.remove('show'); $('toStyle').disabled = true;
      Object.keys(answers).forEach(function (k) { delete answers[k]; });
      $('notes').value = '';
      renderFields(); updateProgress(); goStep(1);
    });

    /* the consult button: a plain link, or the site's own booking popup through onCta(picks) */
    $('cta').addEventListener('click', function (e) {
      var picks = FIELD_ORDER.filter(function (k) { return answers[k]; }).map(function (k) { return k + ': ' + answers[k]; }).join(', ');
      var text = picks ? 'I tried the AI patio designer. My picks: ' + picks + '.' : '';
      try { sessionStorage.setItem('pv_picks', text); } catch (x) {}
      if (typeof C.onCta === 'function') { e.preventDefault(); C.onCta(text); }
    });

    /* How it works: a dropdown on tablets and phones; on desktop the list always shows */
    var card = $('howtoCard'), tog = $('howtoToggle');
    tog.addEventListener('click', function () { if (window.innerWidth > 960) return; var o = card.classList.toggle('open'); tog.setAttribute('aria-expanded', o ? 'true' : 'false'); });

    renderFields(); updateProgress();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
