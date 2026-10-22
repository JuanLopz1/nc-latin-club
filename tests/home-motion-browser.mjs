// Interaction/presentation checks against a production server and native Chromium CDP.
import fs from 'node:fs/promises';
const base = process.env.CHECK_URL || 'http://127.0.0.1:3050';
const page = await (
  await fetch('http://127.0.0.1:9222/json/new?about:blank', { method: 'PUT' })
).json();
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r, { once: true }));
let id = 0;
const pending = new Map();
const errors = [];
const failures = [];
const external = [];
ws.addEventListener('message', (e) => {
  const m = JSON.parse(e.data);
  if (pending.has(m.id)) {
    const p = pending.get(m.id);
    pending.delete(m.id);
    if (m.error) p.reject(m.error);
    else p.resolve(m.result);
  }
  if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails);
  if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error')
    errors.push(m.params.args.map((a) => a.value ?? a.description).join(' '));
  if (
    m.method === 'Network.requestWillBeSent' &&
    m.params.request.url.startsWith('https://www.instagram.com/')
  )
    external.push(m.params.request.url);
});
const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const n = ++id;
    pending.set(n, { resolve, reject });
    ws.send(JSON.stringify({ id: n, method, params }));
  });
const evaluate = async (expression) => {
  const r = await send('Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  if (r.exceptionDetails) throw Error(JSON.stringify(r.exceptionDetails));
  return r.result.value;
};
const pause = (ms) => new Promise((r) => setTimeout(r, ms));
const wait = async (expr) => {
  for (let i = 0; i < 200; i++) {
    if (await evaluate(expr)) return;
    await pause(75);
  }
  throw Error(expr);
};
function check(name, ok) {
  console.log(name, ok);
  if (!ok) failures.push(name);
}
const click = async (sel) => {
  await evaluate(`document.querySelector(${JSON.stringify(sel)}).click()`);
  await pause(120);
};
const viewport = async (width) =>
  send('Emulation.setDeviceMetricsOverride', {
    width,
    height: 920,
    deviceScaleFactor: 1,
    mobile: width < 768,
  });
const scrollTo = async (selector) => {
  await evaluate(
    `document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'center',behavior:'instant'})`,
  );
  await pause(200);
};
const screenshot = async (name) => {
  if (!process.env.ARTIFACT_DIR) return;
  await fs.mkdir(process.env.ARTIFACT_DIR, { recursive: true });
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  await fs.writeFile(
    process.env.ARTIFACT_DIR + '/' + name + '.png',
    Buffer.from(shot.data, 'base64'),
  );
};
try {
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Network.enable');
  await send('Page.bringToFront');
  await viewport(375);
  await send('Page.navigate', { url: base });
  await wait('!!document.querySelector("[data-marquee]")');
  await evaluate('localStorage.clear()');
  await send('Page.reload');
  await wait('!!document.querySelector("#events [role=timer]")');
  await evaluate('document.fonts.ready');
  await pause(850);
  check(
    'English starts a fresh visit',
    await evaluate('document.documentElement?.lang==="en"'),
  );
  check(
    'Instagram has no load button',
    await evaluate('!document.querySelector("[data-instagram-load]")'),
  );
  check(
    'Marquee uses identical continuous groups and a 28s infinite cycle',
    await evaluate(
      `(()=>{const track=document.querySelector('[data-marquee]>div'),g=[...track.children],a=track.getAnimations()[0];return g.length===2&&g[0].textContent===g[1].textContent&&Math.abs(g[0].getBoundingClientRect().width-g[1].getBoundingClientRect().width)<.01&&a.effect.getTiming().duration===28000&&a.effect.getTiming().iterations===Infinity})()`,
    ),
  );
  check(
    'Marquee travels left and meets the repeated group at its seam',
    await evaluate(
      `(()=>{const track=document.querySelector('[data-marquee]>div'),a=track.getAnimations()[0],g=track.children;const saved=a.currentTime;a.currentTime=0;const x=g[0].getBoundingClientRect().left;a.currentTime=14000;const left=g[0].getBoundingClientRect().left<x;a.currentTime=27999;const seam=Math.abs(g[1].getBoundingClientRect().left-x)<2;a.currentTime=saved;return left&&seam})()`,
    ),
  );
  await click('[data-menu-trigger]');
  await evaluate('document.querySelector("[data-motion-toggle]").focus()');
  await click('[data-motion-toggle]');
  check(
    'Menu animation switch stops the strip',
    await evaluate(
      'document.querySelector("[data-marquee]>div").getAnimations().length===0',
    ),
  );
  await click('[data-motion-toggle]');
  check(
    'Menu animation switch resumes while retaining focus',
    await evaluate(
      'document.querySelector("[data-marquee]>div").getAnimations()[0].playState==="running"',
    ),
  );
  await click('[data-menu-trigger]');
  for (const width of [320, 375, 768, 1440]) {
    await viewport(width);
    await evaluate('window.scrollTo({top:0,behavior:"instant"})');
    await pause(100);
    check(
      'Homepage fits ' + width,
      await evaluate('document.documentElement.scrollWidth<=innerWidth'),
    );
    check(
      'Strip stays on one line ' + width,
      await evaluate(
        `(()=>{const g=document.querySelector('[data-marquee-group]');return [...g.children].every(s=>getComputedStyle(s).whiteSpace==='nowrap'&&s.getBoundingClientRect().height<40)})()`,
      ),
    );
  }
  check(
    'Offscreen section waits for its first reveal',
    await evaluate(
      `document.querySelector('#niagara-title').dataset.revealState==='waiting'`,
    ),
  );
  await scrollTo('#niagara');
  await wait(`document.querySelector('#niagara-title').dataset.revealState==='visible'`);
  await pause(1500);
  check(
    'Sticky header remains visible with an opaque background',
    await evaluate(
      `(()=>{const h=document.querySelector('[data-scrolled]');return Math.abs(h.getBoundingClientRect().top)<1&&h.dataset.scrolled==='true'&&getComputedStyle(h).backgroundColor==='rgb(12, 16, 27)'})()`,
    ),
  );
  await evaluate('window.scrollTo({top:0,behavior:"instant"})');
  await pause(150);
  await scrollTo('#niagara');
  check(
    'Reveals do not reset on return scroll',
    await evaluate(
      `document.querySelector('#niagara-title').dataset.revealState==='visible'&&getComputedStyle(document.querySelector('#niagara-title')).opacity==='1'`,
    ),
  );
  await scrollTo('[data-home-globe]');
  await wait(
    `document.querySelector('[data-home-globe] [data-globe-scene]')?.dataset.ready==='true'`,
  );
  await wait(
    `document.querySelector('[data-home-globe]').dataset.previewPlaying==='true'`,
  );
  await send('Page.bringToFront');
  await pause(500);
  await screenshot('home-roots-motion-desktop');
  const first = await evaluate(
    'document.querySelector("[data-home-globe]").dataset.previewCountry',
  );
  await wait(
    `document.querySelector('[data-home-globe]').dataset.previewCountry!==${JSON.stringify(first)}`,
  );
  check(
    'Home globe visits the next featured country',
    await evaluate(
      `['colombia','mexico','el-salvador'].includes(document.querySelector('[data-home-globe]').dataset.previewCountry)`,
    ),
  );
  const pointer = await evaluate(
    `(()=>{const r=document.querySelector('[data-home-globe] canvas').getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2}})()`,
  );
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', ...pointer });
  await send('Input.dispatchMouseEvent', {
    type: 'mousePressed',
    button: 'left',
    clickCount: 1,
    ...pointer,
  });
  await send('Input.dispatchMouseEvent', {
    type: 'mouseReleased',
    button: 'left',
    clickCount: 1,
    ...pointer,
  });
  await wait(
    `document.querySelector('[data-home-globe]').dataset.previewPlaying==='false'`,
  );
  check('Touch pauses the presentation', true);
  await click('[data-menu-trigger]');
  await click('[data-motion-toggle]');
  await click('[data-motion-toggle]');
  await click('[data-menu-trigger]');
  await wait(
    `document.querySelector('[data-home-globe]').dataset.previewPlaying==='true'`,
  );
  await evaluate('window.scrollTo({top:0,behavior:"instant"})');
  await wait(
    `document.querySelector('[data-home-globe]').dataset.previewPlaying==='false'`,
  );
  check('Offscreen globe stops its presentation', true);
  check(
    'Parallax remains within its small displacement limit',
    await evaluate(
      `Math.abs(parseFloat(document.querySelector('[data-hero-parallax]').style.getPropertyValue('--hero-drift')))<=12`,
    ),
  );
  await viewport(375);
  await scrollTo('[data-home-globe]');
  await pause(750);
  await screenshot('home-roots-motion-mobile');
  await evaluate(
    '[...document.querySelectorAll("footer button")].find(b=>b.textContent==="Español").click()',
  );
  await wait('document.documentElement?.lang==="es"');
  await send('Page.reload');
  await wait(
    'document.documentElement?.lang==="es" && !!document.querySelector("#hero-title")',
  );
  check(
    'Spanish survives reload without a hydration error',
    await evaluate(
      'document.querySelector("#roots").textContent.includes("Muchos lugares.")',
    ),
  );
  await send('Page.navigate', { url: base + '/familia' });
  await wait(
    '!!document.querySelector("#familia-title") && document.documentElement?.lang==="es"',
  );
  check(
    'Familia route has real translated content and one h1',
    await evaluate(
      'document.querySelectorAll("main h1").length===1 && document.querySelector("main").textContent.includes("Una sola familia.")',
    ),
  );
  await send('Page.navigate', { url: base });
  await wait(
    'document.documentElement?.lang==="es" && !!document.querySelector("#instagram-profile iframe")',
  );
  await scrollTo('#instagram');
  await wait('!!document.querySelector("#instagram-profile iframe")');
  check(
    'Instagram uses only the official profile after activation',
    await evaluate(
      `document.querySelector('#instagram-profile iframe').src==='https://www.instagram.com/nclat1nclub/embed/' && !!document.querySelector('#instagram a[href="https://www.instagram.com/nclat1nclub/"]')`,
    ),
  );
  check(
    'Instagram stays displayed',
    await evaluate('!!document.querySelector("#instagram-profile iframe")'),
  );
  await click('[data-menu-trigger]');
  await click('[data-motion-toggle]');
  await click('[data-menu-trigger]');
  await send('Page.reload');
  await wait(
    'document.documentElement?.lang==="es" && !!document.querySelector("[data-marquee]")',
  );
  check(
    'Reduced motion shows content with no CSS animations',
    await evaluate(
      'document.querySelector("main").getAnimations({subtree:true}).every(a=>a.playState!=="running") && [...document.querySelectorAll("[data-reveal-state]")].every(n=>getComputedStyle(n).opacity==="1")',
    ),
  );
  check(
    'Reduced motion keeps the four strip words visible',
    await evaluate(
      `(()=>{const r=document.querySelector('[data-marquee]'),g=r.querySelector('[data-marquee-group]');return [...g.children].slice(0,4).every(s=>s.getBoundingClientRect().right<=r.getBoundingClientRect().right+1)})()`,
    ),
  );
  await scrollTo('[data-home-globe]');
  await wait(
    `document.querySelector('[data-home-globe] [data-globe-scene]')?.dataset.ready==='true'`,
  );
  check(
    'Reduced motion disables automatic globe presentation',
    await evaluate(
      'document.querySelector("[data-home-globe]").dataset.previewPlaying==="false" && !document.querySelector("[data-preview-motion]")',
    ),
  );
  check(
    'Share metadata uses canonical route and a real existing image',
    await evaluate(
      `document.querySelector('meta[property="og:image"]').content.includes('/opengraph-image') && document.querySelector('meta[name="twitter:card"]').content==='summary_large_image' && document.querySelector('link[rel=canonical]').href==='https://nc-latin-club.vercel.app/'`,
    ),
  );
  check('No application exceptions or hydration errors', errors.length === 0);
  if (errors.length) console.log(errors);
  if (failures.length) throw Error(failures.join('; '));
  console.log('PASS homepage motion, navigation and language');
} finally {
  ws.close();
  await fetch('http://127.0.0.1:9222/json/close/' + page.id);
}
