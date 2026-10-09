import test,{mock} from 'node:test';
import assert from 'node:assert/strict';
import type {VercelRequest,VercelResponse} from '@vercel/node';
import handler from '../api/workspace';
import {getPool} from '../server/db';
import {createDemo} from '../src/demo';
import type {State} from '../src/domain';

// Exercise the real HTTP handler with deterministic Auth and database boundaries.
// This verifies protocol/transaction decisions, not a hosted PostgreSQL connection.
function fixture(t:test.TestContext){
 process.env.DATABASE_URL='postgres://test:test@localhost/test';
 process.env.VITE_SUPABASE_URL='https://fixture.supabase.co';
 process.env.VITE_SUPABASE_PUBLISHABLE_KEY='fixture-public-key';
 let state=createDemo(),working=state,receipts=new Map<string,string>(),pendingReceipts=new Map<string,string>();
 let email='admin@example.test',authOK=true,failUpdate=false;
 const client={release(){},async query(sql:string,args:unknown[]=[]){
  if(sql==='BEGIN'){working=structuredClone(state);pendingReceipts=new Map(receipts);}
  if(sql.startsWith('SELECT data'))return {rows:[{data:working}],rowCount:1};
  if(sql.startsWith('SELECT actor_id'))return {rows:pendingReceipts.has(String(args[0]))?[{actor_id:pendingReceipts.get(String(args[0]))}]:[],rowCount:pendingReceipts.has(String(args[0]))?1:0};
  if(sql.startsWith('INSERT INTO siparis_private.requests'))pendingReceipts.set(String(args[0]),String(args[1]));
  if(sql.startsWith('UPDATE')){if(failUpdate)throw new Error('fixture unavailable');working=JSON.parse(String(args[0])) as State;}
  if(sql==='COMMIT'){state=working;receipts=pendingReceipts;}
  return {rows:[],rowCount:0};
 }};
 mock.method(getPool(),'connect',async()=>client);
 mock.method(globalThis,'fetch',async()=>new Response(JSON.stringify(authOK?{id:'auth-user',aud:'authenticated',role:'authenticated',email,email_confirmed_at:'2026-10-06T10:00:00Z',created_at:'2026-10-06T10:00:00Z',app_metadata:{},user_metadata:{}}:{message:'Invalid token'}),{status:authOK?200:401,headers:{'Content-Type':'application/json'}}));
 t.after(()=>mock.restoreAll());
 return {get state(){return state;},setEmail(v:string){email=v;},failAuth(){authOK=false;},failWrite(){failUpdate=true;},async call(body?:unknown,token=true,method=body?'POST':'GET'){
  let status=200;let result:unknown;const headers:Record<string,string>={};
  const response={setHeader(k:string,v:string){headers[k]=v;},status(n:number){status=n;return this;},json(v:unknown){result=v;return this;}};
  await handler({method,headers:{...(token?{authorization:'Bearer fixture-token'}:{}),'content-type':'application/json'},body} as VercelRequest,response as unknown as VercelResponse);
  return {status,result:result as {state:State,error?:string},headers};
 }};
}
const command={type:'product.archive',id:'demo-p1'};
test('API validates bearer and HTTP method',async t=>{const f=fixture(t);assert.equal((await f.call(undefined,false)).status,401);assert.equal((await f.call(undefined,true,'DELETE')).status,405);f.failAuth();assert.equal((await f.call()).status,401);});
test('API provides role-filtered response with no-store',async t=>{const f=fixture(t);f.setEmail('production@example.test');const r=await f.call();assert.equal(r.status,200);assert.equal(r.result.state.products.length,0);assert.equal(r.result.state.users.length,1);assert.equal(r.headers['Cache-Control'],'no-store, private');});
test('API rejects stale revision and persists nothing',async t=>{const f=fixture(t);const r=await f.call({requestId:crypto.randomUUID(),revision:10,command});assert.equal(r.status,409);assert.equal(f.state.products[0].active,true);assert.equal(f.state.revision,0);});
test('API repeated request is applied exactly once despite old revision',async t=>{const f=fixture(t);const body={requestId:crypto.randomUUID(),revision:0,command};assert.equal((await f.call(body)).status,200);assert.equal((await f.call(body)).status,200);assert.equal(f.state.revision,1);assert.equal(f.state.audit.length,1);assert.equal(f.state.products[0].active,false);});
test('API request ID is bound to its original actor',async t=>{const f=fixture(t);const body={requestId:crypto.randomUUID(),revision:0,command};await f.call(body);f.setEmail('sales@example.test');assert.equal((await f.call(body)).status,409);assert.equal(f.state.revision,1);});
test('API enforces authorization server-side',async t=>{const f=fixture(t);f.setEmail('sales@example.test');assert.equal((await f.call({requestId:crypto.randomUUID(),revision:0,command})).status,403);assert.equal(f.state.audit.length,0);});
test('API rolls back both record and receipt on failed persistence',async t=>{const f=fixture(t);f.failWrite();const r=await f.call({requestId:crypto.randomUUID(),revision:0,command});assert.equal(r.status,500);assert.equal(f.state.revision,0);assert.equal(f.state.products[0].active,true);});
