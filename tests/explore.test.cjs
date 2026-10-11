/* eslint-disable @typescript-eslint/no-require-imports */
require('./register-typescript.cjs');
const test=require('node:test'),assert=require('node:assert/strict');
const load=p=>{try{return require(p)}catch(e){if(e.code==='MODULE_NOT_FOUND')return {};throw e;}};
const data=load('../app/components/explore/country-data.ts');
const utils=load('../app/components/explore/explore-utils.ts');
test('prototype destinations have real geography and complete EN/ES previews',()=>{
 assert.ok(Array.isArray(data.prototypeCountries));assert.equal(data.prototypeCountries.length,6);
 for(const c of data.prototypeCountries){assert.ok(c.name.en&&c.name.es&&c.intro.en&&c.intro.es);assert.ok(Number.isFinite(c.center.lat)&&Number.isFinite(c.center.lng));assert.ok(c.sources.length);}
 for(const slug of ['colombia','brasil','mexico','jamaica','haiti','curazao'])assert.ok(data.prototypeCountries.some(c=>c.slug===slug));
});
test('search recognizes accents and both localized names; regions are multi-select',()=>{
 assert.equal(typeof utils.filterCountries,'function');
 assert.equal(utils.filterCountries(data.prototypeCountries,'Curaçao',utils.regions).length,1);
 assert.equal(utils.filterCountries(data.prototypeCountries,'mexico',utils.regions)[0].slug,'mexico');
 assert.equal(utils.filterCountries(data.prototypeCountries,'',[]).length,0);
 assert.deepEqual(utils.filterCountries(data.prototypeCountries,'',['sudamerica','norteamerica']).map(c=>c.slug).sort(),['brasil','colombia','mexico']);
});
test('camera controls clamp zoom and ignore nonfinite state',()=>{
 assert.equal(typeof utils.clampAltitude,'function');assert.equal(utils.clampAltitude(-4),0.65);assert.equal(utils.clampAltitude(10),3);assert.equal(utils.clampAltitude(NaN),utils.initialCamera.altitude);
});
test('simplified world polygons do not paint the complement of a small island',async()=>{
 const {geoArea}=await import('d3-geo');const world=JSON.parse(require('node:fs').readFileSync(require('node:path').join(__dirname,'../public/data/roots-world.geojson'),'utf8'));
 for(const feature of world.features){const polygons=feature.geometry.type==='Polygon'?[feature.geometry.coordinates]:feature.geometry.coordinates;for(const coordinates of polygons)assert.ok(geoArea({type:'Polygon',coordinates})<2*Math.PI,'inverted geometry: '+feature.properties.name);}
});
test('final directory exposes all 55 distinct countries and small territories',()=>{
 assert.equal(data.countries.length,55);assert.equal(new Set(data.countries.map(c=>c.slug)).size,55);
 for(const slug of ['bonaire','saba','san-eustaquio','guayana-francesa','guadalupe','martinica','san-martin-frances','sint-maarten'])assert.equal(utils.filterCountries(data.countries,slug.replaceAll('-',' '),utils.regions).some(c=>c.slug===slug),true,slug);
});
test('every destination has a reviewed bilingual national page with traceable sections',()=>{
 const pages=load('../app/components/explore/culture-data.ts').culturePages;assert.equal(pages.length,55);assert.equal(new Set(pages.map(p=>p.slug)).size,55);
 for(const page of pages){assert.ok(data.countries.some(c=>c.slug===page.slug));assert.equal(page.review.basis,'documentary-source-review');assert.ok(page.sources.length>0);assert.ok(page.sources.every(s=>s.id && s.url.startsWith('https://')));assert.ok(page.sections.length>=3);
 for(const section of page.sections){assert.ok(section.sourceIds.length>0);assert.ok(section.sourceIds.every(id=>page.sources.some(s=>s.id===id)),page.slug+'/'+section.id);}
 for(const value of [page.title,page.introduction,...page.sections.flatMap(s=>[s.title,s.text])]){assert.ok(value.en&&value.es);assert.doesNotMatch(value.en+' '+value.es,/needs_research|ui_placeholder|pendiente_verificar|NO PUBLICAR|CMS sugerido/i);}assert.equal(new Set(page.sections.map(s=>s.id)).size,page.sections.length);}
 assert.equal(data.countries.filter(c=>c.culturalStatus==='reviewed').length,55);
});
test('all 55 destinations have independent selectable world geometry, including shared ISO territories',()=>{
 const fs=require('node:fs'),path=require('node:path'),world=JSON.parse(fs.readFileSync(path.join(__dirname,'../public/data/roots-world.geojson'),'utf8'));
 for(const c of data.countries){const geometry=world.features.filter(f=>f.properties.slug?f.properties.slug===c.slug:f.properties.iso2===c.iso2);assert.equal(geometry.length,1,c.slug);assert.ok(geometry[0].properties.americas);}
 const islands=world.features.filter(f=>f.properties.iso2==='BQ');assert.equal(islands.length,3);assert.equal(new Set(islands.map(f=>JSON.stringify(f.geometry))).size,3);
});
test('overlapping island markers offer explicit choices without silently choosing a neighbor',()=>{
 assert.equal(typeof utils.nearbyCountries,'function');
 const saba=data.countries.find(c=>c.slug==='saba');const near=utils.nearbyCountries(data.countries,saba);
 assert.ok(near.some(c=>c.slug==='saba'));assert.ok(near.some(c=>c.slug==='san-eustaquio'));assert.ok(!near.some(c=>c.slug==='bonaire'));
 assert.equal(utils.nearbyCountries(data.prototypeCountries,data.countries.find(c=>c.slug==='jamaica')).length,1);
 assert.equal(utils.nearbyCountries([],saba).length,0);
});
test('first visit starts the globe presentation in rotation mode',()=>{
 const state=utils.initialExploreState();assert.equal(state.rotating,true);assert.equal(state.selectedSlug,null);
});
test('first view keeps map tools collapsed while search and all destinations remain accessible',()=>{
 const React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
 const {SiteProvider}=require('../app/components/site-context.tsx');const Explore=require('../app/components/explore/explore-experience.tsx').default;
 const html=renderToStaticMarkup(React.createElement(SiteProvider,null,React.createElement(Explore,{countries:data.countries})));
 assert.match(html,/data-tools-trigger[^>]*aria-expanded="false"/);assert.ok(!html.includes('data-tools-panel'));assert.ok(!html.includes('data-region="all"'));assert.ok(!html.includes('data-zoom="in"'));assert.ok(html.includes('type="search"'));assert.equal((html.match(/data-country=/g)||[]).length,55);
});

