/* eslint-disable @typescript-eslint/no-require-imports */
require('./register-typescript.cjs');
const test=require('node:test'),assert=require('node:assert/strict'),Module=require('node:module');
const original=Module._load;Module._load=function(name,...args){if(name==='server-only')return {};return original.call(this,name,...args);};
const {readPublishedContent}=require('../app/cms/public-content.ts');Module._load=original;
const {hasMediaReference}=require('../app/cms/validation.ts');
const {defaultContent}=require('../app/cms/defaults.ts');
test('a brief content outage retains the last validated published gallery and its image authorization',async()=>{
 const fetch=global.fetch,env={SUPABASE_URL:process.env.SUPABASE_URL,SUPABASE_ANON_KEY:process.env.SUPABASE_ANON_KEY,SUPABASE_SERVICE_ROLE_KEY:process.env.SUPABASE_SERVICE_ROLE_KEY};
 Object.assign(process.env,{SUPABASE_URL:'https://cache-fixture.example',SUPABASE_ANON_KEY:'fixture',SUPABASE_SERVICE_ROLE_KEY:'fixture'});
 try{const gallery={...defaultContent.gallery,title:{en:'Published photo room',es:'Fototeca publicada'},photos:[{id:'memory-fixture',album:'Familia',caption:{en:'Friends',es:'Amigos'},image:{src:'/api/media/11111111-1111-4111-8111-111111111111',width:100,height:100,alt:{en:'Friends',es:'Amigos'}}}]};global.fetch=async()=>Response.json([{key:'gallery',content:gallery}]);await readPublishedContent();global.fetch=async()=>{throw Error('temporary fixture outage');};const content=await readPublishedContent();assert.deepEqual(content.gallery,gallery);assert.ok(hasMediaReference(content,'11111111-1111-4111-8111-111111111111'));}finally{global.fetch=fetch;for(const [key,value] of Object.entries(env)){if(value===undefined)delete process.env[key];else process.env[key]=value;}}
});
test('healthy removals replace the snapshot and a cold or expired instance uses reviewed defaults',async()=>{
 const fetch=global.fetch,now=Date.now,env={SUPABASE_URL:process.env.SUPABASE_URL,SUPABASE_ANON_KEY:process.env.SUPABASE_ANON_KEY,SUPABASE_SERVICE_ROLE_KEY:process.env.SUPABASE_SERVICE_ROLE_KEY};
 Object.assign(process.env,{SUPABASE_URL:'https://cache-fixture.example',SUPABASE_ANON_KEY:'fixture',SUPABASE_SERVICE_ROLE_KEY:'fixture'});
 try{global.fetch=async()=>Response.json([]);assert.deepEqual((await readPublishedContent()).gallery,defaultContent.gallery);global.fetch=async()=>{throw Error('outage');};Date.now=()=>now()+301000;assert.deepEqual((await readPublishedContent()).gallery,defaultContent.gallery);process.env.SUPABASE_URL='https://different-fixture.example';assert.deepEqual((await readPublishedContent()).gallery,defaultContent.gallery);}finally{global.fetch=fetch;Date.now=now;for(const [key,value] of Object.entries(env)){if(value===undefined)delete process.env[key];else process.env[key]=value;}}
});
