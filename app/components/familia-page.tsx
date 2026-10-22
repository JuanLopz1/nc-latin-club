'use client';
import UiIcon from './ui-icon';
import Link from 'next/link';
import FamiliaSection from './familia-section';
import { useSiteLanguage } from './site-context';
import { useContent, emailHref } from './content-context';
import s from './club-home.module.css';

export default function FamiliaPage() {
  const { language } = useSiteLanguage();
  const {home:copy,settings}=useContent(),joinEmailHref=emailHref(settings.joinEmail);
  return <div className={s.home}><main id="main-content" tabIndex={-1} className={s.familiaPage}>
    <Link href="/" className={s.textLink}><UiIcon name="left" /> NC LATIN CLUB</Link>
    <FamiliaSection language={language} standalone />
    <a href={joinEmailHref} className={s.button} title={copy[language].emailHint}>{copy[language].joinAction}</a>
  </main></div>;
}
