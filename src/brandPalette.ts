export const fallbackColor='#176b60';

const validHex=(value:string)=>/^#[0-9a-f]{6}$/i.test(value);
const normalize=(value:string)=>validHex(value)?value.toLowerCase():fallbackColor;
const channels=(value:string)=>normalize(value).slice(1).match(/../g)!.map(part=>parseInt(part,16));
const hex=(values:number[])=>'#'+values.map(value=>Math.round(value).toString(16).padStart(2,'0')).join('');

export function mixHex(foreground:string,background:string,amount:number){
 const front=channels(foreground),back=channels(background),ratio=Math.max(0,Math.min(1,amount));
 return hex(front.map((value,index)=>value*ratio+back[index]*(1-ratio)));
}

export function logoColor(pixels:ArrayLike<number>):string {
 const buckets=new Map<string,{sum:number[],weight:number}>();
 for(let i=0;i+3<pixels.length;i+=4){const rgb=[pixels[i],pixels[i+1],pixels[i+2]],hi=Math.max(...rgb),lo=Math.min(...rgb);if(pixels[i+3]<180||hi<25||lo>225||hi-lo<30)continue;const weight=(hi-lo)/255;const key=rgb.map(v=>Math.floor(v/32)).join(',');const b=buckets.get(key)??{sum:[0,0,0],weight:0};b.weight+=weight;rgb.forEach((v,j)=>b.sum[j]+=v*weight);buckets.set(key,b);}
 const best=[...buckets.values()].sort((a,b)=>b.weight-a.weight)[0];return best?hex(best.sum.map(v=>v/best.weight)):fallbackColor;
}

export function luminance(value:string){const rgb=channels(value).map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;}

export function readableAccent(value:string){
 let rgb=channels(value),result=normalize(value);
 for(let i=0;i<40;i++){result=hex(rgb);if(1.05/(luminance(result)+.05)>=4.5)break;rgb=rgb.map(channel=>channel*.9);}
 return result;
}

export type BrandPalette=ReturnType<typeof brandPalette>;
export function brandPalette(value:string){
 const color=normalize(value),accent=readableAccent(color),deep=mixHex(accent,'#071419',.82),bright=mixHex(color,'#ffffff',.42);
 return {
  color,accent,deep,bright,
  pageLight:mixHex(color,'#f7f9f8',.035),
  surfaceLight:mixHex(color,'#ffffff',.018),
  raisedLight:mixHex(color,'#ffffff',.008),
  inkLight:mixHex(accent,'#182428',.1),
  mutedLight:mixHex(accent,'#68777b',.12),
  lineLight:mixHex(color,'#dfe6e3',.14),
  softLight:mixHex(color,'#ffffff',.1),
  washLight:mixHex(color,'#ffffff',.045),
  pageDark:mixHex(color,'#0f171b',.055),
  surfaceDark:mixHex(color,'#1a252a',.075),
  raisedDark:mixHex(color,'#223037',.09),
  inkDark:mixHex(bright,'#edf2f4',.04),
  mutedDark:mixHex(bright,'#a5b2b7',.1),
  lineDark:mixHex(color,'#394950',.2),
  softDark:mixHex(color,'#1a252a',.2),
  washDark:mixHex(color,'#1a252a',.1),
 };
}

export async function extractLogoColor(source:string){const bitmap=await createImageBitmap(await (await fetch(source)).blob());try{const canvas=document.createElement('canvas');canvas.width=64;canvas.height=64;const ctx=canvas.getContext('2d');if(!ctx)return fallbackColor;ctx.drawImage(bitmap,0,0,64,64);return logoColor(ctx.getImageData(0,0,64,64).data);}finally{bitmap.close();}}

export function updateThemeColor(){
 const root=document.documentElement,dark=root.dataset.theme==='dark',styles=getComputedStyle(root);
 const color=styles.getPropertyValue(dark?'--theme-color-dark':'--theme-color-light').trim()||styles.getPropertyValue('--teal').trim()||fallbackColor;
 document.querySelector('meta[name="theme-color"]')?.setAttribute('content',color);
}

export function applyBrand(value:string){
 const root=document.documentElement,palette=brandPalette(value);
 const variables:Record<string,string>={
  '--brand-color':palette.color,'--teal':palette.accent,'--brand-dark':palette.deep,'--brand-bright':palette.bright,
  '--brand-page-light':palette.pageLight,'--brand-surface-light':palette.surfaceLight,'--brand-raised-light':palette.raisedLight,
  '--brand-ink-light':palette.inkLight,'--brand-muted-light':palette.mutedLight,'--brand-line-light':palette.lineLight,
  '--brand-soft-light':palette.softLight,'--brand-wash-light':palette.washLight,
  '--brand-page-dark':palette.pageDark,'--brand-surface-dark':palette.surfaceDark,'--brand-raised-dark':palette.raisedDark,
  '--brand-ink-dark':palette.inkDark,'--brand-muted-dark':palette.mutedDark,'--brand-line-dark':palette.lineDark,
  '--brand-soft-dark':palette.softDark,'--brand-wash-dark':palette.washDark,
  '--theme-color-light':palette.accent,'--theme-color-dark':palette.pageDark,
 };
 for(const [name,color] of Object.entries(variables))root.style.setProperty(name,color);
 updateThemeColor();
}
