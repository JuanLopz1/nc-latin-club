import type { ContentKey } from '../cms/types';
import type { JsonValue } from './editor-fields';
const bilingual=()=>({en:'',es:''});
export function newRecord(key:ContentKey,slug=''):JsonValue {
  const day=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Toronto',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  const source={url:'',reviewedOn:day,provenance:'official-page'};
  if(key==='places')return {id:'',name:'',city:'',categories:['restaurant'],mode:'storefront',description:bilingual(),offerings:[],channels:[{label:'Website',url:''}],sources:[{title:'Website',url:''}],reviewedOn:day};
  if(key==='pages')return {slug,title:bilingual(),introduction:bilingual(),sections:[{id:'overview',title:bilingual(),text:bilingual(),sourceIds:['source-1']}],sources:[{id:'source-1',title:bilingual(),url:''}],music:[],review:{basis:'documentary-source-review',date:day}};
  const base={id:'',slug:'',title:bilingual(),description:bilingual(),source};
  if(key==='culture')return {...base,kind:'cultural-date',category:'latin-dates',date:day,scope:bilingual()};
  return {...base,kind:'event',category:'at-nc',status:'scheduled',dateSpan:{start:day,end:day},venue:bilingual(),organizer:bilingual()};
}
export function optionalDetails(key:ContentKey):Record<string,JsonValue> {
  if(key==='places')return {address:'',coordinates:{lat:43.16,lng:-79.24,accuracy:'reviewed-public-destination'}};
  if(key==='pages')return {};
  if(key==='culture')return {endDate:'',calendarDisplay:'month',note:bilingual(),links:[{url:'',label:bilingual()}]};
  if(key==='events')return {startsAt:'',endsAt:'',dateSpan:{start:'',end:''},city:bilingual(),admission:bilingual(),registrationUrl:'',statusNote:bilingual(),note:bilingual(),links:[{url:'',label:bilingual()}],sessions:[{startsAt:'',endsAt:''}]};
  return {};
}
export function recordName(value:JsonValue,language:'en'|'es'):string {
  if(!value || typeof value!=='object' || Array.isArray(value))return '';
  const title=value.title;return String(value.name || (title && typeof title==='object' && !Array.isArray(title)?title[language]:'') || value.slug || value.id || '—');
}
