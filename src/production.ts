import type {State,Order} from './domain';

export type ProductionConfig={resources:{id:string,name:string}[],workDays:number[],transportDays:number,closedDates:string[]};
export type ProductionAllocation={orderId:string,orderNumber:string,lineId:string,code:string,name:string,resourceId:string,date:string,quantity:number,dailyCapacity:number,load:number,productionDeadline:string,late:boolean,completed:boolean};
export type ProductionIssue={orderId:string,orderNumber:string,code:string,quantity:number,reason:string};
export type ProductionResult={orderId:string,orderNumber:string,deliveryDate?:string,expectedDeliveryDate?:string,late:boolean,incomplete:boolean};
export type ProductionPlan={today:string,configured:boolean,allocations:ProductionAllocation[],issues:ProductionIssue[],orders:ProductionResult[],dates:string[]};
export const todayInTurkey=(value=new Date().toISOString())=>new Intl.DateTimeFormat('en-CA',{year:'numeric',month:'2-digit',day:'2-digit',timeZone:'Europe/Istanbul'}).format(new Date(value));
export const defaultProductionConfig=():ProductionConfig=>({resources:[{id:'main-line',name:'Ortak üretim hattı'}],workDays:[1,2,3,4,5],transportDays:1,closedDates:[]});
export const productionConfigOf=(state:State)=>state.productionConfig??defaultProductionConfig();
export function addCalendarDays(date:string,days:number){const d=new Date(date+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+days);return d.toISOString().slice(0,10);}
export function isWorkingDay(date:string,config:ProductionConfig){const day=new Date(date+'T12:00:00Z').getUTCDay()||7;return config.workDays.includes(day)&&!config.closedDates.includes(date);}
export function addWorkingDays(date:string,days:number,config:ProductionConfig){let result=date,remaining=Math.abs(days),guard=0;while(remaining&&guard++<1000){result=addCalendarDays(result,Math.sign(days));if(isWorkingDay(result,config))remaining--;}return result;}
export function productionDeadline(deliveryDate:string,config:ProductionConfig){let date=addWorkingDays(deliveryDate,-config.transportDays,config);for(let n=0;n<366&&!isWorkingDay(date,config);n++)date=addCalendarDays(date,-1);return date;}

// Earliest promised delivery first; each resource has one full workday per date.
// Different products on the same resource consume quantity / product daily capacity.
// Remaining quantities only: goods already ready/shipped never reserve future time.
export function buildProductionPlan(state:State,today=todayInTurkey(),candidate?:Order):ProductionPlan{
 const config=productionConfigOf(state);
 const plan:ProductionPlan={today,configured:true,allocations:[],issues:[],orders:[],dates:[]};
 const orders=state.orders.filter(o=>['Yönetici Onayladı','Hazırlanıyor','Sevkiyata Hazır'].includes(o.status)&&o.id!==candidate?.id);
 if(candidate)orders.push(candidate);
 const jobs=orders.filter(o=>o.items.some(i=>i.pendingQuantity>0||i.readyForShipmentQuantity>0)).sort((a,b)=>(a.deliveryDate??'9999').localeCompare(b.deliveryDate??'9999')||a.createdAt.localeCompare(b.createdAt)||a.id.localeCompare(b.id));
 for(let n=0;n<120;n++)plan.dates.push(addCalendarDays(today,n));
 const used=new Map<string,number>();
 // Actual work already completed today still consumes today's capacity, even if
 // the order was subsequently shipped, cancelled or reopened.
 for(const order of state.orders)for(const record of order.productionRecords??[]){
  if(todayInTurkey(record.createdAt)!==today)continue;
  for(const row of record.items){
   const line=order.items.find(i=>i.id===row.itemId);if(!line)continue;
   if(!row.dailyCapacity||!row.resourceId){plan.issues.push({orderId:order.id,orderNumber:order.number,code:line.code,quantity:row.quantity,reason:'Bugünkü üretim kaydında kapasite tanımı yok; doluluk eksik hesaplanabilir.'});continue;}
   const key=row.resourceId+'|'+today,load=row.quantity/row.dailyCapacity;used.set(key,(used.get(key)??0)+load);
   plan.allocations.push({orderId:order.id,orderNumber:order.number,lineId:line.id,code:line.code,name:line.name,resourceId:row.resourceId,date:today,quantity:row.quantity,dailyCapacity:row.dailyCapacity,load,productionDeadline:today,late:false,completed:true});
  }
 }
 for(const order of jobs){
  const result:ProductionResult={orderId:order.id,orderNumber:order.number,deliveryDate:order.deliveryDate,late:false,incomplete:false};plan.orders.push(result);
  let finish:string|undefined=order.items.some(i=>i.readyForShipmentQuantity>0)?today:undefined;
  const issue=(code:string,quantity:number,reason:string)=>{plan.issues.push({orderId:order.id,orderNumber:order.number,code,quantity,reason});result.incomplete=true;};
  for(const line of order.items){
   if(!line.pendingQuantity)continue;
   if(!config){issue(line.code,line.pendingQuantity,'Çalışma takvimi ve üretim birimleri tanımlı değil.');continue;}
   if(!order.deliveryDate){issue(line.code,line.pendingQuantity,'Müşteriye teslim tarihi belirtilmemiş.');continue;}
   const product=state.products.find(p=>p.id===line.id),rate=product?.dailyCapacity,resource=product?.productionResourceId;
   if(!rate||!resource||!config.resources.some(r=>r.id===resource)){issue(line.code,line.pendingQuantity,'Ürünün günlük kapasitesi veya üretim birimi eksik.');continue;}
   const deadline=productionDeadline(order.deliveryDate,config);let remaining=line.pendingQuantity;
   for(const day of plan.dates){
    if(!isWorkingDay(day,config))continue;
    const key=resource+'|'+day,current=used.get(key)??0;
    const count=Math.min(remaining,Math.floor(Math.max(0,1-current)*rate+1e-8));if(!count)continue;
    const load=count/rate;used.set(key,current+load);remaining-=count;finish=!finish||day>finish?day:finish;
    plan.allocations.push({orderId:order.id,orderNumber:order.number,lineId:line.id,code:line.code,name:line.name,resourceId:resource,date:day,quantity:count,dailyCapacity:rate,load,productionDeadline:deadline,late:day>deadline,completed:false});
    if(!remaining)break;
   }
   if(remaining)issue(line.code,remaining,'120 günlük planlama ufkuna sığmayan miktar.');
  }
  if(finish&&config)result.expectedDeliveryDate=addWorkingDays(finish,config.transportDays,config);
  result.late=!!(order.deliveryDate&&result.expectedDeliveryDate&&result.expectedDeliveryDate>order.deliveryDate);
 }
 return plan;
}
