import {jsPDF} from 'jspdf';
import {pdfFont} from './pdfFont';
import type {BusinessDocument} from './documents';
import type {Company} from './company';
// PDF generation uses only the immutable document snapshot and its saved brand.
export function documentPDF(record:BusinessDocument,company:Company):Blob{
 const pdf=new jsPDF({unit:'mm',format:'a4',compress:true,putOnlyUsedFonts:true});pdf.addFileToVFS('TurkishSans.ttf',pdfFont);pdf.addFont('TurkishSans.ttf','TurkishSans','normal');pdf.setFont('TurkishSans');pdf.setCreationDate(new Date(record.at));pdf.setFileId(record.id.replaceAll('-','').padEnd(32,'0').slice(0,32));pdf.setProperties({title:record.title+' '+record.number,subject:record.orderNumber??record.relatedNumber??record.number,author:company.name,creator:'Mobil Sipariş'});
 const left=16,right=194,width=178,bottom=278;let y=18;
 const clean=(text:string)=>text.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g,'');
 const newPage=()=>{pdf.addPage();pdf.setFont('TurkishSans');pdf.setFontSize(9);pdf.setTextColor(90);pdf.text(record.number+' / '+record.title,left,14);y=23;};
 const ensure=(height:number)=>{if(y+height>bottom)newPage();};
 const paragraph=(text:string,size=10,color=35)=>{pdf.setFontSize(size);pdf.setTextColor(color);const lines=pdf.splitTextToSize(clean(text),width) as string[];for(const line of lines){ensure(size*.45+1);pdf.text(line,left,y);y+=size*.45+1;}y+=2;};
 let logoWidth=0;if(company.logo){const info=pdf.getImageProperties(company.logo);const h=Math.min(22,30*info.height/info.width),w=h*info.width/info.height;pdf.addImage(company.logo,info.fileType,left,y,w,h);logoWidth=w+6;}
 pdf.setTextColor(22,77,70);pdf.setFontSize(16);const brandLines=pdf.splitTextToSize(company.legalName||company.name,width-logoWidth) as string[];pdf.text(brandLines,left+logoWidth,y+6);y+=Math.max(25,brandLines.length*7+5);
 paragraph([company.address,company.phone,company.email,company.website].filter(Boolean).join(' | '),8,85);if(company.taxOffice||company.taxNumber)paragraph('Vergi dairesi / no: '+company.taxOffice+' / '+company.taxNumber,8,85);
 pdf.setDrawColor(22,77,70);pdf.line(left,y,right,y);y+=10;paragraph(record.title,19);paragraph(record.number,12);paragraph('İşlem tarihi: '+new Intl.DateTimeFormat('tr-TR',{dateStyle:'medium',timeStyle:'short',timeZone:'Europe/Istanbul'}).format(new Date(record.at))+' | İşlemi yapan: '+record.actorName,9);
 if(record.orderNumber&&record.number!==record.orderNumber)paragraph('Sipariş: '+record.orderNumber,10);if(record.relatedNumber&&record.relatedNumber!==record.number)paragraph('İlgili belge: '+record.relatedNumber,10);if(record.customer)paragraph(record.customer,10);if(record.legacy)paragraph('Eski kayıt aktarımı: içerik aktarım anındaki durumu gösterir.',9);if(record.detail)paragraph(record.detail,9);
 const count=record.columns.length;const widths=count===7?[48,12,25,22,22,14,35]:count===4?[82,32,32,32]:count===3?[32,116,30]:Array(count).fill(width/count);let x=left;
 const header=()=>{ensure(14);pdf.setFillColor(22,77,70);pdf.rect(left,y,width,11,'F');pdf.setFontSize(8);pdf.setTextColor(255);x=left;record.columns.forEach((c,n)=>{pdf.text(pdf.splitTextToSize(clean(c),widths[n]-4),x+2,y+4);x+=widths[n];});y+=11;};
 header();for(const row of record.rows){pdf.setFontSize(8);const cells=row.map((v,n)=>pdf.splitTextToSize(clean(v),widths[n]-4) as string[]);let offset=0;const lineCount=Math.max(1,...cells.map(c=>c.length));while(offset<lineCount){let fits=Math.floor((bottom-y-5)/4);if(fits<1){newPage();header();fits=Math.floor((bottom-y-5)/4);}const take=Math.min(lineCount-offset,fits),height=take*4+5;pdf.setFillColor(245,248,247);pdf.rect(left,y,width,height,'F');x=left;pdf.setTextColor(35);cells.forEach((c,n)=>{pdf.text(c.slice(offset,offset+take),x+2,y+5);x+=widths[n];});pdf.setDrawColor(217,227,221);pdf.line(left,y+height,right,y+height);y+=height;offset+=take;}}
 y+=8;ensure(Math.min(100,record.summary.length*9+16));for(const line of record.summary)paragraph(line,10);y+=5;paragraph('İşlem belgesi - belge numarası uygulama kaydıyla aynıdır.',8,100);
 const pages=pdf.getNumberOfPages();for(let n=1;n<=pages;n++){pdf.setPage(n);pdf.setFontSize(8);pdf.setTextColor(100);pdf.text(record.number,left,288);pdf.text(n+' / '+pages,right,288,{align:'right'});}return pdf.output('blob');
}
