import fs from 'node:fs/promises';
const base=process.env.CHECK_URL || 'http://localhost:3044';
const page=await(await fetch('http://127.0.0.1:9222/json/new?about:blank',{method:'PUT'})).json();
const ws=new WebSocket(page.webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r,{once:true}));
let id=0;const pending=new Map(),errors=[],failures=[];
ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(pending.has(m.id)){const p=pending.get(m.id);pending.delete(m.id);if(m.error)p.reject(m.error);else p.resolve(m.result);}if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.text);});
const send=(method,params={})=>new Promise((resolve,reject)=>{const n=++id;pending.set(n,{resolve,reject});ws.send(JSON.stringify({id:n,method,params}));});
const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
const pause=ms=>new Promise(r=>setTimeout(r,ms));
const check=(name,ok)=>{console.log(name,ok);if(!ok)failures.push(name);};
async function wait(expr){for(let i=0;i<200;i++){if(await evaluate(expr))return;await pause(75);}throw Error(expr);}
async function click(sel){await evaluate(`document.querySelector(${JSON.stringify(sel)}).click()`);await pause(150);}
async function viewport(width){await send('Emulation.setDeviceMetricsOverride',{width,height:920,deviceScaleFactor:1,mobile:true});}
try {
 await send('Page.enable');await send('Runtime.enable');await send('Network.enable');await send('Page.bringToFront');await send('Emulation.setFocusEmulationEnabled',{enabled:true});await viewport(375);
 await send('Page.navigate',{url:base+'/explore/colombia'});await wait('!!document.querySelector("[data-culture-page=colombia]")');await evaluate('localStorage.removeItem("nc-latin-club-language")');await send('Page.reload');await wait('!!document.querySelector("[data-culture-page=colombia]")');await pause(600);
 await wait('!![...document.querySelectorAll("footer button")].find(b=>b.textContent==="Español")');
 check('English is the initial cultural language',await evaluate('document.querySelector("[data-culture-page=colombia]").textContent.includes("Caribbean rhythms, Pacific voices and Andean tables")'));
 check('Colombia spans regions, food and distinct traditions',await evaluate('(()=>{const m=document.querySelector("[data-culture-page=colombia]");return ["Greater Magdalena","South Pacific","Arepas","Barranquilla"].every(t=>m.textContent.includes(t))})()'));
 check('Reviewed Spotify players are present without load or close controls',await evaluate('document.querySelectorAll("[data-music-player] iframe").length===document.querySelectorAll("#culture-music article").length && document.querySelectorAll("#culture-music article").length>0 && !document.querySelector("[data-load-track]")'));
 for(const width of [320,375,768,1440]){await viewport(width);await pause(80);check('Cultural page has no horizontal overflow at '+width,await evaluate('document.documentElement.scrollWidth<=innerWidth'))}
 await viewport(375);await evaluate('[...document.querySelectorAll("footer button")].find(b=>b.textContent==="Español").click()');await wait('document.querySelector("[data-culture-page=colombia]").textContent.includes("Ritmos caribeños")');
 check('Global selector translates cultural text and player titles',await evaluate('document.querySelector("[data-culture-page=colombia]").textContent.includes("En la mesa") && document.querySelector("[data-music-player] iframe").title.includes("Reproductor")'));
 check('Players grant no autoplay and specify no autoplay URL',await evaluate('[...document.querySelectorAll("iframe")].every(f=>!f.allow.includes("autoplay") && !f.src.includes("autoplay"))'));
 await send('Emulation.setFocusEmulationEnabled',{enabled:false});
 const background=await(await fetch('http://127.0.0.1:9222/json/new?about:blank',{method:'PUT'})).json();
 const backgroundSocket=new WebSocket(background.webSocketDebuggerUrl);await new Promise(r=>backgroundSocket.addEventListener('open',r,{once:true}));
 backgroundSocket.send(JSON.stringify({id:1,method:'Page.bringToFront'}));await wait('document.hidden');await wait('[...document.querySelectorAll("[data-culture-page=colombia] iframe")].every(f=>f.src==="about:blank")');
 check('Backgrounding the tab stops every Spotify frame',await evaluate('document.querySelectorAll("[data-music-player] iframe").length===document.querySelectorAll("#culture-music article").length && document.querySelectorAll("#culture-music article").length>0'));
 backgroundSocket.close();await fetch(`http://127.0.0.1:9222/json/close/${background.id}`);await send('Page.bringToFront');await send('Emulation.setFocusEmulationEnabled',{enabled:true});await wait('!document.hidden');await wait('[...document.querySelectorAll("[data-music-player] iframe")].every(f=>f.src.includes("spotify.com/embed/"))');
 check('Refocusing restores ready players without requesting autoplay',await evaluate('[...document.querySelectorAll("iframe")].every(f=>!f.allow.includes("autoplay"))'));
 await click('[data-culture-page=colombia] a[href="/explore"]');await wait('location.pathname==="/explore" && !!document.querySelector("[data-country=colombia]")');
 check('Leaving a cached country route stops the Spotify frames',await evaluate('[...document.querySelectorAll("iframe")].every(f=>f.src==="about:blank")'));
 await click('[data-country=colombia]');await wait('!!document.querySelector("[data-selected-country=colombia]")');await click('[data-selected-country=colombia] a[href="/explore/colombia"]');await wait('location.pathname==="/explore/colombia"');await pause(300);
 check('Returning restores ready players without load buttons or autoplay',await evaluate('document.querySelectorAll("[data-culture-page=colombia] iframe").length===document.querySelectorAll("#culture-music article").length && document.querySelectorAll("#culture-music article").length>0 && !document.querySelector("[data-load-track]") && [...document.querySelectorAll("iframe")].every(f=>!f.allow.includes("autoplay"))'));
 await send('Page.navigate',{url:base+'/explore/saba'});await wait('!!document.querySelector("[data-culture-page=saba]")');check('Tiny territory has its own substantive page and no empty music panel',await evaluate('document.querySelector("[data-culture-page=saba]").textContent.includes("Saba lace") && !document.querySelector("[data-music-player]")'));
 await viewport(320);check('Small territory page fits narrow mobile',await evaluate('document.documentElement.scrollWidth<=innerWidth'));
 await send('Page.navigate',{url:base+'/explore/canada'});await wait('!!document.querySelector("[data-culture-page=canada]")');check('Canada has a host-country page and both verified recordings',await evaluate('document.querySelector("[data-culture-page=canada] h1").textContent==="Canada" && document.querySelectorAll("[data-music-player] iframe").length===2 && document.querySelector("main").textContent.includes("First Nations")'));
 await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false}).then(r=>fs.writeFile('/workspace/artifacts/culture-canada-mobile.png',Buffer.from(r.data,'base64')));
 check('No application runtime exception',errors.length===0);console.log('Failures',failures);if(failures.length)process.exitCode=1;
} finally {ws.close();await fetch(`http://127.0.0.1:9222/json/close/${page.id}`)}
