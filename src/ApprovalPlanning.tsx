import {useEffect,useMemo,useState} from 'react';
import type {Order} from './domain';
import {buildProductionPlan,productionConfigOf,todayInTurkey,addWorkingDays,productionDeadline} from './production';
import {useStore} from './store';
import {Field} from './ui';
export const calendarDate=(value:string)=>new Intl.DateTimeFormat('tr-TR',{dateStyle:'medium',timeZone:'UTC'}).format(new Date(value+'T12:00:00Z'));
export function ApprovalPlanning({order}:{order:Order}){
 const {state,run,busy}=useStore(),config=productionConfigOf(state!);
 const [deliveryDate,setDate]=useState(order.deliveryDate??addWorkingDays(todayInTurkey(),1,config));
 const [acceptRisk,setAcceptRisk]=useState(false);
 useEffect(()=>setAcceptRisk(false),[deliveryDate,state!.revision]);
 const forecast=useMemo(()=>/^\d{4}-\d{2}-\d{2}$/.test(deliveryDate)?buildProductionPlan(state!,todayInTurkey(),{...order,deliveryDate}):null,[state,order,deliveryDate]);
 const result=forecast?.orders.find(o=>o.orderId===order.id);
 const issues=forecast?.issues.filter(i=>i.orderId===order.id)??[];
 const late=forecast?.orders.filter(o=>o.late)??[];
 const unknownActual=!!forecast?.issues.length;
 const risk=!!(issues.length||late.length||unknownActual);
 const approving=order.status==='Yönetici Onayı Bekleniyor';
 return <form className="approval-planning" onSubmit={async e=>{e.preventDefault();await run({type:approving?'order.approve':'order.reschedule',id:order.id,deliveryDate,acceptPlanRisk:acceptRisk});}}>
  <h3>{approving?'Yönetici onayı ve teslim planı':'Teslim tarihini düzenle'}</h3>
  <Field label="Müşteriye teslim tarihi"><input type="date" value={deliveryDate} min={todayInTurkey()} required onChange={e=>setDate(e.target.value)}/></Field>
  {forecast&&<div className="plan-forecast"><p>En geç üretim / çıkış: <strong>{calendarDate(productionDeadline(deliveryDate,config))}</strong></p>
   <p>Kapasiteye göre tahmini teslim: <strong>{result?.expectedDeliveryDate&&!result.incomplete?calendarDate(result.expectedDeliveryDate):'Eksik kapasite bilgisi nedeniyle kesinleşmedi'}</strong></p>
   {issues.map((i,n)=><p key={n} className="plan-warning">{i.code}: {i.reason}</p>)}
   {late.length>0&&<p className="plan-warning">Bu seçimle programdaki {late.length} siparişin teslim tarihi yetişmiyor.{result?.late?' Bu sipariş de gecikme riski taşıyor.':''} Üretim programında ayrıntıları inceleyin.</p>}
   {unknownActual&&<p className="plan-warning">Programda eksik kapasite / tarih bilgisi var. Doluluk olduğundan düşük görünebilir.</p>}
  </div>}
  <p className="muted small">Tahmin, hazır olduğu gün çıkış yapıldığını ve çalışma günlerine göre {config.transportDays} iş günü taşımayı varsayar. Bu onay sevkiyat kaydı oluşturmaz.</p>
  {risk&&<label className="check"><input type="checkbox" checked={acceptRisk} onChange={e=>setAcceptRisk(e.target.checked)}/>Eksik kapasite / gecikme uyarısını gördüm; bu tarihi yine de onaylıyorum.</label>}
  <button className="primary" disabled={busy||!deliveryDate||(risk&&!acceptRisk)}>{approving?'Tarihle birlikte yönetici onayla':'Teslim tarihini kaydet'}</button>
 </form>;
}
