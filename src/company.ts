import {z} from 'zod';
const image=(max:number)=>z.string().max(max,'Görsel boyutu sınırı aşıldı.').refine(v=>v===''||/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(v),'PNG, JPEG veya WebP görsel seçin.');
export const companySchema=z.object({name:z.string().trim().min(1,'Şirket adını girin.').max(120),legalName:z.string().trim().max(200).default(''),phone:z.string().trim().max(50).default(''),email:z.union([z.literal(''),z.email().max(254)]).default(''),address:z.string().trim().max(600).default(''),website:z.string().trim().max(200).refine(v=>!v||/^https?:\/\/[^\s]+$/i.test(v),'Web adresi https:// ile başlamalı.').default(''),taxOffice:z.string().trim().max(100).default(''),taxNumber:z.string().trim().max(30).default(''),logo:image(90000).default(''),photo:image(220000).default('')});
export type Company=z.infer<typeof companySchema>;
export const defaultCompany=():Company=>({name:'Mobil Sipariş',legalName:'',phone:'',email:'',address:'',website:'',taxOffice:'',taxNumber:'',logo:'',photo:''});
const key='siparis_branding_v1';
export function rememberedBrand(){try{const raw=JSON.parse(localStorage.getItem(key)??'null');return companySchema.parse({...defaultCompany(),name:raw.name,logo:raw.logo});}catch{return defaultCompany();}}
export function rememberBrand(company:Company){try{localStorage.setItem(key,JSON.stringify({name:company.name,logo:company.logo}));}catch{/* Branding cache must never block the workspace. */}}
// Decode then re-encode raster uploads; never embed arbitrary files or SVG markup.
export async function prepareCompanyImage(file:File,kind:'logo'|'photo'):Promise<string>{
 if(!['image/png','image/jpeg','image/webp'].includes(file.type))throw new Error('PNG, JPEG veya WebP görsel seçin.');
 if(file.size>8*1024*1024)throw new Error('Görsel en fazla 8 MB olabilir.');
 const bitmap=await createImageBitmap(file);
 try{
  if(bitmap.width*bitmap.height>40_000_000)throw new Error('Görsel çözünürlüğü çok büyük. Daha küçük bir görsel seçin.');
  const max=kind==='logo'?320:1200,ratio=Math.min(1,max/Math.max(bitmap.width,bitmap.height));
  const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.width*ratio));canvas.height=Math.max(1,Math.round(bitmap.height*ratio));
  const context=canvas.getContext('2d');if(!context)throw new Error('Görsel işlenemedi.');context.drawImage(bitmap,0,0,canvas.width,canvas.height);
  const limit=kind==='logo'?90000:220000;
  for(const quality of [0.85,0.7,0.5,0.3]){const data=canvas.toDataURL('image/webp',quality);if(data.length<=limit)return data;}
  throw new Error('Bu görsel yeterince küçültülemedi. Daha sade veya küçük bir görsel seçin.');
 }finally{bitmap.close();}
}
