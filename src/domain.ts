import { z } from 'zod';
import {companySchema} from './company';
import {buildProductionPlan,productionConfigOf,isWorkingDay,todayInTurkey,type ProductionPlan} from './production';
z.config(z.locales.tr());

export const roles = ['admin', 'pazarlamaci', 'uretim', 'sevkiyat'] as const;
export type Role = typeof roles[number];
export const roleNames: Record<Role, string> = {admin:'Yönetici',pazarlamaci:'Pazarlamacı',uretim:'Üretim',sevkiyat:'Sevkiyat'};
export const statuses = ['Müşteriden Onay Bekleniyor','Yönetici Onayı Bekleniyor','Yönetici Onayladı','Hazırlanıyor','Sevkiyata Hazır','Tamamlandı','İptal'] as const;
export type Status = typeof statuses[number];
const id = z.string().min(1).max(100);
const text = z.string().trim().min(1).max(200);
const optionalText = z.string().trim().max(1000).default('');
const integer = z.number().int('Adet tam sayı olmalı.').min(1,'Adet en az 1 olmalı.').max(1_000_000,'Adet en fazla 1.000.000 olabilir.');
const quantity = z.number().int().min(0).max(1_000_000);
const money = z.number().finite().min(0).max(100_000_000).refine(v=>Math.abs(v*100-Math.round(v*100))<0.00001,'En fazla iki ondalık basamak kullanın.');
export const productSchema = z.object({id,orderNo:integer,code:text,name:text,price:money,kdvRate:z.number().min(0).max(100),active:z.boolean().default(true),dailyCapacity:integer.optional(),productionResourceId:id.optional()});
export const customerSchema = z.object({id,name:text,company:optionalText,phone:optionalText,address:optionalText,note:optionalText,active:z.boolean().default(true)});
export const userSchema = z.object({id,name:text,email:z.email().max(254),role:z.enum(roles),active:z.boolean()});
export const discountSchema = z.object({type:z.enum(['percent','amount']),value:money}).refine(v=>v.type!=='percent'||v.value<=100,'İskonto %100 üzerinde olamaz.');
const lineSchema = productSchema.extend({quantity:integer,pendingQuantity:quantity,readyForShipmentQuantity:quantity,sentQuantity:quantity,lineDiscount:discountSchema.optional()});
const shipmentSchema = z.object({id,createdAt:z.iso.datetime(),createdBy:text,items:z.array(z.object({itemId:id,code:text,name:text,quantity:integer})).min(1).max(500)});
const productionRecordSchema=z.object({id,createdAt:z.iso.datetime(),createdBy:text,items:z.array(z.object({itemId:id,quantity:integer,dailyCapacity:integer.optional(),resourceId:id.optional()})).min(1).max(500)});
export const orderSchema = z.object({id,number:text,createdAt:z.iso.datetime(),createdBy:text,createdByUserId:id,customer:customerSchema,items:z.array(lineSchema).min(1).max(500),discount:discountSchema,vatMode:z.enum(['product','none']),status:z.enum(statuses),shipments:z.array(shipmentSchema).max(10000),deliveryDate:z.iso.date().optional(),productionRecords:z.array(productionRecordSchema).max(10000).optional(),customerApprovedAt:z.iso.datetime().optional(),managerApprovedAt:z.iso.datetime().optional(),cancelledAt:z.iso.datetime().optional(),cancelReason:z.string().max(1000).optional()});
export const auditSchema=z.object({id,at:z.iso.datetime(),actorId:id,actorName:text,action:text,targetId:id,detail:z.string().max(2000)});
export const productionConfigSchema=z.object({resources:z.array(z.object({id,name:text})).min(1).max(20),workDays:z.array(z.number().int().min(1).max(7)).min(1).max(7),transportDays:z.number().int().min(1).max(30),closedDates:z.array(z.iso.date()).max(100)}).refine(c=>new Set(c.resources.map(r=>r.id)).size===c.resources.length&&new Set(c.workDays).size===c.workDays.length,'Üretim birimi veya çalışma günü yinelenemez.');
export const stateSchema = z.object({schemaVersion:z.literal(2),revision:z.number().int().min(0),products:z.array(productSchema).max(10000),customers:z.array(customerSchema).max(20000),users:z.array(userSchema).max(1000),orders:z.array(orderSchema).max(50000),audit:z.array(auditSchema).max(100000),productionConfig:productionConfigSchema.optional(),company:companySchema.optional()});
export type Product=z.infer<typeof productSchema>;
export type Customer=z.infer<typeof customerSchema>;
export type AppUser=z.infer<typeof userSchema>;
export type Order=z.infer<typeof orderSchema>;
export type State=z.infer<typeof stateSchema>&{productionPlan?:ProductionPlan};
export type Discount=z.infer<typeof discountSchema>;
export class DomainError extends Error {constructor(message:string,public status=400){super(message);}}
export const normalize=(value:string)=>value.toLocaleLowerCase('tr-TR').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ı/g,'i').trim();
export const searchMatch=(query:string,...values:string[])=>normalize(query).split(/\s+/).every(q=>normalize(values.join(' ')).includes(q));
export const newId=()=>crypto.randomUUID();
export const emptyState=():State=>({schemaVersion:2,revision:0,products:[],customers:[],users:[],orders:[],audit:[]});
function fail(message:string):never{throw new DomainError(message);}
function allowed(user:AppUser,accepted:Role[]){if(!user.active||!accepted.includes(user.role))throw new DomainError('Bu işlem için yetkiniz yok.',403);}
export function assertOrder(order:Order){
 const base=order.items.reduce((sum,line)=>sum+Math.round(line.price*100)*line.quantity,0);
 if(!Number.isSafeInteger(base)||base>1_000_000_000_000)fail('Sipariş tutarı desteklenen 10 milyar TL sınırını aşıyor.');
 const ids=new Set<string>();
 for(const line of order.items){
  if(ids.has(line.id))fail('Siparişte yinelenen ürün var.');ids.add(line.id);
  if(line.pendingQuantity+line.readyForShipmentQuantity+line.sentQuantity!==line.quantity)fail('Bekleyen, hazır ve gönderilen miktarların toplamı sipariş miktarına eşit olmalı.');
  if(line.lineDiscount?.type==='amount'&&Math.round(line.lineDiscount.value*100)>Math.round(line.price*100)*line.quantity)fail(line.code+': ürün iskontosu satır tutarını aşamaz.');
 }
 for(const record of order.productionRecords??[])for(const line of record.items)if(!ids.has(line.itemId))fail('Üretim kaydında siparişe ait olmayan ürün var.');
 if(new Set((order.productionRecords??[]).map(r=>r.id)).size!==(order.productionRecords??[]).length)fail('Yinelenen üretim kaydı var.');
 for(const shipment of order.shipments)for(const line of shipment.items)if(!ids.has(line.itemId))fail('Sevkiyatta siparişe ait olmayan ürün var.');
 for(const line of order.items)if(order.shipments.reduce((n,s)=>n+s.items.filter(i=>i.itemId===line.id).reduce((a,i)=>a+i.quantity,0),0)!==line.sentQuantity)fail('Sevkiyat geçmişi ile gönderilen miktar eşleşmiyor.');
 if(order.status==='Tamamlandı'&&!order.items.every(l=>l.sentQuantity===l.quantity))fail('Ürünler tamamen gönderilmeden sipariş tamamlanamaz.');
}
export function validateState(value:unknown):State{
 const s=stateSchema.parse(value);
 for(const list of [s.products,s.customers,s.users,s.orders,s.audit])if(new Set(list.map(x=>x.id)).size!==list.length)fail('Yedekte yinelenen kimlik var.');
 if(new Set(s.products.map(p=>normalize(p.code))).size!==s.products.length)fail('Yinelenen stok kodu var.');
 if(new Set(s.users.map(u=>u.email.toLowerCase())).size!==s.users.length)fail('Yinelenen kullanıcı e-postası var.');
 if(new Set(s.orders.map(o=>o.number)).size!==s.orders.length)fail('Yinelenen sipariş numarası var.');
 const config=productionConfigOf(s);
 if(s.products.some(p=>(p.dailyCapacity&&!p.productionResourceId)||(p.productionResourceId&&!config.resources.some(r=>r.id===p.productionResourceId))))fail('Ürünün üretim birimi geçersiz.');
 s.orders.forEach(assertOrder);return s;
}
export function deriveStatus(items:Order['items']):Status{
 if(items.length&&items.every(i=>i.sentQuantity===i.quantity))return 'Tamamlandı';
 if(items.some(i=>i.readyForShipmentQuantity>0))return 'Sevkiyata Hazır';
 return 'Hazırlanıyor';
}
export function totals(order:Pick<Order,'items'|'discount'|'vatMode'>){
 const bases=order.items.map(i=>Math.round(i.price*100)*i.quantity);
 const base=bases.reduce((a,b)=>a+b,0);
 const productDiscounts=order.items.map((i,n)=>{const d=i.lineDiscount;return Math.min(bases[n],Math.max(0,!d?0:d.type==='percent'?Math.round(bases[n]*d.value/100):Math.round(d.value*100)));});
 const lineDiscount=productDiscounts.reduce((a,b)=>a+b,0);
 const afterLines=base-lineDiscount;
 const raw=order.discount.type==='percent'?Math.round(afterLines*order.discount.value/100):Math.round(order.discount.value*100);
 const orderDiscount=Math.min(afterLines,Math.max(0,raw));
 const discount=lineDiscount+orderDiscount;
 // Cumulative allocation gives the last line the remainder, preserving every cent.
 let allocated=0,cumulative=0;
 const lines=order.items.map((item,index)=>{
  cumulative+=bases[index]-productDiscounts[index];const next=afterLines?Math.round(orderDiscount*cumulative/afterLines):0;
  const reduction=next-allocated;allocated=next;
  const net=bases[index]-productDiscounts[index]-reduction;
  const vat=order.vatMode==='product'?Math.round(net*item.kdvRate/100):0;
  return {id:item.id,base:bases[index]/100,lineDiscount:productDiscounts[index]/100,orderDiscount:reduction/100,discount:(productDiscounts[index]+reduction)/100,net:net/100,vat:vat/100,total:(net+vat)/100};
 });
 const vat=Math.round(lines.reduce((sum,l)=>sum+Math.round(l.vat*100),0));
 return {base:base/100,lineDiscount:lineDiscount/100,afterLineDiscount:afterLines/100,orderDiscount:orderDiscount/100,discount:discount/100,net:(base-discount)/100,vat:vat/100,total:(base-discount+vat)/100,lines};
}
const productInput=productSchema.omit({id:true}).extend({id:id.optional()});
const customerInput=customerSchema.omit({id:true}).extend({id:id.optional()});
const userInput=userSchema.omit({id:true}).extend({id:id.optional()});
const quantities=z.array(z.object({id,quantity:integer})).min(1).max(500);
export const commandSchema=z.discriminatedUnion('type',[
 z.object({type:z.literal('product.save'),product:productInput}),
 z.object({type:z.literal('product.archive'),id}),
 z.object({type:z.literal('product.import'),products:z.array(productInput.omit({id:true})).min(1).max(10000)}),
 z.object({type:z.literal('customer.save'),customer:customerInput}),
 z.object({type:z.literal('customer.archive'),id}),
 z.object({type:z.literal('user.save'),user:userInput}),
 z.object({type:z.literal('company.save'),company:companySchema}),
 z.object({type:z.literal('production.configure'),config:productionConfigSchema}),
 z.object({type:z.literal('order.create'),customerId:id.optional(),customer:customerInput.omit({id:true}).optional(),items:z.array(z.object({id,quantity:integer,lineDiscount:discountSchema.optional()})).min(1).max(500),discount:discountSchema,vatMode:z.enum(['product','none'])}),
 z.object({type:z.literal('order.customerApprove'),id}),
 z.object({type:z.literal('order.approve'),id,deliveryDate:z.iso.date(),acceptPlanRisk:z.boolean().optional()}),
 z.object({type:z.literal('order.reschedule'),id,deliveryDate:z.iso.date(),acceptPlanRisk:z.boolean().optional()}),
 z.object({type:z.literal('order.cancel'),id,reason:text}),
 z.object({type:z.literal('order.reopen'),id}),
 z.object({type:z.literal('order.ready'),id,items:quantities}),
 z.object({type:z.literal('order.ship'),id,items:quantities}),
 z.object({type:z.literal('backup.import'),data:z.unknown(),ownerId:id})
]);
export type Command=z.infer<typeof commandSchema>;
export function execute(state:State,actorId:string,input:unknown,now=new Date().toISOString()):State{
 const parsed=commandSchema.safeParse(input);if(!parsed.success)throw new DomainError(parsed.error.issues[0]?.message??'Geçersiz işlem.');
 const command=parsed.data,s=structuredClone(state),actor=s.users.find(u=>u.id===actorId&&u.active);
 if(!actor)throw new DomainError('Kullanıcı pasif veya oturum geçersiz.',403);
 let target='system',detail='';
 switch(command.type){
 case 'company.save':allowed(actor,['admin']);s.company=command.company;detail='Şirket bilgileri güncellendi: '+command.company.name;break;
 case 'product.save':{
  allowed(actor,['admin']);const p=command.product;const existing=p.id?s.products.find(x=>x.id===p.id):undefined;
  if(p.id&&!existing)fail('Ürün bulunamadı.');
  if(p.dailyCapacity&&!p.productionResourceId)fail('Kapasite için üretim birimi seçin.');
  if(p.productionResourceId&&!productionConfigOf(s).resources.some(r=>r.id===p.productionResourceId))fail('Üretim birimi bulunamadı.');
  if(s.products.some(x=>normalize(x.code)===normalize(p.code)&&x.id!==p.id))fail('Bu stok kodu başka bir üründe kullanılıyor.');
  const product={...p,id:p.id??newId(),code:p.code.toLocaleUpperCase('tr-TR')};
  s.products=existing?s.products.map(x=>x.id===product.id?product:x):[...s.products,product];target=product.id;detail=product.code;break;
 }
 case 'product.archive':allowed(actor,['admin']);if(!s.products.some(p=>p.id===command.id))fail('Ürün bulunamadı.');s.products=s.products.map(p=>p.id===command.id?{...p,active:false}:p);target=command.id;break;
 case 'product.import':{
  allowed(actor,['admin']);const seen=new Set<string>();
  for(const p of command.products){const code=normalize(p.code);if(seen.has(code))fail('Yükleme içinde yinelenen stok kodu: '+p.code);seen.add(code);const old=s.products.find(x=>normalize(x.code)===code);const next={...old,...p,id:old?.id??newId(),code:p.code.toLocaleUpperCase('tr-TR')};if(next.dailyCapacity&&(!next.productionResourceId||!productionConfigOf(s).resources.some(r=>r.id===next.productionResourceId)))fail('Ürünün üretim birimi geçersiz.');s.products=old?s.products.map(x=>x.id===old.id?next:x):[...s.products,next];}
  detail=command.products.length+' ürün';break;
 }
 case 'customer.save':{
  allowed(actor,['admin','pazarlamaci']);if(actor.role!=='admin'&&command.customer.id)fail('Müşteri düzenleme yetkisi yöneticidedir.');
  const c={...command.customer,id:command.customer.id??newId()};if(command.customer.id&&!s.customers.some(x=>x.id===c.id))fail('Müşteri bulunamadı.');
  s.customers=command.customer.id?s.customers.map(x=>x.id===c.id?c:x):[...s.customers,c];target=c.id;detail=c.name;break;
 }
 case 'customer.archive':allowed(actor,['admin']);if(!s.customers.some(c=>c.id===command.id))fail('Müşteri bulunamadı.');s.customers=s.customers.map(c=>c.id===command.id?{...c,active:false}:c);target=command.id;break;
 case 'production.configure':{
  allowed(actor,['admin']);
  if(s.products.some(p=>p.productionResourceId&&!command.config.resources.some(r=>r.id===p.productionResourceId)))fail('Ürünlerin kullandığı birimi önce ürünlerde değiştirin.');
  if(s.orders.some(o=>o.productionRecords?.some(record=>record.items.some(i=>i.resourceId&&!command.config.resources.some(r=>r.id===i.resourceId)))))fail('Üretim geçmişinde kullanılan birim kaldırılamaz.');
  s.productionConfig=command.config;detail='Çalışma takvimi ve üretim birimleri güncellendi.';break;
 }
 case 'user.save':{
  allowed(actor,['admin']);const u={...command.user,id:command.user.id??newId(),email:command.user.email.toLowerCase()};
  if(command.user.id&&!s.users.some(x=>x.id===u.id))fail('Kullanıcı bulunamadı.');
  if(s.users.some(x=>x.email.toLowerCase()===u.email&&x.id!==u.id))fail('E-posta zaten kayıtlı.');
  if(u.id===actor.id&&(!u.active||u.role!=='admin'||u.email!==actor.email))fail('Kendi yönetici erişiminizi buradan kaldıramazsınız.');
  s.users=command.user.id?s.users.map(x=>x.id===u.id?u:x):[...s.users,u];
  if(!s.users.some(x=>x.active&&x.role==='admin'))fail('En az bir aktif yönetici gerekli.');target=u.id;detail=u.name+' / '+roleNames[u.role];break;
 }
 case 'order.create':{
  allowed(actor,['admin','pazarlamaci']);if(new Set(command.items.map(x=>x.id)).size!==command.items.length)fail('Aynı ürün tek satırda olmalı.');
  let customer=command.customerId?s.customers.find(c=>c.id===command.customerId&&c.active):undefined;
  if(!customer&&command.customer){customer={...command.customer,id:newId()};s.customers.push(customer);}
  if(!customer)fail('Müşteri seçin veya yeni müşteri bilgilerini doldurun.');
  const items=command.items.map(row=>{const p=s.products.find(p=>p.id===row.id&&p.active);if(!p)fail('Ürün artık aktif değil. Listeyi yenileyin.');return {...p,quantity:row.quantity,pendingQuantity:row.quantity,readyForShipmentQuantity:0,sentQuantity:0,...(row.lineDiscount?{lineDiscount:row.lineDiscount}:{})};});
  const oid=newId();const number='SIP-'+now.slice(0,10).replaceAll('-','')+'-'+oid;
  const subtotal=totals({items,discount:{type:'amount',value:0},vatMode:'none'}).net;
  if(command.discount.type==='amount'&&Math.round(command.discount.value*100)>Math.round(subtotal*100))fail('Genel iskonto, ürün iskontolarından sonraki sipariş tutarını aşamaz.');
  const order:Order={id:oid,number,createdAt:now,createdBy:actor.name,createdByUserId:actor.id,customer,items,discount:command.discount,vatMode:command.vatMode,status:'Müşteriden Onay Bekleniyor',shipments:[]};
  assertOrder(order);s.orders.unshift(order);target=oid;detail=customer.name;break;
 }
 case 'backup.import':{
  allowed(actor,['admin']);const data=validateState(command.data);const owner=s.users.find(u=>u.id===command.ownerId&&u.active&&['admin','pazarlamaci'].includes(u.role));if(!owner)fail('Aktarım için aktif satış kullanıcısı seçin.');
  if(s.products.length||s.customers.length||s.orders.length)fail('Yedek yalnızca boş sisteme aktarılır. Mevcut kayıtların üzerine yazılmaz.');
  s.company=data.company;s.productionConfig=productionConfigOf(data);s.products=data.products;s.customers=data.customers;s.orders=data.orders.map(o=>({...o,createdByUserId:owner.id,createdBy:owner.name}));
  // Imported accounts never grant access, and imported audit actors cannot impersonate current users.
  detail=`${data.orders.length} sipariş, ${data.products.length} ürün, ${data.customers.length} müşteri. Sahibi: ${owner.name}`;break;
 }
 default:{
  const order=s.orders.find(o=>o.id===command.id);if(!order)fail('Sipariş bulunamadı.');target=order.id;
  const owns=order.createdByUserId===actor.id;
  if(command.type==='order.customerApprove'){
   allowed(actor,['admin','pazarlamaci']);if(actor.role!=='admin'&&!owns)fail('Yalnızca kendi siparişinizi onaylayabilirsiniz.');if(order.status!=='Müşteriden Onay Bekleniyor')fail('Sipariş müşteri onayı aşamasında değil.');order.status='Yönetici Onayı Bekleniyor';order.customerApprovedAt=now;
  }else if(command.type==='order.approve'||command.type==='order.reschedule'){
   allowed(actor,['admin']);
   if(command.type==='order.approve'&&order.status!=='Yönetici Onayı Bekleniyor')fail('Sipariş yönetici onayı beklemiyor.');
   if(command.type==='order.reschedule'&&!['Yönetici Onayladı','Hazırlanıyor','Sevkiyata Hazır'].includes(order.status))fail('Yalnızca açık ve onaylı siparişin tarihi değiştirilebilir.');
   if(command.deliveryDate<todayInTurkey(now))fail('Teslim tarihi geçmişte olamaz.');
   if(!isWorkingDay(command.deliveryDate,productionConfigOf(s)))fail('Teslim tarihi çalışma günü olmalı.');
   const oldDate=order.deliveryDate;order.deliveryDate=command.deliveryDate;
   const plan=buildProductionPlan(s,todayInTurkey(now),order),result=plan.orders.find(o=>o.orderId===order.id);
   if((result?.incomplete||plan.orders.some(o=>o.late)||plan.issues.length>0)&&!command.acceptPlanRisk)fail('Seçilen tarih kapasiteye göre riskli veya kapasite bilgisi eksik. Plan uyarısını kontrol edip açık onay verin.');
   if(command.type==='order.approve'){order.status='Yönetici Onayladı';order.managerApprovedAt=now;}
   detail=`Müşteriye teslim: ${oldDate??'belirtilmemiş'} → ${command.deliveryDate}${command.acceptPlanRisk?' · Kapasite riski kabul edildi.':''}`;
  }else if(command.type==='order.cancel'){
   allowed(actor,['admin','pazarlamaci']);if(actor.role!=='admin'&&(!owns||!['Müşteriden Onay Bekleniyor','Yönetici Onayı Bekleniyor'].includes(order.status)))fail('Üretime geçen siparişi yalnızca yönetici iptal edebilir.');
   if(['İptal','Tamamlandı'].includes(order.status)||order.items.some(i=>i.sentQuantity>0))fail('Gönderilmiş veya kapanmış sipariş iptal edilemez.');order.status='İptal';order.cancelledAt=now;order.cancelReason=command.reason;detail=command.reason;
  }else if(command.type==='order.reopen'){
   allowed(actor,['admin']);if(order.status!=='İptal'||order.items.some(i=>i.sentQuantity>0))fail('Bu sipariş yeniden açılamaz.');
   order.items=order.items.map(i=>({...i,pendingQuantity:i.quantity,readyForShipmentQuantity:0,sentQuantity:0}));order.status='Müşteriden Onay Bekleniyor';delete order.customerApprovedAt;delete order.managerApprovedAt;delete order.cancelledAt;delete order.cancelReason;delete order.deliveryDate;detail='Önceki onaylar, teslim tarihi ve hazır miktarlar sıfırlandı.';
  }else{
   const production=command.type==='order.ready';allowed(actor,production?['admin','uretim']:['admin','sevkiyat']);
   if(!['Yönetici Onayladı','Hazırlanıyor','Sevkiyata Hazır'].includes(order.status)||!order.managerApprovedAt)fail('İşlem için yönetici onayı ve açık sipariş gerekli.');
   if(new Set(command.items.map(i=>i.id)).size!==command.items.length)fail('Yinelenen ürün satırı.');
   const shipped:Order['shipments'][number]['items']=[];
   for(const row of command.items){const line=order.items.find(i=>i.id===row.id);if(!line)fail('Ürün siparişte bulunamadı.');const available=production?line.pendingQuantity:line.readyForShipmentQuantity;if(row.quantity>available)fail(`${line.code}: en fazla ${available} adet işlem yapılabilir.`);
    if(production){line.pendingQuantity-=row.quantity;line.readyForShipmentQuantity+=row.quantity;}else{line.readyForShipmentQuantity-=row.quantity;line.sentQuantity+=row.quantity;shipped.push({itemId:line.id,code:line.code,name:line.name,quantity:row.quantity});}}
   if(!production)order.shipments.push({id:newId(),createdAt:now,createdBy:actor.name,items:shipped});
   else (order.productionRecords??=[]).push({id:newId(),createdAt:now,createdBy:actor.name,items:command.items.map(i=>{const p=s.products.find(p=>p.id===i.id);return {itemId:i.id,quantity:i.quantity,...(p?.dailyCapacity?{dailyCapacity:p.dailyCapacity}:{}),...(p?.productionResourceId?{resourceId:p.productionResourceId}:{})};})});
   order.status=deriveStatus(order.items);detail=command.items.map(i=>`${i.quantity} adet`).join(', ');
  }
  assertOrder(order);
 }
 }
 s.revision++;s.audit.push({id:newId(),at:now,actorId:actor.id,actorName:actor.name,action:command.type,targetId:target,detail});
 if(new TextEncoder().encode(JSON.stringify(s)).byteLength>2_000_000)fail('Çalışma alanı 2 MB kapasite sınırına ulaştı. Mevcut veriler korundu; yeni kayıt için yönetici kapasite düzenlemesi yapmalı.');
 return s;
}
export function stateForUser(state:State,user:AppUser):State{
 if(!user.active)throw new DomainError('Hesap pasif.',403);
 const s=structuredClone(state);
 if(user.role==='admin')return s;
 s.users=[user];
 if(user.role==='pazarlamaci')s.orders=s.orders.filter(o=>o.createdByUserId===user.id);
 else s.orders=s.orders.filter(o=>['Yönetici Onayladı','Hazırlanıyor','Sevkiyata Hazır','Tamamlandı'].includes(o.status));
 const visible=new Set(s.orders.map(o=>o.id));s.audit=s.audit.filter(a=>visible.has(a.targetId));
 if(user.role==='uretim'||user.role==='sevkiyat'){
  if(user.role==='uretim')s.productionPlan=buildProductionPlan(state);
  s.products=[];s.customers=[];
  s.orders=s.orders.map(o=>({...o,discount:{type:'percent',value:0},items:o.items.map(i=>({...i,price:0,...(i.lineDiscount?{lineDiscount:{type:'percent' as const,value:0}}:{})})),customer:{...o.customer,note:''}}));
 }
 return s;
}

