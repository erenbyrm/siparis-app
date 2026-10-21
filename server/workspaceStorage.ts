import type {State} from '../src/domain.js';
export const collections=['products','customers','users','orders','audit','stockRequests','inventory.movements','inventory.batches','inventory.adjustments','inventory.discrepancies','documentBook.brands','documentBook.records'] as const;
type Queryable={query:(sql:string,values?:any[])=>Promise<{rows:any[]}>};
type RecordRow={collection:string,id:string,position:number,payload:unknown};
export type StoredWorkspace={storageVersion:1,meta:Record<string,any>,collections:string[]};
export function splitWorkspace(state:State){
 const meta=structuredClone(state) as Record<string,any>,rows:RecordRow[]=[],present:string[]=[];
 delete meta.stockSummary;delete meta.productionPlan;
 for(const collection of collections){const path=collection.split('.');const parent=path.length===1?meta:meta[path[0]];const key=path.at(-1)!;const list=parent?.[key];if(!Array.isArray(list))continue;
  present.push(collection);list.forEach((payload,position)=>{if(!payload.id||typeof payload.id!=='string')throw new Error('Kayıt kimliği eksik.');rows.push({collection,id:payload.id,position,payload});});delete parent[key];
 }
 return {header:{storageVersion:1 as const,meta,collections:present},rows};
}
export const isRecordWorkspace=(data:any):data is StoredWorkspace=>data?.storageVersion===1&&data.meta&&Array.isArray(data.collections);
export async function readWorkspace(client:Queryable,data:unknown):Promise<State>{
 if(!isRecordWorkspace(data))return data as State;
 const state=structuredClone(data.meta);
 for(const name of data.collections){if(!collections.includes(name as typeof collections[number]))throw new Error('Desteklenmeyen veri koleksiyonu.');const path=name.split('.'),parent=path.length===1?state:(state[path[0]]??={});parent[path.at(-1)!]=[];}
 const result=await client.query('SELECT collection,id,position,payload FROM siparis_private.records ORDER BY collection,position');
 for(const row of result.rows){if(!data.collections.includes(row.collection))throw new Error('Çalışma alanına ait olmayan veri koleksiyonu.');const path=row.collection.split('.'),parent=path.length===1?state:state[path[0]];parent[path.at(-1)!].push(row.payload);}
 return state as State;
}
export async function writeWorkspace(client:Queryable,before:State,next:State,recordMode:boolean){
 if(!recordMode){await client.query('UPDATE siparis_private.workspace SET data=$1,updated_at=now() WHERE id=true',[JSON.stringify(next)]);return;}
 const old=splitWorkspace(before),updated=splitWorkspace(next),key=(r:RecordRow)=>r.collection+'|'+r.id,previous=new Map(old.rows.map(r=>[key(r),r]));
 const changed=updated.rows.filter(r=>{const p=previous.get(key(r));previous.delete(key(r));return !p||p.position!==r.position||JSON.stringify(p.payload)!==JSON.stringify(r.payload);});
 if(changed.length)await client.query('INSERT INTO siparis_private.records (collection,id,position,payload) SELECT collection,id,position,payload FROM jsonb_to_recordset($1::jsonb) AS x(collection text,id text,position integer,payload jsonb) ON CONFLICT (collection,id) DO UPDATE SET position=EXCLUDED.position,payload=EXCLUDED.payload',[JSON.stringify(changed)]);
 if(previous.size)await client.query('DELETE FROM siparis_private.records r USING jsonb_to_recordset($1::jsonb) AS x(collection text,id text) WHERE r.collection=x.collection AND r.id=x.id',[JSON.stringify([...previous.values()].map(({collection,id})=>({collection,id})))]);
 await client.query('UPDATE siparis_private.workspace SET data=$1,updated_at=now() WHERE id=true',[JSON.stringify(updated.header)]);
}
