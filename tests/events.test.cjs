/* eslint-disable @typescript-eslint/no-require-imports -- Node CommonJS test harness loads real TypeScript without a new dependency. */
require('./register-typescript.cjs');
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
function load(file) { try { return require(file); } catch (e) { if(e.code === 'MODULE_NOT_FOUND') return {}; throw e; } }
const dates = load('../app/components/events/agenda-dates.ts');
const { validateAgenda } = load('../app/components/events/agenda-validation.ts');
const { agendaEntries } = load('../app/components/events/agenda-data.ts');
const text = {en:'Verification only',es:'Solo verificación'};
const fiesta = {id:'fixture',slug:'fixture',kind:'event',category:'at-nc',title:text,description:text,venue:text,organizer:text,status:'scheduled',startsAt:'2026-10-23T20:00:00-04:00',endsAt:'2026-10-24T00:00:00-04:00',source:{url:'https://example.com/fixture',reviewedOn:'2026-10-10',provenance:'official-page'}};
const cultural = {id:'culture',slug:'culture',kind:'cultural-date',category:'latin-dates',title:text,description:text,date:'2026-11-02',scope:text,source:fiesta.source};
test('midnight end belongs to the previous day; later end occupies both',()=>{
  assert.equal(typeof dates.entriesOnDate,'function');
  assert.equal(dates.entriesOnDate([fiesta],'2026-10-23').length,1);
  assert.equal(dates.entriesOnDate([fiesta],'2026-10-24').length,0);
  assert.equal(dates.entriesOnDate([{...fiesta,endsAt:'2026-10-24T00:30:00-04:00'}],'2026-10-24').length,1);
  assert.equal(dates.entriesOnDate([{...fiesta,endsAt:undefined}],'2026-10-24').length,0);
});
test('event remains upcoming until its known end',()=>{
  assert.equal(typeof dates.isPast,'function');
  assert.equal(dates.isPast(fiesta,new Date('2026-10-24T03:59:00Z')),false);
  assert.equal(dates.isPast(fiesta,new Date('2026-10-24T04:00:00Z')),true);
  assert.equal(dates.isPast({...fiesta,endsAt:undefined},new Date('2026-10-24T00:00:00Z')),true);
});
test('cultural date remains the same date and stays upcoming for the full Niagara day',()=>{
  assert.equal(typeof dates.isPast,'function');
  assert.equal(dates.entriesOnDate([cultural],'2026-11-02').length,1);
  assert.equal(dates.entriesOnDate([cultural],'2026-11-01').length,0);
  assert.equal(dates.isPast(cultural,new Date('2026-11-03T04:59:00Z')),false);
  assert.equal(dates.isPast(cultural,new Date('2026-11-03T05:00:00Z')),true);
});
test('Niagara date handles both occurrences of the DST fall-back hour',()=>{
  assert.equal(typeof dates.niagaraDate,'function');
  assert.equal(dates.niagaraDate('2026-11-01T05:30:00Z'),'2026-11-01');
  assert.equal(dates.niagaraDate('2026-11-01T06:30:00Z'),'2026-11-01');
  assert.equal(dates.niagaraDate('2026-10-24T03:59:00Z'),'2026-10-23');
});
test('month grid crosses years and leap days with 42 consecutive days starting Monday',()=>{
  assert.equal(typeof dates.monthCells,'function');
  assert.equal(dates.shiftMonth('2026-12',1),'2027-01');
  assert.equal(dates.shiftMonth('2027-01',-1),'2026-12');
  const days = dates.monthCells('2028-02');
  assert.equal(days.length,42);
  assert.ok(days.includes('2028-02-29'));
  assert.equal(new Date(days[0]+'T12:00:00Z').getUTCDay(),1);
  days.slice(1).forEach((day,i)=>assert.equal(Date.parse(day)-Date.parse(days[i]),86400000));
});
test('multiple events on a day and list order/category/time use the supplied clock',()=>{
  assert.equal(typeof dates.listEntries,'function');
  const second={...fiesta,id:'second',slug:'second',startsAt:'2026-10-23T19:00:00-04:00'};
  assert.equal(dates.entriesOnDate([fiesta,second],'2026-10-23').length,2);
  assert.deepEqual(dates.listEntries([fiesta,second,cultural],'at-nc','upcoming',new Date('2026-10-20T12:00Z')).map(e=>e.id),['second','fixture']);
  assert.deepEqual(dates.listEntries([fiesta,second],'at-nc','past',new Date('2026-10-25T12:00Z')).map(e=>e.id),['fixture','second']);
  assert.equal(dates.initialAgendaState(new Date('2026-10-24T03:00Z')).selectedDate,'2026-10-23');
});
test('invalid editorial content is rejected rather than published',()=>{
  assert.equal(typeof validateAgenda,'function');
  validateAgenda([fiesta,cultural]);
  const invalid=[{...fiesta,startsAt:'2026-10-23T20:00:00'}, {...fiesta,startsAt:'2026-02-30T20:00:00-04:00'}, {...fiesta,endsAt:'2026-10-23T19:00:00-04:00'}, {...fiesta,registrationUrl:'http://example.com'}, {...fiesta,category:'out-of-nc'}, {...fiesta,status:'cancelled'}, {...fiesta,status:'rescheduled'}, {...cultural,date:'2026-02-30'}, {...fiesta,source:{...fiesta.source,url:'javascript:alert(1)'}}, {...fiesta,images:[{src:'/images/events/../bad.jpg',width:1,height:1,alt:text}]}, {...fiesta,images:[{src:'/images/events/a.png',width:0,height:10,alt:text}]}, {...fiesta,images:[{src:'/images/events/a.png',width:10,height:10,alt:{en:'',es:'hola'}}]}];
  invalid.forEach(entry=>assert.throws(()=>validateAgenda([entry])));
  assert.throws(()=>validateAgenda([fiesta,fiesta]));
});
test('public collection preserves supplied Latin Fiesta and references only existing authorized media',()=>{
  assert.ok(Array.isArray(agendaEntries));
  const actual=agendaEntries.find(e=>e.slug==='latin-fiesta-2026');
  assert.equal(actual.organizer.en,'International');
  assert.equal(actual.registrationUrl,'https://www.ncengage.ca/intl/rsvp_boot?id=382827');
  assert.equal(actual.source.provenance,'user-capture');
  validateAgenda(agendaEntries);
  for(const entry of agendaEntries) for(const image of entry.images??[]) assert.ok(fs.existsSync(path.resolve('public',image.src.slice(1))));
});
test('unknown event is rejected before streaming with a real 404',()=>{
 const {proxy}=load('../proxy.ts');
 assert.equal(typeof proxy,'function');
 const {NextRequest}=require('next/server');
 assert.equal(proxy(new NextRequest('https://club.example/events/unknown')).status,404);
 assert.equal(proxy(new NextRequest('https://club.example/events/latin-fiesta-2026')).status,200);
});
