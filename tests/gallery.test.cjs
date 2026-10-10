/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS test harness. */
require('./register-typescript.cjs');
const test=require('node:test'), assert=require('node:assert/strict');
const React=require('react');
const {renderToStaticMarkup}=require('react-dom/server');
let Gallery;
try { Gallery=require('../app/components/events/event-gallery.tsx').default; } catch(e) { if(e.code!=='MODULE_NOT_FOUND') throw e; }
const image={src:'/images/events/verification-only.png',width:600,height:400,alt:{en:'Verification scene',es:'Escena de verificación'}};
const render=(images,language='en')=>renderToStaticMarkup(React.createElement(Gallery,{images,language,entryId:'test-only'}));
test('optional gallery with no media adds no empty region or controls',()=>{
 assert.equal(typeof Gallery,'function');assert.equal(render([]),'');
});
test('single image is translated and has no next/previous controls',()=>{
 assert.equal(typeof Gallery,'function'); const html=render([image],'es');
 assert.ok(html.includes('alt="Escena de verificación"'));assert.ok(!html.includes('<button'));
});
test('multiple images expose named controls and selected thumbnail',()=>{
 assert.equal(typeof Gallery,'function'); const html=render([image,{...image,src:'/images/events/two.png'},{...image,src:'/images/events/three.png'}]);
 assert.ok(html.includes('Previous image') && html.includes('Next image'));
 assert.ok(html.includes('aria-pressed="true"') && html.includes('aria-pressed="false"'));
 assert.ok(html.includes('View image 3'));
});
