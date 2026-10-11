/* eslint-disable @typescript-eslint/no-require-imports */
require('./register-typescript.cjs');
const test=require('node:test'),assert=require('node:assert/strict');
const dates=require('../app/components/events/agenda-dates.ts');
const {agendaEntries}=require('../app/components/events/agenda-data.ts');
const now=new Date('2026-10-10T16:00:00Z'),fiesta=agendaEntries.find(e=>e.id==='latin-fiesta-2026');
test('default agenda separates real events from annual cultural occurrences',()=>{
 const state=dates.initialAgendaState(now);
 assert.equal(state.scope,'events');
 assert.deepEqual(state.categories,['at-nc','out-of-nc']);
 assert.equal(typeof dates.agendaPeriodEntries,'function');
 const shown=dates.agendaPeriodEntries(agendaEntries,state,now);
 assert.ok(shown.every(e=>e.kind==='event'));assert.ok(shown.includes(fiesta));
 assert.ok(shown.length<agendaEntries.filter(e=>e.kind==='event').length);
});
test('category counts follow archive/list period and calendar month',()=>{
 assert.equal(typeof dates.agendaPeriodEntries,'function');
 const state={...dates.initialAgendaState(now),view:'calendar',month:'2026-10'};
 const shown=dates.agendaPeriodEntries(agendaEntries,state,now);
 assert.deepEqual(shown.map(e=>e.id),['lataff','latin-fiesta-2026','muertos-niagara']);
 assert.deepEqual(dates.agendaPeriodEntries(agendaEntries,{...state,month:'2027-10'},now),[]);
 const octoberArchive=dates.agendaPeriodEntries(agendaEntries,{...state,period:'past'},now);
 assert.deepEqual(octoberArchive.map(e=>e.id),['alucine']);
 const archive=dates.agendaPeriodEntries(agendaEntries,{...state,period:'past',month:'2026-07'},now);
 assert.ok(archive.length>0);assert.ok(archive.every(e=>dates.isPast(e,now)));
});
test('culture is independent of event filters and limits annual list to selected year',()=>{
 assert.equal(typeof dates.agendaPeriodEntries,'function');
 const state={...dates.initialAgendaState(now),scope:'culture',categories:[],cultureYear:'2027'};
 const shown=dates.agendaPeriodEntries(agendaEntries,state,now);
 assert.ok(shown.length>0);assert.ok(shown.every(e=>e.kind==='cultural-date'&&e.date.startsWith('2027')));
 const archive=dates.agendaPeriodEntries(agendaEntries,{...state,cultureYear:'2026',period:'past'},now);
 assert.ok(archive.length>0);assert.ok(archive.every(e=>dates.isPast(e,now)));
});
test('countdown uses published instants at start/end and suppresses cancelled events',()=>{
 const countdown=require('../app/components/events/event-countdown-state.ts');
 assert.equal(typeof countdown.eventCountdownState,'function');
 assert.deepEqual(countdown.eventCountdownState(fiesta,new Date('2026-10-23T23:59:00Z')),{phase:'upcoming',remainingSeconds:60});
 assert.deepEqual(countdown.eventCountdownState(fiesta,new Date('2026-10-24T00:00:00Z')),{phase:'started',remainingSeconds:0});
 assert.deepEqual(countdown.eventCountdownState(fiesta,new Date('2026-10-24T04:00:00Z')),{phase:'ended',remainingSeconds:0});
 assert.equal(countdown.eventCountdownState({...fiesta,status:'cancelled'},now),null);
});
test('ICS exports Toronto offset times as UTC and escapes bilingual source text',()=>{
 const {eventCalendarFile}=require('../app/components/events/event-calendar.ts');
 const file=eventCalendarFile({...fiesta,title:{en:'Salsa, Latin; Fiesta\\Night',es:'Fiesta'},description:{en:'Line one\nLine two',es:'Dos'}},'en');
 assert.ok(file.includes('DTSTART:20261024T000000Z\r\n'));assert.ok(file.includes('DTEND:20261024T040000Z\r\n'));
 assert.ok(file.includes('SUMMARY:Salsa\\, Latin\\; Fiesta\\\\Night\r\n'));assert.ok(file.includes('DESCRIPTION:Line one\\nLine two'));
 assert.ok(!file.replace(/\r\n/g,'').includes('\n'));
 assert.equal(eventCalendarFile({...fiesta,status:'cancelled'},'en'),null);
});
test('ICS preserves date-only inclusive ranges and session times without invented ends',()=>{
 const {eventCalendarFile}=require('../app/components/events/event-calendar.ts');
 const {startsAt:unusedStart,endsAt:unusedEnd,...base}=fiesta;void unusedStart;void unusedEnd;
 const file=eventCalendarFile({...base,dateSpan:{start:'2026-12-30',end:'2027-01-02'}},'es');
 assert.ok(file.includes('DTSTART;VALUE=DATE:20261230\r\n'));assert.ok(file.includes('DTEND;VALUE=DATE:20270103\r\n'));
 const timed=eventCalendarFile({...base,dateSpan:{start:'2026-11-01',end:'2026-11-01'},sessions:[{startsAt:'2026-11-01T01:30:00-05:00'}]},'en');
 assert.ok(timed.includes('DTSTART:20261101T063000Z\r\n'));assert.ok(!timed.includes('DTEND'));
 const long=eventCalendarFile({...fiesta,description:{en:'🌎'.repeat(90),es:'🎵'.repeat(90)}},'en');
 assert.ok(long.split('\r\n').every(line=>Buffer.byteLength(line)<=75));
});

