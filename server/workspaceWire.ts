import {DomainError} from '../src/domain.js';
const PART_CHARACTERS=350_000;
export function workspaceResponse(envelope:{state:{revision:number},documentId?:string},query:Record<string,unknown>={},mutation=false){
 const revision=envelope.state.revision;
 if(query.revision!==undefined&&String(revision)!==String(query.revision))throw new DomainError('Veriler aktarılırken güncellendi. Yeniden yükleyin.',409);
 const part=query.part===undefined?0:Number(query.part);
 if(!Number.isInteger(part)||part<0)throw new DomainError('Geçersiz veri bölümü.',400);
 const serialized=JSON.stringify(envelope),count=Math.ceil(serialized.length/PART_CHARACTERS);
 if(count<=1){if(part!==0)throw new DomainError('Veri bölümü bulunamadı.',400);return envelope;}
 if(mutation)return {reload:true,documentId:envelope.documentId};
 if(part>=count)throw new DomainError('Veri bölümü bulunamadı.',400);
 return {multipart:true,index:part,count,revision,data:serialized.slice(part*PART_CHARACTERS,(part+1)*PART_CHARACTERS)};
}
