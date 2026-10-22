import UiIcon from '../ui-icon';
import type { Language } from '../home-copy';
import type { EventEntry } from './event-types';
import { eventCalendarFile } from './event-calendar';
import s from './event-tools.module.css';
export default function AddToCalendar({ entry, language }: { entry: EventEntry; language: Language }) {
  const file = eventCalendarFile(entry, language);
  if (!file) return <span className={s.disabled} aria-disabled="true">{language === 'en' ? 'Calendar download unavailable · cancelled' : 'Descarga de calendario no disponible · cancelado'}</span>;
  return <a className={s.calendarLink} download={`${entry.slug}.ics`} href={`data:text/calendar;charset=utf-8,${encodeURIComponent(file)}`} aria-label={`${language === 'en' ? 'Add to calendar' : 'Añadir al calendario'}: ${entry.title[language]} (.ics)`}>{language === 'en' ? 'Add to calendar' : 'Añadir al calendario'} <span aria-hidden="true"><UiIcon name="down" /></span></a>;
}
