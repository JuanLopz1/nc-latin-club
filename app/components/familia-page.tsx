'use client';
import UiIcon from './ui-icon';
import Link from 'next/link';
import FamiliaSection from './familia-section';
import { useSiteLanguage } from './site-context';
import { useContent, emailHref } from './content-context';
import styles from './club-home.module.css';

export default function FamiliaPage() {
  const { language } = useSiteLanguage();
  const { home: homeTranslations, settings } = useContent();
  const joinEmailHref = emailHref(settings.joinEmail);
  return (
    <div className={styles.home}>
      <main id="main-content" tabIndex={-1} className={styles.familiaPage}>
        <Link href="/" className={styles.textLink}>
          <UiIcon name="left" /> NC LATIN CLUB
        </Link>
        <FamiliaSection language={language} standalone />
        <a
          href={joinEmailHref}
          className={styles.button}
          title={homeTranslations[language].emailHint}
        >
          {homeTranslations[language].joinAction}
        </a>
      </main>
    </div>
  );
}
