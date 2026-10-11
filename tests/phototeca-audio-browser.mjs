import assert from 'node:assert/strict';
const base=process.env.CHECK_URL||'http://127.0.0.1:3101';
const page=await(await fetch('http://127.0.0.1:9222/json/new?about:blank',{method:'PUT'})).json();
const ws=new WebSocket(page.webSocketDebuggerUrl);await new Promise(resolve=>ws.addEventListener('open',resolve,{once:true}));
let sequence=0;const pending=new Map();
ws.addEventListener('message',event=>{const m=JSON.parse(event.data);if(!pending.has(m.id))return;const task=pending.get(m.id);pending.delete(m.id);if(m.error)task.reject(m.error);else task.resolve(m.result);});
const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++sequence;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));});
const ev=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function wait(expression){for(let i=0;i<150;i++){if(await ev(expression))return;await pause(100);}throw Error('Timed out: '+expression);}
async function click(){await ev('document.querySelector("[data-room-play]").scrollIntoView({block:"center",behavior:"instant"})');await pause(100);const point=await ev('(()=>{const r=document.querySelector("[data-room-play]").getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2}})()');await send('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',clickCount:1,...point});await send('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',clickCount:1,...point});}
// Observe the actual production audio graph using native Web Audio, not a mock.
const capture=`(()=>{const Native=window.AudioContext;window.__roomAudio=[];window.AudioContext=class extends Native{constructor(...args){super(...args);const analyser=this.createAnalyser();analyser.fftSize=2048;const create=this.createGain.bind(this);this.createGain=()=>{const gain=create(),connect=gain.connect.bind(gain);gain.connect=(destination,...ports)=>{if(destination===this.destination){connect(analyser);analyser.connect(destination);return destination;}return connect(destination,...ports);};return gain;};window.__roomAudio.push({context:this,analyser});}};})()`;
async function levels(){return ev(`(async()=>{const {context,analyser}=window.__roomAudio.at(-1),buffer=new Float32Array(analyser.fftSize);let sum=0,samples=0,peak=0;for(let i=0;i<24;i++){await new Promise(r=>setTimeout(r,60));analyser.getFloatTimeDomainData(buffer);for(const value of buffer){sum+=value*value;samples++;peak=Math.max(peak,Math.abs(value));}}return{state:context.state,rms:Math.sqrt(sum/samples),peak};})()`);}
try{
 await send('Page.enable');await send('Runtime.enable');await send('Page.bringToFront');await send('Emulation.setFocusEmulationEnabled',{enabled:true});await send('Emulation.setDeviceMetricsOverride',{width:1200,height:850,deviceScaleFactor:1,mobile:false});await send('Page.addScriptToEvaluateOnNewDocument',{source:capture});
 await send('Page.navigate',{url:base+'/fototeca'});await wait('!!document.querySelector("[data-room-play]")');await pause(600);
 assert.equal(await ev('window.__roomAudio.length'),0,'Music must not start before the visitor presses Play');
 await click();await wait('document.querySelector("[data-room-music]").dataset.soundPlaying==="true"');
 const normal=await levels();console.log('Actual output at default volume',normal);assert.equal(normal.state,'running');
 assert.ok(normal.rms>=.02,`Default mix is too quiet: RMS ${normal.rms} (${(20*Math.log10(normal.rms)).toFixed(1)} dBFS), expected at least -34 dBFS`);
 await ev('(()=>{const input=document.querySelector("[data-room-music] input[type=range]");Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,"value").set.call(input,"1");input.dispatchEvent(new Event("input",{bubbles:true}));input.dispatchEvent(new Event("change",{bubbles:true}));})()');await pause(300);await click();await wait('window.__roomAudio.at(-1).context.state==="closed"');await click();await wait('document.querySelector("[data-room-music]").dataset.soundPlaying==="true"');
 const loud=await levels();console.log('Actual output at maximum volume',loud);assert.ok(loud.rms>normal.rms*1.5,'Volume control should increase real audio output');assert.ok(loud.peak<.95,'Maximum volume should preserve headroom without clipping');
 await ev('(()=>{const input=document.querySelector("[data-room-music] input[type=range]");Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,"value").set.call(input,"0");input.dispatchEvent(new Event("input",{bubbles:true}));input.dispatchEvent(new Event("change",{bubbles:true}));})()');await pause(600);
 assert.ok((await levels()).rms<.00001,'Zero volume must actually silence the output');
 await click();await wait('window.__roomAudio.at(-1).context.state==="closed"');await click();await wait('document.querySelector("[data-room-music]").dataset.soundPlaying==="true"');
 // Native client navigation exercises Next's cached route lifecycle cleanup.
 await ev('[...document.querySelectorAll("main a[href]")].find(a=>a.getAttribute("href")==="/").click()');await wait('location.pathname==="/"');await wait('window.__roomAudio.every(p=>p.context.state==="closed")');
 console.log('PASS native audio: audible default, working volume, no clipping, mute, pause/restart, cached navigation cleanup; no autoplay.');
}finally{ws.close();await fetch('http://127.0.0.1:9222/json/close/'+page.id);}
