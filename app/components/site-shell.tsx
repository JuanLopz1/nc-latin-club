'use client';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useContent } from './content-context';
import { useSiteLanguage } from './site-context';
import MotionControl from './motion-control';
import s from './site-shell.module.css';
function Brand() { const {settings}=useContent(); return <><Image src={settings.logoSrc} unoptimized={settings.logoSrc.startsWith('/api/media/')} width={64} height={64} sizes="64px" alt="" className={s.brandLogo} /><span>NC LATIN<span className={s.brandSmall}>CLUB</span></span></>; }
function Arrow() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6" /></svg>; }
export default function SiteShell({ children }: { children: ReactNode }) {
  const { language, setLanguage } = useSiteLanguage();
  const {home:copy}=useContent();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const headerDock = useRef<HTMLDivElement>(null);
  const t = copy[language];
  useEffect(() => {
    const dock = headerDock.current;
    if (!dock) return;
    const scrolled = () => { dock.dataset.scrolled = String(window.scrollY > 16); };
    const sized = () => { document.documentElement.style.setProperty('--site-header-height', `${dock.getBoundingClientRect().height}px`); };
    const observer = new ResizeObserver(sized);
    observer.observe(dock); sized(); scrolled();
    window.addEventListener('scroll', scrolled, { passive: true });
    return () => { observer.disconnect(); window.removeEventListener('scroll', scrolled); document.documentElement.style.removeProperty('--site-header-height'); };
  }, []);
  useEffect(() => {
    const closeOnBack = () => setMenuOpen(false);
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape' && menuOpen) { setMenuOpen(false); menuButton.current?.focus(); } };
    const outside = (event: PointerEvent) => { if (event.target instanceof Node && !headerDock.current?.contains(event.target)) setMenuOpen(false); };
    window.addEventListener('keydown', escape); window.addEventListener('popstate', closeOnBack); window.addEventListener('pointerdown', outside);
    return () => { window.removeEventListener('keydown', escape); window.removeEventListener('popstate', closeOnBack); window.removeEventListener('pointerdown', outside); };
  }, [menuOpen]);
  const links = [{href:'/#familia',label:t.nav[0]},{href:'/events',label:t.nav[1]},{href:'/explore',label:t.nav[2]},{href:'/niagara',label:t.nav[3]},{href:'/fototeca',label:'Fototeca'},{href:'/#join',label:t.nav[4]}];
  return <div className={s.site} id="top">
    <a href="#main-content" className={s.skip}>{t.skip}</a>
    <div ref={headerDock} className={s.headerDock} data-scrolled="false"><header className={s.header}>
      <Link href="/" className={s.brand} onClick={() => setMenuOpen(false)} aria-label={language === 'en' ? 'NC Latin Club — Home' : 'NC Latin Club — Inicio'}><Brand /></Link>
      <nav id="main-navigation" aria-label={language === 'en' ? 'Main navigation' : 'Navegación principal'} className={s.nav}>
        {links.map(({href,label}) => <Link href={href} key={href} onClick={() => setMenuOpen(false)} className={href === '/#join' ? s.navJoin : undefined}>{label}{href === '/#join' && <Arrow />}</Link>)}
      </nav>
      <div className={s.headerTools}>
        <button className={s.languageButton} onClick={() => setLanguage(language === 'en' ? 'es' : 'en')} aria-label={`${t.language}: ${language === 'en' ? 'Español' : 'English'}`}><span className={language === 'en' ? s.activeLanguage : ''}>EN</span><span aria-hidden="true">/</span><span className={language === 'es' ? s.activeLanguage : ''}>ES</span></button>
        <button ref={menuButton} className={s.menuButton} data-menu-trigger aria-expanded={menuOpen} aria-controls={menuOpen ? 'site-menu' : undefined} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? t.close : t.menu}<span aria-hidden="true">{menuOpen ? '−' : '+'}</span></button>
      </div>
    </header>{menuOpen && <div id="site-menu" className={s.menuPanel} data-site-menu>
      <nav className={s.menuNav} aria-label={language === 'en' ? 'Menu navigation' : 'Navegación del menú'}>{links.map(({href,label}) => <Link href={href} key={href} onClick={() => setMenuOpen(false)}>{label}</Link>)}</nav>
      <MotionControl language={language} />
    </div>}</div>
    {children}
    <footer className={s.footer}><div className={s.footerTop}><Link href="/" className={s.brand} onClick={() => setMenuOpen(false)}><Brand /></Link><p>{t.footerLine}</p><a href="#top" className={s.textLink}>{t.backTop}<span aria-hidden="true">↑</span></a></div><div className={s.footerBottom}><span>© 2026 NC Latin Club</span><span>{t.footerNote}</span><div><button onClick={() => setLanguage('en')} aria-pressed={language === 'en'}>English</button><span aria-hidden="true">/</span><button onClick={() => setLanguage('es')} aria-pressed={language === 'es'}>Español</button></div></div></footer>
  </div>;
}
