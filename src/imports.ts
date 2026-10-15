import Papa from 'papaparse';
import {DomainError,emptyState,productSchema,validateState,deriveStatus,normalize,newId,type State,type Order,type Status,type Product} from './domain';
export function parseProducts(raw:string):Product[]{
 if(raw.length>2_000_000)throw new DomainError('Dosya 2 MB sınırını aşıyor.');
 const parsed=Papa.parse<string[]>(raw.trim(),{skipEmptyLines:'greedy',delimitersToGuess:['\t',';',',']});
 if(parsed.errors.length)throw new DomainError('CSV okunamadı: '+parsed.errors[0].message);
 const rows=parsed.data;const hasHeader=normalize(rows[0]?.join(' ')??'').includes('stok');
 const number=(s:string)=>Number(s.trim().includes(',')?s.trim().replaceAll('.','').replace(',','.'):s.trim());
 const result=rows.slice(hasHeader?1:0).map((r,i)=>{
  if(r.length!==5)throw new DomainError(`Satır ${i+(hasHeader?2:1)}: 5 sütun gerekli (sıra, kod, ad, fiyat, KDV).`);
  const valid=productSchema.safeParse({id:newId(),orderNo:number(r[0]),code:r[1],name:r[2],price:number(r[3]),kdvRate:number(r[4]),active:true});
  if(!valid.success)throw new DomainError(`Satır ${i+(hasHeader?2:1)}: ${valid.error.issues[0].message}`);return valid.data;
 });
 if(!result.length||result.length>10000)throw new DomainError('1 ile 10.000 arasında ürün yükleyin.');
 if(new Set(result.map(p=>normalize(p.code))).size!==result.length)throw new DomainError('Dosyada yinelenen stok kodu var.');return result;
}
export type Backup={format:'siparis-backup',version:2,exportedAt:string,data:State};
export const makeBackup=(state:State):Backup=>({format:'siparis-backup',version:2,exportedAt:new Date().toISOString(),data:state});
export function readImport(raw:string):{data:State,warnings:string[]}{
 if(raw.length>4_000_000)throw new DomainError('Yedek 4 MB sınırını aşıyor.');
 let value;try{value=JSON.parse(raw);}catch{throw new DomainError('Geçerli bir JSON dosyası seçin.');}
 if(value?.format==='siparis-legacy'&&value.version===20&&value.data&&typeof value.data==='object'){
  const keys:Record<string,string>={siparis_products_v20:'products',siparis_customers_v20:'customers',siparis_orders_v20:'orders'};
  return readLegacy({getItem:(key:string)=>keys[key]?JSON.stringify(value.data[keys[key]]??[]):null});
 }
 return {data:readBackup(raw),warnings:['Hesap yetkileri ve eski işlem geçmişi geri yüklenmez. Özgün yedek dosyasını ayrıca saklayın.']};
}
export function readBackup(raw:string):State{
 if(raw.length>4_000_000)throw new DomainError('Yedek 4 MB sınırını aşıyor.');
 let data:unknown;try{data=JSON.parse(raw);}catch{throw new DomainError('Geçerli bir JSON dosyası seçin.');}
 if(!data||typeof data!=='object'||!('format' in data)||data.format!=='siparis-backup'||!('version' in data)||data.version!==2||!('data' in data))throw new DomainError('Bu dosya desteklenen Mobil Sipariş v2 yedeği değil.');
 return validateState(data.data);
}
function legacyDate(value:unknown):string{
 const v=String(value??'');if(/^\d{4}-/.test(v)&&Number.isFinite(Date.parse(v)))return new Date(v).toISOString();
 const match=v.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})[,\s]+(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
 if(!match)throw new DomainError('Eski kayıtta tarih okunamadı: '+v);
 return new Date(`${match[3]}-${match[2].padStart(2,'0')}-${match[1].padStart(2,'0')}T${match[4].padStart(2,'0')}:${match[5]}:${match[6]??'00'}+03:00`).toISOString();
}
export function readLegacy(storage:Pick<Storage,'getItem'>):{data:State,warnings:string[]}{
 const read=(key:string):Record<string,unknown>[]=>{const raw=storage.getItem(key);if(!raw)return [];let value:unknown;try{value=JSON.parse(raw);}catch{throw new DomainError('Eski kayıt bozuk: '+key);}if(!Array.isArray(value)||!value.every(x=>x&&typeof x==='object'))throw new DomainError('Eski kayıt biçimi geçersiz: '+key);return value;};
 const s=emptyState(),warnings:string[]=[];
 const oldProducts=read('siparis_products_v20'),oldCustomers=read('siparis_customers_v20'),oldOrders=read('siparis_orders_v20');
 if(!oldProducts.length&&!oldCustomers.length&&!oldOrders.length)throw new DomainError('Bu tarayıcı ve adreste eski sürüm kaydı bulunamadı.');
 const product=(p:Record<string,unknown>)=>({...p,id:'legacy-product-'+String(p.id),active:true});
 const customer=(c:Record<string,unknown>)=>({...c,id:'legacy-customer-'+String(c.id),name:String(c.name??''),company:String(c.company??''),phone:String(c.phone??''),address:String(c.address??''),note:String(c.note??''),active:true});
 s.products=oldProducts.map(p=>productSchema.parse(product(p)));
 s.customers=oldCustomers.map(c=>customer(c)) as State['customers'];
 s.orders=oldOrders.map(o=>{
  if(!Array.isArray(o.items)||!o.customer||typeof o.customer!=='object')throw new DomainError('Eski sipariş biçimi geçersiz.');
  const items=o.items.map((x:Record<string,unknown>)=>{
   const total=Number(x.quantity),ready=Number(x.readyForShipmentQuantity??0),sent=Number(x.sentQuantity??0),pending=total-ready-sent;
   if([total,ready,sent,pending].some(n=>!Number.isInteger(n)||n<0)||total===0)throw new DomainError('Eski siparişte geçersiz miktar: '+String(o.id));
   if(Number(x.pendingQuantity)!==pending)warnings.push(String(o.id)+': bekleyen miktar '+pending+' olarak düzeltilecek.');
   return {...product(x),quantity:total,pendingQuantity:pending,readyForShipmentQuantity:ready,sentQuantity:sent};
  });
  const status=String(o.status)==='Müşteri Onayı Alındı'?'Yönetici Onayı Bekleniyor':String(o.status);
  let finalStatus=status;if(['Tamamlandı','Sevkiyata Hazır','Hazırlanıyor'].includes(status)){finalStatus=deriveStatus(items as Order['items']);if(finalStatus!==status)warnings.push(String(o.id)+': durum '+finalStatus+' olarak düzeltilecek.');}
  const shipments=Array.isArray(o.shipments)?o.shipments.map((sh:Record<string,unknown>)=>({...sh,id:'legacy-shipment-'+String(sh.id),createdAt:legacyDate(sh.createdAt),createdBy:String(sh.createdBy??'Eski kullanıcı'),items:Array.isArray(sh.items)?sh.items.map((i:Record<string,unknown>)=>({...i,itemId:'legacy-product-'+String(i.itemId)})):[]})):[];
  return {id:'legacy-order-'+String(o.id),number:String(o.id),createdAt:legacyDate(o.createdAt),createdBy:String(o.createdBy??'Eski kullanıcı'),createdByUserId:'legacy-owner',customer:customer(o.customer as Record<string,unknown>),items:items.map(i=>({...i,kdvRate:Number(o.vatRate??0)})),discount:o.globalDiscount??{type:'percent',value:0},vatMode:Number(o.vatRate)>0?'product':'none',status:finalStatus as Status,shipments,...(o.customerApprovedAt?{customerApprovedAt:legacyDate(o.customerApprovedAt)}:{}),...(o.managerApprovedAt?{managerApprovedAt:legacyDate(o.managerApprovedAt)}:{}),...(o.cancelledAt?{cancelledAt:legacyDate(o.cancelledAt)}:{})} as Order;
 });
 warnings.unshift('Eski şifreler ve hesap yetkileri aktarılmaz. Siparişler seçtiğiniz aktif kullanıcıya bağlanır.');
 delete s.inventory;
 warnings.push('Eski hazır miktarlar depocu sayımına aktarılır; ilk fiziksel stok ayrıca sayılarak girilmelidir.');
 return {data:validateState(s),warnings};
}
