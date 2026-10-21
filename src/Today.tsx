import {t} from './localization';
import {useMemo} from 'react';
import {AlertTriangle,CheckCircle2,ClipboardCheck,Factory,PackageCheck,Truck} from 'lucide-react';
import {buildProductionPlan,todayInTurkey} from './production';
import {useStore} from './store';
import {nextOrderStep} from './workflowView';
import {Section,Empty,StatusBadge} from './ui';
import {shortNumber} from './outputs';
import {calendarDate} from './ApprovalPlanning';

type Destination='approvals'|'orders'|'production'|'warehouse'|'count'|'requests';
export function Today({onNavigate}:{onNavigate:(tab:Destination)=>void}){
 const {state,user}=useStore(),s=state!,role=user!.role,today=todayInTurkey();
 const open=s.orders.filter(o=>!['Tamamlandı','İptal'].includes(o.status));
 const awaitingApproval=open.filter(o=>o.status==='Yönetici Onayı Bekleniyor').length+(s.stockRequests??[]).filter(r=>r.status==='Onay bekliyor').length+(s.inventory?.adjustments??[]).filter(a=>a.status==='pending').length+(s.inventory?.discrepancies??[]).filter(d=>d.status==='pending').length;
 const productionCount=open.reduce((n,o)=>n+o.items.reduce((a,i)=>a+i.pendingQuantity,0),0)+(s.stockRequests??[]).filter(r=>['Onaylandı','Üretimde'].includes(r.status)).reduce((n,r)=>n+r.items.reduce((a,i)=>a+i.quantity-i.producedQuantity,0),0);
 const awaitingReceipt=open.reduce((n,o)=>n+o.items.reduce((a,i)=>a+(i.awaitingReceiptQuantity??0),0),0)+(s.inventory?.batches??[]).reduce((n,b)=>n+b.quantity-b.receivedQuantity-(b.rejectedQuantity??0),0);
 const ready=open.reduce((n,o)=>n+o.items.reduce((a,i)=>a+i.readyForShipmentQuantity,0),0);
 const lateIds=useMemo(()=>{const ids=new Set<string>(open.filter(o=>o.deliveryDate&&o.deliveryDate<today).map(o=>o.id));if(role==='admin'||role==='uretim')for(const result of (s.productionPlan??buildProductionPlan(s,today)).orders)if(result.late)ids.add(result.orderId);return ids;},[s,role,today]);
 const cards=role==='admin'?
  [{label:'Onay bekleyen',value:awaitingApproval,dest:'approvals' as const,icon:<ClipboardCheck/>},{label:'Üretilecek adet',value:productionCount,dest:'production' as const,icon:<Factory/>},{label:'Depo kabulü bekleyen',value:awaitingReceipt,dest:'warehouse' as const,icon:<PackageCheck/>},{label:'Sevke hazır adet',value:ready,dest:'orders' as const,icon:<Truck/>}]:
  role==='pazarlamaci'?[{label:'Müşteri onayı bekleyen',value:open.filter(o=>o.status==='Müşteriden Onay Bekleniyor').length,dest:'orders' as const,icon:<ClipboardCheck/>},{label:'Açık sipariş',value:open.length,dest:'orders' as const,icon:<CheckCircle2/>}]:
  role==='uretim'?[{label:'Üretilecek adet',value:productionCount,dest:'production' as const,icon:<Factory/>},{label:'Açık stok talebi',value:(s.stockRequests??[]).filter(r=>['Onaylandı','Üretimde'].includes(r.status)).length,dest:'requests' as const,icon:<ClipboardCheck/>}]:
  [{label:'Depo kabulü bekleyen',value:awaitingReceipt,dest:'warehouse' as const,icon:<PackageCheck/>},{label:'Sevke hazır adet',value:ready,dest:'orders' as const,icon:<Truck/>},{label:'Sayım onayı bekleyen',value:(s.inventory?.adjustments??[]).filter(a=>a.status==='pending').length,dest:'count' as const,icon:<ClipboardCheck/>}];
 const priority=open.filter(o=>role==='pazarlamaci'?['Müşteriden Onay Bekleniyor','Yönetici Onayı Bekleniyor'].includes(o.status):role==='uretim'?o.items.some(i=>i.pendingQuantity>0):role==='sevkiyat'?o.items.some(i=>(i.awaitingReceiptQuantity??0)>0||i.readyForShipmentQuantity>0):true).sort((a,b)=>Number(lateIds.has(b.id))-Number(lateIds.has(a.id))||(a.deliveryDate??'9999').localeCompare(b.deliveryDate??'9999')).slice(0,8);
 return <Section title={t("Bugün yapılacaklar")} description={t("Rolünüze göre bekleyen işleri ve sıradaki adımları tek yerde görün.")}>
  <div className="today-metrics">{cards.map(card=><button key={card.label} onClick={()=>onNavigate(card.dest)}><span>{card.icon}</span><strong>{card.value}</strong><small>{t(card.label)}</small></button>)}</div>
  {lateIds.size>0&&<div className="alert error"><span><AlertTriangle size={18}/>{t(" Teslim tarihi riski olan ")}{lateIds.size}{t(" açık iş var.")}</span><button onClick={()=>onNavigate(role==='uretim'||role==='admin'?'production':'orders')}>{t("İncele")}</button></div>}
  <div className="surface today-list"><h2>{t("Öncelikli işler")}</h2>{priority.map(o=>{const step=nextOrderStep(o);return <button key={o.id} onClick={()=>onNavigate('orders')}><div><strong>{o.customer.company||o.customer.name}</strong><small>{shortNumber(o.number)}{o.deliveryDate?t(" · Teslim ")+calendarDate(o.deliveryDate):''}</small></div><div><StatusBadge status={o.status}/>{lateIds.has(o.id)&&<small className="plan-warning">{t("Teslim riski")}</small>}<small>{t(step.label)}</small></div></button>;})}{!priority.length&&<Empty>{t("Şu anda rolünüze atanmış bekleyen iş yok.")}</Empty>}</div>
 </Section>;
}
