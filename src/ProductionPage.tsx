import {useMemo,useState} from 'react';
import {buildProductionPlan,productionConfigOf,isWorkingDay,todayInTurkey,addCalendarDays} from './production';
import {calendarDate} from './ApprovalPlanning';
import {useStore} from './store';
import {Section,Field,Empty} from './ui';
const weekNames=['Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi','Pazar'];
export function Production(){
 const {state,user}=useStore(),config=productionConfigOf(state!);
 const plan=useMemo(()=>state!.productionPlan??buildProductionPlan(state!),[state]);
 const [start,setStart]=useState(todayInTurkey()),[selected,setSelected]=useState(todayInTurkey());
 const days=plan.dates.filter(d=>d>=start).slice(0,14),allocations=plan.allocations.filter(a=>a.date===selected);
 const late=plan.orders.filter(o=>o.late),pending=state!.orders.filter(o=>['Yönetici Onayladı','Hazırlanıyor','Sevkiyata Hazır'].includes(o.status)).reduce((sum,o)=>sum+o.items.reduce((n,i)=>n+i.pendingQuantity,0),0);
 return <Section title="Üretim programı" description="Ortak hat kapasitesi, günlük doluluk ve teslim tarihi kontrolü.">
  <div className="metrics"><div><span>Üretim bekleyen adet</span><strong>{pending}</strong></div><div><span>Gecikme riski olan sipariş</span><strong>{late.length}</strong></div><div><span>Planlama uyarısı</span><strong>{plan.issues.length}</strong></div></div>
  <p className="muted">Aynı hattaki ürünler kapasiteyi paylaşır: 75 / 150 adet SCC22 = %50 günlük kapasite. Önce teslim tarihi yakın siparişler planlanır. Bugün üretilen miktar, kalan kapasiteden düşülür.</p>
  {plan.issues.length>0&&<div className="alert">Kapasitesi veya tarihi eksik miktarlar doluluğa dahil edilemiyor. Aşağıdaki uyarıları tamamlamadan oranları kesin kabul etmeyin.</div>}
  <Field label="Program başlangıcı"><input type="date" min={plan.today} max={addCalendarDays(plan.today,119)} value={start} onChange={e=>{if(e.target.value){setStart(e.target.value);setSelected(e.target.value);}}}/></Field>
  <div className="production-calendar">{days.map(day=><button key={day} className={'production-day '+(selected===day?'selected ':'')+(!isWorkingDay(day,config)?'closed':'')} onClick={()=>setSelected(day)}><strong>{calendarDate(day)}</strong><small>{weekNames[(new Date(day+'T12:00:00Z').getUTCDay()||7)-1]}</small>{config.resources.map(r=>{
   const rows=plan.allocations.filter(a=>a.date===day&&a.resourceId===r.id),load=rows.reduce((s,a)=>s+a.load,0),done=rows.filter(a=>a.completed).reduce((s,a)=>s+a.quantity,0),planned=rows.filter(a=>!a.completed).reduce((s,a)=>s+a.quantity,0);
   return <div key={r.id} className="resource-load"><span>{r.name}</span><strong className={load>1.000001?'plan-warning':''}>{isWorkingDay(day,config)||load?'%'+(load*100).toLocaleString('tr-TR',{maximumFractionDigits:1}):'Çalışma yok'}</strong><div className="capacity-track" aria-hidden="true"><i style={{width:Math.min(load*100,100)+'%'}}/></div><small>{planned} planlı · {done} üretilen</small></div>;
  })}</button>)}</div>
  <div className="surface table-scroll"><h2>{calendarDate(selected)} — günün işleri</h2><table><thead><tr><th>Sipariş</th><th>Ürün</th><th>Adet</th><th>Hat payı</th><th>Durum</th></tr></thead><tbody>{allocations.map((a,n)=><tr key={n}><td>{a.orderNumber}</td><td>{a.code}<small>{a.name}</small></td><td>{a.quantity}</td><td>%{(a.load*100).toLocaleString('tr-TR',{maximumFractionDigits:1})}</td><td>{a.completed?'Bugün üretildi':a.late?'Geç üretim — teslim riski':'Planlandı'}</td></tr>)}</tbody></table>{!allocations.length&&<Empty>Bu gün için üretim kaydı veya plan yok.</Empty>}</div>
  {late.length>0&&<div className="surface table-scroll"><h2>Teslim tarihi riski</h2><table><thead><tr><th>Sipariş</th><th>Söz verilen teslim</th><th>Kapasiteye göre teslim</th></tr></thead><tbody>{late.map(o=><tr key={o.orderId}><td>{o.orderNumber}</td><td>{o.deliveryDate&&calendarDate(o.deliveryDate)}</td><td>{o.expectedDeliveryDate&&calendarDate(o.expectedDeliveryDate)}{o.incomplete&&' — eksik plan'}</td></tr>)}</tbody></table></div>}
  {plan.issues.length>0&&<div className="surface"><h2>Tamamlanması gereken bilgiler</h2>{plan.issues.map((i,n)=><p key={n}><strong>{i.code} · {i.quantity} adet</strong> — {i.reason}<small className="break"> {i.orderNumber}</small></p>)}</div>}
  <p className="muted small">120 günlük tahmin; günler tam gün kapasitesiyle hesaplanır. Eski sürümde gün içinde üretilen miktarların zaman kaydı yoksa bugünkü doluluk eksik kalabilir. Hazır/sevk edilmiş ürünler gelecekteki üretim kapasitesini tüketmez.</p>
  {user!.role==='admin'&&<ProductionSettings/>}
 </Section>;
}
function ProductionSettings(){
 const {state,run,busy,setError}=useStore();const [form,setForm]=useState(()=>productionConfigOf(state!)),[closed,setClosed]=useState(form.closedDates.join(', '));
 return <form className="surface" onSubmit={async e=>{e.preventDefault();const dates=closed.split(/[\s,;]+/).filter(Boolean);if(dates.some(d=>!/^\d{4}-\d{2}-\d{2}$/.test(d)))return setError('Kapalı günleri YYYY-AA-GG biçiminde yazın.');await run({type:'production.configure',config:{...form,closedDates:[...new Set(dates)]}});}}><h2>Çalışma takvimi</h2><div className="actions">{weekNames.map((name,n)=><label className="check" key={name}><input type="checkbox" checked={form.workDays.includes(n+1)} onChange={e=>setForm({...form,workDays:e.target.checked?[...form.workDays,n+1].sort():form.workDays.filter(d=>d!==n+1)})}/>{name}</label>)}</div><div className="form-grid"><Field label="Çıkıştan teslimata iş günü"><input type="number" min="1" max="30" step="1" required value={form.transportDays} onChange={e=>setForm({...form,transportDays:Number(e.target.value)})}/></Field><Field label="Kapalı günler / tatiller" hint="Örnek: 2026-10-29, 2027-01-01"><input value={closed} onChange={e=>setClosed(e.target.value)}/></Field></div>{form.resources.map((r,n)=><Field key={r.id} label="Üretim birimi adı"><input required maxLength={200} value={r.name} onChange={e=>setForm({...form,resources:form.resources.map((item,index)=>index===n?{...item,name:e.target.value}:item)})}/></Field>)}<button disabled={busy} className="primary">Çalışma takvimini kaydet</button><p className="muted small">Verilen çalışma düzeni: hafta içi ortak hat; hazır olduğu gün çıkış, sonraki iş günü teslim. Cuma çıkış → pazartesi teslim. Ürünlerin günlük adet kapasitesini Ürünler ekranında girin.</p></form>;
}
