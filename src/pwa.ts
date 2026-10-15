type InstallEvent=Event&{prompt:()=>Promise<void>;userChoice:Promise<{outcome:'accepted'|'dismissed'}>};
type Snapshot={available:boolean,installed:boolean,update:boolean,error:string};
let promptEvent:InstallEvent|null=null;
let snapshot:Snapshot={available:false,installed:false,update:false,error:''};
const listeners=new Set<()=>void>();
const publish=(patch:Partial<Snapshot>)=>{snapshot={...snapshot,...patch};listeners.forEach(fn=>fn());};
export const subscribeInstall=(fn:()=>void)=>{listeners.add(fn);return()=>{listeners.delete(fn);};};
export const installSnapshot=()=>snapshot;
export async function installApp(){
 if(!promptEvent)return;
 const event=promptEvent;promptEvent=null;publish({available:false,error:''});
 try{await event.prompt();await event.userChoice;}catch{publish({error:'Kurulum açılamadı. Tarayıcınızın menüsünden ana ekrana ekleyebilirsiniz.'});}
}
export function setupInstall(){
 const standalone=window.matchMedia('(display-mode: standalone)');
 const sync=()=>publish({installed:standalone.matches||(navigator as Navigator&{standalone?:boolean}).standalone===true});sync();standalone.addEventListener('change',sync);
 window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();promptEvent=event as InstallEvent;publish({available:true});});
 window.addEventListener('appinstalled',()=>{promptEvent=null;publish({installed:true,available:false});});
 // Only release builds register a worker. Development never caches application code.
 if(import.meta.env.PROD&&'serviceWorker' in navigator){
  void navigator.serviceWorker.register('/sw.js',{scope:'/',updateViaCache:'none'}).then(reg=>{
   if(reg.waiting)publish({update:true});
   reg.addEventListener('updatefound',()=>{const worker=reg.installing;worker?.addEventListener('statechange',()=>{if(worker.state==='installed'&&navigator.serviceWorker.controller)publish({update:true});});});
  }).catch(()=>publish({error:'Çevrimdışı bağlantı ekranı hazırlanamadı. İnternet varken uygulamayı kullanabilir, sonra yeniden açabilirsiniz.'}));
 }
}
