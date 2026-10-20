import {z} from 'zod';
import {companySchema,defaultCompany} from './company.js';
import {totals,type State,type Command,type AppUser} from './domain.js';
export const categories={EKP:'Eksik depo kabul bildirimi',EKO:'Eksik depo kabul kararı',STT:'Stok üretim talebi',STO:'Stok talebi onayı',STI:'Stok talebi iptali',SIP:'Sipariş',MON:'Müşteri onayı',YON:'Yönetici onayı',TRH:'Teslim tarihi değişikliği',URT:'Üretim sonucu',DKA:'Depo kabulü',SVK:'Sevkiyat raporu',SAY:'Stok sayımı',SON:'Sayım kararı',AYR:'Stok ayırma',SRB:'Stok serbest bırakma',IPT:'Sipariş iptali',YAC:'Siparişi yeniden açma',URN:'Ürün işlemi',MUS:'Müşteri işlemi',KUL:'Kullanıcı işlemi',SIR:'Şirket bilgileri',PLN:'Üretim ayarları',YDK:'Yedek aktarımı'} as const;
export type Category=keyof typeof categories;
// Keep legacy categories readable in backups, but issue/show only business paperwork.
export const documentCategories={SIP:'Sipariş fişi',STT:'Depo siparişi',URT:'Üretim fişi',DKA:'Depo kabul fişi',SVK:'Sevkiyat fişi'} as const;
type OperationalCategory=keyof typeof documentCategories;
export const isOperationalDocument=(record:{category:Category})=>Object.prototype.hasOwnProperty.call(documentCategories,record.category);
const str=z.string().max(2000);
export const documentSchema=z.object({id:z.string(),requestId:z.uuid().optional(),number:z.string().max(120),category:z.enum(Object.keys(categories) as [Category,...Category[]]),year:z.number().int(),sequence:z.number().int().min(0),at:z.iso.datetime(),actorId:z.string(),actorName:str,ownerId:z.string().optional(),orderId:z.string().optional(),orderNumber:str.optional(),referenceId:z.string(),brandId:z.string(),title:str,detail:str,customer:z.string().max(2000).optional(),columns:z.array(str).max(10),rows:z.array(z.array(str).max(10)).max(10000),summary:z.array(str).max(20),legacy:z.boolean().optional(),relatedNumber:str.optional()});
export const documentBookSchema=z.object({counters:z.record(z.string(),z.number().int().min(0)),brands:z.array(z.object({id:z.string(),company:companySchema})).max(10000),records:z.array(documentSchema).max(100000)});
export type BusinessDocument=z.infer<typeof documentSchema>;
const commandCategory:Partial<Record<Command['type'],OperationalCategory>>={'order.create':'SIP','order.ready':'URT','order.ship':'SVK','order.receive':'DKA','stock.request':'STT','stock.produce':'URT','stock.receive':'DKA'};
export function ensureDocuments(s:State){s.documentBook??={counters:{},brands:[],records:[]};}
export function allocateNumber(s:State,category:Category,at:string){
 ensureDocuments(s);const year=Number(new Intl.DateTimeFormat('en',{year:'numeric',timeZone:'Europe/Istanbul'}).format(new Date(at))),key=category+'-'+year;
 const records=s.documentBook!.records.filter(d=>d.category===category&&d.year===year);
 const existingNumbers=[...s.orders.map(o=>o.number),...(s.stockRequests??[]).map(r=>r.number)].filter(n=>n.startsWith(key+'-')&&n.length===key.length+7&&Number.isInteger(Number(n.slice(-6))));
 const start=existingNumbers.reduce((n,v)=>Math.max(n,Number(v.slice(-6))),s.documentBook!.counters[key]??0);const sequence=records.reduce((n,d)=>Math.max(n,d.sequence),start)+1;
 if(sequence>999999)throw new Error('Bu kategorinin yıllık belge sınırı doldu.');s.documentBook!.counters[key]=sequence;return {number:key+'-'+String(sequence).padStart(6,'0'),year,sequence};
}
function brand(s:State){const c={...(s.company??defaultCompany()),photo:''};let b=s.documentBook!.brands.find(b=>JSON.stringify(b.company)===JSON.stringify(c));if(!b){b={id:crypto.randomUUID(),company:c};s.documentBook!.brands.push(b);}return b.id;}
const tl=(n:number)=>new Intl.NumberFormat('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:2}).format(n)+' TL';
export function issueDocument(s:State,before:State,actor:AppUser,command:Command,target:string,detail:string,at:string){
 const category=commandCategory[command.type];if(!category)return undefined;
 ensureDocuments(s);const order=command.type.startsWith('order.')?s.orders.find(o=>o.id===target):undefined;
 const request=command.type==='stock.request'||command.type==='stock.requestApprove'||command.type==='stock.requestCancel'?s.stockRequests?.find(r=>r.id===target):undefined;
 const serial=command.type==='stock.request'?{number:request!.number,year:Number(request!.number.split('-')[1]),sequence:Number(request!.number.split('-')[2])}:command.type==='order.create'?{number:order!.number,year:Number(order!.number.split('-')[1]),sequence:Number(order!.number.split('-')[2])}:allocateNumber(s,category,at);
 const d:BusinessDocument={id:crypto.randomUUID(),...serial,category,at,actorId:actor.id,actorName:actor.name,referenceId:target,brandId:brand(s),title:documentCategories[category],detail,columns:['Kod','Ürün','Adet'],rows:[],summary:[],...(order?{orderId:order.id,orderNumber:order.number,ownerId:order.createdByUserId,customer:[order.customer.company,order.customer.name,order.customer.address,order.customer.phone].filter(Boolean).join('\n')}:{})};
 if(request){d.rows=request.items.map(i=>[i.code,i.name,String(i.quantity)]);d.relatedNumber=request.number;d.summary=['Depoda ihtiyaç tarihi: '+request.neededDate.split('-').reverse().join('.'),'Durum: '+request.status];if(d.detail!==request.reason)d.detail+=' '+request.reason;}
 if(order){
  if(command.type==='order.create'){d.detail='';const t=totals(order);d.columns=['Kod / ürün','Adet','Birim fiyat','Ürün isk.','Genel isk.','KDV %','Toplam'];d.rows=order.items.map((i,n)=>[i.code+'\n'+i.name,String(i.quantity),tl(i.price),tl(t.lines[n].lineDiscount),tl(t.lines[n].orderDiscount),String(order.vatMode==='product'?i.kdvRate:0),tl(t.lines[n].total)]);d.summary=['Liste toplamı: '+tl(t.base),'Ürün iskontoları: '+tl(t.lineDiscount),'Genel iskonto: '+tl(t.orderDiscount),'KDV: '+tl(t.vat),'Genel toplam: '+tl(t.total)];}
  else if(command.type==='order.ready'||command.type==='order.ship'||command.type==='order.receive'||command.type==='order.release'){d.rows=command.items.map(i=>{const p=order.items.find(p=>p.id===i.id)!;return [p.code,p.name,String(i.quantity)];});}
  else if(command.type==='order.allocate'){const old=before.orders.find(o=>o.id===order.id)!;d.rows=order.items.map(i=>[i.code,i.name,String(i.readyForShipmentQuantity-(old.items.find(p=>p.id===i.id)?.readyForShipmentQuantity??0))]).filter(r=>r[2]!=='0');}
  else d.rows=order.items.map(i=>[i.code,i.name,String(i.quantity)]);
  d.summary.push('İşlem sonrası durum: '+order.status);if(order.deliveryDate)d.summary.push('Müşteriye teslim: '+order.deliveryDate.split('-').reverse().join('.'));
  if(command.type==='order.ship')order.shipments.at(-1)!.number=d.number;
  if(command.type==='order.ready'){order.productionRecords!.at(-1)!.number=d.number;d.title='Sipariş üretim fişi';}
 }
 if(command.type==='stock.produce'||command.type==='stock.receive'){const b=s.inventory!.batches.find(b=>b.id===target)!;const p=s.products.find(p=>p.id===b.productId)!;d.rows=[[p.code,p.name,String(command.quantity)]];if(command.type==='stock.produce'){b.number=d.number;d.title='Depo için üretim fişi';}else d.relatedNumber=b.number;if(b.requestId)d.summary.push('Stok talebi: '+s.stockRequests?.find(r=>r.id===b.requestId)?.number);}
 if(!d.rows.length){d.columns=['İşlem bilgisi'];d.rows=[[detail||documentCategories[category]]];}
 const oldMovements=new Set(before.inventory?.movements.map(m=>m.id));for(const m of s.inventory?.movements??[])if(!oldMovements.has(m.id))m.number=d.number;
 s.documentBook!.records.push(d);return d;
}
export function visibleDocuments(s:State,user:AppUser){ensureDocuments(s);const ownOrders=new Set(s.orders.filter(o=>o.createdByUserId===user.id).map(o=>o.id));s.documentBook!.records=s.documentBook!.records.filter(d=>isOperationalDocument(d)&&(user.role==='admin'||(user.role==='pazarlamaci'?(d.orderId?ownOrders.has(d.orderId):false):user.role==='uretim'?['URT','DKA','STT'].includes(d.category):['URT','DKA','SVK','STT'].includes(d.category))));const brands=new Set(s.documentBook!.records.map(d=>d.brandId));s.documentBook!.brands=s.documentBook!.brands.filter(b=>brands.has(b.id));s.documentBook!.counters={};}
export function assertDocuments(s:State){if(!s.documentBook)return;const b=s.documentBook,ids=new Set(b.brands.map(b=>b.id));if(ids.size!==b.brands.length||new Set(b.records.map(d=>d.id)).size!==b.records.length||new Set(b.records.map(d=>d.number)).size!==b.records.length)throw new Error('Yinelenen belge numarası veya kimliği.');for(const d of b.records){if(!ids.has(d.brandId)||d.rows.some(r=>r.length!==d.columns.length))throw new Error('Belge içeriği geçersiz.');if(!d.legacy&&(d.number!==`${d.category}-${d.year}-${String(d.sequence).padStart(6,'0')}`||(b.counters[d.category+'-'+d.year]??0)<d.sequence))throw new Error('Belge sırası geçersiz.');}}
