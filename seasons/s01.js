// Season 1 · Landfall
// A meteor crashes into the sea off the west coast. Loaded by index.html only while Season 1 is running; everything it needs
// from the page comes in through the API object (see seasonApi in index.html). Progress lives in ru-season under "s1".
window.RU_SEASON_1 = function(R, opts){
  const THREE = R.THREE, V = (x, y, z) => new THREE.Vector3(x, y, z);
  const IMPACT = [-540, 75], COAST = [-404, 70], PIER = [R.ISLE.px1 + 5, R.ISLE.pz];
  const FRAGS = [[-401, -150], [300, 401], [401, -262]];
  const CH = [['Impact', 'Something fell into the sea.'], ['Salvage', 'Someone else wants the pieces.'], ['Crash Isle', 'The steam is turning into land.'], ['The Salvager', 'Finale.']];
  // ---------- saved progress ----------
  const all = R.get(); const st = all.s1 = Object.assign({ intro: 0, met: 0, scanner: 0, frags: [], ch1: 0, c2: { start: 0, got: [], lost: [], done: 0 } }, all.s1 || {});
  st.c2 = Object.assign({ start: 0, got: [], lost: [], done: 0 }, st.c2 || {});
  st.c3 = Object.assign({ start: 0, got: [], done: 0 }, st.c3 || {});
  st.f = Object.assign({ amb: 0, hau: 0, for: 0, forClean: 0, sal: 0 }, st.f || {}); if (!Array.isArray(st.seen)) st.seen = [];
  // the week of the season (add ?week=N to the address to preview a later part)
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
  const aimAt = (cx, cy, cz, tx, ty, tz) => { if (R.camOut) [cx, cy, cz] = R.camOut([cx, cy, cz]); const [lx, lz] = R.toLocal(cx, cz); R.pos.x = lx; R.pos.z = lz; R.pos.y = cy; const dx = tx - cx, dy = ty - cy, dz = tz - cz; R.yaw = Math.atan2(-dx, -dz); R.pitch = Math.atan2(dy, Math.hypot(dx, dz)); };
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
    showCard('SEASON 1 · PART 1', 'Impact', 'Something fell into the sea off the west coast. Follow the beacon to the ferry pier.', 5600);
  }
  skipBtn.addEventListener('click', e => { e.stopPropagation(); if (SC) scEnd(true); else csEnd(true); });
  addEventListener('keydown', e => { if (e.key !== 'Escape') return; if (SC) scEnd(true); else if (CS) csEnd(true); });
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
  // ---------- Part 1: the Keeper at the pier, and the scanner ----------
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
      if (n >= FRAGS.length) { st.ch1 = 1; save(); const S = R.info(), d2 = Math.max(0, 8 - S.day); showCard('PART 1 COMPLETE', 'Impact', d2 ? `Part 2 unlocks in ${d2} day${d2 > 1 ? 's' : ''}.` : 'Part 2 is on its way.', 5200); }
      else showCard('FRAGMENT FOUND', `${n} of ${FRAGS.length}`, 'Still warm. It hums when you hold it near the scanner.', 3000); } });
  }

  // ---------- Part 2: Salvage. The Salvager's scrapper drones race you to four more fragments ----------
  const C2 = [[61.7, 137.5], [-171.7, -27.5], [226.7, -137.5], [-48.3, 247.5]], C2_FROM = [[300, 330], [-330, -300], [330, -330], [-300, 330]], BARGE = [-470, -10];
  let c2 = null, barge = null;
  // a long flat salvage barge, its deck just above the water so you can fight on it
  function bargeMesh(){
    const g = new THREE.Group(); g.position.set(BARGE[0], 0, BARGE[1]);
    const M = c => new THREE.MeshLambertMaterial({ color: c }), box = (w, h, d, c, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), M(c)); m.position.set(x, y, z); g.add(m); return m; };
    box(48, 1.6, 18, 0x3A3D44, 0, -.75, 0); box(48.4, .5, 18.4, 0xC8462E, 0, -1.4, 0); box(47.6, .06, 17.6, 0x5A5E68, 0, .07, 0);
    [-8.9, 8.9].forEach(z => box(48, .5, .2, 0xE8B82E, 0, .3, z)); box(8, 5, 8, 0xE8B82E, -17, 2.55, 0); box(8.2, .4, 8.2, 0x16181D, -17, 5.2, 0); box(.8, 18, .8, 0xE8B82E, 14, 9.05, 8.2);
    const arm = box(18, .7, .7, 0xE8B82E, 6, 17.5, 8.2); arm.rotation.z = .15; box(.15, 9, .15, 0x16181D, -2, 12.5, 8.2);
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(7.6, 1.5), new THREE.MeshBasicMaterial({ fog: false, map: R.tex(512, 102, (c, w, h) => { c.fillStyle = '#16181D'; c.fillRect(0, 0, w, h); c.fillStyle = '#E8B82E'; c.font = '900 54px system-ui'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('SALVAGER & SONS', w / 2, h / 2 + 3); }) }));
    sign.position.set(-12.95, 3.6, 0); sign.rotation.y = Math.PI / 2; g.add(sign); const lamp = glowSprite(0xFF3A2A, 3, .9); lamp.position.set(14, 18.5, 8.2); g.add(lamp); g.lamp = lamp; g.traverse(o => o.userData.noPick = true); return g;
  }
  function buildBarge(){ if (barge || !R.BL.mapG || st.f.hau) return; barge = bargeMesh(); R.BL.mapG.add(barge); R.ISLE.extra.push(onBarge); }
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
    setTimeout(() => showCard('PART 2', 'Salvage', 'The Salvager’s scrapper drones are after four more fragments. Scan, and get there first. Scanning close to a drone jams it.', 6500), 10400);
  }
  function c2Settle(){
    const n = st.c2.got.length + st.c2.lost.length; if (n < C2.length || st.c2.done) return; st.c2.done = 1; save(); const kept = st.c2.got.length, d3 = 15 - R.info().day;
    setTimeout(() => R.say(kept >= 3 ? 'The Keeper, somewhere close: “You kept most of it from him. He will come for the rest himself.”' : kept ? 'The Keeper, somewhere close: “He has more than you do now. That will make him bold.”' : 'The Keeper, somewhere close: “He has all of it. Then we will have to take it back.”', 6000), 1200);
    showCard('PART 2 COMPLETE', 'Salvage', `You kept ${kept} of ${C2.length}. ${d3 > 0 ? `Part 3 unlocks in ${d3} day${d3 > 1 ? 's' : ''}.` : 'Part 3 is on its way.'}`, 6000);
  }
  function c2Step(dt){
    if (!c2) return; const [mx, mz] = R.toMap(R.pos.x, R.pos.z), t = performance.now() / 1000;
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

  // ---------- Part 3: Crash Isle. The steam has become land; the core is on it, and so is the Salvager's camp ----------
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
    setTimeout(() => showCard('PART 3', 'Crash Isle', 'The meteor’s core is on the new island, and so is the Salvager’s camp. Take the ferry from the pier, find three crystal shards, and keep out of the searchlights.', 6800), 8600);
    R.PH.wp = PIER.slice();
  }
  function caught(){ R.tone(880, .15, 'square', .04); setTimeout(() => R.tone(660, .25, 'square', .04), 160); R.say('Spotted! A siren whoops and the sentries herd you back to the dock.', 3200); R.fade(() => { const [lx, lz] = R.toLocal(DOCK[0] - 1, DOCK[1]); R.pos.x = lx; R.pos.z = lz; R.yaw = Math.PI / 2; }, '#2A0A0A'); c3.cool = 4; }
  function c3Step(dt, t, mx, mz, free){
    if (!c3) return; c3.cool = Math.max(0, (c3.cool || 0) - dt);
    c3.sentries.forEach(S => { if (S.jam > 0) { S.jam -= dt; S.g.rotation.z = Math.sin(t * 20) * .3; S.cone.visible = false; } else { S.a += S.sp * dt; S.g.rotation.z = 0; S.cone.visible = true; }
      S.x = S.c[0] + Math.cos(S.a) * S.r; S.z = S.c[1] + Math.sin(S.a) * S.r; S.g.position.set(S.x, 11 + Math.sin(t * 2 + S.a) * .3, S.z); S.g.rotors.forEach((r, k) => r.rotation.y = t * 30 + k);
      if (!st.c3.done && free && S.jam <= 0 && !c3.cool && onIsle(mx, mz) && Math.hypot(mx - S.x, mz - S.z) < 4.6) caught(); });
    c3.shards.forEach((f, k) => { if (!f) return; f.g.rotation.y = t; if (free && Math.hypot(f.x - mx, f.z - mz) < 2.2) { R.BL.mapG.remove(f.g); c3.shards[k] = null; st.c3.got.push(f.i); save(); R.tone(1046, .15, 'triangle', .05); setTimeout(() => R.tone(1568, .25, 'triangle', .05), 140);
        showCard('SHARD FOUND', `${st.c3.got.length} of ${SHARDS.length}`, st.c3.got.length < SHARDS.length ? 'It hums in the same key as the core.' : 'All three. The Foreman is waiting for you on the north shore.', 3200); } });
    if (st.f.for && !st.c3.done && free && Math.hypot(mx - ISLE_C[0], mz - ISLE_C[1]) < 8) coreTalk();
  }
  function c3Jam(mx, mz){ let n = 0; (c3 ? c3.sentries : []).forEach(S => { if (S.jam <= 0 && Math.hypot(S.x - mx, S.z - mz) < 18) { S.jam = 6; n++; } }); if (n) { R.tone(160, .5, 'sawtooth', .04, 60); R.say(n > 1 ? 'The sentries’ lights stutter out. You have a few seconds.' : 'The sentry’s light stutters out. You have a few seconds.', 2600); } return n; }
  // ---------- short scenes with their own camera: before each boss, and after each win ----------
  // A scene is a list of shots { d (seconds), cam(f, t) and look(f, t) in map coordinates (f eases 0 to 1), start(C), on(f, t, dt, C),
  // name: [small, big, line] for the boss name card }. Hands and buttons are hidden; "Skip scene" ends it. Each plays once in the
  // story and can be watched again from the Season tab.
  const bossCard = document.createElement('div'); bossCard.className = 's1bn'; cine.appendChild(bossCard);
  css.textContent += `
.s1bn{position:absolute;left:calc(4vw + env(safe-area-inset-left,0px));bottom:18vh;padding:12px 20px 14px;border-radius:10px;background:linear-gradient(90deg,rgba(8,6,12,.62),rgba(8,6,12,0));max-width:min(560px,calc(100% - 32px));color:#fff;opacity:0;transform:translateX(-24px);transition:opacity .5s,transform .5s;text-shadow:0 2px 18px rgba(0,0,0,.7)}
.s1bn.on{opacity:1;transform:none}.s1bn small{display:block;font:800 12px system-ui,sans-serif;letter-spacing:.32em;color:#FF9A4A}.s1bn b{display:block;font:900 clamp(34px,8vw,64px)/1 system-ui,sans-serif;letter-spacing:.04em;margin:6px 0 8px;border-left:6px solid #FF7A2A;padding-left:12px}.s1bn span{font:600 italic 16px/1.4 system-ui,sans-serif;color:rgba(255,255,255,.9)}
body.s1cs::before,body.s1cs::after{content:"";position:fixed;left:0;right:0;height:9vh;background:#000;z-index:55}body.s1cs::before{top:0}body.s1cs::after{bottom:0}`;
  let SC = null; const TITLE0 = cine.querySelector('.s1title').innerHTML;
  function scene(id, shots, done){
    if (SC || CS) { PEND.splice(0).forEach(o => { if (o.parent) o.parent.remove(o); }); return false; } const [mx, mz] = R.toMap(R.pos.x, R.pos.z);
    SC = { id, shots, i: -1, t: 0, done, from: { map: [mx, mz], y: R.pos.y, yaw: R.yaw, pitch: R.pitch, tpv: R.tpv }, objs: PEND.splice(0), fx: [] };
    R.tpv = false; R.DRV.lock = true; R.closePanel(); document.body.classList.add('cine', 's1cs'); skipBtn.hidden = false; Object.values(fightBeacons).forEach(g => g.visible = false);
    if (!st.seen.includes(id)) { st.seen.push(id); save(); } scNext(); return true;
  }
  const PEND = [];  // things a scene's shot list adds while it's being built, before the scene starts
  function scAdd(o){ R.BL.mapG.add(o); (SC ? SC.objs : PEND).push(o); o.traverse(q => q.userData.noPick = true); return o; }
  function scPuff(at, col, size, life, v, g){ const sp = glowSprite(col, size, .9); sp.position.set(at[0], at[1], at[2]); R.BL.mapG.add(sp); SC.fx.push({ s: sp, t: 0, life, size, v: v || null, g: g || 0 }); }
  function scNext(){
    const C = SC; C.i++; C.t = 0; bossCard.classList.remove('on'); if (C.i >= C.shots.length) return scEnd(false); if (C.i) cut(); const s = C.shots[C.i];
    if (s.start) { try { s.start(C); } catch (e) { console.error(e); } }
    if (s.name) setTimeout(() => { if (SC !== C || C.shots[C.i] !== s) return; bossCard.innerHTML = `<small>${esc(s.name[0])}</small><b>${esc(s.name[1])}</b>${s.name[2] ? `<span>${esc(R.heroName ? s.name[2].replace(/\{N\}/g, R.heroName()) : s.name[2])}</span>` : ''}`; bossCard.classList.add('on'); R.tone(140, .8, 'sawtooth', .04, 70); }, 500);
    if (s.say) setTimeout(() => { if (SC === C) R.say(s.say.replace(/\{N\}/g, R.heroName()), Math.max(1800, s.d * 1000 - 600)); }, 250);
  }
  function scStep(dt){ if (R.still) R.still();
    const C = SC, s = C.shots[C.i]; C.t += dt; const f = ease(Math.min(1, C.t / s.d));
    if (s.on) { try { s.on(f, C.t, dt, C); } catch (e) { console.error(e); } } if (SC !== C) return;
    const c = s.cam(f, C.t), l = s.look(f, C.t); aimAt(c[0], c[1], c[2], l[0], l[1], l[2]);
    C.fx.forEach(q => { q.t += dt; const k = q.t / q.life; if (q.v) { q.v.y -= q.g * dt; q.s.position.addScaledVector(q.v, dt); } q.s.material.opacity = Math.max(0, .9 * (1 - k)); q.s.scale.setScalar(q.size * (1 + k * .8)); });
    C.fx = C.fx.filter(q => { if (q.t < q.life) return true; if (q.s.parent) q.s.parent.remove(q.s); return false; });
    if (C.t >= s.d) scNext();
  }
  function scEnd(skipped){
    if (!SC) return; const C = SC; SC = null; C.objs.forEach(o => { if (o.parent) o.parent.remove(o); }); C.fx.forEach(q => { if (q.s.parent) q.s.parent.remove(q.s); });
    if (C.onEnd) { try { C.onEnd(); } catch (e) { console.error(e); } } if (isle) isle.flare = 1; cine.querySelector('.s1title').innerHTML = TITLE0; document.body.classList.remove('cine', 's1cs'); bossCard.classList.remove('on'); black().style.opacity = '0'; cine.querySelector('.s1title').classList.remove('on'); cine.querySelector('.s1tint').style.opacity = '0'; skipBtn.hidden = true;
    const [lx, lz] = R.toLocal(C.from.map[0], C.from.map[1]); R.pos.x = lx; R.pos.z = lz; R.pos.y = C.from.y; R.yaw = C.from.yaw; R.pitch = C.from.pitch; R.tpv = C.from.tpv; R.DRV.lock = false;
    if (C.done) setTimeout(() => { try { C.done(skipped); } catch (e) { console.error(e); } }, 60);
  }
  const orbit = (c, r, h, a0, a1) => f => { const a = a0 + (a1 - a0) * f; return [c[0] + Math.cos(a) * r, h, c[1] + Math.sin(a) * r]; };
  function bossAv(h, x, z, faceX, faceZ){ const a = R.heroAv(h); a.g.position.set(x, 0, z); a.g.rotation.y = Math.atan2(-(faceX - x), -(faceZ - z)); scAdd(a.g); return a; }

  // ---------- the fights: where they are, and what each one needs ----------
  const AMB = [-398, 22], FOR = [-540, 44], FIN = [-512, 75];
  const fightBeacons = {};
  function beacon(k, p, label, col){
    if (fightBeacons[k] || !R.BL.mapG) return fightBeacons[k]; const g = new THREE.Group(); g.position.set(p[0], 0, p[1]); R.BL.mapG.add(g);
    const c = new THREE.Mesh(new THREE.CylinderGeometry(1, 1.4, 70, 16, 1, true), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: .2, depthWrite: false, side: THREE.DoubleSide, fog: false })); c.position.y = 35; g.add(c);
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ transparent: true, depthWrite: false, map: R.tex(512, 150, (cx, w, h) => { cx.fillStyle = 'rgba(40,8,4,.85)'; cx.fillRect(6, 6, w - 12, h - 12); cx.fillStyle = '#fff'; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.font = '900 58px system-ui'; cx.fillText(label, w / 2, 62); cx.font = '700 28px system-ui'; cx.fillStyle = '#FFB08A'; cx.fillText('SEASON 1 · BOSS', w / 2, 118); }) })); sp.scale.set(6, 1.75, 1); sp.position.y = 7; g.add(sp);
    g.traverse(o => o.userData.noPick = true); return (fightBeacons[k] = g);
  }
  function unBeacon(k){ const g = fightBeacons[k]; if (g && g.parent) g.parent.remove(g); delete fightBeacons[k]; }
  const armed = {}, newCard = (small, big, sub) => setTimeout(() => showCard(small, big, sub, 5200), 400);
  function giveW(id, quiet){ if (!R.give(id)) return; const W = R.weapons[id]; if (!quiet) newCard('NEW WEAPON', W.n, `${W.how} Yours to keep. Change what you carry in the Season tab.`); R.tone(660, .2, 'triangle', .05); setTimeout(() => R.tone(990, .3, 'triangle', .05), 160); }
  function giveSkin(id){ if (!R.skin(id)) return; const S = R.skins[id]; setTimeout(() => showCard('NEW SKIN', S.n, 'Wear it from the Wardrobe in the Season tab.', 5200), 6000); }

  // Part 1 · the scrapper ambush on the beach: drones first (shoot them down), then scrap bots round both sides
  const DRONE_SPOTS = n => Array.from({ length: n }, (_, i) => [-6 - Math.random() * 3, (i - (n - 1) / 2) * 5]);
  const FIGHT = {
    amb: { id: 'amb', title: 'Scrapper ambush', at: AMB, goal: 'Shoot down the drones',
      cover: [[4, -5, 'crate'], [-3, 4, 'crate'], [6, 7, 'crate'], [-8, -8, 'crate']],
      units: { brute: { stats: { name: 'Scrap brute', hp: 170, kind: 'melee', dmg: 10, range: 2.6, cd: 1.3, speed: 3.4, r: .8, scale: 1.35 }, outfit: { c1: '#5A5E68', c2: '#FF8A2E', metal: 1, gloves: 1, mask: 'helmet', glow: 1 } } },
      intro: 'Scrapper drones, coming in off the sea! Shoot them out of the air.',
      setup(F){ F.data.w = 0; F.data.next = 1.5; F.data.drop = 5; },
      hud(F){ return F.data.w ? `Wave ${F.data.w} of 3 · ${F.foes().length} left${F.data.w === 1 ? ' · shoot the drones down' : F.data.w === 2 ? ' · they’re flanking you' : ''}` : 'Here they come'; },
      step(dt, F){ const D = F.data, foes = F.foes();
        if (!foes.length) { if (D.w >= 3) return F.win(); if ((D.next -= dt) <= 0) { D.w++; D.next = 2.5;
          if (D.w === 1) { DRONE_SPOTS(5).forEach(([x, z]) => F.add('ss_drone', x, z)); F.say('Wave 1: five drones off the sea. Aim up and shoot them down.', 3000); }
          if (D.w === 2) { [[2, -15], [-2, -15], [2, 15], [-2, 15]].forEach(([x, z]) => F.add('ss_scrap', x + 6, z)); F.say('Wave 2: scrap bots, coming round both sides of you!', 3000); }
          if (D.w === 3) { DRONE_SPOTS(3).forEach(([x, z]) => F.add('ss_drone', x, z)); [[8, -14], [8, 14]].forEach(([x, z]) => F.add('ss_scrap', x, z)); F.add('brute', -12, 0); F.say('Last wave: drones, bots and a brute built out of a bus stop.', 3200); } } return; }
        // the drones drop scrap on you: a ring, then a crash
        if (foes.some(u => u.hero === 'ss_drone') && (D.drop -= dt) <= 0) { D.drop = 5.5; const [x, z] = F.me; F.mark(x, z, 2.2, 0xFF8A2E, 1.2, m => { F.ring(m.x, m.z, 2.2, 0xFF8A2E); F.tone(120, .3, 'square', .04, 60); if (F.near(m.x, m.z, m.r)) F.hurt(8); }); } },
      end(won){ if (won) { st.f.amb = 1; save(); unBeacon('amb'); scene('amb_out', SCN.amb_out(), () => { giveW('s1_wrench'); }); } else lost('amb'); } },

    // Part 2 · the Hauler on the barge: armoured from the front, charges in a straight line, slams the deck in rings
    hau: { id: 'hau', title: 'The Hauler', where: 'the Salvager’s barge', at: BARGE, goal: 'Get behind the Hauler: its back is the weak spot', bossAt: [-13, 0],
      boss: { name: 'The Hauler', hp: 950, kind: 'melee', dmg: 11, range: 3, cd: 1.4, speed: 2.9, r: 1.2, scale: 1.85, bk: .2 },
      outfit: { c1: '#E8B82E', c2: '#3A3D44', metal: 1, gloves: 1, mask: 'helmet', stripes: 1 },
      cover: [[-17, 0, 'none', 3.6], [-5, -5, 'crate'], [-5, 5, 'crate'], [5, -5.5, 'crate'], [6, 5, 'crate'], [14, 0, 'crate']],
      intro: 'The Hauler. Its front plate shrugs off everything. Dodge the charge and hit it from behind.',
      setup(F){ F.data.ch = 4; F.data.sl = 8; F.data.crewT = 14; F.data.extra = 0; [[-5, -7.5], [6, 7.5], [14, -3]].forEach(([x, z]) => F.add('ss_crew', x, z, { cover: 1 })); },
      hit(u, d, from, F){ const b = F.boss; if (u !== b || from !== 'me') return d; const fx = -Math.sin(b.yaw), fz = -Math.cos(b.yaw), dx = F.me[0] - b.x, dz = F.me[1] - b.z, k = (fx * dx + fz * dz) / (Math.hypot(dx, dz) || 1);
        if (k > .35) { if (!F.data.toldF) { F.data.toldF = 1; F.say('Clang! The front plate’s too thick. Get round behind it.', 2600); } F.tone(1900, .05, 'square', .03, 1400); return d * .1; }
        if (k < -.3) { if (!F.data.toldB) { F.data.toldB = 1; F.say('Its back is open: hit it there!', 1800); } return d * 1.5; } return d * .6; },
      step(dt, F){ const b = F.boss, D = F.data; if (!b || b.dead > 0) return; const mad = b.hp < b.max * .5;
        if (!D.toldMad && mad) { D.toldMad = 1; F.say('The Hauler’s engine screams. It charges faster now.', 2400); }
        if (D.dash) { const Q = D.dash; Q.t -= dt; b.stun = .2; const nx = b.x + Q.dx * 21 * dt, nz = b.z + Q.dz * 21 * dt; if (F.valid(nx, nz)) { b.x = nx; b.z = nz; } else Q.t = 0;
          if (!Q.hit && Math.hypot(F.me[0] - b.x, F.me[1] - b.z) < 2) { Q.hit = 1; F.hurt(16, b); F.shake(.5); const k = 3; F.move(F.me[0] + Q.dx * k, F.me[1] + Q.dz * k); }
          if (Q.t <= 0) { D.dash = null; b.stun = 1.4; F.say('It’s stuck turning round. Hit its back!', 1500); } return; }
        if ((D.ch -= dt) <= 0) { D.ch = mad ? 5 : 7; const [px, pz] = F.me, dx = px - b.x, dz = pz - b.z, d = Math.hypot(dx, dz) || 1; b.stun = 1.1; b.yaw = Math.atan2(-dx, -dz); F.tone(70, .9, 'sawtooth', .05, 160);
          for (let k = 1; k <= 8; k++) F.mark(b.x + dx / d * k * 2.6, b.z + dz / d * k * 2.6, 1.3, 0xFF6A1E, 1, null, true);
          setTimeout(() => { if (!F.over && b.dead <= 0) D.dash = { dx: dx / d, dz: dz / d, t: .95, hit: 0 }; }, 1000); return; }
        if ((D.sl -= dt) <= 0 && Math.hypot(F.me[0] - b.x, F.me[1] - b.z) < 10) { D.sl = mad ? 7 : 9.5; b.stun = 2.2; F.say('It lifts both arms…', 1200);
          [3.2, 6.2, 9.2].forEach((r, i) => F.mark(b.x, b.z, r, 0xFFC93C, .9 + i * .45, m => { F.ring(m.x, m.z, m.r, 0xFFC93C); F.shake(.35); F.tone(55, .4, 'sawtooth', .06, 30); const d = Math.hypot(F.me[0] - m.x, F.me[1] - m.z); if (d < m.r && d > m.r - 2.6) F.hurt(13); })); }
        if ((D.crewT -= dt) <= 0) { D.crewT = 16; if (D.extra < 3 && F.foes().filter(u => u.hero === 'ss_crew').length < 2) { D.extra++; F.add('ss_crew', 20, (Math.random() - .5) * 10, { cover: 1 }); F.say('More crew climb up from below deck.', 1600); } } },
      end(won){ if (won) { st.f.hau = 1; save(); unBeacon('hau'); scene('hau_out', SCN.hau_out(), () => { sinkBarge(); giveW('s1_scatter'); ferryBack(); }); } else lost('hau'); } },

    // Part 3 · the Foreman: searchlights call in strikes, crystal pylons shield him, then it's blades
    for: { id: 'for', title: 'The Foreman', where: 'Crash Isle', at: FOR, goal: '', bossAt: [0, -8],
      boss: { name: 'The Foreman', hp: 820, kind: 'ranged', dmg: 6, cd: .95, col: 0xFFE070, speed: 3.4, r: .7, scale: 1.25 },
      outfit: { c1: '#3A3D44', c2: '#FFE070', gloves: 1, mask: 'visor', cape: 1 },
      units: { blade: { stats: { name: 'The Foreman', hp: 820, kind: 'melee', dmg: 9, range: 2.7, cd: .9, speed: 4.6, r: .7, scale: 1.25 }, outfit: { c1: '#3A3D44', c2: '#FFE070', gloves: 1, mask: 'visor', cape: 1 } } },
      cover: [[-6, 3, 'crate'], [5, 4, 'crate'], [-12, -2, 'crate'], [12, -3, 'crate']],
      intro: 'Keep out of the searchlights, or shoot them down. His crystal pylons shield him: break them first.',
      setup(F){ const D = F.data; D.caught = 0; D.cool = 0; D.lit = 0; D.fan = 5;
        D.pyl = [[-10, -6], [10, -6], [0, 6]].map(([x, z]) => { const u = F.add('ss_pylon', x, z); u.av.g.traverse(o => { if (o.material && o.material.emissive) o.material = new THREE.MeshBasicMaterial({ color: 0x7CF2FF }); }); return u; });
        D.line = new THREE.LineSegments(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: 0x7CF2FF })); F.par().add(D.line);
        D.shield = new THREE.Mesh(new THREE.SphereGeometry(1.9, 20, 14), new THREE.MeshBasicMaterial({ color: 0x7CF2FF, transparent: true, opacity: .22, depthWrite: false })); F.par().add(D.shield);
        D.sen = [{ c: [-6, -2], r: 7, sp: .5, a: 0 }, { c: [6, 2], r: 8, sp: -.42, a: 2 }, { c: [0, -4], r: 11, sp: .3, a: 4 }].map(S => { const u = F.add('ss_sentry', S.c[0], S.c[1]); const g = new THREE.Mesh(new THREE.CircleGeometry(2.6, 28), new THREE.MeshBasicMaterial({ color: 0xFFF2B0, transparent: true, opacity: .35, depthWrite: false })); g.rotation.x = -Math.PI / 2; F.par().add(g);
          const cone = new THREE.Mesh(new THREE.ConeGeometry(2.6, 6.4, 20, 1, true), new THREE.MeshBasicMaterial({ color: 0xFFF2B0, transparent: true, opacity: .1, depthWrite: false, side: THREE.DoubleSide })); F.par().add(cone); return Object.assign(S, { u, g, cone }); });
        D.sen.forEach(S => { const old = S.u.av.g; if (old.parent) old.parent.remove(old); const g = droneMesh(); g.scale.setScalar(.7); g.add(S.u.tag); S.u.tag.position.y = 1; F.par().add(g); S.u.av = { g, hold(){}, anim(){} }; }); },
      hud(F){ const D = F.data, p = D.pyl.filter(u => u.dead <= 0).length; return p ? `Break the crystal pylons: ${p} left · stay out of the light${D.caught ? ` · spotted ${D.caught}×` : ''}` : 'His shield is down: get in close with a blade'; },
      hit(u, d, from, F){ const D = F.data; if (u !== F.boss || from !== 'me') return d; if (D.pyl.some(q => q.dead <= 0)) { if (!D.toldSh) { D.toldSh = 1; F.say('His shield drinks it. Break the crystal pylons first.', 2400); } return 0; }
        if (F.melee(F.wpn)) return d * 1.6; if (!D.toldMel) { D.toldMel = 1; F.say('Shots glance off his blade. Get in close and use your sword.', 2400); } return d * .35; },
      step(dt, F){ const D = F.data, b = F.boss, t = F.t; if (!b) return; D.cool = Math.max(0, D.cool - dt);
        const on = D.pyl.filter(u => u.dead <= 0), pts = []; on.forEach(u => pts.push(new THREE.Vector3(u.x, 2.6, u.z), new THREE.Vector3(b.x, 1.6, b.z))); D.line.geometry.dispose(); D.line.geometry = new THREE.BufferGeometry().setFromPoints(pts.length ? pts : [new THREE.Vector3(0, -9, 0), new THREE.Vector3(0, -9, 0)]);
        D.shield.visible = !!on.length && b.dead <= 0; D.shield.position.set(b.x, 1.4, b.z);
        if (!on.length && !D.blade) { D.blade = 1; F.say('The pylons shatter and his shield is gone! He draws a crystal blade. Finish it up close!', 3400); F.tone(1200, .5, 'triangle', .05, 300); b.stun = 1; b.hero = 'ssu_for_blade'; }
        // the searchlights: their pools of light circle the ground; stand in one too long and he calls in a strike
        let inLight = false; D.sen.forEach(S => { const alive = S.u.dead <= 0; S.a += S.sp * dt; const x = S.c[0] + Math.cos(S.a) * S.r, z = S.c[1] + Math.sin(S.a) * S.r; S.u.x = x; S.u.z = z; S.u.y = 6.5 + Math.sin(t * 2 + S.a) * .2; S.u.av.g.position.set(x, S.u.y, z); S.u.av.g.rotors && S.u.av.g.rotors.forEach((r, k) => r.rotation.y = t * 30 + k);
          S.g.visible = S.cone.visible = alive; S.g.position.set(x, .06, z); S.cone.position.set(x, 3.3, z); if (alive && F.near(x, z, 2.6)) inLight = true; });
        D.lit = inLight ? D.lit + dt : Math.max(0, D.lit - dt * 2);
        if (D.lit > .45 && !D.cool) { D.lit = 0; D.cool = 5; D.caught++; FIGHT.for.lastCaught = D.caught; F.say('Spotted! The Foreman calls in a strike on your position!', 2400); F.tone(880, .15, 'square', .04); setTimeout(() => F.tone(660, .25, 'square', .04), 160);
          const [x, z] = F.me; [[0, 0], [2.6, 1], [-2.2, 1.8], [.6, -2.6]].forEach(([ox, oz], i) => F.mark(x + ox, z + oz, 2.3, 0xFF3A2A, 1.2 + i * .15, m => { F.ring(m.x, m.z, 2.3, 0xFF6A2A); F.shake(.3); F.tone(70, .3, 'sawtooth', .05, 30); if (F.near(m.x, m.z, m.r)) F.hurt(11); }));
          if (F.foes().filter(u => u.hero === 'ss_crew').length < 3) F.add('ss_crew', b.x + 4, b.z - 4, { cover: 1 }); }
        // a fan of hot rivets
        if (b.dead <= 0 && !D.blade && (D.fan -= dt) <= 0) { D.fan = 6.5; const [px, pz] = F.me, a0 = Math.atan2(px - b.x, pz - b.z); for (let i = -2; i <= 2; i++) { const a = a0 + i * .28, r = Math.min(9, Math.hypot(px - b.x, pz - b.z)); F.mark(b.x + Math.sin(a) * r, b.z + Math.cos(a) * r, 1.3, 0xFFE070, 1, m => { if (F.near(m.x, m.z, m.r)) F.hurt(7); }, true); } } },
      end(won){ if (won) { const clean = !FIGHT.for.lastCaught; st.f.for = 1; st.f.forClean = clean ? 1 : st.f.forClean || 0; save(); unBeacon('for'); if (clean) giveSkin('s1_glow');
          scene('for_out', SCN.for_out(), () => { giveW('s1_rifle'); if (!st.c3.done) coreTalk(); }); } else lost('for'); } },

    // Part 4 · the Salvager: his drone swarm and magnet, then his mech, then him, while the sea floods the crater
    sal: { id: 'sal', title: 'The Salvager', where: 'Crash Isle', at: FIN, goal: '', bossAt: [-11, 0],
      boss: { name: 'The Salvager', hp: 1000, kind: 'ranged', dmg: 6, cd: 1.1, col: 0xFF5A3A, speed: 3.8, r: .7, scale: 1.2 },
      outfit: { c1: '#E8B82E', c2: '#16181D', gloves: 1, mask: 'helmet', cape: 1, stripes: 1 },
      units: { blade: { stats: { name: 'The Salvager', hp: 1000, kind: 'melee', dmg: 8, range: 2.6, cd: .85, speed: 4.4, r: .7, scale: 1.2 }, outfit: { c1: '#E8B82E', c2: '#16181D', gloves: 1, mask: 'helmet', cape: 1, stripes: 1 } }, mech: { stats: { name: 'Salvage mech', hp: 9999, kind: 'melee', dmg: 14, range: 3.8, cd: 1.8, speed: 2.1, r: 1.7, scale: 2.7 }, outfit: { c1: '#5A5E68', c2: '#E8B82E', metal: 1, gloves: 1, mask: 'helmet', glow: 1 } } },
      cover: [[-2, -7, 'crate'], [-3, 7, 'crate'], [6, -3, 'crate'], [7, 5, 'crate']],
      intro: 'Phase 1: shoot down his drone swarm. When the rings lead to you, his magnet is coming: get out of the line.',
      setup(F){ const D = F.data; D.ph = 1; D.killed = 0; D.mag = 5; D.wave = 0; const b = F.boss; b.stun = 999;
        const perch = new THREE.Group(); perch.position.set(b.x, 0, b.z); F.par().add(perch); [[0, 0, 2.6], [.6, 1.1, 1.8], [-.4, 1.9, 1.3]].forEach(([x, y, s]) => { const m = new THREE.Mesh(new THREE.BoxGeometry(s, 1.1, s), F.mat(0x5A5E68, { metalness: .5 })); m.position.set(x, y + .55, 0); m.rotation.y = x; perch.add(m); }); D.perch = perch; b.y = 2.6; },
      hud(F){ const D = F.data; return D.ph === 1 ? `Phase 1: down the swarm (${F.foes().filter(u => u.hero === 'ss_drone').length}) · dodge the magnet` : D.ph === 2 ? `Phase 2: shoot the joints (${D.joints.filter(u => u.dead <= 0).length} left)` : `Phase 3: use your blade${D.water && D.water.position.y > .3 ? ' · it’s flooding!' : ''}`; },
      hit(u, d, from, F){ const D = F.data, b = F.boss;
        if (D.sal && u === D.sal && D.ph < 3) { if (from === 'me' && !D.toldInv) { D.toldInv = 1; F.say(D.ph === 1 ? 'He’s out of reach behind his swarm. Take down the drones.' : 'He’s sealed inside the mech.', 2200); } return 0; }
        if (D.mech && u === D.mech) { if (from === 'me' && !D.toldArm) { D.toldArm = 1; F.say('Solid armour. Aim for the glowing joints!', 2200); } return 0; }
        if (D.ph === 3 && u === D.sal && from === 'me') { if (F.melee(F.wpn)) return d * 1.6; if (!D.toldMel) { D.toldMel = 1; F.say('He bats your shots away with his hook. Finish him with your blade!', 2400); } return d * .25; }
        return d; },
      kill(u, from, F){ if (u.hero === 'ss_drone') F.data.killed++; },
      step(dt, F){ const D = F.data, t = F.t; if (!D.sal) D.sal = F.boss;
        const S = D.sal; if (D.ph === 1) { S.stun = 1; S.y = 2.6; if (S.av) S.av.g.position.y = 2.6; S.yaw = Math.atan2(-(F.me[0] - S.x), -(F.me[1] - S.z));
          const drones = F.foes().filter(u => u.hero === 'ss_drone');
          if (!drones.length) { if (D.wave >= 2) return toMech(F); D.wave++; const n = D.wave === 1 ? 6 : 5; for (let i = 0; i < n; i++) { const a = i / n * 6.28; F.add('ss_drone', S.x + 4 + Math.cos(a) * 8, S.z + Math.sin(a) * 8); } F.say(D.wave === 1 ? '“Swarm, take it apart!” Six drones peel off his shoulders.' : '“More!” The second swarm lifts off the scrap pile.', 2800); }
          if ((D.mag -= dt) <= 0) { D.mag = 6.5; const [px, pz] = F.me, dx = px - S.x, dz = pz - S.z, L = Math.hypot(dx, dz) || 1, ux = dx / L, uz = dz / L; F.tone(300, 1.1, 'sine', .04, 900);
            for (let k = 2; k <= L + 2; k += 2.2) F.mark(S.x + ux * k, S.z + uz * k, 1.1, 0x7FA8FF, 1.25, null, true);
            setTimeout(() => { if (F.over) return; const [qx, qz] = F.me, rx = qx - S.x, rz = qz - S.z, along = rx * ux + rz * uz, side = Math.abs(rx * uz - rz * ux); if (along > 0 && side < 1.6) { F.say('The magnet drags you in!', 1500); F.tone(140, .5, 'sawtooth', .05, 60); F.move(qx - rx * .55, qz - rz * .55); F.hurt(9, S); } else F.tone(200, .2, 'sine', .03); }, 1250); } return; }
        if (D.ph === 2) { const M = D.mech; if (!M) return; S.x = M.x; S.z = M.z; S.stun = 1;
          const live = D.joints.filter(u => u.dead <= 0); D.joints.forEach((u, i) => { const [ox, oy, oz] = D.jo[i], c = Math.cos(M.yaw), s = Math.sin(M.yaw); u.x = M.x + ox * c + oz * s; u.z = M.z - ox * s + oz * c; u.y = oy; u.av.g.position.set(u.x, oy, u.z); u.av.g.visible = u.dead <= 0; });
          M.hp = live.reduce((n, u) => n + u.hp, 0); M.max = D.jmax; if (!live.length) return toMan(F);
          if ((D.las -= dt) <= 0) { D.las = 7.5; const [px, pz] = F.me, a0 = Math.atan2(px - M.x, pz - M.z), dir = Math.random() < .5 ? 1 : -1; F.say('The mech’s eye glows: laser sweep!', 1400); M.stun = 2.6;
            [-.6, -.3, 0, .3, .6].forEach((o, i) => { const a = a0 + o * dir; for (let k = 2; k <= 18; k += 2) F.mark(M.x + Math.sin(a) * k, M.z + Math.cos(a) * k, .9, 0xFF3A6A, 1.1 + i * .28, k === 2 ? m => { F.beam(M.x, M.z, M.x + Math.sin(a) * 18, M.z + Math.cos(a) * 18, 0xFF3A6A, .7); F.tone(900, .15, 'sawtooth', .03, 500); const [qx, qz] = F.me, rx = qx - M.x, rz = qz - M.z, al = rx * Math.sin(a) + rz * Math.cos(a), sd = Math.abs(rx * Math.cos(a) - rz * Math.sin(a)); if (al > 0 && al < 18 && sd < 1.1) F.hurt(12, M); } : null, true); }); }
          if ((D.mis -= dt) <= 0) { D.mis = 9; const [px, pz] = F.me, gap = Math.floor(Math.random() * 8); F.say('Missiles! Find the gap in the ring.', 1500); F.tone(1400, .6, 'square', .02, 400);
            for (let i = 0; i < 8; i++) { if (i === gap) continue; const a = i / 8 * 6.28; F.mark(px + Math.cos(a) * 4, pz + Math.sin(a) * 4, 2, 0xFFB03A, 1.7, m => { F.ring(m.x, m.z, 2, 0xFF8A2A); F.tone(80, .3, 'sawtooth', .05, 40); F.shake(.2); if (F.near(m.x, m.z, m.r)) F.hurt(10, M); }); }
            F.mark(px, pz, 1.8, 0xFFB03A, 2.1, m => { F.ring(m.x, m.z, 1.8, 0xFF8A2A); if (F.near(m.x, m.z, m.r)) F.hurt(12, M); }); }
          return; }
        // phase 3: him, with a hook; the sea pours into the crater
        if (D.water) { D.water.position.y = Math.min(.9, D.water.position.y + dt * .016); D.water.material.opacity = .55 + Math.sin(t * 2) * .05; if (D.water.position.y > .35 && (D.wt = (D.wt || 0) - dt) <= 0) { D.wt = 1; F.hurt(2.5, null); if (!D.toldW) { D.toldW = 1; F.say('The sea is pouring into the crater. Finish this before it’s over your head!', 3000); } } } },
      end(won){ if (won) { st.f.sal = 1; save(); unBeacon('sal'); scene('sal_out', SCN.sal_out(), () => { giveW('s1_spear'); giveSkin('s1_rig'); setTimeout(() => showCard('SEASON 1 COMPLETE', 'Landfall', `${R.names[1] ? `Season 2 · ${R.names[1]} starts ${s2Date()}.` : 'Season 2 is coming.'}`, 7000), 12500); }); } else lost('sal'); } }
  };
  function toMech(F){
    const D = F.data, S = D.sal; D.ph = 2; D.las = 4; D.mis = 7; S.y = 0; if (D.perch && D.perch.parent) D.perch.parent.remove(D.perch); if (S.av) { S.av.g.position.y = 0; S.av.g.visible = false; }
    const M = D.mech = F.add('mech', S.x + 3, S.z); M.stun = 2.5; F.boss = M; F.shake(.8); F.tone(60, 1.6, 'sawtooth', .07, 30);
    D.jo = [[1.2, 3.4, 0], [-1.2, 3.4, 0], [.7, 1.4, .3], [-.7, 1.4, .3]];
    D.joints = D.jo.map(() => { const u = F.add('ss_joint', M.x, M.z); const old = u.av.g; if (old.parent) old.parent.remove(old); const g = new THREE.Group(); const s = new THREE.Mesh(new THREE.SphereGeometry(.42, 14, 10), new THREE.MeshBasicMaterial({ color: 0xFF5A2A })); g.add(s); g.add(u.tag); u.tag.position.y = .8; F.par().add(g); u.av = { g, hold(){}, anim(t){ s.scale.setScalar(1 + Math.sin(t * 8) * .12); } }; return u; });
    D.jmax = D.joints.reduce((n, u) => n + u.max, 0);
    F.say('“Enough!” He drops into the cockpit of a salvage mech. Phase 2: shoot its four glowing joints.', 3600);
  }
  function toMan(F){
    const D = F.data, S = D.sal, M = D.mech; D.ph = 3; F.ring(M.x, M.z, 4, 0xFF8A2A); F.shake(1); F.tone(50, 2, 'sawtooth', .08, 25);
    S.x = M.x; S.z = M.z; F.kill(M); D.mech = null; if (S.av) S.av.g.visible = true; S.stun = 1.5; F.boss = S; S.hero = 'ssu_sal_blade';
    const w = D.water = new THREE.Mesh(new THREE.CircleGeometry(30, 40), new THREE.MeshBasicMaterial({ color: 0x2A6A8A, transparent: true, opacity: .55, depthWrite: false })); w.rotation.x = -Math.PI / 2; w.position.set(0, -.25, 0); F.par().add(w);
    F.say('The mech splits open and he tumbles out, hook in hand. Phase 3: finish him with your blade!', 3600);
  }
  const s2Date = () => { const d = new Date(R.info().start.getTime() + 28 * 864e5); return d.toLocaleDateString(undefined, { day: 'numeric', month: 'long' }); };
  function lost(k){ armed[k] = false; FIGHT[k].lastCaught = 0; setTimeout(() => R.say('Get your breath back. Walk away and come back to try again.', 3200), 400); if (k === 'hau') ferryBack(); }
  // start one: a scene first (the first time), then the fight
  function startFight(k){
    const o = FIGHT[k]; if (!o || R.busy || SC || CS) return; armed[k] = false;
    if (k === 'amb') giveW('s1_blaster', true); if (k === 'for') { giveW('s1_sword', true); R.equip('s1_sword'); }
    const go = () => { const [px, pz] = R.toMap(R.pos.x, R.pos.z), tg = o.bossAt || [-8, 0], tx = o.at[0] + tg[0], tz = o.at[1] + tg[1]; if (!R.fight(o)) return; R.yaw = Math.atan2(-(tx - px), -(tz - pz)); R.pitch = 0; if (k === 'amb' && !st.toldGun) { st.toldGun = 1; save(); newCard('NEW WEAPON', 'Blaster pistol', 'Washed up with the fragments. Fast, light shots. Yours to keep.'); } if (k === 'for' && !st.toldSword) { st.toldSword = 1; save(); newCard('NEW WEAPON', 'Shard sword', 'The shards in your bag fused into a blade. Yours to keep.'); } };
    if (k === 'for') FIGHT.for.lastCaught = 0;
    R.fightReg(o); if (!st.seen.includes(k + '_in')) scene(k + '_in', SCN[k + '_in'](), go); else go();
  }
  // the scenes themselves
  const SCN = {
    amb_in(){ const [x, z] = AMB, ds = []; return [
      { d: 3.6, start(){ for (let i = 0; i < 5; i++) { const g = scAdd(droneMesh()); ds.push({ g, o: i }); } }, on(f, t){ ds.forEach((q, i) => { q.g.position.set(x - 70 + f * 58 + i * 2, 9 - f * 3 + Math.sin(t * 3 + i) * .6, z + (i - 2) * 5); q.g.rotors.forEach((r, k) => r.rotation.y = t * 30 + k); }); }, cam: () => [x + 6, 1.4, z + 3], look: f => [x - 30 + f * 18, 6, z], name: ['THE SALVAGER’S', 'SCRAPPERS', '“Those fragments are mine. Take them back, boys.”'] },
      { d: 2.6, on(f, t){ ds.forEach((q, i) => { q.g.position.set(x - 12 + f * 3 + i * .6, 6 - f * 2.5, z + (i - 2) * 4); q.g.rotors.forEach((r, k) => r.rotation.y = t * 30 + k); }); }, cam: f => [x - 4 + f, 4.5, z + 6], look: () => [x - 12, 5, z], say: 'They’re diving at you! Get your blaster up.' }]; },
    amb_out(){ const [x, z] = AMB, ds = []; return [
      { d: 4.2, start(){ for (let i = 0; i < 3; i++) { const g = scAdd(droneMesh()); ds.push({ g, x: x - 14 - i * 4, z: z + (i - 1) * 6, y: 7 + i, v: 0 }); } }, on(f, t, dt){ ds.forEach((q, i) => { if (t > .4 + i * .5) { q.v += 14 * dt; q.y -= q.v * dt; q.x -= 8 * dt; q.g.rotation.z += dt * 6; } if (q.y < 0 && !q.sp) { q.sp = 1; for (let k = 0; k < 10; k++) scPuff([q.x, .2, q.z], 0xEAF4FF, 2, 1.2, new THREE.Vector3((Math.random() - .5) * 6, 6 + Math.random() * 6, (Math.random() - .5) * 6), 14); R.tone(90, .4, 'sawtooth', .04, 40); } q.g.visible = q.y > -1; q.g.position.set(q.x, q.y, q.z); }); }, cam: () => [x + 2, 2.2, z + 4], look: () => [x - 22, 2, z], say: 'The last of them spiral into the sea. The beach is yours.' },
      { d: 3, cam: f => [x + 3 - f * 2, 1.7, z + 2], look: () => [x - 1, .4, z - 1], name: ['PART 1', 'AMBUSH BEATEN', 'Something heavy washed up with the drone parts: a wrench as long as your arm.'] }]; },
    hau_in(){ const [x, z] = BARGE, bx = x - 13, a = bossAv('ssb_hau', bx, z, x + 20, z); return [
      { d: 3.4, cam: f => orbit([bx, z], 9 - f * 2, 2.4 + f, .6, 1.9)(f), look: () => [bx, 2.2, z], name: ['THE SALVAGER’S MUSCLE', 'THE HAULER', '“Nobody boards my barge.”'], on(f, t){ a.anim && a.anim(t, 0, 0); } },
      { d: 2.4, cam: f => [bx + 4.2 - f, .6, z + 1.6], look: () => [bx, 3.2, z], say: 'Its front is solid plate. The engine on its back is not.', on(f, t){ a.anim && a.anim(t, 0, 0); } }]; },
    hau_out(){ const [x, z] = BARGE; return [
      { d: 6.5, start(C){ C.b = barge || scAdd(bargeMesh()); }, on(f, t, dt, C){ const g = C.b; g.position.y = -f * 6; g.rotation.z = f * .35; g.rotation.x = Math.sin(t * 1.5) * .02 + f * .08; if (Math.random() < .5) scPuff([x + (Math.random() - .5) * 40, .3, z + (Math.random() - .5) * 14], 0xEAF4FF, 3 + Math.random() * 3, 1.6, new THREE.Vector3(0, 2 + Math.random() * 3, 0), 0); }, cam: f => [x + 30 - f * 4, 5, z + 24], look: () => [x, 1, z], name: ['PART 2', 'THE HAULER IS SCRAP', 'And the Salvager’s barge goes down with it.'] },
      { d: 3.2, cam: f => [x + 26, 3.4 - f, z + 22], look: () => [x, 0, z], say: '📻 The Salvager: “That barge was insured. My buyer isn’t. She pays in ash, and she doesn’t like waiting.”' }]; },
    for_in(){ const [x, z] = FOR, bx = x, bz = z - 8, a = bossAv('ssb_for', bx, bz, x, z + 6), ps = [[-10, -6], [10, -6], [0, 6]].map(([ox, oz]) => { const m = scAdd(new THREE.Mesh(new THREE.OctahedronGeometry(.8, 0), new THREE.MeshBasicMaterial({ color: 0x7CF2FF }))); m.position.set(x + ox, 2.6, z + oz); m.scale.y = 2; return m; }); return [
      { d: 3.2, cam: f => [x + 14 - f * 6, 10 - f * 3, z + 12], look: () => [x, 1, z], on(f, t){ ps.forEach((m, i) => m.rotation.y = t + i); }, say: 'Searchlights sweep the north shore. Crystal pylons hum around a tall figure.' },
      { d: 3.4, cam: f => orbit([bx, bz], 5, 1.9, 1.2, 2)(f), look: () => [bx, 2, bz], on(f, t){ ps.forEach((m, i) => m.rotation.y = t + i); a.anim && a.anim(t, 0, 0); }, name: ['IN CHARGE OF THE DIG', 'THE FOREMAN', 'Every searchlight on the island is wired back to his belt.'] }]; },
    for_out(){ const [x, z] = ISLE_C; return [
      { d: 5, start(){ buildIsle(); let f = 1; const iv = setInterval(() => { f = Math.min(1.7, f + .04); if (isle) isle.flare = f; if (f >= 1.7) clearInterval(iv); }, 50); R.tone(220, 2.4, 'sine', .04, 440); setTimeout(() => { coreBeam(); R.tone(110, 2.6, 'sawtooth', .05, 55); }, 1600); }, cam: f => [x + 12 - f * 2, 2 + f * 2, z + 6], look: f => [x, 2.2 + f * 14, z], name: ['PART 3', 'THE CORE IS LIT', 'The Foreman’s pylons fall dark, and the core answers the shards.'] },
      { d: 3, cam: f => [x + 40, 30 + f * 10, z + 40], look: () => [x, 60, z], on(){ if (isle) isle.flare = 1; } }]; },
    sal_in(){ const [x, z] = FIN, bx = x - 11, a = bossAv('ssb_sal', bx, z, x + 6, z), ds = []; return [
      { d: 3.6, start(){ for (let i = 0; i < 8; i++) ds.push({ g: scAdd(droneMesh()), i }); }, on(f, t){ ds.forEach(q => { const k = q.i / 8 * 6.28 + t * .6; q.g.position.set(bx + Math.cos(k) * (30 - f * 22), 20 - f * 14 + Math.sin(t * 2 + q.i), z + Math.sin(k) * (30 - f * 22)); q.g.rotors.forEach((r, j) => r.rotation.y = t * 30 + j); }); }, cam: f => [x + 30 - f * 8, 14, z + 26], look: () => [bx, 8, z], say: 'The sky over Crash Isle fills with drones. All of them heading for one man.' },
      { d: 3.2, on(f, t){ ds.forEach(q => { const k = q.i / 8 * 6.28 + t * .8; q.g.position.set(bx + Math.cos(k) * 4, 3.4 + Math.sin(t * 3 + q.i) * .4, z + Math.sin(k) * 4); }); a.anim && a.anim(t, 0, 0); }, cam: f => [bx + 6 - f * 2, 1, z + 3 - f], look: () => [bx, 2.4, z], name: ['THE ONE WHO COLLECTS', 'THE SALVAGER', '“Walk away and I’ll pay you more for that core than your family makes in ten years. Last offer.”'] },
      { d: 3.2, on(f, t){ ds.forEach(q => { const k = q.i / 8 * 6.28 + t * .8; q.g.position.set(bx + Math.cos(k) * 4, 3.4, z + Math.sin(k) * 4); }); a.anim && a.anim(t, 0, 0); }, cam: f => [bx + 3, 4.2, z - 2], look: () => [bx + 14, 1.5, z], say: 'You don’t answer. He sighs, like a man who has heard no before. “Swarm.”' }]; },
    sal_out(){ const [x, z] = FIN, bx = x - 6, [cx, cz] = ISLE_C, bits = []; let tear = null, eye = null, wave = null; return [
      { d: 4.4, start(C){ const a = R.heroAv('ssb_sal'); a.g.position.set(bx, 0, z); a.g.rotation.y = -Math.PI / 2; scAdd(a.g); C.sal = a;
          for (let i = 0; i < 16; i++) { const m = scAdd(new THREE.Mesh(new THREE.BoxGeometry(.25 + Math.random() * .3, .2 + Math.random() * .3, .25), new THREE.MeshLambertMaterial({ color: [0xE8B82E, 0x3A3D44, 0x5A5E68][i % 3] }))); m.position.set(bx, 1 + Math.random() * 1.4, z); bits.push({ m, v: new THREE.Vector3((Math.random() - .5) * 5, 2 + Math.random() * 4, (Math.random() - .5) * 5) }); } },
        on(f, t, dt, C){ if (t > 1.2) { C.sal.g.rotation.x = Math.min(1.45, (t - 1.2) * 1.2); C.sal.g.position.y = -Math.min(.6, (t - 1.2) * .4); bits.forEach(q => { q.v.y -= 10 * dt; q.m.position.addScaledVector(q.v, dt); if (q.m.position.y < .1) { q.m.position.y = .1; q.v.multiplyScalar(.4); q.v.y = Math.abs(q.v.y) * .3; } q.m.rotation.x += dt * 4; }); } },
        cam: f => [bx + 4 - f, 1.6, z + 3], look: () => [bx, 1, z], say: 'His rig shakes itself apart, bolt by bolt. The Salvager goes down in a heap of his own scrap.' },
      { d: 4, start(){ if (isle) isle.flare = 2; R.tone(98, 3, 'sine', .06, 196); }, cam: f => [cx + 60, 12 + f * 16, cz + 50], look: f => [cx, 40 + f * 80, cz], say: 'The core’s beam brightens until it hurts to look at…' },
      { d: 5, start(){ const g = new THREE.Group(); g.position.set(cx, 170, cz); scAdd(g); const r = new THREE.Mesh(new THREE.RingGeometry(10, 16, 48), new THREE.MeshBasicMaterial({ color: 0xFF7A2A, transparent: true, opacity: .9, side: THREE.DoubleSide, fog: false, depthWrite: false, blending: THREE.AdditiveBlending })); g.add(r); const d = new THREE.Mesh(new THREE.CircleGeometry(10, 48), new THREE.MeshBasicMaterial({ color: 0x05030A, side: THREE.DoubleSide, fog: false })); g.add(d); g.lookAt(cx + 60, 30, cz + 50); g.scale.setScalar(.05); tear = g;
          eye = scAdd(glowSprite(0x7CF2FF, 4, 0)); eye.position.set(cx + 3, 168, cz + 3); R.tone(40, 4, 'sawtooth', .06, 20); },
        on(f, t){ tear.scale.setScalar(.05 + f * .95); tear.children[0].rotation.z = t * .6; eye.material.opacity = Math.max(0, (t - 2.5) * .5); eye.scale.setScalar(4 + Math.sin(t * 3) * .5); }, cam: () => [cx + 60, 30, cz + 50], look: () => [cx, 160, cz], say: '…and the sky over the island tears open. Something on the other side looks back.' },
      { d: 5.2, start(){ wave = scAdd(new THREE.Mesh(new THREE.BoxGeometry(400, 1, 6), new THREE.MeshBasicMaterial({ color: 0x3A8AB0, transparent: true, opacity: .8 }))); wave.position.set(cx - 260, 0, cz); wave.rotation.y = Math.PI / 2; }, on(f){ wave.scale.y = 1 + f * 24; wave.position.y = f * 12; }, cam: f => [cx + 70, 8, cz + 10], look: () => [cx - 200, 10, cz], say: 'Far out to the west, the sea starts to stand up.', name: ['THE KEEPER', 'THAT WAS A DOOR', '“The meteor was a key, {N}. Something just used it.”'] },
      { d: 4.4, start(){ const ti = cine.querySelector('.s1title'); ti.innerHTML = `<small>SEASON 2</small><b>${esc((R.names[1] || 'Coming soon').toUpperCase())}</b>`; ti.classList.add('on'); }, on(f, t){ if (t > 3.6) cine.querySelector('.s1title').classList.remove('on'); }, cam: f => [cx + 90, 20, cz + 60], look: () => [cx - 100, 20, cz], say: `Season 2 starts ${s2Date()}.` }]; }
  };
  // after the Foreman: the core story beat (it used to start when you walked up with the shards)
  function coreTalk(){
    st.c3.done = 1; save(); R.DRV.lock = true; document.body.classList.add('cine'); talking = true;
    R.dlgPlay([['The Keeper', 'It isn’t a rock, {N}. It never was.'], ['The Keeper', 'It’s a key. And keys are made to open things.'], ['ME', 'Open what?'], ['The Keeper', 'Look up.']], { block: true, done: () => {
      R.dlgPlay([['📻 The Salvager', 'Thank you, Traveller. You found my prize, and you lit it up so nicely.'], ['📻 The Salvager', 'I’ll be along to collect it. Don’t get up.']], { block: true, done: () => {
        talking = false; document.body.classList.remove('cine'); R.DRV.lock = false; R.tone(98, 1.8, 'square', .04, 90); const d4 = 22 - R.info().day;
        showCard('PART 3 COMPLETE', 'Crash Isle', d4 > 0 ? `The core is lit, and the Salvager is coming. Part 4 unlocks in ${d4} day${d4 > 1 ? 's' : ''}.` : 'The core is lit, and the Salvager is coming. Find him on the east side of Crash Isle.', 6000); } }); } });
  }
  // the barge: you can stand on its deck, take the ferry out to it, and watch it sink
  let sunk = false; const onBarge = (mx, mz) => !!barge && !sunk && Math.abs(mx - BARGE[0]) < 23.5 && Math.abs(mz - BARGE[1]) < 8.5;
  function goBarge(){ R.fade(() => { buildBarge(); const [lx, lz] = R.toLocal(BARGE[0] + 20, BARGE[1]); R.pos.x = lx; R.pos.z = lz; R.pos.y = 1.6; R.yaw = Math.PI / 2; R.pitch = 0; R.say('The Salvager’s barge. Something big is moving at the far end of the deck.', 4200); }, '#0B0D14'); }
  function sinkBarge(){ sunk = true; if (barge && barge.parent) barge.parent.remove(barge); barge = null; R.ISLE.stops = R.ISLE.stops.filter(q => q.k !== 'barge'); }
  // each frame: beacons, and walking up to a fight starts it
  function fightStep(mx, mz, free){
    const wk = week(), avail = {
      amb: st.ch1 && !st.f.amb, hau: st.c2.done && wk >= 2 && !st.f.hau, for: st.c3.got.length >= 3 && wk >= 3 && !st.f.for, sal: st.c3.done && st.f.for && wk >= 4 && !st.f.sal };
    if (avail.hau) { buildBarge(); if (!R.ISLE.stops.some(q => q.k === 'barge')) R.ISLE.stops.push({ k: 'barge', n: 'The Salvager’s barge', where: 'anchored off the west beach', go: goBarge }); }
    const where = { amb: AMB, hau: BARGE, for: FOR, sal: FIN }, label = { amb: 'SCRAPPERS', hau: 'THE HAULER', for: 'THE FOREMAN', sal: 'THE SALVAGER' };
    Object.keys(where).forEach(k => { if (!avail[k]) { unBeacon(k); return; } if ((k === 'for' || k === 'sal') && !isle) return; const b = beacon(k, where[k], label[k], k === 'sal' ? 0xFF3A2A : 0xFF7A2A); if (b) b.visible = !R.busy;
      const d = Math.hypot(mx - where[k][0], mz - where[k][1]), r = k === 'hau' ? 15 : 12; if (d > r + 8) armed[k] = true; if (armed[k] !== false && free && d < r) startFight(k); });
  }
  // ---------- the Season 1 trailer: every beat of the season in about 45 seconds ----------
  function trailer(){
    const [cx, cz] = ISLE_C, [bx, bz] = BARGE, title = (small, big) => { const ti = cine.querySelector('.s1title'); ti.innerHTML = `<small>${esc(small)}</small><b>${esc(big)}</b>`; ti.classList.add('on'); }, untitle = () => cine.querySelector('.s1title').classList.remove('on');
    const beat = (f = 55) => { R.tone(f, .6, 'sine', .09, f * .5); R.tone(f * 2, .15, 'square', .02, f); };
    buildIsle(); FIGHT_IDS.forEach(k => R.fightReg(FIGHT[k]));
    let met = null, ds = [], tint = cine.querySelector('.s1tint');
    return [
      { d: 3.2, start(C){ const bg = barge; if (isle) isle.g.visible = false; if (bg) bg.visible = false; C.onEnd = () => { if (isle) isle.g.visible = true; if (bg) bg.visible = true; }; title('A SEASON ON RAYANUPADHYAY.COM', 'IT STARTED WITH A LIGHT'); tint.style.opacity = '1'; R.tone(1200, 3, 'sawtooth', .01, 90); met = scAdd(new THREE.Group()); met.add(glowSprite(0xFFE2A0, 14, 1), glowSprite(0xFF7A2A, 30, .55)); },
        on(f){ met.position.set(260 - f * 560, 220 - f * 150, -100 + f * 160); if (Math.random() < .6) scPuff([met.position.x, met.position.y, met.position.z], 0xFF9A4A, 8, 1); }, cam: f => [-20, 4 + f * 26, 8], look: f => [met ? met.position.x : 0, met ? met.position.y : 100, met ? met.position.z : 0] },
      { d: 3, start(){ untitle(); met.position.set(cx + 60, 200, cz - 50); }, on(f, t){ const k = Math.min(1, t / 1.8); met.position.set(cx + 60 - k * 60, 200 - k * 200, cz - 50 + k * 50); if (k < 1) scPuff([met.position.x, met.position.y, met.position.z], 0xFFB060, 9, .8); else if (!this.hit) { this.hit = 1; met.visible = false; const el = black(); el.style.transition = 'none'; el.style.background = '#FFF6E8'; el.style.opacity = '1'; requestAnimationFrame(() => requestAnimationFrame(() => { el.style.transition = 'opacity 1.2s'; el.style.opacity = '0'; setTimeout(() => el.style.background = '#000', 1300); })); R.tone(40, 2.6, 'sawtooth', .1, 20); for (let i = 0; i < 30; i++) { const a = Math.random() * 6.28; scPuff([cx, 2, cz], 0xEAF4FF, 5, 2.2, new THREE.Vector3(Math.cos(a) * 12, 20 + Math.random() * 25, Math.sin(a) * 12), 24); } } },
        cam: () => [-402, 1.3, 60], look: () => [cx, 18, cz] },
      { d: 3.4, start(){ if (isle) isle.g.visible = true; tint.style.opacity = '0'; title('NOW THERE’S LAND', 'WHERE THERE WASN’T'); beat(); }, cam: f => [cx + 70 - f * 30, 30 - f * 12, cz + 60 - f * 20], look: () => [cx, 4, cz] },
      { d: 3.6, start(C){ untitle(); const k = keeperMesh(); if (k) { k.g.position.set(R.ISLE.px1 + 1.5, 0, R.ISLE.pz); k.g.rotation.y = -Math.PI / 2; scAdd(k.g); } }, cam: f => [R.ISLE.px1 + 5 - f, 1.7, R.ISLE.pz + .6], look: () => [R.ISLE.px1 + 1.5, 1.6, R.ISLE.pz], name: ['THE KEEPER', 'SOMEONE IS WATCHING', '“Things fall into it. Things climb out of it.”'] },
      { d: 3.2, start(){ ds = []; for (let i = 0; i < 7; i++) ds.push(scAdd(droneMesh())); beat(70); }, on(f, t){ ds.forEach((g, i) => { g.position.set(AMB[0] - 40 + f * 34 + i * 2, 8 + Math.sin(t * 3 + i), AMB[1] + (i - 3) * 4); g.rotors.forEach((r, k) => r.rotation.y = t * 30 + k); }); }, cam: () => [AMB[0] + 6, 1.3, AMB[1] + 2], look: f => [AMB[0] - 20 + f * 10, 7, AMB[1]], name: ['PART 1', 'SCRAPPERS ON THE BEACH', ''] },
      { d: 3.2, start(C){ C.b = scAdd(bargeMesh()); const a = R.heroAv('ssb_hau'); a.g.position.set(bx - 13, 0, bz); a.g.rotation.y = -Math.PI / 2; scAdd(a.g); C.h = a; beat(60); }, on(f, t, dt, C){ C.h.anim && C.h.anim(t, 0, 0); }, cam: f => orbit([bx - 13, bz], 8, 2.6, .5, 1.6)(f), look: () => [bx - 13, 2.4, bz], name: ['PART 2', 'THE HAULER', '“Nobody boards my barge.”'] },
      { d: 3.2, start(C){ const a = R.heroAv('ssb_for'); a.g.position.set(FOR[0], 0, FOR[1] - 8); scAdd(a.g); C.f = a; C.ps = [[-10, -6], [10, -6], [0, 6]].map(([ox, oz]) => { const m = scAdd(new THREE.Mesh(new THREE.OctahedronGeometry(.8, 0), new THREE.MeshBasicMaterial({ color: 0x7CF2FF }))); m.position.set(FOR[0] + ox, 2.6, FOR[1] + oz); m.scale.y = 2; return m; }); beat(65); },
        on(f, t, dt, C){ C.ps.forEach((m, i) => m.rotation.y = t + i); C.f.anim && C.f.anim(t, 0, 0); }, cam: f => [FOR[0] + 3.5 - f * 1.2, 1.3 + f * .8, FOR[1] - 3.5], look: () => [FOR[0], 2, FOR[1] - 8], name: ['PART 3', 'THE FOREMAN', '“Lights on. Nobody touches the core.”'] },
      { d: 2.4, start(){ title('6 WEAPONS TO EARN', 'BLASTERS · BLADES · A HARPOON'); beat(80); }, cam: f => [cx + 36 - f * 4, 9 + f * 3, cz + 30], look: () => [cx, 8, cz] },
      { d: 2.4, start(){ title('3 SKINS TO KEEP', 'CRATER SCOUT · METEOR GLOW · SALVAGER’S RIG'); beat(90); }, cam: f => [cx - 34 + f * 4, 11, cz + 32 - f * 6], look: () => [cx, 8, cz] },
      { d: 4, start(C){ untitle(); const a = R.heroAv('ssb_sal'); a.g.position.set(FIN[0] - 11, 0, FIN[1]); a.g.rotation.y = -Math.PI / 2; scAdd(a.g); C.s = a; ds = []; for (let i = 0; i < 8; i++) ds.push(scAdd(droneMesh())); R.tone(45, 3.5, 'sawtooth', .08, 30); },
        on(f, t, dt, C){ C.s.anim && C.s.anim(t, 0, 0); ds.forEach((g, i) => { const k = i / 8 * 6.28 + t * .8; g.position.set(FIN[0] - 11 + Math.cos(k) * 4, 3.4 + Math.sin(t * 3 + i) * .4, FIN[1] + Math.sin(k) * 4); }); }, cam: f => [FIN[0] - 5 - f * 2, .9, FIN[1] + 2.4], look: () => [FIN[0] - 11, 2.4, FIN[1]], name: ['PART 4 · 9 DECEMBER', 'THE SALVAGER', '“Everything that falls is mine.”'] },
      { d: 2.6, start(C){ const m = R.heroAv('ssu_sal_mech'); m.g.position.set(FIN[0] - 4, 0, FIN[1]); m.g.rotation.y = -Math.PI / 2; scAdd(m.g); C.m = m; R.tone(38, 2.4, 'sawtooth', .1, 25); }, on(f, t, dt, C){ C.m.g.position.y = -3 + Math.min(1, f * 1.6) * 3; }, cam: () => [FIN[0] + 3, .5, FIN[1] + 1.5], look: () => [FIN[0] - 4, 5, FIN[1]], say: 'And he didn’t come alone.' },
      { d: 5.5, start(){ title('SEASON 1', 'LANDFALL'); tint.style.opacity = '1'; R.tone(110, 4, 'sine', .06, 220); R.tone(55, 4, 'sawtooth', .04, 55); }, on(f, t){ if (t > 4.6) untitle(); }, cam: f => [cx + 90 - f * 20, 25 + f * 10, cz + 70 - f * 10], look: () => [cx, 10, cz] },
      { d: 3.2, start(){ tint.style.opacity = '0'; title('NOW PLAYING · 18 NOV – 15 DEC', 'STEP OUTSIDE'); }, cam: f => [-20, 2 + f * 40, 8], look: () => [-300, 10, 40] }
    ];
  }
  const FIGHT_IDS = ['amb', 'hau', 'for', 'sal'];
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
    if (SC) { if (!inB || R.busy) { scEnd(true); return; } scStep(dt); return; }
    if (!inB) { streetT = 0; scanBtn.hidden = true; dockBtn.hidden = true; Object.values(fightBeacons).forEach(g => g.visible = false); return; }
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
    dockBtn.hidden = !(free && (isle && Math.hypot(mx - DOCK[0], mz - DOCK[1]) < 6 || onBarge(mx, mz) && mx > BARGE[0] + 16));
    if (!R.busy) fightStep(mx, mz, free); else Object.values(fightBeacons).forEach(g => g.visible = false); if (barge && barge.lamp) barge.lamp.material.opacity = Math.sin(now / 250) > 0 ? .95 : .15;
    if (st.c3.done && !R.ars.skins.includes('s1_scout')) giveSkin('s1_scout');
    scanBtn.hidden = !(st.scanner && free && (frags && frags.some(Boolean) || c2 && c2.some(f => f.g || f.d) || c3 && !st.c3.done));
    if (free) fragStep(); if (!R.busy) c2Step(dt);
  }
  // ---------- the Season tab on the phone ----------
  function tab(){
    const S = R.info(), fd = new Date(S.start.getTime()), unlock = i => { const d = new Date(fd.getTime() + i * 7 * 864e5); return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' }); };
    const wk = week(), rows = CH.map(([n, sub], i) => { const open = wk > i, done = i === 0 && st.ch1 || i === 1 && st.c2.done || i === 2 && st.c3.done || i === 3 && st.f.sal, cur = open && !done && (i === 0 || i === 1 && st.ch1 || i === 2 && st.c2.done || i === 3 && st.c3.done);
      return `<div class="phcard"><b>${done ? '✓ ' : ''}Part ${i + 1}: ${n}</b><small>${!open ? `Unlocks ${unlock(i)}.` : i === 0 ? (done ? 'Done.' : !st.intro ? 'Step out onto the street.' : !st.met ? 'Go to the ferry pier on the west coast.' : `Find the fragments: ${st.frags.length} of ${FRAGS.length}.`) : i === 1 ? (!st.ch1 ? 'Finish Part 1 first.' : done ? `Done: you kept ${st.c2.got.length} of 4.` : !st.c2.start ? 'Go out onto the street.' : `Beat the drones to the fragments: ${st.c2.got.length} kept, ${st.c2.lost.length} lost.`) : i === 2 ? (!st.c2.done ? 'Finish Part 2 first.' : done ? 'Done: the core is lit.' : !st.c3.start ? 'Go out onto the street.' : st.c3.got.length < 3 ? `Take the ferry to Crash Isle and find the shards: ${st.c3.got.length} of 3.` : !st.f.for ? 'Beat the Foreman on the north shore of Crash Isle.' : 'Take the shards to the core in the crater.') : i === 3 ? (!st.c3.done ? 'Finish Part 3 first.' : st.f.sal ? 'Done: the Salvager is beaten.' : 'Face the Salvager on the east side of Crash Isle.') : ''}</small>${cur ? `<small>${esc(sub)}</small>` : ''}</div>`; }).join('');
    return `<div class="phcard"><b>Season 1 · Landfall</b><small>Day ${S.day} of 28 · ${S.left} day${S.left === 1 ? '' : 's'} left. A meteor came down off the west coast.</small><div class="phrow"><button type="button" data-s1="video">▶ Watch the Season 1 trailer</button></div></div>${rows}
      <div class="phcard"><b>Boss fights</b>${FIGHTS_LIST.map(([k, n, how]) => `<small>${st.f[k] ? '✓' : '·'} ${n}: ${st.f[k] ? 'beaten' : how}</small>`).join('')}${st.f.for ? `<small>${st.f.forClean ? '✓' : '·'} Challenge: beat the Foreman without being spotted</small>` : ''}</div>
      ${st.intro ? `<div class="phcard"><b>Scenes</b><small>Watch them again (out on the street).</small><div class="phrow"><button type="button" data-s1-scene="trailer">▶ In-game trailer</button><button type="button" data-s1="replay">▶ Landfall</button>${SCENE_LIST.filter(([id]) => st.seen.includes(id)).map(([id, n]) => `<button type="button" data-s1-scene="${id}">▶ ${n}</button>`).join('')}</div></div>` : ''}
      <div class="phcard"><b>Tools</b><small>${st.scanner ? '✓ Scanner (yours to keep)' : 'Scanner: not yet'}</small></div>
      <div class="phcard" data-s1n><b>Your name: ${esc(R.heroName())}</b><div class="phrow"><button type="button" data-s1="name">Change it</button></div></div>`;
  }
  const FIGHTS_LIST = [['amb', 'Scrapper ambush', 'on the west beach, after Part 1'], ['hau', 'The Hauler', 'on the Salvager’s barge, after Part 2 (take the ferry)'], ['for', 'The Foreman', 'on Crash Isle, once you have the three shards'], ['sal', 'The Salvager', 'on Crash Isle, in Part 4']];
  const SCENE_LIST = [['amb_in', 'Scrappers'], ['amb_out', 'Ambush beaten'], ['hau_in', 'The Hauler'], ['hau_out', 'The barge sinks'], ['for_in', 'The Foreman'], ['for_out', 'The core'], ['sal_in', 'The Salvager'], ['sal_out', 'Finale']];
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  function wire(B){ B.querySelectorAll('[data-s1-scene]').forEach(b => b.onclick = () => { if (!(R.inWorld && R.zone === 'blr') || R.busy || R.DRV.on || R.DRV.lock || R.BL.lvl || !R.onGround()) return R.say('Go out onto the street to watch it again.', 2400); const id = b.dataset.s1Scene; if (id !== 'trailer') R.fightReg(FIGHT[id.split('_')[0]]); R.phoneClose(); setTimeout(() => scene(id, id === 'trailer' ? trailer() : SCN[id]()), 300); });
    const tv = B.querySelector('[data-s1="video"]'); if (tv) tv.onclick = () => { R.phoneClose(); if (R.video) R.video('seasons/s01-trailer.mp4'); };
    const rp = B.querySelector('[data-s1="replay"]'); if (rp) rp.onclick = () => { if (!(R.inWorld && R.zone === 'blr') || R.busy || R.DRV.on || R.DRV.lock || R.BL.lvl || !R.onGround()) return R.say('Go out onto the street to watch it again.', 2400); R.phoneClose(); setTimeout(() => csStart(true), 300); };
    const b = B.querySelector('[data-s1="name"]'); if (b) b.onclick = () => { const v = prompt('Your name (up to 16 characters):', R.heroName() === 'Traveller' ? '' : R.heroName()); if (v == null) return; if (v.trim() && !R.cleanName(v)) return R.say('Pick a different name.', 2000); R.setName(v); B.querySelector('[data-s1n] b').textContent = 'Your name: ' + R.heroName(); }; }
  // after the season: only what it left on the map. Crash Isle with its lit core, and its ferry stop
  if (opts && opts.past) return { step(dt, now){
    const inB = R.inWorld && R.zone === 'blr'; if (inB && R.BLC.built) { buildIsle(); coreBeam(); addStop(); }
    if (isle) isleStep(dt, now / 1000); if (!inB) { dockBtn.hidden = true; return; }
    const [mx, mz] = R.toMap(R.pos.x, R.pos.z), free = !R.busy && !R.DRV.on && !R.DRV.lock && !R.BL.cine && !R.BL.lvl && R.onGround();
    dockBtn.hidden = !(free && isle && Math.hypot(mx - DOCK[0], mz - DOCK[1]) < 6); } };
  return { step, tab, wire, debug: { get cs(){ return CS; }, st, scan, get c2(){ return c2; }, get c3(){ return c3; }, goIsle, FIGHT, startFight, scene, SCN, get SC(){ return SC; }, fightStep, trailer: () => scene('trailer', trailer()) } };
};
