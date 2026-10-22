/* eslint-disable @typescript-eslint/no-require-imports */
require('./register-typescript.cjs');
const test = require('node:test');
const assert = require('node:assert/strict');
const { agendaEntries } = require('../app/components/events/agenda-data.ts');
const { validateAgenda } = require('../app/components/events/agenda-validation.ts');
const {
  entriesOnDate,
  isPast,
  formatEntryWhen,
} = require('../app/components/events/agenda-dates.ts');
const {
  homeEvents,
  isNiagaraOntario,
} = require('../app/components/events/home-events.ts');

test('the current home highlights karaoke, Latin Fiesta and local Muertos in that order', () => {
  assert.deepEqual(
    homeEvents(agendaEntries, new Date('2026-10-18T16:00:00Z')).map((e) => e.slug),
    ['karaoke-latino-2026', 'latin-fiesta-2026', 'muertos-niagara-2026'],
  );
  const local = agendaEntries.find((e) => e.slug === 'muertos-niagara-2026');
  assert.equal(isNiagaraOntario(local), true);
  assert.equal(
    isNiagaraOntario({ ...local, address: '333 Prospect St, Niagara Falls, NY 14303' }),
    false,
  );
  assert.equal(
    isNiagaraOntario({
      ...local,
      city: { en: 'Niagara Falls, NY, USA', es: 'Niagara Falls, EE. UU.' },
    }),
    false,
  );
});

test('founder confirmed karaoke has the actual start, campus, food and no invented ticket or finish', () => {
  const entry = agendaEntries.find((e) => e.slug === 'karaoke-latino-2026');
  assert.ok(entry);
  assert.equal(entry.category, 'at-nc');
  assert.equal(entry.organizer.en, 'NC Latin Club');
  assert.equal(entry.sessions[0].startsAt, '2026-10-22T18:30:00-04:00');
  assert.match(entry.venue.en, /Wellness Lounge.*Welland/);
  assert.match(entry.admission.en, /Free.*food/i);
  assert.match(entry.admission.es, /Gratis.*comida/i);
  assert.ok(
    !entry.registrationUrl &&
      !entry.images?.length &&
      !entry.endsAt &&
      !entry.sessions[0].endsAt,
  );
  assert.ok(entriesOnDate([entry], '2026-10-22').includes(entry));
  assert.equal(isPast(entry, new Date('2026-10-23T03:59:00Z')), false);
  assert.equal(isPast(entry, new Date('2026-10-23T04:00:00Z')), true);
  assert.match(formatEntryWhen(entry, 'en'), /6:30/);
});

test('verified Latin dance events preserve location, edition and clock offsets', () => {
  const salsa = agendaEntries.find((e) => e.slug === 'salsa-hard-rock-2026');
  assert.ok(salsa);
  assert.match(salsa.city.en, /NY.*USA/);
  assert.match(salsa.note.es, /frontera/i);
  assert.equal(salsa.startsAt, '2026-10-23T20:00:00-04:00');
  assert.equal(salsa.endsAt, '2026-10-23T22:30:00-04:00');
  const soul = agendaEntries.find((e) => e.slug === 'salsasoul-saturday-2026-11-21');
  assert.ok(soul);
  assert.equal(soul.startsAt, '2026-11-21T20:00:00-05:00');
  assert.equal(soul.endsAt, '2026-11-22T01:00:00-05:00');
  assert.ok(agendaEntries.find((e) => e.slug === 'gala-gasworks-2026'));
  const pachanga = agendaEntries.find((e) => e.slug === 'la-pachanga-waterloo-2026');
  assert.ok(pachanga);
  assert.equal(pachanga.sessions[0].startsAt, '2026-10-23T20:00:00-04:00');
  assert.doesNotThrow(() => validateAgenda(agendaEntries));
});
