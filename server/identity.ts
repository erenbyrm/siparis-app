import {DomainError,newId,type State,type AppUser} from '../src/domain.js';
export function authorizeIdentity(state:State,identity:{email?:string,emailConfirmed:boolean},bootstrapEmail:string|undefined,recoveryAdminEmail?:string):AppUser{
 const email=identity.email?.trim().toLowerCase();if(!email||!identity.emailConfirmed)throw new DomainError('E-posta adresinizi doğrulayın.',403);
 const configured=(value:string|undefined)=>value?.split(',').map(item=>item.trim().toLowerCase()).filter(Boolean)??[];
 const bootstrapEmails=configured(bootstrapEmail),systemAdminEmails=[...new Set([...bootstrapEmails,...configured(recoveryAdminEmail)])];
 if(systemAdminEmails.includes(email)){
  const byEmail=(candidate:string)=>state.users.find(user=>user.email.toLowerCase()===candidate);
  let actor=bootstrapEmails.map(byEmail).find(Boolean)??state.users.find(user=>user.isSystemAdmin)??systemAdminEmails.map(byEmail).find(Boolean);
  if(!actor){actor={id:newId(),name:'EREN BAYRAM',email:bootstrapEmails[0]??email,role:'admin',active:true,isSystemAdmin:true};state.users.push(actor);state.revision++;return actor;}
  if(!actor.active)throw new DomainError('Erişim tanımlı değil. Yöneticinizden bu e-postayı kullanıcı listesine eklemesini isteyin.',403);
  let changed=false;if(!actor.isSystemAdmin||actor.role!=='admin'){actor.isSystemAdmin=true;actor.role='admin';changed=true;}
  if(actor.name!=='EREN BAYRAM'){actor.name='EREN BAYRAM';changed=true;}if(changed)state.revision++;return actor;
 }
 const actor=state.users.find(u=>u.email.toLowerCase()===email&&u.active);
 if(!actor)throw new DomainError('Erişim tanımlı değil. Yöneticinizden bu e-postayı kullanıcı listesine eklemesini isteyin.',403);return actor;
}
