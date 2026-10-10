import fs from 'node:fs/promises';
const base=process.env.CHECK_URL || 'http://localhost:3027';
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
async function key(key,code){await send('Input.dispatchKeyEvent',{type:'keyDown',key,code,windowsVirtualKeyCode:key==='Escape'?27:9});await send('Input.dispatchKeyEvent',{type:'keyUp',key,code,windowsVirtualKeyCode:key==='Escape'?27:9});}
async function viewport(width){await send('Emulation.setDeviceMetricsOverride',{width,height:920,deviceScaleFactor:1,mobile:true});}
try {
 await send('Page.enable');await send('Runtime.enable');await viewport(375);
 await send('Page.navigate',{url:base+'/explore'});await wait('!!document.querySelector("[data-globe-scene][data-ready=true]")');
 check('real WebGL globe rendered',await evaluate('!!document.querySelector("[data-globe-scene] canvas") && document.querySelector("[data-globe-scene] canvas").width>0'));
 const count=Number(process.env.EXPECT_DESTINATIONS || 6);
 check('destination list covers this milestone',await evaluate(`document.querySelectorAll('[data-country]').length===${count}`));
 const start=await evaluate('document.querySelector("[data-globe-scene]").dataset.camera');await pause(1800);
 check('globe remains still and rotation is opt-in',await evaluate(`document.querySelector('[data-rotate]').getAttribute('aria-pressed')==='false' && document.querySelector('[data-globe-scene]').dataset.camera===${JSON.stringify(start)}`));
 await click('[aria-label="Zoom in"]');await wait(`JSON.parse(document.querySelector('[data-globe-scene]').dataset.camera).altitude<${JSON.parse(start).altitude}`);const zoomed=await evaluate('JSON.parse(document.querySelector("[data-globe-scene]").dataset.camera).altitude');
 check('visible zoom controls change real camera',zoomed<JSON.parse(start).altitude);
 await click('[data-reset]');await pause(500);
 await click('[data-country=curazao]');await wait('!!document.querySelector("[data-selected-country=curazao]")');await wait('Math.abs(JSON.parse(document.querySelector("[data-globe-scene]").dataset.camera).lng+68.9)<.15');
 check('list activation moves keyboard focus into the selected preview',await evaluate('document.activeElement.id==="selected-country-title"'));
 check('small island is selectable and camera focuses it',await evaluate('document.querySelector("[data-selected-country] h2").textContent==="Curaçao" && Math.abs(JSON.parse(document.querySelector("[data-globe-scene]").dataset.camera).lng+68.9)<1'));
 await evaluate('[...document.querySelectorAll("footer button")].find(b=>b.textContent==="Español").click()');await pause(150);
 check('global language translates UI and content while retaining destination',await evaluate('document.querySelector("[data-selected-country=curazao] h2").textContent==="Curazao" && document.querySelector("main input").placeholder.includes("Prueba") && document.querySelector("[data-rotate]").getAttribute("aria-pressed")==="false"'));
 await key('Escape','Escape');check('Escape closes panel and restores destination focus',await evaluate('!document.querySelector("[data-selected-country]") && document.activeElement.dataset.country==="curazao"'));
 await evaluate('[...document.querySelectorAll("footer button")].find(b=>b.textContent==="English").click()');await pause(100);
 await click('[data-region=none]');check('empty region selection has no hidden reset',await evaluate('document.querySelectorAll("[data-country]").length===0'));
 await click('[data-region=sudamerica]');await click('[data-region=norteamerica]');check('multiple regions combine',await evaluate('!!document.querySelector("[data-country=brasil]") && !!document.querySelector("[data-country=mexico]") && !document.querySelector("[data-country=jamaica]")'));
 await click('[data-region=all]');
 for(const width of [320,375,768,1440]){await viewport(width);await pause(80);check('responsive explorer width '+width,await evaluate('document.documentElement.scrollWidth<=innerWidth && [...document.querySelectorAll("button[data-reset],button[data-zoom]")].every(b=>{const r=b.getBoundingClientRect();return r.width>=44 && r.height>=44 && r.left>=0 && r.right<=innerWidth})'));}
 await viewport(1440);
 if(count===54){await evaluate('document.querySelector("[data-country=bermudas]").scrollIntoView({block:"center",behavior:"instant"})');await click('[data-country=bermudas]');await wait('(()=>{const r=document.querySelector("[data-selected-country]").getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight})()');check('last list destination brings its preview into view',true);await key('Escape','Escape');}
 await click('[data-country=colombia]');await pause(600);await evaluate('document.querySelector("[data-globe-scene]").scrollIntoView({block:"center",behavior:"instant"})');
 if(process.env.ARTIFACT_DIR){await fs.mkdir(process.env.ARTIFACT_DIR,{recursive:true});const r=await send('Page.captureScreenshot',{format:'png'});await fs.writeFile(process.env.ARTIFACT_DIR+'/roots-globe-desktop.png',Buffer.from(r.data,'base64'));}
 await click('[aria-label="Close place details"]');await click('[data-rotate]');await pause(250);check('visitor can start rotation',await evaluate('document.querySelector("[data-rotate]").getAttribute("aria-pressed")==="true"'));
 await click('[data-rotate]');await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
 await click('[data-reset]');check('reduced motion settles without a camera tween',await evaluate('new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve(Math.abs(JSON.parse(document.querySelector("[data-globe-scene]").dataset.camera).altitude-2.15)<.02))))'));
 if(count===54){
  for(const slug of ['saba','san-martin-frances','sint-maarten']){
   await click('[data-country='+slug+']');await pause(150);await click('[aria-label="Close place details"]');await evaluate('document.querySelector("[data-globe-scene]").scrollIntoView({block:"center",behavior:"instant"})');
   const islandRect=await evaluate('(()=>{const r=document.querySelector("[data-globe-scene] canvas").getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2}})()');
   await send('Input.dispatchMouseEvent',{type:'mouseMoved',...islandRect});await pause(200);await send('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',clickCount:1,...islandRect});await send('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',clickCount:1,...islandRect});
   await wait('!!document.querySelector("[data-nearby-destinations]")');check('overlapping '+slug+' marker opens explicit choices',await evaluate(`!!document.querySelector('[data-nearby-country=${slug}]') && !document.querySelector('[data-selected-country]')`));
   await click('[data-nearby-country='+slug+']');await wait(`!!document.querySelector('[data-selected-country=${slug}]')`);check('visitor chooses exact '+slug+' from nearby destinations',true);
  }
  await click('[data-country=jamaica]');await wait('Math.abs(JSON.parse(document.querySelector("[data-globe-scene]").dataset.camera).lng+77.319)<.2');
  await click('[aria-label="Close place details"]');await evaluate('document.querySelector("[data-globe-scene]").scrollIntoView({block:"center",behavior:"instant"})');
  const rect=await evaluate('(()=>{const r=document.querySelector("[data-globe-scene] canvas").getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2}})()');
  await send('Input.dispatchMouseEvent',{type:'mouseMoved',...rect});await pause(200);await send('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',clickCount:1,...rect});await send('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',clickCount:1,...rect});
  await wait('!!document.querySelector("[data-selected-country=jamaica]")');check('real globe point or polygon click selects the destination',true);
  await click('[data-country=colombia]');await wait('Math.abs(JSON.parse(document.querySelector("[data-globe-scene]").dataset.camera).lng+73.174)<.2');
  await evaluate('new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))');
  const saved=await evaluate('document.querySelector("[data-globe-scene]").dataset.camera');await click('[data-selected-country] a[href="/explore/colombia"]');await wait('location.pathname==="/explore/colombia" && !!document.querySelector("[data-culture-page=colombia]")');
  check('culture page has real sections and no draft instructions',await evaluate('document.querySelector("[data-culture-page] h1").textContent.includes("Barranquilla") && document.querySelectorAll("[data-culture-page] section").length>=3 && !/ui_placeholder|needs_research|Investigar/.test(document.querySelector("[data-culture-page]").textContent)'));
  await evaluate('[...document.querySelectorAll("footer button")].find(b=>b.textContent==="Español").click()');await pause(100);check('culture content follows shared Spanish selector',await evaluate('document.querySelector("[data-culture-page] h1").textContent==="Barranquilla se expresa en carnaval"'));
  await click('[data-culture-page] a[href="/explore"]');await wait('location.pathname==="/explore" && !!document.querySelector("[data-globe-scene][data-ready=true]")');
  check('return from culture page restores camera and selection',await evaluate(`(()=>{const a=JSON.parse(document.querySelector('[data-globe-scene]').dataset.camera),b=${saved};return Math.abs(a.lat-b.lat)<.02&&Math.abs(a.lng-b.lng)<.02&&Math.abs(a.altitude-b.altitude)<.02&&!!document.querySelector('[data-selected-country=colombia]')})()`));
 }
 await evaluate(`document.querySelector('nav a[href="/events"]').click()`);await wait('location.pathname==="/events"');
 await wait('!document.querySelector("[data-globe-scene] canvas")');check('scene releases its canvas on navigation',await evaluate('!document.querySelector("[data-globe-scene] canvas")'));
 await send('Page.addScriptToEvaluateOnNewDocument',{source:`const rootsGetContext=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return /webgl/i.test(type)?null:rootsGetContext.call(this,type,...args);};`});
 await send('Page.navigate',{url:base+'/explore'});await wait('!!document.querySelector("[role=status]") && [...document.querySelectorAll("[role=status]")].some(el=>el.textContent.includes("3D globe is unavailable"))');
 check('WebGL failure keeps the full list and visible disabled zoom controls',await evaluate(`document.querySelectorAll('[data-country]').length===${count} && document.querySelector('[data-zoom]').disabled && !!document.querySelector('[data-reset]')`));
 await evaluate('document.querySelector("main input").focus()');await send('Input.insertText',{text:count===54?'Saba':'Curaçao'});await wait('document.querySelectorAll("[data-country]").length===1');
 await click(count===54?'[data-country=saba]':'[data-country=curazao]');
 check('search and selection work without WebGL',await evaluate('!!document.querySelector("[data-selected-country]")'));
 check('no runtime exceptions',errors.length===0);if(errors.length)console.log(errors);
 if(failures.length)throw Error(failures.join('; '));console.log('PASS Explore Our Roots');
} finally {ws.close();await fetch('http://127.0.0.1:9222/json/close/'+page.id);}
