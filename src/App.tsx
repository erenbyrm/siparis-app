import React,{useState} from 'react';
import {PackageCheck,ShoppingBag,Plus,Boxes,Users as UsersIcon,Contact,Database,History,LogOut,RefreshCw,X} from 'lucide-react';
import {roleNames,roles} from './domain';
import {StoreProvider,useStore} from './store';
import {Login,PasswordReset} from './Login';
import {Orders} from './Orders';
import {OrderForm} from './OrderForm';
import {Products,Customers,Users} from './Management';
import {Backups,Audit} from './Backups';
import {Production} from './ProductionPage';
import {CompanySettings,CompanyLogo,CompanyWelcome,BrandingLifecycle,LoginBrand} from './CompanySettings';
import {defaultCompany} from './company';
type Tab='orders'|'new'|'products'|'customers'|'users'|'backups'|'audit'|'production'|'company';
function Workspace(){
 const {mode,state,user,busy,error,notice,setError,setNotice,switchDemo,logout,refresh,connected}=useStore();const [tab,setTab]=useState<Tab>('orders');
 if(mode==='signed-out')return <Login/>;
 if(mode==='cloud'&&new URLSearchParams(location.search).has('reset'))return <><div role="alert">{error}</div><PasswordReset/></>;
 if(!state||!user)return <main className="loading-page"><LoginBrand/><h1>Çalışma alanı</h1><p role="alert">{error||'Veriler yükleniyor…'}</p><div className="actions"><button onClick={refresh}>Tekrar dene</button><button onClick={logout}>Giriş ekranına dön</button></div></main>;
 const company=state.company??defaultCompany();
 const admin=user.role==='admin',sales=admin||user.role==='pazarlamaci';
 const planning=admin||user.role==='uretim';
 const selected:Tab=(!admin&&['products','customers','users','backups','audit','company'].includes(tab))||(!sales&&tab==='new')||(!planning&&tab==='production')?'orders':tab;
 const navigate=(t:Tab)=>{if(busy)return;setTab(t);setError('');setNotice('');window.scrollTo({top:0});};
 const nav:[Tab,string,React.ReactNode][]=[['orders','Siparişler',<ShoppingBag size={18}/>],...(planning?[['production','Üretim programı',<PackageCheck size={18}/>] as [Tab,string,React.ReactNode]]:[]),...(sales?[['new','Yeni sipariş',<Plus size={18}/>] as [Tab,string,React.ReactNode]]:[]),...(admin?[['company','Şirket bilgileri',<Contact size={18}/>],['products','Ürünler',<Boxes size={18}/>],['customers','Müşteriler',<Contact size={18}/>],['users','Kullanıcılar',<UsersIcon size={18}/>],['backups','Yedekleme',<Database size={18}/>],['audit','İşlem geçmişi',<History size={18}/>]] as [Tab,string,React.ReactNode][]:[])];
 return <div className="app-shell"><aside className="sidebar"><div className="brand"><CompanyLogo company={company}/><div>{company.name}<small>Ekibinizin çalışma alanı</small></div></div><nav aria-label="Ana menü">{nav.map(([key,name,icon])=><button key={key} className={selected===key?'selected':''} aria-current={selected===key?'page':undefined} onClick={()=>navigate(key)}>{icon}{name}</button>)}</nav><div className="sidebar-bottom"><span>Sürüm 0.4.0</span><small>Satış · Üretim · Sevkiyat</small></div></aside><div className="workspace"><header className="topbar"><div><strong className="current-user">{user.name}</strong><span>{roleNames[user.role]}</span></div><div className="actions"><span className={'connection '+(!connected?'offline':'')}>{mode==='demo'?'Yerel deneme':connected?'Ekip verisi bağlı':'Bağlantı kesildi'}</span><button className="icon-button" aria-label="Verileri yenile" onClick={refresh} disabled={busy}><RefreshCw size={18}/></button><button aria-label="Çıkış yap" onClick={logout} disabled={busy}><LogOut size={16}/><span>Çıkış</span></button></div></header>{mode==='demo'&&<div className="demo-banner"><div><strong>Deneme alanı</strong><span>Örnek kullanım. Veriler yalnızca bu tarayıcıda saklanır.</span></div><label>Rolü dene<select aria-label="Deneme rolü" value={user.id} disabled={busy} onChange={e=>{switchDemo(e.target.value);setTab('orders');}}>{roles.map(r=><option key={r} value={'demo-'+({admin:'admin',pazarlamaci:'sales',uretim:'production',sevkiyat:'shipping'}[r])}>{roleNames[r]}</option>)}</select></label></div>}<main className="content"><CompanyWelcome/>{error&&<div className="alert error" role="alert"><span>{error}</span><button aria-label="Hata mesajını kapat" onClick={()=>setError('')}><X size={16}/></button></div>}{notice&&<div className="alert success" role="status"><span>{notice}</span><button aria-label="Bildirim kapat" onClick={()=>setNotice('')}><X size={16}/></button></div>}{selected==='orders'&&<Orders onNew={()=>navigate('new')}/>} {selected==='new'&&<OrderForm key={mode+user.id} onSaved={()=>navigate('orders')}/>} {selected==='products'&&<Products/>}{selected==='customers'&&<Customers/>}{selected==='users'&&<Users/>}{selected==='backups'&&<Backups/>}{selected==='audit'&&<Audit/>}{selected==='production'&&<Production/>}{selected==='company'&&<CompanySettings/>}</main></div></div>;
}
export default function App(){return <StoreProvider><BrandingLifecycle/><Workspace/></StoreProvider>;}
