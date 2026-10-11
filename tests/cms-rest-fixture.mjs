// Local contract fixture only. Production never imports this file.
// SQL/RLS is tested separately; this fixture exercises actual Next HTTP/UI flows.
import http from 'node:http';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);require('./register-typescript.cjs');
const {defaultContent}=require('../app/cms/defaults.ts');
export function startCmsFixture(port=3060) {
 const documents=new Map(),history=[],files=new Map();let sequence=0;
 const members={admin:{id:'11111111-1111-4111-8111-111111111111',role:'admin'},editor:{id:'22222222-2222-4222-8222-222222222222',role:'editor'},visitor:{id:'33333333-3333-4333-8333-333333333333',role:null}};
 const server=http.createServer(async(req,res)=>{
  const url=new URL(req.url,'http://127.0.0.1'),token=req.headers.authorization?.replace('Bearer ',''),member=Object.entries(members).find(([name])=>token===`fixture-${name}`)?.[1];
  const json=(data,status=200)=>{res.writeHead(status,{'Content-Type':'application/json'});res.end(JSON.stringify(data));};
  const chunks=[];for await(const chunk of req)chunks.push(chunk);const bytes=Buffer.concat(chunks);let body;try{body=bytes.length?JSON.parse(bytes):{};}catch{body={};}
  if(url.pathname==='/auth/v1/token') {
   const name=url.searchParams.get('grant_type')==='refresh_token'?String(body.refresh_token).replace('refresh-',''):String(body.email).split('@')[0];
   if(!members[name] || (url.searchParams.get('grant_type')==='password'&&body.password!=='fixture-only-password'))return json({message:'Invalid login'},400);
   return json({access_token:`fixture-${name}`,refresh_token:`refresh-${name}`,expires_in:3600});
  }
  if(url.pathname==='/auth/v1/user')return member?json({id:member.id,email:Object.entries(members).find(([,v])=>v===member)[0]+'@example.com'}):json({message:'Invalid session'},401);
  if(url.pathname==='/auth/v1/logout')return json({});
  if(url.pathname==='/rest/v1/cms_published')return json([...documents.values()].filter(d=>d.published!==null).map(d=>({key:d.key,content:d.published,published_version:d.published_version})));
  if(url.pathname.startsWith('/storage/v1/object/')) {
   if(token!=='fixture-service-key')return json({},403);
   const filename=url.pathname.split('/').at(-1);
   if(req.method==='POST'){files.set(filename,bytes);return json({Key:filename});}
   if(!files.has(filename))return json({},404);
   res.writeHead(200,{'Content-Type':'image/webp'});return res.end(files.get(filename));
  }
  if(!member?.role)return json({},403);
  if(url.pathname==='/rest/v1/cms_members')return json([{role:member.role}]);
  const key=url.searchParams.get('key')?.replace('eq.','');
  if(url.pathname==='/rest/v1/cms_documents')return json(documents.has(key)?[documents.get(key)]:[]);
  if(url.pathname==='/rest/v1/cms_history')return json(history.filter(h=>h.key===key).slice(-30).reverse());
  if(url.pathname==='/rest/v1/rpc/cms_write') {
   if(body.p_publish&&member.role!=='admin')return json({},403);
   if(body.p_publish&&['events','culture'].includes(body.p_key)){const other=body.p_key==='events'?'culture':'events',entries=documents.get(other)?.published??defaultContent[other];if(body.p_content.some(item=>entries.some(other=>other.id===item.id||other.slug===item.slug)))return json({code:'23514'},400);}
   const old=documents.get(body.p_key);if((old?.version??0)!==body.p_version)return json({code:'40001'},409);
   const version=(old?.version??0)+1,doc={key:body.p_key,draft:body.p_content,published:body.p_publish?body.p_content:old?.published??null,version,published_version:body.p_publish?version:old?.published_version??0,updated_at:new Date().toISOString()};
   documents.set(body.p_key,doc);history.push({id:++sequence,key:doc.key,content:doc.draft,action:body.p_publish?'publish':'save',version,created_at:doc.updated_at});return json([doc]);
  }
  json({},404);
 });
 return new Promise(resolve=>server.listen(port,'127.0.0.1',()=>resolve({server,documents,history,files})));
}
if(import.meta.url===`file://${process.argv[1]}`){await startCmsFixture(Number(process.env.FIXTURE_PORT||3060));console.log('Local CMS REST fixture ready');}
