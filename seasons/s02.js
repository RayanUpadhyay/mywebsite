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
    if (!SC) return; const C = SC; SC = null; C.objs.forEach(o => { if (o.parent) o.parent.remove(o); }); if (C.onEnd) { try { C.onEnd(); } catch (e) { console.error(e); } }
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
    // the friend's highrise: a tall building near the west coast with nothing tall between its window and the sea
    const clear = b => { const cz = (b.z0 + b.z1) / 2, wy = Math.min(b.h - 2, 30); return !B.some(o => o !== b && o.x1 <= b.x0 + .5 && o.x1 > -405 && o.z1 > cz - 8 && o.z0 < cz + 8 && o.h > wy - 6); };
    const west = B.filter(b => b.x0 < -280 && b.h > 16).sort((a, b) => b.h - a.h), tower = west.find(clear) || west[0] || near([-330, 20], b => b.h > 14) || B[0];
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
    s.g.position.set(s.x, s.deep ? s.yy = Math.max(1.4, Math.min(LEVEL - 1, (s.yy || 3) + (R.pos.y - 1 - (s.yy || 3)) * dt)) : LEVEL - (s.mode === 'tell' ? .2 : .55), s.z); s.g.rotation.y = s.h; if (s.g.tail) s.g.tail.rotation.y = Math.sin(t * (s.mode === 'lunge' ? 18 : 6)) * .4;
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
    for (let i = harps.length - 1; i >= 0; i--) { const H = harps[i]; H.t -= dt; H.p.addScaledVector(H.v, dt); H.m.position.copy(H.p); if (harpExtra(H)) H.t = 0;
      const hit = sharks.find(s => Math.hypot(s.x - H.p.x, s.z - H.p.z) < (s.big ? 3 : 1.4) && Math.abs(H.p.y - s.g.position.y) < (s.big ? 2.6 : 1.4));
      if (hit) { H.t = 0; hit.hp--; ripple(hit.x, hit.z, 1.2); R.tone(900, .08, 'square', .04, 500); if (hit.hp <= 0) { sharkDown(hit); } else { hit.mode = 'flee'; hit.t = hit.big ? 1.5 : 5; R.say(hit.big ? `A hit! The great shark thrashes (${hit.hp} more).` : 'A hit! The shark peels away.', 1400); } }
      if (H.t <= 0 || H.p.y < .5) { if (H.m.parent) H.m.parent.remove(H.m); harps.splice(i, 1); } }
  }
  function sharkDown(s){ ripple(s.x, s.z, s.big ? 5 : 2); if (s === iron) return ironDown(s); if (s.big) return bossDown(s); R.say('The shark rolls over and sinks out of sight.', 1800); let k = 0; const iv = setInterval(() => { k += .05; s.g.position.y -= .2; s.g.rotation.z = k * 3; if (k >= 1) { clearInterval(iv); dropShark(s); } }, 50); s.mode = 'dead'; }
  // keep a handful of sharks around you while you're in the open water
  function sharkCrowd(mx, mz){
    const want = st.boss1 ? 0 : st.ch1 ? 3 : 4, live = sharks.filter(s => !s.big && s.mode !== 'dead');
    live.forEach(s => { if (Math.hypot(s.x - mx, s.z - mz) > 120) dropShark(s); });
    if (live.length < want && Math.random() < .02) { for (let k = 0; k < 10; k++) { const a = Math.random() * 6.28, r = 35 + Math.random() * 30, x = mx + Math.cos(a) * r, z = mz + Math.sin(a) * r, [lx, lz] = R.toLocal(x, z); if (R.blrValid(lx, lz)) { addShark(x, z); break; } } }
  }

  // ---------- Part 1 · Adrift: the billboard boat, the rooftop camp, three rescues and the great shark ----------
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
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(3.4, .8), new THREE.MeshBasicMaterial({ map: R.tex(512, 120, (c, w, h) => { c.fillStyle = '#F4F1E8'; c.fillRect(0, 0, w, h); c.fillStyle = '#C8102E'; c.font = '900 56px system-ui'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('SURVIVORS · SAFE ROOF', w / 2, h / 2); }) })); sign.position.set(0, 1.4, D / 2 - .2); g.add(sign);
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
      { d: 4.4, start(){ title('PART 1 COMPLETE', 'ADRIFT'); }, cam: f => { const [cx, cz] = places().ctr(places().camp); return [cx + 26, places().camp.h + 6 + f * 3, cz + 22]; }, look: () => { const [cx, cz] = places().ctr(places().camp); return [cx, places().camp.h + 1, cz]; }, say: '📻 …static… *“This is Captain Brine. Every roof in this harbour pays a toll now.”*' }],
      () => { dropShark(s); if (st.bites === 0 && R.skin('s2_captain')) setTimeout(() => showCard('NEW SKIN', 'Canal Captain', 'You finished Part 1 without a single bite. Wear it from the Wardrobe.', 5600), 800); const d2 = 8 - R.info().day; showCard('PART 1 COMPLETE', 'Adrift', d2 > 0 ? `Part 2 unlocks in ${d2} day${d2 > 1 ? 's' : ''}.` : 'Part 2 is on its way.', 6000); }); }

  // ---------- Part 2 · Brine's Harbour: raiders took the camp's supplies; catch their boats, then his first mate ----------
  st.c2 = Object.assign({ start: 0, crates: 0, done: 0 }, st.c2 || {}); st.c3 = Object.assign({ start: 0, valves: [], done: 0 }, st.c3 || {}); st.c4 = Object.assign({ start: 0, done: 0 }, st.c4 || {});
  const raiders = [], crates = [], splashes = []; let mate = null;
  function raiderMesh(big){ const g = new THREE.Group(), b = R.makeVehicle('boat', big ? 0x16181D : 0x5A1E1E, g); b.g.scale.setScalar(big ? 1.9 : 1);
    const flag = new THREE.Mesh(new THREE.PlaneGeometry(.9, .6), new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, map: R.tex(128, 86, (c, w, h) => { c.fillStyle = '#16181D'; c.fillRect(0, 0, w, h); c.fillStyle = '#F4F1E8'; c.font = '900 52px system-ui'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('☠', w / 2, h / 2 + 2); }) })); flag.position.set(0, big ? 4.6 : 2.6, -1); const pole = new THREE.Mesh(new THREE.BoxGeometry(.06, big ? 3.4 : 1.8, .06), M(0x3A3D44)); pole.position.set(-.45, big ? 3.2 : 1.8, -1); g.add(flag, pole);
    for (let i = 0; i < (big ? 3 : 1); i++) { try { const a = R.avatar(R.crowdLook(70 + i)); a.g.scale.setScalar(.9); a.g.position.set((i - 1) * .7, big ? 1.4 : .6, -.6 - i * .4); g.add(a.g); } catch (e) {} }
    g.traverse(o => o.userData.noPick = true); R.BL.mapG.add(g); return g; }
  function addRaider(x, z, big){ const r = { g: raiderMesh(big), x, z, h: Math.random() * 6.28, hp: big ? 7 : 3, big: !!big, t: 2, mode: big ? 'circle' : 'run', a: 0, gun: 3 }; raiders.push(r); return r; }
  function splash(x, z, r, dmg, why){ ripple(x, z, r); splashes.push({ x, z, r, t: 1.25, dmg, why }); R.tone(500, .5, 'sine', .02, 200); }
  function raiderStep(r, dt, t, mx, mz){
    const d = Math.hypot(mx - r.x, mz - r.z), sp = r.big ? 6.5 : 8.5, go = (tx, tz, k) => { const want = Math.atan2(tx - r.x, tz - r.z); let da = Math.atan2(Math.sin(want - r.h), Math.cos(want - r.h)); r.h += Math.max(-1.6 * dt, Math.min(1.6 * dt, da)); const nx = r.x + Math.sin(r.h) * k * dt, nz = r.z + Math.cos(r.h) * k * dt, [lx, lz] = R.toLocal(nx, nz); if (R.blrValid(lx, lz)) { r.x = nx; r.z = nz; } else r.h += 2 * dt; };
    if (r.mode === 'stopped') { r.g.rotation.z = Math.sin(t * 2) * .05; }
    else if (r.mode === 'run') { if (d < 40) go(r.x - (mx - r.x) + Math.sin(t + r.x) * 20, r.z - (mz - r.z) + Math.cos(t + r.z) * 20, sp * (d < 15 ? 1 : .6)); else go(r.x + Math.sin(t * .3 + r.z) * 30, r.z + Math.cos(t * .3 + r.x) * 30, sp * .4);
      if ((r.gun -= dt) <= 0 && d < 30) { r.gun = 3.5 + Math.random() * 2; splash(mx + (Math.random() - .5) * 3, mz + (Math.random() - .5) * 3, 2.2, 1, 'A raider’s bottle bomb splashes over you!'); } }
    else if (r.mode === 'circle') { r.a += dt * .4; go(mx + Math.sin(r.a) * 16, mz + Math.cos(r.a) * 16, sp);
      if ((r.gun -= dt) <= 0) { r.gun = 3.2; [[0, 0], [3, 2], [-3, 2], [2, -3]].forEach(([ox, oz], i) => setTimeout(() => { if (mate) splash(mx + ox, mz + oz, 2.4, 1, 'Cannonball! The deck gun finds you.'); }, i * 220)); R.tone(70, .5, 'sawtooth', .05, 40); }
      if ((r.t -= dt) <= 0) { r.t = 7; r.mode = 'ram'; r.rt = 1.4; ripple(r.x, r.z, 3); R.say('The first mate’s boat turns straight at you!', 1600); } }
    else if (r.mode === 'ram') { r.rt -= dt; go(mx, mz, sp * 2.1); if (d < 4) { r.mode = 'circle'; bite(1, 'The raider boat rams you!'); } if (r.rt <= 0) r.mode = 'circle'; }
    r.g.position.set(r.x, LEVEL - .3, r.z); r.g.rotation.y = r.h;
  }
  function raiderHit(r){ r.hp--; ripple(r.x, r.z, 1.5); R.tone(700, .1, 'square', .04, 300);
    if (r.hp > 0) return R.say(r.big ? `A hit on the first mate’s boat (${r.hp} more).` : 'A hit! The raider swerves.', 1300);
    if (r.big) return mateDown(r); r.mode = 'stopped'; R.say('Their engine dies. The raider dives overboard, and the stolen crate bobs up beside the boat.', 3000);
    const c = new THREE.Mesh(new THREE.BoxGeometry(1, .8, 1), M(0x8A6A4A)); c.position.set(r.x + 2, LEVEL + .1, r.z); c.userData.noPick = true; R.BL.mapG.add(c); crates.push({ m: c, x: r.x + 2, z: r.z });
    setTimeout(() => { if (r.g.parent) r.g.parent.remove(r.g); raiders.splice(raiders.indexOf(r), 1); }, 4000); }
  function c2Start(){ st.c2.start = 1; save(); const [cx, cz] = places().ctr(places().camp), [wx, wz] = places().waterBy(places().camp, [0, 1]);
    scene('raid', [{ d: 4, start(){ for (let i = 0; i < 3; i++) { const g = scAdd(raiderMesh(false)); g.position.set(wx + 8 + i * 6, LEVEL - .3, wz + 14 + i * 4); g.rotation.y = 3.6; } }, cam: f => [wx - 4, LEVEL + 3.5 + f, wz - 2], look: () => [wx + 12, LEVEL, wz + 18], name: ['PART 2', 'BRINE’S HARBOUR', 'Raiders hit the camp at dawn and took every crate of food and water.'] }],
      () => { for (let i = 0; i < 3; i++) addRaider(cx + 40 + i * 25, cz + 50 - i * 30); R.say('Three raider boats are getting away with the camp’s supplies. Catch them and harpoon their engines!', 4400); }); }
  function mateStart(){ const [mx, mz] = mapNow(); mate = addRaider(mx + 30, mz + 20, true); mate.g.position.set(mate.x, LEVEL - .3, mate.z);
    scene('mate_in', [{ d: 3.8, cam: f => [mate.x + 10 - f * 2, LEVEL + 3, mate.z + 8], look: () => [mate.x, LEVEL + 2, mate.z], name: ['BRINE’S RIGHT HAND', 'FIRST MATE SABLE', '“The captain wants his harbour quiet. Make it quiet.”'] }], () => R.say('Harpoon her boat. Watch for the splash rings: that’s her deck gun.', 3600)); }
  function mateDown(r){ mate = null; st.c2.done = 1; save(); r.mode = 'stopped';
    scene('mate_out', [{ d: 4.4, on(f){ r.g.position.y = LEVEL - .3 - f * 3; r.g.rotation.z = f * .6; }, cam: () => [r.x + 12, LEVEL + 4, r.z + 9], look: () => [r.x, LEVEL, r.z], say: 'The first mate’s boat lists, fills and goes under. Sable swims for it, shouting for the captain.' }],
      () => { if (r.g.parent) r.g.parent.remove(r.g); raiders.splice(raiders.indexOf(r), 1); const d3 = 15 - R.info().day; showCard('PART 2 COMPLETE', 'Brine’s Harbour', d3 > 0 ? `Part 3 unlocks in ${d3} day${d3 > 1 ? 's' : ''}.` : 'Part 3 is on its way.', 6000); }); }
  function c2Step(dt, t, mx, mz){
    raiders.slice().forEach(r => raiderStep(r, dt, t, mx, mz));
    if (R.DRV.on) crates.slice().forEach(c => { c.m.rotation.y += dt; if (Math.hypot(c.x - mx, c.z - mz) < 5) { crates.splice(crates.indexOf(c), 1); R.BL.mapG.remove(c.m); st.c2.crates++; save(); R.tone(880, .15, 'triangle', .05); R.say(`Crate aboard. Take it back to the camp’s ladder (${st.c2.crates} of 3).`, 2400); } });
    if (st.c2.crates >= 3 && !st.c2.back && campG && Math.hypot(mx - campG.lad[0], mz - campG.lad[1]) < 10) { st.c2.back = 1; save(); R.say('Bhaskar hauls the crates up: “That’s everyone fed. Now Brine will send someone worse.” An engine roars behind you.', 4200); setTimeout(() => { if (!mate && !st.c2.done) mateStart(); }, 3500); }
    if (st.c2.back && !st.c2.done && !mate && !SC && Math.random() < .01) mateStart();
  }

  // ---------- Part 3 · The Deep: diving gear, the pump house in the drowned streets, and Ironjaw ----------
  let pump = null, iron = null;
  function buildPump(){ if (pump || !places()) return; const [cx, cz] = places().ctr(places().camp); let x = cx - 60, z = cz - 40; for (let k = 0; k < 30; k++) { const [lx, lz] = R.toLocal(x, z); if (R.blrValid(lx, lz)) break; x += 5; }
    const g = new THREE.Group(); g.position.set(x, 0, z); R.BL.mapG.add(g); const wall = M(0x5A6A70); const hb = new THREE.Mesh(new THREE.BoxGeometry(6, 3.2, 4), wall); hb.position.y = 1.6; g.add(hb);
    const pipe = new THREE.Mesh(new THREE.CylinderGeometry(.5, .5, LEVEL + 2, 12), M(0x3A3D44)); pipe.position.set(3.4, (LEVEL + 2) / 2, 0); g.add(pipe);
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(4.6, .8), new THREE.MeshBasicMaterial({ map: R.tex(512, 90, (c, w, h) => { c.fillStyle = '#1E3A5A'; c.fillRect(0, 0, w, h); c.fillStyle = '#F4F1E8'; c.font = '800 44px system-ui'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('CITY STORMWATER PUMPS', w / 2, h / 2); }) })); sign.position.set(0, 2.6, 2.02); g.add(sign);
    const top = glow(0x6FD0FF, 3, .9); top.position.set(3.4, LEVEL + 2.2, 0); g.add(top);
    g.valves = [[-4, 3], [4, 3.5], [0, -4]].map(([ox, oz], i) => { const v = new THREE.Mesh(new THREE.TorusGeometry(.6, .12, 8, 18), new THREE.MeshBasicMaterial({ color: st.c3.valves.includes(i) ? 0x3CE870 : 0xFFB03A })); v.position.set(ox, 1.1, oz); v.rotation.x = Math.PI / 2; g.add(v); return { i, v, x: x + ox, z: z + oz, t: 0 }; });
    g.traverse(o => o.userData.noPick = true); pump = g; pump.spot = [x, z]; }
  function c3Start(){ st.c3.start = 1; st.gear = 1; save(); R.flood.state.breathTime = 60; buildPump(); R.PH.wp = pump.spot.slice();
    R.dlgPlay([['Bhaskar', 'There are pumps under the old stormwater station. If they still run, they could drain the whole city.'], ['Bhaskar', 'Take my diving gear. It’ll keep you down there a whole minute. Three valves, {N}. Turn them all.']], { block: true, done: () => showCard('PART 3', 'The Deep', `New gear: you can stay under for a minute. ${R.fine ? 'C to dive' : 'Crouch to dive'}; turn the three glowing valves at the pump house.`, 6400) }); }
  function c3Step(dt, mx, mz){
    if (!pump) return; const under = R.flood.state.under && R.pos.y < 3.4;
    pump.valves.forEach(V0 => { if (st.c3.valves.includes(V0.i)) return; if (under && Math.hypot(V0.x - mx, V0.z - mz) < 2.4) { V0.t += dt; V0.v.rotation.z += dt * 4; if (V0.t > 1.6) { st.c3.valves.push(V0.i); save(); V0.v.material.color.setHex(0x3CE870); R.tone(520, .3, 'triangle', .05); R.say(`Valve open. ${3 - st.c3.valves.length} to go.`, 2000); if (st.c3.valves.length >= 3) ironStart(); } } else V0.t = Math.max(0, V0.t - dt); });
  }
  function ironStart(){ if (iron) return; const [x, z] = pump.spot; iron = addShark(x + 18, z, true); iron.deep = true; iron.hp = 7; iron.home = [x, z];
    scene('iron_in', [{ d: 3.8, cam: f => [x + 8, 3.2, z + 6], look: () => [iron.x, 3, iron.z], name: ['THE PUMP HOUSE GUARDIAN', 'IRONJAW', 'Something with an armoured head has been sleeping in the pump house.'] }], () => R.say('Ironjaw hunts down here in the deep. Harpoon it, and go up for air when you need to.', 3600)); }
  function ironDown(s){ iron = null; st.c3.done = 1; save(); s.mode = 'dead';
    scene('iron_out', [{ d: 4, on(f){ s.g.position.y = Math.max(.6, s.g.position.y - f * .1); s.g.rotation.z = f * 2.2; }, cam: () => [s.x + 9, 3, s.z + 7], look: () => [s.x, 1.5, s.z], say: 'Ironjaw settles on the bottom and goes still. Behind it, the pumps cough… and start to turn.' }],
      () => { dropShark(s); const d4 = 22 - R.info().day; showCard('PART 3 COMPLETE', 'The Deep', d4 > 0 ? `The pumps are primed. Part 4 unlocks in ${d4} day${d4 > 1 ? 's' : ''}.` : 'The pumps are primed. Brine won’t let them run without a fight.', 6400); }); }

  // ---------- Part 4 · High Water: Brine's ship, the pumps, and the city draining ----------
  let ship = null, brine = null;
  function shipMesh(){ const g = new THREE.Group(), wood = M(0x5A3A22), dark = M(0x2A1E16);
    const hull = new THREE.Mesh(new THREE.BoxGeometry(7, 3, 22), wood); hull.position.y = .6; g.add(hull); const deck = new THREE.Mesh(new THREE.BoxGeometry(6.4, .2, 21), M(0x8A6A4A)); deck.position.y = 2.2; g.add(deck);
    const bow = new THREE.Mesh(new THREE.ConeGeometry(3.5, 5, 4), wood); bow.rotation.x = Math.PI / 2; bow.rotation.y = Math.PI / 4; bow.scale.set(1, 1, .6); bow.position.set(0, .8, 13); g.add(bow);
    [-5, 4].forEach(z => { const m = new THREE.Mesh(new THREE.CylinderGeometry(.22, .3, 16, 8), dark); m.position.set(0, 10, z); g.add(m); const sail = new THREE.Mesh(new THREE.PlaneGeometry(6, 7), new THREE.MeshLambertMaterial({ color: 0xD8D0BC, side: THREE.DoubleSide })); sail.position.set(0, 10, z + .3); g.add(sail); });
    const flag = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.5), new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, map: R.tex(256, 160, (c, w, h) => { c.fillStyle = '#16181D'; c.fillRect(0, 0, w, h); c.fillStyle = '#E8B82E'; c.font = '900 110px system-ui'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('☠', w / 2, h / 2 + 6); }) })); flag.position.set(1.2, 17.6, -5); g.add(flag);
    for (let i = -3; i <= 3; i++) { const cn = new THREE.Mesh(new THREE.CylinderGeometry(.22, .26, 1.2, 8), dark); cn.rotation.z = Math.PI / 2; cn.position.set(3.7, 1.4, i * 2.6); g.add(cn); }
    g.traverse(o => o.userData.noPick = true); return g; }
  // Brine's ship stays out in open water off the west coast; you take the boat out to it
  const SEA_C = () => [-436, places().ctr(places().camp)[1]];
  function c4Start(){ st.c4.start = 1; save(); const [x, z] = SEA_C(); const g = shipMesh(); g.position.set(x, LEVEL - 1.5, z); R.BL.mapG.add(g); ship = { g, x, z, h: 0, hp: 8, ph: 1, gun: 3, a: 0 }; R.PH.wp = [x + 30, z];
    scene('brine_in', [{ d: 4.2, cam: f => [ship.x + 26 - f * 6, LEVEL + 6, ship.z + 22], look: () => [ship.x, LEVEL + 6, ship.z], say: 'The pumps start, and the water begins to fall. Out of the haze comes a ship built from half the city’s wreckage.' },
      { d: 3.8, start(){ try { const a = R.avatar(Object.assign({}, R.crowdLook(90), {})); a.g.position.set(ship.x, LEVEL + .7, ship.z + 6); scAdd(a.g); } catch (e) {} }, cam: () => [ship.x + 4, LEVEL + 2.4, ship.z + 9], look: () => [ship.x, LEVEL + 1.8, ship.z + 6], name: ['MASTER OF THE DROWNED CITY', 'CAPTAIN BRINE', '“Turn those pumps off, {N}, or I’ll sink every roof in my harbour.”'] }],
      () => R.say('Phase 1: chase his ship and harpoon its hull. Dodge the cannon splashes.', 4200)); }
  function c4Step(dt, t, mx, mz){
    if (!ship) return; const S = ship, d = Math.hypot(mx - S.x, mz - S.z);
    if (S.ph === 1) { S.a += dt * .09; const [sx, sz] = SEA_C(), tx = sx + Math.sin(S.a) * 26, tz = sz + Math.cos(S.a) * 40, want = Math.atan2(tx - S.x, tz - S.z); let da = Math.atan2(Math.sin(want - S.h), Math.cos(want - S.h)); S.h += Math.max(-.5 * dt, Math.min(.5 * dt, da)); S.x += Math.sin(S.h) * 5 * dt; S.z += Math.cos(S.h) * 5 * dt;
      if ((S.gun -= dt) <= 0 && d < 60) { S.gun = 3; for (let i = 0; i < 3; i++) splash(mx + (Math.random() - .5) * 8, mz + (Math.random() - .5) * 8, 2.6, 1, 'A cannonball lands right on top of you!'); R.tone(60, .6, 'sawtooth', .06, 30); } }
    S.g.position.set(S.x, R.flood.state.level - 1.5, S.z); S.g.rotation.y = S.h;
    if (S.ph === 2 && brine) { // on the deck: he comes at you with a cutlass
      const [bx, bz] = [brine.x, brine.z], bd = Math.hypot(mx - bx, mz - bz); if (bd > 2) { brine.x += (mx - bx) / bd * 2.6 * dt; brine.z += (mz - bz) / bd * 2.6 * dt; } brine.a.g.position.set(brine.x, S.deckY, brine.z); brine.a.g.rotation.y = Math.atan2(-(mx - bx), -(mz - bz)); try { brine.a.anim(t, 1, 0); } catch (e) {}
      if ((brine.sw -= dt) <= 0 && bd < 4) { brine.sw = 2.4; splash(brine.x, brine.z, 2.8, 1, 'Brine’s cutlass catches you!'); } }
    if (S.ph === 3) { const k = Math.min(1, (S.dt = (S.dt || 0) + dt) / 40); R.flood.level(LEVEL - k * (LEVEL - .3)); }
  }
  function shipHit(){ const S = ship; S.hp--; ripple(S.x, S.z, 4); R.tone(300, .2, 'square', .05, 120);
    if (S.ph === 1 && S.hp > 0) return R.say(`A hit on the hull (${S.hp} more).`, 1200);
    if (S.ph === 1) { S.ph = 2; S.hp = 6; S.deckY = S.g.position.y + 2.3; if (R.DRV.on) R.getOut(true); const deck = { x0: S.x - 3, x1: S.x + 3, z0: S.z - 10, z1: S.z + 10, h: S.deckY - 1.6 + 1.6 - 1.6 }; deck.h = S.deckY; R.flood.put(deck); S.deck = deck;
      try { const a = R.avatar(R.crowdLook(90)); a.g.scale.setScalar(1.15); a.g.traverse(o => o.userData.noPick = true); R.BL.mapG.add(a.g); brine = { a, x: S.x, z: S.z + 7, sw: 2 }; } catch (e) {}
      return R.say('The ship slews round and you leap aboard. Phase 2: Brine draws his cutlass. Harpoon him at close range!', 4200); }
    if (S.ph === 2 && S.hp > 0) return R.say(`Brine staggers (${S.hp} more).`, 1200);
    if (S.ph === 2) { S.ph = 3; S.hp = 3; R.say('Phase 3: he scrambles up the mast as the water starts to drop away under the ship. Three more hits!', 4200); if (brine) brine.climb = 1; return; }
    if (S.hp <= 0) finale(); }
  function finale(){ const S = ship; st.c4.done = 1; save(); if (brine) { brine.a.g.parent && brine.a.g.parent.remove(brine.a.g); brine = null; } R.flood.state.roof = null;
    scene('brine_out', [
      { d: 4.2, on(f){ S.g.rotation.z = f * .5; }, cam: () => [S.x + 16, LEVEL + 5, S.z + 14], look: () => [S.x, LEVEL + 6, S.z], say: 'Brine loses his grip on the rigging and drops into the falling water. His ship heels over and runs aground in the street.' },
      { d: 6, on(f){ R.flood.level(Math.max(-.6, (R.flood.state.level || LEVEL) - f * .25)); }, cam: f => [S.x + 40, 30 - f * 8, S.z + 40], look: () => [S.x - 30, 0, S.z - 20], say: 'All across Bangalore the water drains away. Roofs become buildings again, then streets, then a city.' },
      { d: 4.6, start(){ title('SEASON 2 COMPLETE', 'HIGH WATER'); }, cam: () => [S.x + 20, 6, S.z + 18], look: () => [S.x, 1, S.z], say: 'One block never quite dries out. The sunken district stays, with Brine’s wreck in the middle of it.' }],
      () => { st.drained = 1; save(); R.flood.off(); raiders.slice().forEach(r => { r.g.parent && r.g.parent.remove(r.g); }); raiders.length = 0; sharks.slice().forEach(dropShark); buildTrace(); R.skin('s2_brine'); R.skin('s2_diver'); showCard('SEASON 2 COMPLETE', 'High Water', 'New skins: Diver and Brine’s Coat. Season 3 · The Syndicate starts 13 January.', 8000); }); }
  // what the season leaves: Brine's wreck in a block that stays under water
  let traceG = null;
  function buildTrace(){ if (traceG || !R.BL.mapG || !places()) return; const [cx, cz] = places().ctr(places().camp), x = cx - 30, z = cz + 40, g = traceG = new THREE.Group(); g.position.set(x, 0, z); R.BL.mapG.add(g);
    const w = new THREE.Mesh(new THREE.PlaneGeometry(26, 26), new THREE.MeshPhongMaterial({ color: 0x2E7A9A, transparent: true, opacity: .8, shininess: 80 })); w.rotation.x = -Math.PI / 2; w.position.y = .35; g.add(w);
    const s = shipMesh(); s.position.set(0, -.8, 0); s.rotation.set(0, .5, .35); s.scale.setScalar(.8); g.add(s);
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(4, .7), new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, map: R.tex(512, 90, (c, w2, h) => { c.fillStyle = '#1E3A5A'; c.fillRect(0, 0, w2, h); c.fillStyle = '#F4F1E8'; c.font = '800 46px system-ui'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('THE SUNKEN DISTRICT', w2 / 2, h / 2); }) })); sign.position.set(0, 2.2, 13.2); g.add(sign);
    g.traverse(o => o.userData.noPick = true); R.blrBox(x - 13, x + 13, z - 13, z + 13); }
  // harpoons also hit raiders, the ship and Brine
  function harpExtra(H){ const r = raiders.find(q => q.mode !== 'stopped' && Math.hypot(q.x - H.p.x, q.z - H.p.z) < (q.big ? 3.4 : 2)); if (r) { raiderHit(r); return true; }
    if (ship && ship.ph === 1 && Math.hypot(ship.x - H.p.x, ship.z - H.p.z) < 9) { shipHit(); return true; }
    if (ship && ship.ph >= 2 && brine && Math.hypot(brine.x - H.p.x, brine.z - H.p.z) < 1.8) { shipHit(); return true; } return false; }
  function splashStep(dt, mx, mz){ for (let i = splashes.length - 1; i >= 0; i--) { const q = splashes[i]; q.t -= dt; if (q.t > 0) continue; splashes.splice(i, 1); ripple(q.x, q.z, q.r); R.tone(90, .3, 'sawtooth', .04, 50); if (Math.hypot(mx - q.x, mz - q.z) < q.r) bite(q.dmg, q.why); } }
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
      { d: 4.6, start(){ setTimeout(() => { if (SC) cine.querySelector('.s2black').style.opacity = '0'; }, 1600); setTimeout(() => { if (SC) title('SEASON 2 · PART 1', 'HIGH WATER'); }, 2200); }, cam: f => { const [x, z] = start(); return [x, LEVEL + .9, z]; }, look: f => { const [x, z] = start(); return [x + 30, LEVEL + 3 + f * 2, z - 10 + f * 20]; }, say: '…You wake up on a wooden plank. Bangalore is gone. There’s only water, and the tops of the towers.' }
    ], () => { st.open = 1; save(); R.flood.set(LEVEL); const [x, z] = start(); const [lx, lz] = R.toLocal(x, z); R.pos.x = lx; R.pos.z = lz; buildBill(); const bs = bill ? bill.spot : [x - 20, z], hd = Math.atan2(bs[0] - x, bs[1] - z); R.yaw = hd + Math.PI; raft = park('raft', 0, x, z, hd, 'your plank'); st.raft = 1; save(); R.getIn(raft);
      setTimeout(() => showCard('PART 1', 'Adrift', `Paddle your plank (${R.fine ? 'W/S, A/D' : 'the stick'}). Something big and red is hanging off a billboard just ahead.`, 6500), 600); R.PH.wp = bill ? bill.spot.slice() : null; });
  }
  const start = () => { const Pl = places(); return Pl.waterBy(Pl.tower, [-1, 0]); };

  // ---------- the Season 2 trailer: the cold open, then the season. Teal-grey storm, rain, weathered serif type ----------
  css.textContent += `
.s2rain{position:absolute;inset:0;opacity:0;transition:opacity .8s;background:repeating-linear-gradient(105deg,rgba(220,235,242,0) 0 9px,rgba(220,235,242,.38) 9px 11px,rgba(220,235,242,0) 11px 31px),repeating-linear-gradient(100deg,rgba(220,235,242,0) 0 17px,rgba(220,235,242,.22) 17px 18px,rgba(220,235,242,0) 18px 47px);background-size:140px 140px,90px 90px;animation:s2rain .35s linear infinite}
@keyframes s2rain{to{background-position:-36px 140px,-24px 90px}}
.s2tint{position:absolute;inset:0;opacity:0;transition:opacity 1s;background:radial-gradient(ellipse at 50% 35%,rgba(90,130,140,.28),rgba(14,32,40,.62));mix-blend-mode:multiply}
body.s2tr .s2rain,body.s2tr .s2tint{opacity:1}
body.s2tr .s2title b,body.s2tr .s2bn b{font-family:"Georgia","Times New Roman",serif;font-weight:700;letter-spacing:.22em;color:#DCEBF2;text-shadow:0 0 1px #9CC3D0,2px 2px 0 rgba(10,30,40,.65),0 0 26px rgba(80,150,170,.35);border-left-color:#9CC3D0}
body.s2tr .s2title small,body.s2tr .s2bn small{font-family:"Georgia","Times New Roman",serif;font-style:italic;letter-spacing:.42em;color:#9CC3D0}
body.s2tr .s2title b{background:repeating-linear-gradient(0deg,#DCEBF2 0 3px,#B9D2DC 3px 4px);-webkit-background-clip:text;background-clip:text;color:transparent}
body.s2tr .s2bn{background:linear-gradient(90deg,rgba(14,30,38,.7),rgba(14,30,38,0))}`;
  cine.insertAdjacentHTML('afterbegin', '<div class="s2tint"></div><div class="s2rain"></div>');
  function trailer(){
    const Pl = places(), b = Pl.tower, [cx, cz] = Pl.ctr(b), wy = Math.min(b.h - 2, 30), win = [b.x0 - .3, wy, cz], [kx, kz] = Pl.ctr(Pl.camp), wasOn = R.flood.state.on, wasLevel = R.flood.state.level || LEVEL;
    const fog = R.BL.sc.fog, fog0 = { c: fog.color.getHex(), n: fog.near, f: fog.far }, bg0 = R.BL.sc.background && R.BL.sc.background.getHex && R.BL.sc.background.getHex();
    const storm = on => { if (on) { fog.color.setHex(0x5E7378); fog.near = 20; fog.far = 140; if (R.BL.sc.background && R.BL.sc.background.setHex) R.BL.sc.background.setHex(0x6E8388); } else { fog.color.setHex(fog0.c); fog.near = fog0.n; fog.far = fog0.f; if (bg0 != null) R.BL.sc.background.setHex(bg0); } };
    const ping = () => { R.tone(1250, .5, 'sine', .03, 1240); setTimeout(() => R.tone(1250, .9, 'sine', .012, 1240), 420); };
    const thud = () => { R.tone(48, .7, 'sine', .08, 36); }, drum = () => { R.tone(70, .25, 'square', .05, 50); setTimeout(() => R.tone(180, .08, 'square', .03, 140), 230); };
    let wall = null, ring = null, fins = [], wave = { x: -640 }, shards = []; const WB = Pl.waterBy(Pl.camp, [0, 1]), this_w = i => WB[i];
    const sea = (x, z, y) => [x, y == null ? LEVEL + 1 : y, z];
    return [
      { d: 3.6, start(C){ document.body.classList.add('s2tr'); storm(true); R.flood.off(); C.onEnd = () => { document.body.classList.remove('s2tr'); cine.querySelector('.s2tint').style.background = ''; storm(false); if (wasOn || (st.open && !st.drained)) R.flood.set(wasLevel); else R.flood.off(); };
          ring = scAdd(new THREE.Mesh(new THREE.RingGeometry(10, 15, 48), new THREE.MeshBasicMaterial({ color: 0x9CC3D0, transparent: true, opacity: .8, side: THREE.DoubleSide, fog: false, depthWrite: false }))); ring.position.set(TEAR[0], TEAR[1], TEAR[2]); ring.lookAt(win[0], win[1], win[2]); thud(); },
        cam: f => [win[0] + 1.6 - f, win[1], win[2] + .4], look: () => [-480, 60, cz], name: ['A FEW DAYS AFTER LANDFALL', 'THE QUIET', 'You thought it was over.'] },
      { d: 3, start(){ wall = scAdd(new THREE.Mesh(new THREE.BoxGeometry(14, 1, 900), M(0x3E6A78, { transparent: true, opacity: .93 }))); wall.position.set(wave.x, 0, cz); ping(); }, on(f){ ring.scale.setScalar(1 + f * 2.4); wall.scale.y = f * 40; wall.position.y = f * 20; }, cam: () => [win[0] - .2, win[1], win[2]], look: f => [TEAR[0], 60 + (1 - f) * 70, TEAR[2]], say: 'The tear opened again.' },
      { d: 3, on(f, t, dt, C){ wave.x = -640 + f * (win[0] + 632); wall.position.x = wave.x; C.shake = .3 + f * 1.4; if (f > .88 && !C.hit2) { C.hit2 = 1; flashW(); R.tone(40, 2.2, 'sawtooth', .1, 20); R.tone(1900, .5, 'square', .03, 300); R.flood.set(LEVEL); for (let i = 0; i < 22; i++) { const s = scAdd(new THREE.Mesh(new THREE.PlaneGeometry(.4, .5), new THREE.MeshBasicMaterial({ color: 0xDCEBF2, transparent: true, opacity: .7, side: THREE.DoubleSide }))); s.position.set(win[0] - .4, win[1] + (Math.random() - .5) * 2, win[2] + (Math.random() - .5) * 3); shards.push({ s, v: V(1 + Math.random() * 6, (Math.random() - .3) * 4, (Math.random() - .5) * 6) }); } } shards.forEach(q => { q.s.position.addScaledVector(q.v, dt); q.s.rotation.x += dt * 6; }); }, cam: () => [win[0] + .2, win[1], win[2]], look: () => [-480, 25, cz] },
      { d: 2.4, start(){ if (wall) wall.visible = false; }, on(f, t, dt, C){ C.shake = .3; shards.forEach(q => { q.v.y -= 9 * dt; q.s.position.addScaledVector(q.v, dt); }); if (f > .75) cine.querySelector('.s2black').style.opacity = '1'; }, cam: f => [win[0] - 2 - f * 6, win[1] - f * f * (win[1] - LEVEL - 1), win[2]], look: f => [win[0] - 4 - Math.cos(f * 7), win[1] - 6 + Math.sin(f * 7) * 10, win[2] + Math.sin(f * 5) * 6] },
      { d: 3.6, start(){ R.flood.set(LEVEL); setTimeout(() => { if (SC) cine.querySelector('.s2black').style.opacity = '0'; }, 900); const p = scAdd(new THREE.Mesh(new THREE.BoxGeometry(.9, .12, 2.6), M(0x8A6A4A))); p.position.set(...sea(cx - 30, cz, LEVEL + .05)); for (let i = 0; i < 3; i++) { const g = scAdd(sharkMesh(false)); fins.push({ g, a: i * 2.1 }); } thud(); },
        on(f, t){ fins.forEach(q => { q.a += .012; q.g.position.set(cx - 30 + Math.sin(q.a) * 7, LEVEL - .5, cz + Math.cos(q.a) * 7); q.g.rotation.y = q.a + Math.PI / 2; }); }, cam: f => [cx - 30, LEVEL + .9 + Math.sin(f * 6) * .1, cz], look: f => [cx - 30 + Math.sin(f * 1.5) * 10, LEVEL + .4, cz + Math.cos(f * 1.5) * 10], name: ['YOU WAKE UP ON A PLANK', 'ADRIFT', 'And you are not alone in the water.'] },
      { d: 3.2, start(){ ping(); }, on(f, t){ fins.forEach(q => { q.a += .02; q.g.position.set(cx - 30 + Math.sin(q.a) * 5, LEVEL - 2.4, cz + Math.cos(q.a) * 5); q.g.rotation.y = q.a + Math.PI / 2; }); }, cam: () => [cx - 30, LEVEL - 3.8, cz + 2], look: () => [cx - 30, LEVEL + 2, cz - 1], say: 'Under the water, the old streets are still down there.' },
      { d: 3, start(){ for (let i = 0; i < 3; i++) { try { const a = R.avatar(R.crowdLook(30 + i)); a.g.position.set(kx + (i - 1) * 1.3, Pl.camp.h, kz); scAdd(a.g); } catch (e) {} } }, cam: f => [kx + 16, Pl.camp.h + 4 + f * 2, kz + 14], look: () => [kx, Pl.camp.h + 1, kz], name: ['THE ROOFTOPS', 'THE SURVIVORS', 'Water, a fire, a radio full of static. And a harpoon gun.'] },
      { d: 2.8, start(C){ C.big = scAdd(sharkMesh(true)); thud(); }, on(f, t, dt, C){ C.big.position.set(kx + 30 - f * 22, LEVEL - .5, kz + 34); C.big.rotation.y = -Math.PI / 2; }, cam: () => [kx + 10, LEVEL + 1.4, kz + 40], look: f => [kx + 30 - f * 22, LEVEL, kz + 34], say: 'Something bigger is hunting.' },
      { d: 3, start(C){ cine.querySelector('.s2tint').style.background = 'radial-gradient(ellipse at 50% 30%,rgba(140,110,70,.12),rgba(30,26,20,.5))'; drum(); C.r = [0, 1, 2].map(i => { const g = scAdd(raiderMesh(i === 1)); return g; }); }, on(f, t, dt, C){ if (Math.floor(t * 2.2) !== C.beat) { C.beat = Math.floor(t * 2.2); drum(); } C.r.forEach((g, i) => { g.position.set(kx + 20 + i * 9 - f * 12, LEVEL - .3, kz + 50 - i * 5); g.rotation.y = -Math.PI / 2 - .3; }); }, cam: () => [kx + 4, LEVEL + 2, kz + 46], look: f => [kx + 22 - f * 12, LEVEL + 1, kz + 46], name: ['THEN THE RAIDERS CAME', 'BRINE’S HARBOUR', '“Every roof pays a toll now.”'] },
      { d: 3, start(C){ ping(); C.iron = scAdd(sharkMesh(true)); C.w = Pl.waterBy(Pl.camp, [0, 1]); }, on(f, t, dt, C){ C.iron.position.set(C.w[0] + 2 + f * 8, 3, C.w[1] + 10); C.iron.rotation.y = Math.PI / 2; if (Math.floor(t * 2.2) !== C.beat) { C.beat = Math.floor(t * 2.2); drum(); } }, cam: () => [this_w(0), LEVEL + 3, this_w(1)], look: f => [this_w(0) + 6 + f * 8, 3, this_w(1) + 10], name: ['BELOW THE PUMP HOUSE', 'IRONJAW', 'Something armoured sleeps down there.'] },
      { d: 4, start(C){ C.s = scAdd(shipMesh()); C.s.position.set(kx + 60, LEVEL - 1.5, kz - 10); C.s.rotation.y = -1.2; try { const a = R.avatar(R.crowdLook(90)); a.g.position.set(kx + 60, LEVEL + .8, kz - 4); scAdd(a.g); } catch (e) {} },
        on(f, t, dt, C){ if (Math.floor(t * 2.6) !== C.beat) { C.beat = Math.floor(t * 2.6); drum(); if (C.beat % 2) R.tone(55, .4, 'sawtooth', .06, 30); } }, cam: f => [kx + 40 - f * 6, LEVEL + 5, kz + 12], look: () => [kx + 60, LEVEL + 7, kz - 10], name: ['THE MASTER OF THE DROWNED CITY', 'CAPTAIN BRINE', '“Turn those pumps off, or I sink every roof in my harbour.”'] },
      { d: 4.8, start(){ title('SEASON 2', 'HIGH WATER'); thud(); }, on(f, t){ if (t > 4) cine.querySelector('.s2title').classList.remove('on'); }, cam: f => [kx + 70 - f * 12, 26 + f * 6, kz + 60], look: () => [kx - 20, LEVEL, kz] },
      { d: 3, start(){ title('16 DECEMBER – 12 JANUARY', 'HOLD YOUR BREATH'); ping(); }, cam: f => [kx, LEVEL + .8, kz + 20], look: f => [kx - 40, LEVEL + 2 + f * 3, kz - 20] }
    ];
  }
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
    if (!flooded) { if (st.drained) buildTrace(); return; }
    if (!inited) { inited = true; drawHearts(); buildBill(); buildCamp(); if (st.boat) { const [x, z] = places().waterBy(places().camp, [0, 1]); boat = park('boat', 0xC8462E, x + 3, z + 2, 0, 'your boat'); } if (st.harpoon) buildStrand(); if (!st.boat && bill) R.PH.wp = bill.spot.slice(); if (st.gear) R.flood.state.breathTime = 60;
      if (st.c2.start && !st.c2.done && !st.c2.back) { const [cx, cz] = places().ctr(places().camp); for (let i = st.c2.crates; i < 3; i++) addRaider(cx + 40 + i * 25, cz + 50 - i * 30); }
      if (st.c4.start && !st.c4.done) st.c4.start = 0; }
    hurtT = Math.max(0, hurtT - dt); breath.firstChild.style.width = (R.flood.state.breath * 100) + '%'; breath.hidden = !R.flood.state.under && R.flood.state.breath > .99;
    const [mx, mz] = mapNow();
    // billboard boat, the camp, the rescues
    if (bill && !st.boat && Math.hypot(mx - bill.spot[0], mz - bill.spot[1]) < 9) dropBoat(); dropStep(dt);
    if (campG) { campG.people.forEach((a, i) => { try { a.anim(t + i, 0, 0); } catch (e) {} }); if (!st.camp && R.flood.state.roof === places().camp) campTalk(); }
    if (st.camp && !st.boss1 && R.DRV.on && R.DRV.p && R.DRV.p.type === 'boat') {
      strand.slice().forEach(S => { if (Math.hypot(S.x - mx, S.z - mz) < 6) { strand.splice(strand.indexOf(S), 1); if (S.g.parent) S.g.parent.remove(S.g); aboard.push(S.i); R.tone(880, .15, 'triangle', .05); R.say(`“Thank you! I thought nobody was coming.” (${aboard.length} aboard)`, 2400); } });
      if (aboard.length && Math.hypot(mx - campG.lad[0], mz - campG.lad[1]) < 10) { aboard.forEach(i => st.saved.push(i)); aboard = []; save(); R.tone(660, .3, 'triangle', .05); R.say(`They scramble up the ladder to the roof. ${st.saved.length} of 3 rescued.`, 3000); }
      if (st.saved.length >= 3 && !boss) bossStart(); }
    // the later parts, a week apart
    if (st.ch1 && week() >= 2 && !st.c2.start) c2Start();
    if (st.c2.start && !st.c2.done) c2Step(dt, t, mx, mz);
    if (st.c2.done && week() >= 3 && !st.c3.start && R.flood.state.roof === places().camp) c3Start();
    if (st.c3.start) { buildPump(); if (!st.c3.done) c3Step(dt, mx, mz); }
    if (st.c3.done && week() >= 4 && !st.c4.start) c4Start();
    if (st.c4.start && !st.c4.done) c4Step(dt, t, mx, mz);
    if (ship && ship.ph === 2) ship.h = 0;
    if (ship && ship.ph === 3) { ship.deck.h = ship.g.position.y + 2.3; if (brine) { brine.x = ship.x; brine.z = ship.z - 5; brine.a.g.position.set(brine.x, Math.min(ship.deck.h + 7, brine.a.g.position.y + dt * 1.5), brine.z); } }
    splashStep(dt, mx, mz);
    // sharks and the harpoon
    sharkCrowd(mx, mz); sharks.slice().forEach(s => { if (s.mode !== 'dead') sharkStep(s, dt, t, mx, mz); }); harpStep(dt);
    for (let i = ripples.length - 1; i >= 0; i--) { const q = ripples[i]; q.t += dt; q.m.scale.setScalar(q.r * (1 + q.t * 2)); q.m.material.opacity = Math.max(0, .8 - q.t); if (q.t > .8) { R.BL.mapG.remove(q.m); ripples.splice(i, 1); } }
  }
  R.flood.state.onBreath = () => bite(1, 'Out of breath! You choke on seawater and kick for the surface.');

  // ---------- the Season tab ----------
  function tab(){
    const S = R.info(), fd = new Date(S.start.getTime()), unlock = i => new Date(fd.getTime() + i * 7 * 864e5).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }), wk = week();
    const CH = [['Adrift', st.ch1 ? 'Done.' : !st.open ? 'Go out into the city.' : !st.boat ? 'Paddle to the boat on the billboard.' : !st.camp ? 'Find the survivors’ roof and climb the ladder.' : st.saved.length < 3 ? `Rescue the people on the wreckage: ${st.saved.length} of 3.` : 'Survive the great shark.'], ['Brine’s Harbour', !st.ch1 ? 'Finish Part 1 first.' : st.c2.done ? 'Done.' : st.c2.back ? 'Beat First Mate Sable.' : `Catch the raider boats and bring the crates home: ${st.c2.crates} of 3.`], ['The Deep', !st.c2.done ? 'Finish Part 2 first.' : st.c3.done ? 'Done.' : !st.c3.start ? 'Go back to the survivors’ roof.' : st.c3.valves.length < 3 ? `Dive to the pump house and turn the valves: ${st.c3.valves.length} of 3.` : 'Beat Ironjaw.'], ['High Water', !st.c3.done ? 'Finish Part 3 first.' : st.c4.done ? 'Done: the city is drained.' : 'Beat Captain Brine as the pumps run.']];
    return `<div class="phcard"><b>Season 2 · High Water</b><small>Day ${S.day} of 28 · ${S.left} day${S.left === 1 ? '' : 's'} left. A wave came through the tear and drowned the city.</small><div class="phrow"><button type="button" data-s2="video">▶ Watch the Season 2 trailer</button><button type="button" data-s2="trailer">▶ In-game trailer</button></div></div>`
      + CH.map(([n, sub], i) => `<div class="phcard"><b>${[st.ch1, st.c2.done, st.c3.done, st.c4.done][i] ? '✓ ' : ''}Part ${i + 1}: ${n}</b><small>${wk > i ? esc(sub) : `Unlocks ${unlock(i)}.`}</small></div>`).join('')
      + `<div class="phcard"><b>Tools</b><small>${st.boat ? '✓ The boat' : 'Boat: not yet'} · ${st.harpoon ? '✓ Harpoon gun' : 'Harpoon gun: not yet'} · ${st.gear ? '✓ Diving gear' : 'Diving gear: not yet'}</small></div>`;
  }
  function wire(B){ const v = B.querySelector('[data-s2="video"]'); if (v) v.onclick = () => { R.phoneClose(); if (R.video) R.video('seasons/s02-trailer.mp4'); };
    const tr = B.querySelector('[data-s2="trailer"]'); if (tr) tr.onclick = () => { if (!(R.inWorld && R.zone === 'blr') || R.busy || R.DRV.on || R.BL.lvl || !places()) return R.say('Go out into the city to watch it in the game.', 2400); R.phoneClose(); setTimeout(() => scene('trailer', trailer()), 300); }; }
  if (opts && opts.past) return { step(){ if (R.inWorld && R.zone === 'blr' && R.BLC.built) buildTrace(); } };
  return { step, tab, wire, debug: { st, get SC(){ return SC; }, places: () => places(), sharks, fire, get boss(){ return boss; }, get ship(){ return ship; }, raiders, get iron(){ return iron; }, get pump(){ return pump; }, raiderHit: r => raiderHit(r), shipHit: () => shipHit(), crates, sharkDown: s => sharkDown(s), get bill(){ return bill; }, trailer: () => scene('trailer', trailer()), get strand(){ return strand; }, harps, addShark: (x, z, big) => addShark(x, z, big), coldOpen, dropBoat: () => dropBoat() } };
};
