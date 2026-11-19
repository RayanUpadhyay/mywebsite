// Season 3 · The Syndicate
// After the flood a crime syndicate owns half of Bangalore. Free five districts, steal the ledger, lose a fight, chase Velvet,
// and storm Madame Marigold's tower with Inspector Devi. Loaded by index.html only while Season 3 runs (and afterwards with
// { past: true }, when it only builds what the season left on the map). Everything comes in through the API object R
// (seasonApi in index.html): fights are R.fight, the rope launcher, slides and vaults are R.pk. Progress lives in ru-season under "s3".
window.RU_SEASON_3 = function(R, opts){
  const THREE = R.THREE, V = (x, y, z) => new THREE.Vector3(x, y, z);
  const all = R.get(); const st = all.s3 = Object.assign({ open: 0, seen: [], dist: {}, heat: 0, baton: 0, rope: 0, comet: 0, done: 0, home: null }, all.s3 || {});
  if (!Array.isArray(st.seen)) st.seen = []; if (!st.dist || typeof st.dist !== 'object') st.dist = {};
  st.p1 = Object.assign({ chase: 0, raid: 0, brass: 0 }, st.p1 || {}); st.p2 = Object.assign({ start: 0, heist: 0, clean: 0, ledger: 0, lost: 0 }, st.p2 || {});
  st.p3 = Object.assign({ start: 0, conv: [], velvet: 0 }, st.p3 || {}); st.p4 = Object.assign({ start: 0, lobby: 0, roofs: 0, chase: 0, boss: 0 }, st.p4 || {});
  if (!Array.isArray(st.p3.conv)) st.p3.conv = [];
  const save = () => { const a = R.get(); a.s3 = st; R.put(a); };
  const week = () => { try { const q = location.search.match(/[?&]week=(\d)/); if (q) return +q[1]; } catch (e) {} return R.info().week; };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const ease = k => k * k * (3 - 2 * k);
  const M = (c, o) => new THREE.MeshLambertMaterial(Object.assign({ color: c }, o || {}));
  const glow = (col, size, op = 1) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: R.flakeTex(), color: col, transparent: true, opacity: op, depthWrite: false, fog: false, blending: THREE.AdditiveBlending })); s.scale.setScalar(size); s.userData.noPick = true; return s; };
  const mapNow = () => R.toMap(R.pos.x, R.pos.z);
  const noPick = g => { g.traverse(o => o.userData.noPick = true); return g; };
  const ORANGE = 0xE8901A;

  // ---------- UI: a title card, the heat marigolds, an action button, the scene overlay ----------
  const css = document.createElement('style'); css.textContent = `
.s3card{position:fixed;left:50%;top:30%;transform:translate(-50%,-50%) scale(.96);z-index:60;background:rgba(20,16,12,.93);color:#fff;border:1px solid rgba(232,144,26,.6);border-radius:16px;padding:16px 26px;text-align:center;opacity:0;pointer-events:none;transition:opacity .5s,transform .5s;max-width:calc(100% - 32px);font:600 13px/1.4 system-ui,sans-serif}
.s3card.on{opacity:1;transform:translate(-50%,-50%) scale(1)}.s3card small{display:block;letter-spacing:.14em;color:#FFB04A;font-weight:800}.s3card b{display:block;font:800 26px/1.2 system-ui,sans-serif;margin:4px 0}.s3card span{color:rgba(255,255,255,.84)}
.s3heat{position:fixed;left:50%;top:calc(66px + env(safe-area-inset-top,0px));transform:translateX(-50%);z-index:40;pointer-events:none;font:800 12px system-ui,sans-serif;color:#fff;background:rgba(20,16,12,.7);border-radius:999px;padding:5px 12px;letter-spacing:.06em;white-space:nowrap}.s3heat i{font-style:normal;color:#FFA02A;font-size:16px;letter-spacing:2px;margin-right:6px}.s3heat .off{color:rgba(255,255,255,.28)}
.s3act{position:fixed;left:50%;bottom:calc(150px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:40}
.s3gad{position:fixed;right:calc(18px + env(safe-area-inset-right,0px));bottom:calc(236px + env(safe-area-inset-bottom,0px));z-index:40;width:70px;height:70px;border-radius:50%;border:0;background:#FFB04A;color:#16181D;font:800 12px system-ui,sans-serif;box-shadow:0 6px 20px rgba(0,0,0,.4);touch-action:none}
body.ssf .s3gad{bottom:calc(270px + env(safe-area-inset-bottom,0px))}
.s3cine{position:fixed;inset:0;pointer-events:none;z-index:54;display:none}body.s3cs .s3cine{display:block}
body.s3cs::before,body.s3cs::after{content:"";position:fixed;left:0;right:0;height:9vh;background:#000;z-index:55}body.s3cs::before{top:0}body.s3cs::after{bottom:0}
.s3black{position:absolute;inset:0;background:#000;opacity:0;transition:opacity .6s}.s3flash{position:absolute;inset:0;background:#FFF3E0;opacity:0}
.s3title{position:absolute;left:0;right:0;top:38%;text-align:center;color:#fff;opacity:0;transition:opacity 1s;text-shadow:0 2px 24px rgba(0,0,0,.6)}.s3title.on{opacity:1}
.s3title small{display:block;font:800 14px system-ui,sans-serif;letter-spacing:.5em;color:#FFB04A}.s3title b{display:block;font:900 clamp(40px,9vw,92px)/1.05 system-ui,sans-serif;letter-spacing:.1em}
.s3bn{position:absolute;left:calc(4vw + env(safe-area-inset-left,0px));bottom:18vh;max-width:min(560px,calc(100% - 32px));padding:12px 20px 14px;border-radius:10px;background:linear-gradient(90deg,rgba(20,14,8,.7),rgba(20,14,8,0));color:#fff;opacity:0;transition:opacity .5s}.s3bn.on{opacity:1}
.s3bn small{display:block;font:800 12px system-ui;letter-spacing:.32em;color:#FFB04A}.s3bn b{display:block;font:900 clamp(30px,7vw,58px)/1 system-ui;margin:6px 0 8px;border-left:6px solid #E8901A;padding-left:12px}.s3bn span{font:600 italic 16px/1.4 system-ui;color:rgba(255,255,255,.9)}
.s3skip{position:fixed;right:16px;bottom:calc(11vh + 12px);z-index:61;background:rgba(255,255,255,.14);color:#fff;border:1px solid rgba(255,255,255,.35);border-radius:999px;padding:8px 16px;font:700 13px system-ui,sans-serif;cursor:pointer}
.s3dark{position:fixed;inset:0;z-index:53;pointer-events:none;background:#04060A;opacity:0;transition:opacity 2.4s}
.s3petal{position:fixed;inset:0;z-index:56;pointer-events:none;display:none}
body.s3cs button:not(.s3skip),body.s3cs .placecard,body.s3cs .s3heat{visibility:hidden!important}
body.s3tr #scene{filter:grayscale(1) contrast(1.2) brightness(.92)!important}
body.s3tr .s3title b,body.s3tr .s3bn b{font-family:"Courier New",ui-monospace,monospace;font-weight:900;letter-spacing:.06em;color:#F4F1E8;border-left-color:#E8901A}
body.s3tr .s3title small,body.s3tr .s3bn small{font-family:"Courier New",ui-monospace,monospace;color:#E8901A;letter-spacing:.3em}
body.s3tr .s3bn{background:linear-gradient(90deg,rgba(0,0,0,.78),rgba(0,0,0,0))}
.s3stamp{position:absolute;right:calc(6vw + env(safe-area-inset-right,0px));top:16vh;border:4px solid #E8901A;color:#E8901A;font:900 clamp(14px,2.6vw,22px)/1.1 "Courier New",monospace;padding:8px 14px;letter-spacing:.14em;transform:rotate(-8deg);opacity:0;transition:opacity .3s}.s3stamp.on{opacity:.92}`;
  document.head.appendChild(css);
  const el = (cls, html, parent = document.body, tag = 'div') => { const e = document.createElement(tag); e.className = cls; if (html) e.innerHTML = html; parent.appendChild(e); return e; };
  const card = el('s3card'), heatEl = el('s3heat'), cine = el('s3cine', '<div class="s3black"></div><div class="s3flash"></div><div class="s3title"></div><div class="s3bn"></div><div class="s3stamp"></div>'), dark = el('s3dark');
  const actBtn = el('btn alt s3act', '', document.body, 'button'), gadBtn = el('s3gad', 'Flash', document.body, 'button'), skipBtn = el('s3skip', 'Skip scene ▸▸', document.body, 'button');
  actBtn.type = gadBtn.type = skipBtn.type = 'button'; heatEl.hidden = actBtn.hidden = gadBtn.hidden = skipBtn.hidden = true;
  function showCard(small, big, sub, ms = 4200){ card.innerHTML = `<small>${small}</small><b>${big}</b>${sub ? `<span>${sub}</span>` : ''}`; card.classList.add('on'); clearTimeout(showCard.t); showCard.t = setTimeout(() => card.classList.remove('on'), ms); }
  const chime = () => { R.tone(660, .2, 'triangle', .05); setTimeout(() => R.tone(990, .3, 'triangle', .05), 150); };

  // the action button (E): whatever is closest and wants doing
  let act = null;
  function setAct(a){ act = a; actBtn.hidden = !a; if (a) { const t = a.label + (R.fine ? ' (E)' : ''); if (actBtn.textContent !== t) actBtn.textContent = t; } }
  actBtn.addEventListener('click', e => { e.stopPropagation(); if (act) act.go(); });
  addEventListener('keydown', e => { if (e.repeat || /INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) return; const k = e.key.toLowerCase(); if (k === 'e' && act && !actBtn.hidden) { e.stopImmediatePropagation(); act.go(); } if (k === 'f' && !gadBtn.hidden) gadget(); }, true);
  gadBtn.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); gadget(); });

  // ---------- scenes with their own camera (the same engine as Seasons 1 and 2) ----------
  let SC = null; const PEND = [];
  const aimAt = (c, l) => { if (R.camOut) c = R.camOut(c); const [lx, lz] = R.toLocal(c[0], c[2]); R.pos.x = lx; R.pos.z = lz; R.pos.y = c[1]; const dx = l[0] - c[0], dy = l[1] - c[1], dz = l[2] - c[2]; R.yaw = Math.atan2(-dx, -dz); R.pitch = Math.atan2(dy, Math.hypot(dx, dz)); };
  function scAdd(o){ R.BL.mapG.add(o); (SC ? SC.objs : PEND).push(o); o.traverse(q => q.userData.noPick = true); return o; }
  function scene(id, shots, done){
    if (SC) return false; const [mx, mz] = mapNow(); const SW = R.SW;
    SC = { id, shots, i: -1, t: 0, done, from: { map: [mx, mz], y: R.pos.y, yaw: R.yaw, pitch: R.pitch, tpv: R.tpv, roof: SW ? SW.roof : 0 }, objs: PEND.splice(0), shake: 0 };
    if (SW) { SW.on = false; SW.roof = 0; } R.tpv = false; R.DRV.lock = true; R.closePanel(); document.body.classList.add('cine', 's3cs'); skipBtn.hidden = false; setAct(null); if (!st.seen.includes(id)) { st.seen.push(id); save(); } scNext(); return true;
  }
  function scNext(){
    const C = SC; C.i++; C.t = 0; cine.querySelector('.s3bn').classList.remove('on'); if (C.i >= C.shots.length) return scEnd(false); const s = C.shots[C.i];
    if (s.start) { try { s.start(C); } catch (e) { console.error(e); } }
    if (s.name) { const bn = cine.querySelector('.s3bn'); bn.innerHTML = `<small>${esc(s.name[0])}</small><b>${esc(s.name[1])}</b>${s.name[2] ? `<span>${esc(s.name[2].replace(/\{N\}/g, R.heroName()))}</span>` : ''}`; setTimeout(() => { if (SC === C) bn.classList.add('on'); }, 400); }
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
    document.body.classList.remove('cine', 's3cs'); cine.querySelector('.s3bn').classList.remove('on'); cine.querySelector('.s3title').classList.remove('on'); cine.querySelector('.s3stamp').classList.remove('on'); cine.querySelector('.s3black').style.opacity = '0'; skipBtn.hidden = true;
    const [lx, lz] = R.toLocal(C.from.map[0], C.from.map[1]); R.pos.x = lx; R.pos.z = lz; R.pos.y = C.from.y; R.yaw = C.from.yaw; R.pitch = C.from.pitch; R.tpv = C.from.tpv; R.DRV.lock = false; if (R.SW) R.SW.roof = C.from.roof || 0;
    if (C.done) setTimeout(() => { try { C.done(skipped); } catch (e) { console.error(e); } }, 60);
  }
  skipBtn.addEventListener('click', e => { e.stopPropagation(); scEnd(true); });
  addEventListener('keydown', e => { if (SC && e.key === 'Escape') scEnd(true); });
  const title = (small, big) => { const t = cine.querySelector('.s3title'); t.innerHTML = `<small>${esc(small)}</small><b>${esc(big)}</b>`; t.classList.add('on'); };
  const stamp = txt => { const s = cine.querySelector('.s3stamp'); s.textContent = txt; s.classList.add('on'); };
  const flash = () => { const f = cine.querySelector('.s3flash'); f.style.transition = 'none'; f.style.opacity = '1'; requestAnimationFrame(() => requestAnimationFrame(() => { f.style.transition = 'opacity 1s'; f.style.opacity = '0'; })); };
  const orbit = (c, r, y, a0, a1) => f => [c[0] + Math.sin(a0 + (a1 - a0) * f) * r, y, c[1] + Math.cos(a0 + (a1 - a0) * f) * r];

  // ---------- the cast: registered as fight heroes so the same people turn up in scenes, on the street and in fights ----------
  const CAST = { id: 's3c', units: {
    goon: { stats: { name: 'Syndicate goon', hp: 70, kind: 'melee', dmg: 7, range: 2.3, cd: 1, speed: 4.3, r: .55 }, outfit: { c1: '#2A2D33', c2: '#E8901A', gloves: 1, skin: '#A0673D', hair: 'buzz', hairCol: '#16181D', moustache: 1, build: { h: 1.02, w: 1.12, sh: 1.08 } } },
    goon2: { stats: { name: 'Syndicate heavy', hp: 110, kind: 'melee', dmg: 9, range: 2.4, cd: 1.25, speed: 3.6, r: .7 }, outfit: { c1: '#3A2E26', c2: '#E8901A', sleeveless: 1, skin: '#7A4A2A', hair: 'bald', beard: 1, hairCol: '#16181D', build: { h: 1.1, w: 1.38, belly: .7, sh: 1.15 } } },
    goon3: { stats: { name: 'Syndicate runner', hp: 50, kind: 'melee', dmg: 6, range: 2.2, cd: .8, speed: 5.2, r: .45 }, outfit: { c1: '#4A4E56', c2: '#E8901A', skin: '#C68B59', hair: 'curly', hairCol: '#2A1A10', cap: 1, capC: '#16181D', build: { h: .93, w: .84 } } },
    gunner: { stats: { name: 'Syndicate gunner', hp: 55, kind: 'ranged', dmg: 5, cd: 1.3, speed: 3.8, r: .5, col: 0xFFA02A }, outfit: { c1: '#3A3D44', c2: '#E8901A', mask: 'hood', skin: '#C68B59', hairCol: '#16181D', build: { h: 1.08, w: .9 } } },
    guard: { stats: { name: 'Counting-house guard', hp: 60, kind: 'ranged', dmg: 6, cd: 1.2, speed: 4, r: .5, col: 0xFFA02A }, outfit: { c1: '#1E2A3A', c2: '#C9CFD8', peak: 1, capC: '#1E2A3A', skin: '#A0673D', hair: 'short', hairCol: '#16181D', moustache: 1, build: { h: 1.04, w: 1.1 } } },
    collector: { stats: { name: 'Collector', hp: 140, kind: 'melee', dmg: 9, range: 2.4, cd: 1.1, speed: 4, r: .6 }, outfit: { c1: '#F2E6C8', c2: '#7A5A3A', coat: 'short', coatC: '#F2E6C8', flower: 1, skin: '#C68B59', hair: 'side', hairCol: '#16181D', moustache: 1, build: { h: 1.03, w: 1.16, belly: .45 } } },
    brass: { stats: { name: 'Brass', hp: 99999, kind: 'melee', dmg: 12, range: 2.8, cd: 1.1, speed: 3.6, r: .9, scale: 1.45 }, outfit: { c1: '#2A2420', c2: '#E8B82E', gloves: 1, sleeveless: 1, skin: '#6B4430', hair: 'bald', beard: 'long', hairCol: '#1A1410', build: { h: 1.16, w: 1.5, belly: .8, sh: 1.25, head: .92 } } },
    velvet: { stats: { name: 'Velvet', hp: 99999, kind: 'ranged', dmg: 6, cd: .9, speed: 5, r: .5, col: 0xC86AE8 }, outfit: { c1: '#16181D', c2: '#5A1E4A', gloves: 1, coat: 'long', coatC: '#2A1E26', skin: '#E0B08A', hair: 'ponytail', hairCol: '#2A1A10', build: { h: 1.1, w: .86, sh: .95 } } },
    marigold: { stats: { name: 'Madame Marigold', hp: 500, kind: 'melee', r: .6 }, outfit: { c1: '#F4F1E8', c2: '#B8862E', coat: 'long', coatC: '#EDE4CC', flower: 1, skin: '#C68B59', hair: 'bun', hairCol: '#E8E8E8', build: { h: 1.02, w: .92 } } },
    ledger: { stats: { name: 'The Ledger', hp: 500, kind: 'ranged', r: .6 }, outfit: { c1: '#F4F1E8', c2: '#6A5A4A', vest: 1, glasses: 1, moustache: 1, skin: '#A0673D', hair: 'side', hairCol: '#B8B8B2', build: { h: .88, w: .86, sh: .92, head: 1.05 } } },
    devi: { stats: { name: 'Inspector Devi', hp: 500, kind: 'ranged', r: .6 }, outfit: { c1: '#B8A27A', c2: '#3A2E20', peak: 1, capC: '#3A3020', skin: '#A0673D', hair: 'bun', hairCol: '#16181D', build: { h: .98, w: 1.08, sh: 1.04 } } },
    lata: { stats: { name: 'Lata', hp: 500, kind: 'melee', r: .6 }, outfit: { c1: '#B8322A', c2: '#E8B82E', saree: 1, glasses: 1, skin: '#7A4A2A', hair: 'bun', hairCol: '#4A4A48', build: { h: .9, w: 1.22, belly: .5 } } },
    pod: { stats: { name: 'Tear-plant pod', hp: 130, kind: 'static', r: .9 }, outfit: {} },
    pylon: { stats: { name: 'Alarm', hp: 60, kind: 'static', r: .6 }, outfit: {} } } };
  R.fightReg(CAST);
  const H = k => 'ssu_s3c_' + k;
  function who(k, x, z, y = 0, face){ let a = null; try { a = R.heroAv(H(k)); } catch (e) { return null; } a.g.position.set(x, y, z); if (face) a.g.rotation.y = Math.atan2(-(face[0] - x), -(face[1] - z)); noPick(a.g); return a; }

  // ---------- places: picked from the city as it's built this time ----------
  const valid = (x, z) => { const [lx, lz] = R.toLocal(x, z); return R.blrValid(lx, lz); };
  function spot(x, z, r0 = 0){ for (let r = r0; r < 40; r += 2) for (let k = 0; k < 12; k++) { const a = k / 12 * 6.283, px = x + Math.cos(a) * r, pz = z + Math.sin(a) * r; if (valid(px, pz) && valid(px + 1.5, pz) && valid(px - 1.5, pz) && valid(px, pz + 1.5) && valid(px, pz - 1.5)) return [px, pz]; } return [x, z]; }
  let P = null;
  const ctr = b => [(b.x0 + b.x1) / 2, (b.z0 + b.z1) / 2];
  function places(){
    if (P || !R.BL.bld || !R.BL.bld.length) return P;
    const B = R.BL.bld.filter(b => !b.hide && Math.abs(ctr(b)[0]) < 330 && Math.abs(ctr(b)[1]) < 330); if (!B.length) return null;
    const xs = B.map(b => ctr(b)[0]).sort((a, b) => a - b), zs = B.map(b => ctr(b)[1]).sort((a, b) => a - b), q = (L, f) => L[Math.floor(L.length * f)];
    const home = st.home || mapNow(), cx = q(xs, .5), cz = q(zs, .5), dx = (q(xs, .85) - q(xs, .15)) / 2, dz = (q(zs, .85) - q(zs, .15)) / 2;
    const D = [['market', 'Market Street', home], ['old', 'Old Town', [cx - dx, cz - dz]], ['harbour', 'Harbour Road', [cx - dx, cz + dz]], ['tech', 'Tech Park', [cx + dx, cz - dz]], ['lake', 'Lakeside', [cx + dx, cz + dz]]]
      .map(([k, n, c]) => ({ k, n, c: c.slice() }));
    D.slice(1).forEach(d => { const ox = d.c[0] - home[0], oz = d.c[1] - home[1], dd = Math.hypot(ox, oz); if (dd < 110) { d.c[0] = home[0] + ox / (dd || 1) * 110; d.c[1] = home[1] + oz / (dd || 1) * 110; } d.c = spot(d.c[0], d.c[1]); });
    D.forEach((d, i) => { d.r = ['collect', 'box', 'crew', 'rescue'].map((kind, j) => { const a = j * 1.571 + .5 + i, rr = 26 + j * 5; return { kind, d: d.k, j, at: spot(d.c[0] + Math.cos(a) * rr, d.c[1] + Math.sin(a) * rr) }; }); });
    // Marigold's tower: the tallest building near the middle of the city; the counting house: a block in Old Town
    const tower = B.filter(b => Math.hypot(ctr(b)[0] - cx, ctr(b)[1] - cz) < 150).sort((a, b) => b.h - a.h)[0] || B.sort((a, b) => b.h - a.h)[0];
    const near = (p, f) => B.filter(f).sort((a, b) => Math.hypot(ctr(a)[0] - p[0], ctr(a)[1] - p[1]) - Math.hypot(ctr(b)[0] - p[0], ctr(b)[1] - p[1]))[0];
    const count = near(D[1].c, b => b !== tower && b.h > 6 && b.h < 22) || B[0];
    // the story's own spots (the counting house door, the tower lobby) keep the rackets at a distance, so walking up to one never starts the other
    const cs = spot(ctr(count)[0], count.z1 + 8), ts = spot(ctr(tower)[0], tower.z1 + 9);
    D.forEach(d => d.r.forEach(r => [cs, ts].forEach(q => { const dx = r.at[0] - q[0], dz = r.at[1] - q[1], dd = Math.hypot(dx, dz); if (dd < 25) r.at = spot(q[0] + dx / (dd || 1) * 30, q[1] + dz / (dd || 1) * 30, 0); })));
    P = { D, tower, count, home, cx, cz, near, B, cs, ts };
    return P;
  }
  const dist = k => places().D.find(d => d.k === k);
  const freed = k => (st.dist[k] || []).length >= 3;
  const nFreed = () => places() ? places().D.filter(d => freed(d.k)).length : Object.keys(st.dist).filter(k => (st.dist[k] || []).length >= 3).length;

  // ---------- marigold stamps on the doors, and the stalls that come back when a district is freed ----------
  const stampTex = () => stampTex.t || (stampTex.t = R.tex(128, 128, (c, w, h) => { c.clearRect(0, 0, w, h); c.translate(w / 2, h / 2); c.fillStyle = '#E8901A';
    for (let i = 0; i < 12; i++) { c.rotate(Math.PI / 6); c.beginPath(); c.ellipse(0, -30, 11, 24, 0, 0, 7); c.fill(); }
    c.fillStyle = '#7A3A08'; c.beginPath(); c.arc(0, 0, 17, 0, 7); c.fill(); c.fillStyle = '#FFD08A'; c.font = '900 22px system-ui'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('M', 0, 1); }));
  const stampMat = () => stampMat.m || (stampMat.m = new THREE.MeshBasicMaterial({ map: stampTex(), transparent: true, depthWrite: false, side: THREE.DoubleSide }));
  // a flat thing stuck to the street side of a building near (x, z)
  function onWall(b, x, z, y, mesh){ const [bx, bz] = ctr(b), dx = x - bx, dz = z - bz, W = (b.x1 - b.x0) / 2, D = (b.z1 - b.z0) / 2;
    if (Math.abs(dx) / W > Math.abs(dz) / D) { mesh.position.set(dx > 0 ? b.x1 + .06 : b.x0 - .06, y, Math.max(b.z0 + .8, Math.min(b.z1 - .8, z))); mesh.rotation.y = dx > 0 ? Math.PI / 2 : -Math.PI / 2; }
    else { mesh.position.set(Math.max(b.x0 + .8, Math.min(b.x1 - .8, x)), y, dz > 0 ? b.z1 + .06 : b.z0 - .06); mesh.rotation.y = dz > 0 ? 0 : Math.PI; } return mesh; }
  const stamps = {};
  function buildStamps(d){
    if (stamps[d.k] || freed(d.k)) return; const g = stamps[d.k] = new THREE.Group(); R.BL.mapG.add(g);
    places().B.filter(b => Math.hypot(ctr(b)[0] - d.c[0], ctr(b)[1] - d.c[1]) < 55).slice(0, 14).forEach((b, i) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.1), stampMat()); g.add(onWall(b, d.c[0] + Math.sin(i * 2.4) * 30, d.c[1] + Math.cos(i * 2.4) * 30, 1.6 + (i % 3) * .5, m)); });
    noPick(g);
  }
  function stallMesh(col){ const g = new THREE.Group(); const t = new THREE.Mesh(new THREE.BoxGeometry(2, .9, 1), M(0x8A6A4A)); t.position.y = .45; g.add(t);
    [[-.95, -.45], [.95, -.45], [-.95, .45], [.95, .45]].forEach(([x, z]) => { const p = new THREE.Mesh(new THREE.BoxGeometry(.06, 2.2, .06), M(0x3A3D44)); p.position.set(x, 1.1, z); g.add(p); });
    const aw = new THREE.Mesh(new THREE.BoxGeometry(2.3, .08, 1.4), M(col)); aw.position.set(0, 2.2, .1); aw.rotation.x = .18; g.add(aw);
    for (let i = 0; i < 5; i++) { const f = new THREE.Mesh(new THREE.SphereGeometry(.13, 8, 6), M([0xE84A2A, 0xFFC93C, 0x5EA83A, 0xE8901A, 0xC8462E][i])); f.position.set(-.7 + i * .35, .98, 0); g.add(f); } return noPick(g); }
  const stalls = {};
  function buildStalls(d){ if (stalls[d.k] || !freed(d.k)) return; const g = stalls[d.k] = new THREE.Group(); R.BL.mapG.add(g);
    [[6, 0], [-6, 3], [2, -7]].forEach(([ox, oz], i) => { const [x, z] = spot(d.c[0] + ox, d.c[1] + oz); const s = stallMesh([0x3CB0A8, 0xC8462E, 0xFFC93C][i]); s.position.set(x, 0, z); s.rotation.y = i * 1.9; g.add(s); const a = who('lata', x + .9, z + 1.1); if (a && i === 0 && d.k !== 'market') g.add(a.g); }); }
  function freeDistrict(d){
    if (stamps[d.k]) { R.BL.mapG.remove(stamps[d.k]); stamps[d.k] = null; } buildStalls(d);
    [523, 659, 784, 1047, 784, 1047].forEach((f, i) => setTimeout(() => R.tone(f, .22, 'triangle', .045), i * 140));
    showCard('DISTRICT FREED', d.n, `The stamps come off the doors and the stalls open up again. ${nFreed()} of 5 districts free.`, 5600);
    if (nFreed() >= 5 && !st.allFree) { st.allFree = 1; save(); setTimeout(() => showCard('THE WHOLE CITY', 'Every district is free', 'Not a single marigold stamp left on a door in Bangalore.', 5600), 6200); }
  }

  // ---------- heat: one to three marigolds; at two or more, the Syndicate comes looking for you ----------
  let quietT = 0, ambT = 60;
  function heatUp(n){ st.heat = Math.min(3, (st.heat || 0) + n); quietT = 0; save(); if (st.heat >= 2 && !st.toldHeat) { st.toldHeat = 1; save(); R.say('The Syndicate has noticed you. With two marigolds or more, expect company: alleys, vans, snipers. Lie low (or hide in your garage) to cool off.', 6000); } }
  function heatHud(){ const n = st.heat || 0; heatEl.innerHTML = `<i>${'✿'.repeat(n)}<span class="off">${'✿'.repeat(3 - n)}</span></i>${n >= 3 ? 'They’re hunting you' : n >= 2 ? 'Syndicate heat' : 'They’ve noticed you'}`; }

  // ---------- fights in the street, built from the cast ----------
  // start a fight and look level, towards the boss (or the middle of the fight); the fight engine leaves the camera tilted
  function fightGo(o){ const [px, pz] = mapNow(); if (!R.fight(o)) return false; const tg = o.bossAt || [0, 0], tx = o.at[0] + tg[0], tz = o.at[1] + tg[1]; const yw = Math.hypot(tx - px, tz - pz) > 1.5 ? Math.atan2(-(tx - px), -(tz - pz)) : R.yaw, lv = () => { if (R.fighting) { R.yaw = yw; R.pitch = 0; } }; lv(); [120, 400, 900].forEach(ms => setTimeout(lv, ms)); return true; }
  const ring = (n, r, a0 = 0) => Array.from({ length: n }, (_, i) => [Math.cos(a0 + i / n * 6.283) * r, Math.sin(a0 + i / n * 6.283) * r]);
  function lost(){ setTimeout(() => R.say('You’re down. Walk it off and come back when you’re ready.', 3200), 400); st.heat = Math.min(st.heat || 0, 1); save(); }
  // a street fight: spec = { goons, gunners, collector, cover, sniper, setup, step, title, intro, hud }
  function streetFight(id, at, spec, end){
    const o = { id, title: spec.title || 'Syndicate crew', at: at.slice(), goal: spec.goal || 'Knock them all out', intro: spec.intro, cover: spec.cover || [],
      setup(F){ F.data.snipe = 5; ring(spec.goons || 0, 9, .3).forEach(([x, z], i) => F.add(H(['goon', 'goon2', 'goon3'][i % 3]), x, z)); ring(spec.gunners || 0, 12, 1.1).forEach(([x, z]) => F.add(H('gunner'), x, z, { cover: 1 }));
        if (spec.collector) F.add(H('collector'), -8, 0); if (spec.setup) spec.setup(F); },
      hud: F => spec.hud ? spec.hud(F) : `${F.foes().length} left${spec.sniper ? ' · watch for the red dot' : ''}`,
      step(dt, F){ if (spec.sniper && (F.data.snipe -= dt) <= 0) { F.data.snipe = 4.5; const [x, z] = F.me; if (!F.data.toldS) { F.data.toldS = 1; F.say('A red laser dot! A rooftop sniper: keep moving!', 2400); } F.tone(1400, .1, 'square', .02); F.mark(x, z, 1.1, 0xFF2A2A, 1.5, m => { if (F.near(m.x, m.z, m.r)) { F.hurt(15); F.shake(.4); } }); }
        if (spec.step) spec.step(dt, F); if (!F.foes().length && !spec.noAutoWin) F.win(); },
      end(won){ if (spec.after) spec.after(won); if (won) end && end(); else lost(); } };
    if (spec.boss) { o.boss = spec.boss; o.outfit = spec.outfit; o.bossAt = spec.bossAt || [-10, 0]; }
    return fightGo(o);
  }

  // ---------- the rackets: four in each district, any three free it ----------
  const RK = []; let rkBuilt = false;
  function rkDone(r){ const L = st.dist[r.d] = st.dist[r.d] || []; if (!L.includes(r.kind)) L.push(r.kind); save(); heatUp(1); if (r.g && r.g.parent) r.g.parent.remove(r.g); r.done = 1;
    const d = dist(r.d), n = L.length; R.tone(880, .15, 'triangle', .05); if (n === 3) freeDistrict(d); else if (n < 3) R.say(`${d.n}: ${n} of 3 rackets broken.`, 2600);
    if (r.d === 'market' && !st.p1.chase && !chase) setTimeout(chaseStart, 1500); }
  function buildRackets(){
    if (rkBuilt || !places()) return; rkBuilt = true;
    places().D.forEach(d => { buildStamps(d); buildStalls(d); if (freed(d.k)) return; d.r.forEach(r => { if ((st.dist[d.k] || []).includes(r.kind)) return; const [x, z] = r.at, g = new THREE.Group(); g.position.set(x, 0, z); R.BL.mapG.add(g); r.g = g; r.x = x; r.z = z;
      if (r.kind === 'collect') { const s = stallMesh(0x8A8F99); s.position.set(1.4, 0, 0); g.add(s); const a = who('collector', -.6, .8, 0, [x + 1.4, z]); if (a) { g.add(a.g); r.av = a; } try { const k = R.avatar(R.crowdLook(50 + r.j)); k.g.position.set(1.4, 0, 1.2); g.add(k.g); r.k = k; } catch (e) {} }
      if (r.kind === 'box') { const b = new THREE.Mesh(new THREE.BoxGeometry(1, .9, .8), M(0x2E4A3A)); b.position.y = .45; g.add(b); const sm = new THREE.Mesh(new THREE.PlaneGeometry(.6, .6), stampMat()); sm.position.set(0, .5, .41); g.add(sm); const sign = new THREE.Mesh(new THREE.PlaneGeometry(1.6, .5), new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, map: R.tex(256, 80, (c, w, h) => { c.fillStyle = '#16181D'; c.fillRect(0, 0, w, h); c.fillStyle = '#E8901A'; c.font = '800 30px system-ui'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('PAY HERE', w / 2, h / 2); }) })); sign.position.set(0, 1.5, 0); g.add(sign); r.hits = 0; }
      if (r.kind === 'crew') { [[2, 1], [-2, 1.5], [0, -2]].forEach(([ox, oz], i) => { const c = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1, 1.2), M(0x7A6242)); c.position.set(ox, .5, oz); g.add(c); const a = who(['goon', 'goon2', 'goon3'][i], ox + .9, oz + .9, 0, [x, z]); if (a) { g.add(a.g); (r.avs = r.avs || []).push(a); } }); }
      if (r.kind === 'rescue') { const ch = new THREE.Mesh(new THREE.BoxGeometry(.7, .5, .7), M(0x5A3A22)); ch.position.y = .25; g.add(ch); try { const k = R.avatar(R.crowdLook(60 + r.j)); k.g.position.set(0, .1, 0); g.add(k.g); r.k = k; } catch (e) {} [[1.6, 1], [-1.6, .6]].forEach(([ox, oz]) => { const a = who('goon', ox, oz, 0, [x, z]); if (a) { g.add(a.g); (r.avs = r.avs || []).push(a); } }); }
      const top = glow(ORANGE, 1.6, .85); top.position.y = 3.4; g.add(top); r.top = top; noPick(g); RK.push(r); }); });
  }
  function rkStep(dt, t, mx, mz){
    let best = null;
    RK.forEach(r => { if (r.done || !r.g) return; r.top.position.y = 3.4 + Math.sin(t * 2 + r.j) * .2; [r.av, r.k, ...(r.avs || [])].forEach((a, i) => { if (a) try { a.anim(t + i, 0, 0); } catch (e) {} });
      const d = Math.hypot(r.x - mx, r.z - mz); if (d > 16 || R.DRV.on) return;
      if (r.kind === 'box') { if (d < 2.8) best = { label: `Smash the collection box (${r.hits}/3)`, go(){ r.hits++; R.tone(200, .15, 'square', .05, 90); if (r.hits >= 3) { R.say('The box splits and a month of protection money spills across the street. People start picking up what was theirs.', 3600); rkDone(r); setAct(null); } } }; return; }
      if (r.kind === 'rescue' && r.won) { if (d < 3) best = { label: 'Untie the shopkeeper', go(){ R.say('“Thank you. They said if I went to the police, the police would tell them.”', 3600); rkDone(r); setAct(null); } }; return; }
      if (r.busy || R.busy) return;
      const reach = r.kind === 'collect' ? 9 : r.kind === 'crew' ? 13 : 11; if (d > reach) return; r.busy = 1; r.g.visible = false;
      const at = [r.x, r.z], name = dist(r.d).n;
      const spec = r.kind === 'collect' ? { title: 'A collection', goons: 2, collector: 1, intro: `${name}: a collector is squeezing a stall owner. Stop him.` }
        : r.kind === 'crew' ? { title: `The ${name} crew`, goons: 3, gunners: 2, cover: [[3, 2, 'crate'], [-3, 2.5, 'crate'], [0, -4, 'car']], intro: `${name}: this is their crew’s corner. Clear it.` }
        : { title: 'A rescue', goons: 3, intro: `${name}: they’ve tied a shopkeeper to a chair. Get them away from her.` };
      if (!streetFight('rk_' + r.d + r.j, at, Object.assign(spec, { after(won){ r.busy = 0; if (r.g) r.g.visible = true; if (!won) return; if (r.kind === 'rescue') { r.won = 1; (r.avs || []).forEach(a => a.g.visible = false); } } }), () => { if (r.kind !== 'rescue') rkDone(r); })) { r.busy = 0; r.g.visible = true; }
    });
    return best;
  }

  // ---------- ambushes ----------
  let plant = null;
  function ambush(){
    const at = mapNow(), n = st.heat || 0, sniper = n >= 3, kind = ['alley', 'van', 'plant'][Math.floor(Math.random() * 3)];
    if (kind === 'plant') { // a "chaiwala" with a marigold pinned to his shirt walks up to you
      const a = Math.random() * 6.28, [x, z] = spot(at[0] + Math.cos(a) * 16, at[1] + Math.sin(a) * 16), av = who('collector', x, z, 0, at); if (!av) return; R.BL.mapG.add(av.g); const f = glow(ORANGE, .5); f.position.set(.25, 1.35, .2); av.g.add(f); plant = { av, x, z, t: 14 }; return; }
    R.say(kind === 'van' ? 'Tyres screech: a van slews across the road and its side door slides open!' : 'Goons pour out of an alley!', 2600); R.tone(kind === 'van' ? 300 : 180, .6, 'sawtooth', .05, 90);
    streetFight('amb', at, { title: kind === 'van' ? 'Van ambush' : 'Alley ambush', goons: kind === 'van' ? 4 : 3, gunners: n >= 3 ? 1 : 0, sniper, cover: kind === 'van' ? [[6, 0, 'car']] : [] }, () => { st.heat = Math.max(1, n - 1); save(); });
  }
  function plantStep(dt, t, mx, mz){ const P0 = plant; if (!P0) return; P0.t -= dt; const dx = mx - P0.x, dz = mz - P0.z, d = Math.hypot(dx, dz); P0.x += dx / (d || 1) * 3 * dt; P0.z += dz / (d || 1) * 3 * dt; P0.av.g.position.set(P0.x, 0, P0.z); P0.av.g.rotation.y = Math.atan2(-dx, -dz); try { P0.av.anim(t, 1, 0); } catch (e) {}
    if (d < 2.2 || P0.t <= 0) { R.BL.mapG.remove(P0.av.g); plant = null; if (d < 2.2 && !R.busy) { R.say('The chaiwala swings at you. There’s a marigold pinned to his shirt: he’s one of theirs!', 3000); streetFight('amb', mapNow(), { title: 'A Syndicate plant', goons: 2, collector: 1 }, () => {}); } } }

  // ---------- beacons: walk into one to start what's there ----------
  const beacons = {}, BEACON = {};
  function beacon(id, at, label){ if (beacons[id]) return beacons[id]; const g = new THREE.Group(); g.position.set(at[0], 0, at[1]);
    const col = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 70, 16, 1, true), new THREE.MeshBasicMaterial({ color: ORANGE, transparent: true, opacity: .2, depthWrite: false, side: THREE.DoubleSide })); col.position.y = 35; g.add(col);
    const t = glow(ORANGE, 3, .9); t.position.y = 2; g.add(t); R.BL.mapG.add(noPick(g)); return (beacons[id] = { g, at: at.slice(), label, armed: true }); }
  function unBeacon(id){ const b = beacons[id]; if (b) { R.BL.mapG.remove(b.g); delete beacons[id]; } }
  function beaconStep(mx, mz){ Object.keys(beacons).forEach(id => { const b = beacons[id], d = Math.hypot(b.at[0] - mx, b.at[1] - mz); if (!b.armed) { if (d > 16) b.armed = true; return; } if (d < 6 && !R.busy && !R.DRV.on && !SC && BEACON[id]) { b.armed = false; BEACON[id](); } }); }

  // ---------- Part 1 · Protection: the cold open ----------
  function coldOpen(){
    const [x, z] = st.home = mapNow(); save(); P = null; places(); buildStamps(dist('market'));
    const [cx, cz] = spot(x + 7, z + 2), cart = new THREE.Group(); let col = null, wala = null, devi = null, jeep = null;
    scene('open', [
      { d: 4.4, start(){ cine.querySelector('.s3black').style.opacity = '0'; }, cam: f => [x - 6 + f * 3, 1.5, z + 6], look: () => [cx, 1.8, cz], name: ['THE MORNING AFTER THE DRAIN', 'THE SYNDICATE', 'The water has gone. Somebody else came in with it.'] },
      { d: 4, start(){ const b = new THREE.Mesh(new THREE.BoxGeometry(1.4, .8, .8), M(0x8A6A4A)); b.position.y = .7; cart.add(b); [-.55, .55].forEach(o => { const w = new THREE.Mesh(new THREE.CylinderGeometry(.32, .32, .1, 12), M(0x16181D)); w.rotation.x = Math.PI / 2; w.position.set(o, .32, .42); cart.add(w); }); const urn = new THREE.Mesh(new THREE.CylinderGeometry(.18, .2, .45, 12), M(0xC9CFD8, { emissive: 0x222222 })); urn.position.set(-.3, 1.32, 0); cart.add(urn); cart.position.set(cx, 0, cz); scAdd(cart);
          wala = who('lata', cx + .3, cz - 1, 0, [cx - 2, cz]); col = who('collector', cx - 1.6, cz - .2, 0, [cx, cz - 1]); [wala, col].forEach(a => a && scAdd(a.g)); },
        on(f, t){ [wala, col].forEach((a, i) => a && a.anim(t + i, 0, 0)); }, cam: f => [cx - 3.2, 1.6, cz + 3.4], look: () => [cx - .4, 1.3, cz - .4], say: '“It’s Tuesday, aunty.” “The water took the drawer. Next week.” “It’s always next week.”' },
      { d: 2.6, on(f, t, dt, C){ cart.rotation.z = Math.min(1.45, f * 2.2); cart.position.y = Math.sin(Math.min(1, f * 1.6) * Math.PI) * .3; if (f > .5 && !C.crash) { C.crash = 1; R.tone(110, .5, 'sawtooth', .05, 50); C.shake = .3; } [wala, col].forEach((a, i) => a && a.anim(t + i, 0, 0)); }, cam: () => [cx - 2.4, 1.2, cz + 2.6], look: () => [cx, .7, cz], say: 'He kicks the cart over. Chai runs into the mud.' },
      { d: 4.8, start(){ jeep = R.makeVehicle('jeep', 0x5A6A3A, R.BL.mapG); jeep.g.traverse(o => o.userData.noPick = true); SC.objs.push(jeep.g); devi = who('devi', cx - 5, cz + 4, 0, [cx, cz]); if (devi) { devi.g.visible = false; scAdd(devi.g); } R.tone(70, 1.2, 'sawtooth', .03, 50); },
        on(f, t){ const jx = cx - 30 + f * 24; jeep.g.position.set(jx, 0, cz + 4.5); jeep.g.rotation.y = Math.PI / 2; if (f > .85 && devi) { devi.g.visible = true; devi.g.position.set(cx - 5, 0, cz + 3); devi.anim(t, 0, 0); } }, cam: f => [cx + 3, 1.7, cz + 7], look: f => [cx - 18 + f * 13, 1.2, cz + 4.5], name: ['INSPECTOR DEVI', 'CENTRAL DIVISION', 'Hers is the only clean car on the street.'] }
    ], () => {
      R.dlgPlay([['Devi', 'He’ll be back for her on Friday. And for the stall next to hers on Saturday.'], ['ME', 'Can’t you stop him?'], ['Devi', 'My station is under a metre of mud. The radio gets one channel, and it’s cricket.'], ['Devi', 'You were on the roofs during the flood. People remember who pulled them out.'], ['Devi', 'Break what they’ve built on this street. The collections, the box by the temple, the crew on the corner. I’ll handle the paperwork.']],
        { block: true, done: () => { st.open = 1; save(); buildRackets(); R.PH.wp = dist('market').r[0].at.slice(); showCard('PART 1', 'Protection', `Break three of Market Street’s four rackets. The orange lights mark them; ${R.fine ? 'Shift sprints, C slides' : 'Sprint and Crouch'} for the chase.`, 6500); } });
    });
  }

  // ---------- Part 1: the market chase (vault the barricades, slide under the shutters) ----------
  let chase = null;
  function chaseStart(){
    if (chase || st.p1.chase || !places()) return; const [mx, mz] = mapNow(); let best = null;
    [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([ux, uz]) => { let n = 0; for (let k = 4; k <= 72; k += 2) { if (!valid(mx + ux * k, mz + uz * k)) break; n = k; } if (!best || n > best.n) best = { ux, uz, n }; });
    if (!best || best.n < 30) { st.p1.chase = 1; save(); return; }
    const { ux, uz } = best, L = best.n - 2, obs = [];
    const across = k => { const px = mx + ux * k, pz = mz + uz * k, lx = uz, lz = -ux; let a = 0, b = 0; while (a < 8 && valid(px + lx * (a + 1), pz + lz * (a + 1))) a++; while (b < 8 && valid(px - lx * (b + 1), pz - lz * (b + 1))) b++; return { px, pz, a: a + .6, b: b + .6, lx, lz }; };
    [[14, 'low'], [L * .45, 'gap'], [L * .7, 'low'], [L * .88, 'gap']].forEach(([k, kind]) => { const A = across(k), x0 = Math.min(A.px + A.lx * A.a, A.px - A.lx * A.b) - (ux ? .5 : 0), x1 = Math.max(A.px + A.lx * A.a, A.px - A.lx * A.b) + (ux ? .5 : 0), z0 = Math.min(A.pz + A.lz * A.a, A.pz - A.lz * A.b) - (uz ? .5 : 0), z1 = Math.max(A.pz + A.lz * A.a, A.pz - A.lz * A.b) + (uz ? .5 : 0);
      const g = new THREE.Group(); g.position.set((x0 + x1) / 2, 0, (z0 + z1) / 2); const W = x1 - x0, D = z1 - z0; R.BL.mapG.add(g);
      if (kind === 'low') { const m = new THREE.Mesh(new THREE.BoxGeometry(W, 1, D), M(0x8A6A4A)); m.position.y = .5; g.add(m); const s = new THREE.Mesh(new THREE.BoxGeometry(W + .02, .14, D + .02), M(ORANGE)); s.position.y = .9; g.add(s); obs.push({ g, b: R.pk.low(x0, x1, z0, z1, 1), kind, k }); }
      else { const sh = new THREE.Mesh(new THREE.BoxGeometry(W, 2.1, D * .5), M(0x6A6E78)); sh.position.y = 2.25; g.add(sh); for (let i = 0; i < 6; i++) { const r = new THREE.Mesh(new THREE.BoxGeometry(W + .02, .05, D * .5 + .02), M(0x4A4E56)); r.position.y = 1.3 + i * .32; g.add(r); } const sm = new THREE.Mesh(new THREE.PlaneGeometry(.9, .9), stampMat()); sm.position.set(0, 2.3, (uz ? 0 : 0)); sm.rotation.y = ux ? Math.PI / 2 : 0; sm.position.x += ux ? -.3 * Math.sign(ux) * 0 : 0; g.add(sm); obs.push({ g, b: R.pk.gap(x0, x1, z0, z1), kind, k }); }
      noPick(g); });
    const r0 = RK.find(r => r.d === 'market' && r.kind === 'collect'), av = who('collector', mx + ux * 5, mz + uz * 5, 0, [mx + ux * 9, mz + uz * 9]); if (!av) return; R.BL.mapG.add(av.g);
    chase = { ux, uz, k: 5, L, av, obs, told: {}, mx, mz };
    R.say('The collector legs it with the takings! Catch him: sprint, vault the barricades, slide under the shutters.', 4400); R.PH.wp = [mx + ux * L, mz + uz * L];
  }
  function chaseStep(dt, t, mx, mz){
    const C = chase; if (!C) return; const px = C.mx + C.ux * C.k, pz = C.mz + C.uz * C.k, d = Math.hypot(px - mx, pz - mz);
    const sp = d > 22 ? 2.6 : d < 7 ? 6.4 : 5.2; let hop = 0; const o = C.obs.find(q => Math.abs(q.k - C.k) < 1.2); if (o) hop = o.kind === 'low' ? Math.sin((C.k - o.k + 1.2) / 2.4 * Math.PI) * .9 : -.6;
    if (C.k < C.L) C.k = Math.min(C.L, C.k + sp * dt); C.av.g.position.set(px, Math.max(-.5, hop), pz); C.av.g.rotation.y = Math.atan2(-C.ux, -C.uz); C.av.g.rotation.x = o && o.kind === 'gap' ? -1.1 : 0; try { C.av.anim(t * 1.6, C.k < C.L ? 1 : 0, 0); } catch (e) {}
    C.obs.forEach(q => { const qd = Math.hypot((q.b.x0 + q.b.x1) / 2 - mx, (q.b.z0 + q.b.z1) / 2 - mz); if (qd < 7 && !C.told[q.kind]) { C.told[q.kind] = 1; R.say(q.kind === 'low' ? `A barricade! Sprint straight at it to vault over${R.fine ? ' (hold Shift)' : ''}.` : `A half-shut shutter! Sprint, then crouch to slide under it${R.fine ? ' (Shift, then C)' : ''}.`, 3200); } });
    if (d < 2.4) { // caught
      chase = null; st.p1.chase = 1; save(); R.tone(523, .2, 'triangle', .05); setTimeout(() => R.tone(784, .3, 'triangle', .05), 140);
      R.say('You bring him down in a heap of marigolds and rupee notes. He doesn’t reach for them. “Keep it,” he wheezes. “I’m the one who has to explain it to Brass.”', 5200);
      setTimeout(() => { C.av.g.parent && C.av.g.parent.remove(C.av.g); C.obs.forEach(q => { R.pk.drop(q.b); q.g.parent && q.g.parent.remove(q.g); }); }, 6000);
      R.PH.wp = null; const nx = RK.find(r => r.d === 'market' && !r.done); if (nx) R.PH.wp = nx.at.slice();
    }
  }

  // ---------- Part 1: the raid on your street, then Brass in the market ----------
  function raid(){ st.p1.raidGo = 1; save(); const at = mapNow();
    scene('raid', [{ d: 3.6, start(){ cine.querySelector('.s3black').style.opacity = '1'; setTimeout(() => { if (SC) cine.querySelector('.s3black').style.opacity = '0'; }, 1600); }, cam: f => [at[0] + 4, 2.4 + f, at[1] + 4], look: () => [at[0], 1.2, at[1]], name: ['THAT NIGHT', 'THE RAID', 'Glass breaking. Boots on the stairs. They found where you sleep.'] }],
      () => streetFight('raid', mapNow(), { title: 'The raid', goons: 4, gunners: 2, collector: 1, cover: [[5, 3, 'car'], [-4, -5, 'crate']], intro: 'They came for you in the night. Fight your way out!', after(won){ if (!won) { st.p1.raidGo = 0; save(); raidT = 30; } } }, () => { st.p1.raid = 1; save(); const c = dist('market').c; beacon('brass', c, 'Brass'); R.PH.wp = c.slice(); R.say('One of them gasps out where Brass is waiting: the middle of the market. Go and finish this.', 4000); }));
  }
  const BRASS = { name: 'Brass', hp: 1500, kind: 'melee', dmg: 13, range: 3, cd: 1.15, speed: 3.6, r: 1, scale: 1.5, bk: .25 };
  const BRASS_O = CAST.units.brass.outfit;
  BEACON.brass = () => { const at = beacons.brass.at, [mx, mz] = mapNow(), a = who('brass', at[0] - 6, at[1], 0, [mx, mz]);
    const go = () => streetFight('brass', at, { title: 'Brass', boss: BRASS, outfit: BRASS_O, bossAt: [-8, 0], goal: 'Knock out Brass', intro: 'Brass. Dodge the slams, sidestep the charge, and hit him when he’s winded.', cover: [[4, 4, 'crate'], [-3, -5, 'crate'], [6, -4, 'car']], noAutoWin: 1,
      setup(F){ Object.assign(F.data, { slam: 5, ch: 8, thr: 6.5, adds: 0 }); },
      hud: F => `Brass ${Math.max(0, Math.round(F.boss ? F.boss.hp / F.boss.max * 100 : 0))}%${F.data.adds ? ' · his crew joined in' : ''}`,
      step(dt, F){ const b = F.boss, D = F.data; if (!b || b.dead > 0) return F.win(); const mad = b.hp < b.max * .5, [px, pz] = F.me;
        if (mad && !D.adds) { D.adds = 1; F.say('“Get in here!” Three of his crew come running.', 2400); ring(3, 11).forEach(([x, z]) => F.add(H('goon'), x, z)); }
        if (D.dash) { const Q = D.dash; Q.t -= dt; b.stun = .2; const nx = b.x + Q.dx * 19 * dt, nz = b.z + Q.dz * 19 * dt; if (F.valid(nx, nz)) { b.x = nx; b.z = nz; } else Q.t = 0; if (!Q.hit && Math.hypot(px - b.x, pz - b.z) < 2.1) { Q.hit = 1; F.hurt(17, b); F.shake(.5); } if (Q.t <= 0) { D.dash = null; b.stun = 1.6; F.say('He’s winded. Hit him now!', 1400); } return; }
        if ((D.slam -= dt) <= 0) { D.slam = mad ? 5 : 6.5; b.stun = 1.2; F.tone(60, .6, 'sawtooth', .05, 30); F.mark(b.x, b.z, 4.6, 0xE8901A, 1.1, m => { F.ring(m.x, m.z, 4.6, 0xE8901A); F.shake(.5); if (F.near(m.x, m.z, m.r)) F.hurt(14, b); }); }
        if ((D.ch -= dt) <= 0) { D.ch = mad ? 6.5 : 8.5; const dx = px - b.x, dz = pz - b.z, d = Math.hypot(dx, dz) || 1; b.stun = 1; b.yaw = Math.atan2(-dx, -dz); F.tone(80, .8, 'sawtooth', .05, 180); for (let k = 1; k <= 7; k++) F.mark(b.x + dx / d * k * 2.6, b.z + dz / d * k * 2.6, 1.3, 0xFF6A1E, 1, null, true); setTimeout(() => { if (!F.over && b.dead <= 0) D.dash = { dx: dx / d, dz: dz / d, t: 1.1 }; }, 1000); }
        if ((D.thr -= dt) <= 0 && Math.hypot(px - b.x, pz - b.z) > 6) { D.thr = 7; F.say('He rips a stall off its legs and throws it!', 1600); F.mark(px, pz, 2, 0xFFC93C, 1.4, m => { F.ring(m.x, m.z, 2, 0xFFC93C); if (F.near(m.x, m.z, m.r)) F.hurt(16, b); }); } } },
      () => { st.p1.brass = 1; save(); unBeacon('brass'); scene('brass_out', [
        { d: 4, start(C){ C.a = who('brass', at[0] - 2, at[1], 0, [at[0] + 3, at[1]]); if (C.a) { scAdd(C.a.g); C.a.g.rotation.z = 1.4; C.a.g.position.y = .3; } }, cam: f => [at[0] + 2.4, 1 + f * .6, at[1] + 2.6], look: () => [at[0] - 2, .4, at[1]], say: 'Brass goes down like a felled tree. A stun baton rolls out of his belt and stops at your feet.' },
        { d: 4.2, start(){ title('PART 1 COMPLETE', 'PROTECTION'); }, cam: f => [at[0] + 12, 6 + f * 3, at[1] + 12], look: () => [at[0], 1, at[1]], say: 'Somewhere across town, a woman with a marigold in her lapel puts down her teacup.' }],
        () => { if (R.give('s3_baton')) { R.equip('s3_baton'); } st.baton = 1; save(); const d2 = 8 - R.info().day; showCard('PART 1 COMPLETE', 'Protection', `New weapon: the stun baton (it dazes whoever it hits). ${d2 > 0 ? `Part 2 unlocks in ${d2} day${d2 > 1 ? 's' : ''}.` : 'Part 2 is on its way.'} Free the other districts meanwhile.`, 7000); }); });
    if (!st.seen.includes('brass_in') && a) scene('brass_in', [
      { d: 3.6, start(){ scAdd(a.g); }, on(f, t){ a.anim(t, 0, 0); }, cam: f => orbit([at[0] - 6, at[1]], 6 - f, 2.2, .6, 1.9)(f), look: () => [at[0] - 6, 2.2, at[1]], name: ['THE SYNDICATE’S ENFORCER', 'BRASS', 'He ran a boxing gym on Hosur Road until the water came up to the second floor.'] },
      { d: 2.2, on(f, t){ a.anim(t, 0, 0); }, cam: () => [at[0] - 4.2, .8, at[1] + 1.2], look: () => [at[0] - 6, 2.6, at[1]], say: 'He cracks his knuckle-dusters together. They spark.' }], go);
    else go();
  };

  // ---------- Part 2 · The Ledger: the counting house heist (quiet is optional), the Ledger himself, then the fight you lose ----------
  const countAt = () => places().cs.slice();
  let countSign = null;
  function buildCount(){ if (countSign || !places()) return; const b = places().count, m = new THREE.Mesh(new THREE.PlaneGeometry(6, 1.1), new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, map: R.tex(512, 96, (c, w, h) => { c.fillStyle = '#16181D'; c.fillRect(0, 0, w, h); c.fillStyle = '#E8901A'; c.font = '800 40px Georgia,serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('MARIGOLD TRADING CO.', w / 2, h / 2 + 2); }) }));
    const [bx] = ctr(b); m.position.set(bx, Math.min(b.h - .5, 5), b.z1 + .08); countSign = noPick(m); R.BL.mapG.add(m); }
  function p2Start(){ st.p2.start = 1; save(); buildCount(); beacon('heist', countAt(), 'The counting house'); R.PH.wp = countAt();
    R.dlgPlay([['Devi', '📻 Everything they take ends up counted in one room. Marigold Trading, Old Town, behind the bangle shops.'], ['Devi', '📻 They keep a book. Names, amounts, and who gets paid to look the other way. With that, the arrests stick.'], ['Devi', '📻 Go quietly if you can. I’d rather nobody knew it was us.']],
      { block: false, done: () => { showCard('PART 2', 'The Ledger', 'Rob the Syndicate’s counting house in Old Town. Stay unseen if you can.', 6000); } }); }
  let flashes = 0, spikesCd = 0;
  function gadget(){
    if (R.fighting && heistF && !heistF.data.alarm && flashes > 0) { const F = heistF; flashes--; flash(); R.tone(2400, .3, 'square', .04, 300); let n = 0; F.foes().forEach(u => { if (u.hero !== H('guard')) return; const dx = u.x - F.me[0], dz = u.z - F.me[1], d = Math.hypot(dx, dz); if (d < 10) { u.blind = 4.5; n++; } }); R.say(n ? `Flashbang! ${n} guard${n > 1 ? 's' : ''} blinded for a few seconds. (${flashes} left)` : `Flashbang… nobody close enough. (${flashes} left)`, 2200); return; }
    if (R.DRV.on && R.DRV.p && R.DRV.p.type === 'comet' && spikesCd <= 0) fireSpikes();
  }
  let heistF = null;
  BEACON.heist = () => {
    const at = beacons.heist.at; flashes = 3;
    const o = { id: 'heist', title: 'The counting house', at, goal: 'Reach the vault and take the ledger',
      cover: [[-5, -3, 'crate'], [5, -2, 'crate'], [-3, -9, 'crate'], [4, -10, 'crate'], [0, -5, 'none', 1.2]],
      setup(F){ heistF = F; const D = F.data; Object.assign(D, { alarm: 0, seen: 0, grab: 0, safe: 4, cones: [] });
        const vault = new THREE.Group(); vault.position.set(0, 0, -15); const sf = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2, 1.2), M(0x3A3D44)); sf.position.y = 1; vault.add(sf); const dl = new THREE.Mesh(new THREE.CylinderGeometry(.3, .3, .08, 16), M(0xC9CFD8)); dl.rotation.x = Math.PI / 2; dl.position.set(0, 1.1, .62); vault.add(dl); const gl = glow(ORANGE, 2.2, .8); gl.position.y = 2.6; vault.add(gl); F.par().add(noPick(vault));
        [[[-7, -4], [-7, -12]], [[7, -12], [7, -4]], [[-4, -7], [4, -7]], [[3, -13], [-3, -13]], [[-11, -9], [-11, -15]]].forEach(([a, b], i) => { const u = F.add(H('guard'), a[0], a[1]); u.stun = 1e9; u.pat = [a, b]; u.pk = 0; u.pt = i * .2;
          const cone = new THREE.Group(), sec = new THREE.Mesh(new THREE.CircleGeometry(8.5, 18, -.55, 1.1), new THREE.MeshBasicMaterial({ color: 0xFFC060, transparent: true, opacity: .22, depthWrite: false, side: THREE.DoubleSide })); sec.rotation.x = -Math.PI / 2; sec.position.y = .06; cone.add(sec); F.par().add(noPick(cone)); u.cone = cone; D.cones.push(cone); });
        F.say('Stay out of the yellow light. Crouch to get closer, take guards down from behind (one hit while they don’t know you’re there), F or Flash to blind them.', 6500); },
      hud(F){ const D = F.data, awake = F.foes().filter(u => u.hero === H('guard')).length; return D.alarm ? `ALARM! Grab the ledger from the vault${D.grab > 0 ? ` (${Math.round(D.grab / 1.5 * 100)}%)` : ''}` : `Unseen${D.seen > .05 ? ' · they’re looking…' : ''} · ${awake} guards · ${flashes} flashbangs · reach the vault`; },
      hit(u, d, from, F){ const D = F.data; if (u.hero !== H('guard') || from !== 'me' || D.alarm) return d; if (F.melee(F.wpn)) { F.say('Quiet takedown.', 900); return u.hp + 1; } raise(F, 'The shot rings through the building.'); return d; },
      step(dt, F){ const D = F.data, [px, pz] = F.me, crouch = R.KIT && R.KIT.crouchK > .5;
        F.foes().forEach(u => { if (u.hero !== H('guard')) return; u.blind = Math.max(0, (u.blind || 0) - dt);
          if (!D.alarm) { const [a, b] = u.pat, tx = u.pk ? a[0] : b[0], tz = u.pk ? a[1] : b[1], dx = tx - u.x, dz = tz - u.z, dd = Math.hypot(dx, dz); if (u.pt > 0) u.pt -= dt; else if (dd < .3) { u.pk = 1 - u.pk; u.pt = 1.4; } else { u.x += dx / dd * 1.6 * dt; u.z += dz / dd * 1.6 * dt; u.yaw = Math.atan2(-dx, -dz); }
            if (!u.blind) { const vx = px - u.x, vz = pz - u.z, vd = Math.hypot(vx, vz), fwd = Math.atan2(-vx, -vz), da = Math.abs(Math.atan2(Math.sin(fwd - u.yaw), Math.cos(fwd - u.yaw))); if (vd < (crouch ? 5 : 8.5) && da < .55) D.seen += dt * (vd < 4 ? 2.2 : 1.2); } }
          if (u.cone) { u.cone.position.set(u.x, 0, u.z); u.cone.rotation.y = u.yaw + Math.PI / 2; u.cone.visible = !D.alarm && !u.blind; } });
        D.cones.forEach(c => { if (!F.foes().some(u => u.cone === c)) c.visible = false; });
        if (!D.alarm) { D.seen = Math.max(0, D.seen - dt * .5); if (D.seen > .8) raise(F, 'A guard spots you!'); }
        else if ((D.safe -= dt) <= 0) { D.safe = 4.5; F.say('A safe swings down off a chain!', 1200); F.mark(px, pz, 1.8, 0xE8901A, 1.4, m => { F.ring(m.x, m.z, 1.8, 0xE8901A); F.shake(.4); if (F.near(m.x, m.z, m.r)) F.hurt(18); }); }
        if (Math.hypot(px, pz + 15) < 2) { D.grab += dt; if (D.grab >= 1.5) F.win(); } else D.grab = Math.max(0, D.grab - dt); },
      end(won){ const clean = heistF && !heistF.data.alarm; heistF = null; if (!won) return lost();
        st.p2.heist = 1; if (clean) st.p2.clean = 1; save(); unBeacon('heist'); if (clean && R.skin('s3_clean')) setTimeout(() => showCard('NEW SKIN', 'Clean Hands', 'You took the ledger without a single guard seeing you. Wear it from the Wardrobe.', 5600), 400);
        setTimeout(() => ledgerFight(at), clean ? 6200 : 600); } };
    function raise(F, why){ const D = F.data; if (D.alarm) return; D.alarm = 1; F.say(`${why} ALARM! The doors slam into lockdown.`, 3000); F.tone(880, .3, 'square', .05); setTimeout(() => F.tone(660, .3, 'square', .05), 300);
      F.foes().forEach(u => { u.stun = 0; if (u.cone) u.cone.visible = false; }); [[9, -8], [-9, -8]].forEach(([x, z]) => F.add(H('gunner'), x, z, { cover: 1 })); [[0, -18.5, 'none', 2.4], [-10, -15, 'none', 1.6], [10, -15, 'none', 1.6]].forEach(([x, z, t, r]) => { F.cover(x, z, t, r); const w = new THREE.Mesh(new THREE.BoxGeometry(r * 2, 3, .4), M(0x8A2A1A)); w.position.set(x, 1.5, z); F.par().add(noPick(w)); }); }
    fightGo(o);
  };
  function ledgerFight(at){
    const go = () => streetFight('ledger', at, { title: 'The Ledger', boss: { name: 'The Ledger', hp: 1150, kind: 'ranged', dmg: 6, cd: .85, speed: 3.3, r: .6, col: 0xF4F1E8 }, outfit: CAST.units.ledger.outfit, bossAt: [0, -12], goal: 'Beat the Ledger', noAutoWin: 1,
      cover: [[-4, -4, 'crate'], [4, -5, 'crate'], [0, -8, 'none', 1.2]], after(won){ if (!won) beacon('ledger', at); }, intro: 'The accountant himself. Smash his alarms before he calls the whole building, and watch for the traps.',
      setup(F){ Object.assign(F.data, { trap: 4, al: 3, safe: 6, spawn: 4 }); },
      hud: F => `The Ledger ${Math.max(0, Math.round(F.boss ? F.boss.hp / F.boss.max * 100 : 0))}%${F.foes().some(u => u.hero === H('pylon')) ? ' · ALARMS RINGING: smash them' : ''}`,
      step(dt, F){ const b = F.boss, D = F.data, [px, pz] = F.me; if (!b || b.dead > 0) return F.win();
        if ((D.trap -= dt) <= 0) { D.trap = 6; F.say('Floor traps click open around you!', 1300); ring(3, 3.2, Math.random() * 6).forEach(([x, z]) => F.mark(px + x, pz + z, 1.6, 0xFFC93C, 1.6, m => { F.ring(m.x, m.z, 1.6, 0xFFC93C); if (F.near(m.x, m.z, m.r)) F.hurt(12, b); }, true)); }
        if ((D.al -= dt) <= 0) { D.al = 15; if (!F.foes().some(u => u.hero === H('pylon'))) { F.say('He hits an alarm button. Smash the alarms or the guards keep coming!', 2600); [[-8, -10], [8, -10]].forEach(([x, z]) => F.add(H('pylon'), x, z)); } }
        if (F.foes().some(u => u.hero === H('pylon')) && (D.spawn -= dt) <= 0) { D.spawn = 5.5; if (F.foes().filter(u => u.hero === H('guard')).length < 3) F.add(H('guard'), (Math.random() - .5) * 16, -14); }
        if ((D.safe -= dt) <= 0) { D.safe = 5.5; F.mark(px, pz, 1.9, 0xE8901A, 1.5, m => { F.ring(m.x, m.z, 1.9, 0xE8901A); F.shake(.4); if (F.near(m.x, m.z, m.r)) F.hurt(20, b); }); } } },
      () => { st.p2.ledger = 1; save(); ledgerOut(at); });
    if (!st.seen.includes('ledger_in')) { const a = who('ledger', at[0], at[1] - 12, 0, [at[0], at[1]]); scene('ledger_in', [{ d: 4, start(){ if (a) scAdd(a.g); }, on(f, t){ a && a.anim(t, 0, 0); }, cam: f => [at[0] + 2 - f, 1.5, at[1] - 7], look: () => [at[0], 1.6, at[1] - 12], name: ['THE SYNDICATE’S ACCOUNTANT', 'THE LEDGER', 'He doesn’t look up from his pages until you’re close enough to touch.'] }], go); } else go();
  }
  const posterTex = () => posterTex.t || (posterTex.t = R.tex(256, 340, (c, w, h) => { c.fillStyle = '#EDE6D2'; c.fillRect(0, 0, w, h); c.fillStyle = '#C8102E'; c.font = '900 46px Georgia,serif'; c.textAlign = 'center'; c.fillText('MISSING', w / 2, 52);
    c.fillStyle = '#8A8F99'; c.fillRect(58, 70, 140, 150); c.fillStyle = '#F2D2B0'; c.beginPath(); c.arc(128, 135, 42, 0, 7); c.fill(); c.strokeStyle = '#16181D'; c.lineWidth = 4; c.strokeRect(100, 124, 22, 14); c.strokeRect(134, 124, 22, 14);
    c.fillStyle = '#16181D'; c.font = '800 22px Georgia,serif'; c.fillText('K. RAVINDRAN', w / 2, 250); c.font = '600 17px Georgia,serif'; c.fillText('City tax inspector', w / 2, 276); c.fillText('Last seen: the night of the flood', w / 2, 300); }));
  function ledgerOut(at){
    const a = who('ledger', at[0], at[1] - 6, 0, [at[0], at[1]]), b = places().count, [bx] = ctr(b), post = new THREE.Mesh(new THREE.PlaneGeometry(.9, 1.2), new THREE.MeshBasicMaterial({ map: posterTex() })); post.position.set(at[0] + 1.6, 1.7, b.z1 + .1);
    scene('ledger_out', [
      { d: 4.2, start(){ if (a) { scAdd(a.g); a.g.rotation.x = -.4; } }, cam: () => [at[0] + 1.6, 1.4, at[1] - 2.4], look: () => [at[0], 1, at[1] - 6], say: 'His glasses fall off. Without them, you know that face.' },
      { d: 4.4, start(){ scAdd(post); }, cam: f => [at[0] + 1.6, 1.7, b.z1 + 1.8 - f * .5], look: () => [at[0] + 1.6, 1.7, b.z1], name: ['THE LEDGER IS', 'MR. RAVINDRAN', 'The city’s tax inspector. Everyone thought he drowned. His face is on every wall in Old Town.'] },
      { d: 3.6, cam: () => [at[0] + 1.2, 1.3, at[1] - 3], look: () => [at[0], 1.2, at[1] - 6], say: '“Thirty-one years at the tax office, and do you know how many people tried to bribe me? Not one. She was the first person who thought I was worth buying.”' }],
      () => { lostGo = false; setTimeout(lostFight, 400); });
  }
  let lostGo = false;
  function lostFight(){
    if (lostGo) return; lostGo = true;
    const at = mapNow(), car = R.makeVehicle('car', 0x16181D, R.BL.mapG); car.g.traverse(o => o.userData.noPick = true); const [cx, cz] = spot(at[0] - 10, at[1] - 4);
    const br = who('brass', at[0] - 5, at[1] + 3, 0, at), ve = who('velvet', at[0] - 6, at[1] - 3, 0, at);
    scene('trap', [
      { d: 3.8, start(C){ car.g.position.set(cx, 0, cz); car.g.rotation.y = .4; SC.objs.push(car.g); [br, ve].forEach(q => q && scAdd(q.g)); R.tone(300, .6, 'sawtooth', .05, 90); }, on(f, t){ [br, ve].forEach((q, i) => q && q.anim(t + i, 0, 0)); }, cam: f => [at[0] + 3, 1.6, at[1] + 4], look: () => [at[0] - 5, 1.5, at[1]], name: ['OUT OF THE COUNTING HOUSE', 'STRAIGHT INTO A TRAP', 'Brass, back on his feet. And Velvet, the Syndicate’s driver.'] },
      { d: 3.2, cam: () => [cx + 3, 1.2, cz + 3], look: () => [cx, 1, cz], say: 'The back door of the black car opens. Nobody gets out yet.' }],
      () => fightGo({ id: 'lost', title: 'Brass and Velvet', at, goal: 'Survive', boss: { name: 'Brass', hp: 99999, kind: 'melee', dmg: 9, range: 3, cd: 1, speed: 3.8, r: 1, scale: 1.5 }, outfit: BRASS_O, bossAt: [-6, 3],
        cover: [[4, 4, 'crate'], [-4, -6, 'car']], intro: 'Brass and Velvet together. Fight back!',
        setup(F){ F.data.round = 0; F.data.rt = 7; F.data.pun = 3; F.add(H('velvet'), -6, -3, { cover: 1 }); },
        hud: F => `Round ${F.data.round + 1} · Brass is getting stronger`,
        hit(u, d){ return u.hero === H('velvet') || u.boss ? d * .04 : d; },
        step(dt, F){ const D = F.data, b = F.boss; if ((D.rt -= dt) <= 0) { D.rt = 7; D.round++; F.say(['He shrugs it off.', 'Every hit lands harder.', 'Nothing you do even slows him down.', 'Your legs are going.'][Math.min(3, D.round - 1)], 1800); }
          if (b && (D.pun -= dt) <= 0) { D.pun = 2.6; if (Math.hypot(F.me[0] - b.x, F.me[1] - b.z) < 3.6) { F.hurt(5 + D.round * 3, b); F.shake(.3); } }
          if (F.hp < F.maxHp * .22) F.win(); },
        end(){ pinned(at, cx, cz); } }));
  }
  function pinned(at, cx, cz){
    const mg = who('marigold', cx + 1.2, cz + 1, 0, at);
    scene('pinned', [
      { d: 4, start(){ if (mg) scAdd(mg.g); cine.querySelector('.s3black').style.opacity = '0'; }, on(f, t){ if (mg) { mg.g.position.set(cx + 1.2 + (at[0] - cx - 1.2) * f * .8, 0, cz + 1 + (at[1] - cz - 1) * f * .8); mg.anim(t, f < 1 ? 1 : 0, 0); } }, cam: () => [at[0] + .4, .5, at[1] + .6], look: f => [cx + (at[0] - cx) * f * .8, 1.5, cz + (at[1] - cz) * f * .8], name: ['THE HEAD OF THE SYNDICATE', 'MADAME MARIGOLD', 'Brass steps out of her way without being asked.'] },
      { d: 4.6, start(){ R.tone(1200, .2, 'sine', .02); }, cam: () => [at[0] + .3, .45, at[1] + .4], look: () => [at[0] - .6, 1.6, at[1] - .5], say: 'She takes the ledger out of your hands, pins a marigold to your jacket and straightens it, the way an aunt would before a wedding. “There. Now people will know whose you are.”' },
      { d: 2, start(){ cine.querySelector('.s3black').style.opacity = '1'; R.tone(50, 1.6, 'sawtooth', .05, 30); }, cam: () => [at[0] + .3, .45, at[1] + .4], look: () => [at[0] - .6, 2.4, at[1] - .5] }],
      () => wakeJeep());
  }
  function wakeJeep(){
    const at = mapNow(), jeep = R.makeVehicle('jeep', 0x5A6A3A, R.BL.mapG); jeep.g.traverse(o => o.userData.noPick = true); const [jx, jz] = spot(at[0] + 3, at[1]); const dv = who('devi', jx - .4, jz + .3, .3, [jx + 5, jz]), co = who('collector', jx + 9, jz + 4, 0, [jx, jz]);
    scene('jeep', [
      { d: 4.4, start(){ jeep.g.position.set(jx, 0, jz); jeep.g.rotation.y = Math.PI / 2; SC.objs.push(jeep.g); [dv, co].forEach(q => q && scAdd(q.g)); setTimeout(() => { if (SC) cine.querySelector('.s3black').style.opacity = '0'; }, 900); }, on(f, t){ dv && dv.anim(t, 0, 0); }, cam: () => [jx + .5, 1.25, jz - .4], look: () => [jx - .4, 1.4, jz + .4], say: 'You wake up in the passenger seat of Devi’s jeep. She hands you a bottle of water. “I got there as they drove off.” “They took the book.” “I know.”' },
      { d: 4.6, on(f, t){ if (co) { co.g.position.set(jx + 9 - f * 6, 0, jz + 4); co.anim(t, 1, 0); if (co.arms && co.arms[0]) co.arms[0].a.rotation.x = f > .3 && f < .6 ? -2.6 : 0; } }, cam: () => [jx + .6, 1.3, jz - .2], look: f => [jx + 9 - f * 6, 1.5, jz + 4], say: 'A collector walking past snaps Devi a salute, freezes, and turns it into a wave.' },
      { d: 3.4, start(){ title('PART 2 COMPLETE', 'THE LEDGER'); }, cam: f => [jx + 6, 2.5 + f * 2, jz + 6], look: () => [jx, 1, jz], say: 'She drives you home the long way, past the counting house. Its lights are already off.' }],
      () => { st.p2.lost = 1; save(); const d3 = 15 - R.info().day; showCard('PART 2 COMPLETE', 'The Ledger', d3 > 0 ? `Part 3 unlocks in ${d3} day${d3 > 1 ? 's' : ''}.` : 'Part 3 is on its way.', 6000); });
  }

  // ---------- Part 3 · The Velvet Run: the rope launcher, the Comet, the convoys, and Velvet on the highway ----------
  let comet = null;
  function parkComet(){ if (comet || !st.comet) return; const [mx, mz] = mapNow(), [x, z] = spot(mx + 5, mz + 3); const v = R.makeVehicle('comet', 0, R.BLC.carG); Object.assign(v, { x, z, y: 0, h: 0, name: 'the Comet', parked: true, fx: 0, fz: 1 }); v.g.position.set(x, 0, z); R.BLC.parked.push(v); comet = v; return v; }
  function p3Start(){ st.p3.start = 1; save(); const c = dist('market').c; beacon('lata', c, 'Lata');
    R.dlgPlay([['Devi', '📻 The book is leaving the city in pieces, in trucks. Velvet’s driving the route. I can’t follow trucks.'], ['Devi', '📻 And Lata on your corner has been asking for you. Three times today.']], { block: false, done: () => { R.PH.wp = c.slice(); showCard('PART 3', 'The Velvet Run', 'Lata is waiting at the Market Street light.', 5200); } }); }
  BEACON.lata = () => { unBeacon('lata'); const c = dist('market').c, a = who('lata', c[0] + 1.5, c[1], 0, mapNow()); if (a) R.BL.mapG.add(a.g);
    R.dlgPlay([['Lata', 'My brother rigged cranes for thirty years. When the water came, he built this so we could get between the roofs.'], ['Lata', 'It throws a line at a ledge. He made me promise to give it to someone who’d use it for something.'], ['Lata', 'And take Arjun’s car. He calls it the Comet. He also calls the cat Thunder, so.'], ['ME', 'He won’t mind?'], ['Lata', 'He’s in Dubai. He can mind from there.']],
      { block: true, done: () => { if (a && a.g.parent) a.g.parent.remove(a.g); st.rope = 1; st.comet = 1; save(); R.pk.rope(true); parkComet(); if (R.garComet) R.garComet(); chime();
        showCard('NEW TOOLS', 'Rope launcher and the Comet', `${R.fine ? 'Aim at a building and hold Q' : 'Aim and hold Swing'} to swing; land on any roof. In the Comet: ${R.fine ? 'Shift for nitro, F for tyre spikes' : 'Nitro and Spikes buttons'}. Both are yours to keep.`, 8000); convoyStart(); } }); };
  // convoys drive the road graph; stop one by dropping on it from a roof, or with three spike hits from the Comet
  const convoys = [], spikes = [];
  function nodeNear(x, z, rmin = 0, rmax = 1e9){ const N = (R.BLC.nodes || []).filter(n => { const d = Math.hypot(n.x - x, n.z - z); return d >= rmin && d <= rmax && Math.abs(n.x) < 340 && Math.abs(n.z) < 340; }); return N.length ? N[Math.floor(Math.random() * N.length)] : null; }
  function roadCar(type, col, n, sp){ const v = R.makeVehicle(type, col, R.BL.mapG); v.g.traverse(o => o.userData.noPick = true); const c = { v, x: n.x, z: n.z, node: n, prev: null, tgt: null, h: 0, sp, hits: 0 }; v.g.position.set(n.x, 0, n.z); return c; }
  function roadStep(c, dt, pick){ if (!c.tgt) { const L = (c.node.out || []).filter(o => o !== c.prev); c.tgt = pick ? pick(L.length ? L : c.node.out || []) : (L.length ? L : c.node.out || [])[Math.floor(Math.random() * (L.length || (c.node.out || []).length))]; if (!c.tgt) return; }
    const dx = c.tgt.x - c.x, dz = c.tgt.z - c.z, d = Math.hypot(dx, dz); if (d < 1.5) { c.prev = c.node; c.node = c.tgt; c.tgt = null; return; }
    const want = Math.atan2(dx, dz); let da = Math.atan2(Math.sin(want - c.h), Math.cos(want - c.h)); c.h += Math.max(-dt * 3, Math.min(dt * 3, da)); const k = c.sp * (Math.abs(da) > .6 ? .5 : 1); c.x += dx / d * Math.min(d, k * dt); c.z += dz / d * Math.min(d, k * dt);
    c.v.g.position.set(c.x, 0, c.z); c.v.g.rotation.y = c.h; Object.assign(c.v, { x: c.x, z: c.z, h: c.h }); }
  function convoyStart(){ if (!R.BLC.nodes || !R.BLC.nodes.length) return; const [mx, mz] = mapNow();
    [0, 1, 2].forEach(i => { if (st.p3.conv.includes(i) || convoys.some(c => c.i === i)) return; const n = nodeNear(mx, mz, 70, 170) || R.BLC.nodes[0]; const c = roadCar('truck', 0x16181D, n, 9); c.i = i; const fl = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.4), stampMat()); fl.position.set(0, 2.2, -2.2); fl.rotation.y = Math.PI; c.v.g.add(fl); const top = glow(ORANGE, 2.4, .9); top.position.y = 4.6; c.v.g.add(top); convoys.push(c); }); }
  function stopConvoy(c, how){ if (c.stopped) return; c.stopped = 1; R.tone(90, .6, 'sawtooth', .05, 40); const at = [c.x, c.z], decoy = c.i === 1;
    R.say(how === 'drop' ? 'You drop out of the sky onto the cab roof. The truck slews to a halt.' : 'The spikes shred its tyres. The truck grinds to a stop.', 2600);
    setTimeout(() => { if (decoy) R.say('The back of the truck is empty. It’s a decoy, and it’s an ambush!', 2600);
      streetFight('conv' + c.i, at, decoy ? { title: 'The decoy', goons: 4, gunners: 2, sniper: 1, cover: [[0, 0, 'none', 2.6], [6, 4, 'crate'], [-6, -4, 'crate']], after: won => { if (!won) { c.stopped = 0; c.hits = 0; } } } : { title: 'A convoy', goons: 2, gunners: 1, cover: [[0, 0, 'none', 2.6]], after: won => { if (!won) { c.stopped = 0; c.hits = 0; } } },
        () => { st.p3.conv.push(c.i); save(); c.v.g.parent && c.v.g.parent.remove(c.v.g); convoys.splice(convoys.indexOf(c), 1); const n = st.p3.conv.length; R.say(n >= 3 ? 'That was the last convoy. Velvet’s going to come for it herself…' : `Convoy stopped${decoy ? '' : ': a stack of ledger pages, back in Devi’s hands'}. ${3 - n} to go.`, 3600); if (n >= 3) setTimeout(velvetStart, 3800); }, ) || (c.stopped = 0); }, 1200); }
  function fireSpikes(){ const p = R.DRV.p; spikesCd = .8; const g = new THREE.Group(); for (let i = 0; i < 4; i++) { const s = new THREE.Mesh(new THREE.ConeGeometry(.12, .3, 4), M(0x8A8F99)); s.position.set((i - 1.5) * .3, .15, 0); g.add(s); } g.position.set(p.x + p.fx * 2.6, 0, p.z + p.fz * 2.6); R.BL.mapG.add(noPick(g)); const sp = Math.abs(R.DRV.spd || 0) + 26; spikes.push({ g, x: g.position.x, z: g.position.z, vx: p.fx * sp, vz: p.fz * sp, t: 1.1 }); R.tone(500, .1, 'square', .04, 200); }
  function spikeStep(dt){ spikesCd = Math.max(0, spikesCd - dt); for (let i = spikes.length - 1; i >= 0; i--) { const s = spikes[i]; s.t -= dt; s.x += s.vx * dt; s.z += s.vz * dt; s.g.position.set(s.x, 0, s.z);
    const hit = [...convoys.filter(c => !c.stopped), ...(velvet && !velvet.down ? [velvet] : [])].find(c => Math.hypot(c.x - s.x, c.z - s.z) < 3.4);
    if (hit) { s.t = 0; hit.hits++; R.tone(900, .08, 'square', .04, 400); if (hit === velvet) velvetHit('spikes'); else if (hit.hits >= 3) stopConvoy(hit, 'spikes'); else R.say(`Spikes hit! (${3 - hit.hits} more)`, 1100); }
    if (s.t <= 0) { R.BL.mapG.remove(s.g); spikes.splice(i, 1); } } }
  R.pk.onLand = (at, sup, fall) => { if (fall < 7 || sup > .3) return; const c = convoys.find(q => !q.stopped && Math.hypot(q.x - at[0], q.z - at[1]) < 7); if (c) stopConvoy(c, 'drop'); else if (fall > 9 && !st.toldDrop) { st.toldDrop = 1; save(); R.say('Nice drop. Land on top of a convoy truck like that and it stops dead.', 3000); } };
  // Velvet: she runs the road graph away from you; five hits (spikes or rams) and she spins out
  let velvet = null;
  function velvetStart(){ if (velvet || st.p3.velvet) return; const [mx, mz] = mapNow(), n = nodeNear(mx, mz, 30, 60) || nodeNear(mx, mz); if (!n) return; velvet = roadCar('car', 0x5A1E4A, n, 19); velvet.ram = 0;
    const tl = glow(0xFF3A2A, 1, .9); tl.position.set(0, .8, -2.2); velvet.v.g.add(tl);
    scene('velvet_in', [{ d: 3.6, start(){ const a = who('velvet', 0, 0); if (a) { a.g.position.set(.4, .4, .2); a.g.scale.setScalar(.9); velvet.v.g.add(a.g); velvet.av = a; } }, cam: f => [velvet.x + 5 - f * 2, 1.4, velvet.z + 5], look: () => [velvet.x, 1, velvet.z], name: ['THE SYNDICATE’S DRIVER', 'VELVET', 'She drove an ambulance before the flood.'] }],
      () => { if (!(R.DRV.on && R.DRV.p)) { const v = comet && R.BLC.parked.includes(comet) ? comet : parkComet() || comet; if (v) { const [mx2, mz2] = mapNow(), [x, z] = spot(mx2 + 3, mz2); Object.assign(v, { x, z }); v.g.position.set(x, 0, z); } } R.say(`Get in the Comet and run her down! Spike her (${R.fine ? 'F' : 'Spikes'}) or ram her five times.`, 4400); }); }
  function velvetHit(how){ const V0 = velvet; if (!V0 || V0.down) return; V0.hp = (V0.hp || 5) - 1; R.tone(140, .3, 'sawtooth', .05, 70); if (V0.hp > 0) return R.say(`${how === 'ram' ? 'You slam into her back bumper!' : 'Spikes in her tyres!'} (${V0.hp} more)`, 1300); V0.down = 1; velvetOut(); }
  function velvetStep(dt, t, mx, mz){ const V0 = velvet; if (!V0 || V0.down || SC) return; const px = R.DRV.on && R.DRV.p ? R.DRV.p.x : mx, pz = R.DRV.on && R.DRV.p ? R.DRV.p.z : mz, d = Math.hypot(px - V0.x, pz - V0.z);
    V0.sp = d < 25 ? 21 : d > 90 ? 9 : 16; roadStep(V0, dt, L => L.slice().sort((a, b) => Math.hypot(b.x - px, b.z - pz) - Math.hypot(a.x - px, a.z - pz))[Math.random() < .75 ? 0 : Math.min(1, L.length - 1)]);
    if (R.DRV.on && R.DRV.p && d < 4 && Math.abs(R.DRV.spd || 0) > 9 && t > V0.ram) { V0.ram = t + 1.3; R.DRV.spd *= .55; velvetHit('ram'); }
    if (d > 190) { const n = nodeNear(px, pz, 60, 100); if (n) { Object.assign(V0, { x: n.x, z: n.z, node: n, prev: null, tgt: null }); R.say('You lost her… there! Two streets over.', 2000); } }
    R.PH.wp = [V0.x, V0.z]; }
  function velvetOut(){ const V0 = velvet, [x, z] = [V0.x, V0.z];
    scene('velvet_out', [
      { d: 3.4, on(f){ V0.v.g.rotation.y = V0.h + f * 4; V0.v.g.position.set(x + Math.sin(V0.h) * f * 6, 0, z + Math.cos(V0.h) * f * 6); }, cam: () => [x + 8, 2.5, z + 8], look: () => [x, .8, z], say: 'Her car spins across three lanes and folds into a lamp post.' },
      { d: 4.6, start(){ if (V0.av) { V0.v.g.remove(V0.av.g); V0.av.g.position.set(x + 2, 0, z + 1); V0.av.g.rotation.set(0, 0, 0); scAdd(V0.av.g); } }, on(f, t){ V0.av && V0.av.anim(t, 0, 0); }, cam: () => [x + 4, 1.5, z + 3.4], look: () => [x + 2, 1.5, z + 1], say: 'She sits down on the kerb and wipes her mouth. “She was going to hand me to the police, you know. She’d already picked out the cell.”' },
      { d: 5, cam: () => [x + 3.4, 1.55, z + 2.6], look: () => [x + 2, 1.6, z + 1], say: '“There’s a page missing from the book. The payroll. She went through it twice looking for it, and decided I’d taken it.” She laughs once. “I didn’t.”' },
      { d: 3.4, start(){ title('PART 3 COMPLETE', 'THE VELVET RUN'); }, cam: f => [x + 14, 6 + f * 4, z + 14], look: () => [x, 1, z] }],
      () => { st.p3.velvet = 1; save(); if (V0.v.g.parent) V0.v.g.parent.remove(V0.v.g); velvet = null; R.PH.wp = null; const d4 = 22 - R.info().day; showCard('PART 3 COMPLETE', 'The Velvet Run', d4 > 0 ? `Velvet is out. The finale unlocks in ${d4} day${d4 > 1 ? 's' : ''}.` : 'Velvet is out. Now for Marigold.', 6000); }); }

  // ---------- Part 4 · Marigold: the lobby, the swing route past the snipers, the rooftop chase, the greenhouse ----------
  const towerAt = () => places().ts.slice();
  function route(){ const Pl = places(); if (Pl.route) return Pl.route; const T = Pl.tower, [tx, tz] = ctr(T);
    const C = Pl.B.filter(b => b !== T && b.h >= 7 && b.h < T.h - 3 && Math.hypot(ctr(b)[0] - tx, ctr(b)[1] - tz) > 14 && Math.hypot(ctr(b)[0] - tx, ctr(b)[1] - tz) < 95).sort((a, b) => a.h - b.h);
    const pick = [.2, .55, .9].map(f => C[Math.min(C.length - 1, Math.floor(C.length * f))]).filter((b, i, A) => b && A.indexOf(b) === i);
    const rest = Pl.B.filter(b => b !== T && !pick.includes(b) && b.h > 9).sort((a, b) => Math.hypot(ctr(a)[0] - tx, ctr(a)[1] - tz) - Math.hypot(ctr(b)[0] - tx, ctr(b)[1] - tz)).slice(0, 2);
    Pl.route = pick; Pl.chase = [T, ...rest]; return pick; }
  const onRoof = b => { const SW = R.SW, [mx, mz] = mapNow(); return SW && SW.roof > 0 && Math.abs(SW.roof - b.h) < 1.2 && mx > b.x0 - .5 && mx < b.x1 + .5 && mz > b.z0 - .5 && mz < b.z1 + .5; };
  let roofMk = null;
  function roofMark(b){ if (roofMk) R.BL.mapG.remove(roofMk); if (!b) { roofMk = null; return; } const [x, z] = ctr(b), g = new THREE.Group(); g.position.set(x, b.h, z); const r = new THREE.Mesh(new THREE.RingGeometry(2, 2.6, 32), new THREE.MeshBasicMaterial({ color: ORANGE, transparent: true, opacity: .8, side: THREE.DoubleSide, depthWrite: false })); r.rotation.x = -Math.PI / 2; r.position.y = .08; g.add(r); const gl = glow(ORANGE, 3, .9); gl.position.y = 2.4; g.add(gl); roofMk = noPick(g); R.BL.mapG.add(g); R.PH.wp = [x, z]; }
  function p4Start(){ st.p4.start = 1; save(); route(); beacon('lobby', towerAt(), 'Marigold’s tower');
    R.dlgPlay([['Devi', '📻 She’s in the tower with the glass garden on top. I’ll take the service door.'], ['Devi', '📻 They’ll be watching the stairs, so go up the outside. There are rifles on the roofs around it.'], ['Devi', '📻 Trust me.']],
      { block: false, done: () => { R.PH.wp = towerAt(); showCard('PART 4 · FINALE', 'Marigold', 'Storm the tower: the lobby, the outside, the roof, the greenhouse.', 6000); } }); }
  BEACON.lobby = () => streetFight('lobby', beacons.lobby.at, { title: 'The lobby', goons: 5, gunners: 3, sniper: 1, cover: [[5, 3, 'car'], [-5, 3, 'car'], [0, -6, 'crate'], [7, -5, 'crate'], [-7, -5, 'crate']], intro: 'The lobby is full of her people. Use the cars for cover.' },
    () => { st.p4.lobby = 1; save(); unBeacon('lobby'); roofMark(route()[0]); R.say(`The stairwell is blocked solid. Go up the outside: ${R.fine ? 'hold Q' : 'hold Swing'} at a building, roof to roof, to the marked rooftops.`, 5200); });
  // snipers: while you're on the route roofs, a red dot finds you; stand still and the shot knocks you off
  let dot = null, dotT = 3;
  function sniperStep(dt){ const SW = R.SW; if (!SW || SW.roof <= 0) { if (dot) { R.BL.mapG.remove(dot.g); dot = null; } dotT = 2.5; return; } const [mx, mz] = mapNow();
    if (!dot && (dotT -= dt) <= 0) { const g = glow(0xFF2A2A, 1.4, .95); g.position.set(mx, SW.roof + .1, mz); R.BL.mapG.add(g); dot = { g, x: mx, z: mz, t: 1.5 }; R.tone(1500, .1, 'square', .02); if (!st.toldDot) { st.toldDot = 1; R.say('A red dot on the roof by your feet: a sniper. Keep moving!', 2600); } }
    if (dot) { dot.t -= dt; dot.g.scale.setScalar(1 + (1.5 - dot.t) * .6); if (dot.t <= 0) { R.BL.mapG.remove(dot.g); const hit = Math.hypot(mx - dot.x, mz - dot.z) < 2.2; dot = null; dotT = 3.5 + Math.random() * 1.5; R.tone(220, .3, 'sawtooth', .05, 80);
      if (hit) { R.say('The shot clips you and knocks you clean off the roof!', 2200); SW.on = true; SW.roof = 0; const a = Math.random() * 6.28; R.cityV().set(Math.cos(a) * 6, 4, Math.sin(a) * 6); document.body.classList.add('pain'); setTimeout(() => document.body.classList.remove('pain'), 300); } } } }
  let mgRun = null;
  function chaseSetup(){ if (mgRun) return; route(); const L = places().chase, a = who('marigold', 0, 0); if (!a) return; R.BL.mapG.add(a.g); mgRun = { a, i: 0, L, hop: null }; const [x, z] = ctr(L[0]); a.g.position.set(x, L[0].h, z); roofMark(null); R.PH.wp = [x, z]; }
  function mgStep(dt, t){ const C = mgRun; if (!C) return; const b = C.L[C.i], [bx, bz] = ctr(b), [mx, mz] = mapNow(), py = R.pos.y - 1.6;
    if (C.hop) { const Q = C.hop; Q.t += dt; const f = Math.min(1, Q.t / 1.3), [ax, az] = ctr(Q.a), [cx, cz] = ctr(Q.b); C.a.g.position.set(ax + (cx - ax) * f, Q.a.h + (Q.b.h - Q.a.h) * f + Math.sin(f * Math.PI) * 6, az + (cz - az) * f); C.a.g.rotation.y = Math.atan2(-(cx - ax), -(cz - az)); if (f >= 1) C.hop = null; try { C.a.anim(t * 1.5, 1, 0); } catch (e) {} return; }
    C.a.g.position.set(bx, b.h, bz); C.a.g.rotation.y = Math.atan2(-(mx - bx), -(mz - bz)); try { C.a.anim(t, 0, 0); } catch (e) {} const d3 = Math.hypot(mx - bx, mz - bz, py - b.h);
    if (C.i < C.L.length - 1 && d3 < 16) { C.hop = { a: b, b: C.L[C.i + 1], t: 0 }; C.i++; R.say(['She runs for the edge and jumps to the next roof, petals trailing from her lapel!', 'Over another gap. She’s heading for her greenhouse!'][Math.min(1, C.i - 1)], 2400); R.PH.wp = ctr(C.L[C.i]); return; }
    if (C.i === C.L.length - 1 && d3 < 4.5) { C.a.g.parent && C.a.g.parent.remove(C.a.g); mgRun = null; st.p4.chase = 1; save(); R.say('You grab her sleeve. She twists free and dives through a glass door into her greenhouse. Follow her in!', 4000); const at = towerAt(); beacon('green', at, 'The greenhouse'); R.PH.wp = at.slice(); } }
  BEACON.green = () => { const at = beacons.green.at;
    const go = () => streetFight('marigold', at, { title: 'Madame Marigold', boss: { name: 'Madame Marigold', hp: 1700, kind: 'melee', dmg: 12, range: 2.8, cd: .9, speed: 4.2, r: .6 }, outfit: CAST.units.marigold.outfit, bossAt: [0, -9], goal: 'Beat Madame Marigold', noAutoWin: 1,
      intro: 'Her greenhouse is full of plants from the tear. While the glowing pods live, they shield her: smash them first.',
      setup(F){ Object.assign(F.data, { pet: 4, th: 6.5, p2: 0 }); const par = F.par();
        for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283, p = new THREE.Mesh(new THREE.PlaneGeometry(5.6, 4.6), new THREE.MeshPhongMaterial({ color: 0xCFEFF2, transparent: true, opacity: .2, side: THREE.DoubleSide, depthWrite: false, shininess: 90 })); p.position.set(Math.cos(a) * 15, 2.3, Math.sin(a) * 15); p.rotation.y = -a + Math.PI / 2; par.add(noPick(p)); }
        for (let i = 0; i < 9; i++) { const a = i / 9 * 6.283 + .3, g = new THREE.Group(); g.position.set(Math.cos(a) * 12, 0, Math.sin(a) * 12); for (let k = 0; k < 4; k++) { const l = new THREE.Mesh(new THREE.ConeGeometry(.25, 1.6 + k * .3, 5), M(0x6A3AA8, { emissive: 0x2A0A4A })); l.position.set(Math.cos(k * 1.6) * .4, .8 + k * .15, Math.sin(k * 1.6) * .4); l.rotation.z = Math.cos(k) * .4; g.add(l); } const gl = glow(0xB06AFF, 1.6, .7); gl.position.y = 2.2; g.add(gl); par.add(noPick(g)); }
        pods(F); },
      hud: F => `Madame Marigold ${Math.max(0, Math.round(F.boss ? F.boss.hp / F.boss.max * 100 : 0))}%${F.foes().some(u => u.hero === H('pod')) ? ' · shielded by the pods' : ''}`,
      step(dt, F){ const b = F.boss, D = F.data, [px, pz] = F.me; if (!b || b.dead > 0) return F.win();
        if (!D.p2 && b.hp < b.max * .5) { D.p2 = 1; pods(F); F.say('“You’ve ruined my lapel.” She drops the cane and draws the blade inside it. The pods bloom again!', 3200); }
        if ((D.pet -= dt) <= 0) { D.pet = D.p2 ? 3.4 : 4.5; const a = Math.atan2(px - b.x, pz - b.z); F.tone(900, .2, 'sine', .02, 600); for (let i = -2; i <= 2; i++) for (let k = 1; k <= 3; k++) F.mark(b.x + Math.sin(a + i * .28) * k * 3, b.z + Math.cos(a + i * .28) * k * 3, 1.1, 0xE8901A, 1 + k * .12, m => { if (F.near(m.x, m.z, m.r)) F.hurt(7, b); }); }
        if ((D.th -= dt) <= 0) { D.th = D.p2 ? 5.5 : 7; const dx = px - b.x, dz = pz - b.z, d = Math.hypot(dx, dz) || 1; F.say('Thorn vines tear up through the floor!', 1300); for (let k = 1; k <= 9; k++) F.mark(b.x + dx / d * k * 2.2, b.z + dz / d * k * 2.2, 1.2, 0x8A4AE8, 1.3, m => { if (F.near(m.x, m.z, m.r)) F.hurt(11, b); }, true); } },
      after(won){ if (won) unBeacon('green'); } }, () => { st.p4.boss = 1; save(); finale(at); });
    // three pods round the room; while any lives, she takes almost nothing
    function pods(F){ ring(3, 9, Math.random() * 6).forEach(([x, z]) => { const u = F.add(H('pod'), x, z); const old = u.av && u.av.g; if (old && old.parent) old.parent.remove(old); const g = new THREE.Group(); const s = new THREE.Mesh(new THREE.SphereGeometry(.7, 14, 10), new THREE.MeshBasicMaterial({ color: 0xB06AFF })); s.position.y = .9; g.add(s); g.add(u.tag); u.tag.position.y = 2; F.par().add(g); u.av = { g, hold(){}, anim(t){ s.scale.setScalar(1 + Math.sin(t * 5) * .1); } }; }); }
    if (!st.seen.includes('green_in')) { const a = who('marigold', at[0], at[1] - 9, 0, at); scene('green_in', [{ d: 4.4, start(){ if (a) scAdd(a.g); }, on(f, t){ a && a.anim(t, 0, 0); }, cam: f => [at[0] + 3 - f * 2, 1.6, at[1] - 4], look: () => [at[0], 1.6, at[1] - 9], name: ['IN HER GLASS GARDEN', 'MADAME MARIGOLD', 'Nothing growing in this room is from anywhere on Earth.'] }], go); } else go();
  };
  // the finale: her last words, Devi, the fall, and the lights going out
  function petals(n, x, y, z, spread, up){ const L = []; for (let i = 0; i < n; i++) { const p = new THREE.Mesh(new THREE.PlaneGeometry(.22, .14), new THREE.MeshBasicMaterial({ color: [0xE8901A, 0xFFB04A, 0xD8701A][i % 3], side: THREE.DoubleSide })); p.position.set(x + (Math.random() - .5) * spread, y + (Math.random() - .5) * spread, z + (Math.random() - .5) * spread); scAdd(p); L.push({ p, v: V((Math.random() - .5) * 1.5, up ? 2 + Math.random() * 3 : -.6 - Math.random() * .8, (Math.random() - .5) * 1.5) }); } return L; }
  function finale(at){
    const T = places().tower, [tx, tz] = ctr(T), h = T.h, ez = T.z1 - .8, mg = who('marigold', tx, ez, h, [tx, ez - 6]), dv = who('devi', tx + 3, ez - 6, h, [tx, ez]); let pt = [], down = [];
    const door = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.6, 1.6), M(0x3A3D44)); door.position.set(tx - 4, h + 1.3, tz);
    scene('finale', [
      { d: 4.6, start(){ [mg, dv].forEach(q => q && scAdd(q.g)); scAdd(door); pt = petals(14, tx, h + 1.4, ez, .8, true); }, on(f, t, dt){ mg && mg.anim(t, 0, 0); dv && dv.anim(t + 1, 0, 0); pt.forEach(q => { q.p.position.addScaledVector(q.v, dt * .3); q.p.rotation.x += dt * 3; }); }, cam: () => [tx - 1, h + 1.7, ez - 6.5], look: () => [tx, h + 1.4, ez], say: 'She backs out onto the terrace until the railing stops her. Petals drift from her torn lapel.' },
      { d: 6, on(f, t){ mg && mg.anim(t, 0, 0); }, cam: () => [tx + .6, h + 1.6, ez - 2.2], look: () => [tx, h + 1.55, ez], say: 'She looks past you, at Devi, and laughs. “Did she tell you she’d fix it? She told me that too.” Then, to you: “Who do you think paid for the ink? Every stamp, on every door.”' },
      { d: 3, on(f, t){ if (dv) { dv.g.position.set(tx + 3 - f * 2.6, h, ez - 6 + f * 5); dv.anim(t, 1, 0); } }, cam: () => [tx - 2.6, h + 1.6, ez - 3], look: () => [tx + 1, h + 1.4, ez - 1], say: 'Devi steps forward. “Enough.”' },
      { d: 3.2, start(C){ C.shake = .2; R.tone(300, .3, 'sawtooth', .04, 120); }, on(f, t, dt){ if (mg) { mg.g.position.set(tx, h + Math.max(-6, -f * f * 4), ez + .4 + f * 2); mg.g.rotation.x = f * 1.6; } }, cam: () => [tx + 2.4, h + 2, ez - 2.4], look: () => [tx, h + .6, ez + 1], say: 'She shoves Marigold over the railing.' },
      { d: 3.6, start(){ down = petals(26, tx, h - 4, ez + 2.4, 3, true); }, on(f, t, dt){ const y = h - 2 - f * f * (h - 9); if (mg) { mg.g.position.set(tx, y, ez + 2.4); mg.g.rotation.x = 1.6 + f * 2; } down.forEach(q => { q.p.position.y += (2.5 + Math.random()) * dt * 3; q.p.rotation.z += dt * 4; }); if (f > .92) cine.querySelector('.s3black').style.opacity = '1'; }, cam: f => [tx + 3, h - f * f * (h - 9) + 2.5, ez + 7], look: f => [tx, h - 2 - f * f * (h - 9), ez + 2.4], say: 'She falls past the glass floors of her own tower, petals streaming up behind her.' },
      { d: 3.6, start(){ cine.querySelector('.s3black').style.opacity = '0'; down = petals(30, tx, 6, ez + 6, 6, false); if (mg) mg.g.visible = false; }, on(f, t, dt){ down.forEach(q => { q.p.position.addScaledVector(q.v, dt); q.p.rotation.x += dt * 2; if (q.p.position.y < .03) { q.p.position.y = .03; q.v.set(0, 0, 0); q.p.rotation.set(-Math.PI / 2, 0, q.p.rotation.z); } }); }, cam: () => [tx + 4, 1.4, ez + 12], look: () => [tx, .6, ez + 6], say: 'The petals reach the street before she does.' },
      { d: 3.6, on(f, t){ if (dv) { dv.g.position.set(tx + .4 - f * 4.4, h, ez - 1 - f * (ez - 1 - tz)); dv.anim(t * 1.6, 1, 0); } }, cam: () => [tx + 2, h + 1.8, ez - 4], look: f => [tx - f * 4, h + 1.2, ez - 1 - f * (ez - 1 - tz)], say: 'Devi snatches the ledger off the terrace and sprints for the stairwell. You go after her.' },
      { d: 4.6, start(){ if (dv) dv.g.position.set(tx - 4, h, tz + 1.2); }, on(f, t){ dv && dv.anim(t, 0, 0); }, cam: () => [tx - 4, h + 1.6, tz + 4], look: () => [tx - 4, h + 1.5, tz + 1.2], say: 'Two floors down she stops on the landing, just long enough. “You cleaned up this city for me, {N}. Thank you.” Then she’s gone.' },
      { d: 5.4, start(){ if (dv) dv.g.visible = false; dark.style.opacity = '0'; setTimeout(() => { dark.style.opacity = '.82'; R.tone(60, 2.4, 'sawtooth', .05, 30); }, 900); setTimeout(() => { if (SC) title('SEASON 3 COMPLETE', 'THE SYNDICATE'); }, 2400); }, cam: f => [tx + 70, 45 + f * 8, tz + 70], look: () => [tx, 10, tz], say: 'Then every light in Bangalore goes out.' }],
      () => { st.done = 1; save(); buildTrace(); R.skin('s3_under'); R.skin('s3_suit'); setTimeout(() => { dark.style.opacity = '0'; }, 2500); showCard('SEASON 3 COMPLETE', 'The Syndicate', 'New skins: Undercover and Marigold’s Suit. Season 4 · Blackout starts 10 February.', 8000); });
  }
  // what the season leaves: Marigold's tower with its lights off (Devi's now), and marigold graffiti across the city
  let traceG = null;
  function buildTrace(){ if (traceG || !R.BL.mapG || !places()) return; const T = places().tower, [tx, tz] = ctr(T), g = traceG = new THREE.Group(); R.BL.mapG.add(g);
    const sh = new THREE.Mesh(new THREE.BoxGeometry(T.x1 - T.x0 + .14, T.h + .1, T.z1 - T.z0 + .14), new THREE.MeshLambertMaterial({ color: 0x0E1014, transparent: true, opacity: .86 })); sh.position.set(tx, T.h / 2, tz); g.add(sh);
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(Math.min(12, T.x1 - T.x0), 1.6), new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, map: R.tex(512, 72, (c, w, h) => { c.fillStyle = '#16181D'; c.fillRect(0, 0, w, h); c.fillStyle = '#C8102E'; c.font = '900 40px system-ui'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('PROPERTY OF THE CITY · DEVI', w / 2, h / 2 + 2); }) })); sign.position.set(tx, T.h + 1.1, T.z1 + .1); g.add(sign);
    places().D.forEach((d, j) => places().B.filter(b => Math.hypot(ctr(b)[0] - d.c[0], ctr(b)[1] - d.c[1]) < 60).slice(0, 4).forEach((b, i) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 2.4), stampMat()); g.add(onWall(b, d.c[0] - 20 + i * 13, d.c[1] + 18 - j * 3, 2.6, m)); }));
    noPick(g); }

  // ---------- the Season 3 trailer: a short film, not a list. Black and white, with marigold orange the only colour ----------
  // No name cards and no quotes: a strip of police tape, a crime scene in fog, a line-up against a height chart, slow push-ins,
  // a run of fast whip-cut action, then a long push-in on the mourners while the title writes itself, and her garlanded portrait.
  // The orange things (tape, siren light, title, garland, the lamp) are drawn over the black-and-white 3D view.
  css.textContent += `
.s3fx{position:absolute;inset:0;display:none;overflow:hidden}body.s3tr .s3fx{display:block}
body.s3tr #scene{transform:rotate(var(--dutch,0deg)) scale(var(--zoom,1));transition:transform .25s}
.s3dof{position:absolute;inset:0;-webkit-backdrop-filter:blur(var(--blur,5px));backdrop-filter:blur(var(--blur,5px));-webkit-mask-image:radial-gradient(ellipse 60% 55% at 50% 46%,transparent 30%,#000 80%);mask-image:radial-gradient(ellipse 60% 55% at 50% 46%,transparent 30%,#000 80%);opacity:0;transition:opacity .6s}.s3dof.on{opacity:1}.s3dof.full{-webkit-mask-image:none;mask-image:none}
.s3whip{position:absolute;inset:0;-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);opacity:0}.s3whip.on{opacity:1}
.s3siren{position:absolute;inset:0;background:radial-gradient(ellipse 45% 70% at 92% 60%,rgba(232,144,26,.55),rgba(232,144,26,0) 70%);mix-blend-mode:screen;opacity:0}
.s3tape{position:absolute;left:-20%;right:-20%;top:38%;height:22vh;transform:rotate(-9deg);background:#E8A01A;box-shadow:0 0 40px rgba(0,0,0,.6);display:none;align-items:center;white-space:nowrap;overflow:hidden;filter:blur(.4px)}
.s3tape span{font:900 clamp(40px,11vh,120px)/1 "Courier New",monospace;color:#111;letter-spacing:.06em;animation:s3tape 9s linear infinite}
.s3tape.b{top:58%;transform:rotate(5deg);height:14vh;filter:blur(5px);opacity:.9}.s3tape.b span{font-size:clamp(26px,7vh,80px);animation-duration:12s}
@keyframes s3tape{to{transform:translateX(-30%)}}
.s3script{position:absolute;left:0;right:0;top:56%;text-align:center;font:400 clamp(54px,11vw,140px)/1 "Parisienne",cursive;color:#F2A23A;text-shadow:0 2px 30px rgba(0,0,0,.7)}
.s3script i{font-style:normal;display:inline-block;clip-path:inset(0 100% 0 0);transition:clip-path 1.6s ease-out}.s3script i.on{clip-path:inset(0 -10% 0 0)}
.s3frame{position:absolute;left:50%;top:47%;width:min(38vh,60vw);height:min(48vh,76vw);transform:translate(-50%,-50%);background:radial-gradient(ellipse at 50% 40%,#2A2A28,#121211 75%);border:clamp(10px,2vh,18px) solid #1A120C;box-shadow:inset 0 0 0 3px #3A2A1A,0 20px 60px rgba(0,0,0,.8);opacity:0;transition:opacity .8s}
.s3garland{position:absolute;inset:calc(-1 * clamp(26px,5vh,46px));padding:clamp(18px,3.4vh,32px);background:radial-gradient(circle,#F2A23A 0 32%,#C8701A 34% 48%,transparent 50%) 0 0/clamp(16px,3vh,26px) clamp(16px,3vh,26px);-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask:linear-gradient(#000 0 0) content-box exclude,linear-gradient(#000 0 0)}
.s3swag{position:absolute;left:8%;right:8%;bottom:calc(-1 * clamp(70px,13vh,120px));height:clamp(60px,11vh,100px);border-radius:0 0 50% 50%;border:clamp(10px,2vh,16px) dotted #E8901A;border-top:0}
.s3lamp{position:absolute;left:50%;top:84%;width:14px;height:22px;margin-left:-7px;border-radius:50% 50% 45% 45%;background:radial-gradient(ellipse at 50% 70%,#FFF4C8,#F2A23A 45%,rgba(232,144,26,0) 72%);box-shadow:0 0 60px 30px rgba(232,144,26,.35);animation:s3lamp .18s infinite alternate;opacity:0;transition:opacity .8s}
@keyframes s3lamp{to{transform:scale(1.08,1.12) translateY(-1px)}}
.s3date{position:absolute;left:0;right:0;bottom:13vh;text-align:center;font:700 clamp(14px,2.4vw,22px)/1 "Courier New",monospace;letter-spacing:.5em;color:#E8901A;opacity:0;transition:opacity 1s}
.s3frame.on,.s3lamp.on,.s3date.on{opacity:1}`;
  const fxEl = el('s3fx', '<div class="s3dof"></div><div class="s3siren"></div><div class="s3tape"><span></span></div><div class="s3tape b"><span></span></div><div class="s3script"><i>The</i> <i>Syndicate</i></div><div class="s3frame"><div class="s3garland"></div><div class="s3swag"></div></div><div class="s3lamp"></div><div class="s3date">13 JANUARY</div><div class="s3whip"></div>', cine);
  fxEl.querySelectorAll('.s3tape span').forEach(sp => sp.textContent = 'POLICE LINE · DO NOT CROSS · '.repeat(8));
  const fx = sel => fxEl.querySelector(sel), dutch = (deg, zoom = 1) => { const sc = document.getElementById('scene'); if (sc) { sc.style.setProperty('--dutch', deg + 'deg'); sc.style.setProperty('--zoom', zoom); } };
  const whip = () => { const w = fx('.s3whip'); w.classList.add('on'); setTimeout(() => w.classList.remove('on'), 140); };
  function trailer(){
    if (!document.getElementById('s3font')) { const ln = document.createElement('link'); ln.id = 's3font'; ln.rel = 'stylesheet'; ln.href = 'https://fonts.googleapis.com/css2?family=Parisienne&display=swap'; document.head.appendChild(ln); }
    const Pl = places(), [hx, hz] = spot(Pl.home[0] + 6, Pl.home[1] + 2), T = Pl.tower, [tx, tz] = ctr(T), cat = countAt(); let k = 0;
    const bass = n => { const f = [55, 65.4, 73.4, 82.4, 98, 110][n % 6]; R.tone(f, .5, 'triangle', .06, f * .98); }, stab = () => { R.tone(440, .25, 'sawtooth', .025, 430); R.tone(523, .25, 'sawtooth', .02, 515); }, snare = () => R.tone(2200, .06, 'square', .008, 1800);
    const walk = (t, C, sp = 2.4) => { const b = Math.floor(t * sp); if (b !== C.b) { C.b = b; bass(k++); if (b % 2) snare(); } };
    const wipe = () => { if (SC) SC.objs.forEach(o => o.visible = false); };
    const fog = R.BL.sc.fog, fog0 = { c: fog.color.getHex(), n: fog.near, f: fog.far }, A = (key, x, z, y, face) => { const a = who(key, x, z, y || 0, face); if (a) scAdd(a.g); return a; };
    // the line-up wall: the street face of a building near home, with a height chart on it
    const wb = Pl.near(Pl.home, b => b.h > 8 && b.x1 - b.x0 > 14) || T, lz = wb.z1 + 1.1, lx0 = wb.x0 + 3;
    const chart = new THREE.Mesh(new THREE.PlaneGeometry(14, 2.6), new THREE.MeshBasicMaterial({ map: R.tex(1024, 192, (c, w, h) => { c.fillStyle = '#C8C8C4'; c.fillRect(0, 0, w, h); c.strokeStyle = '#2A2A2A'; c.fillStyle = '#2A2A2A'; c.font = '700 14px monospace';
      for (let cm = 100; cm <= 230; cm += 5) { const y = h - (cm - 100) / 130 * h; c.lineWidth = cm % 10 ? 1 : 2; c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); if (!(cm % 10)) for (let x = 6; x < w; x += 170) c.fillText(cm, x, y - 3); } }) }));
    chart.position.set(lx0 + 7, 1 + 1.3, wb.z1 + .06);
    const lineup = ['velvet', 'brass', 'ledger', 'collector', 'goon2', 'goon3', 'marigold'];
    const mourn = ['devi', 'lata', 'velvet'];
    return [
      // 1 · the tape
      { d: 3.6, start(C){ document.body.classList.add('s3tr'); C.onEnd = () => { document.body.classList.remove('s3tr'); dutch(0); fog.color.setHex(fog0.c); fog.near = fog0.n; fog.far = fog0.f; fxEl.querySelectorAll('.on').forEach(e => e.classList.remove('on')); fxEl.querySelectorAll('.s3tape').forEach(e => e.style.display = 'none'); fx('.s3siren').style.opacity = 0; if (comet) comet.g.visible = true; }; if (comet) comet.g.visible = false;
          fog.color.setHex(0x2A2A2A); fog.near = 3; fog.far = 46; fxEl.querySelectorAll('.s3tape').forEach(e => e.style.display = 'flex'); fx('.s3dof').classList.add('on', 'full'); fx('.s3dof').style.setProperty('--blur', '7px'); dutch(-3, 1.08); },
        on(f, t, dt, C){ walk(t, C); fx('.s3siren').style.opacity = (.35 + .35 * Math.sin(t * 9)).toFixed(2); }, cam: f => [hx - 4 + f * .6, .9, hz + 5], look: () => [hx + 4, 1, hz - 4] },
      // 2 · the crime scene in fog: a chalk outline in petals, and three people who don't move
      { d: 3.6, start(C){ wipe(); fxEl.querySelectorAll('.s3tape').forEach(e => e.style.display = 'none'); fx('.s3dof').classList.remove('full'); fx('.s3dof').style.setProperty('--blur', '4px'); dutch(0, 1.04); stab();
          const ol = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.2), new THREE.MeshBasicMaterial({ transparent: true, map: R.tex(256, 140, (c, w, h) => { c.strokeStyle = '#F4F4F4'; c.lineWidth = 6; c.beginPath(); c.ellipse(60, 70, 24, 22, 0, 0, 7); c.moveTo(84, 70); c.lineTo(180, 64); c.lineTo(240, 30); c.moveTo(180, 64); c.lineTo(240, 110); c.moveTo(110, 66); c.lineTo(140, 20); c.moveTo(110, 74); c.lineTo(150, 124); c.stroke(); }) }));
          ol.rotation.x = -Math.PI / 2; ol.position.set(hx, .03, hz + 5); scAdd(ol); for (let i = 0; i < 40; i++) { const pt = new THREE.Mesh(new THREE.PlaneGeometry(.16, .1), new THREE.MeshBasicMaterial({ color: 0xE8901A, side: THREE.DoubleSide })); pt.rotation.set(-Math.PI / 2, 0, Math.random() * 6); pt.position.set(hx + (Math.random() - .5) * 2.6, .035, hz + 5 + (Math.random() - .5) * 1.6); scAdd(pt); }
          C.p = [A('devi', hx - 2.2, hz + 2.8, 0, [hx, hz + 5]), A('goon', hx + 2.4, hz + 3.2, 0, [hx, hz + 5]), A('collector', hx + .4, hz + 1.8, 0, [hx, hz + 5])]; C.j = R.makeVehicle('jeep', 0x5A6A3A, R.BL.mapG); C.j.g.position.set(hx + 6, 0, hz + 1); C.j.g.rotation.y = .6; SC.objs.push(C.j.g); },
        on(f, t, dt, C){ walk(t, C); fx('.s3siren').style.opacity = (.3 + .3 * Math.sin(t * 9)).toFixed(2); }, cam: f => [hx + 3 - f * .6, 1.75, hz + 9.6 - f * .5], look: () => [hx, .9, hz + 3.6] },
      // 3 · the line-up against the height chart
      { d: 4.4, start(C){ fx('.s3siren').style.opacity = 0; fx('.s3dof').classList.remove('on'); dutch(0, 1); stab(); fog.color.setHex(fog0.c); fog.near = fog0.n; fog.far = fog0.f; wipe(); scAdd(chart); C.L = lineup.map((key, i) => A(key, lx0 + 1 + i * 1.75, lz, 0, [lx0 + 1 + i * 1.75, lz + 10])); },
        on(f, t, dt, C){ walk(t, C); }, cam: f => [lx0 + 1.4 + f * 7.8, 1.45, lz + 4.2], look: f => [lx0 + 1.4 + f * 7.8 + .6, 1.3, lz] },
      // 4–7 · single shots, slow push-ins
      { d: 2.6, start(){ wipe(); stab(); A('devi', hx, hz + 3, 0, [hx, hz + 9]); fx('.s3dof').classList.add('on'); fx('.s3dof').style.setProperty('--blur', '6px'); }, on(f, t, dt, C){ walk(t, C); }, cam: f => [hx + .1, 1.62, hz + 4.9 - f * .55], look: () => [hx, 1.6, hz + 3] },
      { d: 2.8, start(C){ wipe(); stab(); C.car = R.makeVehicle('car', 0x16181D, R.BL.mapG); C.car.g.position.set(hx + 7, 0, hz - 4); C.car.g.rotation.y = 1.4; SC.objs.push(C.car.g); A('brass', hx + 6.8, hz - 2.6, 0, [hx + 4, hz + 2]); dutch(4, 1.06); }, on(f, t, dt, C){ walk(t, C); }, cam: f => [hx + 4.6 - f * .5, .55, hz + .6], look: () => [hx + 6.8, 2.1, hz - 2.6] },
      { d: 2.6, start(){ wipe(); stab(); dutch(0, 1.03); A('ledger', cat[0], cat[1] - 3.2, 0, cat); }, on(f, t, dt, C){ walk(t, C); }, cam: f => [cat[0] + .3, 1.35, cat[1] + 1.4 - f * 1.2], look: () => [cat[0], 1.4, cat[1] - 3.2] },
      { d: 2.6, start(C){ wipe(); stab(); dutch(-3, 1.05); C.car = R.makeVehicle('car', 0x2A1030, R.BL.mapG); C.car.g.position.set(hx - 6, 0, hz + 6); C.car.g.rotation.y = -1.2; SC.objs.push(C.car.g); A('velvet', hx - 4.6, hz + 5.2, 0, [hx, hz]); }, on(f, t, dt, C){ walk(t, C); }, cam: f => [hx - 2.6 - f * .5, 1.55, hz + 3.4 + f * .3], look: () => [hx - 4.6, 1.55, hz + 5.2] },
      // 8 · the run: six fast cuts, whip-panned
      { d: 7.2, start(C){ wipe(); fx('.s3dof').classList.remove('on'); C.tr = R.makeVehicle('truck', 0x16181D, R.BL.mapG); SC.objs.push(C.tr.g); C.g = [0, 1, 2].map(i => A(['goon', 'goon2', 'goon3'][i], hx, hz)); C.br = A('brass', hx + 3, hz + 3, 0, [hx, hz]); C.gd = A('guard', cat[0], cat[1] - 2, 0, cat); C.mg = A('marigold', tx, tz, T.h, [tx, tz + 20]);
          const cone = new THREE.Mesh(new THREE.ConeGeometry(1.4, 6, 18, 1, true), new THREE.MeshBasicMaterial({ color: 0xFFFFFF, transparent: true, opacity: .22, side: THREE.DoubleSide, depthWrite: false })); cone.rotation.x = Math.PI / 2; cone.position.set(cat[0], 1.4, cat[1] - 2 + 3); scAdd(cone); C.sub = -1; },
        on(f, t, dt, C){ const s = Math.min(5, Math.floor(t / 1.2)), u = (t - s * 1.2) / 1.2; if (s !== C.sub) { C.sub = s; whip(); snare(); R.tone(90, .2, 'square', .04, 60); dutch([5, -6, 0, 7, -4, 2][s], [1.08, 1.1, 1.04, 1.12, 1.06, 1.05][s]); } walk(t, C, 4.8);
          C.tr.g.position.set(hx - 14 + (s === 0 ? u * 28 : 0), 0, hz + 3); C.tr.g.rotation.y = Math.PI / 2; C.tr.g.visible = s === 0;
          C.g.forEach((a, i) => { if (!a) return; a.g.visible = s === 1; a.g.position.set(hx - 1.4 + i * 1.4, 0, hz - 9 + u * 6 + i * .4); a.g.rotation.y = Math.PI; a.anim(t * 1.8 + i, 1, 0); });
          if (C.br) { C.br.g.visible = s === 3; C.br.anim(t, 0, s === 3 ? Math.min(1, u * 1.6) : 0); } if (C.gd) C.gd.anim(t, 1, 0); if (C.mg) { C.mg.g.rotation.y = s === 5 ? Math.PI * u : 0; C.mg.anim(t, 0, 0); } },
        cam: (f, t) => { const s = Math.min(5, Math.floor(t / 1.2)), u = (t - s * 1.2) / 1.2;
          return [[hx, .6, hz + 5.5], [hx + .2, 1.1, hz - 1.4], [hx - 12 + u * 24, T.h * .45 + Math.sin(u * Math.PI) * -6 + 8, hz + 10], [hx + 2.2, .5, hz + 4.6], [cat[0] + 1.6, 1.5, cat[1] + 2.4], [tx + 1.6, T.h + 1.5, tz + 3.4]][s]; },
        look: (f, t) => { const s = Math.min(5, Math.floor(t / 1.2)), u = (t - s * 1.2) / 1.2;
          return [[hx - 4 + u * 10, 1.4, hz + 3], [hx, 1.4, hz - 6 + u * 4], [hx + 12, T.h * .3, hz - 4], [hx + 3, 2.6, hz + 3], [cat[0], 1.4, cat[1] - 2], [tx, T.h + 1.5, tz]][s]; } },
      // 9 · the mourners, a long push-in, and the title writes itself
      { d: 8, start(C){ wipe(); dutch(0, 1); fx('.s3dof').classList.add('on'); fx('.s3dof').style.setProperty('--blur', '8px'); R.tone(55, 2.6, 'sawtooth', .05, 40);
          C.m = mourn.map((key, i) => A(key, hx - 1.6 + i * 1.6, hz - 2, 0, [hx - 1.6 + i * 1.6, hz + 10])); [0, 1, 2, 3].forEach(i => { try { const a = R.avatar(R.crowdLook(80 + i)); a.g.position.set(hx - 3.2 + i * 2.1, 0, hz - 3.4); a.g.rotation.y = Math.PI; scAdd(a.g); } catch (e) {} });
          for (let i = 0; i < 2; i++) { const fg = who(['goon3', 'collector'][i], hx + (i ? 2.6 : -2.4), hz + 3.2, 0, [hx, hz - 4]); if (fg) scAdd(fg.g); }
          const w = fx('.s3script').children; setTimeout(() => { if (SC) w[0].classList.add('on'); }, 1600); setTimeout(() => { if (SC) w[1].classList.add('on'); }, 2400); },
        on(f, t, dt, C){ if (Math.floor(t / 2.2) !== C.b2) { C.b2 = Math.floor(t / 2.2); R.tone(41.2, 1.6, 'triangle', .05, 41); } }, cam: f => [hx + .2, 1.6, hz + 7.5 - f * 4], look: () => [hx, 1.55, hz - 2.2] },
      // 10 · the empty frame: the garland and the lamp, and nobody in the picture yet; then the date
      { d: 4, start(C){ wipe(); fx('.s3dof').classList.remove('on'); fx('.s3script').querySelectorAll('i').forEach(e => e.classList.remove('on')); cine.querySelector('.s3black').style.opacity = '1';
          setTimeout(() => { if (SC) { fx('.s3frame').classList.add('on'); fx('.s3lamp').classList.add('on'); } }, 500); setTimeout(() => { if (SC) fx('.s3date').classList.add('on'); }, 2200); R.tone(311, 2.6, 'triangle', .03, 300); },
        cam: () => [hx, 1.66, hz + 4], look: () => [hx, 1.66, hz] }
    ];
  }
  // ---------- each frame ----------
  let ready = false, inited = false, opening = false, raidT = 15;
  function step(dt, now){
    const t = now / 1000, inB = R.inWorld && R.zone === 'blr', hideB = !!(SC || R.fighting);
    Object.keys(beacons).forEach(k => { if (beacons[k].g.visible === hideB) beacons[k].g.visible = !hideB; });
    if (SC) { if (!inB || R.busy) { scEnd(true); return; } scStep(dt); return; }
    const touch = !R.fine; heatHud(); heatEl.hidden = !(inB && st.open && (st.heat || 0) > 0 && !R.fighting && !R.BL.lvl);
    const flashOn = R.fighting && heistF && !heistF.data.alarm && flashes > 0, spikeOn = R.DRV.on && R.DRV.p && R.DRV.p.type === 'comet';
    gadBtn.hidden = !touch || !(flashOn || spikeOn); if (!gadBtn.hidden) { const l = flashOn ? `Flash ×${flashes}` : 'Spikes'; if (gadBtn.textContent !== l) gadBtn.textContent = l; }
    spikeStep(dt);
    if (!inB || !R.BLC.built || R.BL.lvl) { setAct(null); if (inB && R.BL.lvl && R.BL.lvl.id === 'garage' && st.heat > 0) { st.heat = 0; save(); R.say('You lie low in the garage until the Syndicate stops looking.', 3200); } return; }
    if (!places()) return;
    // the first time you're out on the street during Season 3, the cold open plays
    if (!st.open) { if (!opening && !R.DRV.on && (ready = ready || R.onGround())) { opening = true; coldOpen(); } return; }
    if (!inited) { inited = true; buildRackets(); if (st.rope) R.pk.rope(true); if (st.comet) { parkComet(); if (R.garComet) R.garComet(); }
      if (st.p1.raid && !st.p1.brass) beacon('brass', dist('market').c);
      if (st.p2.start) buildCount(); if (st.p2.start && !st.p2.heist) beacon('heist', countAt()); if (st.p2.heist && !st.p2.ledger) beacon('ledger', countAt());
      if (st.p3.start && !st.rope) beacon('lata', dist('market').c); if (st.rope && st.p3.conv.length < 3) convoyStart();
      if (st.p4.start && !st.p4.lobby) beacon('lobby', towerAt()); if (st.p4.lobby && !st.p4.roofs) roofMark(route()[st.p4.r || 0]); if (st.p4.roofs && !st.p4.chase) chaseSetup(); if (st.p4.chase && !st.p4.boss) beacon('green', towerAt());
      if (st.done) buildTrace(); }
    const [mx, mz] = mapNow(), free = !R.busy && !R.fighting && !R.DRV.on;
    // rackets and the action button
    setAct(free ? rkStep(dt, t, mx, mz) : null); if (!free) rkStep(dt, t, mx, mz);
    beaconStep(mx, mz); chaseStep(dt, t, mx, mz); plantStep(dt, t, mx, mz);
    // Part 1: once Market Street is free (and the collector caught), they raid you
    if (freed('market') && st.p1.chase && !st.p1.raidGo && free && (raidT -= dt) <= 0) raid();
    // the later Parts, a week apart
    if (st.p1.brass && week() >= 2 && !st.p2.start && free) p2Start();
    if (st.p2.ledger && !st.p2.lost && free && !lostGo) lostFight();
    if (st.p2.lost && week() >= 3 && !st.p3.start && free) p3Start();
    convoys.forEach(c => { if (!c.stopped) roadStep(c, dt); c.v.g.children.forEach(o => { if (o.isSprite) o.position.y = 4.6 + Math.sin(t * 3) * .2; }); });
    if (convoys.length && !velvet && free) { let n = null, nd = 1e9; convoys.forEach(c => { if (c.stopped) return; const d = Math.hypot(c.x - mx, c.z - mz); if (d < nd) { nd = d; n = c; } }); if (n) R.PH.wp = [n.x, n.z]; }
    if (st.p3.conv.length >= 3 && !st.p3.velvet && !velvet && free) velvetStart();
    velvetStep(dt, t, mx, mz);
    if (st.p3.velvet && week() >= 4 && !st.p4.start && free) p4Start();
    if (st.p4.lobby && !st.p4.roofs) { const L = route(), i = st.p4.r || 0, b = L[i]; sniperStep(dt); if (roofMk) roofMk.children.forEach(o => { if (o.isSprite) o.position.y = 2.4 + Math.sin(t * 3) * .3; });
      if (b && onRoof(b)) { st.p4.r = i + 1; save(); R.tone(784, .2, 'triangle', .05); if (st.p4.r >= L.length) { st.p4.roofs = 1; save(); roofMark(null); if (dot) { R.BL.mapG.remove(dot.g); dot = null; } R.say('There she is, on the tower roof! Marigold is running. Go after her!', 3600); chaseSetup(); } else { roofMark(L[st.p4.r]); R.say(`Roof ${st.p4.r} of ${L.length}. Next one’s marked.`, 2200); } } }
    if (st.p4.roofs && !st.p4.chase) mgStep(dt, t);
    // heat: ambushes at two marigolds or more; it cools if you keep your head down
    if ((st.heat || 0) > 0) { quietT += dt; if (quietT > 110) { quietT = 0; st.heat--; save(); } }
    if ((st.heat || 0) >= 2 && free && !chase && !velvet && !plant && !(R.SW && (R.SW.roof || R.SW.on)) && (ambT -= dt) <= 0) { ambT = (st.heat >= 3 ? 45 : 75) + Math.random() * 35; ambush(); }
  }
  BEACON.ledger = () => { unBeacon('ledger'); ledgerFight(countAt()); };

  // ---------- the Season tab ----------
  function tab(){
    const S = R.info(), fd = new Date(S.start.getTime()), unlock = i => new Date(fd.getTime() + i * 7 * 864e5).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }), wk = week(), mk = (st.dist.market || []).length;
    const PT = [['Protection', st.p1.brass, !st.open ? 'Go out into the city.' : !freed('market') ? `Break Market Street’s rackets: ${mk} of 3.${st.p1.chase ? '' : ' Then catch the collector.'}` : !st.p1.chase ? 'Catch the collector who ran.' : !st.p1.raid ? 'Survive the night: they’re coming for you.' : 'Beat Brass in the market.'],
      ['The Ledger', st.p2.lost, !st.p1.brass ? 'Finish Part 1 first.' : !st.p2.heist ? 'Rob the counting house in Old Town. Quiet is optional.' : !st.p2.ledger ? 'Beat the Ledger.' : 'Get out with the ledger…'],
      ['The Velvet Run', st.p3.velvet, !st.p2.lost ? 'Finish Part 2 first.' : !st.rope ? 'Lata is waiting at Market Street.' : st.p3.conv.length < 3 ? `Stop Velvet’s convoys: ${st.p3.conv.length} of 3. Drop on them from a roof, or spike them from the Comet.` : 'Run Velvet down on the highway.'],
      ['Marigold', st.p4.boss, !st.p3.velvet ? 'Finish Part 3 first.' : !st.p4.lobby ? 'Storm the lobby of Marigold’s tower.' : !st.p4.roofs ? `Swing up the outside, roof to roof: ${st.p4.r || 0} of 3. Mind the snipers.` : !st.p4.chase ? 'Chase her across the rooftops.' : 'Beat her in the greenhouse.']];
    const D = places() ? places().D : [];
    return `<div class="phcard"><b>Season 3 · The Syndicate</b><small>Day ${S.day} of 28 · ${S.left} day${S.left === 1 ? '' : 's'} left. After the flood, a crime syndicate took over the city.</small><div class="phrow"><button type="button" data-s3="video">▶ Watch the Season 3 trailer</button><button type="button" data-s3="trailer">▶ In-game trailer</button></div></div>`
      + PT.map(([n, done, sub], i) => `<div class="phcard"><b>${done ? '✓ ' : ''}Part ${i + 1}: ${n}</b><small>${wk > i ? esc(done ? 'Done.' : sub) : `Unlocks ${unlock(i)}.`}</small></div>`).join('')
      + (st.open ? `<div class="phcard"><b>Districts · ${nFreed()} of 5 free</b>${D.map(d => `<small>${freed(d.k) ? '✓' : '✿'} ${esc(d.n)}: ${freed(d.k) ? 'free' : `${(st.dist[d.k] || []).length} of 3 rackets broken`}</small>`).join('')}<small>Syndicate heat: ${'✿'.repeat(st.heat || 0) || 'none'}</small></div>` : '')
      + `<div class="phcard"><b>Tools</b><small>${st.baton ? '✓ Stun baton' : 'Stun baton: not yet'} · ${st.rope ? '✓ Rope launcher' : 'Rope launcher: not yet'} · ${st.comet ? '✓ The Comet (nitro, tyre spikes)' : 'The Comet: not yet'} · Slide and vault: sprint, then crouch</small></div>`;
  }
  function wire(B){ const v = B.querySelector('[data-s3="video"]'); if (v) v.onclick = () => { R.phoneClose(); if (R.video) R.video('seasons/s03-trailer.mp4'); };
    const tr = B.querySelector('[data-s3="trailer"]'); if (tr) tr.onclick = () => { if (!(R.inWorld && R.zone === 'blr') || R.busy || R.DRV.on || R.BL.lvl || !places()) return R.say('Go out into the city to watch it in the game.', 2400); R.phoneClose(); setTimeout(() => scene('trailer', trailer()), 300); }; }
  if (opts && opts.past) { [heatEl, actBtn, gadBtn, skipBtn, card].forEach(e => e.remove()); return { step(){ if (st.rope) R.pk.rope(true); if (R.inWorld && R.zone === 'blr' && R.BLC.built && st.done) buildTrace(); } }; }
  return { step, tab, wire, debug: { R, beacon, onRoof, get heistF(){ return heistF; }, st, get SC(){ return SC; }, places: () => places(), RK, coldOpen, chaseStart, get chase(){ return chase; }, raid, BEACON, beacons, ledgerFight, lostFight, convoys, stopConvoy, velvetStart, get velvet(){ return velvet; }, velvetHit, route, chaseSetup, get mgRun(){ return mgRun; }, finale, buildTrace, trailer: () => scene('trailer', trailer()), rkDone, ambush, heatUp, fireSpikes, p2Start, p3Start, p4Start, freeDistrict, dist } };
};
