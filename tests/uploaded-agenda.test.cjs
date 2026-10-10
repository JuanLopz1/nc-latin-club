/* eslint-disable @typescript-eslint/no-require-imports */
require('./register-typescript.cjs');
const test=require('node:test'),assert=require('node:assert/strict');
const d=require('../app/components/events/agenda-dates.ts'),{validateAgenda}=require('../app/components/events/agenda-validation.ts');
const t={en:'Fixture',es:'Prueba'},source={url:'https://example.com/event',reviewedOn:'2026-10-10',provenance:'user-capture'};
const culture={id:'range',slug:'range',kind:'cultural-date',category:'latin-dates',title:t,description:t,scope:t,source,date:'2026-12-16',endDate:'2026-12-24'};
const festival={id:'festival',slug:'festival',kind:'event',category:'out-of-nc',title:t,description:t,source,city:t,organizer:t,venue:t,status:'scheduled',dateSpan:{start:'2026-07-25',end:'2026-07-26'}};
test('cultural ranges occupy every inclusive day and expire on next Niagara day',()=>{
 assert.equal(d.entriesOnDate([culture],'2026-12-24').length,1);assert.equal(d.entriesOnDate([culture],'2026-12-25').length,0);
 assert.equal(d.isPast(culture,new Date('2026-12-25T04:59:00Z')),false);assert.equal(d.isPast(culture,new Date('2026-12-25T05:00:00Z')),true);
});
test('date-only events publish no invented hour and remain upcoming through inclusive last day',()=>{
 assert.doesNotThrow(()=>validateAgenda([festival]));assert.equal(d.entryDate(festival),'2026-07-25');assert.equal(d.entriesOnDate([festival],'2026-07-26').length,1);
 assert.equal(d.isPast(festival,new Date('2026-07-27T03:59:00Z')),false);assert.equal(d.isPast(festival,new Date('2026-07-27T04:00:00Z')),true);
});
test('daily festival sessions preserve opening hours without continuous overnight duration',()=>{
 const entry={...festival,sessions:[{startsAt:'2026-07-25T11:00:00-04:00',endsAt:'2026-07-25T22:00:00-04:00'},{startsAt:'2026-07-26T11:00:00-04:00',endsAt:'2026-07-26T22:00:00-04:00'}]};
 assert.doesNotThrow(()=>validateAgenda([entry]));assert.equal(d.isPast(entry,new Date('2026-07-27T02:00:00Z')),true);
 assert.throws(()=>validateAgenda([{...entry,sessions:[{startsAt:'2026-07-25T11:00:00',endsAt:'2026-07-25T22:00:00-04:00'}]}]));
 assert.throws(()=>validateAgenda([{...entry,sessions:[{startsAt:'2026-07-27T11:00:00-04:00'}]}]));
 assert.throws(()=>validateAgenda([{...festival,dateSpan:{start:'2026-02-30',end:'2026-03-01'}}]));assert.throws(()=>validateAgenda([{...culture,endDate:'2026-12-15'}]));
});
const React=require('react'),{renderToStaticMarkup}=require('react-dom/server'),{SiteProvider}=require('../app/components/site-context.tsx'),Detail=require('../app/components/events/event-detail.tsx').default;
test('details label unknown hours explicitly and show sourced session times and cultural end date',()=>{
 const render=e=>renderToStaticMarkup(React.createElement(SiteProvider,null,React.createElement(Detail,{entry:e})));
 const unknown=render(festival);assert.ok(unknown.includes('Hours not published'));assert.ok(!unknown.includes('12:00 a.m.'));
 const scheduled=render({...festival,sessions:[{startsAt:'2026-07-25T11:00:00-04:00',endsAt:'2026-07-25T22:00:00-04:00',title:t,registrationUrl:'https://example.com/tickets'}]});assert.ok(scheduled.includes('2026-07-25T11:00:00-04:00'));assert.ok(scheduled.includes('2026-07-25T22:00:00-04:00'));assert.ok(scheduled.includes('https://example.com/tickets'));
 assert.ok(render(culture).includes('2026-12-24'));
});
const {agendaEntries}=require('../app/components/events/agenda-data.ts');
test('supplied collection contains eleven real regional events and 225 cultural occurrences in separate categories',()=>{
 assert.equal(agendaEntries.filter(e=>e.category==='out-of-nc').length,11);assert.equal(agendaEntries.filter(e=>e.kind==='cultural-date').length,225);
 assert.equal(agendaEntries.filter(e=>e.category==='at-nc').length,1);assert.doesNotThrow(()=>validateAgenda(agendaEntries));
 for(const e of agendaEntries){assert.ok(e.description.en&&e.description.es);assert.ok(!e.images?.length)}
});
test('Muertos preserves the supplied venue and hour discrepancy instead of copying Eventbrite header',()=>{
 const e=agendaEntries.find(e=>e.id==='muertos-niagara');assert.ok(e);assert.match(e.address,/5943 Sylvia Place/);assert.equal(e.sessions[0].startsAt,'2026-10-24T11:00:00-04:00');assert.match(e.note.en,/10:00/);assert.match(e.note.en,/11:00/);
});
test('LATAFF has thirteen actual sessions and labels the festival interval without inventing daily screenings',()=>{
 const e=agendaEntries.find(e=>e.id==='lataff');assert.ok(e);assert.equal(e.sessions.length,13);assert.equal(e.sessions[0].startsAt,'2026-10-17T15:00:00-04:00');assert.equal(e.sessions.at(-1).startsAt,'2026-10-25T19:00:00-04:00');assert.ok(e.sessions.every(s=>!s.endsAt));assert.match(e.note.en,/not daily/);
});
test('past festivals archive at runtime; unknown hours stay date-only and cultural scope is country-specific',()=>{
 const now=new Date('2026-10-10T16:00:00Z'),past=d.listEntries(agendaEntries,'out-of-nc','past',now);assert.equal(past.length,9);
 const burlington=agendaEntries.find(e=>e.id==='burlington');assert.ok(burlington.dateSpan&&!burlington.startsAt&&!burlington.sessions?.length);
 const muertos=agendaEntries.find(e=>e.slug==='muertos-2026');assert.equal(muertos.date,'2026-11-01');assert.equal(muertos.endDate,'2026-11-02');assert.match(muertos.scope.en,/Mexico/);
 const heritage=agendaEntries.find(e=>e.slug==='latin-heritage-2026');assert.equal(d.entriesOnDate([heritage],'2026-10-31').length,1);assert.match(heritage.scope.en,/Canada/);
 assert.ok(d.entriesOnDate(agendaEntries.filter(e=>e.category==='latin-dates'),'2027-01-06').some(e=>e.id==='negros-blancos-2026'));
});
