export const publicAppOrigin='https://siparis-app-cf14.vercel.app';

function origin(value:string|undefined){
 if(!value)return '';
 try{return new URL(value).origin;}catch{return '';}
}

export function authRedirectOrigin(currentOrigin:string,configuredOrigin?:string){
 const current=origin(currentOrigin);
 if(current){
  const host=new URL(current).hostname;
  if(host==='localhost'||host==='127.0.0.1'||host==='[::1]')return current;
 }
 return origin(configuredOrigin)||publicAppOrigin;
}

export function authRedirectUrl(path='/',currentOrigin=location.origin,configuredOrigin=import.meta.env.VITE_PUBLIC_APP_URL){
 return new URL(path,authRedirectOrigin(currentOrigin,configuredOrigin)+'/').toString();
}
