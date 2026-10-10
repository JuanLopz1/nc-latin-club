'use client';
import { useAgendaState, useSiteLanguage } from '../site-context';
import { joinEmailHref } from '../club-links';
import type { AgendaEntry, AgendaState } from './event-types';
import { agendaCategories, dailyEntriesOnDate, formatCalendarDate, initialAgendaState, listEntries, niagaraDate } from './agenda-dates';
import { useAgendaClock } from './agenda-clock';
import { eventsCopy } from './events-copy';
import EventCard from './event-card';
import MonthCalendar from './month-calendar';
import s from './events-agenda.module.css';
const categories = agendaCategories;
export default function EventsAgenda({ entries }: { entries: readonly AgendaEntry[] }) {
  const { language } = useSiteLanguage(), { state: saved, setState } = useAgendaState();
  const now = useAgendaClock(), t = eventsCopy[language];
  const state = saved ?? (now ? initialAgendaState(now) : null);
  const update = (patch: Partial<AgendaState>) => { if (state) setState({ ...state, ...patch }); };
  const filtered = state ? entries.filter(entry => state.categories.includes(entry.category)) : [];
  const shown = state && now ? state.view === 'calendar' ? dailyEntriesOnDate(filtered, state.selectedDate) : listEntries(entries, state.categories, state.period, now) : [];
  return <main className={s.agenda} id="main-content" tabIndex={-1}>
    <div className={s.intro}><div><p className={s.eyebrow}>{t.eyebrow}</p><h1 id="agenda-title">{t.title[0]}<br /><em>{t.title[1]}</em></h1></div><p className={s.body}>{t.body}</p><span className={s.signal} aria-hidden="true">✧</span></div>
    {!state || !now ? <p className={s.loading} role="status">{t.loading}</p> : <>
      <div className={s.categories} aria-label={language === 'en' ? 'Activity categories' : 'Categorías de actividades'}><button type="button" data-categories="all" aria-pressed={state.categories.length === categories.length} onClick={() => update({ categories: [...categories] })}>{t.all}</button><button type="button" data-categories="none" onClick={() => update({ categories: [] })}>{t.none}</button>{categories.map(category => <button type="button" key={category} data-category={category} aria-pressed={state.categories.includes(category)} onClick={() => update({ categories: categories.filter(c => c === category ? !state.categories.includes(c) : state.categories.includes(c)) })}>{t.categories[category]}<span aria-hidden="true">{entries.filter(e => e.category === category).length.toString().padStart(2, '0')}</span></button>)}</div>
      <div className={s.toolbar}><p>{state.categories.length === 1 ? t.intros[state.categories[0]] : t.filterHint}</p><div className={s.switch} aria-label={language === 'en' ? 'Agenda view' : 'Vista de agenda'}>{(['list', 'calendar'] as const).map(view => <button key={view} type="button" data-view={view} aria-pressed={state.view === view} onClick={() => update({ view })}>{t[view]}</button>)}</div></div>
      {state.view === 'list' ? <div className={s.periods}>{(['upcoming', 'past'] as const).map(period => <button key={period} type="button" data-period={period} aria-pressed={state.period === period} onClick={() => update({ period })}>{t[period]}</button>)}</div> : <MonthCalendar entries={filtered} month={state.month} selectedDate={state.selectedDate} today={niagaraDate(now)} language={language} onMonthChange={month => update({ month, selectedDate: month + '-01' })} onSelectDate={date => update({ selectedDate: date, month: date.slice(0, 7) })} />}
      <div className={s.results}>
        {state.view === 'calendar' && <h2>{t.on} {formatCalendarDate(state.selectedDate, language, { dateStyle: 'full' })}</h2>}
        <p className={s.resultStatus} role="status">{shown.length} {shown.length === 1 ? t.activity : t.activities}{state.view === 'calendar' ? ` · ${formatCalendarDate(state.selectedDate, language)}` : ''}</p>
        {shown.length ? <div className={s.cards}>{shown.map(entry => <EventCard key={entry.slug} entry={entry} language={language} />)}</div> : <div className={s.empty}>
          <span className={s.emptySignal} aria-hidden="true">✧</span><div><h2>{!state.categories.length ? t.noCategories : state.view === 'calendar' ? t.noDay : state.period === 'past' ? t.noPast : state.categories.length === 1 ? t.emptyTitles[state.categories[0]] : t.noMatches}</h2><p>{state.categories.length === 1 ? t.emptyBodies[state.categories[0]] : t.filterHint}</p><a href={joinEmailHref}>{t.suggest}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M5 19 19 5M9 5h10v10" /></svg></a></div>
        </div>}
      </div>
      <p className={s.zone}>{t.zone}</p>
    </>}
  </main>;
}
