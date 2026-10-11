'use client';
import { createContext, useContext, type ReactNode } from 'react';
import type { SiteContent } from '../cms/types';
import { defaultContent } from '../cms/defaults';
const ContentContext=createContext<SiteContent>(defaultContent);
export function ContentProvider({content,children}:{content:SiteContent;children:ReactNode}) {return <ContentContext.Provider value={content}>{children}</ContentContext.Provider>;}
export function useContent(){return useContext(ContentContext);}
export function emailHref(email:string){return `mailto:${email}?subject=${encodeURIComponent('Join NC Latin Club')}&body=${encodeURIComponent('hey! I want to join to NCLatin Club!')}`;}
