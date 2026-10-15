import {DomainError,emptyState,newId,type State,type AppUser} from '../src/domain';
export function authorizeIdentity(state:State,identity:{email?:string,emailConfirmed:boolean},bootstrapEmail:string|undefined):AppUser{
 const email=identity.email?.trim().toLowerCase();if(!email||!identity.emailConfirmed)throw new DomainError('E-posta adresinizi doğrulayın.',403);
 if(state.users.length===0&&bootstrapEmail?.trim().toLowerCase()===email){state.users.push({id:newId(),name:'Yönetici',email,role:'admin',active:true});state.revision++;}
 const actor=state.users.find(u=>u.email.toLowerCase()===email&&u.active);
 if(!actor)throw new DomainError('Erişim tanımlı değil. Yöneticinizden bu e-postayı kullanıcı listesine eklemesini isteyin.',403);return actor;
}
