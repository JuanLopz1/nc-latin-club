import assert from 'node:assert/strict';
const base = process.env.CHECK_URL || 'http://127.0.0.1:3101';
const page = await (
  await fetch('http://127.0.0.1:9222/json/new?about:blank', { method: 'PUT' })
).json();
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve) => ws.addEventListener('open', resolve, { once: true }));
let sequence = 0;
const pending = new Map();
ws.addEventListener('message', (event) => {
  const m = JSON.parse(event.data);
  if (!pending.has(m.id)) return;
  const task = pending.get(m.id);
  pending.delete(m.id);
  if (m.error) task.reject(m.error);
  else task.resolve(m.result);
});
const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const id = ++sequence;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });
const ev = async (expression) => {
  const r = await send('Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  if (r.exceptionDetails) throw Error(JSON.stringify(r.exceptionDetails));
  return r.result.value;
};
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function wait(expression) {
  for (let i = 0; i < 150; i++) {
    if (await ev(expression)) return;
    await pause(100);
  }
  throw Error('Timed out: ' + expression);
}
async function click() {
  await ev(
    'document.querySelector("[data-room-play]").scrollIntoView({block:"center",behavior:"instant"})',
  );
  const point = await ev(
    '(()=>{const r=document.querySelector("[data-room-play]").getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2}})()',
  );
  await send('Input.dispatchMouseEvent', {
    type: 'mousePressed',
    button: 'left',
    clickCount: 1,
    ...point,
  });
  await send('Input.dispatchMouseEvent', {
    type: 'mouseReleased',
    button: 'left',
    clickCount: 1,
    ...point,
  });
}
const audio = 'document.querySelector("[data-room-music] audio")';
try {
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Page.bringToFront');
  await send('Page.navigate', { url: base + '/fototeca' });
  await wait('!!document.querySelector("[data-room-play]")');
  await pause(600);
  assert.equal(await ev(audio + '.paused'), true, 'No autoplay');
  await click();
  await wait(audio + '.currentTime>.2');
  assert.deepEqual(
    await ev(
      `({muted:${audio}.muted,volume:${audio}.volume,ready:${audio}.readyState>=2,error:${audio}.error?.code??null})`,
    ),
    { muted: false, volume: 0.4, ready: true, error: null },
  );
  await ev('document.querySelector("[data-room-music] input[type=range]").focus()');
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'End', code: 'End' });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'End', code: 'End' });
  await wait(audio + '.volume===1');
  await click();
  await wait(audio + '.paused');
  const stopped = await ev(audio + '.currentTime');
  await pause(250);
  assert.equal(await ev(audio + '.currentTime'), stopped);
  await click();
  await wait(audio + '.currentTime>' + stopped);
  await ev('document.querySelector("[data-room-music] input[type=range]").focus()');
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Home', code: 'Home' });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Home', code: 'Home' });
  await wait(audio + '.volume===0');
  await ev(
    `window.__previousRoomAudio=${audio};document.querySelector('main a[href="/"]').click()`,
  );
  await wait('location.pathname==="/"');
  await wait('window.__previousRoomAudio.paused');
  console.log(
    'PASS native media: decoded audio, advancing playback, volume, pause/resume, mute, navigation cleanup and no autoplay. PCM level/headroom tested by room-audio.test.cjs.',
  );
} finally {
  ws.close();
  await fetch('http://127.0.0.1:9222/json/close/' + page.id);
}
