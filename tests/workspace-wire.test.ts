import test,{mock} from 'node:test';import assert from 'node:assert/strict';
import {workspaceResponse} from '../server/workspaceWire';
import {fetchWorkspace} from '../src/workspaceRequest';
import {createDemo} from '../src/demo';
test('large UTF-8 workspace is reassembled without loss and every response remains bounded',async t=>{
 const state=createDemo();state.products=Array.from({length:3000},(_,i)=>({...state.products[0],id:'p'+i,code:'P'+i,name:'İstanbul merdiven 🪜 '.repeat(10)}));const envelope={state,user:state.users[0]};let calls=0;
 mock.method(globalThis,'fetch',async(input:unknown)=>{calls++;const url=new URL(String(input),'https://fixture.test');const payload=workspaceResponse(envelope,Object.fromEntries(url.searchParams));assert.ok(Buffer.byteLength(JSON.stringify(payload))<2_000_000);return new Response(JSON.stringify(payload));});t.after(()=>mock.restoreAll());
 assert.deepEqual(await fetchWorkspace('fixture-token'),envelope);assert.ok(calls>1);
});
test('changing revision between parts rejects mixed snapshots; POST sends only once before read refresh',async t=>{
 const state=createDemo();state.products=Array.from({length:2200},(_,i)=>({...state.products[0],id:'p'+i,code:'P'+i,name:'Ürün'.repeat(50)}));const envelope={state,user:state.users[0]};let posts=0;
 mock.method(globalThis,'fetch',async(input:unknown,options:any)=>{const url=new URL(String(input),'https://fixture.test');if(options.method==='POST'){posts++;return new Response(JSON.stringify(workspaceResponse({...envelope,documentId:'doc-1'},{},true)));}return new Response(JSON.stringify(workspaceResponse(envelope,Object.fromEntries(url.searchParams))));});t.after(()=>mock.restoreAll());
 const result=await fetchWorkspace('fixture-token',{requestId:crypto.randomUUID(),revision:0,command:{type:'product.archive',id:'p1'}});assert.equal(result!.documentId,'doc-1');assert.equal(posts,1);
 assert.throws(()=>workspaceResponse(envelope,{part:1,revision:9}));assert.throws(()=>workspaceResponse(envelope,{part:-1}));
});

test('client refuses to combine chunks after a concurrent workspace update',async t=>{const state=createDemo();state.products=Array.from({length:2200},(_,i)=>({...state.products[0],id:'p'+i,code:'P'+i,name:'Ürün'.repeat(50)}));let reads=0;mock.method(globalThis,'fetch',async()=>{reads++;return reads===1?new Response(JSON.stringify(workspaceResponse({state},{}))):new Response(JSON.stringify({error:'Veri değişti; yenileyin.'}),{status:409});});t.after(()=>mock.restoreAll());await assert.rejects(fetchWorkspace('fixture-token'),/Veri değişti/);assert.equal(reads,2);});

