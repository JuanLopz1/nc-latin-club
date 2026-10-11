'use client';
import type { Language } from './home-copy';
import { useContent } from './content-context';
import s from './club-home.module.css';

const copy = {
  en: { title: 'The familia, in your feed.', text: 'Follow @nclat1nclub for moments, plans and the energy of our community.', load: 'Show Instagram', close: 'Close Instagram', visit: 'Visit @nclat1nclub', note: 'More moments on our official Instagram.', frame: 'Official NC Latin Club Instagram profile' },
  es: { title: 'La familia, en tu feed.', text: 'Sigue a @nclat1nclub para descubrir momentos, planes y la energía de nuestra comunidad.', load: 'Mostrar Instagram', close: 'Cerrar Instagram', visit: 'Visitar @nclat1nclub', note: 'Más momentos en nuestro Instagram oficial.', frame: 'Perfil oficial de Instagram de NC Latin Club' },
};
export default function InstagramSection({ language }: { language: Language }) {
  const {settings:clubLinks}=useContent();
  const handle=new URL(clubLinks.instagramUrl).pathname.split('/').filter(Boolean)[0] ?? 'nclat1nclub';
  const t = copy[language];
  if (!clubLinks.instagramUrl) return null;
  return <section className={s.instagram} id="instagram" aria-labelledby="instagram-title">
    <div><p className={s.eyebrow}>@{handle.toUpperCase()} / INSTAGRAM</p><h2 id="instagram-title">{t.title}</h2><p className={s.bodyCopy}>{t.text.replaceAll("nclat1nclub",handle)}</p><a className={s.textLink} href={clubLinks.instagramUrl} target="_blank" rel="noopener noreferrer">{t.visit.replaceAll("nclat1nclub",handle)} <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14" /></svg></a></div>
    <div className={s.instagramPanel}>
      <div id="instagram-profile"><iframe src={`https://www.instagram.com/${handle}/embed/`} title={t.frame} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" /></div>
      <p>{t.note}</p>
    </div>
  </section>;
}