const React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const context=require('../app/components/site-context.tsx'),clock=require('../app/components/events/agenda-clock.ts');
function renderAgenda(state,language='en') {
 const originalState=context.useAgendaState,originalLanguage=context.useSiteLanguage,originalClock=clock.useAgendaClock;
 context.useAgendaState=()=>({state,setState:()=>{}});context.useSiteLanguage=()=>({language});clock.useAgendaClock=()=>now;
 try {return renderToStaticMarkup(React.createElement(require('../app/components/events/events-agenda.tsx').default,{entries:agendaEntries}));}
 finally {context.useAgendaState=originalState;context.useSiteLanguage=originalLanguage;clock.useAgendaClock=originalClock;}
}
test('agenda renders accessible independent tabs and accurate visible counts in both languages',()=>{
 for(const language of ['en','es']) {
  const state=dates.initialAgendaState(now),html=renderAgenda(state,language);
  assert.ok(html.includes('role="tablist"'));assert.ok(html.includes('role="tabpanel"'));
  assert.ok(html.includes('id="scope-events"')&&html.includes('aria-selected="true"'));
  assert.ok(!html.includes('data-category="latin-dates"'));assert.ok(!html.includes('data-entry="latin-heritage-2026"'));
  const culture=renderAgenda({...state,scope:'culture',categories:[],cultureYear:'2027'},language);
  assert.ok(culture.includes('id="culture-year"'));assert.ok(culture.includes('data-entry="latin-heritage-2027"'));
  assert.ok(!culture.includes('data-entry="latin-heritage-2028"'));assert.ok(!culture.includes('data-category="at-nc"'));
 }
});
test('home shows countdown and calendar download for published Fiesta, but no countdown for cancellation',()=>{
 const collection=require('../app/components/club-events.ts'),originalEvents=collection.clubEvents,originalClock=clock.useAgendaClock;
 collection.clubEvents=[fiesta];clock.useAgendaClock=()=>now;
 try {
  const Component=require('../app/components/events-section.tsx').default;
  const html=renderToStaticMarkup(React.createElement(Component,{language:'en'}));
  assert.ok(html.includes('role="timer"'));assert.ok(html.includes('download="latin-fiesta-2026.ics"'));
  collection.clubEvents=[{...fiesta,status:'cancelled'}];
  const cancelled=renderToStaticMarkup(React.createElement(Component,{language:'en'}));
  assert.ok(!cancelled.includes('role="timer"'));assert.ok(!cancelled.includes('download="latin-fiesta-2026.ics"'));
 } finally {collection.clubEvents=originalEvents;clock.useAgendaClock=originalClock;}
});
