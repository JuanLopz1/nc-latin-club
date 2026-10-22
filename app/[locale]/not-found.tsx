'use client';
import { notFoundMessages } from '../translations/interface-translations';
import UiIcon from '../components/ui-icon';
import Link from '../components/localized-link';
import { useSiteLanguage } from '../components/site-context';
import styles from '../components/events/event-detail.module.css';
export default function NotFound() {
  const { language } = useSiteLanguage();
  return (
    <main id="main-content" tabIndex={-1} className={styles.detail}>
      <div className={styles.heading}>
        <p className={styles.eyebrow}>404</p>
        <h1>{notFoundMessages[language].aDifferentPath}</h1>
        <p className={styles.description}>
          {notFoundMessages[language].weCouldnTFindThatPageComeBackTo}
        </p>
        <Link className={styles.back} href="/events">
          {notFoundMessages[language].exploreTheAgenda} <UiIcon name="right" />
        </Link>
      </div>
    </main>
  );
}
