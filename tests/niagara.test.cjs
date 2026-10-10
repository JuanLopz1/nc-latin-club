/* eslint-disable @typescript-eslint/no-require-imports */
require('./register-typescript.cjs');
const test=require('node:test'),assert=require('node:assert/strict');
const load=p=>{try{return require(p)}catch(e){if(e.code==='MODULE_NOT_FOUND')return {};throw e}};
const {places}=load('../app/components/niagara/place-data.ts');
const u=load('../app/components/niagara/place-utils.ts');
test('founder selected businesses remain discoverable without fabricated locations',()=>{
 assert.ok(Array.isArray(places));
 for(const id of ['coco-bar-mexican-grill','la-paisana-tienda','la-paisana-restaurante','el-camino-kitchen','taco-n-tequila','sombra'])assert.ok(places.find(p=>p.id===id),id);
 const coco=places.find(p=>p.id==='coco-bar-mexican-grill');assert.match(coco.address,/155 St Paul Crescent/);assert.ok(coco.coordinates);
 for(const id of ['el-camino-kitchen','sombra']){const p=places.find(p=>p.id===id);assert.equal(u.directionsUrl(p),null);assert.equal(p.coordinates,undefined);}
 assert.match(places.find(p=>p.id==='taco-n-tequila').channels[0].url,/tacontequila.com/);
});
test('order-only businesses cannot acquire directions even with accidental address data',()=>{
 assert.equal(typeof u.directionsUrl,'function');
 for(const id of ['paz-bakery','la-casita-guanaca']){const p=places.find(p=>p.id===id);assert.equal(p.address,undefined);assert.equal(p.coordinates,undefined);assert.equal(u.directionsUrl({...p,address:'Private kitchen',coordinates:{lat:43,lng:-79}}),null);assert.ok(p.channels.length);}
});
test('search ignores accents and filters intersect categories city and mode',()=>{
 assert.equal(typeof u.filterPlaces,'function');
 assert.ok(u.filterPlaces(places,{...u.initialPlaceFilters(places),query:'pao DE QUEIJO'}).some(p=>p.id==='paz-bakery'));
 assert.deepEqual(u.filterPlaces(places,{query:'paisana',city:['Niagara Falls'],category:['grocery_store'],mode:['storefront']}).map(p=>p.id),['la-paisana-tienda']);
 assert.equal(u.filterPlaces(places,{...u.initialPlaceFilters(places),query:'no such shop'}).length,0);
});
test('overlapping pins retain distinct La Paisana units in directions',()=>{
 assert.equal(typeof u.markerGroups,'function');
 const both=places.filter(p=>p.id.startsWith('la-paisana-'));const groups=u.markerGroups(both);assert.equal(groups.length,1);assert.equal(groups[0].places.length,2);
 const urls=both.map(u.directionsUrl).map(v=>new URL(v));assert.match(urls[0].searchParams.get('destination'),/Unit 9/);assert.match(urls[1].searchParams.get('destination'),/Unit 4/);assert.ok(urls.every(v=>v.searchParams.get('api')==='1'));
});
test('public data contains no private editorial fields or unsupported closure claims',()=>{
 assert.ok(Array.isArray(places));const raw=JSON.stringify(places);for(const key of ['editorial_notes','ownership_status','activity_evidence','publication_status'])assert.ok(!raw.includes(key));
 assert.ok(!places.some(p=>['eh-jose','el-pinche-taco','plaza-fiesta'].includes(p.id)));
});
const React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const {SiteProvider}=require('../app/components/site-context.tsx');
test('directory renders all selected businesses and only resolved directions',()=>{
 const Component=load('../app/components/niagara/niagara-directory.tsx').default;assert.equal(typeof Component,'function');
 const html=renderToStaticMarkup(React.createElement(SiteProvider,null,React.createElement(Component,{places})));
 for(const name of ['El Camino','Sombra','La Paisana','cocobar'])assert.ok(html.includes(name));
 assert.ok(html.includes('Search'));assert.ok(html.includes('21'));assert.ok(html.includes('155 St Paul Crescent'));assert.ok(!html.includes('Private kitchen'));
});
test('hub highlights cocobar La Paisana and Origen with links to Niagara',()=>{
 const Component=load('../app/components/niagara/niagara-teaser.tsx').default;assert.equal(typeof Component,'function');
 const html=renderToStaticMarkup(React.createElement(Component,{language:'es'}));
 for(const label of ['Descubre el Niagara latino','cocobar','La Paisana','Origen','Explorar Niagara'])assert.ok(html.includes(label));
 assert.equal((html.match(/href="\/niagara/g)||[]).length,4);
});
test('directory starts with every option and supports OR within filters and AND across filters',()=>{
 const all=u.initialPlaceFilters(places);
 assert.equal(u.filterPlaces(places,all).length,places.length);
 const both={...all,query:'paisana',category:['grocery_store','restaurant']};
 assert.deepEqual(u.filterPlaces(places,both).map(p=>p.id),['la-paisana-tienda','la-paisana-restaurante']);
 assert.equal(u.filterPlaces(places,{...both,city:['Welland']}).length,0);
 for(const key of ['city','category','mode'])assert.equal(u.filterPlaces(places,{...all,[key]:[]}).length,0,key);
 const cities={...all,city:['Welland','Niagara Falls']};
 assert.ok(u.filterPlaces(places,cities).every(p=>cities.city.includes(p.city)));
});
test('expanded spot has one heading description address and set of actions',()=>{
 const Component=load('../app/components/niagara/place-card.tsx').default;
 assert.equal(typeof Component,'function');
 const place=places.find(p=>p.id==='coco-bar-mexican-grill');
 const html=renderToStaticMarkup(React.createElement(Component,{place,index:0,language:'en',expanded:true,onToggle:()=>{},registerButton:()=>{}}));
 assert.equal((html.match(/<article/g)||[]).length,1);
 assert.equal((html.match(/<h2/g)||[]).length,1);
 assert.equal(html.split(place.description.en).length-1,1);
 assert.equal((html.match(/>Take me there/g)||[]).length,1);
 assert.ok(html.includes('aria-expanded="true"'));
 assert.ok(html.includes('detail-coco-bar-mexican-grill'));
 assert.ok(html.includes('Research supplied'));
});
