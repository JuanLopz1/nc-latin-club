import 'server-only';
import { CmsError } from './security';
export function backendConfig() {
  const url = process.env.SUPABASE_URL?.replace(/\/$/,'');
  const anon = process.env.SUPABASE_ANON_KEY, service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !anon || !service) return null;
  try { const parsed = new URL(url); if(parsed.protocol!=='https:' && !['localhost','127.0.0.1'].includes(parsed.hostname)) return null; } catch { return null; }
  return { url, anon, service };
}
export async function backendFetch(path: string, init: RequestInit = {}, token?: string, privileged = false) {
  const config = backendConfig();
  if(!config) throw new CmsError(503,'Supabase is not connected yet. Follow the admin setup guide.');
  const key = privileged ? config.service : config.anon;
  let response: Response;
  try { response = await fetch(config.url+path,{...init,cache:'no-store',signal:AbortSignal.timeout(10000),headers:{apikey:key,Authorization:`Bearer ${token ?? key}`,...init.headers}}); }
  catch { throw new CmsError(503,'The content service is unavailable. No changes were confirmed.'); }
  if(!response.ok) {
    const details=await response.json().catch(()=>({}));
    if(path.startsWith('/auth/v1/token?grant_type=refresh_token') && [400,401,403].includes(response.status)) throw new CmsError(401,'Please sign in again.');
    if(details.code==='23514') throw new CmsError(422,'An event or cultural date uses an existing identifier or URL. Choose unique IDs and slugs.');
    if(details.code==='40001') throw new CmsError(409,'Another editor changed this collection. Reload it before saving.');
    if(response.status===401 || response.status===403) throw new CmsError(response.status,'Your session or permissions do not allow this operation.');
    throw new CmsError(502,'The content service could not complete this operation. Check the Supabase setup.');
  }
  return response;
}
export async function rpc(name: string, body: unknown, token: string) {
  return (await backendFetch(`/rest/v1/rpc/${name}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)},token)).json();
}
