import 'server-only';
import { cache } from 'react';
import { connection } from 'next/server';
import { backendConfig, backendFetch } from './backend';
import { defaultContent } from './defaults';
import { contentKeys, type ContentKey, type SiteContent } from './types';
import { validateContent } from './validation';
export async function readPublishedContent(): Promise<SiteContent> {
  if(!backendConfig()) return defaultContent;
  const result={...defaultContent};
  try {
    const rows=await (await backendFetch('/rest/v1/cms_published?select=key,content')).json() as {key:ContentKey;content:SiteContent[ContentKey]}[];
    for(const row of rows) if(contentKeys.includes(row.key)) {
      try { validateContent(row.key,row.content); Object.assign(result,{[row.key]:row.content}); }
      catch { console.error('CMS: invalid published collection',row.key); }
    }
  } catch { console.error('CMS: using reviewed repository content while the service is unavailable'); }
  return result;
}
export const getPublishedContent = cache(async () => {
  if(backendConfig()) await connection();
  return readPublishedContent();
});
