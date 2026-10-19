import {z} from 'zod';
import type {State,Order} from './domain.js';
const id=z.string().min(1).max(100),qty=z.number().int().min(0).max(1_000_000),positive=qty.min(1);
export const discrepancySchema=z.object({id,number:z.string().optional(),reviewNumber:z.string().optional(),source:z.enum(['order','batch']),referenceId:id,productId:id,quantity:positive,expectedAwaiting:qty,reason:z.string().min(1).max(200),requestedBy:z.string(),createdAt:z.iso.datetime(),status:z.enum(['pending','approved','rejected']),reviewedBy:z.string().optional(),reviewedAt:z.iso.datetime().optional()});
export const inventorySchema=z.object({
 discrepancies:z.array(discrepancySchema).max(10000).optional(),
 movements:z.array(z.object({id,number:z.string().max(120).optional(),productId:id,quantity:z.number().int().min(-1_000_000).max(1_000_000),kind:z.enum(['receipt','stockReceipt','shipment','adjustment']),reference:id,at:z.iso.datetime(),actor:z.string().max(200),reason:z.string().max(500)})).max(30000),
 batches:z.array(z.object({id,requestId:z.string().optional(),number:z.string().max(120).optional(),productId:id,quantity:positive,receivedQuantity:qty,rejectedQuantity:qty.optional(),createdAt:z.iso.datetime(),createdBy:z.string().max(200),dailyCapacity:positive.optional(),resourceId:id.optional()})).max(10000),
 adjustments:z.array(z.object({id,number:z.string().max(120).optional(),reviewNumber:z.string().max(120).optional(),productId:id,countedQuantity:qty,expectedOnHand:qty,reason:z.string().min(1).max(500),requestedBy:z.string().max(200),createdAt:z.iso.datetime(),status:z.enum(['pending','approved','rejected']),reviewedBy:z.string().max(200).optional(),reviewedAt:z.iso.datetime().optional()})).max(10000)
});
export type StockRow={id:string,code:string,name:string,onHand:number,reserved:number,available:number,awaiting:number,active:boolean};
export const openOrder=(o:Order)=>['Yönetici Onayladı','Hazırlanıyor','Sevkiyata Hazır'].includes(o.status);
export function ensureInventory(s:State){
 if(s.inventory)return;
 s.inventory={movements:[],batches:[],adjustments:[]};
 // Old ready quantities have never been counted by a warehouse worker.
 for(const o of s.orders)if(openOrder(o)){
  for(const i of o.items){i.awaitingReceiptQuantity=(i.awaitingReceiptQuantity??0)+i.readyForShipmentQuantity;i.readyForShipmentQuantity=0;}
  if(o.status==='Sevkiyata Hazır')o.status='Hazırlanıyor';
 }
}
export function stockRows(s:State):StockRow[]{
 const products=new Map(s.products.map(p=>[p.id,p]));for(const o of s.orders)for(const i of o.items)if(!products.has(i.id))products.set(i.id,i);
 return [...products.values()].map(p=>{const onHand=(s.inventory?.movements??[]).filter(m=>m.productId===p.id).reduce((n,m)=>n+m.quantity,0),reserved=s.orders.filter(openOrder).reduce((n,o)=>n+o.items.filter(i=>i.id===p.id).reduce((a,i)=>a+i.readyForShipmentQuantity,0),0),awaiting=s.orders.filter(openOrder).reduce((n,o)=>n+o.items.filter(i=>i.id===p.id).reduce((a,i)=>a+(i.awaitingReceiptQuantity??0),0),0)+(s.inventory?.batches??[]).filter(b=>b.productId===p.id).reduce((n,b)=>n+b.quantity-b.receivedQuantity-(b.rejectedQuantity??0),0);return {id:p.id,code:p.code,name:p.name,active:p.active,onHand,reserved,available:onHand-reserved,awaiting};});
}
export function reserveStock(s:State,order:Order){
 const available=new Map(stockRows(s).map(p=>[p.id,p.available]));let total=0;
 for(const i of order.items){const count=Math.min(i.pendingQuantity,Math.max(0,available.get(i.id)??0));i.pendingQuantity-=count;i.readyForShipmentQuantity+=count;available.set(i.id,(available.get(i.id)??0)-count);total+=count;}
 return total;
}
export function stockMovement(s:State,productId:string,quantity:number,kind:NonNullable<State['inventory']>['movements'][number]['kind'],reference:string,at:string,actor:string,reason=''){
 s.inventory!.movements.push({id:crypto.randomUUID(),productId,quantity,kind,reference,at,actor,reason});
}
export function assertInventory(s:State){
 if(!s.inventory)return;
 const discrepancies=s.inventory.discrepancies??[];
 if(new Set(discrepancies.map(d=>d.id)).size!==discrepancies.length)throw new Error('Yinelenen eksik kabul bildirimi.');
 const pending=new Set<string>();
 for(const d of discrepancies){
  if(d.quantity>d.expectedAwaiting)throw new Error('Eksik adet kabul bekleyeni aşamaz.');
  const key=d.source+':'+d.referenceId+':'+d.productId;
  if(d.status==='pending'){if(pending.has(key))throw new Error('Yinelenen bekleyen eksik kabul bildirimi.');pending.add(key);}
  if(d.source==='order'?!s.orders.some(o=>o.id===d.referenceId&&o.items.some(i=>i.id===d.productId)):!s.inventory.batches.some(b=>b.id===d.referenceId&&b.productId===d.productId))throw new Error('Eksik kabul kaynağı bulunamadı.');
 }
 for(const list of [s.inventory.movements,s.inventory.batches,s.inventory.adjustments])if(new Set(list.map(x=>x.id)).size!==list.length)throw new Error('Yinelenen depo kayıt kimliği.');
 const ids=new Set(stockRows(s).map(p=>p.id));
 for(const m of [...s.inventory.movements,...s.inventory.batches,...s.inventory.adjustments])if(!ids.has(m.productId))throw new Error('Depo kaydının ürünü bulunamadı.');
 for(const p of stockRows(s))if(p.onHand<0||p.onHand>1_000_000||p.reserved>p.onHand)throw new Error(p.code+': depo stoğu negatif, sınır üstünde veya ayrılan miktardan az olamaz.');
 if(new Set((s.stockRequests??[]).map(r=>r.id)).size!==(s.stockRequests??[]).length||new Set((s.stockRequests??[]).map(r=>r.number)).size!==(s.stockRequests??[]).length)throw new Error('Yinelenen stok talebi.');
 for(const b of s.inventory.batches)if(b.requestId&&!s.stockRequests?.some(r=>r.id===b.requestId&&r.items.some(i=>i.id===b.productId)))throw new Error('Üretimin stok talebi bulunamadı.');
 for(const r of s.stockRequests??[]){if(new Set(r.items.map(i=>i.id)).size!==r.items.length)throw new Error('Talepte yinelenen ürün.');for(const i of r.items)if(i.producedQuantity>i.quantity||i.producedQuantity!==s.inventory.batches.filter(b=>b.requestId===r.id&&b.productId===i.id).reduce((n,b)=>n+b.quantity-(b.rejectedQuantity??0),0))throw new Error('Stok talebi üretim miktarı tutarsız.');}
 for(const b of s.inventory.batches)if(b.receivedQuantity+(b.rejectedQuantity??0)>b.quantity)throw new Error('Teslim alınan miktar üretim miktarını aşamaz.');
}
