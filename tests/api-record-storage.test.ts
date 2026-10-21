import test,{mock} from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {PGlite} from '@electric-sql/pglite';
import {getPool} from '../server/db';import handler from '../api/workspace';
test('real API and migrated Postgres bootstrap admin, poll revision, persist command once and reject stale writes',async()=>{
 const db=new PGlite();try{
  await db.exec('CREATE ROLE anon; CREATE ROLE authenticated;');await db.exec(fs.readFileSync('database/001_workspace.sql','utf8'));await db.exec(fs.readFileSync('database/002_record_storage.sql','utf8'));
  process.env.DATABASE_URL='postgresql://fixture:fixture@localhost/fixture';process.env.VITE_SUPABASE_URL='https://fixture.supabase.co';process.env.VITE_SUPABASE_PUBLISHABLE_KEY='fixture';process.env.BOOTSTRAP_ADMIN_EMAIL='manager@example.test';
  mock.method(getPool(),'connect',async()=>({release(){},query:async(sql:string,args?:any[])=>{const result=await db.query<any>(sql,args);return {...result,rowCount:result.rows.length||result.affectedRows||0};}}));
  mock.method(globalThis,'fetch',async()=>new Response(JSON.stringify({id:'fixture-user',aud:'authenticated',role:'authenticated',email:'manager@example.test',email_confirmed_at:'2026-10-19T08:00:00Z',created_at:'2026-10-19T08:00:00Z',app_metadata:{},user_metadata:{}}),{headers:{'Content-Type':'application/json'}}));
  const call=async(body?:unknown,query={})=>{let status=200,result:any;const response={setHeader(){},status(n:number){status=n;return this;},json(data:unknown){result=data;return this;}};await handler({method:body?'POST':'GET',query,headers:{authorization:'Bearer fixture-token','content-type':'application/json'},body} as any,response as any);return {status,result};};
  const first=await call();assert.equal(first.status,200);assert.equal(first.result.user.role,'admin');assert.equal(first.result.storage.mode,'records');const revision=first.result.state.revision;
  assert.deepEqual((await call(undefined,{knownRevision:String(revision)})).result,{unchanged:true});
  const body={requestId:crypto.randomUUID(),revision,command:{type:'product.save',product:{orderNo:1,code:'SCC22',name:'Test merdiven',price:100,kdvRate:20,active:true}}};
  const saved=await call(body);assert.equal(saved.status,200);assert.equal(saved.result.state.products.length,1);const repeated=await call(body);assert.equal(repeated.status,200);assert.equal(repeated.result.state.products.length,1);assert.equal(repeated.result.documentId,saved.result.documentId);
  assert.equal((await call({...body,requestId:crypto.randomUUID()})).status,409);
  assert.equal((await db.query('SELECT * FROM siparis_private.requests')).rows.length,1);assert.equal((await db.query("SELECT * FROM siparis_private.records WHERE collection='products'")).rows.length,1);
 }finally{mock.restoreAll();await db.close();}
});
