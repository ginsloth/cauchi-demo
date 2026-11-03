/* Hoists Hub demo. Every name and number below is made up. */
(function () {
  "use strict";

  var COLORS = { titan: "#2a78d6", sterling: "#eb6834" };
  var BIZ = { titan: "Titan", sterling: "Sterling" };

  var DATA = {
    month: "November 2026 (demo month)",
    revenue: { titan: 24400, sterling: 62100 },
    between: 9000,          // Sterling hoists sold to Titan, counted once at the end customer
    preSigning: 3500,       // hoists booked before signing, never counted
    newFromSystems: 31500,  // demo: revenue from jobs that came in through the systems
    tiles: [
      { label: "Enquiries", value: "46", sub: "both businesses" },
      { label: "First reply", value: "8 sec", sub: "average, every enquiry" },
      { label: "Jobs booked", value: "19", sub: "11 Titan, 8 Sterling" },
      { label: "Jobs done + invoiced", value: "14", sub: "9 Titan, 5 Sterling" }
    ],
    sources: [
      { name: "Website", n: 14 },
      { name: "Text reactivation", n: 12 },
      { name: "Referral", n: 8 },
      { name: "Google", n: 7 },
      { name: "Facebook", n: 5 }
    ],
    leads: [
      { id: 1, name: "Demo Workshop 1", biz: "titan", what: "12-month service, 3 hoists", source: "Text reactivation", status: "booked", reply: "6 sec", suburb: "Penrith", phone: "0491 570 101", msg: "yeah all 3 are due, can you come next week", when: "Mon 2 Nov, 7:42am", value: 825 },
      { id: 2, name: "Sample Motors", biz: "sterling", what: "2-post hoist + install", source: "Website", status: "won", reply: "4 sec", suburb: "Albury", phone: "0491 570 102", msg: "need a 4 tonne 2 post delivered and installed before xmas", when: "Mon 2 Nov, 9:10am", value: 5500 },
      { id: 3, name: "Example Auto Repairs", biz: "titan", what: "Cables frayed, quote", source: "Google", status: "replied", reply: "9 sec", suburb: "Blacktown", phone: "0491 570 103", msg: "cables look rough on one hoist, how much to replace", when: "Tue 3 Nov, 11:05am", value: 0 },
      { id: 4, name: "Test Diesel Co", biz: "sterling", what: "4-post for a car yard", source: "Referral", status: "booked", reply: "7 sec", suburb: "Campbellfield VIC", phone: "0491 570 104", msg: "mate said you sell 4 posters, after one for the yard", when: "Tue 3 Nov, 2:30pm", value: 7900 },
      { id: 5, name: "Placeholder Panels", biz: "titan", what: "Install, new workshop (4 hoists)", source: "Website", status: "new", reply: "5 sec", suburb: "Smithfield", phone: "0491 570 105", msg: "moving into a new unit, need 4 hoists put in", when: "Wed 4 Nov, 8:15am", value: 0, multi: true },
      { id: 6, name: "Demo Garage 2", biz: "sterling", what: "Tyre changer + balancer", source: "Facebook", status: "replied", reply: "11 sec", suburb: "Geelong VIC", phone: "0491 570 106", msg: "saw your post, price on the tyre changer combo?", when: "Wed 4 Nov, 6:48pm", value: 0 },
      { id: 7, name: "Sample Street Rods", biz: "titan", what: "Service, home garage", source: "Text reactivation", status: "won", reply: "6 sec", suburb: "Castle Hill", phone: "0491 570 107", msg: "yep running fine but probably due, book me in", when: "Thu 5 Nov, 10:02am", value: 275 },
      { id: 8, name: "Example Fleet Services", biz: "sterling", what: "3 hoists, fleet depot", source: "Google", status: "booked", reply: "8 sec", suburb: "Tullamarine VIC", phone: "0491 570 108", msg: "fitting out a fleet depot, need 3 hoists quoted", when: "Thu 5 Nov, 1:20pm", value: 14200, multi: true },
      { id: 9, name: "Demo Mechanical 3", biz: "titan", what: "Referral, mate needs a hoist", source: "Referral", status: "booked", reply: "7 sec", suburb: "St Marys", phone: "0491 570 109", msg: "my mate down the road needs his hoist looked at", when: "Fri 6 Nov, 9:35am", value: 0 },
      { id: 10, name: "Test Performance", biz: "sterling", what: "Hoist, wants cheaper freight", source: "Website", status: "lost", reply: "5 sec", suburb: "Wagga Wagga", phone: "0491 570 110", msg: "can you beat this freight price", when: "Fri 6 Nov, 3:12pm", value: 0 },
      { id: 11, name: "Placeholder Prestige", biz: "titan", what: "Hydraulic leak", source: "Text reactivation", status: "won", reply: "6 sec", suburb: "Penrith", phone: "0491 570 111", msg: "ram is leaking a bit, can you fix", when: "Mon 9 Nov, 7:58am", value: 640 },
      { id: 12, name: "Sample 4x4", biz: "sterling", what: "Aerosol 6-pack reorder", source: "Text reactivation", status: "won", reply: "4 sec", suburb: "Ballarat VIC", phone: "0491 570 112", msg: "the brake cleaner was good, send another 2 boxes", when: "Mon 9 Nov, 12:40pm", value: 380 }
    ],
    jobs: [
      { day: "Tue 10 Nov", area: "Penrith + St Marys", items: [
        { title: "Demo Workshop 1", sub: "Service, 3 hoists", value: 825, multi: false },
        { title: "Demo Mechanical 3", sub: "Service + cable check", value: 550 },
        { title: "Placeholder Prestige", sub: "Hydraulic repair", value: 640 }
      ] },
      { day: "Thu 12 Nov", area: "Smithfield", items: [
        { title: "Placeholder Panels", sub: "Install, 4 hoists, new unit", value: 4000, multi: true }
      ] },
      { day: "Fri 13 Nov", area: "Castle Hill + Baulkham Hills", items: [
        { title: "Sample Street Rods", sub: "Service, home garage", value: 275 },
        { title: "Example Smash Repairs", sub: "Service, 5 hoists", value: 1375, multi: true }
      ] }
    ],
    melb: {
      tiles: [
        { label: "VIC enquiries", value: "11", sub: "this month" },
        { label: "Hoists reserved", value: "4", sub: "for the depot stock" },
        { label: "VIC sales", value: "$27,600", sub: "ex GST" },
        { label: "Install trip", value: "2 weeks", sub: "pencilled for Feb" }
      ],
      depotCost: 8500,
      depotMargin: 11200,
      pipe: [
        { name: "Example Fleet Services", sub: "Tullamarine, 3 hoists", value: 14200, stage: "Quote sent" },
        { name: "Test Diesel Co", sub: "Campbellfield, 4-post", value: 7900, stage: "Booked" },
        { name: "Demo Garage 2", sub: "Geelong, tyre changer combo", value: 3100, stage: "Replied" },
        { name: "Sample 4x4", sub: "Ballarat, aerosol reorder", value: 380, stage: "Won" }
      ]
    },
    queueTop: [
      { title: "New family website", sub: "Hoists, installs, servicing, Melbourne page", state: "In build" },
      { title: "Google profile for Melbourne", sub: "So VIC buyers find a local", state: "Next" },
      { title: "Aerosol 6-pack follow-up", sub: "Free pack after every install, then reorder texts", state: "Next" }
    ],
    queueNext: [
      { title: "Brand guide", sub: "Logo, colours, van and shirt files", state: "Queued" },
      { title: "Online store for aerosols", sub: "Phase 2", state: "Queued" },
      { title: "Forklift launch page", sub: "Phase 2", state: "Queued" },
      { title: "Cards posted to workshops", sub: "Handwritten-style, with a sample can", state: "Queued" }
    ],
    calendar: [
      { d: "Mon 9", posts: [{ b: "titan", t: "Install" }] },
      { d: "Tue 10", posts: [{ b: "sterling", t: "Stock in" }] },
      { d: "Wed 11", posts: [] },
      { d: "Thu 12", posts: [{ b: "titan", t: "Fit-out" }, { b: "sterling", t: "Tip" }] },
      { d: "Fri 13", posts: [{ b: "sterling", t: "VIC" }] },
      { d: "Sat 14", posts: [{ b: "titan", t: "Reel" }] },
      { d: "Sun 15", posts: [] }
    ]
  };

  var STATUS_LABEL = { "new": "New", replied: "Replied", booked: "Booked", won: "Won", lost: "Lost" };

  function $(id) { return document.getElementById(id); }
  function money(n) { return "$" + Math.round(n).toLocaleString("en-AU"); }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[c]; }); }

  /* tooltip */
  var tip = $("tooltip");
  function showTip(text, x, y) { tip.textContent = text; tip.hidden = false; tip.style.left = Math.min(x + 12, window.innerWidth - 230) + "px"; tip.style.top = (y + 12) + "px"; }
  function hideTip() { tip.hidden = true; }
  function bindTip(node, text) {
    node.addEventListener("mousemove", function (e) { showTip(text, e.clientX, e.clientY); });
    node.addEventListener("mouseleave", hideTip);
    node.addEventListener("focus", function () { var r = node.getBoundingClientRect(); showTip(text, r.left, r.bottom - 6); });
    node.addEventListener("blur", hideTip);
  }

  /* HOME */
  function renderHome() {
    $("month-line").textContent = DATA.month;
    var r = DATA.revenue, total = r.titan + r.sterling;
    $("rev-combined").textContent = money(total);
    var split = $("rev-split");
    split.setAttribute("aria-label", "Titan " + money(r.titan) + ", Sterling " + money(r.sterling));
    ["titan", "sterling"].forEach(function (k) {
      var seg = el("div", "split-seg");
      seg.style.flex = String(r[k]);
      seg.style.background = COLORS[k];
      seg.tabIndex = 0;
      bindTip(seg, BIZ[k] + ": " + money(r[k]) + " (" + Math.round(r[k] / total * 100) + "%)");
      split.appendChild(seg);
    });
    var lg = $("rev-legend");
    ["titan", "sterling"].forEach(function (k) {
      lg.appendChild(el("span", "legend-item", '<span class="legend-swatch" style="background:' + COLORS[k] + '"></span>' + BIZ[k] + ' <span class="legend-value">' + money(r[k]) + "</span>"));
    });

    var tiles = $("tiles");
    DATA.tiles.forEach(function (t) {
      tiles.appendChild(el("div", "tile", '<div class="tile-label">' + t.label + '</div><div class="tile-value">' + t.value + '</div><div class="tile-sub">' + t.sub + "</div>"));
    });

    var max = Math.max.apply(null, DATA.sources.map(function (s) { return s.n; }));
    var chart = $("source-chart"), table = $("source-table");
    table.innerHTML = "<tr><th>Source</th><th>Enquiries</th></tr>";
    DATA.sources.forEach(function (s) {
      var row = el("div", "bar-row");
      row.tabIndex = 0;
      row.innerHTML = '<span class="bar-label">' + s.name + '</span><span class="bar-track"><span class="bar-fill" style="display:block;width:' + (s.n / max * 100) + '%"></span></span><span class="bar-value">' + s.n + "</span>";
      bindTip(row, s.name + ": " + s.n + " enquiries");
      chart.appendChild(row);
      table.appendChild(el("tr", "", "<td>" + s.name + "</td><td>" + s.n + "</td>"));
    });

    renderDeal();
    $("sales-toggle").addEventListener("change", renderDeal);
  }

  function renderDeal() {
    var withSales = $("sales-toggle").checked;
    var rate = withSales ? 0.30 : 0.20;
    var pct = withSales ? "30%" : "20%";
    var r = DATA.revenue, total = r.titan + r.sterling;
    var counted = total - DATA.between - DATA.preSigning;
    var share = counted * rate, gst = share * 0.10, invoice = share + gst;
    $("deal-table").innerHTML =
      '<tr class="total"><td>New work the systems brought in</td><td>' + money(DATA.newFromSystems) + "</td></tr>" +
      "<tr><td>Old customers brought back by text</td><td>12 jobs</td></tr>" +
      "<tr><td>Website + Google enquiries answered in seconds</td><td>21</td></tr>" +
      "<tr><td>Referrals from happy customers</td><td>8</td></tr>" +
      '<tr class="minus"><td>Anything you had booked before signing</td><td>yours, not counted</td></tr>' +
      '<tr class="minus"><td>Hoists Sterling sells to Titan</td><td>counted once</td></tr>';
    var job = 5500, ex = job / 1.1, cut = ex * rate, inv = cut * 1.1;
    var steps = [money(job) + " job", money(ex) + " ex GST", pct + " " + money(cut), "invoice " + money(inv)];
    var ol = $("gst-steps");
    ol.innerHTML = "";
    steps.forEach(function (s, i) {
      if (i) ol.appendChild(el("li", "arrow", "&rarr;"));
      ol.appendChild(el("li", "", s));
    });
  }

  /* LEADS */
  var leadFilter = "all";
  function renderLeadFilters() {
    var row = $("lead-filters");
    row.innerHTML = "";
    [["all", "All"], ["titan", "Titan"], ["sterling", "Sterling"], ["new", "New only"]].forEach(function (f) {
      var b = el("button", "chip" + (leadFilter === f[0] ? " is-on" : ""), f[1]);
      b.type = "button";
      b.setAttribute("role", "tab");
      b.setAttribute("aria-selected", leadFilter === f[0] ? "true" : "false");
      b.addEventListener("click", function () { leadFilter = f[0]; renderLeadFilters(); renderLeads(); });
      row.appendChild(b);
    });
  }
  function renderLeads() {
    var list = $("lead-list");
    list.innerHTML = "";
    DATA.leads.slice().reverse().forEach(function (l) {
      if (leadFilter === "titan" || leadFilter === "sterling") { if (l.biz !== leadFilter) return; }
      if (leadFilter === "new" && l.status !== "new") return;
      var li = el("li");
      var b = el("button", "lead");
      b.type = "button";
      b.innerHTML = '<span class="lead-name">' + esc(l.name) + (l.multi ? '<span class="flag">4+ hoists</span>' : "") + "</span>" +
        '<span class="status st-' + l.status + '">' + STATUS_LABEL[l.status] + "</span>" +
        '<span class="lead-what">' + esc(l.what) + "</span>" +
        '<span class="lead-meta"><span><span class="biz-dot" style="background:' + COLORS[l.biz] + '"></span>' + BIZ[l.biz] + "</span><span>" + esc(l.source) + "</span><span>Replied in " + l.reply + "</span><span>" + esc(l.suburb) + "</span></span>";
      b.addEventListener("click", function () { openLead(l); });
      li.appendChild(b);
      list.appendChild(li);
    });
    var newCount = DATA.leads.filter(function (l) { return l.status === "new"; }).length;
    var badge = $("lead-badge");
    badge.textContent = newCount;
    badge.classList.toggle("is-on", newCount > 0);
  }

  function openLead(l) {
    var order = ["new", "replied", "booked", "won"];
    var reached = l.status === "lost" ? 1 : order.indexOf(l.status);
    var steps = [
      { t: "Enquiry in", s: l.when + ", via " + l.source },
      { t: "Instant text sent", s: "Replied in " + l.reply + ", automatically" },
      { t: "Booked", s: l.status === "lost" ? "Not booked: went elsewhere on price" : "Into the calendar, " + BIZ[l.biz] },
      { t: "Done + invoiced", s: l.value ? money(l.value) + " inc GST" : "Waiting on the job" }
    ];
    var html = '<div class="tile-label">' + BIZ[l.biz] + " lead</div><h3 id=\"sheet-title\">" + esc(l.name) + "</h3>" +
      '<span class="status st-' + l.status + '">' + STATUS_LABEL[l.status] + "</span>" +
      '<dl class="kv"><dt>Wants</dt><dd>' + esc(l.what) + "</dd><dt>Suburb</dt><dd>" + esc(l.suburb) + "</dd><dt>Mobile</dt><dd>" + l.phone + "</dd><dt>Came from</dt><dd>" + esc(l.source) + "</dd></dl>" +
      '<div class="tile-label">What they said</div><p class="quote">"' + esc(l.msg) + '"</p>' +
      '<h3 style="font-size:15px;margin:18px 0 10px">Timeline</h3><ol class="timeline">';
    steps.forEach(function (s, i) {
      var done = i <= reached && !(l.status === "lost" && i > 1);
      html += '<li class="' + (done ? "done" : "todo") + '">' + s.t + '<span class="t-time">' + esc(s.s) + "</span></li>";
    });
    html += "</ol>";
    $("sheet-body").innerHTML = html;
    $("sheet-backdrop").hidden = false;
    var sh = $("sheet");
    sh.setAttribute("aria-hidden", "false");
    requestAnimationFrame(function () { sh.classList.add("is-open"); });
    $("sheet-close").focus();
  }
  function closeLead() {
    var sh = $("sheet");
    sh.classList.remove("is-open");
    sh.setAttribute("aria-hidden", "true");
    $("sheet-backdrop").hidden = true;
  }

  /* JOBS */
  function renderJobs() {
    var all = [];
    DATA.jobs.forEach(function (d) { all = all.concat(d.items); });
    var total = all.reduce(function (a, j) { return a + j.value; }, 0);
    var multi = all.filter(function (j) { return j.multi; }).length;
    [["Days out", String(DATA.jobs.length)], ["Booked value", money(total)], ["4+ hoist sites", String(multi)]].forEach(function (t) {
      $("job-tiles").appendChild(el("div", "tile", '<div class="tile-label">' + t[0] + '</div><div class="tile-value">' + t[1] + "</div>"));
    });
    var wrap = $("job-days");
    DATA.jobs.forEach(function (d) {
      var sec = el("div", "day");
      sec.appendChild(el("div", "day-head", '<span class="day-name">' + d.day + '</span><span class="day-area">' + d.area + "</span>"));
      d.items.forEach(function (j) {
        sec.appendChild(el("div", "job", '<span class="job-title">' + esc(j.title) + (j.multi ? '<span class="flag">4+ hoists</span>' : "") + '</span><span class="job-value">' + money(j.value) + '</span><span class="job-sub">' + esc(j.sub) + "</span>"));
      });
      wrap.appendChild(sec);
    });
  }

  /* MELBOURNE */
  function renderMelb() {
    var m = DATA.melb;
    m.tiles.forEach(function (t) {
      $("melb-tiles").appendChild(el("div", "tile", '<div class="tile-label">' + t.label + '</div><div class="tile-value">' + t.value + '</div><div class="tile-sub">' + t.sub + "</div>"));
    });
    var max = Math.max(m.depotCost, m.depotMargin);
    var meter = $("depot-meter");
    [["Melbourne margin", m.depotMargin, COLORS.sterling], ["Depot cost / month", m.depotCost, "#6e767c"]].forEach(function (row) {
      var r = el("div", "meter-row");
      r.innerHTML = "<span>" + row[0] + '<br><span class="meter-val">' + money(row[1]) + '</span></span><span class="meter-track"><span class="meter-fill" style="display:block;width:' + (row[1] / max * 100) + "%;background:" + row[2] + '"></span></span>';
      r.tabIndex = 0;
      bindTip(r, row[0] + ": " + money(row[1]));
      meter.appendChild(r);
    });
    var cover = Math.round(m.depotMargin / m.depotCost * 100);
    $("depot-note").textContent = "Melbourne margin covers the depot " + cover + "% this month. Rent, power and the van, paid by VIC sales alone.";
    var pipe = $("melb-pipe");
    m.pipe.forEach(function (p) {
      pipe.appendChild(el("li", "", "<span><strong>" + esc(p.name) + '</strong><br><span class="pipe-sub">' + esc(p.sub) + '</span></span><span style="text-align:right"><strong>' + money(p.value) + '</strong><br><span class="pipe-sub">' + p.stage + "</span></span>"));
    });
  }

  /* MARKETING */
  function renderMkt() {
    DATA.queueTop.forEach(function (q) {
      $("queue-top").appendChild(el("li", "", '<span class="q-title">' + q.title + '</span><span class="q-state">' + q.state + '</span><span class="q-sub">' + q.sub + "</span>"));
    });
    DATA.queueNext.forEach(function (q) {
      $("queue-next").appendChild(el("li", "", '<span class="q-title">' + q.title + '</span><span class="q-state">' + q.state + '</span><span class="q-sub">' + q.sub + "</span>"));
    });
    var cal = $("cal-strip");
    DATA.calendar.forEach(function (c) {
      var d = el("div", "cal-day", '<span class="cal-date">' + c.d + "</span>");
      c.posts.forEach(function (p) { d.appendChild(el("span", "cal-post " + p.b, p.t)); });
      cal.appendChild(d);
    });
  }

  /* NAV */
  function show(name) {
    document.querySelectorAll(".screen").forEach(function (s) { s.classList.toggle("is-active", s.id === "screen-" + name); });
    document.querySelectorAll(".tab").forEach(function (t) { t.classList.toggle("is-active", t.dataset.screen === name); });
    $("screen-title").textContent = $("screen-" + name).dataset.title;
    window.scrollTo(0, 0);
    hideTip();
    if (location.hash !== "#" + name) history.replaceState(null, "", "#" + name);
  }

  /* NOTIFICATION DEMO */
  var pings = [
    { biz: "titan", name: "Demo Smash Repairs", what: "hoist install", suburb: "Penrith", when: "wants this week", msg: "new unit, need 2 hoists in asap", source: "Website" },
    { biz: "sterling", name: "Sample Motorsport", what: "4-post hoist", suburb: "Dandenong VIC", when: "wants it before Christmas", msg: "after a 4 post for the shed, whats the price delivered", source: "Facebook" },
    { biz: "titan", name: "Example Auto Care", what: "12-month service, 2 hoists", suburb: "Blacktown", when: "any day next week", msg: "both hoists due, book us in", source: "Text reactivation" }
  ];
  var pingIdx = 0, toastTimer = null, nextId = 100;
  function simulate() {
    var p = pings[pingIdx % pings.length];
    pingIdx++;
    var t = $("toast");
    t.innerHTML = '<div class="toast-app"><span>Hoists Hub &middot; ' + BIZ[p.biz] + "</span><span>now</span></div>" +
      '<div class="toast-title">New lead: ' + p.what + ", " + p.suburb + "</div>" +
      '<div class="toast-body">' + p.name + ", " + p.when + '. "' + p.msg + '"</div>' +
      '<div class="toast-reply">Instant text sent in 3 sec. Tap Leads to see it.</div>';
    t.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove("is-on"); }, 6000);
    DATA.leads.push({ id: nextId++, name: p.name, biz: p.biz, what: p.what, source: p.source, status: "new", reply: "3 sec", suburb: p.suburb, phone: "0491 570 1" + (20 + pingIdx), msg: p.msg, when: "Just now", value: 0 });
    renderLeads();
    if (navigator.vibrate) navigator.vibrate([60, 40, 60]);
  }

  document.querySelectorAll(".tab").forEach(function (t) { t.addEventListener("click", function () { show(t.dataset.screen); }); });
  $("simulate").addEventListener("click", simulate);
  $("toast").addEventListener("click", function () { $("toast").classList.remove("is-on"); show("leads"); });
  $("sheet-close").addEventListener("click", closeLead);
  $("sheet-backdrop").addEventListener("click", closeLead);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeLead(); });

  renderHome();
  renderLeadFilters();
  renderLeads();
  renderJobs();
  renderMelb();
  renderMkt();
  var start = location.hash.replace("#", "");
  if (start && document.getElementById("screen-" + start)) show(start);
})();
