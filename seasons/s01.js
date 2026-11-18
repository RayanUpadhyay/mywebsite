// Season 1 · Landfall
// A meteor crashes into the sea off the west coast. Loaded by index.html only while Season 1 is running; everything it needs
// from the page comes in through the API object (see seasonApi in index.html). Progress lives in ru-season under "s1".
window.RU_SEASON_1 = function(R){
  const THREE = R.THREE, V = (x, y, z) => new THREE.Vector3(x, y, z);
  const IMPACT = [-540, 75], COAST = [-404, 70], PIER = [R.ISLE.px1 + 5, R.ISLE.pz];
  const FRAGS = [[-401, -150], [300, 401], [401, -262]];
  const CH = [['Impact', 'Something fell into the sea.'], ['Salvage', 'Someone else wants the pieces.'], ['Crash Isle', 'The steam is turning into land.'], ['The Salvager', 'Finale.']];
  // ---------- saved progress ----------
  const all = R.get(); const st = all.s1 = Object.assign({ intro: 0, met: 0, scanner: 0, frags: [], ch1: 0, c2: { start: 0, got: [], lost: [], done: 0 } }, all.s1 || {});
  st.c2 = Object.assign({ start: 0, got: [], lost: [], done: 0 }, st.c2 || {});
  st.c3 = Object.assign({ start: 0, got: [], done: 0 }, st.c3 || {});
  // the week of the season (add ?week=N to the address to preview a later chapter)
  const week = () => { try { const q = location.search.match(/[?&]week=(\d)/); if (q) return +q[1]; } catch (e) {} return R.info().week; };
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
  // ---------- the cutscene: four shots with their own camera (no hands, no buttons but Skip) ----------
  // 1. over the rooftops as the meteor crosses the sky; 2. on the beach as it hits the sea; 3. a slow push in on the steam,
  // with the title; 4. back on the street, over the shoulders of people pointing out to sea. Times are in seconds.
  const SHOTS = [5.4, 6.2, 4.2, 4.4], cine = document.createElement('div'); cine.className = 's1cine'; cine.innerHTML = '<div class="s1tint"></div><div class="s1black"></div><div class="s1title"><small>SEASON 1</small><b>LANDFALL</b></div>'; document.body.appendChild(cine);
  css.textContent += `
.s1cine{position:fixed;inset:0;pointer-events:none;z-index:54;display:none}body.s1cs .s1cine{display:block}
.s1tint{position:absolute;inset:0;background:radial-gradient(ellipse at 30% 25%,rgba(255,150,70,.35),rgba(255,90,40,.12) 45%,rgba(20,10,30,.25));opacity:0;transition:opacity 1.2s}
.s1black{position:absolute;inset:0;background:#000;opacity:0}
.s1title{position:absolute;left:0;right:0;top:40%;text-align:center;color:#fff;opacity:0;transition:opacity 1s,letter-spacing 3.5s;letter-spacing:.2em;text-shadow:0 2px 24px rgba(0,0,0,.6)}
.s1title small{display:block;font:800 14px system-ui,sans-serif;letter-spacing:.5em;color:#FFB27A}.s1title b{display:block;font:900 clamp(40px,9vw,92px)/1.05 system-ui,sans-serif}
.s1title.on{opacity:1;letter-spacing:.32em}
body.s1cs button:not(.s1skip),body.s1cs .placecard,body.s1cs .s1card{visibility:hidden!important}`;
  let CS = null;
  const aimAt = (cx, cy, cz, tx, ty, tz) => { const [lx, lz] = R.toLocal(cx, cz); R.pos.x = lx; R.pos.z = lz; R.pos.y = cy; const dx = tx - cx, dy = ty - cy, dz = tz - cz; R.yaw = Math.atan2(-dx, -dz); R.pitch = Math.atan2(dy, Math.hypot(dx, dz)); };
  const lerp3 = (a, b, f) => [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
  const black = () => cine.querySelector('.s1black');
  function cut(){ const el = black(); el.style.transition = 'none'; el.style.opacity = '1'; requestAnimationFrame(() => requestAnimationFrame(() => { el.style.transition = 'opacity .45s'; el.style.opacity = '0'; })); }
  function add(o){ R.BL.mapG.add(o); CS.objs.push(o); return o; }
  function puff(at, col, size, life, smoke){ const sp = smoke ? new THREE.Sprite(new THREE.SpriteMaterial({ map: R.flakeTex(), color: col, transparent: true, opacity: .5, depthWrite: false, fog: false })) : glowSprite(col, size, .9); sp.scale.setScalar(size); sp.position.set(at[0], at[1], at[2]); sp.userData.noPick = true; R.BL.mapG.add(sp); CS.fx.push({ s: sp, t: 0, life, size, v: null, smoke }); return CS.fx[CS.fx.length - 1]; }
  function meteor(){ const g = new THREE.Group(); g.add(new THREE.Mesh(new THREE.SphereGeometry(1.8, 16, 12), new THREE.MeshBasicMaterial({ color: 0xFFF4DC, fog: false, toneMapped: false }))); g.add(glowSprite(0xFFE2A0, 14, 1)); g.add(glowSprite(0xFF7A2A, 30, .55)); g.traverse(o => o.userData.noPick = true); return add(g); }
  function trail(at, f){ puff(at, 0xFFF0C8, 9, .35); puff([at[0] + (Math.random() - .5) * 2, at[1] + (Math.random() - .5) * 2, at[2] + (Math.random() - .5) * 2], f > .5 ? 0xFF6A2A : 0xFF9A4A, 7 + Math.random() * 5, 1.1); if (Math.random() < .5) puff(at, 0x6A6460, 10 + Math.random() * 6, 2.6, true);
    if (Math.random() < .12) { const d = puff(at, 0xFFB060, 2.2, 1.6); d.v = V((Math.random() - .5) * 30, -10 - Math.random() * 20, (Math.random() - .5) * 30); } }
  function csStart(replay){
    const [mx, mz] = R.toMap(R.pos.x, R.pos.z);
    CS = { t: 0, shot: 0, st: 0, replay: !!replay, from: { x: R.pos.x, y: R.pos.y, z: R.pos.z, yaw: R.yaw, pitch: R.pitch, map: [mx, mz], tpv: R.tpv }, objs: [], fx: [], people: [] };
    R.tpv = false; R.DRV.lock = true; R.closePanel(); document.body.classList.add('cine', 's1cs'); skipBtn.hidden = false; cine.querySelector('.s1tint').style.opacity = '1';
    CS.met = meteor(); CS.a = [mx + 260, 230, mz - 120]; CS.b = [mx - 330, 55, mz + 40]; CS.met.position.set(...CS.a);
    R.tone(1200, 4.4, 'sawtooth', .012, 90); setTimeout(() => R.tone(300, 3.5, 'triangle', .02, 60), 900);
  }
  function crowd(C){
    if (C.crowded) return; C.crowded = true; const [mx, mz] = C.from.map;
    [[-3, -2.2], [-3.4, 1.6], [-5.4, -.4], [-2.4, 3.4], [-4.6, 3], [-6.2, 1.2]].forEach(([dx, dz], i) => { let a; try { a = R.avatar(R.crowdLook(60 + i)); } catch (e) { return; } a.g.position.set(mx + dx, 0, mz + dz); a.g.rotation.y = Math.PI / 2 + (Math.random() - .5) * .4; a.g.traverse(o => o.userData.noPick = true); R.BL.mapG.add(a.g); if (i % 2 === 0 && a.arms && a.arms[1]) a.arms[1].a.rotation.x = -1.9; if (i === 3 && a.arms && a.arms[0]) a.arms[0].a.rotation.x = -2.6; C.people.push(a); });
    ['“Did you see that?!”', '“It went into the sea!”', '“Was that a plane?”'].forEach((l, i) => setTimeout(() => R.say(l, 1700), 400 + i * 1400));
  }
  function impact(C){
    const I = [IMPACT[0], 0, IMPACT[1]];
    const fl = black(); fl.style.transition = 'none'; fl.style.background = '#FFF6E8'; fl.style.opacity = '1'; requestAnimationFrame(() => requestAnimationFrame(() => { fl.style.transition = 'opacity 1.4s'; fl.style.opacity = '0'; setTimeout(() => fl.style.background = '#000', 1500); }));
    C.ball = add(new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), new THREE.MeshBasicMaterial({ color: 0xFFB060, transparent: true, opacity: .95, fog: false, toneMapped: false, blending: THREE.AdditiveBlending, depthWrite: false }))); C.ball.position.set(I[0], 2, I[2]);
    C.col = add(new THREE.Mesh(new THREE.CylinderGeometry(5, 9, 1, 24, 1, true), new THREE.MeshBasicMaterial({ color: 0xF4FAFF, transparent: true, opacity: .8, fog: false, side: THREE.DoubleSide, depthWrite: false }))); C.col.position.set(I[0], 0, I[2]);
    C.ring = add(new THREE.Mesh(new THREE.RingGeometry(.92, 1, 96), new THREE.MeshBasicMaterial({ color: 0xFFFFFF, transparent: true, opacity: .9, side: THREE.DoubleSide, depthWrite: false, fog: false }))); C.ring.rotation.x = -Math.PI / 2; C.ring.position.set(I[0], .15, I[2]);
    C.ring2 = add(C.ring.clone()); C.ring2.material = C.ring.material.clone();
    for (let i = 0; i < 40; i++) { const a = Math.random() * 6.28, sp = 6 + Math.random() * 16, d = puff([I[0], 2, I[2]], i % 3 ? 0xEAF4FF : 0xFFC080, 4 + Math.random() * 4, 2.4 + Math.random()); d.v = V(Math.cos(a) * sp, 18 + Math.random() * 28, Math.sin(a) * sp); d.g = 26; }
    R.tone(48, 2.8, 'sawtooth', .1, 22); R.tone(32, 3.6, 'sine', .14, 20); setTimeout(() => R.tone(120, 1.4, 'square', .03, 40), 120); setTimeout(() => R.tone(70, 2.4, 'triangle', .06, 30), 600);
    buildSteam(); C.shake = 1;
  }
  function csEnd(skipped){
    if (!CS) return; const C = CS; CS = null;
    C.objs.forEach(o => { if (o.parent) o.parent.remove(o); }); C.fx.forEach(q => { if (q.s.parent) q.s.parent.remove(q.s); });
    document.body.classList.remove('cine', 's1cs'); cine.querySelector('.s1tint').style.opacity = '0'; cine.querySelector('.s1title').classList.remove('on'); black().style.opacity = '0'; skipBtn.hidden = true;
    const [lx, lz] = R.toLocal(C.from.map[0], C.from.map[1]); R.pos.x = lx; R.pos.z = lz; R.pos.y = C.from.y; R.yaw = C.replay ? C.from.yaw : Math.PI / 2; R.pitch = .02; R.tpv = C.from.tpv; R.DRV.lock = false; buildSteam();
    if (!C.crowded && !skipped) crowd(C); const people = C.people; setTimeout(() => people.forEach(a => { if (a.g.parent) a.g.parent.remove(a.g); }), skipped ? 1000 : 16000);
    if (C.replay) return;
    st.intro = 1; save(); R.PH.wp = PIER.slice();
    showCard('SEASON 1 · CHAPTER 1', 'Impact', 'Something fell into the sea off the west coast. Follow the beacon to the ferry pier.', 5600);
  }
  skipBtn.addEventListener('click', e => { e.stopPropagation(); csEnd(true); });
  addEventListener('keydown', e => { if (CS && e.key === 'Escape') csEnd(true); });
  function csStep(dt){
    const C = CS; C.t += dt; C.st += dt; const t = C.st, [px, pz] = C.from.map;
    if (C.st > SHOTS[C.shot]) { C.shot++; C.st = 0; if (C.shot >= SHOTS.length) return csEnd(false); cut(); if (C.shot === 2) [C.ball, C.col, C.ring, C.ring2, C.met].forEach(o => { if (o) o.visible = false; }); }
    const shake = (C.shake || 0) > 0 ? (C.shake -= dt * .55, Math.max(0, C.shake)) : 0, j = () => (Math.random() - .5) * shake * .9;
    if (C.shot === 0) {
      // 1. crane up over the rooftops, looking west as it crosses the sky
      const f = ease(Math.min(1, t / 5)), cam = [px + 6 * f, 1.7 + 30 * f, pz + 4 * f], mf = Math.min(1, Math.max(0, (t - .9) / 4.5)), m = lerp3(CS.a, CS.b, mf);
      C.met.position.set(...m); if (mf > 0 && mf < 1) trail(m, mf); const look = lerp3([px - 200, 30, pz], m, .55);
      aimAt(cam[0], cam[1], cam[2], look[0], look[1], look[2]);
    } else if (C.shot === 1) {
      // 2. low on the beach: it screams in and hits the sea
      if (!C.b2) { C.b2 = true; C.ma = [IMPACT[0] + 70, 260, IMPACT[1] - 60]; C.met.position.set(...C.ma); C.met.visible = true; }
      const cam = [-399 - t * .5, 1.15, 57], hitT = 2.5, mf = Math.min(1, t / hitT), m = lerp3(C.ma, [IMPACT[0], 0, IMPACT[1]], mf * mf);
      if (t < hitT) { C.met.position.set(...m); trail(m, mf); } else if (!C.hit) { C.hit = true; C.met.visible = false; impact(C); }
      aimAt(cam[0] + j(), cam[1] + j() * .5, cam[2] + j(), IMPACT[0], 14 + (C.hit ? Math.min(14, (t - hitT) * 9) : 0), IMPACT[1]);
      if (C.hit) { const h = t - hitT;
        C.ball.scale.setScalar(2 + Math.min(1, h / .7) * 26); C.ball.material.opacity = Math.max(0, .95 - h / 2.2); C.ball.material.color.setHSL(.08 - h * .02, 1, Math.max(.2, .65 - h * .15));
        const ch = Math.min(1, h / 1.1) * 62 * Math.max(0, 1 - Math.max(0, h - 1.6) / 2.4); C.col.scale.set(1 + h * .4, Math.max(.01, ch), 1 + h * .4); C.col.position.y = ch / 2; C.col.material.opacity = Math.max(0, .8 - h / 3.6);
        const r = 1 + h * 48; C.ring.scale.set(r, r, r); C.ring.material.opacity = Math.max(0, .9 - h / 3.6); const r2 = 1 + Math.max(0, h - .35) * 36; C.ring2.scale.set(r2, r2, r2); C.ring2.material.opacity = Math.max(0, .6 - h / 3.2); }
    } else if (C.shot === 2) {
      // 3. a slow push in on the steam where the island will rise; the title comes up
      const f = ease(Math.min(1, t / SHOTS[2])), cam = lerp3([-428, 24, 114], [-466, 15, 97], f); aimAt(cam[0], cam[1], cam[2], IMPACT[0], 22, IMPACT[1]);
      if ((C.em = (C.em || 0) - dt) <= 0) { C.em = .06; const d = puff([IMPACT[0] + (Math.random() - .5) * 20, 20 + Math.random() * 30, IMPACT[1] + (Math.random() - .5) * 20], 0xFF8A3A, 1.4, 2.2); d.v = V((Math.random() - .5) * 4, -3 - Math.random() * 4, (Math.random() - .5) * 4); }
      if (t > .6 && !C.titled) { C.titled = true; cine.querySelector('.s1title').classList.add('on'); R.tone(220, 2.6, 'sine', .03, 330); }
      if (t > SHOTS[2] - 1 && C.titled) cine.querySelector('.s1title').classList.remove('on');
    } else {
      // 4. back on the street, over their shoulders, looking at the glow on the horizon
      if (!C.crowded) crowd(C); const f = ease(Math.min(1, t / SHOTS[3])); aimAt(px + 2.6 - f * .8, 1.75, pz + 1.3, px - 80, 7 + f * 3, pz);
      cine.querySelector('.s1tint').style.opacity = '0';
    }
    C.fx.forEach(q => { q.t += dt; const k = q.t / q.life; if (q.v) { q.v.y -= (q.g || 12) * dt; q.s.position.addScaledVector(q.v, dt); } q.s.material.opacity = Math.max(0, (q.smoke ? .5 : .9) * (1 - k)); q.s.scale.setScalar(q.size * (q.smoke ? 1 + k * 2.4 : 1 + k * .8)); });
    C.fx = C.fx.filter(q => { if (q.t < q.life) return true; if (q.s.parent) q.s.parent.remove(q.s); return false; });
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
    st.met = 1; save(); R.PH.wp = null; R.DRV.lock = true; talking = true; document.body.classList.add('cine');
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
    R.DRV.lock = false; talking = false; document.body.classList.remove('cine'); if (!keeper) return; const k = keeper; let f = 1;
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
    if (!st.scanner || R.busy) return; const [mx, mz] = R.toMap(R.pos.x, R.pos.z); if (c2Jam(mx, mz) || c3Jam(mx, mz)) return;
    const left = (frags || []).filter(Boolean).concat((c2 || []).filter(f => f.g), c3 ? c3.shards.filter(Boolean) : []); if (!left.length) return R.say('The scanner is quiet. Nothing left to find, for now.', 2400);
    let best = null, bd = 1e9; left.forEach(f => { const d = Math.hypot(f.x - mx, f.z - mz); if (d < bd) { bd = d; best = f; } });
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

  // ---------- Chapter 2: Salvage. The Salvager's scrapper drones race you to four more fragments ----------
  const C2 = [[61.7, 137.5], [-171.7, -27.5], [226.7, -137.5], [-48.3, 247.5]], C2_FROM = [[300, 330], [-330, -300], [330, -330], [-300, 330]], BARGE = [-505, 40];
  let c2 = null, barge = null;
  function buildBarge(){
    if (barge || !R.BL.mapG) return; const g = barge = new THREE.Group(); g.position.set(BARGE[0], 0, BARGE[1]); g.rotation.y = .3; R.BL.mapG.add(g);
    const M = c => new THREE.MeshLambertMaterial({ color: c }), box = (w, h, d, c, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), M(c)); m.position.set(x, y, z); g.add(m); return m; };
    box(34, 2.4, 12, 0x3A3D44, 0, .6, 0); box(34.4, .5, 12.4, 0xC8462E, 0, -.4, 0); box(8, 5, 8, 0xE8B82E, -11, 3.9, 0); box(.8, 18, .8, 0xE8B82E, 6, 10, 0);
    const arm = box(18, .7, .7, 0xE8B82E, 13, 18.5, 0); arm.rotation.z = -.15; box(.15, 9, .15, 0x16181D, 21, 13.5, 0);
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(10, 2), new THREE.MeshBasicMaterial({ fog: false, map: R.tex(512, 102, (c, w, h) => { c.fillStyle = '#16181D'; c.fillRect(0, 0, w, h); c.fillStyle = '#E8B82E'; c.font = '900 54px system-ui'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('SALVAGER & SONS', w / 2, h / 2 + 3); }) }));
    sign.position.set(-11, 5.2, 4.05); g.add(sign); const lamp = glowSprite(0xFF3A2A, 3, .9); lamp.position.set(6, 19.5, 0); g.add(lamp); barge.lamp = lamp; g.traverse(o => o.userData.noPick = true);
  }
  function droneMesh(){
    const g = new THREE.Group(), M = c => new THREE.MeshLambertMaterial({ color: c });
    g.add(new THREE.Mesh(new THREE.BoxGeometry(1.4, .5, 1.4), M(0x3A3D44))); g.add(new THREE.Mesh(new THREE.BoxGeometry(1.45, .12, 1.45), M(0xE8B82E)));
    g.rotors = [[.9, .9], [-.9, .9], [.9, -.9], [-.9, -.9]].map(([x, z]) => { const r = new THREE.Mesh(new THREE.BoxGeometry(1.1, .04, .12), M(0x16181D)); r.position.set(x, .32, z); g.add(r); return r; });
    const claw = new THREE.Mesh(new THREE.ConeGeometry(.3, .6, 6), M(0xE8B82E)); claw.position.y = -.55; claw.rotation.x = Math.PI; g.add(claw);
    const eye = glowSprite(0xFF3A2A, 1.2, .95); eye.position.y = -.1; g.add(eye); g.traverse(o => o.userData.noPick = true); return g;
  }
  function c2Build(){
    if (c2 || !R.BL.mapG) return; buildBarge();
    c2 = C2.map((p, i) => { const done = st.c2.got.includes(i) || st.c2.lost.includes(i);
      const f = { i, x: p[0], z: p[1], gone: done, g: null, d: null };
      if (!done) { const g = f.g = new THREE.Group(); g.position.set(p[0], 0, p[1]); R.BL.mapG.add(g);
        const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(.42, 0), new THREE.MeshStandardMaterial({ color: 0x2A2626, roughness: .7, emissive: 0xFF5A1A, emissiveIntensity: .35 })); rock.position.y = .3; g.add(rock);
        const gl = glowSprite(0xFF7A2A, 2.6, .55); gl.position.y = .4; g.add(gl); g.traverse(o => o.userData.noPick = true);
        const dm = droneMesh(); R.BL.mapG.add(dm); f.d = { g: dm, x: C2_FROM[i][0], z: C2_FROM[i][1], y: 14, st: 'go', sp: 1.05 + i * .12, jam: 0 }; dm.position.set(f.d.x, f.d.y, f.d.z); }
      return f; });
  }
  function c2Intro(){
    st.c2.start = 1; save(); c2Build();
    const L = ['📻 Attention, Bangalore. This is the Salvager.', '📻 Everything that falls out of the sky is salvage. And salvage is mine.', '📻 My scrappers are already on your streets. Stay out of their way.'];
    L.forEach((l, i) => setTimeout(() => R.say(l, 3200), i * 3400)); R.tone(220, .3, 'square', .02, 180);
    setTimeout(() => showCard('CHAPTER 2', 'Salvage', 'The Salvager’s scrapper drones are after four more fragments. Scan, and get there first. Scanning close to a drone jams it.', 6500), 10400);
  }
  function c2Settle(){
    const n = st.c2.got.length + st.c2.lost.length; if (n < C2.length || st.c2.done) return; st.c2.done = 1; save(); const kept = st.c2.got.length, d3 = 15 - R.info().day;
    setTimeout(() => R.say(kept >= 3 ? 'The Keeper, somewhere close: “You kept most of it from him. He will come for the rest himself.”' : kept ? 'The Keeper, somewhere close: “He has more than you do now. That will make him bold.”' : 'The Keeper, somewhere close: “He has all of it. Then we will have to take it back.”', 6000), 1200);
    showCard('CHAPTER 2 COMPLETE', 'Salvage', `You kept ${kept} of ${C2.length}. ${d3 > 0 ? `Chapter 3 unlocks in ${d3} day${d3 > 1 ? 's' : ''}.` : 'Chapter 3 is on its way.'}`, 6000);
  }
  function c2Step(dt){
    if (!c2) return; const [mx, mz] = R.toMap(R.pos.x, R.pos.z), t = performance.now() / 1000;
    if (barge && barge.lamp) barge.lamp.material.opacity = Math.sin(t * 4) > 0 ? .95 : .15;
    c2.forEach(f => { if (f.gone) return; const D = f.d;
      if (D) { D.g.rotors.forEach((r, k) => r.rotation.y = t * 30 + k);
        if (D.st === 'go') { const dx = f.x - D.x, dz = f.z - D.z, d = Math.hypot(dx, dz); if (d < .8) D.st = 'down'; else { D.x += dx / d * D.sp * dt; D.z += dz / d * D.sp * dt; } }
        else if (D.st === 'down') { D.y = Math.max(1.4, D.y - 3 * dt); if (D.y <= 1.4) { D.st = 'away'; if (f.g) { R.BL.mapG.remove(f.g); f.g = null; } st.c2.lost.push(f.i); save(); R.say('A scrapper drone grabbed a fragment and is flying it out to the barge.', 3000); R.tone(300, .4, 'square', .02, 140); c2Settle(); } }
        else if (D.st === 'away') { D.y = Math.min(30, D.y + 4 * dt); const dx = BARGE[0] - D.x, dz = BARGE[1] - D.z, d = Math.hypot(dx, dz); D.x += dx / d * 9 * dt; D.z += dz / d * 9 * dt; if (d < 6) { R.BL.mapG.remove(D.g); f.d = null; f.gone = true; } }
        else if (D.st === 'jam') { D.jam -= dt; D.g.rotation.z = Math.sin(t * 20) * .3; const dx = C2_FROM[f.i][0] - D.x, dz = C2_FROM[f.i][1] - D.z, d = Math.hypot(dx, dz); if (d > 1) { D.x += dx / d * 6 * dt; D.z += dz / d * 6 * dt; } if (D.jam <= 0 && d <= 1) { D.st = 'go'; D.g.rotation.z = 0; } }
        if (f.d) f.d.g.position.set(D.x, D.y + Math.sin(t * 2 + f.i) * .25, D.z); }
      if (f.g && Math.hypot(f.x - mx, f.z - mz) < 2.6) { R.BL.mapG.remove(f.g); f.g = null; st.c2.got.push(f.i); save(); R.tone(880, .15, 'triangle', .05); setTimeout(() => R.tone(1320, .2, 'triangle', .05), 140);
        if (D) { D.st = 'away'; R.say('Got it first. The drone hangs there a moment, then gives up and heads back to the barge.', 3000); }
        if (!D) f.gone = true; if (st.c2.got.length + st.c2.lost.length < C2.length) showCard('FRAGMENT SAVED', `${st.c2.got.length} kept · ${st.c2.lost.length} lost`, '', 2600); c2Settle(); } });
  }
  // scanning near a drone jams it
  function c2Jam(mx, mz){ let n = 0; (c2 || []).forEach(f => { const D = f.d; if (D && (D.st === 'go' || D.st === 'down') && Math.hypot(D.x - mx, D.z - mz) < 18) { D.st = 'jam'; D.jam = 4; D.y = Math.max(D.y, 8); n++; } }); if (n) { R.tone(160, .5, 'sawtooth', .04, 60); R.say(n > 1 ? 'Your scanner screams on the drones’ frequency. They spark, spin and limp back where they came from.' : 'Your scanner screams on the drone’s frequency. It sparks, spins and limps back where it came from.', 3200); } return n; }

  // ---------- Chapter 3: Crash Isle. The steam has become land; the core is on it, and so is the Salvager's camp ----------
  const ISLE_C = IMPACT, ISLE_R = 44, DOCK = [IMPACT[0] + ISLE_R + 3, IMPACT[1]], SHARDS = [[-528, 100], [-566, 62], [-550, 41]];
  const SENTRY = [{ c: [-530, 98], r: 9, sp: .32 }, { c: [-563, 66], r: 8, sp: -.36 }, { c: [-546, 46], r: 10, sp: .28 }];
  let isle = null, c3 = null;
  const onIsle = (mx, mz) => Math.hypot(mx - ISLE_C[0], mz - ISLE_C[1]) < ISLE_R - 1 || mx > DOCK[0] - 5 && mx < DOCK[0] + 2.5 && Math.abs(mz - DOCK[1]) < 1.4;
  function buildIsle(){
    if (isle || !R.BL.mapG) return; const g = new THREE.Group(); g.position.set(ISLE_C[0], 0, ISLE_C[1]); R.BL.mapG.add(g); isle = { g };
    const M = (c, o) => new THREE.MeshLambertMaterial(Object.assign({ color: c }, o || {}));
    // dark volcanic sand, a rim of boulders round the crater, and the core on a mound in the middle
    const ground = new THREE.Mesh(new THREE.CircleGeometry(ISLE_R + 3, 48), M(0x4A403C, { polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 })); ground.rotation.x = -Math.PI / 2; ground.position.y = .03; g.add(ground);
    const shore = new THREE.Mesh(new THREE.RingGeometry(ISLE_R, ISLE_R + 6, 48), new THREE.MeshBasicMaterial({ color: 0xFFFFFF, transparent: true, opacity: .35, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 })); shore.rotation.x = -Math.PI / 2; shore.position.y = -.05; g.add(shore);
    const rock = M(0x2E2826); for (let i = 0; i < 22; i++) { const a = i / 22 * 6.28, r = 13 + (i % 3) * 1.4, s = 1.4 + (i * 7 % 5) * .45, b = new THREE.Mesh(new THREE.DodecahedronGeometry(s, 0), rock); b.position.set(Math.cos(a) * r, s * .55, Math.sin(a) * r); b.rotation.set(i, i * 2, 0); g.add(b); if (Math.abs(Math.sin(a)) > .25 || Math.cos(a) < 0) R.blrBox(ISLE_C[0] + b.position.x - s * .7, ISLE_C[0] + b.position.x + s * .7, ISLE_C[1] + b.position.z - s * .7, ISLE_C[1] + b.position.z + s * .7); }
    for (let i = 0; i < 30; i++) { const a = Math.random() * 6.28, r = 18 + Math.random() * 22, s = .4 + Math.random() * .9, b = new THREE.Mesh(new THREE.DodecahedronGeometry(s, 0), rock); b.position.set(Math.cos(a) * r, s * .4, Math.sin(a) * r); g.add(b); }
    const mound = new THREE.Mesh(new THREE.SphereGeometry(7, 20, 8, 0, 6.28, 0, .9), M(0x3A3230)); mound.position.y = -4.2; g.add(mound);
    const core = isle.core = new THREE.Group(); core.position.y = 2.2; g.add(core); const cm = new THREE.MeshBasicMaterial({ color: 0xFF8A3A, toneMapped: false });
    [[0, 0, 0, 1.6], [1.1, -.4, .5, .8], [-.9, -.5, -.6, .9], [.3, -.6, -1.1, .6], [-.6, .7, .6, .5]].forEach(([x, y, z, s]) => { const c = new THREE.Mesh(new THREE.IcosahedronGeometry(s, 0), cm); c.position.set(x, y, z); c.rotation.set(x, y, z); core.add(c); });
    const halo = glowSprite(0xFF7A2A, 14, .6); core.add(halo); isle.halo = halo;
    // the Salvager's camp: crates, a generator, a tent and two floodlights
    const camp = new THREE.Group(); camp.position.set(8, 0, 24); g.add(camp); const box = (w, h, d, c, x, y, z, ry = 0) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), M(c)); m.position.set(x, y, z); m.rotation.y = ry; camp.add(m); return m; };
    [[0, 0], [2.2, .4], [1, 2.2], [-2.4, 1.2]].forEach(([x, z], i) => box(1.8, 1.4, 1.8, i % 2 ? 0x6A5236 : 0x7A6242, x, .7, z, i * .4)); box(2.6, 1.6, 1.4, 0xE8B82E, -5, .8, -1.5); box(.5, .5, .5, 0x16181D, -5, 1.9, -1.5);
    const tent = new THREE.Mesh(new THREE.ConeGeometry(3, 2.8, 4), M(0x5A6A3A)); tent.position.set(5, 1.4, -3); tent.rotation.y = .7; camp.add(tent);
    [[-3, 4], [6, 3]].forEach(([x, z]) => { box(.2, 7, .2, 0x2A2D33, x, 3.5, z); const l = glowSprite(0xFFF2C8, 4, .9); l.position.set(x, 7.2, z); camp.add(l); });
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(4.4, .9), new THREE.MeshBasicMaterial({ map: R.tex(512, 104, (c, w, h) => { c.fillStyle = '#16181D'; c.fillRect(0, 0, w, h); c.fillStyle = '#E8B82E'; c.font = '900 46px system-ui'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('KEEP OUT · SALVAGE SITE', w / 2, h / 2 + 2); }) })); sign.position.set(0, 2.4, -3.2); sign.rotation.y = Math.PI; camp.add(sign);
    R.blrBox(ISLE_C[0] + 8 - 4, ISLE_C[0] + 8 + 4, ISLE_C[1] + 24 - 2, ISLE_C[1] + 24 + 4);
    // a little dock on the east side, facing the pier
    const dock = new THREE.Mesh(new THREE.BoxGeometry(8, .25, 2.6), M(0x8A6A4A)); dock.position.set(DOCK[0] - ISLE_C[0] - 1, .08, 0); g.add(dock);
    // steam still drifting out of the vents
    isle.vents = []; for (let i = 0; i < (R.lowFx ? 10 : 22); i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: R.flakeTex(), color: 0xE8ECF0, transparent: true, opacity: 0, depthWrite: false })); s.userData.noPick = true; g.add(s); isle.vents.push({ s, p: i / 22, a: Math.random() * 6.28, r: 3 + Math.random() * 9 }); }
    g.traverse(o => o.userData.noPick = true);
    R.ISLE.extra.push(onIsle);
    if (st.c3.done) coreBeam();
  }
  function isleStep(dt, t){ if (!isle) return; isle.core.rotation.y = t * .4; const k = 1 + Math.sin(t * 2.4) * .08; isle.core.scale.setScalar(k * (isle.flare || 1)); isle.halo.material.opacity = .45 + Math.sin(t * 2.4) * .15;
    isle.vents.forEach(q => { q.p = (q.p + dt * .07) % 1; q.s.position.set(Math.cos(q.a) * q.r, 1 + q.p * 18, Math.sin(q.a) * q.r); q.s.scale.setScalar(2 + q.p * 8); q.s.material.opacity = .32 * Math.sin(q.p * Math.PI); });
    if (isle.beam) isle.beam.material.opacity = .35 + Math.sin(t * 3) * .1; }
  function coreBeam(){ if (!isle || isle.beam) return; const b = isle.beam = new THREE.Mesh(new THREE.CylinderGeometry(.9, 1.6, 300, 16, 1, true), new THREE.MeshBasicMaterial({ color: 0xFFB070, transparent: true, opacity: .4, depthWrite: false, fog: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, toneMapped: false })); b.position.y = 150; b.userData.noPick = true; isle.g.add(b); }
  // the island ferry and a swim both go there once it has risen
  function goIsle(){ R.fade(() => { buildIsle(); const [lx, lz] = R.toLocal(DOCK[0] - 1, DOCK[1]); R.pos.x = lx; R.pos.z = lz; R.pos.y = 1.6; R.yaw = Math.PI / 2; R.pitch = 0; R.say(st.c3.done ? 'Crash Isle. The core is still burning a hole in the sky.' : 'Crash Isle. Two weeks ago this was open sea. Now it’s warm underfoot, and someone has already put up a fence.', 5200); }, '#0B0D14'); }
  function addStop(){ if (R.ISLE.stops.some(q => q.k === 'crash')) return; R.ISLE.stops.push({ k: 'crash', n: 'Crash Isle', where: 'the new island where the meteor came down', go: goIsle }); }
  const dockBtn = document.createElement('button'); dockBtn.type = 'button'; dockBtn.className = 'btn alt'; dockBtn.style.cssText = 'position:fixed;left:50%;bottom:120px;transform:translateX(-50%);z-index:40'; dockBtn.textContent = 'Ferry back to the pier' + (R.fine ? ' (E)' : ''); dockBtn.hidden = true; document.body.appendChild(dockBtn);
  const ferryBack = () => R.fade(() => { const [lx, lz] = R.toLocal(R.ISLE.px1 + 6, R.ISLE.pz); R.pos.x = lx; R.pos.z = lz; R.yaw = -Math.PI / 2; R.pitch = 0; }, '#0B0D14');
  dockBtn.addEventListener('click', e => { e.stopPropagation(); ferryBack(); });
  addEventListener('keydown', e => { if (e.repeat || /INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) return; if (e.key.toLowerCase() === 'e' && !dockBtn.hidden) ferryBack(); });
  function c3Build(){
    if (c3 || !R.BL.mapG) return; buildIsle();
    c3 = { shards: SHARDS.map((p, i) => { if (st.c3.got.includes(i)) return null; const g = new THREE.Group(); g.position.set(p[0], 0, p[1]); R.BL.mapG.add(g);
        const m = new THREE.MeshBasicMaterial({ color: 0x7CF2FF, toneMapped: false }); [[0, .5, 0, .35], [.2, .3, .15, .2], [-.18, .28, -.1, .18]].forEach(([x, y, z, s]) => { const c = new THREE.Mesh(new THREE.OctahedronGeometry(s, 0), m); c.position.set(x, y, z); c.scale.y = 1.8; g.add(c); });
        const gl = glowSprite(0x7CF2FF, 2.4, .6); gl.position.y = .5; g.add(gl); g.traverse(o => o.userData.noPick = true); return { i, g, x: p[0], z: p[1] }; }),
      sentries: SENTRY.map((S, k) => { const g = droneMesh(); R.BL.mapG.add(g); const cone = new THREE.Mesh(new THREE.ConeGeometry(5, 11, 20, 1, true), new THREE.MeshBasicMaterial({ color: 0xFFF2B0, transparent: true, opacity: .16, depthWrite: false, side: THREE.DoubleSide, fog: false })); cone.position.y = -5.8; cone.userData.noPick = true; g.add(cone); return Object.assign({ g, cone, a: k * 2, jam: 0, x: 0, z: 0 }, S); }) };
  }
  function c3Intro(){
    st.c3.start = 1; save(); addStop(); buildIsle();
    ['📻 …reports that the steam off the west coast has stopped. Fishermen say there’s land out there now.', '📻 The island has no name yet. People are calling it Crash Isle.'].forEach((l, i) => setTimeout(() => R.say(l, 4000), i * 4200));
    setTimeout(() => showCard('CHAPTER 3', 'Crash Isle', 'The meteor’s core is on the new island, and so is the Salvager’s camp. Take the ferry from the pier, find three crystal shards, and keep out of the searchlights.', 6800), 8600);
    R.PH.wp = PIER.slice();
  }
  function caught(){ R.tone(880, .15, 'square', .04); setTimeout(() => R.tone(660, .25, 'square', .04), 160); R.say('Spotted! A siren whoops and the sentries herd you back to the dock.', 3200); R.fade(() => { const [lx, lz] = R.toLocal(DOCK[0] - 1, DOCK[1]); R.pos.x = lx; R.pos.z = lz; R.yaw = Math.PI / 2; }, '#2A0A0A'); c3.cool = 4; }
  function c3Step(dt, t, mx, mz, free){
    if (!c3) return; c3.cool = Math.max(0, (c3.cool || 0) - dt);
    c3.sentries.forEach(S => { if (S.jam > 0) { S.jam -= dt; S.g.rotation.z = Math.sin(t * 20) * .3; S.cone.visible = false; } else { S.a += S.sp * dt; S.g.rotation.z = 0; S.cone.visible = true; }
      S.x = S.c[0] + Math.cos(S.a) * S.r; S.z = S.c[1] + Math.sin(S.a) * S.r; S.g.position.set(S.x, 11 + Math.sin(t * 2 + S.a) * .3, S.z); S.g.rotors.forEach((r, k) => r.rotation.y = t * 30 + k);
      if (!st.c3.done && free && S.jam <= 0 && !c3.cool && onIsle(mx, mz) && Math.hypot(mx - S.x, mz - S.z) < 4.6) caught(); });
    c3.shards.forEach((f, k) => { if (!f) return; f.g.rotation.y = t; if (free && Math.hypot(f.x - mx, f.z - mz) < 2.2) { R.BL.mapG.remove(f.g); c3.shards[k] = null; st.c3.got.push(f.i); save(); R.tone(1046, .15, 'triangle', .05); setTimeout(() => R.tone(1568, .25, 'triangle', .05), 140);
        showCard('SHARD FOUND', `${st.c3.got.length} of ${SHARDS.length}`, st.c3.got.length < SHARDS.length ? 'It hums in the same key as the core.' : 'All three. Take them to the core in the crater.', 3200); } });
    if (st.c3.got.length >= SHARDS.length && !st.c3.done && free && Math.hypot(mx - ISLE_C[0], mz - ISLE_C[1]) < 8) coreScene();
  }
  function c3Jam(mx, mz){ let n = 0; (c3 ? c3.sentries : []).forEach(S => { if (S.jam <= 0 && Math.hypot(S.x - mx, S.z - mz) < 18) { S.jam = 6; n++; } }); if (n) { R.tone(160, .5, 'sawtooth', .04, 60); R.say(n > 1 ? 'The sentries’ lights stutter out. You have a few seconds.' : 'The sentry’s light stutters out. You have a few seconds.', 2600); } return n; }
  function coreScene(){
    st.c3.done = 1; save(); R.DRV.lock = true; document.body.classList.add('cine'); talking = true;
    // step back so the whole core is in view, and look up at it
    { const [lx, lz] = R.toLocal(ISLE_C[0] + 10, ISLE_C[1] + 1); R.pos.x = lx; R.pos.z = lz; R.yaw = Math.PI / 2 - .1; R.pitch = .18; }
    let f = 1; const iv = setInterval(() => { f = Math.min(1.7, f + .04); isle.flare = f; if (f >= 1.7) clearInterval(iv); }, 50);
    R.tone(220, 2.4, 'sine', .04, 440); setTimeout(() => { coreBeam(); R.tone(110, 2.6, 'sawtooth', .05, 55); }, 1300);
    setTimeout(() => R.dlgPlay([['The Keeper', 'It isn’t a rock, {N}. It never was.'], ['The Keeper', 'It’s a key. And keys are made to open things.'], ['ME', 'Open what?'], ['The Keeper', 'Look up.']], { block: true, done: () => {
      R.dlgPlay([['📻 The Salvager', 'Thank you, Traveller. You found my prize, and you lit it up so nicely.'], ['📻 The Salvager', 'I’ll be along to collect it. Don’t get up.']], { block: true, done: () => {
        talking = false; document.body.classList.remove('cine'); R.DRV.lock = false; isle.flare = 1; R.tone(98, 1.8, 'square', .04, 90); const d4 = 22 - R.info().day;
        showCard('CHAPTER 3 COMPLETE', 'Crash Isle', d4 > 0 ? `The core is lit, and the Salvager is coming. Chapter 4 unlocks in ${d4} day${d4 > 1 ? 's' : ''}.` : 'The core is lit, and the Salvager is coming.', 6000); } }); } }), 2600);
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
    if (!inB) { streetT = 0; scanBtn.hidden = true; dockBtn.hidden = true; return; }
    const [mx, mz] = R.toMap(R.pos.x, R.pos.z), free = !R.busy && !R.DRV.on && !R.DRV.lock && !(R.BL.cine) && !R.BL.lvl && R.onGround();
    // the first time you're out on the street (however you got there), it falls
    if (!st.intro) { streetT = free ? streetT + dt : 0; if (streetT > 1.5 && R.BLC.built) csStart(); return; }
    if (!st.met && free && mx < R.ISLE.px0 + 2 && Math.abs(mz - R.ISLE.pz) < 2.5 && mx < R.ISLE.px1 + 12) keeperMeet();
    if (st.intro && !st.met && !R.PH.wp && free) R.PH.wp = PIER.slice();
    if (st.ch1 && week() >= 2 && free) { if (!st.c2.start) c2Intro(); else if (!st.c2.done) c2Build(); }
    if (st.c2.start && !st.c2.done) buildBarge();
    if (st.c2.done && week() >= 3 && free) { if (!st.c3.start) c3Intro(); else if (!st.c3.done) c3Build(); }
    if (st.c3.start) { buildIsle(); addStop(); if (st.c3.done) buildBarge(); }
    if (isle) isleStep(dt, now / 1000); if (!R.busy) c3Step(dt, now / 1000, mx, mz, free);
    dockBtn.hidden = !(isle && free && Math.hypot(mx - DOCK[0], mz - DOCK[1]) < 6);
    scanBtn.hidden = !(st.scanner && free && (frags && frags.some(Boolean) || c2 && c2.some(f => f.g || f.d) || c3 && !st.c3.done));
    if (free) fragStep(); if (!R.busy) c2Step(dt);
  }
  // ---------- the Season tab on the phone ----------
  function tab(){
    const S = R.info(), fd = new Date(S.start.getTime()), unlock = i => { const d = new Date(fd.getTime() + i * 7 * 864e5); return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' }); };
    const wk = week(), rows = CH.map(([n, sub], i) => { const open = wk > i, done = i === 0 && st.ch1 || i === 1 && st.c2.done || i === 2 && st.c3.done, cur = open && !done && (i === 0 || i === 1 && st.ch1 || i === 2 && st.c2.done);
      return `<div class="phcard"><b>${done ? '✓ ' : ''}Chapter ${i + 1}: ${n}</b><small>${!open ? `Unlocks ${unlock(i)}.` : i === 0 ? (done ? 'Done.' : !st.intro ? 'Step out onto the street.' : !st.met ? 'Go to the ferry pier on the west coast.' : `Find the fragments: ${st.frags.length} of ${FRAGS.length}.`) : i === 1 ? (!st.ch1 ? 'Finish Chapter 1 first.' : done ? `Done: you kept ${st.c2.got.length} of 4.` : !st.c2.start ? 'Go out onto the street.' : `Beat the drones to the fragments: ${st.c2.got.length} kept, ${st.c2.lost.length} lost.`) : i === 2 ? (!st.c2.done ? 'Finish Chapter 2 first.' : done ? 'Done: the core is lit.' : !st.c3.start ? 'Go out onto the street.' : st.c3.got.length < 3 ? `Take the ferry to Crash Isle and find the shards: ${st.c3.got.length} of 3.` : 'Take the shards to the core in the crater.') : 'Coming soon.'}</small>${cur ? `<small>${esc(sub)}</small>` : ''}</div>`; }).join('');
    return `<div class="phcard"><b>Season 1 · Landfall</b><small>Day ${S.day} of 28 · ${S.left} day${S.left === 1 ? '' : 's'} left. A meteor came down off the west coast.</small></div>${rows}
      ${st.intro ? '<div class="phcard"><b>The Landfall cutscene</b><small>Watch the meteor come down again.</small><div class="phrow"><button type="button" data-s1="replay">▶ Watch it again</button></div></div>' : ''}
      <div class="phcard"><b>Tools</b><small>${st.scanner ? '✓ Scanner (yours to keep)' : 'Scanner: not yet'}</small></div>
      <div class="phcard"><b>Skins</b><small>Crater Scout · Meteor Glow · Salvager’s Rig. Earn them by playing the season.</small></div>
      <div class="phcard"><b>Your name: ${esc(R.heroName())}</b><div class="phrow"><button type="button" data-s1="name">Change it</button></div></div>`;
  }
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  function wire(B){ const rp = B.querySelector('[data-s1="replay"]'); if (rp) rp.onclick = () => { if (!(R.inWorld && R.zone === 'blr') || R.busy || R.DRV.on || R.DRV.lock || R.BL.lvl || !R.onGround()) return R.say('Go out onto the street to watch it again.', 2400); R.phoneClose(); setTimeout(() => csStart(true), 300); };
    const b = B.querySelector('[data-s1="name"]'); if (b) b.onclick = () => { const v = prompt('Your name (up to 16 characters):', R.heroName() === 'Traveller' ? '' : R.heroName()); if (v == null) return; if (v.trim() && !R.cleanName(v)) return R.say('Pick a different name.', 2000); R.setName(v); B.querySelector('.phcard:last-child b').textContent = 'Your name: ' + R.heroName(); }; }
  return { step, tab, wire, debug: { get cs(){ return CS; }, st, scan, get c2(){ return c2; }, get c3(){ return c3; }, goIsle } };
};
