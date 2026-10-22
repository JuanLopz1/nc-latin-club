'use client';
import UiIcon from '../ui-icon';
import type { KeyboardEvent } from 'react';
import { useAgendaState, useSiteLanguage } from '../site-context';
import { useContent, emailHref } from '../content-context';
import type { AgendaEntry, AgendaScope, AgendaState } from './event-types';
import { agendaPeriodEntries, dailyEntriesOnDate, formatCalendarDate, initialAgendaState, niagaraDate } from './agenda-dates';
import { useAgendaClock } from './agenda-clock';
import { eventsCopy } from './events-copy';
import EventCard from './event-card';
import MonthCalendar from './month-calendar';
import s from './events-agenda.module.css';
const categories = ['at-nc', 'out-of-nc'] as const;
export default function EventsAgenda({ entries }: { entries: readonly AgendaEntry[] }) {
  const {settings}=useContent(),joinEmailHref=emailHref(settings.joinEmail);
  const { language } = useSiteLanguage(), { state: saved, setState } = useAgendaState();
  const now = useAgendaClock(), t = eventsCopy[language];
  const state = saved ?? (now ? initialAgendaState(now) : null), scope = state?.scope ?? 'events';
  const culture = scope === 'culture';
  const update = (patch: Partial<AgendaState>) => { if (state) setState({ ...state, ...patch }); };
  const periodEntries = state && now ? agendaPeriodEntries(entries, state, now) : [];
  const filtered = culture ? periodEntries : periodEntries.filter(entry => state?.categories.includes(entry.category));
  const shown = state ? state.view === 'calendar' ? dailyEntriesOnDate(filtered, state.selectedDate) : filtered : [];
  const years = Array.from(new Set(entries.filter(entry => entry.kind === 'cultural-date').map(entry => entry.date.slice(0, 4)))).sort();
  const year = state?.cultureYear ?? state?.month.slice(0, 4);
  const selectedCategories = categories.filter(category => state?.categories.includes(category));
  const emptyCategory = culture ? 'latin-dates' : selectedCategories.length === 1 ? selectedCategories[0] : null;
  const countLabel = (count: number) => culture ? count === 1 ? t.culturalDate : t.culturalDates : count === 1 ? t.event : t.events;
  const selectTab = (next: AgendaScope) => update({ scope: next });
  const tabKeys = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next: AgendaScope = event.key === 'Home' ? 'events' : event.key === 'End' ? 'culture' : culture ? 'events' : 'culture';
    selectTab(next); document.getElementById(`scope-${next}`)?.focus();
  };
  return <main className={s.agenda} id="main-content" tabIndex={-1}>
    <div className={s.intro}><div><p className={s.eyebrow}>{t.eyebrow}</p><h1 id="agenda-title">{t.title[0]}<br /><em>{t.title[1]}</em></h1></div><p className={s.body}>{t.body}</p><span className={s.signal} aria-hidden="true"><UiIcon name="sparkle" /></span></div>
    {!state || !now ? <p className={s.loading} role="status">{t.loading}</p> : <>
      <div className={s.tabs} role="tablist" aria-label={t.scopeLabel}>{(['events', 'culture'] as const).map(tab => <button key={tab} id={`scope-${tab}`} type="button" role="tab" aria-controls="agenda-panel" aria-selected={scope === tab} tabIndex={scope === tab ? 0 : -1} onKeyDown={tabKeys} onClick={() => selectTab(tab)}>{t.scopes[tab]}</button>)}</div>
      <section role="tabpanel" id="agenda-panel" aria-labelledby={`scope-${scope}`} tabIndex={0}>
        {culture ? <div className={s.cultureIntro}><p>{t.intros['latin-dates']}</p>{state.view === 'list' && <label htmlFor="culture-year">{t.year}<select id="culture-year" value={years.includes(year ?? '') ? year : ''} onChange={event => update({ cultureYear: event.target.value, month: `${event.target.value}-${state.month.slice(5)}`, selectedDate: `${event.target.value}-${state.month.slice(5)}-01` })}>{!years.includes(year ?? '') && <option value="">{year}</option>}{years.map(value => <option key={value} value={value}>{value}</option>)}</select></label>}</div> : <div className={s.categories} aria-label={t.eventFilters}><button type="button" data-categories="all" aria-pressed={selectedCategories.length === categories.length} onClick={() => update({ categories: [...categories] })}>{t.all}</button><button type="button" data-categories="none" onClick={() => update({ categories: [] })}>{t.none}</button>{categories.map(category => {
          const count = periodEntries.filter(entry => entry.category === category).length;
          return <button type="button" key={category} data-category={category} aria-pressed={state.categories.includes(category)} aria-label={`${t.categories[category]}: ${count} ${count === 1 ? t.event : t.events}`} onClick={() => update({ categories: categories.filter(value => value === category ? !state.categories.includes(value) : state.categories.includes(value)) })}>{t.categories[category]}<span aria-hidden="true">{count.toString().padStart(2, '0')}</span></button>;
        })}</div>}
        <div className={s.toolbar}><p>{culture ? t.cultureHint : selectedCategories.length === 1 ? t.intros[selectedCategories[0]] : t.filterHint}</p><div className={s.switch} aria-label={t.viewLabel}>{(['list', 'calendar'] as const).map(view => <button key={view} type="button" data-view={view} aria-pressed={state.view === view} onClick={() => update({ view, ...(culture && view === 'calendar' && year ? { month: `${year}-${state.month.slice(5)}`, selectedDate: `${year}-${state.month.slice(5)}-01` } : {}) })}>{t[view]}</button>)}</div></div>
        <div className={s.periods}>{(['upcoming', 'past'] as const).map(period => <button key={period} type="button" data-period={period} aria-pressed={state.period === period} onClick={() => update({ period })}>{t[period]}</button>)}</div>
        {state.view === 'calendar' && <><p className={s.resultStatus}>{filtered.length} {countLabel(filtered.length)} · {formatCalendarDate(state.month + '-01', language, { month: 'long', year: 'numeric' })}</p><MonthCalendar entries={filtered} month={state.month} selectedDate={state.selectedDate} today={niagaraDate(now)} language={language} countKind={culture ? 'culture' : 'events'} onMonthChange={month => update({ month, cultureYear: month.slice(0, 4), selectedDate: month + '-01' })} onSelectDate={date => update({ selectedDate: date, month: date.slice(0, 7), cultureYear: date.slice(0, 4) })} /></>}
        <div className={s.results}>
          {state.view === 'calendar' && <h2>{t.on} {formatCalendarDate(state.selectedDate, language, { dateStyle: 'full' })}</h2>}
          <p className={s.resultStatus} role="status">{shown.length} {countLabel(shown.length)}{state.view === 'calendar' ? ` · ${formatCalendarDate(state.selectedDate, language)}` : culture ? ` · ${year}` : ''}</p>
          {shown.length ? <div className={s.cards}>{shown.map(entry => <EventCard key={entry.slug} entry={entry} language={language} />)}</div> : <div className={s.empty}>
            <span className={s.emptySignal} aria-hidden="true"><UiIcon name="sparkle" /></span><div><h2>{!culture && !selectedCategories.length ? t.noCategories : state.view === 'calendar' ? t.noDay : state.period === 'past' ? t.noPast : emptyCategory ? t.emptyTitles[emptyCategory] : t.noMatches}</h2><p>{emptyCategory ? t.emptyBodies[emptyCategory] : t.filterHint}</p><a href={joinEmailHref}>{t.suggest}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M5 19 19 5M9 5h10v10" /></svg></a></div>
          </div>}
        </div>
        <p className={s.zone}>{culture ? t.emptyBodies['latin-dates'] : t.zone}</p>
      </section>
    </>}
  </main>;
}
