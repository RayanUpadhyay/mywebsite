// Season 1 · Landfall
// A meteor crashes into the sea off the west coast. Loaded by index.html only while Season 1 is running; everything it needs
// from the page comes in through the API object (see seasonApi in index.html). Progress lives in ru-season under "s1".
window.RU_SEASON_1 = function(R){
  const THREE = R.THREE, V = (x, y, z) => new THREE.Vector3(x, y, z);
  const IMPACT = [-540, 75], COAST = [-404, 70], PIER = [R.ISLE.px1 + 5, R.ISLE.pz];
  const FRAGS = [[-401, -150], [300, 401], [401, -262]];
  const CH = [['Impact', 'Something fell into the sea.'], ['Salvage', 'Someone else wants the pieces.'], ['Crash Isle', 'The steam is turning into land.'], ['The Salvager', 'Finale.']];
  // ---------- saved progress ----------
  const all = R.get(); const st = all.s1 = Object.assign({ intro: 0, met: 0, scanner: 0, frags: [], ch1: 0 }, all.s1 || {});
  const save = () => { const a = R.get(); a.s1 = st; R.put(a); };
  // ---------- a title card and a few UI bits of its own ----------
  const css = document.createElement('style'); css.textContent = `
.s1card{position:fixed;left:50%;top:32%;transform:translate(-50%,-50%) scale(.96);z-index:60;background:rgba(11,13,20,.9);color:#fff;border:1px solid rgba(255,140,60,.55);border-radius:16px;padding:16px 26px;text-align:center;opacity:0;pointer-events:none;transition:opacity .5s,transform .5s;max-width:calc(100% - 32px);font:600 13px/1.4 system-ui,sans-serif}
.s1card.on{opacity:1;transform:translate(-50%,-50%) scale(1)}.s1card small{display:block;letter-spacing:.14em;color:#FF9A4A;font-weight:800}.s1card b{display:block;font:800 26px/1.2 system-ui,sans-serif;margin:4px 0}.s1card span{color:rgba(255,255,255,.8)}
.s1skip{position:fixed;right:16px;bottom:calc(11vh + 12px);z-index:61;background:rgba(255,255,255,.14);color:#fff;border:1px solid rgba(255,255,255,.35);border-radius:999px;padding:8px 16px;font:700 13px system-ui,sans-serif;cursor:pointer}
.s1flash{position:fixed;inset:0;background:#FFF4E0;z-index:56;opacity:0;pointer-events:none}
.s1scan{position:fixed;right:16px;bottom:calc(170px + env(safe-area-inset-bottom,0px));z-index:40}`;
  document.head.appendChild(css);
  const card = document.createElement('div'); card.className = 's1card'; document.body.appendChild(card);
  function showCard(small, big, sub, ms = 3600){ card.innerHTML = `<small>${small}</small><b>${big}</b>${sub ? `<span>${sub}</span>` : ''}`; card.classList.add('on'); clearTimeout(showCard.t); showCard.t = setTimeout(() => card.classList.remove('on'), ms); }
  const flash = document.createElement('div'); flash.className = 's1flash'; document.body.appendChild(flash);
  const skipBtn = document.createElement('button'); skipBtn.type = 'button'; skipBtn.className = 's1skip'; skipBtn.textContent = 'Skip scene ▸▸'; skipBtn.hidden = true; document.body.appendChild(skipBtn);
  const scanBtn = document.createElement('button'); scanBtn.type = 'button'; scanBtn.className = 'btn alt s1scan'; scanBtn.textContent = 'Scan' + (R.fine ? ' (N)' : ''); scanBtn.hidden = true; document.body.appendChild(scanBtn);
  // ---------- shared bits ----------
  const glowSprite = (col, size, opacity = 1) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: R.flakeTex(), color: col, transparent: true, opacity, depthWrite: false, fog: false, blending: THREE.AdditiveBlending, toneMapped: false })); s.scale.setScalar(size); s.userData.noPick = true; s.frustumCulled = false; return s; };
  const mapPos = (x, y, z) => V(x, y, z);  // BL.mapG works in map coordinates
  const angTo = (from, to) => { let d = (to - from) % (Math.PI * 2); if (d > Math.PI) d -= Math.PI * 2; if (d < -Math.PI) d += Math.PI * 2; return d; };
  const ease = k => k * k * (3 - 2 * k);
  // the steam over the impact: it stays all season (Crash Isle is forming under it)
  let steam = null;
  function buildSteam(){
    if (steam || !R.BL.mapG) return; const g = new THREE.Group(); g.position.set(IMPACT[0], 0, IMPACT[1]); R.BL.mapG.add(g);
    const n = R.lowFx ? 18 : 40, parts = []; for (let i = 0; i < n; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: R.flakeTex(), color: 0xE8ECF0, transparent: true, opacity: 0, depthWrite: false, fog: false })); s.userData.noPick = true; g.add(s); parts.push({ s, p: i / n, a: Math.random() * 6.28, r: Math.random() }); }
    const glow = glowSprite(0xFF7A2A, 26, .5); glow.position.y = 1; g.add(glow);
    steam = { g, parts, glow };
  }
  function steamStep(dt, t){ if (!steam) return; steam.parts.forEach(q => { q.p = (q.p + dt * .045) % 1; const h = q.p * 70, w = 4 + q.p * 18; q.s.position.set(Math.cos(q.a + t * .1) * q.r * w, h, Math.sin(q.a + t * .1) * q.r * w); q.s.scale.setScalar(8 + q.p * 30); q.s.material.opacity = .42 * Math.sin(q.p * Math.PI); }); steam.glow.material.opacity = .35 + Math.sin(t * 2.2) * .12; }
  // ---------- the cutscene ----------
  let CS = null;
  function csStart(){
    const [mx, mz] = R.toMap(R.pos.x, R.pos.z);
    CS = { t: 0, from: { x: R.pos.x, y: R.pos.y, z: R.pos.z, yaw: R.yaw, pitch: R.pitch, map: [mx, mz] }, shot: 1, objs: [], trail: [], people: [] };
    R.DRV.lock = true; document.body.classList.add('cine'); skipBtn.hidden = false; R.closePanel();
    // the meteor, first seen from where you're standing: high over the city, heading west
    const cp = R.camera.position, m = new THREE.Group(); m.add(new THREE.Mesh(new THREE.SphereGeometry(1.6, 16, 12), new THREE.MeshBasicMaterial({ color: 0xFFE2A8, fog: false, toneMapped: false }))); m.add(glowSprite(0xFF8A2A, 16)); m.children.forEach(o => o.userData.noPick = true);
    R.BL.sc.add(m); CS.objs.push(m); CS.met = m; CS.a = V(cp.x + 150, cp.y + 150, cp.z - 60); CS.b = V(cp.x - 210, cp.y + 22, cp.z + 25); m.position.copy(CS.a);
    R.tone(900, 3.2, 'sawtooth', .02, 140);
  }
  function trailPuff(at){ const s = glowSprite(0xFF9A4A, 9, .7); s.position.copy(at); R.BL.sc.add(s); CS.trail.push({ s, t: 0 }); }
  function csGo(x, z, yaw, pitch){ const [lx, lz] = R.toLocal(x, z); R.pos.x = lx; R.pos.z = lz; R.yaw = yaw; R.pitch = pitch; }
  function csImpact(){
    const I = mapPos(IMPACT[0], .2, IMPACT[1]);
    flash.style.transition = 'none'; flash.style.opacity = '1'; requestAnimationFrame(() => { flash.style.transition = 'opacity 1.6s'; flash.style.opacity = '0'; });
    const big = glowSprite(0xFFE8C0, 90); big.position.copy(I); big.position.y = 6; R.BL.mapG.add(big); CS.objs.push(big); CS.big = big;
    const ring = new THREE.Mesh(new THREE.RingGeometry(.9, 1, 64), new THREE.MeshBasicMaterial({ color: 0xFFFFFF, transparent: true, opacity: .9, side: THREE.DoubleSide, depthWrite: false, fog: false })); ring.rotation.x = -Math.PI / 2; ring.position.copy(I); ring.userData.noPick = true; R.BL.mapG.add(ring); CS.objs.push(ring); CS.ring = ring;
    CS.spray = []; for (let i = 0; i < 26; i++) { const s = glowSprite(0xDDEEFF, 6, .8); s.position.copy(I); R.BL.mapG.add(s); CS.objs.push(s); const a = Math.random() * 6.28, sp = 8 + Math.random() * 18; CS.spray.push({ s, v: V(Math.cos(a) * sp * .5, 14 + Math.random() * 22, Math.sin(a) * sp * .5) }); }
    R.tone(55, 2.4, 'sawtooth', .09, 25); R.tone(38, 3.2, 'sine', .12, 22); setTimeout(() => R.tone(90, 1.6, 'triangle', .05, 40), 300);
    buildSteam();
  }
  function csCrowd(C){
    // a few people on the street stop and point out to sea
    if (C.crowded) return; C.crowded = true; const [mx, mz] = C.from.map;
    [[-3, -2.5], [-3.5, 1.8], [-5.5, -.6], [-2.2, 3.6], [-4.6, 3.2]].forEach(([dx, dz], i) => { let a; try { a = R.avatar(R.crowdLook(60 + i)); } catch (e) { return; } a.g.position.set(mx + dx, 0, mz + dz); a.g.rotation.y = Math.PI / 2 + (Math.random() - .5) * .4; a.g.traverse(o => o.userData.noPick = true); R.BL.mapG.add(a.g); if (i % 2 === 0 && a.arms && a.arms[1]) a.arms[1].a.rotation.x = -1.9; C.people.push(a); });
    const L = ['“Did you see that?!”', '“It went into the sea!”', '“Was that a plane?”']; L.forEach((l, i) => setTimeout(() => R.say(l, 1800), 300 + i * 1500));
  }
  function csEnd(skipped){
    if (!CS) return; const C = CS; CS = null;
    C.objs.forEach(o => { if (o.parent) o.parent.remove(o); }); C.trail.forEach(q => { if (q.s.parent) q.s.parent.remove(q.s); });
    csGo(C.from.map[0], C.from.map[1], Math.PI / 2, .04); csCrowd(C);
    document.body.classList.remove('cine'); skipBtn.hidden = true; R.DRV.lock = false; flash.style.opacity = '0'; buildSteam();
    const people = C.people; setTimeout(() => people.forEach(a => { if (a.g.parent) a.g.parent.remove(a.g); }), skipped ? 8000 : 20000);
    st.intro = 1; save(); R.PH.wp = PIER.slice();
    showCard('SEASON 1', 'Landfall', 'Something fell into the sea off the west coast. Follow the beacon to the ferry pier.', 5200);
  }
  skipBtn.addEventListener('click', e => { e.stopPropagation(); csEnd(true); });
  addEventListener('keydown', e => { if (CS && e.key === 'Escape') csEnd(true); });
  function csStep(dt){
    const C = CS; C.t += dt; const t = C.t;
    if (C.shot === 1) {
      // turn west and look up while it crosses the sky
      const k = ease(Math.min(1, t / 2)); R.yaw = C.from.yaw + angTo(C.from.yaw, Math.PI / 2) * k; R.pitch = C.from.pitch + (.32 - C.from.pitch) * k;
      if (t > 1.2) { const f = Math.min(1, (t - 1.2) / 3.4); C.met.position.lerpVectors(C.a, C.b, f); if ((C.tp = (C.tp || 0) - dt) <= 0) { C.tp = .05; trailPuff(C.met.position); } }
      if (t > 4.8 && !C.cut) { C.cut = true; R.fade(() => { csGo(COAST[0], COAST[1], Math.PI / 2, .06); const [lx, lz] = R.toLocal(COAST[0], COAST[1]); C.a = V(lx - 30, 170, lz - 80); C.met.position.copy(C.a); C.t2 = 0; C.shot = 2; }, '#000'); }
    } else if (C.shot === 2) {
      C.t2 += dt; const t2 = C.t2; R.yaw = Math.PI / 2;
      if (t2 > .6 && t2 < 3.1) { const I = R.toLocal(IMPACT[0], IMPACT[1]), to = V(I[0], 0, I[1]), f = Math.min(1, (t2 - .6) / 2.5); C.met.position.lerpVectors(C.a, to, f * f); if ((C.tp = (C.tp || 0) - dt) <= 0) { C.tp = .04; trailPuff(C.met.position); } }
      if (t2 >= 3.1 && !C.hit) { C.hit = true; C.met.visible = false; csImpact(); }
      if (C.hit) { const h = t2 - 3.1; R.pitch = .06 + (h < 1.2 ? Math.sin(h * 50) * .02 * (1.2 - h) : 0);
        if (C.big) { C.big.material.opacity = Math.max(0, 1 - h / 1.4); C.big.scale.setScalar(90 + h * 60); }
        if (C.ring) { const r = 1 + h * 55; C.ring.scale.set(r, r, r); C.ring.material.opacity = Math.max(0, .9 - h / 3.4); }
        (C.spray || []).forEach(q => { q.v.y -= 22 * dt; q.s.position.addScaledVector(q.v, dt); q.s.material.opacity = Math.max(0, .8 - h / 2.4); });
        if (h > 4.2 && !C.back) { C.back = true; R.fade(() => { if (CS !== C) return; csGo(C.from.map[0], C.from.map[1], Math.PI / 2, .04); csCrowd(C); C.shot = 3; C.t3 = 0; }, '#000'); } }
    } else if (C.shot === 3) { C.t3 += dt; R.yaw = Math.PI / 2; if (C.t3 > 4.6) csEnd(false); }
    C.trail.forEach(q => { q.t += dt; q.s.material.opacity = Math.max(0, .7 - q.t / 1.4); q.s.scale.setScalar(9 + q.t * 10); });
    C.trail = C.trail.filter(q => { if (q.t < 1.4) return true; if (q.s.parent) q.s.parent.remove(q.s); return false; });
  }
  // ---------- the hint in the room, for visitors who never go outside ----------
  let roomT = 0, hinted = false, streak = null;
  function roomHint(dt){
    if (hinted || st.intro || R.inWorld || R.panelOpen) return; roomT += dt; if (roomT < 9) return;
    hinted = true; streak = { s: glowSprite(0xFFB060, .5), t: 0 }; streak.s.position.set(5.14, 2.7, 3.7); R.room.add(streak.s); R.tone(700, 1.2, 'sawtooth', .015, 160);
    setTimeout(() => R.say('Something just fell into the sea.', 3800), 1300);
  }
  function streakStep(dt){ if (!streak) return; streak.t += dt; const f = Math.min(1, streak.t / 1.1); streak.s.position.set(5.14, 2.7 - 1.45 * f, 3.7 - 1.65 * f); streak.s.material.opacity = 1 - f * .4; if (f >= 1) { R.room.remove(streak.s); streak = null; R.tone(60, .8, 'sine', .05, 30); } }
  // ---------- Chapter 1: the Keeper at the pier, and the scanner ----------
  let keeper = null, talk = null, talking = false;
  function keeperMesh(){
    let a; try { a = R.avatar(R.crowdLook(7)); } catch (e) { return null; }
    a.g.traverse(o => { if (o.isMesh && o.material && o.material.color) { o.material = new THREE.MeshLambertMaterial({ color: 0x14151C }); } o.userData.noPick = true; });
    const hood = new THREE.Mesh(new THREE.ConeGeometry(.3, .55, 12), new THREE.MeshLambertMaterial({ color: 0x101117 })); hood.position.y = 1.92; a.g.add(hood);
    const robe = new THREE.Mesh(new THREE.CylinderGeometry(.28, .5, 1.3, 12, 1, true), new THREE.MeshLambertMaterial({ color: 0x101117, side: THREE.DoubleSide })); robe.position.y = .65; a.g.add(robe);
    [-.07, .07].forEach(x => { const e = new THREE.Mesh(new THREE.SphereGeometry(.025, 8, 6), new THREE.MeshBasicMaterial({ color: 0x7CF2FF, toneMapped: false })); e.position.set(x, 1.72, -.22); a.g.add(e); });
    a.g.userData.noPick = true; return a;
  }
  function keeperMeet(){
    st.met = 1; save(); R.PH.wp = null; R.DRV.lock = true; talking = true;
    const k = keeper = keeperMesh(); if (k) { k.g.position.set(R.ISLE.px1 + 1.5, 0, R.ISLE.pz); k.g.rotation.y = -Math.PI / 2; R.BL.mapG.add(k.g); }
    const [lx, lz] = R.toLocal(R.ISLE.px1 + 4.5, R.ISLE.pz); R.pos.x = lx; R.pos.z = lz; R.yaw = Math.PI / 2; R.pitch = 0;
    talk = { lines: [['The Keeper', 'You saw it fall. Good. Most of them have already forgotten.'], ['The Keeper', 'I keep watch over this island. Things fall into it. Things climb out of it.'], ['The Keeper', 'What do they call you?']], then: askName };
    R.dlgPlay(talk.lines, { block: true, done: () => { const f = talk && talk.then; talk = null; if (f) f(); } });
  }
  function askName(){
    const cur = R.heroName(); const B = R.panel(`<div class="sec"><p class="meta">The Keeper</p><h2 class="display">What do they call you?</h2><p class="sub">Up to 16 characters. You can change it later in the Season tab.</p>
      <p><input id="s1name" maxlength="16" autocomplete="off" value="${cur === 'Traveller' ? '' : cur.replace(/"/g, '')}" placeholder="Traveller" style="width:100%;font:600 16px system-ui;padding:10px 12px;border-radius:10px;border:1px solid rgba(127,127,127,.4)"></p>
      <p id="s1nameMsg" class="sub" style="color:#E8423A"></p><button class="open" type="button" id="s1nameGo">That’s me</button></div>`);
    const go = () => { const v = B.querySelector('#s1name').value.trim(); if (v && !R.cleanName(v)) { B.querySelector('#s1nameMsg').textContent = 'Pick a different name.'; return; } R.setName(v); R.closePanel(); giveScanner(); };
    B.querySelector('#s1nameGo').onclick = go; B.querySelector('#s1name').addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Enter') go(); }); setTimeout(() => { const i = B.querySelector('#s1name'); if (i) i.focus(); }, 60);
  }
  function giveScanner(){
    R.dlgPlay([['The Keeper', '{N}. Remember that I asked.'], ['The Keeper', 'Take this. It hears what the rock is made of.']], { block: true, done: () => {
      st.scanner = 1; save(); R.tone(660, .2, 'triangle', .05); setTimeout(() => R.tone(990, .3, 'triangle', .05), 160);
      showCard('NEW TOOL', 'Scanner', `${R.fine ? 'Press N' : 'Tap Scan'} to ping for meteor fragments. It’s yours to keep.`, 4400);
      setTimeout(() => R.dlgPlay([['The Keeper', 'Pieces of it washed up on the beaches. Three of them. Find them before someone else does.'], ['ME', 'Someone else?'], ['The Keeper', 'There is always someone who comes for the salvage.']], { block: true, done: keeperGo }), 2600);
    } });
  }
  function keeperGo(){
    R.DRV.lock = false; talking = false; if (!keeper) return; const k = keeper; let f = 1;
    k.g.traverse(o => { if (o.material) { o.material = o.material.clone(); o.material.transparent = true; } });
    const iv = setInterval(() => { f -= .05; k.g.traverse(o => { if (o.material) o.material.opacity = Math.max(0, f); }); if (f <= 0) { clearInterval(iv); if (k.g.parent) k.g.parent.remove(k.g); keeper = null; R.say('When you look back, the end of the pier is empty.', 3400); } }, 60);
  }
  // the fragments, glowing on the beaches
  let frags = null;
  function buildFrags(){
    if (frags || !R.BL.mapG) return; frags = FRAGS.map((p, i) => { if (st.frags.includes(i)) return null; const g = new THREE.Group(); g.position.set(p[0], 0, p[1]); R.BL.mapG.add(g);
      const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(.42, 0), new THREE.MeshStandardMaterial({ color: 0x2A2626, roughness: .7, emissive: 0xFF5A1A, emissiveIntensity: .35 })); rock.position.y = .3; rock.rotation.set(.4, i, .2); g.add(rock);
      const gl = glowSprite(0xFF7A2A, 2.6, .55); gl.position.y = .4; g.add(gl); g.traverse(o => o.userData.noPick = true); return { i, g, gl, x: p[0], z: p[1] }; });
  }
  function scan(){
    if (!st.scanner || R.busy) return; const left = (frags || []).filter(Boolean); if (!left.length) return R.say('The scanner is quiet. Nothing left to find, for now.', 2400);
    const [mx, mz] = R.toMap(R.pos.x, R.pos.z); let best = null, bd = 1e9; left.forEach(f => { const d = Math.hypot(f.x - mx, f.z - mz); if (d < bd) { bd = d; best = f; } });
    const a = Math.atan2(best.x - mx, -(best.z - mz)), dirs = ['north', 'north-east', 'east', 'south-east', 'south', 'south-west', 'west', 'north-west'], dir = dirs[((Math.round(a / (Math.PI / 4)) % 8) + 8) % 8];
    const ring = new THREE.Mesh(new THREE.RingGeometry(.9, 1, 48), new THREE.MeshBasicMaterial({ color: 0xFF9A4A, transparent: true, opacity: .8, side: THREE.DoubleSide, depthWrite: false, fog: false })); ring.rotation.x = -Math.PI / 2; ring.position.set(mx, .15, mz); ring.userData.noPick = true; R.BL.mapG.add(ring);
    let t = 0; const iv = setInterval(() => { t += .05; ring.scale.setScalar(1 + t * 30); ring.material.opacity = Math.max(0, .8 - t); if (t >= .8) { clearInterval(iv); R.BL.mapG.remove(ring); } }, 50);
    const n = Math.round(bd); R.tone(n < 30 ? 1400 : n < 120 ? 1000 : 700, .12, 'sine', .05); setTimeout(() => R.tone(n < 30 ? 1400 : 700, .12, 'sine', .04), 180);
    R.say(n < 25 ? 'The scanner screams. It’s right here.' : `Signal: about ${n} m, ${dir}. ${left.length} fragment${left.length > 1 ? 's' : ''} left.`, 2800);
  }
  scanBtn.addEventListener('click', e => { e.stopPropagation(); scan(); });
  addEventListener('keydown', e => { if (e.repeat || /INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) return; if (e.key.toLowerCase() === 'n' && !scanBtn.hidden) scan(); });
  function fragStep(){
    if (!frags) return; const [mx, mz] = R.toMap(R.pos.x, R.pos.z);
    frags.forEach((f, k) => { if (!f) return; if (Math.hypot(f.x - mx, f.z - mz) < 2.6) { R.BL.mapG.remove(f.g); frags[k] = null; st.frags.push(f.i); save(); const n = st.frags.length;
      R.tone(880, .15, 'triangle', .05); setTimeout(() => R.tone(1320, .2, 'triangle', .05), 140);
      if (n >= FRAGS.length) { st.ch1 = 1; save(); const S = R.info(), d2 = Math.max(0, 8 - S.day); showCard('CHAPTER 1 COMPLETE', 'Impact', d2 ? `Chapter 2 unlocks in ${d2} day${d2 > 1 ? 's' : ''}.` : 'Chapter 2 is on its way.', 5200); }
      else showCard('FRAGMENT FOUND', `${n} of ${FRAGS.length}`, 'Still warm. It hums when you hold it near the scanner.', 3000); } });
  }
  // ---------- every frame ----------
  let streetT = 0;
  function step(dt, now){
    const t = now / 1000;
    if (!R.inWorld) { roomHint(dt); streakStep(dt); }
    if (talking && R.DLG && R.DLG.block && performance.now() > R.DLG.until + 1500) R.dlgNext();  // lines move on by themselves; click or Space to go faster
    const inB = R.inWorld && R.zone === 'blr';
    if (inB && R.BLC.built && st.intro) { buildSteam(); if (st.met) buildFrags(); }
    if (steam) steamStep(dt, t);
    if (CS) { if (!inB || R.busy) { csEnd(true); return; } csStep(dt); return; }
    if (!inB) { streetT = 0; scanBtn.hidden = true; return; }
    const [mx, mz] = R.toMap(R.pos.x, R.pos.z), free = !R.busy && !R.DRV.on && !R.DRV.lock && !(R.BL.cine) && !R.BL.lvl && R.onGround();
    // the first time you're out on the street (however you got there), it falls
    if (!st.intro) { streetT = free ? streetT + dt : 0; if (streetT > 1.5 && R.BLC.built) csStart(); return; }
    if (!st.met && free && mx < R.ISLE.px0 + 2 && Math.abs(mz - R.ISLE.pz) < 2.5 && mx < R.ISLE.px1 + 12) keeperMeet();
    if (st.intro && !st.met && !R.PH.wp && free) R.PH.wp = PIER.slice();
    scanBtn.hidden = !(st.scanner && free && frags && frags.some(Boolean));
    if (free) fragStep();
  }
  // ---------- the Season tab on the phone ----------
  function tab(){
    const S = R.info(), fd = new Date(S.start.getTime()), unlock = i => { const d = new Date(fd.getTime() + i * 7 * 864e5); return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' }); };
    const rows = CH.map(([n, sub], i) => { const open = S.week > i, done = i === 0 && st.ch1, cur = i === 0 && !st.ch1;
      return `<div class="phcard"><b>${done ? '✓ ' : ''}Chapter ${i + 1}: ${n}</b><small>${!open ? `Unlocks ${unlock(i)}.` : i === 0 ? (done ? 'Done.' : !st.intro ? 'Step out onto the street.' : !st.met ? 'Go to the ferry pier on the west coast.' : `Find the fragments: ${st.frags.length} of ${FRAGS.length}.`) : 'Coming soon.'}</small>${cur ? `<small>${esc(sub)}</small>` : ''}</div>`; }).join('');
    return `<div class="phcard"><b>Season 1 · Landfall</b><small>Day ${S.day} of 28 · ${S.left} day${S.left === 1 ? '' : 's'} left. A meteor came down off the west coast.</small></div>${rows}
      <div class="phcard"><b>Tools</b><small>${st.scanner ? '✓ Scanner (yours to keep)' : 'Scanner: not yet'}</small></div>
      <div class="phcard"><b>Skins</b><small>Crater Scout · Meteor Glow · Salvager’s Rig. Earn them by playing the season.</small></div>
      <div class="phcard"><b>Your name: ${esc(R.heroName())}</b><div class="phrow"><button type="button" data-s1="name">Change it</button></div></div>`;
  }
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  function wire(B){ const b = B.querySelector('[data-s1="name"]'); if (b) b.onclick = () => { const v = prompt('Your name (up to 16 characters):', R.heroName() === 'Traveller' ? '' : R.heroName()); if (v == null) return; if (v.trim() && !R.cleanName(v)) return R.say('Pick a different name.', 2000); R.setName(v); B.querySelector('.phcard:last-child b').textContent = 'Your name: ' + R.heroName(); }; }
  return { step, tab, wire, debug: { get cs(){ return CS; }, st, scan } };
};
