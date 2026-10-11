/* eslint-disable @typescript-eslint/no-require-imports -- real TypeScript with mocked server request boundaries */
require('./register-typescript.cjs');
const test=require('node:test'),assert=require('node:assert/strict'),Module=require('node:module');
const original=Module._load,stored=new Map(),writes=[];
Module._load=function(name,...args){if(name==='server-only')return {};if(name==='next/headers')return {cookies:async()=>({get:key=>stored.has(key)?{value:stored.get(key)}:undefined,set:(...args)=>writes.push(args),delete:key=>stored.delete(key)})};return original.call(this,name,...args);};
const {signIn,requireSession}=require('../app/cms/auth.ts');
Module._load=original;
const env={SUPABASE_URL:'https://fixture.example',SUPABASE_ANON_KEY:'fixture',SUPABASE_SERVICE_ROLE_KEY:'fixture'};
async function withBackend(fn){const previous={...process.env},fetch=global.fetch;Object.assign(process.env,env);stored.clear();writes.length=0;try{await fn();}finally{global.fetch=fetch;for(const key of Object.keys(env)){if(previous[key]===undefined)delete process.env[key];else process.env[key]=previous[key];}}}
test('HTTPS proxy login and refresh always use Secure session cookies',()=>withBackend(async()=>{
 global.fetch=async url=>Response.json(String(url).includes('/token')?{access_token:'good',refresh_token:'good-refresh',expires_in:3600}:String(url).includes('/user')?{id:'admin',email:'admin@example.com'}:[{role:'admin'}]);
 const request=new Request('http://localhost/api/admin/session',{headers:{host:'club.example','x-forwarded-proto':'https'}});
 await signIn('admin@example.com','fixture',request);assert.ok(writes.every(([, ,options])=>options.secure));
 writes.length=0;stored.set('nc-admin-refresh','good-refresh');await requireSession(request);assert.ok(writes.every(([, ,options])=>options.secure));
}));
test('expired access and revoked refresh return signed-out and clear both cookies',()=>withBackend(async()=>{
 stored.set('nc-admin-access','expired');stored.set('nc-admin-refresh','revoked');
 global.fetch=async url=>Response.json(String(url).includes('/token')?{code:'refresh_token_not_found'}:{message:'expired'},{status:String(url).includes('/token')?400:401});
 await assert.rejects(requireSession(new Request('https://club.example/api/admin/session')),error=>error.status===401);assert.equal(stored.size,0);
}));
test('refresh outages stay unavailable rather than signing the visitor out',()=>withBackend(async()=>{
 stored.set('nc-admin-refresh','valid');global.fetch=async()=>{throw Error('fixture network unavailable');};
 await assert.rejects(requireSession(new Request('https://club.example/api/admin/session')),error=>error.status===503);assert.equal(stored.size,1);
}));
