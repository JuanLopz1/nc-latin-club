import { addToCalendarMessages } from '../../translations/interface-translations';
import UiIcon from '../ui-icon';
import type { Language } from '../../translations/language';
import type { EventEntry } from './event-types';
import { eventCalendarFile } from './event-calendar';
import styles from './event-tools.module.css';
export default function AddToCalendar({
  entry,
  language,
}: {
  entry: EventEntry;
  language: Language;
}) {
  const file = eventCalendarFile(entry, language);
  if (!file)
    return (
      <span className={styles.disabled} aria-disabled="true">
        {addToCalendarMessages[language].calendarDownloadUnavailableCancelled}
      </span>
    );
  return (
    <a
      className={styles.calendarLink}
      download={`${entry.slug}.ics`}
      href={`data:text/calendar;charset=utf-8,${encodeURIComponent(file)}`}
      aria-label={`${addToCalendarMessages[language].addToCalendar}: ${entry.title[language]} (.ics)`}
    >
      {addToCalendarMessages[language].addToCalendar}{' '}
      <span aria-hidden="true">
        <UiIcon name="down" />
      </span>
    </a>
  );
}
