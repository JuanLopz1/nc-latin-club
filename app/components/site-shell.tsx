'use client';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { copy } from './home-copy';
import { useSiteLanguage } from './site-context';
import s from './site-shell.module.css';
function Brand() { return <><svg viewBox="0 0 64 64" fill="none" aria-hidden="true"><path d="m32 2 7 19 19-7-15 18 15 18-19-7-7 19-7-19-19 7 15-18L6 14l19 7Z" fill="currentColor" /><circle cx="32" cy="32" r="6" fill="var(--background)" /></svg><span>NC LATIN<span className={s.brandSmall}>CLUB</span></span></>; }
function Arrow() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6" /></svg>; }
export default function SiteShell({ children }: { children: ReactNode }) {
  const { language, setLanguage } = useSiteLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const t = copy[language];
  useEffect(() => {
    const closeOnBack = () => setMenuOpen(false);
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape' && menuOpen) { setMenuOpen(false); menuButton.current?.focus(); } };
    window.addEventListener('keydown', escape); window.addEventListener('popstate', closeOnBack);
    return () => { window.removeEventListener('keydown', escape); window.removeEventListener('popstate', closeOnBack); };
  }, [menuOpen]);
  const links = ['/#familia', '/events', '/explore', '/niagara', '/#join'];
  return <div className={s.site} id="top">
    <a href="#main-content" className={s.skip}>{t.skip}</a>
    <header className={s.header}>
      <Link href="/" className={s.brand} onClick={() => setMenuOpen(false)} aria-label={language === 'en' ? 'NC Latin Club — Home' : 'NC Latin Club — Inicio'}><Brand /></Link>
      <nav id="main-navigation" aria-label={language === 'en' ? 'Main navigation' : 'Navegación principal'} className={`${s.nav} ${menuOpen ? s.navOpen : ''}`}>
        {links.map((href, index) => <Link href={href} key={href} onClick={() => setMenuOpen(false)} className={index === 4 ? s.navJoin : undefined}>{t.nav[index]}{index === 4 && <Arrow />}</Link>)}
      </nav>
      <div className={s.headerTools}>
        <button className={s.languageButton} onClick={() => setLanguage(language === 'en' ? 'es' : 'en')} aria-label={`${t.language}: ${language === 'en' ? 'Español' : 'English'}`}><span className={language === 'en' ? s.activeLanguage : ''}>EN</span><span aria-hidden="true">/</span><span className={language === 'es' ? s.activeLanguage : ''}>ES</span></button>
        <button ref={menuButton} className={s.menuButton} aria-expanded={menuOpen} aria-controls="main-navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? t.close : t.menu}<span aria-hidden="true">{menuOpen ? '−' : '+'}</span></button>
      </div>
    </header>
    {children}
    <footer className={s.footer}><div className={s.footerTop}><Link href="/" className={s.brand} onClick={() => setMenuOpen(false)}><Brand /></Link><p>{t.footerLine}</p><a href="#top" className={s.textLink}>{t.backTop}<span aria-hidden="true">↑</span></a></div><div className={s.footerBottom}><span>© 2026 NC Latin Club</span><span>{t.footerNote}</span><div><button onClick={() => setLanguage('en')} aria-pressed={language === 'en'}>English</button><span aria-hidden="true">/</span><button onClick={() => setLanguage('es')} aria-pressed={language === 'es'}>Español</button></div></div></footer>
  </div>;
}
