// Season 2 · High Water
// A wave pours through the tear and drowns Bangalore. Loaded by index.html only while Season 2 runs (and again afterwards with
// { past: true }, when it only builds what the season left on the map). Everything it needs comes in through the API object R
// (seasonApi in index.html); the flooded city itself is R.flood. Progress lives in ru-season under "s2".
window.RU_SEASON_2 = function(R, opts){
  const THREE = R.THREE, V = (x, y, z) => new THREE.Vector3(x, y, z), LEVEL = 7, TEAR = [-540, 170, 75];
  const all = R.get(); const st = all.s2 = Object.assign({ open: 0, raft: 0, boat: 0, camp: 0, harpoon: 0, saved: [], ch1: 0, bites: 0, f: {}, seen: [], drained: 0 }, all.s2 || {});
  if (!Array.isArray(st.saved)) st.saved = []; if (!Array.isArray(st.seen)) st.seen = []; st.f = st.f || {};
  const save = () => { const a = R.get(); a.s2 = st; R.put(a); };
  const week = () => { try { const q = location.search.match(/[?&]week=(\d)/); if (q) return +q[1]; } catch (e) {} return R.info().week; };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const ease = k => k * k * (3 - 2 * k), lerp3 = (a, b, f) => [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
  const M = (c, o) => new THREE.MeshLambertMaterial(Object.assign({ color: c }, o || {}));
  const glow = (col, size, op = 1) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: R.flakeTex(), color: col, transparent: true, opacity: op, depthWrite: false, fog: false, blending: THREE.AdditiveBlending })); s.scale.setScalar(size); s.userData.noPick = true; return s; };
  const mapNow = () => R.toMap(R.pos.x, R.pos.z);

  // ---------- UI: a title card, hearts, the harpoon button, a scene overlay ----------
  const css = document.createElement('style'); css.textContent = `
.s2card{position:fixed;left:50%;top:30%;transform:translate(-50%,-50%) scale(.96);z-index:60;background:rgba(8,20,32,.92);color:#fff;border:1px solid rgba(60,176,232,.55);border-radius:16px;padding:16px 26px;text-align:center;opacity:0;pointer-events:none;transition:opacity .5s,transform .5s;max-width:calc(100% - 32px);font:600 13px/1.4 system-ui,sans-serif}
.s2card.on{opacity:1;transform:translate(-50%,-50%) scale(1)}.s2card small{display:block;letter-spacing:.14em;color:#6FD0FF;font-weight:800}.s2card b{display:block;font:800 26px/1.2 system-ui,sans-serif;margin:4px 0}.s2card span{color:rgba(255,255,255,.82)}
.s2hearts{position:fixed;left:50%;top:calc(14px + env(safe-area-inset-top,0px));transform:translateX(-50%);z-index:40;font:20px/1 system-ui;letter-spacing:2px;pointer-events:none;text-shadow:0 1px 4px rgba(0,0,0,.5)}
.s2breath{position:fixed;left:50%;top:calc(44px + env(safe-area-inset-top,0px));transform:translateX(-50%);width:140px;height:8px;border-radius:4px;background:rgba(0,0,0,.45);z-index:40;overflow:hidden;pointer-events:none}.s2breath i{display:block;height:100%;background:#6FD0FF}
.s2harp{position:fixed;right:calc(18px + env(safe-area-inset-right,0px));bottom:calc(150px + env(safe-area-inset-bottom,0px));z-index:40;width:82px;height:82px;border-radius:50%;border:0;background:#3CB0E8;color:#08141F;font:800 13px system-ui,sans-serif;box-shadow:0 6px 20px rgba(0,0,0,.4);touch-action:none}
.s2harp:disabled{opacity:.5}
.s2cine{position:fixed;inset:0;pointer-events:none;z-index:54;display:none}body.s2cs .s2cine{display:block}
body.s2cs::before,body.s2cs::after{content:"";position:fixed;left:0;right:0;height:9vh;background:#000;z-index:55}body.s2cs::before{top:0}body.s2cs::after{bottom:0}
.s2black{position:absolute;inset:0;background:#000;opacity:0;transition:opacity .5s}.s2flash{position:absolute;inset:0;background:#EAF6FF;opacity:0}
.s2title{position:absolute;left:0;right:0;top:38%;text-align:center;color:#fff;opacity:0;transition:opacity 1s;text-shadow:0 2px 24px rgba(0,0,0,.6)}.s2title.on{opacity:1}
.s2title small{display:block;font:800 14px system-ui,sans-serif;letter-spacing:.5em;color:#6FD0FF}.s2title b{display:block;font:900 clamp(40px,9vw,92px)/1.05 system-ui,sans-serif;letter-spacing:.12em}
.s2bn{position:absolute;left:calc(4vw + env(safe-area-inset-left,0px));bottom:18vh;max-width:min(560px,calc(100% - 32px));padding:12px 20px 14px;border-radius:10px;background:linear-gradient(90deg,rgba(4,12,20,.66),rgba(4,12,20,0));color:#fff;opacity:0;transition:opacity .5s}.s2bn.on{opacity:1}
.s2bn small{display:block;font:800 12px system-ui;letter-spacing:.32em;color:#6FD0FF}.s2bn b{display:block;font:900 clamp(30px,7vw,58px)/1 system-ui;margin:6px 0 8px;border-left:6px solid #3CB0E8;padding-left:12px}.s2bn span{font:600 italic 16px/1.4 system-ui;color:rgba(255,255,255,.9)}
.s2skip{position:fixed;right:16px;bottom:calc(11vh + 12px);z-index:61;background:rgba(255,255,255,.14);color:#fff;border:1px solid rgba(255,255,255,.35);border-radius:999px;padding:8px 16px;font:700 13px system-ui,sans-serif;cursor:pointer}
body.s2cs button:not(.s2skip),body.s2cs .placecard,body.s2cs .s2hearts,body.s2cs .s2breath{visibility:hidden!important}`;
  document.head.appendChild(css);
  const el = (cls, html, parent = document.body, tag = 'div') => { const e = document.createElement(tag); e.className = cls; if (html) e.innerHTML = html; parent.appendChild(e); return e; };
  const card = el('s2card'), hearts = el('s2hearts'), breath = el('s2breath', '<i></i>'), cine = el('s2cine', '<div class="s2black"></div><div class="s2flash"></div><div class="s2title"></div><div class="s2bn"></div>');
  const harpBtn = el('s2harp', 'Harpoon', document.body, 'button'), skipBtn = el('s2skip', 'Skip scene ▸▸', document.body, 'button');
  harpBtn.type = skipBtn.type = 'button'; hearts.hidden = breath.hidden = harpBtn.hidden = skipBtn.hidden = true;
  function showCard(small, big, sub, ms = 4200){ card.innerHTML = `<small>${small}</small><b>${big}</b>${sub ? `<span>${sub}</span>` : ''}`; card.classList.add('on'); clearTimeout(showCard.t); showCard.t = setTimeout(() => card.classList.remove('on'), ms); }

  // ---------- scenes with their own camera (same idea as Season 1's) ----------
  let SC = null; const PEND = [];
  const aimAt = (c, l) => { const [lx, lz] = R.toLocal(c[0], c[2]); R.pos.x = lx; R.pos.z = lz; R.pos.y = c[1]; const dx = l[0] - c[0], dy = l[1] - c[1], dz = l[2] - c[2]; R.yaw = Math.atan2(-dx, -dz); R.pitch = Math.atan2(dy, Math.hypot(dx, dz)); };
  function scAdd(o){ R.BL.mapG.add(o); (SC ? SC.objs : PEND).push(o); o.traverse(q => q.userData.noPick = true); return o; }
  function scene(id, shots, done){
    if (SC) return false; const [mx, mz] = mapNow(); SC = { id, shots, i: -1, t: 0, done, from: { map: [mx, mz], y: R.pos.y, yaw: R.yaw, pitch: R.pitch, tpv: R.tpv }, objs: PEND.splice(0), shake: 0 };
    R.tpv = false; R.DRV.lock = true; R.closePanel(); document.body.classList.add('cine', 's2cs'); skipBtn.hidden = false; if (!st.seen.includes(id)) { st.seen.push(id); save(); } scNext(); return true;
  }
  function scNext(){
    const C = SC; C.i++; C.t = 0; cine.querySelector('.s2bn').classList.remove('on'); if (C.i >= C.shots.length) return scEnd(false); const s = C.shots[C.i];
    if (s.start) { try { s.start(C); } catch (e) { console.error(e); } }
    if (s.name) { const bn = cine.querySelector('.s2bn'); bn.innerHTML = `<small>${esc(s.name[0])}</small><b>${esc(s.name[1])}</b>${s.name[2] ? `<span>${esc(s.name[2].replace(/\{N\}/g, R.heroName()))}</span>` : ''}`; setTimeout(() => { if (SC === C) bn.classList.add('on'); }, 400); }
    if (s.say) setTimeout(() => { if (SC === C) R.say(s.say.replace(/\{N\}/g, R.heroName()), Math.max(1800, s.d * 1000 - 500)); }, 200);
  }
  function scStep(dt){
    const C = SC, s = C.shots[C.i]; C.t += dt; const f = ease(Math.min(1, C.t / s.d));
    if (s.on) { try { s.on(f, C.t, dt, C); } catch (e) { console.error(e); } } if (SC !== C) return;
    const j = () => (Math.random() - .5) * C.shake; C.shake = Math.max(0, C.shake - dt * .8);
    const c = s.cam(f, C.t), l = s.look(f, C.t); aimAt([c[0] + j(), c[1] + j(), c[2] + j()], l);
    if (C.t >= s.d) scNext();
  }
  function scEnd(skipped){
    if (!SC) return; const C = SC; SC = null; C.objs.forEach(o => { if (o.parent) o.parent.remove(o); });
    document.body.classList.remove('cine', 's2cs'); cine.querySelector('.s2bn').classList.remove('on'); cine.querySelector('.s2title').classList.remove('on'); cine.querySelector('.s2black').style.opacity = '0'; skipBtn.hidden = true;
    const [lx, lz] = R.toLocal(C.from.map[0], C.from.map[1]); R.pos.x = lx; R.pos.z = lz; R.pos.y = C.from.y; R.yaw = C.from.yaw; R.pitch = C.from.pitch; R.tpv = C.from.tpv; R.DRV.lock = false;
    if (C.done) setTimeout(() => { try { C.done(skipped); } catch (e) { console.error(e); } }, 60);
  }
  skipBtn.addEventListener('click', e => { e.stopPropagation(); scEnd(true); });
  addEventListener('keydown', e => { if (SC && e.key === 'Escape') scEnd(true); });
  const title = (small, big) => { const t = cine.querySelector('.s2title'); t.innerHTML = `<small>${esc(small)}</small><b>${esc(big)}</b>`; t.classList.add('on'); };
  const flashW = () => { const f = cine.querySelector('.s2flash'); f.style.transition = 'none'; f.style.opacity = '1'; requestAnimationFrame(() => requestAnimationFrame(() => { f.style.transition = 'opacity 1.2s'; f.style.opacity = '0'; })); };

  // ---------- places, picked from the city as it's built this time ----------
  let P = null;
  function places(){
    if (P || !R.BL.bld || !R.BL.bld.length) return P; const B = R.BL.bld.filter(b => !b.hide), near = (p, f) => B.filter(f).sort((a, b) => Math.hypot((a.x0 + a.x1) / 2 - p[0], (a.z0 + a.z1) / 2 - p[1]) - Math.hypot((b.x0 + b.x1) / 2 - p[0], (b.z0 + b.z1) / 2 - p[1]))[0];
    const west = B.filter(b => b.x0 < -300 && b.h > 18).sort((a, b) => b.h - a.h)[0], tower = west || near([-330, 20], b => b.h > 14) || B[0];
    const camp = near([-200, 70], b => b.h > LEVEL + 3 && b.h < 20 && b !== tower) || tower;
    const ctr = b => [(b.x0 + b.x1) / 2, (b.z0 + b.z1) / 2];
    // a spot of open water just off a building's side
    const waterBy = (b, side) => { const [cx, cz] = ctr(b); const s = side || [0, 1]; for (let k = 5; k < 40; k += 1.5) { const x = cx + s[0] * ((b.x1 - b.x0) / 2 + k), z = cz + s[1] * ((b.z1 - b.z0) / 2 + k), [lx, lz] = R.toLocal(x, z); if (R.flood.state.on ? R.blrValid(lx, lz) : true) return [x, z]; } return [cx + s[0] * 30, cz + s[1] * 30]; };
    P = { tower, camp, ctr, waterBy };
    return P;
  }

  // ---------- hearts, knockouts, sharks and the harpoon ----------
  let hp = 5, hurtT = 0;
  function drawHearts(){ hearts.textContent = '❤️'.repeat(Math.max(0, hp)) + '🤍'.repeat(Math.max(0, 5 - hp)); }
  function bite(n, why){ if (hurtT > 0 || SC) return; hurtT = 1.2; hp -= n; st.bites++; save(); drawHearts(); R.tone(140, .3, 'sawtooth', .06, 70); document.body.classList.add('pain'); setTimeout(() => document.body.classList.remove('pain'), 300); R.say(why || 'A shark bites! Get out of the water or drive it off with the harpoon.', 2200); if (hp <= 0) knockout(); }
  function knockout(){
    R.fade(() => { hp = 5; drawHearts(); if (R.DRV.on) R.getOut(true); const [mx, mz] = mapNow(), Pl = places(); let best = Pl && st.camp ? Pl.camp : null, bd = 1e9;
      if (!best) R.BL.bld.forEach(b => { if (b.hide || b.h < LEVEL + .5 || b.h > LEVEL + 9) return; const d = Math.hypot((b.x0 + b.x1) / 2 - mx, (b.z0 + b.z1) / 2 - mz); if (d < bd) { bd = d; best = b; } });
      if (best) R.flood.put(best); sharks.forEach(s => { s.mode = 'patrol'; s.t = 6; }); }, '#06121C');
    setTimeout(() => R.say('You come round on a rooftop, coughing up seawater. Someone pulled you out.', 4000), 900);
  }
  const sharks = [];
  function sharkMesh(big){
    const g = new THREE.Group(), grey = M(big ? 0x4A5560 : 0x6A7680), belly = M(0xD8DEE4);
    const body = new THREE.Mesh(new THREE.SphereGeometry(.55, 12, 8), grey); body.scale.set(1, .7, 3.1); g.add(body);
    const b2 = new THREE.Mesh(new THREE.SphereGeometry(.5, 10, 6), belly); b2.scale.set(.9, .45, 2.6); b2.position.y = -.18; g.add(b2);
    const fin = new THREE.Mesh(new THREE.ConeGeometry(.32, .9, 4), grey); fin.scale.z = .25; fin.position.set(0, .7, -.2); fin.rotation.x = -.3; g.add(fin);
    const tail = new THREE.Mesh(new THREE.ConeGeometry(.35, .9, 4), grey); tail.scale.x = .25; tail.rotation.x = -Math.PI / 2; tail.position.z = -2; g.add(tail); g.tail = tail;
    [-.32, .32].forEach(x => { const e = new THREE.Mesh(new THREE.SphereGeometry(.05, 6, 4), M(0x08090B)); e.position.set(x, .15, 1.2); g.add(e); });
    g.scale.setScalar(big ? 2.6 : 1); g.traverse(o => o.userData.noPick = true); return g;
  }
  function addShark(x, z, big){ const g = sharkMesh(big); R.BL.mapG.add(g); const s = { g, x, z, h: Math.random() * 6.28, mode: 'patrol', t: 2 + Math.random() * 4, hp: big ? 8 : 2, big: !!big, home: [x, z], v: 0 }; sharks.push(s); return s; }
  function dropShark(s){ if (s.g.parent) s.g.parent.remove(s.g); sharks.splice(sharks.indexOf(s), 1); }
  function sharkStep(s, dt, t, mx, mz){
    const inWater = R.flood.state.swim && !R.DRV.on, inBoat = R.DRV.on, dx = mx - s.x, dz = mz - s.z, d = Math.hypot(dx, dz), sp = s.big ? 7 : 5;
    const steer = (tx, tz, speed) => { const want = Math.atan2(tx - s.x, tz - s.z); let da = want - s.h; da = Math.atan2(Math.sin(da), Math.cos(da)); s.h += Math.max(-2.2 * dt, Math.min(2.2 * dt, da)); const nx = s.x + Math.sin(s.h) * speed * dt, nz = s.z + Math.cos(s.h) * speed * dt, [lx, lz] = R.toLocal(nx, nz); if (R.blrValid(lx, lz) || R.DRV.on) { s.x = nx; s.z = nz; } else s.h += 1.4 * dt * 3; };
    s.t -= dt;
    if (s.mode === 'flee') { steer(s.x - dx, s.z - dz, sp * 1.3); if (s.t <= 0) s.mode = 'patrol'; }
    else if (s.mode === 'patrol') { if (s.t <= 0 || Math.hypot(s.tx - s.x, s.tz - s.z) < 2 || s.tx == null) { s.t = 4 + Math.random() * 4; const a = Math.random() * 6.28, r = 6 + Math.random() * 18; s.tx = s.home[0] + Math.cos(a) * r; s.tz = s.home[1] + Math.sin(a) * r; } steer(s.tx, s.tz, sp * .45); if ((inWater || inBoat && s.big) && d < (s.big ? 40 : 24)) { s.mode = 'circle'; s.t = 2.5 + Math.random() * 2; s.a = Math.atan2(s.x - mx, s.z - mz); } }
    else if (s.mode === 'circle') { if (!(inWater || inBoat && s.big) || d > 45) { s.mode = 'patrol'; s.t = 3; return; } s.a += dt * (s.big ? .55 : .8); const r = s.big ? 12 : 6.5; steer(mx + Math.sin(s.a) * r, mz + Math.cos(s.a) * r, sp * .9);
      if (s.t <= 0) { s.mode = 'tell'; s.t = .9; s.lx = mx; s.lz = mz; ripple(s.x, s.z, s.big ? 3 : 1.6); R.tone(s.big ? 70 : 110, .7, 'sawtooth', .03, 50); } }
    else if (s.mode === 'tell') { s.h = Math.atan2(s.lx - s.x, s.lz - s.z); s.g.position.y = LEVEL - .2 + Math.sin(t * 30) * .05; if (s.t <= 0) { s.mode = 'lunge'; s.t = s.big ? 1.1 : .8; } }
    else if (s.mode === 'lunge') { const k = s.big ? 20 : 15; s.x += Math.sin(s.h) * k * dt; s.z += Math.cos(s.h) * k * dt;
      if (Math.hypot(mx - s.x, mz - s.z) < (s.big ? 3.4 : 1.7)) { s.mode = 'flee'; s.t = 2.5; if (inWater) bite(s.big ? 2 : 1); else if (inBoat) { bite(1, s.big ? 'The great shark rams the boat! You’re thrown against the side.' : 'A shark bumps the boat.'); } }
      if (s.t <= 0) { s.mode = 'circle'; s.t = 2 + Math.random() * 2; } }
    s.g.position.set(s.x, LEVEL - (s.mode === 'tell' ? .2 : .55), s.z); s.g.rotation.y = s.h; if (s.g.tail) s.g.tail.rotation.y = Math.sin(t * (s.mode === 'lunge' ? 18 : 6)) * .4;
  }
  const ripples = [];
  function ripple(x, z, r){ const m = new THREE.Mesh(new THREE.RingGeometry(.85, 1, 32), new THREE.MeshBasicMaterial({ color: 0xFFFFFF, transparent: true, opacity: .8, side: THREE.DoubleSide, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.position.set(x, LEVEL + .05, z); m.userData.noPick = true; R.BL.mapG.add(m); ripples.push({ m, t: 0, r }); }
  // the harpoon gun: aim with the camera, F or the button
  const harps = []; let harpCd = 0;
  function fire(){
    if (!st.harpoon || harpCd > 0 || SC || R.busy) return; harpCd = 1.1; R.tone(320, .15, 'square', .05, 140); const [mx, mz] = mapNow(), y = R.pos.y - .15, cp = Math.cos(R.pitch);
    const v = V(-Math.sin(R.yaw) * cp, Math.sin(R.pitch), -Math.cos(R.yaw) * cp), m = new THREE.Mesh(new THREE.CylinderGeometry(.03, .03, 1.2, 6), M(0xC9CFD8)); m.quaternion.setFromUnitVectors(V(0, 1, 0), v); m.position.set(mx, y, mz); m.userData.noPick = true; R.BL.mapG.add(m);
    harps.push({ m, p: V(mx + v.x * .6, y + v.y * .6, mz + v.z * .6), v: v.multiplyScalar(46), t: .9 }); harpBtn.disabled = true; setTimeout(() => harpBtn.disabled = false, 1100);
  }
  harpBtn.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); fire(); });
  addEventListener('keydown', e => { if (e.repeat || /INPUT|SELECT|TEXTAREA/.test(e.target.tagName) || harpBtn.hidden) return; if (e.key.toLowerCase() === 'f') fire(); });
  function harpStep(dt){
    harpCd = Math.max(0, harpCd - dt);
    for (let i = harps.length - 1; i >= 0; i--) { const H = harps[i]; H.t -= dt; H.p.addScaledVector(H.v, dt); H.m.position.copy(H.p);
      const hit = sharks.find(s => Math.hypot(s.x - H.p.x, s.z - H.p.z) < (s.big ? 3 : 1.4) && Math.abs(H.p.y - (LEVEL - .5)) < (s.big ? 2.6 : 1.4));
      if (hit) { H.t = 0; hit.hp--; ripple(hit.x, hit.z, 1.2); R.tone(900, .08, 'square', .04, 500); if (hit.hp <= 0) { sharkDown(hit); } else { hit.mode = 'flee'; hit.t = hit.big ? 1.5 : 5; R.say(hit.big ? `A hit! The great shark thrashes (${hit.hp} more).` : 'A hit! The shark peels away.', 1400); } }
      if (H.t <= 0 || H.p.y < .5) { if (H.m.parent) H.m.parent.remove(H.m); harps.splice(i, 1); } }
  }
  function sharkDown(s){ ripple(s.x, s.z, s.big ? 5 : 2); if (s.big) return bossDown(s); R.say('The shark rolls over and sinks out of sight.', 1800); let k = 0; const iv = setInterval(() => { k += .05; s.g.position.y -= .2; s.g.rotation.z = k * 3; if (k >= 1) { clearInterval(iv); dropShark(s); } }, 50); s.mode = 'dead'; }
  // keep a handful of sharks around you while you're in the open water
  function sharkCrowd(mx, mz){
    const want = st.boss1 ? 0 : st.ch1 ? 3 : 4, live = sharks.filter(s => !s.big && s.mode !== 'dead');
    live.forEach(s => { if (Math.hypot(s.x - mx, s.z - mz) > 120) dropShark(s); });
    if (live.length < want && Math.random() < .02) { for (let k = 0; k < 10; k++) { const a = Math.random() * 6.28, r = 35 + Math.random() * 30, x = mx + Math.cos(a) * r, z = mz + Math.sin(a) * r, [lx, lz] = R.toLocal(x, z); if (R.blrValid(lx, lz)) { addShark(x, z); break; } } }
  }

  // ---------- Chapter 1 · Adrift: the billboard boat, the rooftop camp, three rescues and the great shark ----------
  let raft = null, boat = null, bill = null, campG = null, strand = [], aboard = [];
  function park(type, col, x, z, h, name){ const v = R.makeVehicle(type, col, R.BLC.carG); Object.assign(v, { x, z, y: LEVEL - (type === 'raft' ? .05 : .3), h, name, parked: true, fx: Math.sin(h), fz: Math.cos(h) }); v.g.position.set(x, v.y, z); v.g.rotation.y = h; R.BLC.parked.push(v); return v; }
  function buildBill(){ if (bill || st.boat) return; const [x, z] = start(); let bx = x - 22, bz = z + 8; for (let k = 0; k < 12; k++) { const [lx, lz] = R.toLocal(bx, bz); if (R.blrValid(lx, lz)) break; bz += 6; } const g = bill = new THREE.Group(); g.position.set(bx, 0, bz); R.BL.mapG.add(g);
    [-2.2, 2.2].forEach(o => { const p = new THREE.Mesh(new THREE.BoxGeometry(.3, 13, .3), M(0x5A5E68)); p.position.set(o, 6.5, 0); g.add(p); });
    const board = new THREE.Mesh(new THREE.BoxGeometry(6, 3, .2), new THREE.MeshBasicMaterial({ map: R.tex(512, 256, (c, w, h) => { c.fillStyle = '#E8B82E'; c.fillRect(0, 0, w, h); c.fillStyle = '#16181D'; c.font = '900 64px system-ui'; c.textAlign = 'center'; c.fillText('BOAT CLUB', w / 2, 110); c.font = '700 34px system-ui'; c.fillText('Lake rides · Sundays', w / 2, 170); }) })); board.position.y = 11; g.add(board);
    const b = R.makeVehicle('boat', 0xC8462E, g); b.g.position.set(0, 12.9, .6); b.g.rotation.set(.25, .4, .1); g.boat = b.g; g.traverse(o => o.userData.noPick = true); bill.spot = [bx, bz]; }
  function dropBoat(){ const g = bill; if (!g || g.dropping) return; g.dropping = { k: 0 }; R.tone(300, .4, 'sawtooth', .04, 120); R.say('The boat tears loose from the billboard and smacks into the water!', 2600); }
  function dropStep(dt){ const g = bill; if (!g || !g.dropping || g.dropped) return; const D = g.dropping; D.k = Math.min(1, D.k + dt); g.boat.position.y = 12.9 - (12.9 - (LEVEL - .3)) * D.k * D.k; g.boat.rotation.x = .25 * (1 - D.k);
    if (D.k < 1) return; g.dropped = 1; const [bx, bz] = g.spot; g.remove(g.boat); boat = park('boat', 0xC8462E, bx + 1, bz + 3, 0, 'the Boat Club’s boat'); st.boat = 1; save(); ripple(bx + 1, bz + 3, 4);
    showCard('YOURS NOW', 'The boat', `${R.fine ? 'Press E' : 'Tap Get in'} next to it. It goes anywhere there’s water.`, 4600); R.PH.wp = places().waterBy(places().camp, [0, 1]); }
  function buildCamp(){
    if (campG || !places()) return; const Pl = places(), b = Pl.camp, [cx, cz] = Pl.ctr(b), g = campG = new THREE.Group(); g.position.set(cx, b.h, cz); R.BL.mapG.add(g);
    const W = b.x1 - b.x0, D = b.z1 - b.z0;
    [[-.25, -.25, 0x3C7CFF], [.25, -.2, 0xE8B82E], [-.2, .25, 0x5E9A3A]].forEach(([fx, fz, c]) => { const t = new THREE.Mesh(new THREE.ConeGeometry(1.1, 1.4, 4), M(c)); t.position.set(fx * W, .7, fz * D); t.rotation.y = .7; g.add(t); });
    const fire = new THREE.Mesh(new THREE.CylinderGeometry(.35, .35, .8, 10), M(0x3A3D44)); fire.position.set(.2 * W, .4, .2 * D); g.add(fire); const fl = glow(0xFF8A3A, 1.6, .9); fl.position.set(.2 * W, 1.1, .2 * D); g.add(fl);
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(3.4, .8), new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, map: R.tex(512, 120, (c, w, h) => { c.fillStyle = '#F4F1E8'; c.fillRect(0, 0, w, h); c.fillStyle = '#C8102E'; c.font = '900 56px system-ui'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('SURVIVORS · SAFE ROOF', w / 2, h / 2); }) })); sign.position.set(0, 1.4, D / 2 - .2); g.add(sign);
    g.people = [0, 1, 2, 3].map(i => { let a; try { a = R.avatar(R.crowdLook(30 + i)); } catch (e) { return null; } a.g.position.set((i - 1.5) * 1.3, 0, -.1 * D); g.add(a.g); return a; }).filter(Boolean);
    // a ladder down the south side to the water
    const lad = new THREE.Group(); lad.position.set(0, -b.h + LEVEL - .5, D / 2 + .15); g.add(lad); [-.35, .35].forEach(x => { const r = new THREE.Mesh(new THREE.BoxGeometry(.08, b.h - LEVEL + 1.6, .08), M(0x8A6A4A)); r.position.set(x, (b.h - LEVEL + 1.6) / 2, 0); lad.add(r); }); for (let y = .3; y < b.h - LEVEL + 1.4; y += .4) { const r = new THREE.Mesh(new THREE.BoxGeometry(.7, .06, .06), M(0x8A6A4A)); r.position.y = y; lad.add(r); }
    g.traverse(o => o.userData.noPick = true); R.flood.ladder(cx, b.z1 + 1.2, b); g.lad = [cx, b.z1 + 1.2];
  }
  // people stranded on floating wreckage: steer the boat close and they climb in
  function buildStrand(){ if (strand.length || st.saved.length >= 3) return; const Pl = places(), [cx, cz] = Pl.ctr(Pl.camp);
    [[55, 30], [-40, 60], [20, -70]].forEach(([ox, oz], i) => { if (st.saved.includes(i)) return; let x = cx + ox, z = cz + oz; for (let k = 0; k < 20; k++) { const [lx, lz] = R.toLocal(x, z); if (R.blrValid(lx, lz)) break; x += 4; }
      const g = new THREE.Group(); g.position.set(x, LEVEL, z); R.BL.mapG.add(g); const deb = new THREE.Mesh(new THREE.BoxGeometry(2.2, .3, 1.6), M([0x8A6A4A, 0xC8462E, 0x5A5E68][i])); g.add(deb);
      let a = null; try { a = R.avatar(R.crowdLook(40 + i)); a.g.position.y = .15; g.add(a.g); if (a.arms && a.arms[1]) a.arms[1].a.rotation.x = -2.6; } catch (e) {}
      const flag = glow(0xFFE070, 1.4, .8); flag.position.y = 2.4; g.add(flag); g.traverse(o => o.userData.noPick = true); strand.push({ i, g, a, x, z }); }); }
  function campTalk(){
    st.camp = 1; save(); R.DRV.lock = true; document.body.classList.add('cine');
    R.dlgPlay([['Bhaskar', 'You came off the river in that? Brave or daft. Either way, welcome to the roof.'], ['Bhaskar', 'We’ve got water, a fire and a radio that only plays static. And sharks. So many sharks.'], ['ME', 'Sharks? In Bangalore?'], ['Bhaskar', 'They came through with the wave. Here: my son’s harpoon gun from the boat club. Better in your hands than his.'], ['Bhaskar', 'There are three more people out there on the wreckage. Bring them home, {N}.']], { block: true, done: () => {
      document.body.classList.remove('cine'); R.DRV.lock = false; st.harpoon = 1; save(); R.tone(660, .2, 'triangle', .05); setTimeout(() => R.tone(990, .3, 'triangle', .05), 150);
      showCard('NEW TOOL', 'Harpoon gun', `${R.fine ? 'Press F' : 'Tap Harpoon'} to fire where you’re looking. One hit drives a shark off, two sink it. Yours to keep.`, 6000); buildStrand(); } });
  }
  // the great shark: it hunts you across the open water on the way back with the last survivors
  let boss = null;
  function bossStart(){ if (boss || st.boss1) return; const [mx, mz] = mapNow(); sharks.slice().forEach(s => { if (!s.big) { s.mode = 'flee'; s.t = 8; } }); boss = addShark(mx - 40, mz - 30, true); boss.home = [mx, mz];
    scene('shark_in', [{ d: 3.6, start(C){ C.shake = .4; R.tone(48, 3, 'sawtooth', .07, 30); }, cam: f => { const [x, z] = [boss.x + 14, boss.z + 10]; return [x, LEVEL + 2.4 - f, z]; }, look: () => [boss.x, LEVEL, boss.z], name: ['SOMETHING BIGGER', 'THE GREAT SHARK', 'The others just scattered. That fin is the size of a door.'] }], () => R.say('Harpoon it whenever it surfaces. Watch for the ripple ring: that’s it charging.', 4200)); }
  function bossDown(s){ s.mode = 'dead'; boss = null; st.boss1 = 1; st.ch1 = 1; save();
    scene('shark_out', [{ d: 4, on(f){ s.g.position.y = LEVEL - .6 - f * 6; s.g.rotation.z = f * 2.4; }, cam: () => [s.x + 10, LEVEL + 3, s.z + 8], look: () => [s.x, LEVEL - 1, s.z], say: 'The great shark rolls over and slides down into the drowned streets.' },
      { d: 4.4, start(){ title('CHAPTER 1 COMPLETE', 'ADRIFT'); }, cam: f => { const [cx, cz] = places().ctr(places().camp); return [cx + 26, places().camp.h + 6 + f * 3, cz + 22]; }, look: () => { const [cx, cz] = places().ctr(places().camp); return [cx, places().camp.h + 1, cz]; }, say: '📻 …static… *“This is Captain Brine. Every roof in this harbour pays a toll now.”*' }],
      () => { dropShark(s); if (st.bites === 0 && R.skin('s2_captain')) setTimeout(() => showCard('NEW SKIN', 'Canal Captain', 'You finished Chapter 1 without a single bite. Wear it from the Wardrobe.', 5600), 800); const d2 = 8 - R.info().day; showCard('CHAPTER 1 COMPLETE', 'Adrift', d2 > 0 ? `Chapter 2 unlocks in ${d2} day${d2 > 1 ? 's' : ''}.` : 'Chapter 2 is on its way.', 6000); }); }

  // ---------- the cold open ----------
  function coldOpen(){
    const Pl = places(); if (!Pl) return; const b = Pl.tower, [cx, cz] = Pl.ctr(b), wy = Math.min(b.h - 2, 30), win = [b.x0 - .3, wy, cz], sea = [-560, 30, cz], wave = { x: -640, h: 0 };
    let ring = null, wall = null, shards = [];
    scene('open', [
      { d: 4.2, start(C){ cine.querySelector('.s2black').style.opacity = '0'; ring = scAdd(new THREE.Mesh(new THREE.RingGeometry(10, 15, 48), new THREE.MeshBasicMaterial({ color: 0xFF7A2A, transparent: true, opacity: .85, side: THREE.DoubleSide, fog: false, depthWrite: false }))); ring.position.set(TEAR[0], TEAR[1], TEAR[2]); ring.lookAt(win[0], win[1], win[2]); },
        cam: f => [win[0] + 1.6 - f * 1.3, win[1], win[2] + .4], look: () => [-480, 60, cz], say: 'A few days after Landfall. You’re visiting a friend, high up, trying not to think about the sky.' },
      { d: 3.6, start(){ R.tone(60, 3.4, 'sawtooth', .05, 30); wall = scAdd(new THREE.Mesh(new THREE.BoxGeometry(14, 1, 900), M(0x2E7A9A, { transparent: true, opacity: .92 }))); wall.position.set(wave.x, 0, cz); }, on(f){ ring.scale.setScalar(1 + f * 2.2); wave.h = f * 40; wall.scale.y = wave.h; wall.position.y = wave.h / 2; },
        cam: () => [win[0] - .2, win[1], win[2]], look: f => [TEAR[0], 60 + (1 - f) * 70, TEAR[2]], say: 'The tear splits wide open. And the sea comes through it.' },
      { d: 3.4, start(C){ C.shake = .2; }, on(f, t, dt, C){ wave.x = -640 + f * (win[0] + 640 - 8); wall.position.x = wave.x; C.shake = .2 + f * 1.4; if (f > .9 && !C.hit) { C.hit = 1; flashW(); R.tone(40, 2.4, 'sawtooth', .1, 20); R.tone(1800, .6, 'square', .03, 300); R.flood.set(LEVEL); for (let i = 0; i < 26; i++) { const s = scAdd(new THREE.Mesh(new THREE.PlaneGeometry(.3 + Math.random() * .4, .3 + Math.random() * .5), new THREE.MeshBasicMaterial({ color: 0xDDEEFF, transparent: true, opacity: .7, side: THREE.DoubleSide }))); s.position.set(win[0] - .4, win[1] + (Math.random() - .5) * 2, win[2] + (Math.random() - .5) * 3); shards.push({ s, v: V(1 + Math.random() * 6, (Math.random() - .3) * 4, (Math.random() - .5) * 6) }); } } shards.forEach(q => { q.s.position.addScaledVector(q.v, dt); q.s.rotation.x += dt * 6; }); },
        cam: () => [win[0] + .2, win[1], win[2]], look: () => [-480, 25, cz], say: 'It’s coming straight at the building.' },
      { d: 2.6, start(){ if (wall) wall.visible = false; }, on(f, t, dt, C){ C.shake = .3; shards.forEach(q => { q.v.y -= 9 * dt; q.s.position.addScaledVector(q.v, dt); }); if (f > .7) cine.querySelector('.s2black').style.opacity = '1'; },
        cam: f => [win[0] - 2 - f * 6, win[1] - f * f * (win[1] - LEVEL - 1), win[2]], look: f => [win[0] - 2 - f * 6 - Math.cos(f * 7), win[1] - 6 + Math.sin(f * 7) * 10, win[2] + Math.sin(f * 5) * 6], say: 'The window bursts.' },
      { d: 4.6, start(){ setTimeout(() => { if (SC) cine.querySelector('.s2black').style.opacity = '0'; }, 1600); setTimeout(() => { if (SC) title('SEASON 2 · CHAPTER 1', 'HIGH WATER'); }, 2200); }, cam: f => { const [x, z] = start(); return [x, LEVEL + .9, z]; }, look: f => { const [x, z] = start(); return [x + 30, LEVEL + 3 + f * 2, z - 10 + f * 20]; }, say: '…You wake up on a wooden plank. Bangalore is gone. There’s only water, and the tops of the towers.' }
    ], () => { st.open = 1; save(); R.flood.set(LEVEL); const [x, z] = start(); const [lx, lz] = R.toLocal(x, z); R.pos.x = lx; R.pos.z = lz; buildBill(); const bs = bill ? bill.spot : [x - 20, z], hd = Math.atan2(bs[0] - x, bs[1] - z); R.yaw = hd + Math.PI; raft = park('raft', 0, x, z, hd, 'your plank'); st.raft = 1; save(); R.getIn(raft);
      setTimeout(() => showCard('CHAPTER 1', 'Adrift', `Paddle your plank (${R.fine ? 'W/S, A/D' : 'the stick'}). Something big and red is hanging off a billboard just ahead.`, 6500), 600); R.PH.wp = bill ? bill.spot.slice() : null; });
  }
  const start = () => { const Pl = places(); return Pl.waterBy(Pl.tower, [-1, 0]); };

  // ---------- each frame ----------
  let ready = false, inited = false, opening = false;
  function step(dt, now){
    const t = now / 1000, inB = R.inWorld && R.zone === 'blr';
    if (SC) { if (!inB || R.busy) { scEnd(true); return; } scStep(dt); return; }
    const flooded = st.open && !st.drained;
    hearts.hidden = breath.hidden = !(inB && flooded); harpBtn.hidden = !(inB && flooded && st.harpoon) || R.fine;
    if (!inB || !R.BLC.built) return; if (!places()) return;
    if (flooded && !R.flood.state.on) R.flood.set(LEVEL);
    // the first time you're out in the city during Season 2, the wave hits
    if (!st.open) { if (!opening && !R.DRV.on && !R.BL.lvl && (ready = ready || R.onGround())) { opening = true; coldOpen(); } return; }
    if (!flooded) return;
    if (!inited) { inited = true; drawHearts(); buildBill(); buildCamp(); if (st.boat) { const [x, z] = places().waterBy(places().camp, [0, 1]); boat = park('boat', 0xC8462E, x + 3, z + 2, 0, 'your boat'); } if (st.harpoon) buildStrand(); if (!st.boat && bill) R.PH.wp = bill.spot.slice(); }
    hurtT = Math.max(0, hurtT - dt); breath.firstChild.style.width = (R.flood.state.breath * 100) + '%'; breath.hidden = !R.flood.state.under && R.flood.state.breath > .99;
    const [mx, mz] = mapNow();
    // billboard boat, the camp, the rescues
    if (bill && !st.boat && Math.hypot(mx - bill.spot[0], mz - bill.spot[1]) < 9) dropBoat(); dropStep(dt);
    if (campG) { campG.people.forEach((a, i) => { try { a.anim(t + i, 0, 0); } catch (e) {} }); if (!st.camp && R.flood.state.roof === places().camp) campTalk(); }
    if (st.camp && !st.boss1 && R.DRV.on && R.DRV.p && R.DRV.p.type === 'boat') {
      strand.slice().forEach(S => { if (Math.hypot(S.x - mx, S.z - mz) < 6) { strand.splice(strand.indexOf(S), 1); if (S.g.parent) S.g.parent.remove(S.g); aboard.push(S.i); R.tone(880, .15, 'triangle', .05); R.say(`“Thank you! I thought nobody was coming.” (${aboard.length} aboard)`, 2400); } });
      if (aboard.length && Math.hypot(mx - campG.lad[0], mz - campG.lad[1]) < 10) { aboard.forEach(i => st.saved.push(i)); aboard = []; save(); R.tone(660, .3, 'triangle', .05); R.say(`They scramble up the ladder to the roof. ${st.saved.length} of 3 rescued.`, 3000); }
      if (st.saved.length >= 3 && !boss) bossStart(); }
    // sharks and the harpoon
    sharkCrowd(mx, mz); sharks.slice().forEach(s => { if (s.mode !== 'dead') sharkStep(s, dt, t, mx, mz); }); harpStep(dt);
    for (let i = ripples.length - 1; i >= 0; i--) { const q = ripples[i]; q.t += dt; q.m.scale.setScalar(q.r * (1 + q.t * 2)); q.m.material.opacity = Math.max(0, .8 - q.t); if (q.t > .8) { R.BL.mapG.remove(q.m); ripples.splice(i, 1); } }
  }
  R.flood.state.onBreath = () => bite(1, 'Out of breath! You choke on seawater and kick for the surface.');

  // ---------- the Season tab ----------
  function tab(){
    const S = R.info(), fd = new Date(S.start.getTime()), unlock = i => new Date(fd.getTime() + i * 7 * 864e5).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }), wk = week();
    const CH = [['Adrift', st.ch1 ? 'Done.' : !st.open ? 'Go out into the city.' : !st.boat ? 'Paddle to the boat on the billboard.' : !st.camp ? 'Find the survivors’ roof and climb the ladder.' : st.saved.length < 3 ? `Rescue the people on the wreckage: ${st.saved.length} of 3.` : 'Survive the great shark.'], ['Brine’s Harbour', 'Coming soon.'], ['The Deep', 'Coming soon.'], ['High Water', 'Coming soon.']];
    return `<div class="phcard"><b>Season 2 · High Water</b><small>Day ${S.day} of 28 · ${S.left} day${S.left === 1 ? '' : 's'} left. A wave came through the tear and drowned the city.</small></div>`
      + CH.map(([n, sub], i) => `<div class="phcard"><b>${i === 0 && st.ch1 ? '✓ ' : ''}Chapter ${i + 1}: ${n}</b><small>${wk > i ? esc(sub) : `Unlocks ${unlock(i)}.`}</small></div>`).join('')
      + `<div class="phcard"><b>Tools</b><small>${st.boat ? '✓ The boat' : 'Boat: not yet'} · ${st.harpoon ? '✓ Harpoon gun' : 'Harpoon gun: not yet'}</small></div>`;
  }
  function wire(){}
  if (opts && opts.past) return { step(){} };
  return { step, tab, wire, debug: { st, get SC(){ return SC; }, places: () => places(), sharks, fire, get boss(){ return boss; }, get bill(){ return bill; }, get strand(){ return strand; }, harps, addShark: (x, z, big) => addShark(x, z, big), coldOpen, dropBoat: () => dropBoat() } };
};
