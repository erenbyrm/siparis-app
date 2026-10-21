import {Settings} from './Settings';
import {Approvals} from './Approvals';
import {ThemeLifecycle} from './ThemeControl';
import {ConnectionBanner} from './InstallApp';
import {Documents} from './DocumentsPage';
import {StockRequests} from './StockRequestsPage';
import React,{useState,useRef} from 'react';
import {PackageCheck,ShoppingBag,Plus,Boxes,Settings as SettingsIcon,History,LogOut,RefreshCw,X,Menu} from 'lucide-react';
import {appRoleName,roleNames,roles} from './domain';
import {StoreProvider,useStore} from './store';
import {Login,PasswordReset} from './Login';
import {Orders} from './Orders';
import {OrderForm} from './OrderForm';
import {Production} from './ProductionPage';
import {CompanyLogo,CompanyWelcome,BrandingLifecycle,LoginBrand} from './CompanySettings';
import {Warehouse,StockCount} from './Warehouse';
import {defaultCompany} from './company';
import {Today} from './Today';
import {LanguageProvider,useLanguage} from './LanguageControl';
import {t} from './localization';
type Tab='today'|'approvals'|'orders'|'new'|'settings'|'production'|'warehouse'|'count'|'documents'|'requests';
function Workspace(){
 useLanguage();
 const {mode,state,user,busy,loading,error,notice,uncertain,setError,setNotice,switchDemo,logout,refresh,resolveUncertain,connected}=useStore();const [tab,setTab]=useState<Tab>('today');const mobileMenu=useRef<HTMLDialogElement>(null);
 if(mode==='signed-out')return <Login/>;
 if(mode==='cloud'&&new URLSearchParams(location.search).has('reset'))return <><div role="alert">{t(error)}</div><PasswordReset/></>;
 if(!state||!user){
  if(!loading&&error)return <main className="loading-page"><LoginBrand/><h1>{t("Bağlantı kurulamadı")}</h1><p role="alert">{t(error)}</p><div className="actions"><button onClick={refresh}>{t("Tekrar dene")}</button><button onClick={logout}>{t("Giriş ekranına dön")}</button></div></main>;
  return <main className="launch-screen" aria-label={t("Çalışma alanı hazırlanıyor")} aria-busy="true"><img src="/icons/sozbir-icon-512-v1.png" alt={t("SÖZBİR Merdiven")}/></main>;
 }
 const company=state.company??defaultCompany();
 const admin=user.role==='admin',sales=admin||user.role==='pazarlamaci';
 const depot=admin||user.role==='sevkiyat';
 const planning=admin||user.role==='uretim';
 const selected:Tab=(!admin&&['approvals'].includes(tab))||(!sales&&tab==='new')||(!planning&&tab==='production')||(!depot&&tab==='count')||(!depot&&!planning&&tab==='requests')?'orders':tab;
 const navigate=(t:Tab)=>{if(busy)return;mobileMenu.current?.close();setTab(t);setError('');setNotice('');window.scrollTo({top:0});};
 const pendingCount=state.orders.filter(o=>o.status==='Yönetici Onayı Bekleniyor').length+(state.stockRequests??[]).filter(r=>r.status==='Onay bekliyor').length+(state.inventory?.adjustments??[]).filter(r=>r.status==='pending').length+(state.inventory?.discrepancies??[]).filter(r=>r.status==='pending').length;
 const nav:[Tab,string,React.ReactNode][]=[['today',t('Bugün'),<PackageCheck size={18}/>],...(admin?[['approvals',t('Onaylar')+(pendingCount?' ('+pendingCount+')':''),<PackageCheck size={18}/>] as [Tab,string,React.ReactNode]]:[]),['documents',t('Belgeler'),<History size={18}/>],...((depot||planning)?[['requests',t('Stok talepleri'),<Boxes size={18}/>] as [Tab,string,React.ReactNode]]:[]),['warehouse',t('Depo ve stok'),<Boxes size={18}/>],...(depot?[['count',t('Stok Sayımı'),<PackageCheck size={18}/>] as [Tab,string,React.ReactNode]]:[]),['orders',t('Siparişler'),<ShoppingBag size={18}/>],...(planning?[['production',t('Üretim programı'),<PackageCheck size={18}/>] as [Tab,string,React.ReactNode]]:[]),...(sales?[['new',t('Yeni sipariş'),<Plus size={18}/>] as [Tab,string,React.ReactNode]]:[]),['settings',t('Ayarlar'),<SettingsIcon size={18}/>]];
 const mobileTabs:Tab[]=admin?['today','orders','warehouse']:sales?['today','orders','new']:planning?['today','orders','production']:['today','orders','warehouse'];
 return <div className="app-shell"><aside className="sidebar"><div className="brand"><CompanyLogo company={company}/><div>{company.name}<small>{t("Ekibinizin çalışma alanı")}</small></div></div><nav aria-label={t("Ana menü")}>{nav.map(([key,name,icon])=><button key={key} className={selected===key?'selected':''} aria-current={selected===key?'page':undefined} onClick={()=>navigate(key)}>{icon}{name}</button>)}</nav><div className="sidebar-bottom"><span>{t("Sürüm 0.13.0")}</span><small>{t("Satış · Üretim · Sevkiyat")}</small></div></aside><div className="workspace"><header className="topbar"><div><strong className="current-user">{user.name}</strong><span>{t(appRoleName(user))}</span></div><div className="actions"><span className={'connection '+(!connected?'offline':'')}>{mode==='demo'?t("Yerel deneme"):connected?t("Ekip verisi bağlı"):t("Bağlantı kesildi")}</span><button className="icon-button" aria-label={t("Verileri yenile")} onClick={refresh} disabled={busy}><RefreshCw size={18}/></button><button className="logout-button" aria-label={t("Çıkış yap")} onClick={logout} disabled={busy}><LogOut size={16}/><span>{t("Çıkış")}</span></button></div></header>{mode==='demo'&&<div className="demo-banner"><div><strong>{t("Deneme alanı")}</strong><span>{t("Örnek kullanım. Veriler yalnızca bu tarayıcıda saklanır.")}</span></div><label>{t("Rolü dene")}<select aria-label={t("Deneme rolü")} value={user.id} disabled={busy} onChange={e=>{switchDemo(e.target.value);setTab('today');}}>{roles.map(r=><option key={r} value={'demo-'+({admin:'admin',pazarlamaci:'sales',uretim:'production',sevkiyat:'shipping'}[r])}>{t(r==='admin'?'ADMİN':roleNames[r])}</option>)}</select></label></div>}<main className="content"><CompanyWelcome/>{uncertain&&<div className="alert error uncertain-operation" role="alert"><span>{t("Son işlemin sunucuda kaydolup kaydolmadığı doğrulanamadı. Yeni kayıt oluşturmadan sonucu kontrol edin.")}</span><button disabled={busy||!connected} onClick={()=>void resolveUncertain()}>{t("Son işlemi doğrula")}</button></div>}{error&&<div className="alert error" role="alert"><span>{t(error)}</span><button aria-label={t("Hata mesajını kapat")} onClick={()=>setError('')}><X size={16}/></button></div>}{notice&&<div className="alert success" role="status"><span>{t(notice)}</span><button aria-label={t("Bildirim kapat")} onClick={()=>setNotice('')}><X size={16}/></button></div>}{selected==='today'&&<Today onNavigate={navigate}/>} {selected==='approvals'&&admin&&<Approvals/>}{selected==='orders'&&<Orders onNew={()=>navigate('new')}/>} {selected==='new'&&<OrderForm key={mode+user.id} onSaved={()=>navigate('orders')}/>} {selected==='settings'&&<Settings key={user.id}/>} {selected==='production'&&<Production/>}{selected==='warehouse'&&<Warehouse/>}{selected==='count'&&<StockCount/>}{selected==='documents'&&<Documents/>}{selected==='requests'&&<StockRequests/>}</main></div><nav className="mobile-nav" aria-label={t("Telefon menüsü")}>{mobileTabs.map(key=>{const entry=nav.find(n=>n[0]===key)!;return <button key={key} disabled={busy} aria-current={selected===key?'page':undefined} className={selected===key?'selected':''} onClick={()=>navigate(key)}>{entry[2]}<span>{key==='warehouse'?t("Depo"):key==='production'?t("Üretim"):key==='requests'?t("Talepler"):key==='count'?t("Sayım"):entry[1]}</span></button>;})}<button aria-label={t("Tüm menüyü aç")} aria-haspopup="dialog" onClick={()=>mobileMenu.current?.showModal()}><Menu size={20}/><span>{t("Menü")}</span></button></nav><dialog ref={mobileMenu} className="mobile-menu" aria-labelledby="mobile-menu-title"><div className="mobile-menu-head"><div><small>{company.name}</small><h2 id="mobile-menu-title">{t("Tüm işlemler")}</h2></div><button aria-label={t("Menüyü kapat")} onClick={()=>mobileMenu.current?.close()}><X size={20}/></button></div><nav aria-label={t("Tüm işlemler menüsü")}>{nav.map(([key,name,icon])=><button disabled={busy} key={key} aria-current={selected===key?'page':undefined} className={selected===key?'selected':''} onClick={()=>navigate(key)}>{icon}<span>{name}</span></button>)}</nav><p className="muted small">{user.name} · {t(appRoleName(user))}</p></dialog></div>;
}
export default function App(){return <StoreProvider><LanguageProvider><ThemeLifecycle/><BrandingLifecycle/><ConnectionBanner/><Workspace/></LanguageProvider></StoreProvider>;}
