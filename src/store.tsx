import {fetchWorkspace,type Envelope,type StorageInfo} from './workspaceRequest';
import {createWorkspaceLoader} from './workspaceLoader';
import React,{createContext,useContext,useEffect,useRef,useState} from 'react';
import {createClient,type SupabaseClient} from '@supabase/supabase-js';
import {createDemo} from './demo';
import {DomainError,execute,stateForUser,validateState,type State,type AppUser,type Command} from './domain';
const DEMO_KEY='siparis_demo_v2';
const URL=import.meta.env.VITE_SUPABASE_URL;
const KEY=import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
export const cloudConfigured=!!(URL&&KEY);
export const auth:SupabaseClient|null=cloudConfigured?createClient(URL,KEY):null;
type Mode='signed-out'|'demo'|'cloud';
type ContextValue={storage:StorageInfo|null,snapshot:()=>Promise<State>,lastDocumentId:string|null,mode:Mode,state:State|null,user:AppUser|null,busy:boolean,loading:boolean,error:string,connected:boolean,notice:string,setError:(e:string)=>void,setNotice:(s:string)=>void,startDemo:()=>void,switchDemo:(id:string)=>void,logout:()=>Promise<void>,refresh:()=>Promise<void>,run:(command:Command)=>Promise<boolean>};
const Context=createContext<ContextValue|null>(null);
export const message=(error:unknown)=>error instanceof Error?error.message:'İşlem tamamlanamadı.';
async function request(body?:{requestId:string,revision:number,command:Command},knownRevision?:number):Promise<Envelope|null>{
 const session=await auth?.auth.getSession();const token=session?.data.session?.access_token;
 if(!token)throw new DomainError('Oturum açın.',401);
 return fetchWorkspace(token,body,knownRevision);
}
export function StoreProvider({children}:{children:React.ReactNode}){
 const [mode,setMode]=useState<Mode>('signed-out'),[state,setState]=useState<State|null>(null),[user,setUser]=useState<AppUser|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState(''),[connected,setConnected]=useState(true);
 const [storage,setStorage]=useState<StorageInfo|null>(null);
 const [loading,setLoading]=useState(false),[loadError,setLoadError]=useState('');
 const authUserId=useRef<string|null>(null);
 const [lastDocumentId,setLastDocumentId]=useState<string|null>(null);
 const demo=useRef<State|null>(null),modeRef=useRef(mode),userRef=useRef(user),pending=useRef(false),generation=useRef(0);
 const uncertain=useRef<{requestId:string,revision:number,command:Command}|null>(null);
 const appliedRevision=useRef(-1);
 modeRef.current=mode;userRef.current=user;
 const apply=(data:Envelope,documentCreated=false)=>{if(data.state.revision<appliedRevision.current)return;appliedRevision.current=data.state.revision;setState(data.state);setStorage(data.storage??null);setUser(data.user);setConnected(true);if(documentCreated)setLastDocumentId(data.documentId??null);};
 const loaderRef=useRef<ReturnType<typeof createWorkspaceLoader<Envelope|null>>|null>(null);
 if(!loaderRef.current)loaderRef.current=createWorkspaceLoader<Envelope|null>({
  read:()=>request(undefined,appliedRevision.current),
  success:data=>{if(data)apply(data);else setConnected(true);setLoadError('');},
  failure:e=>{setConnected(false);setLoadError(message(e));if(e instanceof DomainError&&[401,403].includes(e.status)){setState(null);setUser(null);}},
  loading:setLoading,
  retryable:e=>!(e instanceof DomainError)||e.status===409||e.status>=500
 });
 const refresh=async()=>{
  if(modeRef.current==='cloud')return loaderRef.current!.refresh();
  if(modeRef.current!=='demo'||!userRef.current)return;
  try{const raw=localStorage.getItem(DEMO_KEY);if(!raw)throw new Error('Deneme kaydı bulunamadı.');const s=validateState(JSON.parse(raw));const u=s.users.find(x=>x.id===userRef.current?.id&&x.active);if(!u)throw new Error('Kullanıcı pasif. Çıkış yapıp başka rol seçin.');demo.current=s;apply({state:stateForUser(s,u),user:u});setLoadError('');}catch(e){setConnected(false);setLoadError(message(e));}
 };
 useEffect(()=>{
  if(!auth)return;
  const {data:{subscription}}=auth.auth.onAuthStateChange((_event,session)=>{
   if(modeRef.current==='demo')return;
   if(session){
    if(authUserId.current!==session.user.id||modeRef.current!=='cloud'){
     generation.current++;loaderRef.current!.invalidate();appliedRevision.current=-1;authUserId.current=session.user.id;uncertain.current=null;setLastDocumentId(null);
     setState(null);setUser(null);userRef.current=null;setError('');setLoadError('');setConnected(true);setLoading(true);
    }
    setMode('cloud');modeRef.current='cloud';setTimeout(()=>void refresh(),0);
   }else{generation.current++;loaderRef.current!.invalidate();authUserId.current=null;uncertain.current=null;setLastDocumentId(null);appliedRevision.current=-1;modeRef.current='signed-out';setMode('signed-out');setState(null);setUser(null);setLoadError('');}
  });return()=>{subscription.unsubscribe();loaderRef.current!.invalidate();};
 },[]);
 useEffect(()=>{const timer=setInterval(()=>{if(document.visibilityState==='visible'&&!pending.current)void refresh();},15000);const reload=()=>{if(!pending.current)void refresh();};window.addEventListener('focus',reload);window.addEventListener('storage',reload);return()=>{clearInterval(timer);window.removeEventListener('focus',reload);window.removeEventListener('storage',reload);};},[mode]);
 const startDemo=()=>{try{const raw=localStorage.getItem(DEMO_KEY);const s=raw?validateState(JSON.parse(raw)):createDemo();if(!raw)localStorage.setItem(DEMO_KEY,JSON.stringify(s));loaderRef.current!.invalidate();setLoadError('');appliedRevision.current=-1;demo.current=s;const u=s.users.find(u=>u.role==='admin'&&u.active)!;generation.current++;setMode('demo');modeRef.current='demo';apply({state:stateForUser(s,u),user:u});setError('');}catch(e){setError('Deneme kaydı okunamadı. Mevcut kayıt korunuyor. '+message(e));}};
 const switchDemo=(id:string)=>{setLastDocumentId(null);if(pending.current)return;const u=demo.current?.users.find(u=>u.id===id&&u.active);if(u&&demo.current)apply({state:stateForUser(demo.current,u),user:u});};
 const logout=async()=>{setLastDocumentId(null);if(pending.current)return;generation.current++;loaderRef.current!.invalidate();authUserId.current=null;setLoadError('');appliedRevision.current=-1;setMode('signed-out');modeRef.current='signed-out';setState(null);setUser(null);uncertain.current=null;setError('');setNotice('');if(auth)await auth.auth.signOut();};
 const run=async(command:Command)=>{
  if(pending.current||!state||!user)return false;
  if(mode==='cloud'&&!navigator.onLine){setError('İnternet bağlantısı yok. İşlem gönderilmedi. Bağlantı gelince verileri yenileyip tekrar deneyin.');return false;}
  if(!connected){setError('Bağlantı doğrulanmadan değişiklik kaydedilemez. Önce Yenile düğmesini kullanın.');return false;}
  const mutationGeneration=generation.current;pending.current=true;setBusy(true);setError('');setNotice('');
  try{
   if(mode==='demo'){
    const update=async()=>{const raw=localStorage.getItem(DEMO_KEY);if(!raw)throw new Error('Deneme kaydı yok.');const disk=validateState(JSON.parse(raw));if(disk.revision!==state.revision)throw new DomainError('Diğer sekmede değişiklik yapıldı. Yenileyip tekrar deneyin.',409);const next=execute(disk,user.id,command);localStorage.setItem(DEMO_KEY,JSON.stringify(next));demo.current=next;const u=next.users.find(x=>x.id===user.id)!;apply({state:stateForUser(next,u),user:u,documentId:next.documentBook?.records.at(-1)?.id},true);};
    if(navigator.locks)await navigator.locks.request('siparis-demo-write',update);else await update();
   }else{
    if(uncertain.current&&JSON.stringify(uncertain.current.command)!==JSON.stringify(command))throw new Error('Önce sonucu belirsiz önceki işlemi aynı bilgilerle yeniden deneyin.');
    const body=uncertain.current??{requestId:crypto.randomUUID(),revision:state.revision,command};uncertain.current=body;
    try{const data=await request(body);if(!data)throw new Error('İşlem sonucu alınamadı.');if(mutationGeneration!==generation.current)return false;apply(data,true);uncertain.current=null;}catch(e){if(e instanceof DomainError&&e.status<500)uncertain.current=null;throw e;}
   }
   setNotice('İşlem kaydedildi.');return true;
  }catch(e){if(mutationGeneration!==generation.current)return false;setError(message(e));if(e instanceof DomainError&&e.status===409)await refresh();return false;}
  finally{pending.current=false;setBusy(false);}
 };
 const snapshot=async()=>{const gen=generation.current;if(modeRef.current==='cloud'){const data=await request();if(gen!==generation.current)throw new Error('Oturum değişti. Yeni hesabınızla yeniden yedek alın.');if(!data||data.user.role!=='admin')throw new Error('Yedek için yönetici girişi gerekli.');apply(data);return data.state;}const raw=localStorage.getItem(DEMO_KEY);if(!raw)throw new Error('Deneme kaydı bulunamadı.');return validateState(JSON.parse(raw));};
 return <Context.Provider value={{storage,snapshot,lastDocumentId,mode,state,user,busy,loading,error:error||loadError,connected,notice,setError,setNotice,startDemo,switchDemo,logout,refresh,run}}>{children}</Context.Provider>;
}
export function useStore(){const value=useContext(Context);if(!value)throw new Error('StoreProvider required');return value;}
