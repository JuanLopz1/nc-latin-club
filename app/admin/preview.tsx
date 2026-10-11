'use client';
import { useContent, ContentProvider } from '../components/content-context';
import type { SiteContent, ContentKey } from '../cms/types';
import PhotoLibrary from '../components/gallery/photo-library';
import ClubHome from '../components/club-home';
import EventDetail from '../components/events/event-detail';
import NiagaraDirectory from '../components/niagara/niagara-directory';
import CountryDetail from '../components/explore/country-detail';
import { countries } from '../components/explore/country-data';
import type { JsonValue } from './editor-fields';
import { validateContent } from '../cms/validation';
export default function DraftPreview({contentKey,value,index}:{contentKey:ContentKey;value:JsonValue;index:number}) {
  const published=useContent();
  try{validateContent(contentKey,value);}catch(error){return <p>{error instanceof Error?error.message:'Complete the draft before previewing.'}</p>;}
  const content={...published,[contentKey]:value} as SiteContent;
  const entry=contentKey==='events'?content.events[index]:content.culture[index];
  const page=content.pages[index],country=page?countries.find(c=>c.slug===page.slug):null;
  return <ContentProvider content={content}>{contentKey==='gallery'?<PhotoLibrary/>:contentKey==='events'||contentKey==='culture'?entry?<EventDetail entry={entry}/>:null:contentKey==='places'?<NiagaraDirectory places={content.places}/>:contentKey==='pages'?page&&country?<CountryDetail page={page} country={country}/>:null:<ClubHome/>}</ContentProvider>;
}
