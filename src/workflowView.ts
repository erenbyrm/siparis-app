import type {Order} from './domain';

export type OrderStep={label:string,detail:string,tone:'waiting'|'working'|'done'|'cancelled'};

export function nextOrderStep(order:Order):OrderStep{
 if(order.status==='Tamamlandı')return {label:'Tamamlandı',detail:'Siparişin tamamı sevk edildi.',tone:'done'};
 if(order.status==='İptal')return {label:'İptal edildi',detail:order.cancelReason||'Sipariş kapatıldı.',tone:'cancelled'};
 if(order.status==='Müşteriden Onay Bekleniyor')return {label:'Sıradaki işlem: Müşteri onayı',detail:'Satış ekibi müşteri onayını kaydetmeli.',tone:'waiting'};
 if(order.status==='Yönetici Onayı Bekleniyor')return {label:'Sıradaki işlem: Yönetici onayı',detail:'Teslim tarihi ve üretim planı onaylanmalı.',tone:'waiting'};
 const pending=order.items.reduce((n,i)=>n+i.pendingQuantity,0),awaiting=order.items.reduce((n,i)=>n+(i.awaitingReceiptQuantity??0),0),ready=order.items.reduce((n,i)=>n+i.readyForShipmentQuantity,0);
 if(awaiting)return {label:'Sıradaki işlem: Depo kabulü',detail:`${awaiting} adet sayılarak depoya alınmalı.`,tone:'working'};
 if(ready)return {label:'Sıradaki işlem: Sevkiyat',detail:`${ready} adet sevke hazır.`,tone:'working'};
 if(pending)return {label:'Sıradaki işlem: Üretim',detail:`${pending} adet üretilmeli veya mevcut stoktan ayrılmalı.`,tone:'working'};
 return {label:'İşlem kontrolü gerekli',detail:'Sipariş miktarlarını ve işlem geçmişini kontrol edin.',tone:'waiting'};
}
