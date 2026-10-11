'use client';
import Link from 'next/link';
import FamiliaSection from './familia-section';
import { useSiteLanguage } from './site-context';
import { copy } from './home-copy';
import { joinEmailHref } from './club-links';
import s from './club-home.module.css';

export default function FamiliaPage() {
  const { language } = useSiteLanguage();
  return <div className={s.home}><main id="main-content" tabIndex={-1} className={s.familiaPage}>
    <Link href="/" className={s.textLink}>← NC LATIN CLUB</Link>
    <FamiliaSection language={language} standalone />
    <a href={joinEmailHref} className={s.button} title={copy[language].emailHint}>{copy[language].joinAction}</a>
  </main></div>;
}
