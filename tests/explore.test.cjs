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
