/* Home page scroll story: maps scroll to t (0..5) and hands it to the hoist, the display words and the rail.
 *
 * Layout: the giant stage word lives in a "band" of open space (desktop: above the hoist, right of the
 * copy panel; phone: between the header and the hoist). The hoist is framed into its own target box
 * below that band, so at rest the two never overlap. The word only crosses the hoist while sliding in
 * (start of a chapter) and out (end of a chapter), driven by that chapter's 0..1 scroll progress.
 */
(function(){
  "use strict";
  var stage = document.querySelector(".stage");
  if (!stage || !window.Hoist3D) return;
  var chapters = [].slice.call(document.querySelectorAll(".chapter"));
  var keys = chapters.map(function(c){ return c.getAttribute("data-h"); });
  var backWords = {}, frontWords = {};
  [].slice.call(document.querySelectorAll(".words.back .word")).forEach(function(el){ backWords[el.getAttribute("data-k")] = el; });
  [].slice.call(document.querySelectorAll(".words.front .word")).forEach(function(el){ frontWords[el.getAttribute("data-k")] = el; });
  var rail = [].slice.call(document.querySelectorAll(".rail div"));
  var labels = {};
  [].slice.call(document.querySelectorAll(".tag3d")).forEach(function(el){ labels[el.getAttribute("data-k")] = el; });
  var header = document.querySelector("header.top");

  var ctrl = window.Hoist3D.mount(stage.querySelector(".gl"), { mode:"story", labels:labels });
  var reduced = window.Hoist3D.reduced;
  var tops = [], heights = [], vh = 1, W = 1, H = 1;
  var band = null, hoistMidY = 0, phone = false;

  var IN = .2, OUT = .8;            // a chapter's word slides in over 0..IN and out over OUT..1
  function clamp(x){ return x < 0 ? 0 : x > 1 ? 1 : x; }
  function ease(x){ return x < .5 ? 4*x*x*x : 1 - Math.pow(-2*x+2,3)/2; }

  function copyOf(key){ var c = chapters[keys.indexOf(key)]; return c ? c.querySelector(".copy") : null; }

  function layout(){
    W = stage.clientWidth; H = stage.clientHeight;
    phone = W <= 860;
    var topH = header ? header.getBoundingClientRect().height : 70;
    var intro = copyOf("intro"), sell = copyOf("sell");
    var boxes = [];                      // one hoist box per chapter: intro, sell, install, service, call
    if (!phone){
      var cr = sell.getBoundingClientRect(), gut = cr.left;
      var ir = intro.getBoundingClientRect();
      band = { x0: cr.right + 36, x1: W - gut, y0: topH + 28, y1: topH + 28 + Math.round(H*.23) };
      var sb = { x0: cr.right + 28, x1: W - gut*.6, y0: band.y1 + 58, y1: H - H*.03 };
      boxes = [{ x0: ir.right + 12, x1: W - gut*.6, y0: topH + 30, y1: H - H*.03 }, sb, sb, sb, sb];
    } else {
      var bottomGap = 92;                         // the Ring us bar plus the card's own gap
      var bh = Math.round(Math.max(60, Math.min(H*.12, 100)));
      band = { x0: 16, x1: W - 16, y0: topH + 12, y1: topH + 12 + bh };
      boxes = [{ x0: 8, x1: W - 8, y0: topH + 14 + intro.offsetHeight + 14, y1: H - bottomGap - 12 }];
      ["sell","install","service","call"].forEach(function(k){
        var c = copyOf(k), cardTop = H - bottomGap - (c ? c.offsetHeight : 260);
        boxes.push({ x0: 8, x1: W - 8, y0: band.y1 + 34, y1: cardTop - 8 });
      });
    }
    var mid = boxes[3];
    hoistMidY = (mid.y0 + mid.y1) / 2;
    if (ctrl.setLayout) ctrl.setLayout({ boxes: boxes });
    fitWords();
  }

  // size every word to its band: as large as fits the band's width and height
  function fitWords(){
    var bw = band.x1 - band.x0, bh = band.y1 - band.y0;
    Object.keys(backWords).forEach(function(k){
      [backWords[k], frontWords[k]].forEach(function(el){
        if (!el) return;
        el.style.left = band.x0 + "px"; el.style.top = band.y0 + "px";
        el.style.width = bw + "px"; el.style.height = bh + "px";
        el.style.fontSize = "100px";
      });
      var probe = backWords[k];
      probe.style.width = "auto";
      var tw = probe.getBoundingClientRect().width || 1;   // text width at 100px
      probe.style.width = bw + "px";
      var size = Math.min(bw / (tw/100), bh / .74); // Righteous caps sit inside ~.74em
      size = Math.floor(size);
      [backWords[k], frontWords[k]].forEach(function(el){ if (el) el.style.fontSize = size + "px"; });
    });
  }

  function measure(){
    vh = window.innerHeight;
    var y = window.scrollY || window.pageYOffset;
    chapters.forEach(function(c,i){ var r = c.getBoundingClientRect(); tops[i] = r.top + y; heights[i] = r.height; });
    layout();
  }

  function placeWord(k, local, show){
    var b = backWords[k], f = frontWords[k];
    if (!b) return;
    if (!show){ b.style.opacity = 0; if (f) f.style.opacity = 0; return; }
    var x = 0, y = 0, outline = 0, op = 1;
    var dyHoist = hoistMidY - (band.y0 + band.y1)/2;   // drop to hoist height while crossing it
    if (!reduced){
      if (local < IN){
        var e = ease(local / IN);
        x = (W - band.x0) * (1 - e) + 40*(1-e);
        y = dyHoist * (1 - e);
        outline = 1 - e;
      } else if (local > OUT){
        var e2 = ease((local - OUT) / (1 - OUT));
        x = -(band.x1 - band.x0) * .95 * e2;      // slides left across the hoist...
        y = dyHoist * e2;
        outline = e2;
        op = 1 - Math.max(0, (e2 - .6) / .4);     // ...and fades as it clears it
      }
    }
    var tf = "translate3d(" + x.toFixed(1) + "px," + y.toFixed(1) + "px,0)";
    b.style.transform = tf; b.style.opacity = op.toFixed(3);
    if (f){ f.style.transform = tf; f.style.opacity = (outline * op).toFixed(3); }
  }

  function update(){
    var y = window.scrollY || window.pageYOffset, t = 0, active = 0;
    for (var i=0;i<chapters.length;i++){
      var span = Math.max(1, heights[i] - vh);
      var local = Math.min(1, Math.max(0, (y - tops[i]) / span));
      if (y >= tops[i] - vh*.45) active = i;
      if (y >= tops[i]) t = i + local;
    }
    chapters.forEach(function(c,i){ c.classList.toggle("on", i === active); });
    keys.forEach(function(k, i){
      if (!backWords[k]) return;
      if (reduced){ placeWord(k, .5, i === active); return; }
      var l = t - i;
      placeWord(k, clamp(l), l >= 0 && l <= 1 && Math.floor(Math.min(t, chapters.length - .001)) === i);
    });
    rail.forEach(function(r,i){
      var k = i + 1, f = Math.min(1, Math.max(0, t - k));
      r.style.setProperty("--fill", (f*100).toFixed(0) + "%");
      r.classList.toggle("on", active === k);
    });
    ctrl.setT(reduced ? 1.9 : t);
  }
  var ticking = false;
  function onScroll(){ if (!ticking){ ticking = true; requestAnimationFrame(function(){ ticking = false; update(); }); } }
  measure(); update();
  window.addEventListener("scroll", onScroll, {passive:true});
  window.addEventListener("resize", function(){ measure(); update(); });
  window.addEventListener("load", function(){ measure(); update(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function(){ measure(); update(); });
})();
