'use client';
import UiIcon from '../ui-icon';
import type { KeyboardEvent } from 'react';
import { useAgendaState, useSiteLanguage } from '../site-context';
import { useContent, emailHref } from '../content-context';
import type { AgendaEntry, AgendaScope, AgendaState } from './event-types';
import {
  agendaPeriodEntries,
  dailyEntriesOnDate,
  formatCalendarDate,
  initialAgendaState,
  niagaraDate,
} from './agenda-dates';
import { useAgendaClock } from './agenda-clock';
import { eventsTranslations } from '../../translations/events-translations';
import EventCard from './event-card';
import MonthCalendar from './month-calendar';
import styles from './events-agenda.module.css';
const categories = ['at-nc', 'out-of-nc'] as const;
export default function EventsAgenda({ entries }: { entries: readonly AgendaEntry[] }) {
  const { settings } = useContent();
  const joinEmailHref = emailHref(settings.joinEmail);
  const { language } = useSiteLanguage();
  const { state: saved, setState } = useAgendaState();
  const now = useAgendaClock();
  const translations = eventsTranslations[language];
  const state = saved ?? (now ? initialAgendaState(now) : null);
  const scope = state?.scope ?? 'events';
  const culture = scope === 'culture';
  const update = (patch: Partial<AgendaState>) => {
    if (state) setState({ ...state, ...patch });
  };
  const periodEntries = state && now ? agendaPeriodEntries(entries, state, now) : [];
  const filtered = culture
    ? periodEntries
    : periodEntries.filter((entry) => state?.categories.includes(entry.category));
  const shown = state
    ? state.view === 'calendar'
      ? dailyEntriesOnDate(filtered, state.selectedDate)
      : filtered
    : [];
  const years = Array.from(
    new Set(
      entries
        .filter((entry) => entry.kind === 'cultural-date')
        .map((entry) => entry.date.slice(0, 4)),
    ),
  ).sort();
  const year = state?.cultureYear ?? state?.month.slice(0, 4);
  const selectedCategories = categories.filter((category) =>
    state?.categories.includes(category),
  );
  const emptyCategory = culture
    ? 'latin-dates'
    : selectedCategories.length === 1
      ? selectedCategories[0]
      : null;
  const countLabel = (count: number) =>
    culture
      ? count === 1
        ? translations.culturalDate
        : translations.culturalDates
      : count === 1
        ? translations.event
        : translations.events;
  const selectTab = (next: AgendaScope) => update({ scope: next });
  const tabKeys = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next: AgendaScope =
      event.key === 'Home'
        ? 'events'
        : event.key === 'End'
          ? 'culture'
          : culture
            ? 'events'
            : 'culture';
    selectTab(next);
    document.getElementById(`scope-${next}`)?.focus();
  };
  return (
    <main className={styles.agenda} id="main-content" tabIndex={-1}>
      <div className={styles.intro}>
        <div>
          <p className={styles.eyebrow}>{translations.eyebrow}</p>
          <h1 id="agenda-title">
            {translations.title[0]}
            <br />
            <em>{translations.title[1]}</em>
          </h1>
        </div>
        <p className={styles.body}>{translations.body}</p>
        <span className={styles.signal} aria-hidden="true">
          <UiIcon name="sparkle" />
        </span>
      </div>
      {!state || !now ? (
        <p className={styles.loading} role="status">
          {translations.loading}
        </p>
      ) : (
        <>
          <div
            className={styles.tabs}
            role="tablist"
            aria-label={translations.scopeLabel}
          >
            {(['events', 'culture'] as const).map((tab) => (
              <button
                key={tab}
                id={`scope-${tab}`}
                type="button"
                role="tab"
                aria-controls="agenda-panel"
                aria-selected={scope === tab}
                tabIndex={scope === tab ? 0 : -1}
                onKeyDown={tabKeys}
                onClick={() => selectTab(tab)}
              >
                {translations.scopes[tab]}
              </button>
            ))}
          </div>
          <section
            role="tabpanel"
            id="agenda-panel"
            aria-labelledby={`scope-${scope}`}
            tabIndex={0}
          >
            {culture ? (
              <div className={styles.cultureIntro}>
                <p>{translations.intros['latin-dates']}</p>
                {state.view === 'list' && (
                  <label htmlFor="culture-year">
                    {translations.year}
                    <select
                      id="culture-year"
                      value={years.includes(year ?? '') ? year : ''}
                      onChange={(event) =>
                        update({
                          cultureYear: event.target.value,
                          month: `${event.target.value}-${state.month.slice(5)}`,
                          selectedDate: `${event.target.value}-${state.month.slice(5)}-01`,
                        })
                      }
                    >
                      {!years.includes(year ?? '') && <option value="">{year}</option>}
                      {years.map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
              </div>
            ) : (
              <div className={styles.categories} aria-label={translations.eventFilters}>
                <button
                  type="button"
                  data-categories="all"
                  aria-pressed={selectedCategories.length === categories.length}
                  onClick={() => update({ categories: [...categories] })}
                >
                  {translations.all}
                </button>
                <button
                  type="button"
                  data-categories="none"
                  onClick={() => update({ categories: [] })}
                >
                  {translations.none}
                </button>
                {categories.map((category) => {
                  const count = periodEntries.filter(
                    (entry) => entry.category === category,
                  ).length;
                  return (
                    <button
                      type="button"
                      key={category}
                      data-category={category}
                      aria-pressed={state.categories.includes(category)}
                      aria-label={`${translations.categories[category]}: ${count} ${count === 1 ? translations.event : translations.events}`}
                      onClick={() =>
                        update({
                          categories: categories.filter((value) =>
                            value === category
                              ? !state.categories.includes(value)
                              : state.categories.includes(value),
                          ),
                        })
                      }
                    >
                      {translations.categories[category]}
                      <span aria-hidden="true">{count.toString().padStart(2, '0')}</span>
                    </button>
                  );
                })}
              </div>
            )}
            <div className={styles.toolbar}>
              <p>
                {culture
                  ? translations.cultureHint
                  : selectedCategories.length === 1
                    ? translations.intros[selectedCategories[0]]
                    : translations.filterHint}
              </p>
              <div className={styles.switch} aria-label={translations.viewLabel}>
                {(['list', 'calendar'] as const).map((view) => (
                  <button
                    key={view}
                    type="button"
                    data-view={view}
                    aria-pressed={state.view === view}
                    onClick={() =>
                      update({
                        view,
                        ...(culture && view === 'calendar' && year
                          ? {
                              month: `${year}-${state.month.slice(5)}`,
                              selectedDate: `${year}-${state.month.slice(5)}-01`,
                            }
                          : {}),
                      })
                    }
                  >
                    {translations[view]}
                  </button>
                ))}
              </div>
            </div>
            <div className={styles.periods}>
              {(['upcoming', 'past'] as const).map((period) => (
                <button
                  key={period}
                  type="button"
                  data-period={period}
                  aria-pressed={state.period === period}
                  onClick={() => update({ period })}
                >
                  {translations[period]}
                </button>
              ))}
            </div>
            {state.view === 'calendar' && (
              <>
                <p className={styles.resultStatus}>
                  {filtered.length} {countLabel(filtered.length)} ·{' '}
                  {formatCalendarDate(state.month + '-01', language, {
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
                <MonthCalendar
                  entries={filtered}
                  month={state.month}
                  selectedDate={state.selectedDate}
                  today={niagaraDate(now)}
                  language={language}
                  countKind={culture ? 'culture' : 'events'}
                  onMonthChange={(month) =>
                    update({
                      month,
                      cultureYear: month.slice(0, 4),
                      selectedDate: month + '-01',
                    })
                  }
                  onSelectDate={(date) =>
                    update({
                      selectedDate: date,
                      month: date.slice(0, 7),
                      cultureYear: date.slice(0, 4),
                    })
                  }
                />
              </>
            )}
            <div className={styles.results}>
              {state.view === 'calendar' && (
                <h2>
                  {translations.on}{' '}
                  {formatCalendarDate(state.selectedDate, language, {
                    dateStyle: 'full',
                  })}
                </h2>
              )}
              <p className={styles.resultStatus} role="status">
                {shown.length} {countLabel(shown.length)}
                {state.view === 'calendar'
                  ? ` · ${formatCalendarDate(state.selectedDate, language)}`
                  : culture
                    ? ` · ${year}`
                    : ''}
              </p>
              {shown.length ? (
                <div className={styles.cards}>
                  {shown.map((entry) => (
                    <EventCard key={entry.slug} entry={entry} language={language} />
                  ))}
                </div>
              ) : (
                <div className={styles.empty}>
                  <span className={styles.emptySignal} aria-hidden="true">
                    <UiIcon name="sparkle" />
                  </span>
                  <div>
                    <h2>
                      {!culture && !selectedCategories.length
                        ? translations.noCategories
                        : state.view === 'calendar'
                          ? translations.noDay
                          : state.period === 'past'
                            ? translations.noPast
                            : emptyCategory
                              ? translations.emptyTitles[emptyCategory]
                              : translations.noMatches}
                    </h2>
                    <p>
                      {emptyCategory
                        ? translations.emptyBodies[emptyCategory]
                        : translations.filterHint}
                    </p>
                    <a href={joinEmailHref}>
                      {translations.suggest}
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        aria-hidden="true"
                      >
                        <path d="M5 19 19 5M9 5h10v10" />
                      </svg>
                    </a>
                  </div>
                </div>
              )}
            </div>
            <p className={styles.zone}>
              {culture ? translations.emptyBodies['latin-dates'] : translations.zone}
            </p>
          </section>
        </>
      )}
    </main>
  );
}
