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
test('Taco N Tequila uses its official public address and published map coordinates',()=>{
 const p=places.find(p=>p.id==='taco-n-tequila');
 assert.match(p.address??'',/6405 Stanley Ave/);
 assert.deepEqual(p.coordinates,{lat:43.0822502,lng:-79.0845853,accuracy:'business_published'});
 assert.ok(p.sources.some(source=>source.url==='https://www.tacontequila.com/'));
 assert.ok(u.hasPin(p));
 assert.match(new URL(u.directionsUrl(p)).searchParams.get('destination'),/6405 Stanley Ave/);
});
test('map numbers follow visible card order without renumbering past businesses without pins',()=>{
 const groups=u.markerGroups(places);
 assert.deepEqual(groups.flatMap(group=>group.numbers),[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,18,20]);
 const shared=groups.find(group=>group.places.length===2);
 assert.deepEqual(shared.numbers,[2,3]);
 const mixed=['paz-bakery','origen-bistro-bakery','la-paisana-tienda','la-paisana-restaurante'].map(id=>places.find(p=>p.id===id));
 assert.deepEqual(u.markerGroups(mixed).map(group=>group.numbers),[[2],[3,4]]);
 const filtered=u.filterPlaces(places,{...u.initialPlaceFilters(places),query:'paisana'});
 assert.deepEqual(u.markerGroups(filtered)[0].numbers,[1,2]);
});
test('pins require a public destination and finite coordinates',()=>{
 const publicPlace=places.find(p=>p.id==='coco-bar-mexican-grill');
 for(const coordinates of [undefined,{lat:NaN,lng:-79},{lat:43,lng:Infinity}])assert.equal(u.hasPin({...publicPlace,coordinates}),false);
 assert.equal(u.hasPin({...publicPlace,address:undefined}),false);
 assert.deepEqual(places.filter(p=>!u.hasPin(p)).map(p=>p.id),['paz-bakery','la-casita-guanaca','el-camino-kitchen','sombra']);
 assert.equal(places.filter(u.hasPin).length,17);
 assert.equal(u.markerGroups(places).length,16);
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
test('directory displays consecutive card numbers and explains shared markers and unpinned businesses',()=>{
 const Component=load('../app/components/niagara/niagara-directory.tsx').default;
 const html=renderToStaticMarkup(React.createElement(SiteProvider,null,React.createElement(Component,{places})));
 assert.deepEqual([...html.matchAll(/data-place-number="(\d+)"/g)].map(match=>Number(match[1])),Array.from({length:21},(_,i)=>i+1));
 assert.ok(html.includes('17 businesses on the map'));
 assert.ok(html.includes('16 map markers'));
 assert.ok(html.includes('4 without a map pin'));
 assert.ok(html.includes('Numbers match the cards'));
});
test('every card without a destination states why it has no map pin in either language',()=>{
 const Component=load('../app/components/niagara/place-card.tsx').default;
 for(const language of ['en','es'])for(const place of places.filter(p=>!u.hasPin(p))){
  const html=renderToStaticMarkup(React.createElement(Component,{place,index:0,language,expanded:false,onToggle:()=>{},registerButton:()=>{}}));
  assert.ok(html.includes(language==='en'?'Not on map':'Sin pin en el mapa'),place.id);
  assert.ok(html.includes(place.mode==='order_only'?(language==='en'?'No public storefront':'Sin local público'):(language==='en'?'Public destination being confirmed':'Destino público por confirmar')),place.id);
  assert.equal((html.match(/maps\/dir/g)||[]).length,0,place.id);
 }
});
test('hub highlights cocobar La Paisana and Origen with links to Niagara',()=>{
 const Component=load('../app/components/niagara/niagara-teaser.tsx').default;assert.equal(typeof Component,'function');
 const html=renderToStaticMarkup(React.createElement(Component,{language:'es'}));
 for(const label of ['Descubre el Niagara latino','cocobar','La Paisana','Origen','Explorar Niagara'])assert.ok(html.includes(label));
 assert.equal((html.match(/href="\/niagara/g)||[]).length,22);
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
