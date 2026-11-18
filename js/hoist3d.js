/*
 * Two-post car hoist in three.js (r128, classic global build so it runs from file://).
 * Modelled on Sterling's SE-400 clearfloor two-post (blue painted posts, overhead beam with a
 * safety shut-off bar, yellow 3-stage front / 2-stage rear arms, rubber pads, power unit on one
 * post), to the published proportions: 3602 mm high, 3390 mm wide, 2780 mm between columns.
 * 1 unit = 1 metre.
 *
 * Hoist3D.mount(container, {mode:"story"|"mini", pose:Number, labels:{}})
 *   story: caller drives it with ctrl.setT(t), t from 0 to 5 (intro, sell, install, service, call).
 *   mini:  a fixed pose that turns slowly while on screen.
 * Colours come from the CSS variables at the top of css/site.css.
 * No WebGL, or no three.js: the static SVG hoist from the first demo goes in instead.
 * The studio lighting (RoomEnvironment) and rounded edges (RoundedBoxGeometry) load from the
 * pinned three@0.128.0 examples; if they can't load, the hoist still renders with plain lights.
 */
(function(){
  "use strict";

  var REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var SMALL = Math.min(window.innerWidth, window.innerHeight) < 700;
  var EXTRAS = [
    "https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/environments/RoomEnvironment.js",
    "https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/geometries/RoundedBoxGeometry.js"
  ];

  var SVG_FALLBACK =
    '<svg viewBox="0 0 320 220" role="img" aria-label="Two-post car hoist" xmlns="http://www.w3.org/2000/svg">' +
    '<rect x="0" y="204" width="320" height="16" fill="#1b1d20"/>' +
    '<rect x="40" y="20" width="26" height="186" rx="3" fill="#C0C0C0"/><rect x="254" y="20" width="26" height="186" rx="3" fill="#C0C0C0"/>' +
    '<rect x="40" y="14" width="240" height="10" rx="3" fill="#666666"/>' +
    '<rect x="64" y="110" width="70" height="8" rx="3" fill="#f2b705"/><rect x="186" y="110" width="70" height="8" rx="3" fill="#f2b705"/>' +
    '<path d="M92 108 q10 -40 68 -40 q58 0 68 40 z" fill="#ffffff" opacity=".92"/>' +
    '<rect x="88" y="96" width="144" height="16" rx="6" fill="#ffffff"/>' +
    '<circle cx="112" cy="116" r="12" fill="#1b1d20"/><circle cx="208" cy="116" r="12" fill="#1b1d20"/>' +
    '<circle cx="112" cy="116" r="5" fill="#C0C0C0"/><circle cx="208" cy="116" r="5" fill="#C0C0C0"/>' +
    '<line x1="53" y1="30" x2="53" y2="200" stroke="#2a2e33" stroke-width="3"/><line x1="267" y1="30" x2="267" y2="200" stroke="#2a2e33" stroke-width="3"/>' +
    '</svg>';

  function webglOK(){
    try {
      var c = document.createElement("canvas");
      return !!(window.WebGLRenderingContext && (c.getContext("webgl") || c.getContext("experimental-webgl")));
    } catch (e) { return false; }
  }
  function cssVar(n, d){
    var v = getComputedStyle(document.documentElement).getPropertyValue(n).trim();
    return v || d;
  }
  function clamp(x,a,b){ return x < a ? a : x > b ? b : x; }
  function ss(a,b,x){ var t = clamp((x-a)/(b-a),0,1); return t*t*(3-2*t); }   // smoothstep
  function easeOut(t){ return 1 - Math.pow(1-t,3); }
  function lerp(a,b,t){ return a + (b-a)*t; }

  function fallback(container){
    var d = document.createElement("div");
    d.className = "fallback";
    d.innerHTML = SVG_FALLBACK;
    container.appendChild(d);
    container.classList.add("is-fallback");
    return { setT:function(){}, fallback:true };
  }

  // load the two optional three.js examples once, shared by every hoist on the page
  var extrasState = 0, extrasQueue = [];
  function withExtras(cb){
    if (extrasState === 2) return cb();
    extrasQueue.push(cb);
    if (extrasState === 1) return;
    extrasState = 1;
    var left = EXTRAS.length, done = false;
    function finish(){ if (done) return; done = true; extrasState = 2; extrasQueue.splice(0).forEach(function(f){ f(); }); }
    setTimeout(finish, 5000); // offline: carry on without them
    EXTRAS.forEach(function(src){
      var s = document.createElement("script");
      s.src = src; s.async = false;
      s.onload = s.onerror = function(){ if (--left === 0) finish(); };
      document.head.appendChild(s);
    });
  }

  /* ------------------------------------------------------------------ build */
  function build(THREE){
    var C = {
      paint: new THREE.Color(cssVar("--hoist-paint","#1f4fbf")),
      arm:   new THREE.Color(cssVar("--hoist-arm","#f2b705")),
      zinc:  new THREE.Color(cssVar("--hoist-zinc","#c4c8cd")),
      decal: new THREE.Color(cssVar("--hoist-decal","#f4f4f1")),
      hi:    new THREE.Color(cssVar("--hi","#f2b705")),
      car:   new THREE.Color(cssVar("--car-body","#2c2f33")),
      glass: new THREE.Color(cssVar("--car-glass","#121315"))
    };
    for (var ck in C) C[ck].convertSRGBToLinear();   // CSS hex is sRGB; the renderer works in linear

    var Phys = THREE.MeshPhysicalMaterial, Std = THREE.MeshStandardMaterial;
    var M = {
      paint:  new Phys({color:C.paint, metalness:.25, roughness:.38, clearcoat:.5, clearcoatRoughness:.25, envMapIntensity:.55}),
      arm:    new Phys({color:C.arm, metalness:.15, roughness:.42, clearcoat:.4, clearcoatRoughness:.25, envMapIntensity:.6}),
      zinc:   new Std({color:C.zinc, metalness:.9, roughness:.32}),
      chrome: new Std({color:new THREE.Color(0xe9ebee).convertSRGBToLinear(), metalness:1, roughness:.12}),
      dark:   new Std({color:new THREE.Color(0x2a2d31).convertSRGBToLinear(), metalness:.55, roughness:.45}),
      rubber: new Std({color:new THREE.Color(0x141516).convertSRGBToLinear(), metalness:0, roughness:.85}),
      decal:  new Std({color:C.decal, metalness:0, roughness:.5}),
      sticker:new Std({color:C.hi, metalness:0, roughness:.5}),
      tank:   new Phys({color:new THREE.Color(0xe7e4da).convertSRGBToLinear(), metalness:0, roughness:.3, clearcoat:.4}),
      car:    new Phys({color:C.car, metalness:.35, roughness:.42, clearcoat:.7, clearcoatRoughness:.12, envMapIntensity:.45}),
      glass:  new Phys({color:C.glass, metalness:.1, roughness:.12, clearcoat:.8, clearcoatRoughness:.05, envMapIntensity:.35}),
      head:   new Std({color:0xffffff, emissive:new THREE.Color(0xfff4dc), emissiveIntensity:.55, roughness:.2}),
      tail:   new Std({color:new THREE.Color(0x8e1512).convertSRGBToLinear(), emissive:new THREE.Color(0x5a0806), emissiveIntensity:.6, roughness:.3})
    };

    var RB = THREE.RoundedBoxGeometry;
    function geoBox(w,h,d,r){
      if (RB && r){ r = Math.min(r, w/2-.001, h/2-.001, d/2-.001); return new RB(w,h,d,2,r); }
      return new THREE.BoxGeometry(w,h,d);
    }
    function box(w,h,d,m,r){ return new THREE.Mesh(geoBox(w,h,d,r==null?.012:r), m); }
    function cyl(r,h,m,seg){ return new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,seg||16), m); }
    function rod(a,b,r,m){   // thin cylinder between two points
      var dir = new THREE.Vector3().subVectors(b,a), len = dir.length();
      var c = cyl(r,len,m,8);
      c.position.copy(a).addScaledVector(dir,.5);
      c.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), dir.normalize());
      return c;
    }
    function plane(w,h,m){ return new THREE.Mesh(new THREE.PlaneGeometry(w,h), m); }
    function anchor(parent,x,y,z){ var o = new THREE.Object3D(); o.position.set(x,y,z); parent.add(o); return o; }

    var rig = new THREE.Group();
    var P = {};
    var IN = 1.39;               // inner face of each column (2780 mm between columns)
    var PW = .305, PD = .34;     // column width (3390 - 2780) / 2, and depth
    var PX = IN + PW/2;          // column centre
    var H = 3.45;                // column height; the beam takes it to 3.60

    // floor: soft contact shade, real shadows, two yellow bay lines
    var cv = document.createElement("canvas"); cv.width = cv.height = 128;
    var g = cv.getContext("2d"), grd = g.createRadialGradient(64,64,4,64,64,64);
    grd.addColorStop(0, cssVar("--floor-shade","rgba(29,30,32,.16)")); grd.addColorStop(1,"rgba(0,0,0,0)");
    g.fillStyle = grd; g.fillRect(0,0,128,128);
    var shade = plane(9,7, new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(cv), transparent:true, depthWrite:false, opacity:.7}));
    shade.rotation.x = -Math.PI/2; shade.position.y = .001; rig.add(shade);
    var catcher = plane(16,16, new THREE.ShadowMaterial({opacity:.13}));
    catcher.rotation.x = -Math.PI/2; catcher.position.y = .002; catcher.receiveShadow = true; rig.add(catcher);
    var lineMat = new THREE.MeshBasicMaterial({color:C.hi});
    [-2.4,2.4].forEach(function(x){
      var l = plane(.06,6.4,lineMat); l.rotation.x = -Math.PI/2; l.position.set(x,.003,0); rig.add(l);
    });

    P.posts = []; P.plates = []; P.bolts = []; P.locks = []; P.hyd = []; P.carriages = []; P.arms = [];
    [-1,1].forEach(function(s){
      // column: painted steel, inner track, white decal panel high on the face, capacity sticker
      var post = new THREE.Group();
      var col = box(PW,H,PD,M.paint,.035); col.position.y = H/2; post.add(col);
      var track = box(.03,H-.35,.2,M.dark,.008); track.position.set(-s*(PW/2+.004),H/2+.05,0); post.add(track);
      var cap = box(PW+.03,.05,PD+.03,M.paint,.015); cap.position.y = H-.02; post.add(cap);
      var decal = plane(.15,.62,M.decal); decal.position.set(0,2.72,PD/2+.002); post.add(decal);
      var stripe = plane(.15,.035,M.paint); stripe.position.set(0,2.47,PD/2+.003); post.add(stripe);
      var stick = plane(.1,.06,M.sticker); stick.position.set(0,1.95,PD/2+.002); post.add(stick);
      post.position.x = s*PX; post.userData.base = post.position.clone();
      rig.add(post); P.posts.push(post);

      var plate = box(.52,.026,.46,M.paint,.008); plate.position.set(s*PX,.013,0);
      plate.userData.base = plate.position.clone(); rig.add(plate); P.plates.push(plate);

      // anchor bolts: zinc studs, washers, hex nuts
      var bolts = new THREE.Group();
      [[-.2,-.18],[.2,-.18],[-.2,.18],[.2,.18]].forEach(function(p){
        var b = cyl(.016,.1,M.zinc,10); b.position.set(p[0],.07,p[1]); bolts.add(b);
        var wsh = cyl(.04,.008,M.zinc,16); wsh.position.set(p[0],.03,p[1]); bolts.add(wsh);
        var nut = cyl(.03,.03,M.zinc,6); nut.position.set(p[0],.05,p[1]); bolts.add(nut);
      });
      bolts.position.set(s*PX,0,0); bolts.userData.base = bolts.position.clone();
      rig.add(bolts); P.bolts.push(bolts);

      // safety lock ladder: lives inside the column, shown in the exploded view
      var lock = new THREE.Group();
      var strip = box(.035,2.4,.07,M.zinc,.008); strip.position.y = 1.5; lock.add(strip);
      for (var k=0;k<14;k++){ var tooth = box(.05,.03,.09,M.dark,.006); tooth.position.set(-s*.012,.45+k*.155,0); lock.add(tooth); }
      lock.position.set(s*PX,0,-.06); lock.userData.base = lock.position.clone();
      rig.add(lock); P.locks.push(lock);

      // hydraulic cylinder inside each column; the power unit hangs off the right column
      var hyd = new THREE.Group();
      var barrel = cyl(.06,1.75,M.chrome,20); barrel.position.y = .98; hyd.add(barrel);
      var gland = cyl(.07,.06,M.dark,20); gland.position.y = 1.86; hyd.add(gland);
      var rodm = cyl(.028,.8,M.chrome,14); rodm.position.y = 2.28; hyd.add(rodm);
      var foot = cyl(.075,.06,M.dark,20); foot.position.y = .1; hyd.add(foot);
      if (s > 0){
        var pu = new THREE.Group();
        var bracket = box(.04,.5,.24,M.paint,.01); bracket.position.set(-.02,0,0); pu.add(bracket);
        var block = box(.13,.12,.17,M.zinc,.015); block.position.set(.09,.02,0); pu.add(block);
        var motor = cyl(.075,.3,M.dark,20); motor.position.set(.1,.24,0); pu.add(motor);
        var fan = cyl(.077,.03,M.zinc,20); fan.position.set(.1,.39,0); pu.add(fan);
        var tank = box(.12,.3,.16,M.tank,.02); tank.position.set(.1,-.21,0); pu.add(tank);
        var tcap = cyl(.022,.03,M.rubber,12); tcap.position.set(.1,-.045,.04); pu.add(tcap);
        var hose = rod(new THREE.Vector3(.04,-.04,.06), new THREE.Vector3(-.02,-.3,.1), .012, M.rubber); pu.add(hose);
        pu.position.set(PW/2+.005, 1.15, .02);
        hyd.add(pu);
      }
      hyd.position.set(s*PX,0,.04); hyd.userData.base = hyd.position.clone();
      rig.add(hyd); P.hyd.push(hyd);

      // carriage with two swing arms: 3-stage front, 2-stage rear, rubber pads on screw adaptors
      var car = new THREE.Group();
      var body = box(.2,.95,.44,M.paint,.02); body.position.y = .5; car.add(body);
      var face = box(.02,.7,.3,M.dark,.006); face.position.set(-s*.105,.55,0); car.add(face);
      var handle = box(.03,.12,.04,M.rubber,.01); handle.position.set(-s*.11,.9,.18); car.add(handle);
      [1,-1].forEach(function(zs){
        var pivot = new THREE.Group();
        pivot.position.set(-s*.12,.12,zs*.19);
        var pin = cyl(.045,.16,M.zinc,14); pin.position.y = .0; pivot.add(pin);
        var gear = new THREE.Mesh(new THREE.CylinderGeometry(.11,.11,.02,20,1,false,0,Math.PI), M.zinc); gear.position.y = -.06; pivot.add(gear);
        var L;
        if (zs > 0){  // front, 3 stage
          var a1 = box(.62,.1,.15,M.arm,.02); a1.position.x = .33; pivot.add(a1);
          var a2 = box(.42,.08,.12,M.arm,.016); a2.position.set(.78,0,0); pivot.add(a2);
          var a3 = box(.3,.064,.095,M.arm,.012); a3.position.set(1.02,0,0); pivot.add(a3);
          L = 1.12;
        } else {      // rear, 2 stage
          var b1 = box(.7,.1,.15,M.arm,.02); b1.position.x = .37; pivot.add(b1);
          var b2 = box(.46,.078,.115,M.arm,.016); b2.position.set(.9,0,0); pivot.add(b2);
          L = 1.1;
        }
        var screw = cyl(.03,.06,M.zinc,12); screw.position.set(L,.07,0); pivot.add(screw);
        var pad = cyl(.075,.035,M.rubber,20); pad.position.set(L,.115,0); pivot.add(pad);
        var px = s*(IN-.11) - s*.12, tx = s*.6, tz = zs*1.02;
        pivot.userData.parked = zs > 0 ? -Math.PI/2 : Math.PI/2;
        pivot.userData.swung = Math.atan2(-(tz - zs*.19), tx - px);
        pivot.rotation.y = pivot.userData.parked;
        car.add(pivot); P.arms.push(pivot);
      });
      car.position.set(s*(IN-.11),.04,0); car.userData.base = car.position.clone();
      rig.add(car); P.carriages.push(car);
    });

    // overhead beam (clearfloor) with the hydraulic hose over the top and the safety shut-off bar
    var beam = new THREE.Group();
    var bm = box(2*PX+PW,.16,.2,M.paint,.03); bm.position.y = H+.08; beam.add(bm);
    var hoseTop = rod(new THREE.Vector3(-PX+.1,H+.17,.05), new THREE.Vector3(PX-.1,H+.17,.05), .014, M.rubber); beam.add(hoseTop);
    var bar = rod(new THREE.Vector3(-1.2,H-.16,0), new THREE.Vector3(1.2,H-.16,0), .02, M.zinc); beam.add(bar);
    var foam = rod(new THREE.Vector3(-.85,H-.16,0), new THREE.Vector3(.85,H-.16,0), .036, M.rubber); beam.add(foam);
    [-1.2,1.2].forEach(function(x){ var hb = box(.03,.16,.03,M.zinc,.006); hb.position.set(x,H-.08,0); beam.add(hb); });
    var sw = box(.06,.09,.05,M.dark,.01); sw.position.set(1.28,H-.1,0); beam.add(sw);
    beam.userData.base = beam.position.clone();
    rig.add(beam); P.beam = beam;

    // 5/16" synchronisation cables: inside the columns and beam until the exploded view
    var cables = new THREE.Group();
    [.05,-.05].forEach(function(z, j){
      var x = PX - .02;
      var a = new THREE.Vector3(-x,.3,z), b = new THREE.Vector3(-x,H+.08,z),
          c = new THREE.Vector3(x,H+.08,z), d = new THREE.Vector3(x,.3,z);
      if (j){ var t=a; a=d; d=t; t=b; b=c; c=t; }
      cables.add(rod(a,b,.008,M.zinc)); cables.add(rod(b,c,.008,M.zinc)); cables.add(rod(c,d,.008,M.zinc));
      [b,c].forEach(function(p){ var sh = cyl(.06,.035,M.dark,18); sh.rotation.x = Math.PI/2; sh.position.copy(p); cables.add(sh); });
    });
    cables.userData.base = cables.position.clone();
    rig.add(cables); P.cables = cables;

    // car: a tidy modern sedan, built in side profile (x = length, nose at +x) then turned nose-to-camera
    var carG = new THREE.Group(), shell = new THREE.Group();
    function ext(shape, depth, bev, m){
      var geo = new THREE.ExtrudeGeometry(shape,{depth:depth, bevelEnabled:true, bevelThickness:bev, bevelSize:bev, bevelSegments:3, curveSegments:12});
      geo.translate(0,0,-depth/2);
      return new THREE.Mesh(geo,m);
    }
    var lower = new THREE.Shape();
    lower.moveTo(-2.27,.46);
    lower.quadraticCurveTo(-2.24,.38,-1.82,.36);
    lower.absarc(-1.4,.33,.39,Math.PI,0,true);
    lower.lineTo(1.04,.36);
    lower.absarc(1.43,.33,.39,Math.PI,0,true);
    lower.lineTo(2.18,.38);
    lower.quadraticCurveTo(2.33,.44,2.31,.64);
    lower.quadraticCurveTo(2.26,.82,1.75,.86);
    lower.lineTo(.8,.95);
    lower.lineTo(-1.45,.97);
    lower.quadraticCurveTo(-2.05,.96,-2.22,.88);
    lower.quadraticCurveTo(-2.32,.7,-2.27,.46);
    shell.add(ext(lower,1.7,.05,M.car));
    var cabin = new THREE.Shape();
    cabin.moveTo(.82,.94);
    cabin.quadraticCurveTo(.35,1.33,-.02,1.4);
    cabin.lineTo(-.55,1.4);
    cabin.quadraticCurveTo(-1.2,1.33,-1.62,.95);
    cabin.lineTo(.82,.94);
    shell.add(ext(cabin,1.36,.05,M.glass));
    var roof = new THREE.Shape();
    roof.moveTo(.16,1.37);
    roof.quadraticCurveTo(.02,1.42,-.06,1.425);
    roof.lineTo(-.55,1.425);
    roof.quadraticCurveTo(-.8,1.41,-.95,1.35);
    roof.lineTo(.16,1.35);
    shell.add(ext(roof,1.38,.05,M.car));
    var pillar = box(.08,.42,1.48,M.car,.02); pillar.position.set(-.3,1.17,0); shell.add(pillar);
    [-.62,.62].forEach(function(z){
      var hl = box(.1,.08,.34,M.head,.02); hl.position.set(2.27,.72,z); shell.add(hl);
      var tl = box(.08,.09,.36,M.tail,.02); tl.position.set(-2.28,.8,z); shell.add(tl);
    });
    var grille = box(.05,.12,.86,M.dark,.02); grille.position.set(2.32,.55,0); shell.add(grille);
    var mirror = box(.14,.08,.12,M.car,.03);
    [-.88,.88].forEach(function(z){ var m2 = mirror.clone(); m2.position.set(.62,1.0,z); shell.add(m2); });
    [[-1.4,1],[1.43,1],[-1.4,-1],[1.43,-1]].forEach(function(w){
      var tyre = cyl(.33,.23,M.rubber,28); tyre.rotation.x = Math.PI/2; tyre.position.set(w[0],.33,w[1]*.79); shell.add(tyre);
      var rim = cyl(.215,.235,M.zinc,24); rim.rotation.x = Math.PI/2; rim.position.copy(tyre.position); shell.add(rim);
      var hub = cyl(.06,.24,M.dark,12); hub.rotation.x = Math.PI/2; hub.position.copy(tyre.position); shell.add(hub);
    });
    shell.rotation.y = -Math.PI/2;       // length onto z, nose toward the camera
    carG.add(shell);
    rig.add(carG); P.car = carG;

    rig.traverse(function(o){ if (o.isMesh && o !== catcher && o !== shade && o.material !== lineMat) o.castShadow = true; });

    // label anchors (world positions follow the exploded parts)
    var anchors = {
      cables: anchor(cables,0,H+.08,.05),
      locks:  anchor(P.locks[0],0,1.9,0),
      hydraulics: anchor(P.hyd[1],0,1.3,0),
      bolts: anchor(P.bolts[1],.2,.1,.18)
    };
    return { rig:rig, P:P, anchors:anchors, H:H, PX:PX };
  }

  /* ------------------------------------------------------------------ pose */
  // t: 0 intro | 1 sell | 2 install | 3 service | 4 call | 5 end
  function poseFor(t, assembleFloor){
    var p = {};
    p.assemble = Math.max(assembleFloor||0, ss(0,1.9,t));
    // car: drives in during install, out during service, back in for the call
    var carIn1 = ss(2.0,2.38,t), carOut = ss(3.2,3.42,t), carIn2 = ss(4.25,4.55,t);
    p.carZ = t < 3.1 ? lerp(-8,0,carIn1) : t < 4.1 ? lerp(0,-8,carOut) : lerp(-8,0,carIn2);
    p.carShow = (t > 1.95 && t < 3.45) || t > 4.2;
    var swing1 = ss(2.38,2.6,t), unswing = ss(3.12,3.22,t), swing2 = ss(4.55,4.7,t);
    p.swing = t < 3.05 ? swing1 : t < 4.2 ? 1-unswing : swing2;
    var lift1 = ss(2.6,2.95,t), lower = ss(3.0,3.13,t), lift2 = ss(4.7,4.98,t);
    p.lift = t < 2.98 ? lift1 : t < 4.2 ? 1-lower : lift2;
    p.explode = ss(3.38,3.72,t) * (1 - ss(4.0,4.3,t));
    p.rot = lerp(-0.85, .32, ss(0,2.0,t)) + .12*ss(2,3,t) - .32*ss(3.3,3.7,t) + .32*ss(4,4.4,t) + .25*ss(4.4,5,t);
    return p;
  }

  function apply(S, p){
    var P = S.P;
    // assembly: staggered drop from above
    function drop(o, delay, extra){
      var k = easeOut(clamp((p.assemble*1.7 - delay)/.55, 0, 1));
      o.position.y = o.userData.base.y + (1-k)*9 + (extra||0);
      o.visible = k > 0.08;
      return k;
    }
    var e = p.explode;
    P.posts.forEach(function(o,i){ var s = i?1:-1; drop(o,0); o.position.x = o.userData.base.x + s*.95*e; });
    P.plates.forEach(function(o,i){ var s = i?1:-1; drop(o,.02); o.position.x = o.userData.base.x + s*.95*e; });
    P.bolts.forEach(function(o,i){ var s = i?1:-1; drop(o,.05,.55*e); o.position.x = o.userData.base.x + s*.95*e; o.position.z = .5*e; });
    P.locks.forEach(function(o,i){ var s = i?1:-1; drop(o,.28,.1*e); o.position.x = o.userData.base.x - s*.55*e; o.position.z = o.userData.base.z + .55*e; });
    P.hyd.forEach(function(o,i){ var s = i?1:-1; drop(o,.32,.15*e); o.position.x = o.userData.base.x + s*1.0*e; o.position.z = o.userData.base.z + 1.05*e; });
    drop(P.beam,.18,.85*e);
    drop(P.cables,.7,.55*e); P.cables.position.z = -.6*e;
    var lift = p.lift*1.45;
    P.carriages.forEach(function(o,i){
      var s = i?1:-1; drop(o,.45, lift);
      o.position.x = o.userData.base.x + s*.95*e; o.position.z = .25*e;
    });
    var armK = clamp((p.assemble*1.7 - .6)/.55,0,1);
    P.arms.forEach(function(a){
      a.rotation.y = lerp(a.userData.parked, a.userData.swung, p.swing);
      a.scale.setScalar(Math.max(.001, easeOut(armK)));
    });
    // car
    P.car.visible = p.carShow;
    P.car.position.set(0, lift, p.carZ);
    // labels only matter in the exploded view
    S.labelK = ss(.75,1,e);
    S.rig.rotation.y = p.rot;
  }

  /* ------------------------------------------------------------------ mount */
  function mount(container, opts){
    opts = opts || {};
    if (!window.THREE || !webglOK()) return fallback(container);

    var api = { target: opts.mode === "mini" ? (opts.pose || 1.8) : 0, kick:null };
    var ctrl = {
      setT: function(t){ api.target = t; if (api.kick) api.kick(); },
      // story pages hand over screen boxes the hoist must fit inside: {intro:{x0,y0,x1,y1}, stage:{...}}
      setLayout: function(l){ api.layout = l; if (api.dirty) api.dirty(); if (api.kick) api.kick(); },
      fallback: false
    };
    withExtras(function(){
      if (!init(container, opts, api)) { container.innerHTML = ""; fallback(container); ctrl.fallback = true; }
    });
    return ctrl;
  }

  function init(container, opts, api){
    var THREE = window.THREE;
    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({antialias:true, alpha:true, powerPreference:"low-power"});
    } catch (err) { return false; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, SMALL ? 1.75 : 2));
    renderer.setClearColor(0x000000, 0);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.physicallyCorrectLights = false;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    renderer.domElement.setAttribute("aria-hidden","true");

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(30, 1, .1, 100);

    // studio lighting: soft environment for reflections, one key light for the floor shadow
    if (THREE.RoomEnvironment){
      var pmrem = new THREE.PMREMGenerator(renderer);
      scene.environment = pmrem.fromScene(new THREE.RoomEnvironment(), .04).texture;
      pmrem.dispose();
      scene.add(new THREE.HemisphereLight(0xffffff, 0x8f8a7e, .25));
    } else {
      scene.add(new THREE.HemisphereLight(0xffffff, 0x8f8a7e, .9));
    }
    var key = new THREE.DirectionalLight(0xffffff, THREE.RoomEnvironment ? 1.4 : 1.1);
    key.position.set(2,11,3.5);
    key.castShadow = true;
    key.shadow.mapSize.set(SMALL ? 512 : 1024, SMALL ? 512 : 1024);
    var sc = key.shadow.camera; sc.left = -5.5; sc.right = 5.5; sc.top = 5.5; sc.bottom = -5.5; sc.near = 1; sc.far = 25;
    key.shadow.bias = -.0006; key.shadow.normalBias = .02; key.shadow.radius = 4;
    scene.add(key);
    var fill = new THREE.DirectionalLight(0xdfe6ff, .3); fill.position.set(-6,4,-4); scene.add(fill);

    var S = build(THREE);
    scene.add(S.rig);

    var mode = opts.mode || "story";
    var cur = api.target, loadT = REDUCED ? 1 : 0, loadStart = performance.now();
    var visible = true, raf = 0, w = 1, h = 1, dirty = true;
    var labels = opts.labels || null;   // {cables:el, locks:el, ...}
    var v = new THREE.Vector3();

    function size(){
      w = container.clientWidth || 1; h = container.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w/h;
      dirty = true;
    }

    function frameCamera(p){
      var L = api.layout;
      if (mode === "story" && L && L.boxes && L.boxes.length){
        // fit the hoist into its chapter's target box, easing to the next chapter's box near the chapter end
        var nb = L.boxes.length, ci = Math.max(0, Math.min(nb-1, Math.floor(cur))), cn = Math.min(nb-1, ci+1);
        var kk = ci === 0 ? ss(.55,1.1,cur) : ss(.8,1.05,cur-ci), A = L.boxes[ci], B = L.boxes[cn];
        var bx0 = lerp(A.x0,B.x0,kk), bx1 = lerp(A.x1,B.x1,kk), by0 = lerp(A.y0,B.y0,kk), by1 = lerp(A.y1,B.y1,kk);
        var tw = Math.max(40, bx1-bx0), th = Math.max(40, by1-by0);
        var vf2 = camera.fov * Math.PI/180, hf2 = 2*Math.atan(Math.tan(vf2/2)*(w/h));
        var wid = 5.0 + 2.4*p.explode + (p.carShow ? .5 : 0), hei = 4.3 + .85*p.explode;
        var d2 = Math.max((wid/2)/Math.tan(hf2/2) * (w/tw), (hei/2)/Math.tan(vf2/2) * (h/th));
        var ty2 = 1.75 + .3*p.explode;
        camera.position.set(0, ty2 + d2*.22, d2);
        camera.lookAt(0, ty2, 0);
        camera.setViewOffset(w, h, w/2 - (bx0+bx1)/2, h/2 - (by0+by1)/2, w, h);
        camera.updateProjectionMatrix();
        return;
      }
      var aspect = w/h;
      var wide = mode === "story" && aspect > 1.15;
      var vf = camera.fov * Math.PI/180;
      var hf = 2*Math.atan(Math.tan(vf/2)*aspect);
      var width = (mode === "mini" && p.carShow ? 6.6 : 5.4) + 2.6*p.explode, height = 4.6 + .9*p.explode;
      var dist = Math.max((width/2)/Math.tan(hf/2), (height/2)/Math.tan(vf/2)) * (mode === "mini" ? 1.1 : 1.18);
      if (wide) dist *= 1.2;
      var ty = 1.75 + .3*p.explode;
      camera.position.set(0, ty + dist*.22, dist);
      camera.lookAt(0, ty, 0);
      if (wide) camera.setViewOffset(w, h, -w*.14, h*.02, w, h);
      else if (mode === "story") {
        // phone: hoist sits low under the intro headline, then moves up above the copy card
        var k = ss(.55,1.1,cur);
        camera.setViewOffset(w, h, 0, lerp(-h*.22, h*.1, k), w, h);
      }
      else camera.clearViewOffset();
      camera.updateProjectionMatrix();
    }

    function render(){
      if (mode === "mini" && !REDUCED) S.rig.userData.spin = (S.rig.userData.spin || 0) + .0035;
      var p = poseFor(cur, loadT*0.42);
      if (mode === "mini" && !REDUCED) p.rot += S.rig.userData.spin;
      apply(S, p);
      frameCamera(p);
      renderer.render(scene, camera);
      if (labels){
        for (var k in labels){
          var el = labels[k], a = S.anchors[k];
          if (!el || !a) continue;
          a.getWorldPosition(v); v.project(camera);
          var x = (v.x*.5+.5)*w, y = (-v.y*.5+.5)*h;
          el.style.transform = "translate3d(" + x.toFixed(1) + "px," + y.toFixed(1) + "px,0)";
          el.classList.toggle("flip", x > w*.62);
          el.classList.toggle("on", S.labelK > .5);
        }
      }
    }

    function loop(now){
      raf = 0;
      if (!visible) return;
      var moving = false;
      if (loadT < 1){ loadT = Math.min(1,(now - loadStart)/1500); moving = true; }
      var d = api.target - cur;
      if (Math.abs(d) > .0005){ cur += d * (REDUCED ? 1 : .12); moving = true; } else cur = api.target;
      if (mode === "mini" && !REDUCED) moving = true;
      if (moving || dirty){ render(); dirty = false; }
      if (moving) raf = requestAnimationFrame(loop);
    }
    api.dirty = function(){ dirty = true; };
    api.kick = function(){ if (REDUCED) cur = api.target; if (!raf && visible) raf = requestAnimationFrame(loop); };

    size();
    window.addEventListener("resize", function(){ size(); api.kick(); });
    if ("IntersectionObserver" in window){
      new IntersectionObserver(function(ents){
        visible = ents[0].isIntersecting;
        if (visible) { dirty = true; api.kick(); }
      }).observe(container);
    }
    api.kick();
    return true;
  }

  window.Hoist3D = { mount: mount, reduced: REDUCED };
})();
