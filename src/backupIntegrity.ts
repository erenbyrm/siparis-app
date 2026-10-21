import {makeBackup,readImport} from './imports';
import type {State} from './domain';
async function digest(value:unknown){const bytes=new TextEncoder().encode(JSON.stringify(value));const result=await crypto.subtle.digest('SHA-256',bytes);return Array.from(new Uint8Array(result),n=>n.toString(16).padStart(2,'0')).join('');}
export async function checkedBackup(state:State){const backup=makeBackup(state);return {...backup,checksum:{algorithm:'SHA-256',digest:await digest(backup)}};}
export async function verifyBackup(raw:string){
 if(new TextEncoder().encode(raw).length>40_000_000)throw new Error('Yedek 40 MB sınırını aşıyor.');
 const parsed=JSON.parse(raw);
 if(!parsed.checksum)return false;
 if(parsed.checksum.algorithm!=='SHA-256'||typeof parsed.checksum.digest!=='string'||parsed.checksum.digest!==await digest({format:parsed.format,version:parsed.version,exportedAt:parsed.exportedAt,data:parsed.data}))throw new Error('Yedek dosyasının bütünlük kontrolü başarısız. Dosya değişmiş veya eksik; özgün yedeği kullanın.');
 return true;
}
export async function checkedImport(raw:string){const verified=await verifyBackup(raw),result=readImport(raw);return {...result,warnings:[verified?'Dosya bütünlüğü doğrulandı.':'Bu eski yedekte bütünlük bilgisi yok; içeriği kontrol edin.',...result.warnings]};}
