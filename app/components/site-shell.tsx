'use client';
import { siteShellMessages } from '../translations/interface-translations';
import UiIcon from './ui-icon';
import { useEffect, useRef, type ReactNode } from 'react';
import Link from './localized-link';
import Image from 'next/image';
import { useContent } from './content-context';
import { useSiteLanguage } from './site-context';
import styles from './site-shell.module.css';
function Brand() {
  const { settings } = useContent();
  return (
    <>
      <Image
        src={settings.logoSrc}
        unoptimized={settings.logoSrc.startsWith('/api/media/')}
        width={64}
        height={64}
        sizes="64px"
        alt=""
        className={styles.brandLogo}
      />
      <span>
        NC LATIN<span className={styles.brandSmall}>CLUB</span>
      </span>
    </>
  );
}
function Arrow() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <path d="M4 12h15m-6-6 6 6-6 6" />
    </svg>
  );
}
export default function SiteShell({ children }: { children: ReactNode }) {
  const { language, setLanguage } = useSiteLanguage();
  const { home: homeTranslations } = useContent();
  const headerDock = useRef<HTMLDivElement>(null);
  const translations = homeTranslations[language];
  useEffect(() => {
    const dock = headerDock.current;
    if (!dock) return;
    const scrolled = () => {
      dock.dataset.scrolled = String(window.scrollY > 16);
    };
    const sized = () => {
      document.documentElement.style.setProperty(
        '--site-header-height',
        `${dock.getBoundingClientRect().height}px`,
      );
    };
    const observer = new ResizeObserver(sized);
    observer.observe(dock);
    sized();
    scrolled();
    window.addEventListener('scroll', scrolled, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', scrolled);
      document.documentElement.style.removeProperty('--site-header-height');
    };
  }, []);
  const links = [
    { href: '/#familia', label: translations.nav[0] },
    { href: '/events', label: translations.nav[1] },
    { href: '/explore', label: translations.nav[2] },
    { href: '/niagara', label: translations.nav[3] },
    { href: '/fototeca', label: 'Fototeca' },
    { href: '/#join', label: translations.nav[4] },
  ];
  return (
    <div className={styles.site} id="top">
      <a href="#main-content" className={styles.skip}>
        {translations.skip}
      </a>
      <div ref={headerDock} className={styles.headerDock} data-scrolled="false">
        <header className={styles.header}>
          <Link
            href="/"
            className={styles.brand}
            aria-label={siteShellMessages[language].nCLatinClubHome}
          >
            <Brand />
          </Link>
          <nav
            id="main-navigation"
            aria-label={siteShellMessages[language].mainNavigation}
            className={styles.nav}
          >
            {links.map(({ href, label }) => (
              <Link
                href={href}
                key={href}
                className={href === '/#join' ? styles.navJoin : undefined}
              >
                {label}
                {href === '/#join' && <Arrow />}
              </Link>
            ))}
          </nav>
          <div className={styles.headerTools}>
            <button
              className={styles.languageButton}
              onClick={() => setLanguage(language === 'en' ? 'es' : 'en')}
              aria-label={`${translations.language}: ${siteShellMessages[language].espaOl}`}
            >
              <span className={language === 'en' ? styles.activeLanguage : ''}>EN</span>
              <span aria-hidden="true">/</span>
              <span className={language === 'es' ? styles.activeLanguage : ''}>ES</span>
            </button>
          </div>
        </header>
      </div>
      {children}
      <footer className={styles.footer}>
        <div className={styles.footerTop}>
          <Link href="/" className={styles.brand}>
            <Brand />
          </Link>
          <p>{translations.footerLine}</p>
          <a href="#top" className={styles.textLink}>
            {translations.backTop}
            <span aria-hidden="true">
              <UiIcon name="up" />
            </span>
          </a>
        </div>
        <div className={styles.footerBottom}>
          <span>© 2026 NC Latin Club</span>
          <span>{translations.footerNote}</span>
          <div>
            <button onClick={() => setLanguage('en')} aria-pressed={language === 'en'}>
              English
            </button>
            <span aria-hidden="true">/</span>
            <button onClick={() => setLanguage('es')} aria-pressed={language === 'es'}>
              Español
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
