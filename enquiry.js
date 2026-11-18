/*
 * DEMO ONLY. This form sends nothing and stores nothing.
 * There is no network call: no fetch, no endpoint, no cookies, no localStorage.
 * On submit it plays an on-screen mock of what the real system does:
 * the instant text back, the ping to the right Matt, and the CRM log.
 */
(function(){
  var SALES = {"buy a hoist":1,"workshop equipment":1,"other":1};
  var NEED_WORDS = {
    "buy a hoist":"a hoist", "install":"an install", "service + certification":"a service and certification",
    "repair":"a repair", "workshop equipment":"workshop equipment", "other":"your enquiry"
  };
  function esc(s){ return String(s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];}); }
  function cleanMobile(v){
    var d = (v||"").replace(/[^\d+]/g,"");
    if (d.indexOf("+61") === 0) d = "0" + d.slice(3);
    if (d.indexOf("61") === 0 && d.length === 11) d = "0" + d.slice(2);
    return d;
  }
  document.querySelectorAll("form.enq").forEach(function(form){
    var btn = form.querySelector("button[type=submit]");
    var msg = form.querySelector(".msg");
    var stage = document.createElement("div");
    stage.className = "demo-stage";
    stage.setAttribute("aria-live","polite");
    form.parentNode.insertBefore(stage, form.nextSibling);

    form.addEventListener("submit", function(e){
      e.preventDefault();
      msg.className = "msg"; msg.textContent = "";
      var f = new FormData(form);
      var name = (f.get("name")||"").toString().trim();
      var first = name.split(/\s+/)[0] || "mate";
      var mobile = cleanMobile(f.get("mobile"));
      if (!/^04\d{8}$/.test(mobile)) {
        msg.className = "msg err"; msg.textContent = "That mobile doesn't look right. Try 04xx xxx xxx.";
        return;
      }
      var need = (f.get("need")||"other").toString();
      var suburb = (f.get("suburb")||"").toString().trim() || "suburb not given";
      var sterling = !!SALES[need];
      var sender = sterling ? "Sterling Automotive Equipment" : "Titan Automotive Equipment";
      var matt = sterling ? "Matt (Sterling)" : "Chu (Titan)";

      btn.disabled = true; var label = btn.textContent; btn.textContent = "Sending...";
      stage.innerHTML = "";

      setTimeout(function(){
        msg.className = "msg ok";
        msg.textContent = "Thanks " + first + ", check your phone, we've just texted you.";
        stage.innerHTML =
          '<div class="phone"><div class="phone-bar">' + esc(sender) + '</div>' +
          '<div class="sms"><p>hey ' + esc(first.toLowerCase()) + ', thanks for reaching out about ' + esc(NEED_WORDS[need]||"your enquiry") +
          '. we\'ll give you a buzz shortly, or reply here with a good time</p><span>now</span></div></div>';
        requestAnimationFrame(function(){ stage.querySelector(".phone").classList.add("in"); });

        setTimeout(function(){
          var ping = document.createElement("div");
          ping.className = "demo-card";
          ping.innerHTML = '<b>Ping to ' + esc(matt) + '</b><p>new lead, ' + esc(need) + ', ' + esc(suburb) + ', wants a call</p>';
          stage.appendChild(ping);
          requestAnimationFrame(function(){ ping.classList.add("in"); });

          setTimeout(function(){
            var crm = document.createElement("div");
            crm.className = "demo-card";
            crm.innerHTML = '<b>Logged in the CRM</b><p>reply time 4 seconds. <a href="./app/">Open the CRM</a></p>';
            stage.appendChild(crm);
            requestAnimationFrame(function(){ crm.classList.add("in"); });
            btn.disabled = false; btn.textContent = label;
            form.reset();
          }, 1000);
        }, 1000);
      }, 1500);
    });
  });
})();
