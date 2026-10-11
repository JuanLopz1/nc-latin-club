'use client';
import { useEffect, useRef, useState } from 'react';
import type { Language } from './home-copy';
import { clubLinks } from './club-links';
import s from './club-home.module.css';

const copy = {
  en: { title: 'The familia, in your feed.', text: 'Follow @nclat1nclub for moments, plans and the energy of our community.', load: 'Show Instagram', close: 'Close Instagram', visit: 'Visit @nclat1nclub', note: 'Instagram loads only when you choose. Its availability depends on Instagram and the account’s embedding settings. You can always open our profile.', frame: 'Official NC Latin Club Instagram profile' },
  es: { title: 'La familia, en tu feed.', text: 'Sigue a @nclat1nclub para descubrir momentos, planes y la energía de nuestra comunidad.', load: 'Mostrar Instagram', close: 'Cerrar Instagram', visit: 'Visitar @nclat1nclub', note: 'Instagram carga solo cuando tú lo eliges. Su disponibilidad depende de Instagram y de la configuración de la cuenta. Siempre puedes abrir nuestro perfil.', frame: 'Perfil oficial de Instagram de NC Latin Club' },
};
export default function InstagramSection({ language }: { language: Language }) {
  const [loaded, setLoaded] = useState(false), frame = useRef<HTMLIFrameElement>(null), button = useRef<HTMLButtonElement>(null);
  const t = copy[language];
  useEffect(() => {
    if (!loaded) return;
    const iframe = frame.current;
    const hidden = () => { if (document.hidden) setLoaded(false); };
    document.addEventListener('visibilitychange', hidden);
    return () => { document.removeEventListener('visibilitychange', hidden); if (iframe) iframe.src = 'about:blank'; setLoaded(false); };
  }, [loaded]);
  if (!clubLinks.instagramUrl) return null;
  return <section className={s.instagram} id="instagram" aria-labelledby="instagram-title">
    <div><p className={s.eyebrow}>@NCLAT1NCLUB / INSTAGRAM</p><h2 id="instagram-title">{t.title}</h2><p className={s.bodyCopy}>{t.text}</p><a className={s.textLink} href={clubLinks.instagramUrl} target="_blank" rel="noopener noreferrer">{t.visit} <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14" /></svg></a></div>
    <div className={s.instagramPanel}>
      <button ref={button} className={s.button} type="button" data-instagram-load aria-expanded={loaded} aria-controls="instagram-profile" onClick={() => { setLoaded(!loaded); button.current?.focus(); }}>{loaded ? t.close : t.load}</button>
      <div id="instagram-profile">{loaded ? <iframe ref={frame} src="https://www.instagram.com/nclat1nclub/embed/" title={t.frame} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" /> : <span className={s.instagramHandle} aria-hidden="true">@nclat1nclub<span>✦</span></span>}</div>
      <p>{t.note}</p>
    </div>
  </section>;
}
