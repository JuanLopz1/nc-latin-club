/* eslint-disable @typescript-eslint/no-require-imports */
require('./register-typescript.cjs');
const test=require('node:test'),assert=require('node:assert/strict');
const dates=require('../app/components/events/agenda-dates.ts');
const {agendaEntries}=require('../app/components/events/agenda-data.ts');
const now=new Date('2026-10-10T16:00:00Z');
test('agenda starts with all categories and combines selected categories without duplicates',()=>{
 assert.deepEqual(dates.initialAgendaState(now).categories,['at-nc','out-of-nc','latin-dates']);
 const categories=['at-nc','out-of-nc'];
 const combined=dates.listEntries(agendaEntries,categories,'upcoming',now);
 assert.ok(combined.some(e=>e.category==='at-nc'));
 assert.ok(combined.some(e=>e.category==='out-of-nc'));
 assert.ok(combined.every(e=>categories.includes(e.category)));
 assert.equal(new Set(combined.map(e=>e.id)).size,combined.length);
 assert.deepEqual(dates.listEntries(agendaEntries,[],'upcoming',now),[]);
});
test('whole-month observances appear once for their month and never in daily calendar results',()=>{
 const heritage=agendaEntries.find(e=>e.id==='latin-heritage-2026');
 assert.ok(heritage);assert.equal(heritage.calendarDisplay,'month');
 assert.deepEqual(dates.monthObservances(agendaEntries,'2026-10'),[heritage]);
 assert.deepEqual(dates.monthObservances(agendaEntries,'2026-11'),[]);
 for(let day=1;day<=31;day++)assert.ok(!dates.dailyEntriesOnDate(agendaEntries,`2026-10-${String(day).padStart(2,'0')}`).includes(heritage));
 assert.equal(dates.entriesOnDate([heritage],'2026-10-31').length,1);
 assert.equal(dates.isPast(heritage,new Date('2026-11-01T03:59:00Z')),false);
 assert.equal(dates.isPast(heritage,new Date('2026-11-01T04:00:00Z')),true);
 assert.equal(agendaEntries.filter(e=>e.calendarDisplay==='month').length,4);
});
test('short cultural ranges retain every actual day in the daily calendar',()=>{
 const muertos=agendaEntries.find(e=>e.kind==='cultural-date'&&e.date==='2026-11-01'&&e.endDate==='2026-11-02');
 assert.ok(muertos);
 for(const day of ['2026-11-01','2026-11-02'])assert.deepEqual(dates.dailyEntriesOnDate([muertos],day),[muertos]);
 assert.deepEqual(dates.dailyEntriesOnDate([muertos],'2026-11-03'),[]);
});
const {validateAgenda}=require('../app/components/events/agenda-validation.ts');
test('monthly display requires the actual first and last day of one month',()=>{
 const heritage=agendaEntries.find(e=>e.id==='latin-heritage-2026');
 assert.doesNotThrow(()=>validateAgenda([heritage]));
 for(const patch of [{date:'2026-10-02'},{endDate:'2026-10-30'},{endDate:'2026-11-30'},{calendarDisplay:'day'}])assert.throws(()=>validateAgenda([{...heritage,...patch}]));
});
const React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
test('monthly banner links to the full story once while day counts exclude it',()=>{
 const Component=require('../app/components/events/month-calendar.tsx').default;
 const heritage=agendaEntries.find(e=>e.id==='latin-heritage-2026');
 for(const language of ['en','es']){
  const html=renderToStaticMarkup(React.createElement(Component,{entries:[heritage],month:'2026-10',selectedDate:'2026-10-10',today:'2026-10-10',language,onMonthChange:()=>{},onSelectDate:()=>{}}));
  assert.equal((html.match(/data-month-observance=/g)||[]).length,1);
  assert.ok(html.includes('href="/events/latin-heritage-2026"'));
  assert.ok(html.includes(language==='es'?'Todo el mes':'All month'));
  assert.equal((html.match(/: 0 (activities|actividades)/g)||[]).length,42);
 }
});
