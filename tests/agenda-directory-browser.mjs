// Production interaction checks; run with CHECK_URL and Chromium CDP on port 9222.
import fs from 'node:fs/promises';
const base=process.env.CHECK_URL || 'http://localhost:3025';
const page=await(await fetch('http://127.0.0.1:9222/json/new?about:blank',{method:'PUT'})).json();
const socket=new WebSocket(page.webSocketDebuggerUrl);await new Promise(r=>socket.addEventListener('open',r,{once:true}));
let id=0;const pending=new Map(),errors=[],failures=[];
socket.addEventListener('message',e=>{const m=JSON.parse(e.data);if(pending.has(m.id)){const p=pending.get(m.id);pending.delete(m.id);if(m.error)p.reject(m.error);else p.resolve(m.result);}if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.text);if(m.method==='Runtime.consoleAPICalled'&&m.params.type==='error')errors.push(m.params.args.map(a=>a.value??a.description).join(' '));});
const send=(method,params={})=>new Promise((resolve,reject)=>{const n=++id;pending.set(n,{resolve,reject});socket.send(JSON.stringify({id:n,method,params}));});
const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
const pause=ms=>new Promise(r=>setTimeout(r,ms));
const check=(name,ok)=>{console.log(name,ok);if(!ok)failures.push(name);};
async function wait(expression){for(let i=0;i<120;i++){if(await evaluate(expression))return;await pause(60);}throw Error(expression);}
async function click(selector){await evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);await pause(80);}
async function goto(path){await send('Page.navigate',{url:base+path});await wait('document.readyState==="complete" && !!document.querySelector("main h1")');await evaluate('document.fonts.ready');await pause(120);}
async function viewport(width){await send('Emulation.setDeviceMetricsOverride',{width,height:920,deviceScaleFactor:1,mobile:true});}
async function screenshot(name){if(!process.env.ARTIFACT_DIR)return;await fs.mkdir(process.env.ARTIFACT_DIR,{recursive:true});const shot=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await fs.writeFile(process.env.ARTIFACT_DIR+'/'+name+'.png',Buffer.from(shot.data,'base64'));}
try {
 await send('Page.enable');await send('Runtime.enable');await viewport(375);
 await send('Page.addScriptToEvaluateOnNewDocument',{source:'const RealDate=Date;globalThis.Date=class extends RealDate{constructor(...args){super(...(args.length?args:[RealDate.UTC(2026,9,10,16)]));}static now(){return RealDate.UTC(2026,9,10,16);}};'});
 await goto('/events');await evaluate('localStorage.clear()');await send('Page.reload');await wait('!!document.querySelector("[data-category]")');
 check('agenda starts with two real event filters selected',await evaluate('document.querySelectorAll("[data-category][aria-pressed=true]").length===2 && document.querySelector("[data-categories=all]").getAttribute("aria-pressed")==="true" && document.querySelector("#scope-events").getAttribute("aria-selected")==="true"'));
 check('initial list separates three upcoming events from cultural annual dates',await evaluate('document.querySelectorAll("[data-entry]").length===3 && !!document.querySelector("[data-entry=latin-fiesta-2026]") && !!document.querySelector("[data-entry=lataff-2026]") && !document.querySelector("[data-entry=latin-heritage-2026]") && document.querySelector("#agenda-panel [role=status]").textContent.includes("3 events")'));
 await click('[data-category=out-of-nc]');
 check('deselecting external events retains campus event',await evaluate('document.querySelectorAll("[data-category][aria-pressed=true]").length===1 && document.querySelectorAll("[data-entry]").length===1 && !!document.querySelector("[data-entry=latin-fiesta-2026]")'));
 await click('[data-categories=none]');check('no selection gives zero results with helpful message',await evaluate('document.querySelectorAll("[data-entry]").length===0 && document.querySelector("main").textContent.includes("Choose at least one category")'));
 await click('[data-category=out-of-nc]');await click('[data-category=at-nc]');
 check('multiple real event categories can be selected from none',await evaluate('document.querySelectorAll("[data-category][aria-pressed=true]").length===2 && document.querySelectorAll("[data-entry]").length===3'));
 await click('[data-period=past]');check('external events retain nine archived editions',await evaluate('document.querySelectorAll("[data-entry]").length===9 && document.querySelector("[data-category=out-of-nc]").textContent.includes("09") && document.querySelector("[data-category=at-nc]").textContent.includes("00")'));
 await click('[data-view=calendar]');
 check('calendar counts respect archive period and selected month',await evaluate('document.querySelector("[data-category=out-of-nc]").textContent.includes("01") && document.querySelector("[data-category=at-nc]").textContent.includes("00") && document.querySelectorAll("[data-month-observance]").length===0'));
 await click('[data-date="2026-10-01"]');check('archive calendar retains Alucine across its September to October range',await evaluate('document.querySelectorAll("[data-entry]").length===1 && !!document.querySelector("[data-entry=alucine-2026]")'));
 await click('[data-period=upcoming]');await click('[data-date="2026-10-23"]');
 check('real event day combines campus and regional events with October counts',await evaluate('!!document.querySelector("[data-entry=latin-fiesta-2026]") && !!document.querySelector("[data-entry=lataff-2026]") && document.querySelector("[data-category=at-nc]").textContent.includes("01") && document.querySelector("[data-category=out-of-nc]").textContent.includes("02")'));
 await evaluate('document.querySelector("#scope-events").focus()');await send('Input.dispatchKeyEvent',{type:'keyDown',key:'ArrowRight',code:'ArrowRight'});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'ArrowRight',code:'ArrowRight'});await pause(100);
 check('scope tabs support keyboard activation and independent culture',await evaluate('document.activeElement.id==="scope-culture" && document.querySelector("#scope-culture").getAttribute("aria-selected")==="true" && !document.querySelector("[data-category]") && document.querySelectorAll("[data-month-observance=latin-heritage-2026]").length===1 && !document.querySelector("[data-entry=latin-fiesta-2026]")'));
 check('whole month culture appears once outside daily cards',await evaluate('!document.querySelector("[data-entry=latin-heritage-2026]")'));
 await click('#scope-events');await click('[data-category=at-nc]');
 check('event filter selection remains independent of culture',await evaluate('document.querySelectorAll("[data-month-observance]").length===0 && !document.querySelector("[data-entry=latin-fiesta-2026]") && !!document.querySelector("[data-entry=lataff-2026]")'));
 await click('#scope-culture');await click('[data-date="2026-10-10"]');await evaluate('document.querySelector("[data-month-observance]").click()');await wait('location.pathname.endsWith("/latin-heritage-2026")');await wait(`!!document.querySelector('main a[href="/events"]')`);
 await click('main a[href="/events"]');await wait('!!document.querySelector("[data-view=calendar][aria-pressed=true]")');
 check('return preserves culture tab calendar month and selected day',await evaluate(`document.querySelector('#scope-culture').getAttribute('aria-selected')==='true' && document.querySelector('[data-date="2026-10-10"]').getAttribute('aria-pressed')==='true'`));
 await evaluate('[...document.querySelectorAll("footer button")].find(b=>b.textContent==="Español").click()');await pause(100);
 check('monthly block and independent culture translate to Spanish',await evaluate('document.querySelector("[data-month-observance]").textContent.includes("Todo el mes") && document.querySelector("#scope-culture").textContent==="Cultura" && document.querySelector("#agenda-panel [role=status]").textContent.startsWith("1 fecha cultural ·")'));
 await evaluate('[...document.querySelectorAll("footer button")].find(b=>b.textContent==="English").click()');await pause(100);
 await evaluate('window.scrollTo({top:scrollY+document.getElementById("calendar-month").getBoundingClientRect().top-105,behavior:"instant"})');await screenshot('calendar-month-observance-mobile');
 await click('[data-view=list]');await evaluate('document.querySelector("#culture-year").value="2027";document.querySelector("#culture-year").dispatchEvent(new Event("change",{bubbles:true}))');await pause(100);
 check('culture list includes only selected annual year',await evaluate('document.querySelectorAll("[data-entry]").length>0 && !!document.querySelector("[data-entry=latin-heritage-2027]") && !document.querySelector("[data-entry=latin-heritage-2026]") && !document.querySelector("[data-entry=latin-heritage-2028]")'));
 await evaluate('document.querySelector("#culture-year").value="2026";document.querySelector("#culture-year").dispatchEvent(new Event("change",{bubbles:true}))');await pause(100);await click('[data-period=past]');
 check('culture archive remains available in selected year',await evaluate('document.querySelectorAll("[data-entry]").length>0 && [...document.querySelectorAll("[data-entry] time")].every(t=>t.dateTime.startsWith("2026"))'));
 await click('[data-period=upcoming]');await click('[data-view=calendar]');await click('button[aria-label="Next month"]');await click('[data-date="2026-11-01"]');
 check('short multiday cultural traditions remain daily',await evaluate('!!document.querySelector("[data-entry=muertos-2026]") && document.querySelectorAll("[data-month-observance]").length===0'));
 await click('button[aria-label="Next month"]');await click('button[aria-label="Next month"]');
 check('month controls cross year boundary',await evaluate(`document.querySelector('[data-date="2027-01-01"]').getAttribute('aria-pressed')==='true'`));
 await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});await click('button[aria-label="Previous month"]');
 check('reduced motion calendar has no active animations',await evaluate('document.querySelector("main").getAnimations({subtree:true}).every(a=>a.playState!=="running")'));
 for(const width of [320,375,768,1440]){await viewport(width);check('calendar fits width '+width,await evaluate('document.documentElement.scrollWidth<=innerWidth'));}
 await goto('/events/latin-heritage-2026');await wait(`!!document.querySelector('main a[href="/events"]')`);
 check('monthly story identifies the whole month',await evaluate('document.querySelector("main").textContent.includes("All month")'));
 await click('main a[href="/events"]');await wait('document.querySelectorAll("[data-category][aria-pressed=true]").length===2');
 check('fresh direct story returns to real event default',await evaluate('document.querySelector("[data-view=list]").getAttribute("aria-pressed")==="true" && document.querySelector("#scope-events").getAttribute("aria-selected")==="true"'));
 await goto('/');await wait('!!document.querySelector("#events [role=timer]")');
 check('homepage Fiesta countdown and downloadable UTC calendar are available',await evaluate(`(async()=>{const link=document.querySelector('#events a[download="latin-fiesta-2026.ics"]');if(!link)return false;const text=await(await fetch(link.href)).text();return text.includes('DTSTART:20261024T000000Z')&&text.includes('DTEND:20261024T040000Z');})()`));
 await goto('/events/latin-fiesta-2026');await wait('!!document.querySelector("[role=timer]")');
 check('Fiesta detail shows same countdown and calendar download',await evaluate(`!!document.querySelector('a[download="latin-fiesta-2026.ics"]')`));
 await viewport(375);await goto('/niagara');await wait('document.querySelectorAll(".leaflet-marker-icon").length===16');
 check('Niagara starts with all 21 businesses and all filter options',await evaluate('document.querySelectorAll("article[data-place]").length===21 && [...document.querySelectorAll("[data-filter] input")].every(i=>i.checked)'));
 await click('[data-filter=category] summary');await click('[data-filter=category] input[value=all]');
 check('deselect all categories clears cards and pins',await evaluate('document.querySelectorAll("article[data-place]").length===0 && document.querySelectorAll(".leaflet-marker-icon").length===0'));
 await click('[data-filter=category] input[value=grocery_store]');const grocery=await evaluate('document.querySelectorAll("article[data-place]").length');await click('[data-filter=category] input[value=restaurant]');
 check('restaurant and grocery combine without duplicate cards',await evaluate(`document.querySelectorAll("article[data-place]").length>${grocery} && document.querySelectorAll("article[data-place=la-paisana-tienda]").length===1 && document.querySelectorAll("article[data-place=la-paisana-restaurante]").length===1`));
 await click('[data-filter=category] summary');await click('article[data-place=la-paisana-restaurante] > button');
 check('one card expands while summary is rendered once',await evaluate('document.querySelectorAll("article[data-selected]").length===1 && document.querySelector("article[data-selected]").querySelectorAll("h2").length===1 && document.querySelector("article[data-selected]").querySelectorAll("a[href*=google]").length===1 && !!document.querySelector("article[data-selected] section:not([hidden])")'));
 await click('[data-filter=category] summary');await click('[data-filter=category] input[value=restaurant]');
 check('filter excluding selected spot clears expansion and map selection',await evaluate('document.querySelectorAll("article[data-selected]").length===0 && !document.querySelector("article[data-place=la-paisana-restaurante]")'));
 await click('[data-filter=category] input[value=all]');await click('[data-filter=category] summary');
 await click('article[data-place=coco-bar-mexican-grill] > button');await pause(150);await screenshot('niagara-single-card-mobile');
 await click('article[data-place=coco-bar-mexican-grill] > button');
 check('same card toggles closed',await evaluate('!document.querySelector("article[data-selected]") && document.querySelector("#detail-coco-bar-mexican-grill").hidden'));
 for(const width of [320,375,768,1440]){await viewport(width);await click('[data-filter=category] summary');check('Niagara open multiselect fits width '+width,await evaluate('document.documentElement.scrollWidth<=innerWidth'));await click('[data-filter=category] summary');}
 check('no JavaScript errors',errors.length===0);if(errors.length)console.log(errors);
 if(failures.length)throw Error(failures.join('; '));console.log('PASS agenda and directory interactions');
} finally {socket.close();await fetch('http://127.0.0.1:9222/json/close/'+page.id);}
