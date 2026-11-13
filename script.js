/* Z-BREACH loading screen logic.
   ES5 only: GMod's main branch still uses an old Awesomium/WebKit. */
(function () {
  'use strict';

  /* ================= CONFIG ================= */
  var SLIDES = [
    { img: 'img/bg1.jpg', title: 'МОГ Эпсилон-11', text: '«Девятихвостая лиса». Вернуть объект под контроль любой ценой.' },
    { img: 'img/bg2.jpg', title: 'Повстанцы Хаоса', text: 'Проникновение через шлюз B. Связь с периметром потеряна.' },
    { img: 'img/bg3.jpg', title: 'Объект ███', text: 'Класс: KETER. Местоположение: НЕИЗВЕСТНО.' },
    { img: 'img/bg4.jpg', title: 'Неопознанный субъект', text: 'Зафиксирована аномальная активность в секторе D-4.' },
    { img: 'img/bg5.jpg', title: 'Служба безопасности', text: 'Ударная группа на подходе. Ожидайте эвакуацию.' },
    { img: 'img/bg6.jpg', title: 'Персонал класса D', text: 'Камеры содержания открыты. Персонал D покинул блок.' },
    { img: 'img/bg7.jpg', title: 'Ночная высадка', text: 'Высадка через 60 секунд. Огонь на поражение.' }
  ];
  var SLIDE_TIME = 7000;

  var TIPS = [
    'Держитесь группой — в одиночку на объекте не выжить.',
    'Не смотрите в глаза тому, что сидит в темноте.',
    'Аптечки и обезболивающие спасают жизнь. Не тратьте их зря.',
    'Ключ-карты открывают двери. Карта уровня 5 — почти всё.',
    'Шум привлекает внимание. Иногда лучше переждать.',
    'Класс D: выход есть. Нужно лишь его найти.',
    'Уважайте других игроков. Правила — в F1.'
  ];

  var BOOT = [
    ['ok',   'SITE-19 MAINFRAME v4.0.2 ................ ONLINE'],
    ['',     'Подключение к защищённому каналу...'],
    ['',     'Проверка допуска персонала ............. OK'],
    ['warn', '!! ОБНАРУЖЕНО НАРУШЕНИЕ УСЛОВИЙ СОДЕРЖАНИЯ'],
    ['warn', '!! Блокировка шлюзов: СБОЙ'],
    ['',     'Запуск протокола «КРАСНЫЙ»...'],
    ['',     'Вызов мобильной оперативной группы...']
  ];

  /* ================= HELPERS ================= */
  function $(id) { return document.getElementById(id); }
  function pad(n, l) { n = String(n); while (n.length < l) n = '0' + n; return n; }
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function addClass(el, c) { if ((' ' + el.className + ' ').indexOf(' ' + c + ' ') < 0) el.className = (el.className + ' ' + c).replace(/^\s+/, ''); }
  function delClass(el, c) { el.className = (' ' + el.className + ' ').replace(' ' + c + ' ', ' ').replace(/^\s+|\s+$/g, ''); }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  /* scale the whole UI to window height (no vw/vh in old WebKit) */
  function rescale() {
    var h = window.innerHeight || 1080, w = window.innerWidth || 1920;
    var s = Math.min(h / 1080, w / 1920) * 16;
    document.documentElement.style.fontSize = clamp(s, 8, 32) + 'px';
  }
  rescale();
  window.onresize = rescale;

  /* ================= PRELOAD ================= */
  for (var p = 0; p < SLIDES.length; p++) { var im = new Image(); im.src = SLIDES[p].img; }

  /* ================= SLIDESHOW ================= */
  var layers = [$('slideA'), $('slideB')], front = 0, slideIdx = -1, kb = 0;
  var order = [];
  (function shuffle() {
    for (var i = 0; i < SLIDES.length; i++) order.push(i);
    for (var j = order.length - 1; j > 0; j--) { var k = Math.floor(Math.random() * (j + 1)); var t = order[j]; order[j] = order[k]; order[k] = t; }
  })();

  function nextSlide() {
    slideIdx = (slideIdx + 1) % order.length;
    var s = SLIDES[order[slideIdx]];
    var back = 1 - front, el = layers[back];

    el.className = 'slide';                 // reset animation
    void el.offsetWidth;                    // force reflow so it restarts
    el.style.backgroundImage = 'url(' + s.img + ')';
    kb = (kb % 3) + 1;
    el.className = 'slide on kb' + kb;
    delClass(layers[front], 'on');
    front = back;

    var cap = $('caption');
    addClass(cap, 'hide');
    setTimeout(function () {
      $('capIdx').innerHTML = pad(order[slideIdx] + 1, 2) + ' / ' + pad(SLIDES.length, 2);
      $('capTitle').innerHTML = esc(s.title);
      $('capText').innerHTML = esc(s.text);
      delClass(cap, 'hide');
    }, 650);

    glitchHit();
  }

  /* ================= GLITCH / FLASH ================= */
  function glitchHit() {
    var g = document.querySelector('.glitch'), f = $('flash');
    delClass(g, 'shake'); delClass(f, 'go');
    void g.offsetWidth;
    addClass(g, 'shake'); addClass(f, 'go');
  }
  function randomGlitch() {
    glitchHit();
    setTimeout(randomGlitch, 4000 + Math.random() * 7000);
  }

  /* ================= FILM GRAIN ================= */
  (function grain() {
    var el = $('grain');
    try {
      var c = document.createElement('canvas'); c.width = c.height = 160;
      var ctx = c.getContext('2d'), d = ctx.createImageData(160, 160);
      for (var i = 0; i < d.data.length; i += 4) {
        var v = Math.random() * 255 | 0;
        d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255;
      }
      ctx.putImageData(d, 0, 0);
      el.style.backgroundImage = 'url(' + c.toDataURL() + ')';
      setInterval(function () {
        el.style.backgroundPosition = (Math.random() * 160 | 0) + 'px ' + (Math.random() * 160 | 0) + 'px';
      }, 70);
    } catch (e) { el.style.display = 'none'; }
  })();

  /* ================= CLOCK ================= */
  function tickClock() {
    var d = new Date();
    $('clock').innerHTML = pad(d.getHours(), 2) + ':' + pad(d.getMinutes(), 2) + ':' + pad(d.getSeconds(), 2);
  }

  /* ================= TERMINAL ================= */
  var term = $('terminal'), MAX_LINES = 6, queue = [], typing = false;
  function stamp() { var d = new Date(); return '[' + pad(d.getHours(), 2) + ':' + pad(d.getMinutes(), 2) + ':' + pad(d.getSeconds(), 2) + ']'; }

  function log(text, cls) { queue.push([cls || '', text]); if (!typing) typeNext(); }

  function typeNext() {
    if (!queue.length) { typing = false; return; }
    typing = true;
    var item = queue.shift(), line = document.createElement('div');
    line.className = 'ln ' + item[0];
    line.innerHTML = '<span class="t">' + stamp() + '</span><span class="x"></span><span class="cursor"></span>';
    term.appendChild(line);
    while (term.childNodes.length > MAX_LINES) term.removeChild(term.firstChild);

    var x = line.childNodes[1], cur = line.childNodes[2], txt = item[1], i = 0;
    var step = queue.length > 3 ? 4 : 1;          // speed up if we're falling behind
    (function type() {
      i += step;
      x.innerHTML = esc(txt.substr(0, i));
      if (i < txt.length) setTimeout(type, 14);
      else { line.removeChild(cur); setTimeout(typeNext, 120); }
    })();
  }

  /* ================= TIPS ================= */
  var tipIdx = Math.floor(Math.random() * TIPS.length);
  function nextTip() {
    var t = $('tip');
    addClass(t, 'hide');
    setTimeout(function () {
      tipIdx = (tipIdx + 1) % TIPS.length;
      $('tipText').innerHTML = esc(TIPS[tipIdx]);
      delClass(t, 'hide');
    }, 500);
  }

  /* ================= PROGRESS ================= */
  // GMod gives file counts only when there are files to download, so we blend
  // the real download ratio with a status-based stage and a slow creep.
  var STAGES = [
    [/retrieving server info|получение/i, 8],
    [/workshop|мастерск/i, 15],
    [/downloading|загрузка файл/i, 20],
    [/sending client info|отправка/i, 70],
    [/client info sent/i, 75],
    [/received.*string|строк/i, 78],
    [/lua|скрипт/i, 85],
    [/mounting|монтир/i, 88],
    [/starting|запуск/i, 92],
    [/precach|кэш/i, 95]
  ];
  var target = 2, shown = 0, filesTotal = 0, filesNeeded = 0, stageFloor = 0;

  function setTarget(v) { if (v > target) target = clamp(v, 0, 99); }

  function recalcFiles() {
    if (filesTotal > 0) {
      var r = (filesTotal - filesNeeded) / filesTotal;
      setTarget(20 + r * 50);                      // downloads map to 20..70%
    }
  }

  function tickProgress() {
    if (target < Math.min(97, stageFloor + 14)) target += .012;  // gentle creep (~0.25%/s) so it never looks frozen
    shown += (target - shown) * .08;
    var n = Math.floor(shown);
    $('pct').innerHTML = pad(n, 3);
    $('fill').style.width = shown.toFixed(2) + '%';
  }

  /* ================= GMOD CALLBACKS ================= */
  var gotDetails = false;

  window.GameDetails = function (servername, serverurl, mapname, maxplayers, steamid, gamemode, volume, language) {
    gotDetails = true;
    if (servername) $('servername').innerHTML = esc(servername);
    $('map').innerHTML = esc(mapname || '—');
    $('gamemode').innerHTML = esc(gamemode || '—');
    $('maxplayers').innerHTML = esc(maxplayers || '—');
    log('Сектор назначения: ' + (mapname || '???'), 'ok');
    if (steamid) log('Идентификатор сотрудника: ' + steamid);
    setMusicVolume(volume);
  };

  window.SetStatusChanged = function (status) {
    if (!status) return;
    $('status').innerHTML = esc(status);
    log(status);
    for (var i = 0; i < STAGES.length; i++) {
      if (STAGES[i][0].test(status)) { stageFloor = Math.max(stageFloor, STAGES[i][1]); setTarget(stageFloor); break; }
    }
  };

  window.SetFilesTotal = function (total) { filesTotal = +total || 0; recalcFiles(); };

  window.SetFilesNeeded = function (needed) { filesNeeded = +needed || 0; recalcFiles(); };

  var lastFileLog = 0;
  window.DownloadingFile = function (fileName) {
    fileName = String(fileName || '').replace(/\?.*$/, '');
    $('file').innerHTML = esc(fileName);
    var now = +new Date();
    if (now - lastFileLog > 600) { lastFileLog = now; log('> ' +fileName.split('/').pop()); }
    if (filesNeeded > 0) { filesNeeded--; recalcFiles(); }
  };

  /* ================= MUSIC (optional) =================
     Put an mp3/ogg at audio/theme.ogg and uncomment the line below.
     Volume follows the player's in-game music volume (GameDetails). */
  var music = null;
  // music = (function () { var a = new Audio('audio/theme.ogg'); a.loop = true; a.volume = .35; try { a.play(); } catch (e) {} return a; })();
  function setMusicVolume(v) { if (music && v !== undefined) music.volume = clamp(+v, 0, 1) * .6; }

  /* ================= BOOT ================= */
  $('tipText').innerHTML = esc(TIPS[tipIdx]);
  for (var b = 0; b < BOOT.length; b++) log(BOOT[b][1], BOOT[b][0]);

  nextSlide();
  setInterval(nextSlide, SLIDE_TIME);
  setInterval(nextTip, 6500);
  setInterval(tickClock, 1000); tickClock();
  setInterval(tickProgress, 50);
  setTimeout(randomGlitch, 3000);

  /* ===== preview mode: opened in a normal browser, simulate GMod ===== */
  setTimeout(function () {
    if (gotDetails) return;
    window.GameDetails('Z-BREACH | SCP:CB RP', '', 'site19_breach', 32, 'STEAM_0:1:000000', 'zbreach', .5, 'ru');
    var fake = ['Retrieving server info...', 'Mounting Addons', 'Workshop Complete', 'Sending client info...',
                'Client info sent!', 'Received all Lua files', 'Starting Lua...'];
    var files = ['models/scp/173.mdl', 'materials/zbreach/hud/card5.vmt', 'sound/zbreach/alarm.ogg',
                 'maps/site19_breach.bsp', 'materials/models/mtf/body.vtf', 'models/weapons/w_mp7.mdl'];
    window.SetFilesTotal(files.length); window.SetFilesNeeded(files.length);
    var i = 0;
    var t = setInterval(function () {
      if (i < fake.length) window.SetStatusChanged(fake[i]);
      if (i < files.length) window.DownloadingFile(files[i]);
      i++;
      if (i > Math.max(fake.length, files.length)) clearInterval(t);
    }, 2200);
  }, 1500);
})();
