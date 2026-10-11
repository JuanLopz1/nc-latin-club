// Geographic illustrations derived from our public-domain Natural Earth data.
import fs from 'node:fs';
import { geoMercator, geoPath } from 'd3-geo';
const countries=JSON.parse(fs.readFileSync('app/components/explore/countries.json','utf8'));
const world=JSON.parse(fs.readFileSync('public/data/roots-world.geojson','utf8'));
for(const country of countries){
 const feature=world.features.find(f=>f.properties.slug?f.properties.slug===country.slug:f.properties.iso2===country.iso2);
 if(!feature)throw Error('Missing geometry '+country.slug);
 const projection=geoMercator().fitExtent([[90,60],[330,300]],feature);
 const path=geoPath(projection)(feature);
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 360"><defs><radialGradient id="night"><stop stop-color="#294f69"/><stop offset="1" stop-color="#101e33"/></radialGradient><linearGradient id="land" x2="1" y2="1"><stop stop-color="#70dbe4"/><stop offset="1" stop-color="#ffe06a"/></linearGradient></defs><circle cx="210" cy="180" r="155" fill="url(#night)"/><circle cx="210" cy="180" r="155" fill="none" stroke="#76dbe3" stroke-opacity=".35"/><circle cx="210" cy="180" r="130" fill="none" stroke="#76dbe3" stroke-opacity=".15" stroke-dasharray="3 8"/><path d="${path}" fill="url(#land)" fill-opacity=".83" stroke="#b0eef0" stroke-width="1.2"/><path d="M43 76l5 12 12 5-12 5-5 12-5-12-12-5 12-5z" fill="#ffe06a"/><circle cx="366" cy="265" r="4" fill="#ff977d"/></svg>\n`;
 fs.writeFileSync(`public/images/roots/${country.slug}.svg`,svg);
}
console.log(`Built ${countries.length} geographic illustrations`);