test('Canada is selectable from bilingual search with the North America region',()=>{
 for(const query of ['Canada','Canadá','canada']){
 const found=utils.filterCountries(data.countries,query,['norteamerica']);assert.equal(found.length,1);assert.equal(found[0].slug,'canada');assert.equal(found[0].iso2,'CA');assert.ok(found[0].name.en && found[0].name.es);
 }
 assert.equal(utils.filterCountries(data.countries,'Canada',['caribe']).length,0);
});
test('Colombia presents multiple regions and traditions, instead of centering one festival',()=>{
 const page=load('../app/components/explore/culture-data.ts').getCulturePage('colombia');const all=[page.title,page.introduction,...page.sections.map(s=>s.text)].map(x=>x.en+' '+x.es).join(' ');
 assert.match(all,/Pacífico|Pacific/);assert.match(all,/Magdalena/);assert.match(all,/arepas/i);assert.match(all,/Barranquilla/);assert.ok(page.sections.some(s=>s.id==='food'));
});
test('published music uses direct Spotify tracks with matched title and artist metadata',()=>{
 const pages=load('../app/components/explore/culture-data.ts').culturePages;const tracks=pages.flatMap(p=>p.music||[]);assert.ok(tracks.length>0);
 for(const t of tracks){assert.match(t.trackId,/^[A-Za-z0-9]{22}$/);assert.ok(t.title&&t.artist);assert.equal(t.verification,'spotify-title-and-artist');assert.ok(t.context.en&&t.context.es);}
});
test('music players are absent before the visitor chooses to load one',()=>{
 const React=require('react'),{renderToStaticMarkup}=require('react-dom/server');const {SiteProvider}=require('../app/components/site-context.tsx');const Detail=require('../app/components/explore/country-detail.tsx').default;
 const page=load('../app/components/explore/culture-data.ts').getCulturePage('colombia'),country=data.countries.find(c=>c.slug==='colombia');const html=renderToStaticMarkup(React.createElement(SiteProvider,null,React.createElement(Detail,{country,page})));
 assert.match(html,/<h1>Colombia<\/h1>/);assert.doesNotMatch(html,/<iframe|<audio/);assert.match(html,/data-load-track/);assert.match(html,/PROVENZA/);
});
test('unknown cultural destinations return a real 404 before the streamed shell, while all published pages remain reachable',()=>{
 const {proxy}=load('../proxy.ts'),{NextRequest}=require('next/server');
 assert.equal(proxy(new NextRequest('https://club.example/explore/does-not-exist')).status,404);
 for(const page of load('../app/components/explore/culture-data.ts').culturePages)assert.equal(proxy(new NextRequest('https://club.example/explore/'+page.slug)).status,200,page.slug);
});
