// Real Chromium checks for the founder's single-menu control and viewport-timed text.
import fs from 'node:fs/promises';
const base = process.env.CHECK_URL || 'http://127.0.0.1:3054';
const page = await (await fetch('http://127.0.0.1:9222/json/new?about:blank', { method: 'PUT' })).json();
const socket = new WebSocket(page.webSocketDebuggerUrl);
await new Promise(resolve => socket.addEventListener('open', resolve, { once: true }));
let id = 0;
const pending = new Map(), failures = [], errors = [];
socket.addEventListener('message', event => {
  const message = JSON.parse(event.data), request = pending.get(message.id);
  if (request) { pending.delete(message.id); if (message.error) request.reject(message.error); else request.resolve(message.result); }
  if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails);
  if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') errors.push(message.params.args.map(arg => arg.value ?? arg.description).join(' '));
});
const send = (method, params = {}) => new Promise((resolve, reject) => { const key = ++id; pending.set(key, { resolve, reject }); socket.send(JSON.stringify({ id: key, method, params })); });
const evaluate = async expression => { const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }); if (result.exceptionDetails) throw Error(JSON.stringify(result.exceptionDetails)); return result.result.value; };
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const check = (name, success) => { console.log(name, success); if (!success) failures.push(name); };
async function wait(expression) { for (let i = 0; i < 200; i++) { if (await evaluate(expression)) return; await delay(60); } throw Error(expression); }
const click = async selector => { await evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`); await delay(100); };
const viewport = (width, height = 700) => send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 768 });
const scroll = async selector => { await evaluate(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'center',behavior:'instant'})`); await delay(100); };
async function menu() { if (!await evaluate('!!document.querySelector("[data-site-menu]")')) await click('[data-menu-trigger]'); }
async function escape() { await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape' }); await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape' }); await delay(80); }
async function shot(name) { if (!process.env.ARTIFACT_DIR) return; await fs.mkdir(process.env.ARTIFACT_DIR, { recursive: true }); const result = await send('Page.captureScreenshot', { format: 'png' }); await fs.writeFile(`${process.env.ARTIFACT_DIR}/${name}.png`, Buffer.from(result.data, 'base64')); }
try {
  await send('Page.enable'); await send('Runtime.enable'); await send('Page.bringToFront'); await viewport(375, 450);
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  await send('Page.navigate', { url: base }); await wait('!!document.querySelector("[data-marquee]")');
  await evaluate('localStorage.clear()'); await send('Page.reload'); await wait('!!document.querySelector("#hero-title") && !!document.documentElement?.dataset.motion');
  check('Animations start enabled on a fresh visit', await evaluate('document.documentElement.dataset.motion==="full" && document.querySelector("[data-marquee]>div").getAnimations()[0]?.playState==="running"'));
  check('Homepage has no local animation switches or banners', await evaluate('!document.querySelector("[data-marquee] button,[data-preview-motion],[data-rail-toggle],[data-motion-trigger]") && !document.querySelector("main").textContent.includes("Enable animations")'));
  await wait('document.querySelector("#hero-title").dataset.revealState==="visible"');
  check('Hero uses a perceptible entry lasting at least one second', await evaluate('parseFloat(getComputedStyle(document.querySelector("#hero-title")).transitionDuration)>=1'));
  check('Hero actually fades in instead of briefly reversing a fade-out', await evaluate('Number(getComputedStyle(document.querySelector("#hero-title")).opacity)<.7'));
  await delay(2300);
  check('Mobile illustration waits beyond its initial page load', await evaluate('document.querySelector("[data-hero-art]")?.dataset.revealState==="waiting"'));
  check('Heading and paragraph below the fold wait independently', await evaluate('document.querySelector("#familia-title").dataset.revealState==="waiting" && document.querySelector("#familia-title+p").dataset.revealState==="waiting"'));
  await click('a[href="#main-content"]'); check('Skip to content does not pre-reveal offscreen text', await evaluate('document.querySelector("#familia-title").dataset.revealState==="waiting" && document.querySelector("#familia-title+p").dataset.revealState==="waiting"'));
  if (!await evaluate('!!document.querySelector("[data-menu-trigger]")')) throw Error('Missing shared menu trigger');
  await menu(); check('Only the open menu offers an animation switch', await evaluate('document.querySelectorAll("[data-motion-toggle]").length===1 && document.querySelector("[data-site-menu]").contains(document.querySelector("[data-motion-toggle]")) && document.querySelector("[data-motion-toggle]").getAttribute("aria-checked")==="true"'));
  await escape(); check('Escape closes the menu and returns focus', await evaluate('!document.querySelector("[data-site-menu]") && document.activeElement.hasAttribute("data-menu-trigger")'));
  await scroll('[data-hero-art]'); await wait('document.querySelector("[data-hero-art]").dataset.revealState==="visible"');
  check('Late mobile illustration has an active entry when reached', await evaluate('document.querySelector("[data-hero-art]").getAnimations().some(animation=>animation.playState==="running")')); await shot('motion-arrival-mobile');
  await delay(1400);
  await viewport(375);
  // Put just the heading in the observer area; its following paragraph remains below.
  await evaluate('window.scrollTo({top:scrollY+document.querySelector("#familia-title").getBoundingClientRect().top-(innerHeight-160),behavior:"instant"})');
  await wait('document.querySelector("#familia-title").dataset.revealState==="visible"');
  check('Title reveals without prematurely revealing its paragraph', await evaluate('document.querySelector("#familia-title+p").dataset.revealState==="waiting" && !document.querySelector("#familia").dataset.revealState'));
  await scroll('#familia-title+p'); await wait('document.querySelector("#familia-title+p").dataset.revealState==="visible"');
  check('Paragraph animates when it enters the viewport', await evaluate('document.querySelector("#familia-title+p").getAnimations().some(animation=>animation.playState==="running")')); await delay(1500);
  await evaluate('window.scrollTo({top:0,behavior:"instant"})'); await delay(100); await scroll('#familia-title+p');
  check('Seen text does not replay or disappear on return', await evaluate('getComputedStyle(document.querySelector("#familia-title+p")).opacity==="1" && !document.querySelector("#familia-title+p").getAnimations().some(animation=>animation.playState==="running")'));
  await menu(); await click('[data-motion-toggle]'); await escape();
  check('The menu stops animations and exposes all content', await evaluate('document.documentElement.dataset.motion==="reduce" && document.querySelector("[data-marquee]>div").getAnimations().length===0 && [...document.querySelectorAll("[data-reveal-state]")].every(node=>getComputedStyle(node).opacity==="1")'));
  await send('Page.reload'); await wait('document.documentElement?.dataset.motion==="reduce" && !!document.querySelector("[data-marquee]")');
  check('Menu choice survives reload', await evaluate('document.querySelector("[data-marquee]>div").getAnimations().length===0'));
  await menu(); await click('[data-motion-toggle]'); await escape();
  check('Turning motion back on re-arms unseen text', await evaluate('document.documentElement.dataset.motion==="full" && document.querySelector("#niagara-title").dataset.revealState==="waiting"'));
  await scroll('[data-niagara-rail]'); await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 5, y: 120 });
  await wait('document.querySelector("[data-niagara-rail]").dataset.railPlaying==="true"');
  const position = await evaluate('document.querySelector("[data-niagara-rail]").scrollLeft'); await delay(1400);
  check('The 21-business row still advances without its former local switch', await evaluate(`document.querySelectorAll('[data-home-place]').length===21 && document.querySelector('[data-niagara-rail]').scrollLeft>${position}+8`));
  const pointer = await evaluate('(()=>{const r=document.querySelector("[data-niagara-rail]").getBoundingClientRect();return{x:r.left+r.width*.8,y:r.top+80,left:document.querySelector("[data-niagara-rail]").scrollLeft}})()');
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: pointer.x, y: pointer.y }); await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: pointer.x, y: pointer.y, button: 'left', clickCount: 1 }); await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: pointer.x-110, y: pointer.y, button: 'left', buttons: 1 }); await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: pointer.x-110, y: pointer.y, button: 'left', clickCount: 1 }); await delay(120);
  check('Drag still moves the row without opening a business accidentally', await evaluate(`location.pathname==='/' && document.querySelector('[data-niagara-rail]').scrollLeft>${pointer.left}+60`));
  await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 1 }); const touch = await evaluate('(()=>{const r=document.querySelector("[data-niagara-rail]").getBoundingClientRect();return{x:r.right-35,y:r.top+80,left:document.querySelector("[data-niagara-rail]").scrollLeft,pageY:scrollY}})()');
  await send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{x:touch.x,y:touch.y}] }); for (let n=1;n<=6;n++) { await send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{x:touch.x-n*20,y:touch.y}] }); await delay(30); } await send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await delay(300);
  check('Native mobile swipe preserves page position and navigation', await evaluate(`location.pathname==='/' && document.querySelector('[data-niagara-rail]').scrollLeft>${touch.left}+40 && Math.abs(scrollY-${touch.pageY})<10`)); await send('Emulation.setTouchEmulationEnabled', { enabled: false });
  await evaluate('document.querySelector("[data-rail-next]").focus()'); await click('[data-rail-next]'); check('Manual row navigation pauses the automatic movement temporarily', await evaluate('document.querySelector("[data-niagara-rail]").dataset.railPlaying==="false"'));
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 5, y: 120 }); await delay(8500);
  check('Business row resumes after manual navigation settles', await evaluate('document.querySelector("[data-niagara-rail]").dataset.railPlaying==="true"'));
  for (const width of [320, 375, 768, 1440, 1920]) { await viewport(width); await delay(80); check(`Homepage and menu fit ${width}`, await evaluate('document.documentElement.scrollWidth<=innerWidth')); await menu(); check(`Menu fits its viewport ${width}`, await evaluate('(()=>{const r=document.querySelector("[data-site-menu]").getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.bottom<=innerHeight})()')); await shot(`motion-menu-${width}`); await escape(); }
  await evaluate('[...document.querySelectorAll("footer button")].find(button=>button.textContent==="Español").click()'); await wait('document.documentElement.lang==="es"'); await menu();
  check('Single menu setting translates into Spanish', await evaluate('document.querySelector("[data-site-menu]").textContent.includes("Animaciones")')); await escape();
  check('No application exceptions or hydration errors', errors.length===0); if (errors.length) console.log(errors);
  if (failures.length) throw Error(failures.join('; ')); console.log('PASS single menu and viewport-timed homepage');
} finally { socket.close(); await fetch(`http://127.0.0.1:9222/json/close/${page.id}`); }
