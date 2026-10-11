'use client';
import {useEffect,useRef,useState} from 'react';
import type {Language} from '../home-copy';
import {galleryCopy} from './gallery-copy';
import Arrow from './arrow';
import s from './gallery.module.css';
type Upload={src:string;width:number;height:number;proof:string};
type Batch={id:string;token:string;images:Upload[];files:File[]};
async function request(path:string,init:RequestInit={}){const response=await fetch(path,{...init,cache:'no-store'}),data=await response.json();if(!response.ok)throw new Error(String(response.status));return data;}
export default function PhotoSubmission({language}:{language:Language}){
 const t=galleryCopy[language],[ready,setReady]=useState<boolean|null>(null),[challenge,setChallenge]=useState(''),[busy,setBusy]=useState(false),[sent,setSent]=useState(false),[error,setError]=useState(''),[progress,setProgress]=useState(0),[files,setFiles]=useState<File[]>([]),[previews,setPreviews]=useState<string[]>([]);
 const batch=useRef<Batch|null>(null),formRef=useRef<HTMLFormElement>(null),abort=useRef<AbortController|null>(null);
 useEffect(()=>{const controller=new AbortController();request('/api/gallery/submissions',{signal:controller.signal}).then(data=>{setReady(data.available);setChallenge(data.challenge??'');}).catch(()=>{if(!controller.signal.aborted)setReady(false);});return()=>{controller.abort();abort.current?.abort();};},[]);
 useEffect(()=>()=>previews.forEach(url=>URL.revokeObjectURL(url)),[previews]);
 const submit=async(event:React.FormEvent<HTMLFormElement>)=>{
  event.preventDefault();const form=event.currentTarget,values=new FormData(form);setError('');
  if(files.length<1||files.length>8||files.some(file=>file.size>3*1024*1024||!['image/png','image/jpeg','image/webp'].includes(file.type))){setError(t.limits);return;}
  setBusy(true);const controller=new AbortController();abort.current=controller;
  try{
   if(!batch.current){const result=await request('/api/gallery/submissions',{method:'POST',signal:controller.signal,headers:{'Content-Type':'application/json'},body:JSON.stringify({challenge,website:values.get('website'),consent:values.get('consent')==='on'})});batch.current={...result,images:[],files};}
   const current=batch.current!;
   for(let i=current.images.length;i<current.files.length;i++){setProgress(i+1);const data=new FormData();data.set('image',current.files[i]);const image=await request(`/api/gallery/submissions/${current.id}/images`,{method:'POST',signal:controller.signal,headers:{'x-photo-token':current.token,'x-photo-slot':String(i)},body:data});current.images.push(image);}
   await request(`/api/gallery/submissions/${current.id}`,{method:'POST',signal:controller.signal,headers:{'Content-Type':'application/json','x-photo-token':current.token},body:JSON.stringify({images:current.images,caption:values.get('caption'),album:values.get('album'),credit:values.get('credit')??'',consent:values.get('consent')==='on'})});setSent(true);batch.current=null;form.reset();setFiles([]);setPreviews([]);
  }catch(error){if(!controller.signal.aborted)setError(error instanceof Error&&error.message==='429'?t.rate:t.error);}finally{setBusy(false);}
 };
 return <section className={s.submission} id="leave-a-memory" aria-labelledby="submission-title"><div><p className={s.label}>SIDE B / FAMILIA</p><h2 id="submission-title">{t.share}</h2><p>{t.formText}</p></div>{sent?<p className={s.success} role="status" data-submission-success>{t.sent}</p>:ready===false?<p className={s.formNotice} role="status">{t.unavailable}</p>:<form ref={formRef} onSubmit={submit} className={s.form} data-photo-form><fieldset disabled={busy||ready!==true}><label>{t.files}<input type="file" name="images" accept="image/jpeg,image/png,image/webp" multiple required onChange={event=>{const next=Array.from(event.target.files??[]);setFiles(next);setPreviews(next.map(file=>URL.createObjectURL(file)));batch.current=null;setError('');}}/><small>{t.limits}</small></label>{!!previews.length&&<div className={s.uploadPreviews}>{previews.map((src,i)=><span key={src} style={{backgroundImage:`url(${src})`}} aria-label={`${t.frame} ${i+1}`}/>)}</div>}<label>{t.caption}<textarea name="caption" maxLength={500} required rows={3}/><small>{t.captionHint}</small></label><div className={s.formRow}><label>{t.albumField}<input name="album" required maxLength={80} defaultValue="Familia"/></label><label>{t.creditField}<input name="credit" maxLength={100}/></label></div><label className={s.honeypot} aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off"/></label><label className={s.consent}><input type="checkbox" name="consent" required/><span>{t.consent}</span></label><button className={s.primary} type="submit">{busy?`${t.progress} ${progress} / ${files.length}`:t.send}<Arrow/></button></fieldset>{busy&&<p role="status">{t.sending}</p>}{error&&<p className={s.formError} role="alert">{error}</p>}</form>}</section>;
}
