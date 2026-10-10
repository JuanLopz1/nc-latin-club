/* eslint-disable @typescript-eslint/no-require-imports -- In-memory SSR regression harness. */
require('./register-typescript.cjs');
const test=require('node:test'), assert=require('node:assert/strict');
const React=require('react'), {renderToStaticMarkup}=require('react-dom/server');
const clock=require('../app/components/events/agenda-clock.ts');
const collection=require('../app/components/club-events.ts');
const {agendaEntries}=require('../app/components/events/agenda-data.ts');
const {copy}=require('../app/components/home-copy.ts');
const EventsSection=require('../app/components/events-section.tsx').default;
const fiesta=agendaEntries.find(e=>e.slug==='latin-fiesta-2026');
function render(events,now,language='en') {
 const originalClock=clock.useAgendaClock, originalEvents=collection.clubEvents;
 clock.useAgendaClock=()=>now;collection.clubEvents=events;
 try {return renderToStaticMarkup(React.createElement(EventsSection,{language}));}
 finally {clock.useAgendaClock=originalClock;collection.clubEvents=originalEvents;}
}
test('home cancellation removes registration and shows its bilingual notice; rescheduling keeps the current date',()=>{
 const notice={en:'This gathering is cancelled.',es:'Este encuentro está cancelado.'};
 for(const language of ['en','es']) {
  const html=render([{...fiesta,status:'cancelled',statusNote:notice}],new Date('2026-10-10T16:00:00Z'),language);
  assert.ok(html.includes(notice[language]));
  assert.ok(!html.includes('href="https://www.ncengage.ca/intl/rsvp_boot?id=382827"'));
  const changed=render([{...fiesta,status:'rescheduled',statusNote:notice,startsAt:'2026-11-04T19:00:00-05:00',endsAt:undefined}],new Date('2026-10-10T16:00:00Z'),language);
  assert.ok(changed.includes(notice[language]) && changed.includes('dateTime="2026-11-04T19:00:00-05:00"'));
 }
});
test('home upcoming collection uses runtime end and hides expired editions and unknown-end events after their start',()=>{
 assert.ok(render([fiesta],new Date('2026-10-24T03:59:00Z')).includes('<article'));
 for(const language of ['en','es']) {
  const ended=render([fiesta],new Date('2026-10-24T04:00:00Z'),language);
  assert.ok(!ended.includes('<article') && ended.includes(copy[language].events.emptyTitle));
 }
 const noEnd=render([{...fiesta,endsAt:undefined}],new Date('2026-10-24T03:59:00Z'));
 assert.ok(!noEnd.includes('<article'));
});
test('home initializes with an accessible loading state before a runtime clock is available',()=>{
 const html=render([fiesta],null);
 assert.ok(html.includes('role="status"'));
 assert.ok(!html.includes('<article'));
});
