/* Shared by every page: the mobile menu, and the small turning hoist on inner pages. */
(function(){
  "use strict";
  var b = document.querySelector(".menu-btn"), n = document.querySelector("nav.main");
  if (b && n) b.addEventListener("click", function(){
    var o = n.classList.toggle("open"); b.setAttribute("aria-expanded", o ? "true" : "false");
  });
  if (!window.Hoist3D) return;
  [].slice.call(document.querySelectorAll(".mini")).forEach(function(el){
    window.Hoist3D.mount(el, { mode:"mini", pose: parseFloat(el.getAttribute("data-pose")) || 1.9 });
  });
})();
