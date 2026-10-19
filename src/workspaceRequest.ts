import {DomainError,type State,type AppUser,type Command} from './domain.js';
export type StorageInfo={mode:'legacy'|'records',limitBytes:number,bytes:number};
export type Envelope={state:State,user:AppUser,documentId?:string,storage?:StorageInfo};
export type Mutation={requestId:string,revision:number,command:Command};
export async function fetchWorkspace(token:string,body?:Mutation,knownRevision?:number):Promise<Envelope|null>{
 const call=async(query:string,mutation?:Mutation)=>{
  const response=await fetch('/api/workspace'+query,{method:mutation?'POST':'GET',headers:{Authorization:'Bearer '+token,...(mutation?{'Content-Type':'application/json'}:{})},...(mutation?{body:JSON.stringify(mutation)}:{}),signal:AbortSignal.timeout(20000)});
  let data;try{data=await response.json();}catch{throw new DomainError('Sunucu geçerli yanıt vermedi. Bağlantı yeniden denenebilir.',response.status>=500?response.status:503);}
  if(!response.ok)throw new DomainError(data.error??'İşlem başarısız.',response.status);return data;
 };
 let data=await call(!body&&knownRevision!==undefined?'?knownRevision='+knownRevision:'',body);
 if(data.unchanged)return null;
 if(data.reload){try{const refreshed=await fetchWorkspace(token);if(!refreshed)throw new Error();return {...refreshed,documentId:data.documentId};}catch{throw new Error('İşlem sunucuda kaydedildi; güncel liste alınamadı. Aynı işlemi aynı bilgilerle yeniden deneyin; çift kayıt oluşturulmaz.');}}
 if(!data.multipart)return data as Envelope;
 const {count,revision}=data;if(!Number.isInteger(count)||count<2||count>256||data.index!==0)throw new Error('Veri aktarımı geçersiz.');
 const parts=[data.data];
 for(let part=1;part<count;part++){
  data=await call('?part='+part+'&revision='+revision);
  if(!data.multipart||data.index!==part||data.count!==count||data.revision!==revision||typeof data.data!=='string')throw new Error('Veriler aktarım sırasında değişti. Yeniden yükleyin.');parts.push(data.data);
 }
 return JSON.parse(parts.join('')) as Envelope;
}
