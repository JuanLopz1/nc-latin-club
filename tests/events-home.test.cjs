/* eslint-disable @typescript-eslint/no-require-imports -- In-memory SSR regression harness. */
require('./register-typescript.cjs');
const test = require('node:test');
const assert = require('node:assert/strict');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const clock = require('../app/components/events/agenda-clock.ts');
const { ContentProvider } = require('../app/components/content-context.tsx');
const { defaultContent } = require('../app/cms/defaults.ts');
const { agendaEntries } = require('../app/components/events/agenda-data.ts');
const { homeTranslations } = require('../app/translations/home-translations.ts');
const EventsSection = require('../app/components/events-section.tsx').default;
const fiesta = agendaEntries.find((e) => e.slug === 'latin-fiesta-2026');
function render(events, now, language = 'en') {
  const originalClock = clock.useAgendaClock;
  clock.useAgendaClock = () => now;
  try {
    return renderToStaticMarkup(
      React.createElement(
        ContentProvider,
        { content: { ...defaultContent, events } },
        React.createElement(EventsSection, { language }),
      ),
    );
  } finally {
    clock.useAgendaClock = originalClock;
  }
}
test('home omits cancelled events; rescheduling keeps the current date', () => {
  const notice = {
    en: 'This gathering is cancelled.',
    es: 'Este encuentro está cancelado.',
  };
  for (const language of ['en', 'es']) {
    const html = render(
      [{ ...fiesta, status: 'cancelled', statusNote: notice }],
      new Date('2026-10-10T16:00:00Z'),
      language,
    );
    assert.ok(!html.includes('<article'));
    assert.ok(!html.includes('href="https://www.ncengage.ca/intl/rsvp_boot?id=382827"'));
    const changed = render(
      [
        {
          ...fiesta,
          status: 'rescheduled',
          statusNote: notice,
          startsAt: '2026-11-04T19:00:00-05:00',
          endsAt: undefined,
        },
      ],
      new Date('2026-10-10T16:00:00Z'),
      language,
    );
    assert.ok(
      changed.includes(notice[language]) &&
        changed.includes('dateTime="2026-11-04T19:00:00-05:00"'),
    );
  }
});

test('home limits results to three and prioritizes club then Ontario Niagara over excursions', () => {
  const external = (id, city, address, date) => ({
    ...fiesta,
    id,
    slug: id,
    category: 'out-of-nc',
    title: { en: id, es: id },
    city: { en: city, es: city },
    address,
    startsAt: date,
    endsAt: undefined,
    registrationUrl: undefined,
  });
  const local = external(
    'local-muertos',
    'Niagara Falls',
    '5943 Sylvia Place, Niagara Falls, ON',
    '2026-10-24T11:00:00-04:00',
  );
  const usa = external(
    'usa-salsa',
    'Niagara Falls, NY, USA',
    '333 Prospect St, Niagara Falls, NY',
    '2026-10-23T20:00:00-04:00',
  );
  const toronto = external(
    'toronto-festival',
    'Toronto',
    'Toronto, ON',
    '2026-10-17T15:00:00-04:00',
  );
  const karaoke = {
    ...fiesta,
    id: 'club-karaoke',
    slug: 'club-karaoke',
    title: { en: 'Club Karaoke', es: 'Karaoke del club' },
    startsAt: '2026-10-22T18:30:00-04:00',
    endsAt: undefined,
  };
  for (const language of ['en', 'es']) {
    const html = render(
      [toronto, usa, local, fiesta, karaoke],
      new Date('2026-10-18T16:00:00Z'),
      language,
    );
    assert.equal((html.match(/<article/g) || []).length, 3);
    assert.ok(
      html.includes('/events/club-karaoke') &&
        html.includes('/events/latin-fiesta-2026') &&
        html.includes('/events/local-muertos'),
    );
    assert.ok(
      html.indexOf('/events/club-karaoke') < html.indexOf('/events/latin-fiesta-2026'),
    );
    assert.ok(
      !html.includes('/events/usa-salsa') && !html.includes('/events/toronto-festival'),
    );
    const after = render(
      [usa, local, fiesta, karaoke],
      new Date('2026-10-24T04:00:00Z'),
      language,
    );
    assert.ok(
      !after.includes('/events/latin-fiesta-2026') &&
        after.includes('/events/local-muertos'),
    );
  }
});

test('home fills available slots from excursions and does not call them At NC', () => {
  const outside = {
    ...fiesta,
    id: 'outside',
    slug: 'outside',
    category: 'out-of-nc',
    city: { en: 'Hamilton, ON', es: 'Hamilton, ON' },
    organizer: { en: 'SalsaSoul Productions', es: 'SalsaSoul Productions' },
  };
  const html = render([outside], new Date('2026-10-18T16:00:00Z'));
  assert.equal((html.match(/<article/g) || []).length, 1);
  assert.ok(html.includes('Hamilton, ON') && html.includes('Out of NC'));
  assert.ok(!html.includes('>AT NC<'));
});
test('home upcoming collection uses runtime end and hides expired editions and unknown-end events after their start', () => {
  assert.ok(render([fiesta], new Date('2026-10-24T03:59:00Z')).includes('<article'));
  for (const language of ['en', 'es']) {
    const ended = render([fiesta], new Date('2026-10-24T04:00:00Z'), language);
    assert.ok(
      !ended.includes('<article') &&
        ended.includes(homeTranslations[language].events.emptyTitle),
    );
  }
  const noEnd = render(
    [{ ...fiesta, endsAt: undefined }],
    new Date('2026-10-24T03:59:00Z'),
  );
  assert.ok(!noEnd.includes('<article'));
});
test('home initializes with an accessible loading state before a runtime clock is available', () => {
  const html = render([fiesta], null);
  assert.ok(html.includes('role="status"'));
  assert.ok(!html.includes('<article'));
});
