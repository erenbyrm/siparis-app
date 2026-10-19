import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {PGlite} from '@electric-sql/pglite';
import {createDemo} from '../src/demo';import {execute,validateState} from '../src/domain';
import {splitWorkspace,readWorkspace,writeWorkspace} from '../server/workspaceStorage';
test('real Postgres migrates old state once, preserves recovery snapshot and writes only changed records',async()=>{
 const db=new PGlite();try{
  await db.exec('CREATE ROLE anon; CREATE ROLE authenticated;');await db.exec(fs.readFileSync('database/001_workspace.sql','utf8'));
  const original=createDemo();await db.query('INSERT INTO siparis_private.workspace(id,data) VALUES(true,$1)',[JSON.stringify(original)]);
  const sql=fs.readFileSync('database/002_record_storage.sql','utf8');await db.exec(sql);
  const header=(await db.query<{data:unknown}>('SELECT data FROM siparis_private.workspace')).rows[0].data;
  const loaded=await readWorkspace(db,header);assert.deepEqual(loaded,original);validateState(loaded);
  assert.deepEqual((await db.query<{data:unknown}>('SELECT data FROM siparis_private.migration_backup')).rows[0].data,original);
  await db.exec(sql);assert.deepEqual(await readWorkspace(db,(await db.query<{data:unknown}>('SELECT data FROM siparis_private.workspace')).rows[0].data),original);
  const next=execute(loaded,'demo-admin',{type:'product.archive',id:'demo-p1'});
  const changes:any[]=[];const client={query:async(q:string,args?:any[])=>{if(q.startsWith('INSERT INTO siparis_private.records'))changes.push(...JSON.parse(args![0]));return db.query<any>(q,args);}};
  await db.exec('BEGIN');await writeWorkspace(client,loaded,next,true);await db.exec('COMMIT');
  assert.equal(changes.filter(r=>r.collection==='products').length,1);assert.equal(changes.find(r=>r.collection==='products').id,'demo-p1');
  const saved=await readWorkspace(db,(await db.query<{data:unknown}>('SELECT data FROM siparis_private.workspace')).rows[0].data);assert.deepEqual(saved,next);
  const failed=execute(saved,'demo-admin',{type:'product.archive',id:'demo-p2'});await db.exec('BEGIN');await writeWorkspace(db,saved,failed,true);await db.exec('ROLLBACK');
  assert.deepEqual(await readWorkspace(db,(await db.query<{data:unknown}>('SELECT data FROM siparis_private.workspace')).rows[0].data),next);
  const security=await db.query<{relrowsecurity:boolean}>("SELECT relrowsecurity FROM pg_class WHERE oid='siparis_private.records'::regclass");assert.equal(security.rows[0].relrowsecurity,true);
  await db.exec('SET ROLE anon');await assert.rejects(()=>db.query('SELECT * FROM siparis_private.records'));await db.exec('RESET ROLE');
 }finally{await db.close();}
});
test('empty database migration supports bootstrap and complete records above former 2 MB ceiling',async()=>{
 const db=new PGlite();try{
  await db.exec('CREATE ROLE anon; CREATE ROLE authenticated;');await db.exec(fs.readFileSync('database/001_workspace.sql','utf8'));await db.exec(fs.readFileSync('database/002_record_storage.sql','utf8'));
  const empty=await readWorkspace(db,(await db.query<{data:unknown}>('SELECT data FROM siparis_private.workspace')).rows[0].data);assert.equal(empty.schemaVersion,2);assert.equal(empty.users.length,0);
  let state=createDemo();state.products=Array.from({length:6500},(_,n)=>({...state.products[0],id:'p'+n,code:'P'+n,name:'Merdiven '.repeat(20),orderNo:n+1}));
  assert.ok(Buffer.byteLength(JSON.stringify(state))>2_000_000);assert.throws(()=>execute(state,'demo-admin',{type:'product.archive',id:'p1'}));
  state=execute(state,'demo-admin',{type:'product.archive',id:'p1'},undefined,undefined,{maxBytes:32_000_000});
  await db.exec('BEGIN');await writeWorkspace(db,empty,state,true);await db.exec('COMMIT');
  const saved=await readWorkspace(db,(await db.query<{data:unknown}>('SELECT data FROM siparis_private.workspace')).rows[0].data);assert.equal(saved.products.length,6500);assert.equal(saved.products[1].active,false);validateState(saved);
  const {header}=splitWorkspace(saved);assert.ok(Buffer.byteLength(JSON.stringify(header))<2000);
 }finally{await db.close();}
});
