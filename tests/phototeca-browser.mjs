import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import sharp from 'sharp';
const base = process.env.CHECK_URL || 'http://127.0.0.1:3081';
const page = await (
  await fetch('http://127.0.0.1:9222/json/new?about:blank', { method: 'PUT' })
).json();
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r, { once: true }));
let id = 0;
const pending = new Map();
const errors = [];
ws.addEventListener('message', (event) => {
  const m = JSON.parse(event.data);
  if (pending.has(m.id)) {
    const p = pending.get(m.id);
    pending.delete(m.id);
    if (m.error) p.reject(m.error);
    else p.resolve(m.result);
  }
  if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.text);
});
const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const n = ++id;
    pending.set(n, { resolve, reject });
    ws.send(JSON.stringify({ id: n, method, params }));
  });
const ev = async (expression) => {
  const r = await send('Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  if (r.exceptionDetails) throw Error(r.exceptionDetails.text);
  return r.result.value;
};
const pause = (ms) => new Promise((r) => setTimeout(r, ms));
const wait = async (expression) => {
  for (let i = 0; i < 180; i++) {
    if (await ev(expression)) return;
    await pause(75);
  }
  throw Error('Timed out: ' + expression);
};
const click = async (selector) => {
  if (selector === '[data-room-play]') {
    await ev(
      `document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'center',behavior:'instant'})`,
    );
    await pause(100);
    const p = await ev(
      `(()=>{const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2}})()`,
    );
    await send('Input.dispatchMouseEvent', {
      type: 'mousePressed',
      button: 'left',
      clickCount: 1,
      ...p,
    });
    await send('Input.dispatchMouseEvent', {
      type: 'mouseReleased',
      button: 'left',
      clickCount: 1,
      ...p,
    });
  } else await ev(`document.querySelector(${JSON.stringify(selector)}).click()`);
  await pause(100);
};
const fill = async (selector, text) => {
  await ev(
    `(()=>{const el=document.querySelector(${JSON.stringify(selector)});el.scrollIntoView({block:'center',behavior:'instant'});el.focus();})()`,
  );
  await send('Input.dispatchKeyEvent', {
    type: 'keyDown',
    key: 'a',
    code: 'KeyA',
    modifiers: 2,
    windowsVirtualKeyCode: 65,
  });
  await send('Input.dispatchKeyEvent', {
    type: 'keyUp',
    key: 'a',
    code: 'KeyA',
    modifiers: 2,
    windowsVirtualKeyCode: 65,
  });
  await send('Input.insertText', { text });
};
const shot = async (name) => {
  await fs.mkdir('/workspace/artifacts', { recursive: true });
  const data = await send('Page.captureScreenshot', { format: 'png' });
  await fs.writeFile(
    '/workspace/artifacts/' + name + '.png',
    Buffer.from(data.data, 'base64'),
  );
};
try {
  await send('Page.enable');
  await send('Network.enable');
  await send('Network.clearBrowserCookies');
  await send('Runtime.enable');
  await send('Page.bringToFront');
  await send('Emulation.setFocusEmulationEnabled', { enabled: true });
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await send('Page.navigate', { url: base + '/fototeca' });
  await wait('!!document.querySelector("[data-phototeca]")');
  await ev('localStorage.clear()');
  await send('Page.reload');
  await wait(
    '!!document.querySelector("[data-photo-form] input[name=images]:not(:disabled)")',
  );
  await pause(500);
  assert.equal(
    await ev('document.querySelector("[data-room-music]").dataset.soundPlaying'),
    'false',
  );
  await shot('fototeca-empty-desktop');
  await click('[data-room-play]');
  await wait('document.querySelector("[data-room-music]").dataset.soundPlaying==="true"');
  await ev('document.querySelector("[data-room-music] input[type=range]").focus()');
  await send('Input.dispatchKeyEvent', {
    type: 'keyDown',
    key: 'ArrowRight',
    code: 'ArrowRight',
  });
  await send('Input.dispatchKeyEvent', {
    type: 'keyUp',
    key: 'ArrowRight',
    code: 'ArrowRight',
  });
  await click('[data-room-play]');
  await wait(
    'document.querySelector("[data-room-music]").dataset.soundPlaying==="false"',
  );
  console.log('PASS room music starts by decision, volume and pause work');
  await fs.mkdir('/tmp/nc-gallery-images', { recursive: true });
  await sharp({ create: { width: 900, height: 600, channels: 3, background: '#ff75cb' } })
    .png()
    .toFile('/tmp/nc-gallery-images/pink.png');
  await sharp({ create: { width: 600, height: 900, channels: 3, background: '#76dbe3' } })
    .png()
    .toFile('/tmp/nc-gallery-images/blue.png');
  await send('DOM.enable');
  let root = await send('DOM.getDocument');
  let input = await send('DOM.querySelector', {
    nodeId: root.root.nodeId,
    selector: 'input[name=images]',
  });
  await send('DOM.setFileInputFiles', {
    nodeId: input.nodeId,
    files: ['/tmp/nc-gallery-images/pink.png', '/tmp/nc-gallery-images/blue.png'],
  });
  await fill('textarea[name=caption]', 'Browser photo memories');
  await fill('input[name=credit]', 'Founder');
  await click('input[name=consent]');
  await pause(2200);
  await click('[data-photo-form] button[type=submit]');
  await wait('!!document.querySelector("[data-submission-success]")');
  console.log('PASS real visitor form sends two photos');
  assert.equal(await ev('document.querySelectorAll("[data-gallery-photo]").length'), 0);
  await send('Page.navigate', { url: base + '/admin' });
  await wait('!!document.querySelector("[data-admin-login]")');
  await fill('input[name=email]', 'admin@example.com');
  await fill('input[name=password]', 'fixture-only-password');
  await click('[data-admin-login] button');
  await wait('!!document.querySelector("[data-collection=gallery]")');
  await click('[data-collection=gallery]');
  await wait('!!document.querySelector("[data-photo-inbox]")');
  await click('[data-save-draft]');
  await wait('!!document.querySelector("[data-accept-submission]:not(:disabled)")');
  await click('[data-accept-submission]');
  await wait('document.querySelectorAll("[data-admin-photo]").length===2');
  assert.equal(
    await ev('document.querySelectorAll("[data-pending-submission]").length'),
    0,
  );
  console.log('PASS inbox adds a reviewed batch to private draft');
  for (let i = 0; i < 2; i++) {
    await click(`[data-admin-photo]:nth-child(${i + 1})`);
    await fill(
      `textarea[name="gallery.photos.${i}.caption.es"]`,
      'Recuerdos de la familia',
    );
    await fill(
      `textarea[name="gallery.photos.${i}.alt.es"]`,
      'Imagen de prueba del álbum del club',
    );
  }
  await click('[data-publish]');
  await wait(
    'document.querySelector("main").textContent.includes("Published. New page requests")',
  );
  await send('Page.navigate', { url: base + '/fototeca' });
  await wait(
    'document.querySelectorAll("[data-gallery-photo]").length===2 && !!document.querySelector("[data-photo-form] input[name=images]:not(:disabled)")',
  );
  await click('[data-gallery-photo]');
  await wait('!!document.querySelector("dialog[open]")');
  assert.equal(
    await ev('document.querySelector("dialog img").alt'),
    'Browser photo memories',
  );
  await send('Input.dispatchKeyEvent', {
    type: 'keyDown',
    key: 'ArrowRight',
    code: 'ArrowRight',
  });
  await send('Input.dispatchKeyEvent', {
    type: 'keyUp',
    key: 'ArrowRight',
    code: 'ArrowRight',
  });
  assert.ok(await ev('document.querySelector("dialog").textContent.includes("2 / 2")'));
  await send('Input.dispatchKeyEvent', {
    type: 'keyDown',
    key: 'Escape',
    code: 'Escape',
    windowsVirtualKeyCode: 27,
  });
  await send('Input.dispatchKeyEvent', {
    type: 'keyUp',
    key: 'Escape',
    code: 'Escape',
    windowsVirtualKeyCode: 27,
  });
  await wait('!document.querySelector("dialog[open]")');
  assert.equal(
    await ev('document.activeElement?.hasAttribute("data-gallery-photo")'),
    true,
  );
  console.log('PASS published gallery lightbox, arrows, Escape and focus return');
  for (const width of [320, 375, 768, 1440]) {
    await send('Emulation.setDeviceMetricsOverride', {
      width,
      height: 900,
      deviceScaleFactor: 1,
      mobile: width < 768,
    });
    await ev('scrollTo({top:0,behavior:"instant"})');
    await pause(200);
    assert.equal(await ev('document.documentElement.scrollWidth<=innerWidth'), true);
    if ([375, 1440].includes(width)) await shot('fototeca-' + width);
    await click('[data-gallery-photo]');
    assert.equal(
      await ev(
        'document.querySelector("dialog").getBoundingClientRect().width<=innerWidth',
      ),
      true,
    );
    await ev('document.querySelector("dialog[open] button").click()');
  }
  await ev(
    '[...document.querySelectorAll("footer button")].find(b=>b.textContent==="Español").click()',
  );
  await wait('document.documentElement.lang==="es"');
  assert.ok(
    await ev(
      'document.querySelector("main").textContent.includes("Las noches que guardamos.")',
    ),
  );
  await send('Page.reload');
  await wait(
    'document.documentElement.lang==="es"&&document.querySelectorAll("[data-gallery-photo]").length===2 && !!document.querySelector("[data-photo-form] input[name=images]:not(:disabled)")',
  );
  await click('[data-room-play]');
  await wait('document.querySelector("[data-room-music]").dataset.soundPlaying==="true"');
  await send('Page.navigate', { url: base });
  await wait('!!document.querySelector("#hero-title")');
  await pause(300);
  assert.equal(
    await ev('document.querySelector("[data-room-music][data-sound-playing=true]")'),
    null,
  );
  assert.ok(await ev('!!document.querySelector("a[href$=fototeca]")'));
  console.log(
    'PASS Spanish persistence, navigation/music cleanup and homepage invitation',
  );
  assert.deepEqual(errors, []);
  console.log(
    'PASS photo room desktop/mobile, actual submission, draft/moderation/publication, lightbox, room music and EN/ES. Local REST fixture only.',
  );
} catch (error) {
  console.error(await ev('document.querySelector("main")?.textContent'));
  await shot('fototeca-failure');
  throw error;
} finally {
  ws.close();
  await fetch('http://127.0.0.1:9222/json/close/' + page.id);
}
